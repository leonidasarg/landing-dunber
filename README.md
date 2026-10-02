# Landing Dunber

Landing page de **Dunber**, distribuidora de Coca-Cola en La Rioja (Chamical, Chepes, Villa Unión y Milagro).

Sitio estático (HTML + CSS + JS), sin build. Animaciones con [anime.js v4](https://animejs.com/) (incluido en `assets/js/vendor`).

## Estructura

```
index.html                 Página única (SEO, JSON-LD, secciones)
assets/css/styles.css      Estilos
assets/css/bottle.css      Estilos de la botella fija
assets/js/bottle.js        Botella de vidrio que se vacía con el scroll (módulo autónomo)
assets/js/main.js          Menú, animaciones de entrada y reveal
assets/js/form.js          Formulario -> Supabase (+ enlace a WhatsApp)
assets/js/config.js        URL y anon key de Supabase, número de WhatsApp
assets/img/                Logos optimizados, favicon e imagen para redes
supabase/schema.sql        Tabla `basededatosdunbersa` + RLS (solo INSERT para el público)
supabase/functions/        Edge Function que avisa por WhatsApp
```

## Probar en local

```bash
npx http-server . -p 5173 -c-1
```

## Configurar Supabase (formulario)

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor** ejecutá el contenido de `supabase/schema.sql`.
3. En **Project Settings → API** copiá la *Project URL* y la clave *anon public* y pegalas en `assets/js/config.js`.
   (La anon key es pública; la seguridad la da RLS. **Nunca** uses la `service_role` key en el front.)

Sin configurar Supabase, el formulario igual ofrece enviar la consulta por WhatsApp.

## Aviso automático por WhatsApp (+54 9 351 620-1626)

Un navegador no puede mandar WhatsApp "solo" a un número, así que el aviso se hace desde el servidor:

1. Activá CallMeBot para tu número: agregá el contacto **+34 644 52 74 88** y enviale `I allow callmebot to send me messages`. Te responde con tu `apikey`.
2. Desplegá la función y cargá los secretos:
   ```bash
   supabase functions deploy notify-lead --no-verify-jwt
   supabase secrets set CALLMEBOT_PHONE=5493516201626 CALLMEBOT_APIKEY=<tu_apikey> WEBHOOK_SECRET=<texto_largo_aleatorio>
   ```
3. En Supabase: **Database → Webhooks → Create**: tabla `basededatosdunbersa`, evento `INSERT`, tipo *Supabase Edge Functions* → `notify-lead`, y agregá el header `x-webhook-secret` con el mismo valor de `WEBHOOK_SECRET`.

Alternativa más robusta (WhatsApp Business Cloud API de Meta): reemplazar el `fetch` de la función por la llamada a la API oficial.

## Publicar (GitHub Pages)

En el repo: **Settings → Pages → Deploy from a branch → `main` / root**.
URL resultante: `https://leonidasarg.github.io/landing-dunber/`.

Si más adelante tenés dominio propio, actualizá la URL en `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` y `sitemap.xml`.

## SEO incluido

- `title`/`description` con ciudades y rubro, canonical, Open Graph y Twitter Card.
- JSON-LD: `LocalBusiness` con `areaServed` (las 4 ciudades), `WebSite` y `FAQPage`.
- Jerarquía semántica (un `h1`, `h2` por sección), FAQ visible, texto por ciudad.
- Imágenes WebP con `width`/`height`, `loading="lazy"`, `alt` descriptivo.
- `robots.txt`, `sitemap.xml`, favicon, `theme-color`, respeta `prefers-reduced-motion`.

Después de publicar: dar de alta el sitio en Google Search Console y crear la ficha de **Google Business Profile** (clave para SEO local).
