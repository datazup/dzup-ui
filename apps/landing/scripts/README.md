# apps/landing build scripts

## Every script in this directory

Nothing lives here unexplained. Each row is either wired into a `package.json`
script or called by CI; a file that is neither belongs in neither the repo nor this
table (`verify-auth.mts`, a self-labelled "throwaway verification" referenced by
nothing, was deleted for exactly that reason — TASK-FREE3-05).

| Script | Command | Runs in | Output guarded by |
|---|---|---|---|
| `build-registry.ts` | `build:registry` | `build` chain | CI drift diff |
| `build-animations-registry.ts` | `build:animations-registry` | `build` chain | CI drift diff |
| `build-component-index.ts` | `build:component-index` | `build` chain | CI drift diff |
| `build-counts.ts` | `build:counts` | `build` chain | CI drift diff + `claims.spec.ts` |
| `build-releases.ts` | `build:releases` | `build` chain | CI drift diff |
| `build-sitemap.ts` | `build:sitemap` | `build` chain | CI drift diff |
| `build-og-images.ts` | `build:og` | `build` chain | CI drift diff |
| `build-stats.ts` | `build:stats` | `build` chain | **exempt** — live GitHub/npm APIs |
| `check-template-previews.ts` | `check:previews` | `build` chain | fails the build itself |
| `check-bundle-budget.ts` | `check:bundle` | `landing-perf` CI job | fails the job itself |
| `check-storybook-mounted.ts` | `check:storybook` | `landing-perf` CI job | fails the job itself |
| `shoot-thumbnails.mts` | `thumbnails` | manual | **exempt** — see below |
| `shoot-og.mts` | `og` | manual | **exempt** — see below |
| `build-brand-assets.mts` | `brand-assets` | manual | **exempt** — see below |

"CI drift diff" is the `validate` job's **Landing generated artifacts unchanged**
step (`.github/workflows/ci.yml`): it re-runs the generator on the runner and
`git diff --exit-code`s the committed output. Those artifacts are committed on
purpose (specs import them under a bare `yarn test`, with no build step to write
them first — see `../src/generated/README.md`), and the guard exists because they
once shipped stale: 91 registry files still advertised pre-404 anchors.

## Committed screenshot assets — the drift-guard exemption

Three generators commit **binary** artifacts, and all three are deliberately
**exempt** from the CI drift diff above.

| Generator | Command | Commits | Re-run when |
|---|---|---|---|
| `shoot-og.mts` | `yarn og` | `public/og/<id>.png` | a **block's** appearance changes — its SFC, or a shared component/token it renders |
| `shoot-thumbnails.mts` | `yarn thumbnails` | `public/templates/thumbnails/<slug>{,-dark}.webp` | a **template** is added, or its layout/content/colourway changes (`--missing` fills only the gaps) |
| `build-brand-assets.mts` | `yarn brand-assets` | `favicon.svg`, `apple-touch-icon.png`, `icon-192/512.png`, `site.webmanifest`, `og-default.png` | the **brand** changes — logo, mark, or primary colour |

**Why they are exempt.** The other generators emit text that is a pure function of
the source tree, so re-running them on a runner is a fair comparison. These three
drive Playwright/Chromium: the same source renders to different bytes on a
different machine (font hinting, GPU rasterisation, libvips build). A byte diff
would fail on machine noise rather than on content, and a **pixel** diff needs
per-platform baselines and a tolerance budget that nobody would keep honest. A
gate that fails for reasons unrelated to the change is a gate people learn to
ignore, so we do not add one. This is a **decision, not an oversight** — the point
of writing it down.

**What that costs, and what is checked instead.** The cost is real: a block whose
visuals changed keeps serving its old OG card and nothing notices. Re-running the
right generator is a **human step in the PR that changes the visuals** — the table
above is the checklist. What machines *can* check without pixels is **presence and
count**, and they do:

- `check-template-previews.ts` (`yarn check:previews`, in the `build` chain) fails
  the build unless **every** template has both a light and a dark thumbnail;
- `build-og-images.ts` bakes per-theme totals into `src/generated/ogImages.ts` as
  `THUMBNAIL_COVERAGE` and prints a coverage line
  (`templates: 44/44 light, 44/44 dark thumbs`) — that module *is* in the CI drift
  diff, so the numbers cannot be edited by hand;
