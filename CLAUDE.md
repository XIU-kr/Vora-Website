# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Marketing/landing site for the Vora desktop app (github.com/XIU-kr/Vora), served at `vora.xiu.kr`. The Vora app itself lives in a separate repo — this directory only contains the website that introduces it.

## Stack (deliberately minimal)

Pure static HTML/CSS/JS — **no build step, no package manager, no framework**. Files are served directly by nginx. Edit a file and the change is live on next request; there is nothing to compile.

- No `npm`, `node_modules`, `package.json`
- No React/Vite/Next/Tailwind
- Only external runtime dep: Pretendard font via jsDelivr CDN
- JS is vanilla, no modules — single IIFE in `public/assets/app.js`

If someone asks to "add a component" or "install a library," default to doing it in plain HTML/CSS/JS. Don't introduce a toolchain without explicit confirmation.

## Layout

```
public/                 ← nginx document root
  index.html            ← single landing page (all sections inline)
  privacy/index.html    ← privacy policy (served at /privacy/)
  assets/
    style.css           ← all styles, CSS-variable token system
    app.js              ← i18n toggle, reveal, GitHub release fetch, nav
    logo.png            ← 128×128 app icon, sourced from Vora repo
    og.png              ← OG image (copy of docs/preview.png)
  robots.txt
  sitemap.xml
```

No subpages other than `/privacy/`. Any new page should live at `public/<slug>/index.html` so URLs stay trailing-slash.

## Deployment

nginx config lives at `/etc/nginx/conf.d/vora.xiu.kr.conf` (outside this repo, system-owned). After config changes:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

The nginx config defines three external redirects used across the page — do not replace them with absolute GitHub URLs in HTML:

- `/download` → `https://github.com/XIU-kr/Vora/releases/latest`
- `/github`   → `https://github.com/XIU-kr/Vora`
- `/issues`   → `https://github.com/XIU-kr/Vora/issues`

Static assets matching `\.(png|jpg|jpeg|gif|ico|svg|webp|woff2|woff|ttf|css|js)$` get `expires 30d; Cache-Control: public, immutable` — so CSS/JS edits require a cache-busting rename or hard reload to be seen by returning visitors. There is no automatic versioning.

## Architecture patterns to preserve

### i18n (KO/EN, KO default)

Text lives in the DOM **twice** — as attributes on the same element:

```html
<span data-ko="다운로드" data-en="Download">다운로드</span>
```

`app.js` swaps `textContent` based on `<html data-lang>`. Persistence is `localStorage.voraLang`; `?lang=en` query param and `navigator.language` are fallbacks. Meta tags use the parallel `data-ko-content` / `data-en-content` pair which writes to the `content` attribute. `<title>` uses `data-ko` / `data-en` and is updated via `document.title`.

**When adding user-facing text, always add both `data-ko` and `data-en`.** Omitting one leaves the hard-coded fallback visible in the other language.

The privacy page uses a different variant: full KO and EN blocks (`[data-ko-block]` / `[data-en-block]`) toggled via `hidden`, with a small inline script instead of the shared `app.js`.

### Download button (hero + Download section)

`app.js` fetches `https://api.github.com/repos/XIU-kr/Vora/releases/latest` on load, matches assets by extension (`.dmg` → macOS, `-setup.exe` / `.exe` / `.msi` → Windows, `.deb`, `.rpm`), and rewrites the `href` of every `a[data-os="..."]` to the real asset URL. The four hero dropdown items and the four OS cards in the Download section all share this mechanism via their `data-os` attribute.

If the API call fails or no asset matches, `href` falls back to the `/download` redirect defined in nginx. UA sniffing picks the default OS shown on the hero button.

### Reveal animations

Sections have `data-reveal`; an `IntersectionObserver` adds `.is-visible` once. Respects `prefers-reduced-motion`. Don't pull in Framer Motion or similar — the observer is ~15 lines and the codebase has no animation framework.

### Theming

Colors and sizes are CSS variables in `:root` at the top of `style.css`. Accent gradient is `--grad` (cyan → indigo → purple). Keep new styles on these tokens rather than introducing fresh hex values.

## Analytics & privacy

Google Analytics 4 (`G-8QDZQ70QN6`) is inlined in both `index.html` and `privacy/index.html` with `anonymize_ip: true`, `allow_google_signals: false`, `allow_ad_personalization_signals: false`. If GA config changes, update both files. Any new page that collects data requires a privacy-policy update — the `/privacy/` page is the source of truth.

## Source-of-truth for product copy

Feature lists, shortcuts, format support, version numbers, and download filename patterns are mirrored from the Vora repo's `README.md`. When Vora's README changes, re-fetch it (`gh api repos/XIU-kr/Vora/contents/README.md --jq .content | base64 -d`) rather than editing from memory — the site drifts out of sync otherwise. Hero preview image is `https://raw.githubusercontent.com/XIU-kr/Vora/main/docs/preview.png`.

## HTTPS status

Currently HTTP-only on port 80 per deliberate choice. Adding TLS is out-of-scope unless requested — the nginx config and `server_name vora.xiu.kr` are already set up for a later `certbot --nginx -d vora.xiu.kr` if needed.
