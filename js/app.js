(function () {
  'use strict';

  /* ── State ── */
  const state = {
    ulams: [],
    isSpinning: false,
    currentUlam: null,
    previousUlam: null,
    history: [],
    confettiPieces: [],
    confettiAnimId: null,
  };

  /* ── DOM Refs ── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const splashScreen = $('#splashScreen');
  const mainScreen = $('#mainScreen');
  const splashBtn = $('#splashBtn');
  const skipIntro = $('#skipIntro');
  const spinBtn = $('#spinBtn');
  const displayImage = $('#displayImage');
  const placeholderIcon = $('#placeholderIcon');
  const rouletteContainer = $('#rouletteContainer');
  const rouletteTrack = $('#rouletteTrack');
  const resultOverlay = $('#resultOverlay');
  const resultName = $('#resultName');
  const resultLabel = $('#resultLabel');
  const resultIcon = $('#resultIcon');
  const statusMsg = $('#statusMsg');
  const historyList = $('#historyList');
  const confettiCanvas = $('#confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');

  /* ── Messages ── */
  const loadingMessages = [
    'Nag-iisip...',
    'Naghahanap ng masarap...',
    'Ito na yata...',
    'Sandali lang...',
    'Chef is deciding...',
    'Konting hintay...',
    'Pumipili...',
    'Almost done...',
    'Ina-assess ang options...',
    'Pipili ng swerte...',
  ];

  /* ── SVG Icons ── */
  const ICONS = {
    dice: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    refresh: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10"/><path d="M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><path d="M2 13h20"/><path d="M6 13a6 6 0 0112 0"/></svg>',
  };

  /* ── Splash Transitions ── */
  function goToMain() {
    splashScreen.classList.remove('active');
    mainScreen.classList.add('active');
    document.body.style.overflow = 'auto';
  }

  splashBtn.addEventListener('click', goToMain);
  skipIntro.addEventListener('click', goToMain);

  /* ── Load Data ── */
  async function loadUlams() {
    try {
      const res = await fetch('data/ulams.json');
      if (!res.ok) throw new Error('Failed to load ulams data');
      state.ulams = await res.json();
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Error loading data. Please refresh.';
    }
  }

  /* ── Floating Background Shapes ── */
  function createFloatingShapes() {
    const container = document.querySelector('.floating-shapes');
    if (!container) return;
    const hues = [12, 42, 160, 350, 30];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('span');
      el.className = 'floating-shape';
      el.style.left = Math.random() * 90 + '%';
      el.style.top = Math.random() * 90 + '%';
      el.style.animationDelay = Math.random() * 5 + 's';
      el.style.animationDuration = (5 + Math.random() * 4) + 's';
      const size = (1.5 + Math.random() * 2) + 'rem';
      el.style.width = size;
      el.style.height = size;
      el.style.background = 'hsla(' + (hues[i % hues.length]) + ', 80%, 70%, 0.15)';
      container.appendChild(el);
    }
  }

  /* ── Roulette Animation ── */
  function startSpin() {
    if (state.isSpinning || state.ulams.length === 0) return;
    state.isSpinning = true;

    spinBtn.disabled = true;
    spinBtn.innerHTML = ICONS.dice + ' Spinning...';
    spinBtn.classList.remove('pick-again');
    resultOverlay.classList.remove('active');
    displayImage.style.opacity = '0';
    placeholderIcon.style.opacity = '0';

    const selected = pickRandomUlam();
    state.previousUlam = state.currentUlam;
    state.currentUlam = selected;

    displayImage.src = encodeURI(selected.image);
    displayImage.alt = selected.name;

    rouletteContainer.classList.add('active');
    buildRouletteTrack(selected);
    animateRoulette(selected);
    startLoadingMessages();
  }

  function pickRandomUlam() {
    let idx;
    const prevName = state.previousUlam ? state.previousUlam.name : null;
    const available = state.ulams.filter(u => u.name !== prevName);
    const pool = available.length > 0 ? available : state.ulams;
    idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  function buildRouletteTrack(selected) {
    rouletteTrack.innerHTML = '';

    const repeats = Math.max(8, Math.floor(30 / state.ulams.length) + 2);
    const items = [];

    for (let r = 0; r < repeats; r++) {
      const shuffled = [...state.ulams].sort(() => Math.random() - 0.5);
      shuffled.forEach(u => items.push(u.name));
    }

    items.push(selected.name);

    const frag = document.createDocumentFragment();
    items.forEach((name, i) => {
      const div = document.createElement('div');
      div.className = 'roulette-item';
      div.textContent = name;
      if (i === items.length - 1) div.classList.add('selected');
      frag.appendChild(div);
    });
    rouletteTrack.appendChild(frag);

    rouletteTrack._totalItems = items.length;
  }

  function animateRoulette(selected) {
    const itemHeight = rouletteTrack.querySelector('.roulette-item').offsetHeight;
    const totalItems = rouletteTrack._totalItems;
    const visibleWindow = 1;
    const maxY = -(totalItems - visibleWindow) * itemHeight;

    const duration = 3500 + Math.random() * 1000;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 4);
      const y = maxY * eased;

      rouletteTrack.style.transform = 'translateY(' + y + 'px)';

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        endSpin(selected);
      }
    }

    requestAnimationFrame(step);
  }

  /* ── Loading Messages ── */
  let msgInterval = null;

  function startLoadingMessages() {
    let idx = 0;
    statusMsg.textContent = loadingMessages[0];
    statusMsg.className = 'status-message';
    let prevIdx = -1;
    msgInterval = setInterval(() => {
      do {
        idx = Math.floor(Math.random() * loadingMessages.length);
      } while (idx === prevIdx && loadingMessages.length > 1);
      prevIdx = idx;
      statusMsg.textContent = loadingMessages[idx];
    }, 600);
  }

  function stopLoadingMessages() {
    if (msgInterval) {
      clearInterval(msgInterval);
      msgInterval = null;
    }
  }

  /* ── End Spin ── */
  function endSpin(selected) {
    state.isSpinning = false;
    stopLoadingMessages();

    rouletteContainer.classList.remove('active');
    displayImage.style.opacity = '1';

    showResult(selected);
    addHistory(selected);
    launchConfetti();
  }

  function showResult(selected) {
    resultIcon.innerHTML = ICONS.star;
    resultLabel.textContent = 'TODAY\'S ULAM';
    resultName.textContent = selected.name;
    resultOverlay.classList.add('active');

    statusMsg.textContent = selected.name + ' na! Kain na QPaL';
    statusMsg.className = 'status-message celebrating';

    spinBtn.innerHTML = ICONS.refresh + ' Pick Again';
    spinBtn.classList.add('pick-again');
    spinBtn.disabled = false;
  }

  /* ── History ── */
  function addHistory(ulam) {
    state.history.unshift(ulam);
    if (state.history.length > 10) state.history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    state.history.forEach(u => {
      const chip = document.createElement('span');
      chip.className = 'history-chip';
      chip.textContent = u.name;
      historyList.appendChild(chip);
    });
  }

  /* ── Confetti ── */
  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);

  function launchConfetti() {
    if (state.confettiAnimId) {
      cancelAnimationFrame(state.confettiAnimId);
      state.confettiAnimId = null;
    }

    resizeCanvas();
    state.confettiPieces = [];

    const colors = ['#FF6B35', '#FFD166', '#06D6A0', '#EF476F', '#118AB2', '#FFD93D', '#FF8A5C', '#6BCB77'];
    for (let i = 0; i < 120; i++) {
      state.confettiPieces.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        w: 6 + Math.random() * 8,
        h: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
      });
    }

    let startTime = null;
    const confettiDuration = 3000;

    function draw(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      let alive = false;
      for (const p of state.confettiPieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;

        if (elapsed > confettiDuration * 0.6) {
          p.opacity = Math.max(0, 1 - (elapsed - confettiDuration * 0.6) / (confettiDuration * 0.4));
        }

        if (p.y < confettiCanvas.height + 20 && p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (elapsed < confettiDuration && alive) {
        state.confettiAnimId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        state.confettiAnimId = null;
      }
    }

    state.confettiAnimId = requestAnimationFrame(draw);
  }

  /* ── Image Error Fallback ── */
  displayImage.addEventListener('error', function () {
    this.style.display = 'none';
    placeholderIcon.style.opacity = '0.5';
    placeholderIcon.innerHTML = ICONS.bowl;
    console.warn('Failed to load image:', this.src);
  });
  displayImage.addEventListener('load', function () {
    this.style.display = 'block';
    placeholderIcon.style.opacity = '0';
  });

  /* ── Keyboard / Spin Handler ── */
  spinBtn.addEventListener('click', function () {
    if (state.isSpinning) return;
    startSpin();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (splashScreen.classList.contains('active')) {
        goToMain();
        e.preventDefault();
      } else if (!state.isSpinning) {
        startSpin();
        e.preventDefault();
      }
    }
  });

  /* ── Init ── */
  async function init() {
    createFloatingShapes();
    await loadUlams();
  }

  init();

})();
