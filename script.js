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

  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 1000);
  });

  // Fallback
  setTimeout(() => loader.classList.add('hidden'), 2500);
})();


/* ======================== LIVE CLOCK ======================== */
(function initLiveClock() {
  const hourHand    = document.getElementById('clockHour');
  const minHand     = document.getElementById('clockMin');
  const secHand     = document.getElementById('clockSec');
  const liveTimeEl  = document.getElementById('liveTime');
  const footerTimeEl = document.getElementById('footerTime');

  function updateClock() {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${h * 30 + m * 0.5}deg)`;
    if (minHand)  minHand.style.transform  = `translateX(-50%) rotate(${m * 6 + s * 0.1}deg)`;
    if (secHand)  secHand.style.transform  = `translateX(-50%) rotate(${s * 6}deg)`;

    const hh = now.getHours().toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');
    const str = `${hh}:${mm}:${ss}`;

    if (liveTimeEl)    liveTimeEl.textContent   = str;
    if (footerTimeEl)  footerTimeEl.textContent  = str;
  }

  updateClock();
  setInterval(updateClock, 1000);
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
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.style.color      = active ? 'rgba(255,255,255,0.95)' : '';
          link.style.background = active ? 'rgba(255,255,255,0.1)'  : '';
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
