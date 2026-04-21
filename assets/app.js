(() => {
  'use strict';

  const html = document.documentElement;
  const LS_LANG = 'voraLang';
  const REPO = 'XIU-kr/Vora';
  const FALLBACK_URL = 'https://github.com/' + REPO + '/releases/latest';

  // Module-scope: latest tag pulled from the GitHub API. Re-rendered into
  // the hero eyebrow on every applyLang() so the version survives lang toggles.
  let latestTag = '';

  // ---------- i18n ----------
  const detectLang = () => {
    const saved = localStorage.getItem(LS_LANG);
    if (saved === 'ko' || saved === 'en') return saved;
    const qp = new URL(location.href).searchParams.get('lang');
    if (qp === 'ko' || qp === 'en') return qp;
    return (navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  };

  const renderVersionLabel = (lang) => {
    const el = document.getElementById('version-label');
    if (!el) return;
    const suffix = lang === 'ko'
      ? (el.getAttribute('data-ko-suffix') || 'macOS · Windows 지원')
      : (el.getAttribute('data-en-suffix') || 'macOS · Windows');
    el.textContent = latestTag ? `v${latestTag} · ${suffix}` : suffix;
  };

  const applyLang = (lang) => {
    html.setAttribute('lang', lang);
    html.setAttribute('data-lang', lang);
    try { localStorage.setItem(LS_LANG, lang); } catch (_) {}

    document.querySelectorAll('[data-ko]').forEach(el => {
      const ko = el.getAttribute('data-ko');
      const en = el.getAttribute('data-en');
      if (ko == null || en == null) return;
      el.textContent = lang === 'ko' ? ko : en;
    });

    document.querySelectorAll('[data-ko-content][data-en-content]').forEach(el => {
      el.setAttribute('content', lang === 'ko'
        ? el.getAttribute('data-ko-content')
        : el.getAttribute('data-en-content'));
    });

    const titleEl = document.querySelector('title[data-ko]');
    if (titleEl) {
      document.title = lang === 'ko'
        ? titleEl.getAttribute('data-ko')
        : titleEl.getAttribute('data-en');
    }

    document.querySelectorAll('[data-set-lang]').forEach(btn => {
      const active = btn.getAttribute('data-set-lang') === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    renderVersionLabel(lang);
  };

  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.getAttribute('data-set-lang')));
  });
  applyLang(detectLang());

  // ---------- downloads (GitHub API) ----------
  const matchOS = (name) => {
    const n = (name || '').toLowerCase();
    if (n.endsWith('.dmg')) return 'macos';
    if (n.endsWith('-setup.exe') || n.endsWith('.msi') || n.endsWith('.exe')) return 'windows';
    return null;
  };

  const applyAsset = (os, asset) => {
    if (!os || !asset) return;
    document.querySelectorAll(`a[data-os="${os}"]`).forEach(a => {
      a.href = asset.browser_download_url;
      a.setAttribute('download', '');
    });
    document.querySelectorAll(`[data-fname="${os}"]`).forEach(el => {
      el.textContent = asset.name;
    });
  };

  fetch('https://api.github.com/repos/' + REPO + '/releases/latest', {
    headers: { 'Accept': 'application/vnd.github+json' }
  }).then(r => r.ok ? r.json() : null).then(data => {
    if (!data) return;
    if (data.tag_name) {
      latestTag = String(data.tag_name).replace(/^v/, '');
      renderVersionLabel(html.getAttribute('data-lang') || 'ko');
    }
    if (Array.isArray(data.assets)) {
      data.assets.forEach(asset => {
        const os = matchOS(asset.name);
        if (os) applyAsset(os, asset);
      });
    }
  }).catch(() => {});

  // ---------- reveal on scroll ----------
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  // ---------- nav scroll state ----------
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- smooth scroll for in-page anchors ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
