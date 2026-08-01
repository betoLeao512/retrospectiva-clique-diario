/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — seed-fotos.js
   Script TEMPORÁRIO — popula a coleção `fotos` do Firestore a partir
   de galerias.json. Rodar uma única vez (via seed-fotos.html), depois
   pode remover os dois arquivos ou deixá-los comentados no repositório.

   Não roda sozinho: exporta seedFotos(), que precisa ser chamada
   explicitamente (ver seed-fotos.html).
   ============================================================ */

import { db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Lê galerias.json e achata as 4 galerias numa lista de fotos, cada uma
// com o id do documento (nome do arquivo sem extensão) e os campos do
// schema de `fotos` (ver docs/firestore-schema.md).
async function extrairFotosDoJson() {
  const res = await fetch('galerias.json');
  if (!res.ok) throw new Error('Não foi possível carregar galerias.json');
  const data = await res.json();

  const fotos = [];
  for (const galeria of data.galerias || []) {
    for (const foto of galeria.fotos || []) {
      const docId = foto.arquivo.replace(/\.jpe?g$/i, ''); // "foto-13.jpg" -> "foto-13"
      fotos.push({
        docId,
        arquivo: foto.arquivo,
        galeria: galeria.id,
        audioOriginalUrl: foto.audio || null
      });
    }
  }
  return fotos;
}

export async function seedFotos() {
  const fotos = await extrairFotosDoJson();

  for (const foto of fotos) {
    await setDoc(doc(db, 'fotos', foto.docId), {
      arquivo: foto.arquivo,
      galeria: foto.galeria,
      audioOriginalUrl: foto.audioOriginalUrl,
      ativa: true,
      vezesExibida: 0,
      vezesEscolhida: 0
    });
  }

  console.log(`Seed completo: ${fotos.length} fotos criadas na coleção 'fotos'.`);
  return fotos.length;
}
