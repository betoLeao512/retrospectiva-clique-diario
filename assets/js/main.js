/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — main.js
   Navbar scroll · Lightbox com foto + áudio + Ken Burns sincronizado
   ============================================================ */

// --- NAVBAR --------------------------------------------------
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(17,17,16,0.98)';
      navbar.style.backdropFilter = 'blur(8px)';
    } else {
      navbar.style.background = '#111110';
      navbar.style.backdropFilter = 'none';
    }
  });
}

// --- LIGHTBOX ------------------------------------------------
const lightbox      = document.getElementById('lightbox');
const lightboxFoto  = document.getElementById('lightbox-foto');
const lightboxAudio = document.getElementById('lightbox-audio');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxTitleBanner = document.getElementById('lightbox-title-banner');
const galleryItems  = document.querySelectorAll('.gallery-item');

// Duração do "hold" do banner (visível em opacity total) antes do fade-out
const BANNER_HOLD_MS = 3800;

// O áudio começa a tocar um pouco antes do fim do hold, pra já estar
// rodando quando o banner iniciar o fade-out (não depois dele).
const AUDIO_LEAD_MS = 300;

// Timers da sequência banner → áudio (canceláveis ao fechar/reabrir)
let bannerTimer = null;
let audioStartTimer = null;

// Abre o lightbox para um .gallery-item. Áudio é opcional: se
// data-audio não estiver presente (foto ainda sem áudio do Alfa),
// só a foto é exibida, sem tentar tocar nada.
//
// Sequência quando há banner de título: fade-in → hold → (300ms antes
// do fim do hold) áudio começa a tocar → fim do hold → banner inicia
// o fade-out (já com o áudio rodando). Sem banner (elemento ausente ou
// foto sem título), o áudio começa imediatamente, como antes.
function abrirLightbox(item) {
  const audioSrc = item.dataset.audio;
  const fotoSrc  = item.dataset.foto;
  const fotoPos  = item.dataset.position || 'center center';
  if (!fotoSrc) return;

  // Cancela qualquer sequência pendente de uma abertura anterior
  clearTimeout(bannerTimer);
  clearTimeout(audioStartTimer);

  // Garante estado limpo
  lightbox.classList.remove('fadeout');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Carrega foto com enquadramento específico
  lightboxFoto.src = fotoSrc;
  lightboxFoto.style.objectPosition = fotoPos;

  // Remove Ken Burns — será reaplicado quando o áudio efetivamente começar
  lightboxFoto.classList.remove('ken-burns');
  lightboxFoto.style.animationDuration = '';

  // Garante que nada de uma abertura anterior continue tocando
  lightboxAudio.pause();
  lightboxAudio.removeAttribute('src');

  if (lightboxTitleBanner) {
    const titulo = item.dataset.title || '';
    lightboxTitleBanner.textContent = titulo;

    // Reseta sem transição para não herdar o fade de uma abertura anterior
    lightboxTitleBanner.style.transition = 'none';
    lightboxTitleBanner.style.opacity = '0';
    void lightboxTitleBanner.offsetWidth; // força reflow
    lightboxTitleBanner.style.transition = '';

    if (titulo) {
      requestAnimationFrame(() => {
        lightboxTitleBanner.style.opacity = '1';
      });

      if (audioSrc) {
        audioStartTimer = setTimeout(() => {
          tocarAudio(audioSrc);
        }, Math.max(BANNER_HOLD_MS - AUDIO_LEAD_MS, 0));
      }

      bannerTimer = setTimeout(() => {
        lightboxTitleBanner.style.opacity = '0';
      }, BANNER_HOLD_MS);

      return; // áudio (se houver) e fade-out do banner já foram agendados
    }
  }

  // Sem banner de título nesta abertura: comportamento antigo
  if (audioSrc) tocarAudio(audioSrc);
}

// Carrega e toca o áudio original do Alfa, sincronizando o Ken Burns
// com a duração dele.
function tocarAudio(audioSrc) {
  lightboxAudio.src = audioSrc;
  lightboxAudio.load();
  lightboxAudio.addEventListener('loadedmetadata', aplicarKenBurns, { once: true });
  lightboxAudio.play();
}

// Liga o clique de um .gallery-item ao lightbox. Exposta em window para
// que grids montados dinamicamente (ex: galeria-dinamica.js) possam
// ligar fotos criadas depois do carregamento inicial da página.
function bindGalleryItemClick(item) {
  item.addEventListener('click', () => abrirLightbox(item));
}
window.bindGalleryItemClick = bindGalleryItemClick;

if (lightbox) {
  galleryItems.forEach(bindGalleryItemClick);

  // Fechar com botão ✕
  lightboxClose.addEventListener('click', fecharLightbox);

  // Fechar clicando no fundo escuro
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) fecharLightbox();
  });

  // Fechar com tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharLightbox();
  });

  // Fechar automaticamente com fade out quando áudio termina
  lightboxAudio.addEventListener('ended', () => {
    fecharLightboxComFade();
  });
}

// Aplica Ken Burns com duração igual à do áudio
function aplicarKenBurns() {
  const duracao = lightboxAudio.duration || 12;
  void lightboxFoto.offsetWidth; // força reflow para reiniciar animação
  lightboxFoto.style.animationDuration = duracao + 's';
  lightboxFoto.classList.add('ken-burns');
}

// Fecha imediatamente (botão ✕ ou Escape)
function fecharLightbox() {
  if (!lightbox) return;
  clearTimeout(bannerTimer);
  clearTimeout(audioStartTimer);
  lightboxAudio.pause();
  lightboxAudio.src = '';
  lightboxFoto.src  = '';
  lightboxFoto.classList.remove('ken-burns');
  lightboxFoto.style.animationDuration = '';
  if (lightboxTitleBanner) {
    lightboxTitleBanner.style.transition = 'none';
    lightboxTitleBanner.style.opacity = '0';
  }
  lightbox.classList.remove('active', 'fadeout');
  document.body.style.overflow = '';
}

// Fecha com fade out suave (fim do áudio)
function fecharLightboxComFade() {
  if (!lightbox) return;
  clearTimeout(bannerTimer);
  clearTimeout(audioStartTimer);
  lightboxAudio.pause();
  if (lightboxTitleBanner) {
    lightboxTitleBanner.style.opacity = '0'; // some junto com o fade geral do container
  }
  lightbox.classList.add('fadeout');

  setTimeout(() => {
    lightboxFoto.src = '';
    lightboxFoto.classList.remove('ken-burns');
    lightboxFoto.style.animationDuration = '';
    lightbox.classList.remove('active', 'fadeout');
    lightboxAudio.src = '';
    if (lightboxTitleBanner) lightboxTitleBanner.style.transition = 'none';
    document.body.style.overflow = '';
  }, 1500);
}
