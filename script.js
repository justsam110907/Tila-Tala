/* ============================================================
   TILA-TALA MAGAZINE — script.js
   Handles: loader, live clock, nav, scroll reveal,
            night stars, sticky header, scroll-to-top,
            active nav highlighting, hero gradient, parallax
   ============================================================ */

/* ======================== LOADER ======================== */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Animate loader clock hands
  function setLoaderClock() {
    const now  = new Date();
    const h    = now.getHours() % 12;
    const m    = now.getMinutes();
    const s    = now.getSeconds();
    const hourDeg = h * 30 + m * 0.5;
    const minDeg  = m * 6  + s * 0.1;
    const hourHand = document.getElementById('loaderHour');
    const minHand  = document.getElementById('loaderMin');
    if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    if (minHand)  minHand.style.transform  = `translateX(-50%) rotate(${minDeg}deg)`;
  }

  setLoaderClock();
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 1000));
  setTimeout(() => loader.classList.add('hidden'), 2500);
})();


/* ======================== CANVAS CLOCK ======================== */
(function initCanvasClock() {
  const canvas = document.getElementById('clockCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Scale for retina displays
  const DPR = window.devicePixelRatio || 1;
  const SIZE = 260;
  canvas.width  = SIZE * DPR;
  canvas.height = SIZE * DPR;
  canvas.style.width  = SIZE + 'px';
  canvas.style.height = SIZE + 'px';
  ctx.scale(DPR, DPR);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R  = SIZE / 2 - 4; // outer radius

  // Colour palette matching the magazine cover
  const COL = {
    face:       '#0b0f1e',          // deep navy
    faceInner:  '#0e1428',
    rim:        'rgba(201,151,90,0.35)',
    rimGlow:    'rgba(201,151,90,0.08)',
    tickMajor:  'rgba(201,151,90,0.85)',  // gold major ticks
    tickMinor:  'rgba(255,255,255,0.18)',
    handHour:   '#ffffff',
    handMin:    'rgba(255,255,255,0.88)',
    handSec:    '#c9975a',          // gold second hand
    center:     '#c9975a',
    glow:       'rgba(201,151,90,0.5)',
  };

  function drawClock() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // --- Outer glow ring ---
    const glowGrad = ctx.createRadialGradient(cx, cy, R - 10, cx, cy, R + 18);
    glowGrad.addColorStop(0, COL.rimGlow);
    glowGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, R + 18, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // --- Face gradient (deep navy, matches cover) ---
    const faceGrad = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, R);
    faceGrad.addColorStop(0,   '#131b30');
    faceGrad.addColorStop(0.6, '#0c1020');
    faceGrad.addColorStop(1,   '#080c18');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = faceGrad;
    ctx.fill();

    // --- Rim border ---
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = COL.rim;
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- Inner subtle ring ---
    ctx.beginPath();
    ctx.arc(cx, cy, R - 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,151,90,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- Tick marks (perfectly centered using canvas transform) ---
    for (let i = 0; i < 60; i++) {
      const angle  = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const isMaj  = i % 5 === 0;
      const tickLen = isMaj ? 12 : 5;
      const tickW   = isMaj ? 2   : 1;
      const inner   = R - 16 - tickLen;
      const outer   = R - 16;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      ctx.strokeStyle = isMaj ? COL.tickMajor : COL.tickMinor;
      ctx.lineWidth   = tickW;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }

    // --- Get current time ---
    const now  = new Date();
    const secs = now.getSeconds() + now.getMilliseconds() / 1000;
    const mins = now.getMinutes() + secs / 60;
    const hrs  = (now.getHours() % 12) + mins / 60;

    const secAngle  = (secs / 60)  * Math.PI * 2 - Math.PI / 2;
    const minAngle  = (mins / 60)  * Math.PI * 2 - Math.PI / 2;
    const hourAngle = (hrs  / 12)  * Math.PI * 2 - Math.PI / 2;

    // --- Hour hand ---
    drawHand(hourAngle, R * 0.5, 3.5, COL.handHour, true);

    // --- Minute hand ---
    drawHand(minAngle, R * 0.68, 2.5, COL.handMin, true);

    // --- Second hand (gold, with counterweight) ---
    drawSecondHand(secAngle);

    // --- Center dot ---
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = COL.center;
    ctx.fill();

    // --- Center glow ---
    const dotGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
    dotGlow.addColorStop(0, 'rgba(201,151,90,0.4)');
    dotGlow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = dotGlow;
    ctx.fill();

    // --- Update digital time ---
    const liveTimeEl   = document.getElementById('liveTime');
    const footerTimeEl = document.getElementById('footerTime');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const str = `${hh}:${mm}:${ss}`;
    if (liveTimeEl)    liveTimeEl.textContent  = str;
    if (footerTimeEl)  footerTimeEl.textContent = str;
  }

  function drawHand(angle, length, width, color, rounded) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle) * length,
      cy + Math.sin(angle) * length
    );
    ctx.strokeStyle = color;
    ctx.lineWidth   = width;
    ctx.lineCap     = rounded ? 'round' : 'butt';

    // subtle shadow for depth
    ctx.shadowColor  = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur   = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawSecondHand(angle) {
    ctx.save();

    // glow effect
    ctx.shadowColor = COL.glow;
    ctx.shadowBlur  = 8;

    // main second hand
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle) * (R * 0.75),
      cy + Math.sin(angle) * (R * 0.75)
    );
    ctx.strokeStyle = COL.handSec;
    ctx.lineWidth   = 1.5;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // counterweight
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle + Math.PI) * (R * 0.2),
      cy + Math.sin(angle + Math.PI) * (R * 0.2)
    );
    ctx.strokeStyle = COL.handSec;
    ctx.lineWidth   = 3;
    ctx.stroke();

    ctx.restore();
  }

  // Animate at 60fps for smooth second hand
  function tick() {
    drawClock();
    requestAnimationFrame(tick);
  }
  tick();
})();


