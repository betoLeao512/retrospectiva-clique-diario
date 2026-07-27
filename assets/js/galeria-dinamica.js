/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — galeria-dinamica.js
   Template dinâmico de galeria.html: lê ?id= e renderiza a partir
   de galerias.json (título, grid de fotos, banner de patrocinador,
   links contextuais de O Artista/Contato).
   ============================================================ */

// Fallback dos patrocinadores confirmados (ver CLAUDE.md), usado
// quando o campo "patrocinador" da galeria ainda está null no JSON.
const PATROCINADORES_FALLBACK = {
  "memorias-de-gigantes": "JBS",
  "guerreiros-do-mar": "Colônia de Pescadores",
  "bico-do-papagaio": "Univali",
  "paisagens-peixeiras": "Secretaria de Urbanismo de Itajaí"
};

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const idGaleria = params.get('id');

  if (!idGaleria) {
    window.location.replace('hall.html');
    return;
  }

  let data;
  try {
    const res = await fetch('galerias.json');
    if (!res.ok) throw new Error('Falha ao carregar galerias.json');
    data = await res.json();
  } catch (e) {
    window.location.replace('hall.html');
    return;
  }

  const galeria = (data.galerias || []).find(g => g.id === idGaleria);
  if (!galeria) {
    window.location.replace('hall.html');
    return;
  }

  // Título da página e do header
  document.title = `${galeria.titulo} — Retrospectiva Clique Diário`;
  const tituloEl = document.getElementById('galeriaTitulo');
  if (tituloEl) tituloEl.textContent = galeria.titulo;

  // Links contextuais de O Artista / Contato com o id da galeria atual
  const navArtista = document.getElementById('navArtista');
  const navContato = document.getElementById('navContato');
  if (navArtista) navArtista.href = `artista.html?voltar=${idGaleria}`;
  if (navContato) navContato.href = `contato.html?voltar=${idGaleria}`;

  // Grid de fotos
  const grid = document.getElementById('galeriaGrid');
  if (grid) {
    (galeria.fotos || []).forEach(foto => {
      const fotoSrc = `assets/images/${foto.arquivo}`;

      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.foto = fotoSrc;
      if (foto.audio) item.dataset.audio = foto.audio;
      item.dataset.title = foto.titulo;
      item.dataset.position = 'center';

      item.innerHTML = `
        <div class="gallery-img-wrap">
          <img src="${fotoSrc}" alt="${foto.titulo}" loading="lazy" style="object-position: center;" />
          <div class="gallery-hover"><p class="gallery-hover-title">${foto.titulo}</p></div>
        </div>
      `;

      grid.appendChild(item);

      if (window.bindGalleryItemClick) window.bindGalleryItemClick(item);
    });
  }

  // Banner de apoio no footer
  const patrocinador = galeria.patrocinador || PATROCINADORES_FALLBACK[idGaleria] || '';
  const banner = document.getElementById('footerSponsorBanner');
  if (banner && patrocinador) banner.textContent = `Apoio: ${patrocinador}`;
});
