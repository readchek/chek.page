# Website guide

The landing page is a static site at [chek.page](https://chek.page) that
introduces the Chek app on the App Store. See [design](design.md) for the visual
direction.

## Local development

```sh
bun run dev
bun run build
```

The preview runs at [localhost:18357](http://127.0.0.1:18357/). Override with
`PORT`. The static build is written to `dist/`.

## Deployment

After signing in with `cf auth login`:

```sh
bun run deploy
```

The command builds the static site with Bun and publishes it with
`cf deploy --prebuilt`. `cloudflare.config.ts` defines the `chek-website`
hosting resource and `chek.page` custom domain. `scripts/build.ts` prepares
assets-only output in `.cloudflare/output/v0/`. No server code is deployed.
Generated output is ignored by Git.

## Structure

- `src/`: HTML entry, reader interactions, styles, and Bun development server.
- `scripts/`: Bun build and Cloudflare static-output preparation.
- `public/assets/fonts/`: local typefaces and their licenses.
- `public/assets/logos/`: Chek and official provider marks.
- `public/assets/images/`: app screens, covers, comic pages, the app icon and
  the link preview image.
- `public/assets/video/`: the launch film's posters. The film itself is on R2.
- `public/extensions/`: the official extension repository, served at
  `https://chek.page/extensions/index.json`, which Chek servers list by
  default.
- `dist/`: generated static build, ignored by Git.

## Extension repository

The official repository lists no extensions for now: sources live in their
own repositories and are published with `chek ext` from the Chek repository.
Its `index.json` stays so servers that list it by default keep reading a
valid, empty repository.

To publish here again, build with `chek ext build --out "$PWD/public/extensions"`.
It writes one `<source>-<version>.wasm` per source and an `index.json` with
each component's digest. Components are served immutable, since a new version
gets a new name; the index is revalidated, so servers pick up new versions
when they refresh.

`tsconfig.json` enables Bun HTML-import types and browser DOM types. Run
`bun run typecheck`.

## Artwork, fonts, and loading

The app screens are cut from the App Store screenshots (`apple/AppStore` in
readchek/app): the screen inside each device, from its top edge to the bottom of
the slide, 1008 × 2056 for iPhone and 1632 × 1939 for iPad. They stop above the
tab bar, so the page always shows phones rising from a cropped edge and draws
the bezel and Dynamic Island in CSS. Each is a WebP at quality 80, 360px and
720px wide for iPhone and 800px and 1400px for iPad, picked by screen density.
Redo them when the App Store art changes.

Covers come from Standard Ebooks and Project Gutenberg, in the public domain, and
the comic pages from Pepper&Carrot by David Revoy, CC BY 4.0, which the footer
credits. They're the ones the App Store art and the film use.

`og.jpg` is the App Store's universal header art cut to 1200 × 630 for link
previews. It keeps a fixed name so the absolute URL in the page's meta tags
stays valid.

The launch film is served from Cloudflare R2 at
`https://assets.chek.page/chek-promo-16x9.mp4` and `chek-promo-9x16.mp4`, the
latter for phones held upright, rather than from this repository. Replace those
files to change the film, keeping it fast-start (`-movflags +faststart`) so it
streams, and regenerate the posters here. It loads only when
it scrolls into view, then plays muted and loops, unless the visitor prefers
reduced motion or saves data. Its posters are the title frame, 4 seconds in.

Production uses three local WOFF2 fonts, about 73 KB combined, preloaded with
matching anonymous CORS mode. Original TTF files remain as masters; only WOFF2
files are deployed. Fonts stay separate from the stylesheet. The local
development bundler may embed fonts.

Font filenames include the first 12 characters of their SHA-256 content hash. Regenerate their names, CSS references, and preload links together if the font files change. The build generates `_headers` rules with `Cache-Control: public, max-age=31536000, immutable` for versioned fonts, CSS, JavaScript, artwork, provider marks, and favicon assets. HTML, `og.jpg` and the conventional `/favicon.ico` keep Cloudflare's default revalidation policy, so future releases still appear. The upright film's poster, which the script picks, also receives a content-hashed URL during the build.

Sections fade in as they scroll into view only when scripts run and motion is welcome. Pointer hover effects are gated to suitable devices, and links and buttons have 44px hit areas.

## Mark exports and site icons

`public/assets/logos/mark.svg` is the square-cornered master. PNG exports have no baked-in corner radius:

- `mark-180.png`: Apple touch icon, about 1.6 KB.
- `mark-192.png` and `mark-512.png`: smaller general-purpose exports.
- `mark-1024.png`: high-resolution export, about 8 KB.
- `mark-2048.png`: high-resolution export, about 20 KB.

The PNGs are rasterized from the SVG with an optimized 256-color palette. The HTML declares the SVG favicon, a 32px PNG fallback, a multi-size ICO (16/32/48px), and the 180px Apple touch icon. The build also writes `/favicon.ico` for browsers that request that conventional path. Apple applies its own rounded mask.

## Provider logo provenance

The source chips use the existing Chek mark (`public/assets/logos/mark.svg`) and unmodified official provider SVGs. Logos retain their original colors; each sits beside its visible provider name.

- `public/assets/logos/kavita-logo.svg`: [Kareadita/Kavita official app logo](https://github.com/Kareadita/Kavita/blob/f75863cb77c0f6aa26e0794a1848294e63c9d07d/UI/Web/src/assets/images/logo.svg), revision `f75863cb77c0f6aa26e0794a1848294e63c9d07d`. Downloaded from [the revision-pinned raw SVG](https://raw.githubusercontent.com/Kareadita/Kavita/f75863cb77c0f6aa26e0794a1848294e63c9d07d/UI/Web/src/assets/images/logo.svg).
- `public/assets/logos/komga-logo.svg`: [gotson/komga official web UI logo](https://github.com/gotson/komga/blob/519e352aa894b2fdc80660f1dde21b98cf328e3e/komga-webui/src/assets/logo.svg), revision `519e352aa894b2fdc80660f1dde21b98cf328e3e`. Downloaded from [the revision-pinned raw SVG](https://raw.githubusercontent.com/gotson/komga/519e352aa894b2fdc80660f1dde21b98cf328e3e/komga-webui/src/assets/logo.svg).
