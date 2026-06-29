# apps/landing build scripts

## shadcn-vue registry (`build-registry.ts`)

[`build-registry.ts`](./build-registry.ts) generates a
**shadcn-vue-compatible registry** for the Blocks catalog into
`public/r/` — `registry.json` (the index) plus one `<id>.json` per block. These
are **generated build artifacts derived from the `BLOCKS` array** — never
hand-edited. The shaping lives in
[`src/blocks/registryItem.ts`](../src/blocks/registryItem.ts) (shared with the
`registryItem.spec.ts` Vitest guard); the schema target is the shadcn-vue
registry JSON Schema, pinned via the `$schema` URLs there.

### Regenerate

```bash
# from apps/landing
yarn build:registry
```

`yarn build` runs this first, so `vite build` always copies a fresh `public/r/*`
into `dist/`. Re-run after adding, renaming, or editing a block. The out dir is
wiped and rewritten each run, so a removed block leaves no stale JSON.

### Consume

Each block installs into a downstream project via the shadcn-vue CLI:

```bash
npx shadcn-vue add https://<landing-host>/r/<id>.json
```

(e.g. `…/r/hero-centered.json`). The fetched item inlines the block's SFC as its
single `files[]` entry, lists its `@dzup-ui/core` component names as
`registryDependencies`, and declares `@dzup-ui/core` + `@dzup-ui/tokens` as npm
`dependencies`.

## Animations registry (`build-animations-registry.ts`)

[`build-animations-registry.ts`](./build-animations-registry.ts) is the **registry
groundwork for the `/animations` gallery** (docs/animations.md §3.2, §5; Task N10,
Open Decision D2-3). It projects the `CATALOG` array into the **same shadcn-vue
registry shape** as the Blocks registry above, emitting into `public/r/animations/`
— `registry.json` (the index) plus one `<id>.json` per effect. The shaping lives in
[`src/gallery/registryItem.ts`](../src/gallery/registryItem.ts) (shared with the
`registryItem.spec.ts` Vitest guard, which also pins that every effect `id` is
URL-safe — it seeds both the `#effect-<id>` permalink and the registry item name).

This is **groundwork only**: it emits the data a future copy-paste CLI / MCP server
would serve — **no CLI is wired yet** (D2-3, a follow-up). Each item inlines the
effect's snippet(s) as `files[]` — **one file per variant** where an entry offers a
variant matrix (`sfc`→`.vue`, `composable`→`.ts`, `css`→`.css`), else the single
fallback `code` as `<id>.vue` — lists its `@dzup-ui/core` components as
`registryDependencies`, and declares `@dzup-ui/core` + `@dzup-ui/tokens` as npm
`dependencies`.

### Regenerate

```bash
# from apps/landing
yarn build:animations-registry
```

`yarn build` runs this alongside `build:registry`, so `vite build` always copies a
fresh `public/r/animations/*` into `dist/`. Like the Blocks generator it loads the
catalog via a throwaway **Vite SSR** server (`catalog.ts` imports the `vue` runtime
and `defineAsyncComponent` demo loaders that bare Node can't resolve), wipes the out
dir each run, and **fails loudly and writes nothing** on an empty catalog or load
error.

## AI-readable docs (`llms.txt`)

The **same** `build-registry.ts` run also emits the
[llms.txt](https://llmstxt.org) docs an AI assistant uses to discover and compose
blocks — generated from `BLOCKS`, never hand-edited (shaping in
[`src/blocks/llmsText.ts`](../src/blocks/llmsText.ts), guarded by
`llmsText.spec.ts`):

| File | URL | Contents |
|------|-----|----------|
| `public/llms.txt` | `/llms.txt` | Concise, token-efficient **index** — every block as `- [title](/blocks#id): description — built from <components>`, grouped by category. |
| `public/llms-full.txt` | `/llms-full.txt` | The index **plus every block's full Vue SFC** inline. |
| `public/r/<id>.md` | `/r/<id>.md` | One self-contained markdown page per block (title, description, components, deep link, fenced SFC) — also the "copy as markdown" payload (Task G3). |

`llms.txt` stays an index (no source); the bulk lives in `llms-full.txt` and the
per-block `.md` files, so an assistant loads only what it needs.

### Consume — point an assistant at it

In an editor that supports documentation references (Cursor, Claude), add the
index as a doc source:

```text
@docs https://<landing-host>/llms.txt
```

The assistant reads the index, follows each `/blocks#<id>` deep link to a block's
live preview, fetches a single block's source from `/r/<id>.md` (or the whole
catalog from `/llms-full.txt`), and installs it with the
`npx shadcn-vue add …/r/<id>.json` line above.

## MCP — agent-callable registry (Task G5)

The same generated `registry.json` doubles as an **MCP** endpoint: an MCP-capable
assistant (Claude, Cursor, Windsurf…) can browse and install blocks by natural
language. This needs **no new service** — the shadcn CLI ships a `registry:mcp`
server; you only point it at the registry URL.

Add this to your assistant's MCP config (e.g. `.cursor/mcp.json`, `.mcp.json`, or
`claude_desktop_config.json`), swapping `<landing-host>` for the deployment
origin:

```json
{
  "mcpServers": {
    "dzup-ui": {
      "command": "npx",
      "args": ["shadcn@latest", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "https://<landing-host>/r/registry.json"
      }
    }
  }
}
```

