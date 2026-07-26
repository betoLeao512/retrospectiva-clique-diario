/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — voltar-contextual.js
   Navegação contextual "← Voltar para [Galeria]" via ?voltar=<id>
   ============================================================ */

const GALERIAS_VOLTAR = {
  "memorias-de-gigantes": "Memórias de Gigantes",
  "guerreiros-do-mar": "Guerreiros do Mar",
  "bico-do-papagaio": "Sentinela de Pedra",
  "paisagens-peixeiras": "Paisagens Peixeiras"
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const idGaleria = params.get('voltar');

  if (!idGaleria || !GALERIAS_VOLTAR[idGaleria]) return;

  const navItem = document.getElementById('voltar-nav-item');
  const link = document.getElementById('voltar-link');
  if (!navItem || !link) return;

  link.textContent = `← Voltar para ${GALERIAS_VOLTAR[idGaleria]}`;
  link.href = `galeria.html?id=${idGaleria}`;
  navItem.style.display = '';
});
