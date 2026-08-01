/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — galer-ia-grid.js
   Renderiza a grade de 12 fotos da Galer.iA a partir da rotação
   sorteada no Firestore (ver galer-ia-rotacao.js). Sem título nem
   estado ✦ Sentir/✦ Sentida ainda — clique abre o lightbox padrão
   (main.js) como placeholder, até o fluxo de poema existir.
   ============================================================ */

import { sortearRotacao } from './galer-ia-rotacao.js';

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  const cache = sessionStorage.getItem('galeriaIaRotacao');
  const fotos = cache ? JSON.parse(cache) : await sortearRotacao();

  fotos.forEach(foto => {
    const fotoSrc = `assets/images/${foto.arquivo}`;

    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.foto = fotoSrc;
    if (foto.audioOriginalUrl) item.dataset.audio = foto.audioOriginalUrl;

    item.innerHTML = `
      <div class="gallery-img-wrap">
        <img src="${fotoSrc}" alt="" loading="lazy" style="object-position: center;" />
        <div class="gallery-hover"></div>
      </div>
    `;

    grid.appendChild(item);

    if (window.bindGalleryItemClick) window.bindGalleryItemClick(item);
  });
});
