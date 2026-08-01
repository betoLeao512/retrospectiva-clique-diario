/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — galer-ia-rotacao.js
   Sorteio ponderado de 12 fotos por visita, priorizando as com menor
   vezesExibida (rotação controlada, não puramente aleatória).
   Resultado salvo em sessionStorage — não sorteia de novo na mesma
   visita (ver docs/galer-ia.md).
   ============================================================ */

import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export async function sortearRotacao() {
  const snapshot = await getDocs(query(collection(db, 'fotos'), where('ativa', '==', true)));
  const fotos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const pesos = fotos.map(f => 1 / (f.vezesExibida + 1));

  const sorteadas = [];
  const disponiveis = [...fotos];
  const pesosDisponiveis = [...pesos];

  for (let i = 0; i < 12 && disponiveis.length > 0; i++) {
    const somaAtual = pesosDisponiveis.reduce((a, b) => a + b, 0);
    let r = Math.random() * somaAtual;
    let idx = 0;
    for (; idx < pesosDisponiveis.length; idx++) {
      r -= pesosDisponiveis[idx];
      if (r <= 0) break;
    }
    sorteadas.push(disponiveis[idx]);
    disponiveis.splice(idx, 1);
    pesosDisponiveis.splice(idx, 1);
  }

  sessionStorage.setItem('galeriaIaRotacao', JSON.stringify(sorteadas.map(f => f.id)));
  return sorteadas;
}

// NOTA: vezesExibida deveria incrementar toda vez que uma foto entra na
// rotação, mas a regra do Firestore bloqueia escrita direta em `fotos`
// (de propósito, evita manipulação via DevTools). Esse incremento fica
// pendente até existir uma Cloud Function pra isso (plano Blaze, ver
// docs/galer-ia.md) — a rotação já sorteia corretamente, só não
// realimenta o contador sozinha ainda.
