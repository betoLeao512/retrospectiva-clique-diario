/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — galer-ia-poemas.js
   Escrita de poemas gerados na Galer.iA (Firestore) e controle do
   limite de 2 poemas por dia/dispositivo (localStorage).
   ============================================================ */

import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Salva um poema gerado. Nomes de campo seguem o schema já documentado
// em docs/firestore-schema.md (photoId, poemaTexto, timestamp) — não usar
// nomes alternativos aqui, o Mural (mural.html) já assume esses nomes.
export async function salvarPoema(photoId, emocaoSelecionada, textoLivre, poemaTexto, deviceId, audioUrl = null) {
  await addDoc(collection(db, 'poemas'), {
    photoId,
    emocaoSelecionada: emocaoSelecionada || null,
    textoLivre: textoLivre || null,
    poemaTexto,
    audioUrl, // null até a geração de áudio (ElevenLabs) ser implementada
    timestamp: serverTimestamp(),
    deviceId
  });
}

// Limite de 2 poemas por dia por dispositivo, via localStorage (persiste
// mesmo fechando a aba). Não é validado pelo Firestore Rules — é só
// controle de UX no cliente.
export function podeGerarPoema() {
  const hoje = new Date().toISOString().split('T')[0];
  const dados = JSON.parse(localStorage.getItem('galeriaIaData') || '{}');
  if (dados.data !== hoje) {
    localStorage.setItem('galeriaIaData', JSON.stringify({ data: hoje, poemasHoje: 0 }));
    return true;
  }
  return dados.poemasHoje < 2;
}

// Registra que um poema foi gerado hoje (incrementa o contador local).
// Chamar depois de salvarPoema() ter sucesso.
export function registrarPoemaGerado() {
  const hoje = new Date().toISOString().split('T')[0];
  const dados = JSON.parse(localStorage.getItem('galeriaIaData') || '{}');
  const poemasHoje = dados.data === hoje ? dados.poemasHoje + 1 : 1;
  localStorage.setItem('galeriaIaData', JSON.stringify({ data: hoje, poemasHoje }));
}
