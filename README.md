# Vora Website

Landing page for [Vora](https://github.com/XIU-kr/Vora), served at **[vora.xiu.kr](https://vora.xiu.kr)**.

Pure static HTML / CSS / vanilla JS — no build step, no framework, no package manager. Served by nginx.

## Structure

```
public/
  index.html          ← landing page
  privacy/index.html  ← /privacy/
  assets/
    style.css         ← CSS-variable design tokens
    app.js            ← i18n toggle, reveal, GitHub release fetch
    logo.png          ← app icon
    og.png            ← social preview
  robots.txt
  sitemap.xml
```

## Development

Edit a file and the change is live — there is nothing to compile. To preview locally:

```bash
cd public && python3 -m http.server 8000
```

## Deployment

nginx config: `/etc/nginx/conf.d/vora.xiu.kr.conf` (document root: `public/`).

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## License

MIT
