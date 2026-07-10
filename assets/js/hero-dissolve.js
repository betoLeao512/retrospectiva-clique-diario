/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — hero-dissolve.js
   Dissolve por luminosidade · Loop contínuo · Ordem aleatória
   Fotografias © Alfa Bile
   ============================================================ */

(function () {

  const FOTO_PATHS = [
    'assets/images/hero/foto1.jpg',
    'assets/images/hero/foto2.jpg',
    'assets/images/hero/foto3.jpg',
    'assets/images/hero/foto4.jpg',
    'assets/images/hero/foto5.jpg',
    'assets/images/hero/foto6.jpg',
  ];

  const FADE_FRAMES = 1000;  // ~120s a 30fps
  const FADE_WIDTH  = 0.14;
  const DISPLAY_MS  = 0;

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let images = [], W, H;
  let order = [], currentIdx = 0;
  let animId = null, phaseTimer = null;
  let modoEscuro = true; // escuros primeiro por padrão

  // --- BOTÕES ----------------------------------------------
  function criarBotoes() {
    const btnRow = document.createElement('div');
    btnRow.id = 'dissolve-mode';
    btnRow.innerHTML = `
      <button id="btnEscuro" class="dissolve-btn active">Escuros primeiro</button>
      <button id="btnClaro" class="dissolve-btn">Claros primeiro</button>
    `;
    // Insere após o botão "Entrar na Exposição" dentro do hero-content
    const hero = document.querySelector('.hero');
    if (hero) hero.appendChild(btnRow);

    document.getElementById('btnEscuro').addEventListener('click', () => {
      modoEscuro = true;
      document.getElementById('btnEscuro').classList.add('active');
      document.getElementById('btnClaro').classList.remove('active');
    });
    document.getElementById('btnClaro').addEventListener('click', () => {
      modoEscuro = false;
      document.getElementById('btnClaro').classList.add('active');
      document.getElementById('btnEscuro').classList.remove('active');
    });
  }

  // --- RESIZE ----------------------------------------------
  function resize() {
    const hero = canvas.closest('.hero') || canvas.parentElement;
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    if (images.length && order.length) drawImage(order[currentIdx]);
  }

  // --- CARREGAMENTO ----------------------------------------
  async function loadImages() {
    const results = [];
    for (const src of FOTO_PATHS) {
      try {
        const img = await new Promise((res, rej) => {
          const im = new Image();
          im.onload  = () => res(im);
          im.onerror = () => rej(new Error('Falha: ' + src));
          im.src = src;
        });
        results.push(img);
      } catch (e) {
        console.warn('Hero dissolve:', e.message);
      }
    }
    return results;
  }

  // --- DESENHO ---------------------------------------------
  function drawImageOnCtx(targetCtx, img, w, h) {
    if (!img || !img.naturalWidth) return;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = img.naturalWidth  * scale;
    const sh = img.naturalHeight * scale;
    targetCtx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
  }

  function drawImage(imgIdx) {
    ctx.clearRect(0, 0, W, H);
    drawImageOnCtx(ctx, images[imgIdx], W, H);
  }

  function makeBuffer(imgIdx) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    drawImageOnCtx(c.getContext('2d'), images[imgIdx], W, H);
    return c;
  }

  // --- UTILITÁRIOS -----------------------------------------
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function luma(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }
  function easeInOut(t)  { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  // --- TRANSIÇÃO -------------------------------------------
  function runTransition(fromIdx, toIdx, onComplete) {
    if (animId) cancelAnimationFrame(animId);

    const dataA = makeBuffer(fromIdx).getContext('2d').getImageData(0, 0, W, H);
    const dataB = makeBuffer(toIdx).getContext('2d').getImageData(0, 0, W, H);
    const total = W * H;

    const threshold = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const p = i * 4;
      const l = luma(dataA.data[p], dataA.data[p+1], dataA.data[p+2]) / 255;
      const noise = (Math.random() - 0.5) * 0.06;
      threshold[i] = modoEscuro
        ? Math.max(0, Math.min(1, (1 - l) + noise))
        : Math.max(0, Math.min(1, l + noise));
    }

    const output = ctx.createImageData(W, H);
    let frame = 0;
    const maxFrames = FADE_FRAMES + Math.ceil(1 / FADE_WIDTH);

    function render() {
      frame++;
      const progress = frame / FADE_FRAMES;
      for (let i = 0; i < total; i++) {
        const p = i * 4;
        let localT = (progress - threshold[i]) / FADE_WIDTH;
        localT = Math.max(0, Math.min(1, localT));
        const t = easeInOut(localT);
        output.data[p]   = dataA.data[p]   + (dataB.data[p]   - dataA.data[p])   * t;
        output.data[p+1] = dataA.data[p+1] + (dataB.data[p+1] - dataA.data[p+1]) * t;
        output.data[p+2] = dataA.data[p+2] + (dataB.data[p+2] - dataA.data[p+2]) * t;
        output.data[p+3] = 255;
      }
      ctx.putImageData(output, 0, 0);
      if (frame < maxFrames) {
        animId = requestAnimationFrame(render);
      } else {
        onComplete();
      }
    }
    animId = requestAnimationFrame(render);
  }

  // --- LOOP ------------------------------------------------
  function nextPhoto() {
    const fromImg = order[currentIdx];
    currentIdx = (currentIdx + 1) % order.length;
    if (currentIdx === 0) {
      let newOrder;
      do {
        newOrder = shuffle([...Array(images.length).keys()]);
      } while (images.length > 1 && newOrder[0] === order[order.length - 1]);
      order = newOrder;
    }
    runTransition(fromImg, order[currentIdx], () => {
      phaseTimer = setTimeout(nextPhoto, DISPLAY_MS);
    });
  }

  function startLoop() {
    order = shuffle([...Array(images.length).keys()]);
    currentIdx = 0;
    drawImage(order[currentIdx]);
    phaseTimer = setTimeout(nextPhoto, DISPLAY_MS);
  }

  // --- INIT ------------------------------------------------
  window.addEventListener('resize', resize);

  window.addEventListener('load', () => {
    criarBotoes();
    loadImages().then(imgs => {
      if (!imgs.length) return;
      images = imgs;
      resize();
      startLoop();
    });
  });

})();