- `src/templates/thumbnailCoverage.spec.ts` asserts coverage never falls **below**
  that committed high-water mark and that light and dark stay paired — so the next
  batch of templates cannot quietly ship with half its screenshots missing.

Missing files are still a graceful gap at runtime (a block with no OG card falls
back to `/og-default.png`), never a broken page.

## shadcn registry (`build-registry.ts`)

[`build-registry.ts`](./build-registry.ts) generates a **shadcn-CLI-compatible
registry** into `public/r/` so blocks, the design tokens, and templates each
install with a single `npx shadcn@latest add <url>`. It emits:

- `registry.json` — the top-level index (every block + a `tokens` directory entry);
- `<id>.json` — one `registry-item.json` per block (SFC inlined as a targeted
  `registry:file`);
- `tokens.json` — the `--dz-*` design tokens as a `registry:theme` with light/dark
  `cssVars` (parsed from `@dzup-ui/tokens/dist/tokens.css`);
- `templates/<slug>.json` + `templates/registry.json` — the free full-page
  templates as their own sub-registry (see the collision note below).

All are **generated build artifacts derived from the `BLOCKS` / `TEMPLATES` arrays
and the tokens stylesheet** — never hand-edited. The shaping lives in
[`registryItem.ts`](../src/blocks/registryItem.ts),
[`tokensItem.ts`](../src/blocks/tokensItem.ts) and
[`templatesItem.ts`](../src/blocks/templatesItem.ts) (each shared with a
`*.spec.ts` Vitest guard). The schema target is the **canonical** shadcn registry
JSON Schema (`ui.shadcn.com`), pinned via the `$schema` URLs — so a plain
`shadcn add` resolves these items, not just the `shadcn-vue` fork.

### Regenerate

```bash
# from apps/landing
yarn build:registry
```

`yarn build` runs this first, so `vite build` always copies a fresh `public/r/*`
into `dist/`. Re-run after adding, renaming, or editing a block/template or the
tokens. The out dir is wiped and rewritten each run, so a removed item leaves no
stale JSON.

### Consume

```bash
npx shadcn@latest add https://<landing-host>/r/hero-centered.json        # a block
npx shadcn@latest add https://<landing-host>/r/tokens.json               # the tokens theme
npx shadcn@latest add https://<landing-host>/r/templates/sign-in.json    # a template
```

The gallery surfaces these commands with per-package-manager tabs
(npm/pnpm/yarn/bun) and a **Copy code** button on every block card and detail
page (`PmCommandTabs.vue` + `BlockManifest.vue` + `BlockCard.vue`).

### Vue-SFC spike — what conforms, and the limitations

shadcn's registry format is React-first; projecting a **Vue SFC** library onto it
cleanly required three deliberate choices, so a `shadcn add` genuinely produces a
buildable file rather than a schema-valid-but-broken one:

1. **`registryDependencies` is empty — components ship via npm, not as items.**
   In shadcn's model `registryDependencies` names OTHER registry items the CLI
   fetches and vendors as source (its `ui/` primitives). dzup-ui ships its
   primitives as a versioned package (`@dzup-ui/core`), so a bare `DzButton` there
   would make the CLI resolve `<registry>/DzButton.json` and **404**. We therefore
   emit `registryDependencies: []`, list `@dzup-ui/core` + `@dzup-ui/tokens` (and
   any `lucide-vue-next` the source imports — detected via `sourceDependencies`) in
   `dependencies`, and keep the human-facing component list in `meta.components`.
2. **Files are `registry:file` with an explicit `target`.** A block lands at
   `components/blocks/<id>.vue` (templates under `components/templates/<slug>/`)
   regardless of how the consumer's `components.json` aliases are set.
3. **Tokens ship as `cssVars`, the shadcn vehicle for design tokens.** shadcn
   writes `cssVars.light` under `:root` and `cssVars.dark` under `.dark`; dzup-ui's
   own runtime toggles dark via `[data-theme="dark"]`. The token *values* are
   identical — only the activating selector differs — so a consumer either drives
   them the shadcn `.dark` way or adds `@import '@dzup-ui/tokens/css'` for the
   native selectors.

