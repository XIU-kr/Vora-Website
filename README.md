# Vora Website

Landing page for [Vora](https://github.com/XIU-kr/Vora), served at **[vora.xiu.kr](https://vora.xiu.kr)**.

Pure static HTML / CSS / vanilla JS — no build step, no framework, no package manager. Hosted on GitHub Pages behind Cloudflare.

## Structure

```
index.html            ← landing page (all sections inline)
privacy/index.html    ← /privacy/
assets/
  style.css           ← CSS-variable design tokens, dark theme
  app.js              ← i18n toggle, scroll reveal, GitHub release fetch
  logo.png            ← 128×128 app icon
  og.png              ← social preview
robots.txt
sitemap.xml
CNAME                 ← vora.xiu.kr
.nojekyll             ← disable Jekyll on Pages
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
python3 -m http.server 8000
```

## Deployment

Push to `main` — GitHub Pages publishes the repo root. `CNAME` binds the custom domain `vora.xiu.kr`; DNS is a proxied CNAME to `xiu-kr.github.io` on Cloudflare. The three short paths `/download`, `/github`, `/issues` are 301s handled by Cloudflare Redirect Rules (no server-side config).

### Cache busting

CSS/JS edits are invisible to returning visitors due to Cloudflare edge caching. Bump the `?v=...` query on every `<link>`/`<script>` to `assets/style.css` or `assets/app.js` in both `index.html` and `privacy/index.html` together.

## License

MIT