The `/blocks` page surfaces this exact block (with the live origin pre-filled) in
its **"Use with AI"** section, alongside one-click links to `/llms.txt` and
`/r/registry.json` — see `src/components/blocks/BlockAiCallout.vue` (the snippet
is generated by `mcpServerConfig()` in `src/blocks/config.ts`, so the UI, the CLI
docs, and this file can't drift).

### Discover from the CLI

Register the namespace once in your project's `components.json`:

```json
{
  "registries": {
    "@dzup-ui": "https://<landing-host>/r/{name}.json"
  }
}
```

then browse the catalog with the shadcn discovery commands:

```bash
npx shadcn list @dzup-ui                 # enumerate every block
npx shadcn search @dzup-ui pricing       # free-text filter
npx shadcn view @dzup-ui/hero-centered   # print one block's item JSON
```

## Template thumbnail pipeline

The Templates gallery (`/templates`) shows a real **screenshot** per card — a
light/dark pair — instead of a Lucide glyph (docs/templates.md §2 #1, #2, #14).
Those images are **committed build artifacts**, generated by
[`shoot-thumbnails.mts`](./shoot-thumbnails.mts). They are not rendered live:
per-request generation and N live iframes do not scale.

## Regenerate

```bash
# from apps/landing
yarn thumbnails
```

One-time setup on a fresh checkout (downloads the headless browser):

```bash
npx playwright install chromium
```

## When to re-run

Re-run `yarn thumbnails` whenever a screenshot would visibly change:

- you **add a template** to `src/templates/registry.ts`,
- you **change a template's** layout, content or colourway,
- a shared component or token the templates use is restyled.

Then commit the updated `public/templates/thumbnails/*.webp` alongside the code
change. A template with no generated file simply falls back to its registry icon
in the gallery (the `<img onerror>` handler), so a missing thumbnail is a
graceful gap, never a broken card.

## What it does

1. Boots the landing app on an in-process **Vite dev server** (reusing
   `vite.config.ts`, so it screenshots exactly what ships — no dist artifacts).
2. Drives **headless Chromium** (Playwright) to the chromeless route
   `/templates/<slug>/preview?theme=light|dark` for every slug in `TEMPLATES`,
   at a fixed **1200×750 (16:10)** viewport @2× DPR — matching the gallery card's
   reserved aspect-ratio, so the lazy `<img>` paints with **no layout shift**.
3. Re-encodes each capture to optimised **WebP** with `sharp` and writes:

   ```
   public/templates/thumbnails/<slug>.webp        # light
   public/templates/thumbnails/<slug>-dark.webp   # dark
   ```

The path is derived **by slug** in `registry.ts` (`THUMBNAIL_DIR`), so a new
template is wired automatically — you only need to generate its images. Files
live under `public/` so their URLs are stable (no Vite content-hashing), which
is what lets the gallery derive the dark variant by convention
(`<slug>.webp` → `<slug>-dark.webp`) and the detail page reuse the path as its
`og:image`.

## Tooling & weight

- **Playwright** (Chromium) for the headless capture, **sharp** for WebP
  encoding — both `devDependencies`, only needed when regenerating.
- WebP @ quality 80 keeps each image small (typically tens of kB). The gallery
  loads them with `loading="lazy"` + `decoding="async"`.

## Reproducible / idempotent

Same template source → same pixels → same files; re-running overwrites in place.
Contexts run with `reducedMotion: 'reduce'` so entrance animations settle to
their resting state before capture. If Chromium can't launch, the script **fails
loudly and writes nothing** — it never commits blank or partial images.

## Per-block OG (social share) images (`shoot-og.mts`)

Each per-block SEO page (`/blocks/:id`, `BlockDetailPage` — docs/blocks.md §3.5,
Task I4) sets its `og:image` / `twitter:image` to `/og/<id>.png`. Those cards are
**committed build artifacts**, generated by [`shoot-og.mts`](./shoot-og.mts) from
the **same** chrome-free `/blocks/preview/:id` route that backs the iframe and
"open in new tab" — one render source, so the share card never drifts from what
ships (no Satori/HTML-to-image second renderer to maintain).

### Regenerate

```bash
# from apps/landing
yarn og
```

(Same one-time `npx playwright install chromium` setup as the thumbnails above.)

### What it does

1. Loads the block ids from `src/blocks/registry.ts` via a throwaway **Vite SSR**
   server — the registry pairs each block with its `?raw` source through a
   module-level `import.meta.glob`, which only a Vite transform resolves (same
   reason `build-registry.ts` uses `ssrLoadModule`).
2. Boots the landing app's **Vite dev server** and drives **headless Chromium**
   to `/blocks/preview/<id>?theme=light` for every block, at a fixed **1200×630**
   (the canonical 1.91:1 OG ratio) viewport @2× DPR.
3. Down-samples each capture and writes a compact PNG to `public/og/<id>.png`.

### When to re-run

Re-run `yarn og` whenever a block's appearance changes (its SFC, or a shared
component/token it uses), then commit the updated `public/og/*.png`. It is a
**separate, manual step** from `vite build` (Playwright + Chromium are heavy and
optional) — exactly like `yarn thumbnails`. A block with no generated card simply
falls back to the generic site OG image referenced in `index.html`, so a missing
file is a graceful gap, never a broken share preview. The out dir is wiped each
run, so a removed/renamed block leaves no stale card. Same source → same pixels →
same file; if Chromium can't launch, it **fails loudly and writes nothing**.
