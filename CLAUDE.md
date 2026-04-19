# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Marketing/landing site for the Vora desktop app (github.com/XIU-kr/Vora), served at `vora.xiu.kr`. This repo (`github.com/XIU-kr/Vora-Website`, public) contains the website only; the Vora app source lives in a separate public repo.

## Stack (deliberately minimal)

Pure static HTML/CSS/JS — **no build step, no package manager, no framework**. Files are published by GitHub Pages directly from `main`. Edit a file, push, and Pages republishes within seconds; there is nothing to compile.

- No `npm`, `node_modules`, `package.json`
- No React/Vite/Next/Tailwind
- Only external runtime deps: Pretendard font (jsDelivr CDN), Shields.io badge (Download section), GitHub Releases API (runtime fetch)
- JS is vanilla, no modules — single IIFE in `assets/app.js`; privacy page has a smaller inline script

If someone asks to "add a component" or "install a library," default to doing it in plain HTML/CSS/JS. Don't introduce a toolchain without explicit confirmation.

## Layout

```
index.html            ← single landing page (all sections inline)
privacy/index.html    ← privacy policy (served at /privacy/)
assets/
  style.css           ← all styles, CSS-variable token system
  app.js              ← i18n toggle, reveal, GitHub release fetch, nav
  logo.png            ← 128×128 app icon, mirrored from Vora repo
  og.png              ← OG image (copy of docs/preview.png)
robots.txt
sitemap.xml
CNAME                 ← binds custom domain `vora.xiu.kr` on Pages
.nojekyll             ← disables Jekyll processing on Pages
```

New pages go at `<slug>/index.html` (at repo root) so URLs stay trailing-slash.

## Deployment

Hosted on **GitHub Pages** from `main` branch / `/` (root). Pushing to `main` triggers a Pages build automatically; no CI workflow is needed for plain static files. The `CNAME` file binds the custom domain `vora.xiu.kr`.

DNS is a **proxied CNAME** on Cloudflare: `vora` → `xiu-kr.github.io`. Cloudflare SSL mode must be **Full** (not Flexible) to avoid redirect loops with Pages' HTTPS.

The three short paths are handled as **Cloudflare Redirect Rules** (not server-side) — keep using them in HTML rather than hardcoding GitHub URLs where semantically possible:

- `/download` → `https://github.com/XIU-kr/Vora/releases/latest`
- `/github`   → `https://github.com/XIU-kr/Vora`
- `/issues`   → `https://github.com/XIU-kr/Vora/issues`

**No version numbers in HTML.** Initial download hrefs all point to `https://github.com/XIU-kr/Vora/releases/latest` with no `download` attribute — so even before JS runs (or if the GitHub API fetch fails), a click always lands on the current latest release page. `app.js` rewrites the same hrefs to direct asset URLs (`.../releases/download/<latest>/Vora_*.{exe,dmg}`) and adds `download` once the API response returns, turning clicks into one-shot downloads. Never reintroduce a hardcoded version string in `index.html`.

### Cache busting

Pages sets `Cache-Control: max-age=600` on HTML and immutable caches on fingerprinted-looking assets; Cloudflare edge layers an additional cache. CSS/JS edits are invisible to returning visitors without a cache-bust. Pattern: every `<link>` and `<script>` to local `/assets/style.css` or `/assets/app.js` carries a `?v=YYYYMMDD<letter>` query string. When editing those files, bump the query — currently `?v=20260419a`. Update both `index.html` and `privacy/index.html` together.

## Architecture patterns to preserve

### i18n (KO/EN, KO default)

Text lives in the DOM **twice** — as attributes on the same element:

```html
<span data-ko="다운로드" data-en="Download">다운로드</span>
```

`app.js` swaps `textContent` based on `<html data-lang>`. Persistence is `localStorage.voraLang`; `?lang=en` query param and `navigator.language` are fallbacks. Meta tags use the parallel `data-ko-content` / `data-en-content` pair which writes to the `content` attribute. `<title>` uses `data-ko` / `data-en` and is updated via `document.title`.

**When adding user-facing text, always add both `data-ko` and `data-en`.** Omitting one leaves the hard-coded fallback visible in the other language.

The privacy page uses a different variant: full KO and EN blocks (`[data-ko-block]` / `[data-en-block]`) toggled via `hidden`, with a small inline script instead of the shared `app.js`.

The hero `<h1>` splits text into three spans with `<br>` between them. KO and EN don't break at the same word boundaries — each `<span>` carries independent `data-ko` / `data-en` values so the line breaks read naturally in both languages. Don't merge the spans.

### Download button (hero + Download section)

On load `app.js` fetches `https://api.github.com/repos/XIU-kr/Vora/releases/latest` and matches assets by extension (`.dmg` → macOS, `-setup.exe` / `.exe` / `.msi` → Windows). It rewrites the `href` of every `a[data-os="..."]` to the real asset URL and toggles the `download` attribute. Any new OS variant added to the UI needs a matching entry in `osUrls`, `labelFor`, and the `matchOS` ext map. Linux is not currently a supported target — the Vora app ships only Windows and macOS installers.

Initial HTML hrefs are all `https://github.com/XIU-kr/Vora/releases/latest` so the first paint always resolves to the current release even before JS runs. JS then upgrades them to direct asset URLs for one-click downloads.

### Reveal animations

Sections have `data-reveal`; an `IntersectionObserver` adds `.is-visible` once. Respects `prefers-reduced-motion`. Don't pull in Framer Motion or similar — the observer is ~15 lines and the codebase has no animation framework.

### Theming

Colors and sizes are CSS variables in `:root` at the top of `style.css`. Accent gradient is `--grad` (cyan → indigo → purple). Keep new styles on these tokens rather than introducing fresh hex values.

## Analytics & privacy

Google Analytics 4 (`G-8QDZQ70QN6`) is inlined in both `index.html` and `privacy/index.html` with `anonymize_ip: true`, `allow_google_signals: false`, `allow_ad_personalization_signals: false`. If GA config changes, update both files. Any new page that collects data requires a privacy-policy update — the `/privacy/` page is the source of truth.

Naver Search Advisor ownership is verified via `<meta name="naver-site-verification">` in `index.html`; Google and Bing meta tags are present as commented-out placeholders.

## SEO

Rich structured data is inlined in `index.html` as four JSON-LD blocks: `SoftwareApplication`, `WebSite`, `BreadcrumbList`, and `FAQPage`. When product features change, update `SoftwareApplication.featureList` and the `FAQPage` answers together — they're what shows up in Google rich results. `sitemap.xml` uses the `image:image` namespace to register `og.png` and `logo.png`. `robots.txt` explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot) and Korean search bots (Yeti, Daum) in addition to generic `User-agent: *`.

## Source-of-truth for product copy

Feature lists, shortcuts, format support, version numbers, and download filename patterns mirror the Vora repo's `README.md`. When Vora's README changes, re-fetch it (`gh api repos/XIU-kr/Vora/contents/README.md --jq .content | base64 -d`) rather than editing from memory — the site drifts out of sync otherwise. Hero preview image is `https://raw.githubusercontent.com/XIU-kr/Vora/main/docs/preview.png`; the local `og.png` is a copy for the OG card.

## HTTPS

Handled automatically — GitHub Pages issues the origin certificate for `vora.xiu.kr`, and Cloudflare terminates TLS at the edge (SSL mode: **Full**). "Enforce HTTPS" should be enabled on the Pages settings so HTTP hits 301 to HTTPS. Nothing to manage on a server.
