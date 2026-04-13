# Vora Website

Landing page for [Vora](https://github.com/XIU-kr/Vora), served at **[vora.xiu.kr](https://vora.xiu.kr)**.

Pure static HTML / CSS / vanilla JS — no build step, no framework, no package manager. Served directly by nginx.

## Structure

```
public/
  index.html           ← landing page (all sections inline)
  privacy/index.html   ← /privacy/
  assets/
    style.css          ← CSS-variable design tokens, dark theme
    app.js             ← i18n toggle, scroll reveal, GitHub release fetch
    logo.png           ← 128×128 app icon
    og.png             ← social preview
  robots.txt
  sitemap.xml
```

## Features

- **KO / EN toggle** — `data-ko` / `data-en` attributes swapped in place, persisted in `localStorage`
- **Auto-updating downloads** — JS fetches `api.github.com/repos/XIU-kr/Vora/releases/latest` and rewrites hrefs to real `.exe` / `.dmg` / `.deb` / `.rpm` asset URLs; UA sniffing picks the default OS
- **SEO** — JSON-LD for `SoftwareApplication`, `WebSite`, `BreadcrumbList`, and `FAQPage`; `hreflang`, canonical, OG/Twitter cards, sitemap with image entries, AI-crawler-friendly `robots.txt`
- **Analytics** — GA4 with IP anonymization, Google Signals and ad personalization disabled
- **Privacy policy** — `/privacy/` page (bilingual)
- **Accessibility** — `prefers-reduced-motion` respected, skip link, semantic landmarks

## Local preview

```bash
cd public && python3 -m http.server 8000
```

## Deployment

nginx config at `/etc/nginx/conf.d/vora.xiu.kr.conf` with document root `public/`.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Cache busting

CSS/JS are served with `Cache-Control: public, immutable`. When editing `assets/style.css` or `assets/app.js`, bump the `?v=...` query in both `public/index.html` and `public/privacy/index.html`.

## License

MIT
