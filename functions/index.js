/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — functions/index.js
   Cloud Functions da Galer.iA: incrementarExibicoes (rotação de
   fotos) e sentirFoto (poema via Claude + narração via ElevenLabs).
   ============================================================ */

// Importa só firebase-functions/v2/https (não o barrel firebase-functions/v2)
// — o barrel carrega todos os providers v2, incluindo o de Realtime Database,
// que depende de @firebase/app como peer dependency e quebra o require aqui
// (não usamos RTDB neste projeto, só Firestore/Storage). Por isso a região
// vai em REGION, passada nas opções de cada onCall, não em setGlobalOptions.
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const Anthropic = require('@anthropic-ai/sdk');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

admin.initializeApp();

const REGION = 'southamerica-east1';

const CLAUDE_API_KEY = defineSecret('CLAUDE_API_KEY');
const ELEVENLABS_API_KEY = defineSecret('ELEVENLABS_API_KEY');
const ELEVENLABS_VOICE_ID = defineSecret('ELEVENLABS_VOICE_ID');

// Registrado no i.Alfa: título + 3–6 frases líricas/contemplativas,
// imagens sensoriais, metáfora, forte senso de lugar, fechamento
// emocionalmente ressonante. Referência de registro (Clique Diário):
// "O céu em chamas abraça o mar, enquanto a estrada conduz ao
// infinito. Entre verde, rosa e sal, existe um lugar que ensina o
// coração a desacelerar."
const SYSTEM_PROMPT = `Você é o i.Alfa, a voz poética do fotógrafo Alfa Bile na exposição "Retrospectiva Clique Diário", em Itajaí, Santa Catarina.

Um visitante da Galer.iA olhou para uma fotografia do Alfa e descreveu a impressão que ela causou nele. Sua tarefa é transformar essa impressão em um poema curto, no estilo autoral do "Clique Diário": lírico e contemplativo, com imagens sensoriais, metáfora e forte senso de lugar, terminando num fechamento emocionalmente ressonante.

Referência de registro (não copie, apenas o tom): "O céu em chamas abraça o mar, enquanto a estrada conduz ao infinito. Entre verde, rosa e sal, existe um lugar que ensina o coração a desacelerar."

Formato da resposta: um título curto na primeira linha, seguido do corpo do poema em 3 a 6 frases. Sem markdown, sem aspas envolvendo o texto, sem comentários fora do poema — responda só com o título e o poema.`;

/**
 * Callable HTTPS: incrementa vezesExibida das fotos sorteadas na
 * rotação da Galer.iA. Fire-and-forget — não deve travar a grade se
 * algum id não existir mais em `fotos`.
 */
exports.incrementarExibicoes = onCall({ region: REGION }, async (request) => {
  const fotoIds = request.data && request.data.fotoIds;

  if (!Array.isArray(fotoIds) || fotoIds.length === 0) {
    return { ok: true };
  }

  const db = getFirestore();
  const refs = fotoIds.map((id) => db.collection('fotos').doc(id));
  const snaps = await db.getAll(...refs);

  const batch = db.batch();
  let atualizados = 0;
  snaps.forEach((snap) => {
    if (snap.exists) {
      batch.update(snap.ref, { vezesExibida: FieldValue.increment(1) });
      atualizados += 1;
    }
  });

  if (atualizados > 0) {
    await batch.commit();
  }

  return { ok: true };
});

/**
 * Callable HTTPS: fluxo completo do "✦ Sentir" — reserva a cota
 * diária, gera o poema (Claude), narra (ElevenLabs), salva o áudio
 * no Storage e o poema no Firestore.
 */
exports.sentirFoto = onCall(
  { region: REGION, secrets: [CLAUDE_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID] },
  async (request) => {
    const { fotoId, visitanteId, emocaoSelecionada, textoLivre } = request.data || {};

    if (!fotoId || !visitanteId || !emocaoSelecionada) {
      throw new HttpsError(
        'invalid-argument',
        'fotoId, visitanteId e emocaoSelecionada são obrigatórios.'
      );
    }

    const db = getFirestore();
    const hoje = new Date().toISOString().split('T')[0];
    const cotaRef = db.collection('cotasDiarias').doc(`${visitanteId}_${hoje}`);

    // Passo 1 — reserva a cota numa transação curta, antes de qualquer
    // chamada paga. Ler e escrever dentro da mesma transação (sem chamadas
    // de rede externas no meio) evita que duas chamadas simultâneas do
    // mesmo visitanteId passem da checagem juntas.
    await db.runTransaction(async (tx) => {
      const cotaSnap = await tx.get(cotaRef);
      const cotaAtual = cotaSnap.exists ? cotaSnap.data().count || 0 : 0;
      if (cotaAtual >= 2) {
        throw new HttpsError('resource-exhausted', 'Limite de 2 poemas por dia atingido.');
      }
      tx.set(cotaRef, { count: cotaAtual + 1 }, { merge: true });
    });

    // Passo 2 — poema via Claude API.
    const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY.value() });
    const userPrompt = [
      `Impressão declarada pelo visitante: ${emocaoSelecionada}`,
      textoLivre ? `Descrição livre: ${textoLivre}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      output_config: { effort: 'medium' },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const poemaTexto = response.content.find((block) => block.type === 'text')?.text;
    if (!poemaTexto) {
      throw new HttpsError('internal', 'Não foi possível gerar o poema.');
    }

    // Passo 3 — narração via ElevenLabs, na voz do i.Alfa.
    const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY.value() });
    const audioStream = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID.value(), {
      text: poemaTexto,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
    });

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Passo 4 — upload no Storage, leitura pública (decisão confirmada
    // no plano — poemas já são públicos no Mural de qualquer forma).
    const timestamp = Date.now();
    const filePath = `poemas-audio/${fotoId}-${timestamp}.mp3`;
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);
    await file.save(audioBuffer, { contentType: 'audio/mpeg' });
    await file.makePublic();
    const audioUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Passo 5 — salva o poema (alimenta o Mural).
    await db.collection('poemas').add({
      fotoId,
      poemaTexto,
      timestamp: FieldValue.serverTimestamp(),
      emocaoSelecionada,
      textoLivre: textoLivre || null,
      audioUrl,
      visitanteId,
    });

    // Passo 6 — ranking interno de popularidade.
    await db.collection('fotos').doc(fotoId).update({
      vezesEscolhida: FieldValue.increment(1),
    });

    return { audioUrl };
  }
);
