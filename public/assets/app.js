(() => {
  'use strict';

  const html = document.documentElement;
  const LS_LANG = 'voraLang';
  const LS_OS = 'voraOS';
  const REPO = 'XIU-kr/Vora';
  const FALLBACK_URL = 'https://github.com/' + REPO + '/releases/latest';

  // ---------- i18n ----------
  const detectLang = () => {
    const saved = localStorage.getItem(LS_LANG);
    if (saved === 'ko' || saved === 'en') return saved;
    const qp = new URL(location.href).searchParams.get('lang');
    if (qp === 'ko' || qp === 'en') return qp;
    return (navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  };

  const applyLang = (lang) => {
    html.setAttribute('lang', lang);
    html.setAttribute('data-lang', lang);
    localStorage.setItem(LS_LANG, lang);

    document.querySelectorAll('[data-ko]').forEach(el => {
      const ko = el.getAttribute('data-ko');
      const en = el.getAttribute('data-en');
      if (ko == null || en == null) return;
      el.textContent = lang === 'ko' ? ko : en;
    });

    document.querySelectorAll('[data-ko-content][data-en-content]').forEach(el => {
      el.setAttribute('content', lang === 'ko' ? el.getAttribute('data-ko-content') : el.getAttribute('data-en-content'));
    });

    const titleEl = document.querySelector('title[data-ko]');
    if (titleEl) document.title = lang === 'ko' ? titleEl.getAttribute('data-ko') : titleEl.getAttribute('data-en');

    document.querySelectorAll('[data-set-lang]').forEach(btn => {
      const active = btn.getAttribute('data-set-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };

  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.getAttribute('data-set-lang')));
  });
  applyLang(detectLang());

  // ---------- downloads ----------
  // Match asset name to OS key.
  const matchOS = (name) => {
    const n = name.toLowerCase();
    if (n.endsWith('.dmg')) return 'macos';
    if (n.endsWith('-setup.exe') || n.endsWith('.msi') || n.endsWith('.exe')) return 'windows';
    if (n.endsWith('.deb')) return 'linux-deb';
    if (n.endsWith('.rpm')) return 'linux-rpm';
    if (n.endsWith('.appimage')) return 'linux-appimage';
    return null;
  };

  const labelFor = (key) => ({
    windows:   'Windows',
    macos:     'macOS',
    'linux-deb': 'Linux (deb)',
    'linux-rpm': 'Linux (rpm)',
    'linux-appimage': 'Linux (AppImage)'
  }[key] || 'Download');

  const detectOS = () => {
    const saved = localStorage.getItem(LS_OS);
    if (saved) return saved;
    const ua = (navigator.userAgent || '').toLowerCase();
    const plat = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase();
    if (plat.includes('mac') || ua.includes('mac os')) return 'macos';
    if (plat.includes('win') || ua.includes('windows')) return 'windows';
    if (ua.includes('fedora') || ua.includes('rhel') || ua.includes('red hat') || ua.includes('centos')) return 'linux-rpm';
    if (plat.includes('linux') || ua.includes('linux')) return 'linux-deb';
    return 'windows';
  };

  const dlMain = document.getElementById('dl-main');
  const dlName = document.getElementById('dl-os-name');
  const dlToggle = document.getElementById('dl-toggle');
  const dlMenu = document.getElementById('dl-menu');

  // State: os key → asset url (filled from GitHub API, fallback to releases page)
  const osUrls = {
    windows: FALLBACK_URL,
    macos: FALLBACK_URL,
    'linux-deb': FALLBACK_URL,
    'linux-rpm': FALLBACK_URL
  };

  let currentOS = detectOS();

  const renderMenu = () => {
    document.querySelectorAll('a[data-os]').forEach(a => {
      const key = a.getAttribute('data-os');
      a.href = osUrls[key] || FALLBACK_URL;
    });
  };

  const applyOS = (os) => {
    if (!osUrls[os]) return;
    currentOS = os;
    localStorage.setItem(LS_OS, os);
    if (dlName) dlName.textContent = labelFor(os);
    if (dlMain) dlMain.href = osUrls[os] || FALLBACK_URL;
  };

  renderMenu();
  applyOS(currentOS);

  // Fetch actual release assets
  fetch('https://api.github.com/repos/' + REPO + '/releases/latest', {
    headers: { 'Accept': 'application/vnd.github+json' }
  }).then(r => r.ok ? r.json() : null).then(data => {
    if (!data || !Array.isArray(data.assets)) return;
    data.assets.forEach(asset => {
      const key = matchOS(asset.name || '');
      if (key && osUrls[key] !== undefined) {
        osUrls[key] = asset.browser_download_url;
      } else if (key === 'linux-appimage' && osUrls['linux-deb'] === FALLBACK_URL) {
        // fall back deb slot to AppImage if no deb exists
        osUrls['linux-deb'] = asset.browser_download_url;
      }
    });
    renderMenu();
    applyOS(currentOS);
  }).catch(() => { /* keep fallback */ });

  // menu toggle
  if (dlToggle && dlMenu) {
    const closeMenu = () => { dlMenu.hidden = true; dlToggle.setAttribute('aria-expanded', 'false'); };
    const openMenu  = () => { dlMenu.hidden = false; dlToggle.setAttribute('aria-expanded', 'true'); };
    dlToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dlMenu.hidden ? openMenu() : closeMenu();
    });
    document.addEventListener('click', (e) => {
      if (!dlMenu.hidden && !dlMenu.contains(e.target) && e.target !== dlToggle) closeMenu();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    dlMenu.querySelectorAll('a[data-os]').forEach(a => {
      a.addEventListener('click', () => {
        applyOS(a.getAttribute('data-os'));
        closeMenu();
      });
    });
  }

  // ---------- reveal ----------
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  // ---------- nav scroll ----------
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