**Known limits (ship-what-works):** templates are emitted at the SFC + co-located
`data.ts` level (what `resolveTemplateSources` surfaces) — a template that fans
out into many sub-components beyond that pair is out of scope. Template slugs live
under `/r/templates/` (not the flat `/r/`) because a few collide with block ids
(`sign-in`, `sign-up`, `product-detail`); a shared namespace would overwrite one
with the other.

## Animations registry (`build-animations-registry.ts`)

[`build-animations-registry.ts`](./build-animations-registry.ts) is the **registry
groundwork for the `/animations` gallery** (docs/animations.md §3.2, §5; Task N10,
Open Decision D2-3). It projects the `CATALOG` array into the **same canonical
`ui.shadcn.com` registry shape** as the Blocks registry above (TASK-FREE3-02 — not
the `shadcn-vue.com` fork), emitting into `public/r/animations/`
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
`npx shadcn@latest add …/r/<id>.json` line above.

## Live social-proof stats (`build-stats.ts`)

[`build-stats.ts`](./build-stats.ts) bakes the two **live** social-proof metrics —
GitHub stars and npm weekly downloads — into
[`src/generated/liveStats.ts`](../src/generated/liveStats.ts) so the static site
carries real numbers and visitors trigger **no per-page API calls**. The endpoints
and response parsing live in [`src/lib/liveStats.ts`](../src/lib/liveStats.ts),
shared with the runtime refresh (`useLiveStats`) so build and browser never drift.

### Regenerate

```bash
# from apps/landing
yarn build:stats
```

`yarn build` runs this after the registries and ahead of `vite build`, so each
build refreshes the baked numbers. Re-run manually to update them locally.

### Fail-safe, not fail-loud

Unlike the registry generators, a down API must **never break the build**. Each
metric degrades independently — `fresh value → last baked non-null value → null` —
and the generated module is always rewritten with whatever could be resolved. An
offline build simply keeps the previously-committed numbers; a metric that has
**never** resolved stays `null`, and `SocialProof.vue` renders a plain
call-to-action for it rather than a fabricated figure. This is covered by
[`src/lib/liveStats.spec.ts`](../src/lib/liveStats.ts), which drives every failure
mode (rejection, non-2xx, malformed body) through the helpers.

## Sitemap + robots.txt (`build-sitemap.ts`)

[`build-sitemap.ts`](./build-sitemap.ts) (`yarn build:sitemap`, in the `build`
chain) writes `public/sitemap.xml` and `public/robots.txt` — one `<url>` per
indexable route: the static marketing pages plus every `/blocks/<id>` and
`/templates/<slug>`. The 90-odd detail pages are reachable only via in-page
anchors/JS, so without this a crawler never finds them. Preview surfaces
(`/blocks/preview/:id`, `/templates/:slug/preview`) are excluded from the sitemap
and disallowed in `robots.txt`. Both files are committed and, since TASK-FREE3-05,
in the CI drift diff.

### Why there is barely any `<lastmod>`

Only the 44 template URLs carry one, from `TemplateMeta.createdAt`. Static routes
and block pages carry none, on purpose.

The generator used to derive `<lastmod>` for every URL from
`git log --format=%cs --name-only`. That is not reproducible, which the drift guard
made intolerable — and it failed three separate ways:

- a **merge commit** lists every file under the pathspec, so one `git merge`
  re-dated all 140 URLs (measured: 185 changed lines on a tree with no landing
  source edits at all);
- `%cs` is the **committer** date, which a rebase rewrites — the same commit is
  dated differently in two clones;
- CI clones **shallow** (`fetch-depth: 1`), where `git log` knows almost nothing.

A PR adding a block could not have passed either: the author generates the sitemap
while the new SFC is still untracked (no lastmod), commits, and CI regenerates it
*with* one. `<lastmod>` is optional in the sitemap protocol and search engines
discount an unreliable one, so no signal beats a signal that changes on every
merge. `createdAt` is declared, committed registry data — stable everywhere.