/* ======================== STICKY HEADER ======================== */
(function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ======================== HAMBURGER MENU ======================== */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
})();


/* ======================== SCROLL REVEAL ======================== */
(function initScrollReveal() {
  // Target: all [data-reveal] + card types
  const selectors = '[data-reveal], .info-card, .media-card';
  const elements  = document.querySelectorAll(selectors);
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ======================== NIGHT STARS ======================== */
(function initNightStars() {
  const container = document.getElementById('nightStars');
  if (!container) return;

  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top  = `${Math.random() * 100}%`;

    const size = Math.random() * 2 + 1;
    star.style.width  = `${size}px`;
    star.style.height = `${size}px`;

    const dur = (Math.random() * 3 + 2).toFixed(2);
    const del = (Math.random() * 5).toFixed(2);
    star.style.setProperty('--dur', `${dur}s`);
    star.style.setProperty('--del', `${del}s`);

    if (Math.random() < 0.08) {
      star.style.width  = '3px';
      star.style.height = '3px';
      star.style.background  = '#a78bfa';
      star.style.boxShadow   = '0 0 6px #a78bfa';
    }

    container.appendChild(star);
  }
})();


/* ======================== SCROLL TO TOP ======================== */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ======================== SMOOTH NAV SCROLL ======================== */
(function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // skip disabled links
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      );
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
})();


/* ======================== ACTIVE NAV HIGHLIGHTING ======================== */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();


/* ======================== HERO GRADIENT (time-aware) ======================== */
(function initHeroGradient() {
  const sky  = document.getElementById('hero-sky');
  if (!sky) return;

  const hour = new Date().getHours();
  let gradient = '';

  if (hour >= 5 && hour < 7) {
    gradient = 'radial-gradient(ellipse at 30% 60%, rgba(232,168,100,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, #1a0a2e 0%, transparent 50%), #050510';
  } else if (hour >= 7 && hour < 12) {
    gradient = 'radial-gradient(ellipse at 50% 30%, rgba(96,165,250,0.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(30,58,95,0.4) 0%, transparent 50%), #050a1a';
  } else if (hour >= 12 && hour < 17) {
    gradient = 'radial-gradient(ellipse at 50% 10%, rgba(59,130,246,0.3) 0%, transparent 70%), radial-gradient(ellipse at 80% 80%, #0d1b2a 0%, transparent 50%), #050a18';
  } else if (hour >= 17 && hour < 20) {
    gradient = 'radial-gradient(ellipse at 60% 50%, rgba(107,63,160,0.35) 0%, transparent 60%), radial-gradient(ellipse at 30% 40%, rgba(200,100,50,0.15) 0%, transparent 50%), #0d0520';
  } else {
    gradient = 'radial-gradient(ellipse at 50% 50%, rgba(50,30,80,0.3) 0%, transparent 60%), #050510';
  }

  sky.style.background = gradient;
})();


/* ======================== PARALLAX (desktop only) ======================== */
(function initParallax() {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  const sky = document.getElementById('hero-sky');
  if (!sky) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      sky.style.transform = `translateY(${window.scrollY * 0.25}px)`;
    }
  }, { passive: true });
})();