Removing it also retired the hand-maintained `STATIC_ROUTE_FILES` map (the
route → page-file table that fed the dates), which would otherwise have needed
updating on every page rename. `STATIC_ROUTES` itself is still by hand — it changes
far less often than the registries, and enumerating router internals from a script
would be more fragile than one visible list.

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
change. A missing thumbnail is **not** a graceful gap here: the gallery's old
`<img onerror>` → registry-icon fallback was retired by FREE2-09, and
`check-template-previews.ts` now fails the build unless every template has both a
light and a dark file. `yarn thumbnails --missing` fills only the gaps.

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

## OG image manifest + template share cards (`build-og-images.ts`)

[`build-og-images.ts`](./build-og-images.ts) (`yarn build:og`, wired into the
`build` chain — TASK-FREE-08) is what makes the fallback above real. It:

1. converts each committed light-mode template thumbnail
   (`public/templates/thumbnails/<slug>.webp`) into a **1200×630 PNG** at
   `public/og-templates/<slug>.png` — X/Twitter and LinkedIn do not reliably
   render WebP `og:image`s, so the WebP stays the on-page rendering and the PNG
   exists purely for share cards. Incremental (mtime-skipped) and sharp-only —
   no Playwright. `public/og-templates/` is **gitignored** (derived every build);
2. inventories `public/og/*.png` (the committed output of the optional
   `yarn og` above) and writes `src/generated/ogImages.ts` — the manifest
   `src/router.ts` reads so it only ever advertises a per-block/per-template
   `og:image` **that exists on disk**. Routes without one inherit the site-wide
   `/og-default.png`. Before this, all 87 block pages advertised images that had
   never been generated.

## Brand identity assets (`build-brand-assets.mts`)

[`build-brand-assets.mts`](./build-brand-assets.mts) (`yarn brand-assets`)
generates the **committed** identity assets referenced from `index.html`:
`favicon.svg` (byte-identical to the Storybook's, one identity across both
apps), `apple-touch-icon.png`, `icon-192/512.png`, `site.webmanifest`, and the
site-wide `og-default.png` share card (1200×630). One-off: re-run only when the
brand changes, then commit the outputs. The OG card deliberately states **no
counts** — a committed image cannot be regenerated by `claims.spec.ts`, so it
must never carry a number that can drift.

## Storybook mount (`/storybook/`) and `LANDING_SKIP_STORYBOOK`

The landing site is the front door to the free docs: `LINKS.components`,
`LINKS.gettingStarted`, `LINKS.theming`, `LINKS.designTokens`,
`LINKS.accessibility`, `LINKS.contributing` (`src/config.ts`), the "Built with"
badge on every template detail page, and all 139 rows of the ⌘K component palette
resolve under `/storybook/`. The `serveStorybook()` vite plugin
(`../vite/serve-storybook.ts`) mounts that path from
`apps/storybook/storybook-static` — serving it via middleware in dev/preview, and
copying it into `dist/storybook/` on build.

**`storybook-static` is a build INPUT, not a committed artifact.** It is
gitignored, so it does not exist on a clean clone or on a CI runner until you
build it. ADR-12 covers the committed package `dist/`s; it does not cover this.

### Build it first

```bash
yarn build            # packages/*/dist — the Storybook build consumes core/dist
yarn storybook:build  # → apps/storybook/storybook-static
yarn workspace @dzup-ui/landing build
```

If `storybook-static` is missing, the landing **build fails** with a message
naming `yarn storybook:build`. It used to return silently, which shipped a
`dist/` with no `storybook/` directory at all — a green build that deployed a site
whose primary call-to-action 404s. The `landing-perf` CI job now builds
tokens → core → storybook → landing in that order.

### Escape hatch — `LANDING_SKIP_STORYBOOK=1`

For the rare case where the landing is genuinely built standalone (a UI-only
smoke build, say), set the env var to skip the mount:

```bash
LANDING_SKIP_STORYBOOK=1 yarn workspace @dzup-ui/landing build
```

The build then prints a loud warning and emits a `dist/` **with no `/storybook/`**.
Every link listed above 404s in that output — **do not deploy it as the public
site.** Unset (the default) always means fail-loud.

### Output guard (`check-storybook-mounted.ts`)

```bash
yarn workspace @dzup-ui/landing check:storybook
```

Asserts `dist/storybook/index.html` exists and is non-empty. CI runs it right
after the landing build, so a landing artifact missing its docs can never pass
green again — including via the escape hatch above.
