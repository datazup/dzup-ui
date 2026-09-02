# TASK-N2-A4 — Registry distribution evaluation (shadcn-compatible OSS, private Pro)

> **Type:** decision study. Read-only toward the codebase except for one
> clearly-labelled throwaway spike under `…/scratchpad/a4-spike` (§10) —
> **nothing** was written into the repository except this file and one cross-link
> line in the Pro program (§12).
>
> **Nothing was published, registered, deployed, committed, pushed or dispatched.**
> No registry artifact was created, mutated or exposed. No package was published.
> No domain, token, or credential was registered or transmitted.
>
> **Evidence binding.** Every repo number below is measured on `ui/dzup-ui`
> `main` @ **`51dec93`** (`51dec93c73214af2d1e424e3454a7122691fea48`,
> *"new version for themes"*, 2026-08-28T14:31+02:00), **worktree dirty — 269
> entries**, the uncommitted N1 + N2 program. Everything here is therefore
> **locally qualified and worktree-dirty**: it is not CI evidence, not release
> evidence, and not production evidence (README §3 `<evidence_rules>`).
> Measurement date **2026-09-02**. External facts were fetched the same day and
> are date-stamped; anything not verified is marked **UNVERIFIED**.

---

## 0. Recommendation, in one page

**Do not build a registry. dzup-ui already has one — three, in fact — and they
are shipping, schema-valid, gated, and completely unreachable. Finish that,
extend it by one cheap item class, and refuse component-source distribution
permanently.**

The premise of this task ("shadcn's registry format is the de facto AI-builder
distribution channel; should dzup-ui adopt it?") is already answered in the
affirmative *by the repository*, and was answered before this packet existed.
What the repository has not done is **publish**, which is the one thing no
prompt in this program is authorised to do. So the real decision in front of the
owner is not *"adopt the format?"* — it is *"turn on the thing we already built,
and where do we stop?"*

| | Verdict |
|---|---|
| **Can a compiled library map onto the shadcn schema?** | **Not for its components — and it must not try.** But it maps cleanly, and already does, for *compositions that depend on the package*. §4. |
| **What should the OSS registry expose?** | Blocks, templates, animations, the token theme (all four already shipping) **+ theme presets** (new, cheap, argued in §5.5). **Not** component source. §5. |
| **How would a private Pro registry work?** | A **private GitHub repo registry**, authenticated by the same GitHub PAT Pro consumers already need for GitHub Packages. Zero new infrastructure. §6. |
| **What does it cost?** | The support surface is **already declared** (401 files, 1.69 MB of copyable source) but **not yet incurred**, because nothing resolves. Publication is the moment it is incurred. §7. |
| **Recommended option** | **Option A** (§8) — make what exists real; then **Option B** as a cheap follow-on. **Refuse Option E** (component source) as a standing refusal. |
| **First implementation packet** | `TASK-N5-01` (0.x release policy) unblocks publication; then a new `TASK-N2-A5` — registry freshness gate + origin/publication readiness. §8. |

**`[!owner]`** — this study stops here. Seven decisions are listed in §11.

---

## 1. What this study had to establish first

The task's `<honesty>` requirement is the whole study: *"dzup-ui is NOT
copy-source-styled like shadcn; the study must confront that head-on rather than
assuming the mapping works."*

That is correct, and it is measurable rather than assertable. §2 measures what
`@dzup-ui/core` actually publishes. §3 measures what already exists in the repo
that is registry-shaped — which turned out to be the single most consequential
finding in this study, and it changes the shape of the question. §4 then
confronts the mismatch with both measurements in hand, and with a spike that
*ran the shadcn CLI against the repository's own emitted artifacts* rather than
reasoning about whether it would work.

---

## 2. Ground truth A — what dzup-ui actually publishes

### 2.1 `@dzup-ui/core` publishes compiled output and nothing else

`packages/core/package.json` @ `51dec93`:

| Field | Value |
|---|---|
| `version` | `0.2.0` |
| `license` | `MIT` |
| `type` | `module` |
| `files` | `["LICENSE", "README.md", "dist"]` |
| `exports` | **15 subpaths** — `.`, `./resolver`, `./ownership`, `./providers`, `./styles`, and 11 family subpaths (`./buttons` … `./typography`) |
| every `exports` target | `./dist/*` — `dist/index.js`, `dist/index.d.ts`, `dist/core.css`, `dist/components/{family}/index.js` |
| `peerDependencies` | `vue ^3.5.0`, `reka-ui ^2.0.0` |
| `dependencies` | `@dzup-ui/contracts`, `@dzup-ui/tokens`, `@floating-ui/vue`, `@internationalized/date`, `clsx`, `lucide-vue-next`, `qrcode-generator`, `tailwind-merge`, `tailwind-variants@0.3.1` |

**Zero source files are published.** `files` names `dist` only; not one `.vue`,
`.types.ts`, `.variants.ts` or `.tokens.ts` from `packages/core/src` reaches a
consumer's `node_modules` as source. A consumer of `@dzup-ui/core` receives a
compiled ESM bundle, its `.d.ts`, and one stylesheet.

**Finding A4-F1 — the published artifact is git-ignored and stale, and no gate
can see it.** `packages/core/dist` matches `.gitignore:9 dist/`
(`git check-ignore -v` confirms), and **zero `dist/` files are tracked anywhere
in the repository**. On disk it is **5.7 MB**, newest artifact
**2026-08-25T09:24Z** — eight days behind HEAD's own commit date and one entire
N2-S1 anatomy rollout stale. This re-measures **D3-F2**
(`N2-D3-playgrounds-handoff.md`, lines 55–68) at this commit and extends it: the
same staleness that made the docs playground bundle from `src` instead of `dist`
also means **the thing a registry item's `dependencies[]` would resolve to has
never been built from current source in a gated way**. `CLAUDE.md` lists
**ADR-12 "Committed dist artifacts"**; the repository does not do that, as
`N2-T1-dtcg-export-handoff.md` §3 already recorded. The ADR and the tree
disagree, and the tree wins.

### 2.2 The styling contract does not need source — that is its entire point

ADR-19 (`docs/adr/`, still **Proposed**) defines the five-layer public styling
contract. Read as *"what must a consumer copy to restyle a component?"*, the
answer is **nothing**:

| ADR-19 decision | What it gives the consumer | Source needed? |
|---|---|---|
| **1. Token interchange** — `--dz-*` is the contract; DTCG is the interchange format | 674 distinct custom properties; override any of them | **No** |
| **2. Cascade layers** — `@layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides` | `dz-overrides` is **empty in the library, reserved for consumers**; unlayered consumer CSS beats every library layer, so *"a consumer override needs no `!important`"* | **No** |
| **3. Parts** — `data-part="<name>"`, kebab-case, shared vocabulary | a stable, addressable selector per anatomy node | **No** |
| **4. States** — per-component `data-state` enum + presence-only booleans | stable state selectors | **No** |
| **5. Typed overrides** — `ui?: Partial<Record<Part, DzClassValue>>` | per-instance, per-part class injection, type-checked against the component's own declared part union | **No** |

This is the repo's own phrasing, from README §3 `<styling>`: *"dzup-ui is
restyleable by contract, **NOT unstyled** — headless consumers use Reka directly,
outside the support contract."*

**The consequence for this study is decisive.** shadcn's registry exists because
shadcn components are *unowned* — you copy them because that is the only way to
change them. dzup-ui's components are *owned by the library and parameterised for
the consumer*. Copying a dzup component into a consumer's repo does not unlock
anything ADR-19 has not already unlocked; it only severs the component from every
gate that makes it trustworthy. The distribution model and the styling model are
the same decision, made once, and ADR-19 made it.

### 2.3 Scale of what is governed

`packages/core/manifests/component-ownership.manifest.json`, schema `1.1.0`,
`sourceCommit` **`51dec93c…`** (re-bound by N0-05 — current, not stale):

| Kind | Count |
|---|---|
| `type` | 878 |
| `public-component` | **144** |
| `recipe` | 143 |
| `compound-part` | 64 |
| `composable` | 38 |
| `unclassified` | 29 |
| `token-module` | 18 |
| `compat-alias` | 11 |
| `internal` | 2 |
| **Total** | **1,327** |

205 `.vue` files across 11 families in `packages/core/src/components/`.

---

## 3. Ground truth B — the registry that already exists

This is the prior art the task asked to be established "precisely". It is
substantially larger than the task's framing assumed.

### 3.1 Three generators, 282 tracked artifacts, 3.4 MB

`apps/landing/scripts/build-registry.ts` — **317 lines**, header dated to
"docs/blocks.md §1.3, §3.3, Task G1" — plus
`apps/landing/scripts/build-animations-registry.ts`. Both run **ahead of
`vite build`** in `apps/landing`'s `build` script, so a deploy always regenerates
them.

`git ls-files apps/landing/public/r | wc -l` → **282**. `du -sh` → **3.4 MB**.
`git status --short apps/landing/public/r` → **0** (clean; the registry is *not*
part of the 269 dirty entries).

| Artifact | Measured @ `51dec93` |
|---|---|
| `/r/registry.json` | `$schema` = **`https://ui.shadcn.com/schema/registry.json`** (the canonical shadcn schema, not the `shadcn-vue` fork), `name: "dzup-ui"`, `homepage: "https://dzup-ui.com"`, **88 items** = 87 `registry:block` + 1 `registry:theme` |
| `/r/<id>.json` | **87** `registry-item.json` payloads, each with its SFC **inlined** as one `files[]` entry, `type: "registry:file"`, `target: "components/blocks/<id>.vue"` |
| `/r/<id>.md` | **87** self-contained markdown pages (title, description, components, deep link, fenced SFC) for AI assistants |
| `/r/templates/registry.json` + items | **44** `registry:block` template items, deliberately namespaced under `/r/templates/` because some slugs collide with block ids |
| `/r/animations/` | **60** items + index — a third registry (`docs/animations.md` §3.2, §5) |
| `/r/tokens.json` | one `registry:theme` item: **673 `cssVars.light`** + **123 `cssVars.dark`**, `dependencies: ["@dzup-ui/tokens"]` |
| `/r/component-meta.json` | copied verbatim at build time from `packages/core/docs/component-meta.json` (**1,748,539 B**). Deliberately **not** in `registry.json` — it is not `add`-able; it is the machine-readable component API that `@dzup-ui/mcp` reads in production |
| `/llms.txt`, `/llms-full.txt` | generated blocks catalogue, gated by `validate:llms` via `build-registry.ts --check-llms` |

Item key union across all 88 index entries: `categories`, `dependencies`,
`description`, `files`, `meta`, `name`, `registryDependencies`, `title`, `type`.
Every `files[]` entry is `type: "registry:file"`.

### 3.2 Source volume already shaped for copy-out

| Registry | Files inlined | Bytes of source |
|---|---|---|
| Blocks | 87 | 480,535 |
| Templates | 77 | 734,375 |
| Animations | 237 | 473,365 |
| **Total** | **401** | **1,688,275 (1.69 MB)** |

Largest single block: `page-scaffold` at 11,075 B. Mean block: 5,523 B.

### 3.3 The design decision is already written down, correctly

`apps/landing/src/blocks/registryItem.ts` header, verbatim:

> shadcn's `registryDependencies` are OTHER registry items the CLI fetches and
> writes as source (its React `ui/` primitives). dzup-ui ships its primitives as
> a versioned npm package (`@dzup-ui/core`), **NOT** as per-component registry
> items, so a bare component name there (`DzButton`) would make `shadcn add` try
> to resolve `<registry>/DzButton.json` and 404. We therefore emit
> `registryDependencies: []` and put the runtime packages in `dependencies[]`
> (npm-installed), and preserve the human-facing component list in
> `meta.components`.

`apps/landing/src/gallery/registryItem.ts` restates it and records that it once
did the wrong thing: it *used* to emit `entry.components` verbatim into
`registryDependencies`, so **every emitted item carried unresolvable names**,
including `DzAurora`, which is not an npm export at all. That defect was found
and fixed before this study.

`apps/landing/src/blocks/tokensItem.ts` carries its own spike note:

> shadcn writes `cssVars.light` under `:root` and `cssVars.dark` under `.dark`.
> dzup-ui's own runtime toggles dark via `[data-theme="dark"]`, so a consumer who
> installs these tokens standalone drives them with shadcn's `.dark` convention
> (or adds `@import '@dzup-ui/tokens/css'` for the native selectors).

§10 measures what that actually does. The note is right about the mechanism and
understates the consequence.

### 3.4 How it is governed — and the hole in the governance

**Governed by:** four Vitest guards over the real catalogues
(`blocks/registryItem.spec.ts`, `blocks/templatesItem.spec.ts`,
`blocks/tokensItem.spec.ts`, `gallery/registryItem.spec.ts`), plus one clause in
`validate:component-meta`. That clause is worth quoting, because it is the tie
between the registry and the MCP package
(`packages/tooling/src/validators/component-meta.ts:264-283`):

> `apps/landing/scripts/build-registry.ts` does not copy component-meta.json into
> `/r/`. It wipes and rewrites that directory on every build, so without the copy
> the deployed site 404s on `/r/component-meta.json` and every MCP client loses
> `search_components`, `get_component_metadata` and `get_component_example`
> **in production while they keep working locally**.

The clause matches the `copyFile(COMPONENT_META_SRC` **call**, not the string —
its own comment records that the first version was satisfied by a comment, and
the seeded deletion stayed green.

**Finding A4-F2 — there is no `validate:registry`.** Of the 29 `validate:*`
scripts, none checks that the committed `/r/*.json` agrees with a fresh render of
the `BLOCKS` / `TEMPLATES` / `CATALOG` arrays. The freshness discipline that
`validate:llms`, `validate:docs-pages`, `validate:component-meta`,
`validate:readme-facts` and `validate:tokens:dtcg` all enforce — *committed output
must equal regenerated output* — is **absent for the registry itself**, even
though `build-registry.ts` already implements exactly the required read-only
check mode (`--check-llms`, which "returns before any of it and writes nothing at
all") for the two llms files that live beside it. Measured consequence:
`apps/landing/public/r/registry.json` has mtime **2026-08-28T12:25:56Z**, which
is *before* HEAD's own commit timestamp (14:31:02Z) and before every one of the
269 uncommitted changes. The committed registry is a snapshot of a tree that no
longer exists, and nothing in `yarn validate:all` says so. (A deploy would
regenerate it — `build:registry` runs ahead of `vite build` — so this is a
*committed-artifact* staleness, not a deployed-artifact one. It is still the
exact class of drift this repo gates everywhere else.)

### 3.5 Seven of nine MCP tools read this registry

From `N2-A1-mcp-governance-handoff.md` §14 (cited, not re-derived): the governed
`@dzup-ui/mcp` surface is nine tools. **Seven of them read `/r/*` paths** —
`list_blocks` (`/r/registry.json`), `get_block` (`/r/<name>.json`),
`list_templates` (`/r/templates/registry.json`), `get_template`
(`/r/templates/<name>.json`), `list_tokens` (`/r/tokens.json`),
`get_install_command` (all three indexes), and `search` (two of them). Only
`list_components` and `get_component` read `/storybook/llms*.txt` instead.

**The registry is not a side project of the agent surface. It is the agent
surface's data layer.** Whatever this study concludes about the registry, it
concludes about `@dzup-ui/mcp` at the same time.

### 3.6 Finding A4-F3 — neither end of the distribution chain resolves

Measured 2026-09-02 from this machine (control: `https://example.com` → HTTP 200,
`ui.shadcn.com` and `magicui.design` both fetched successfully in the same
session, so this is not a network artefact):

| Probe | Result |
|---|---|
| `nslookup dzup-ui.com` | **`Non-existent domain`** (NXDOMAIN) |
| `curl https://dzup-ui.com/r/registry.json` | connection failure (`000`) |
| `curl https://dzup-ui.com/llms.txt` | connection failure (`000`) |
| `GET registry.npmjs.org/@dzup-ui%2fcore` | **404** |
| `GET registry.npmjs.org/@dzup-ui%2ftokens` | **404** |
| `GET registry.npmjs.org/@dzup-ui%2fcontracts` | **404** |
| `GET registry.npmjs.org/@dzup-ui%2fmcp` | **404** |

`apps/landing/src/origin.ts:32` pins `SITE_ORIGIN = 'https://dzup-ui.com'`, and
its own header explains why the constant exists: the origin previously shipped as
*"seven separate literals naming a `.dev` variant of our name that we do not
own"*, stamped into the `homepage` of every published registry index. The
header's own words —

> A project with two domains has zero domains: every artifact carrying the wrong
> one is a promise to a future 404, and **registry JSON is a distributed
> artifact** — a consumer's `npx shadcn add` bakes whatever we publish into their
> project, so the wrong host outlives the fix.

— now describe the *canonical* host as well, at the DNS level. 282 committed
artifacts name an install URL for a domain that does not exist, and
`dependencies: ["@dzup-ui/core", "@dzup-ui/tokens"]` in each of them names two
packages that do not exist on npm.

This is not a criticism of the registry work; it is the correct sequencing — the
artifacts were built before the authority to publish existed, which is precisely
how this program is structured. But it means **the entire question in front of
the owner is a publication question, not a format question.**

---

## 4. Question 1 — can a compiled library map onto a source-distribution schema?

### 4.1 The mismatch, stated exactly

shadcn's unit of distribution is a **file**. `registry-item.json`'s `files[]`
carries `path`, `type`, `content`, `target`; `shadcn add` writes those bytes into
the consumer's project; `registryDependencies` names *other items whose files are
also written*. There is no version on an item, no update path, no link back. The
CLI's job is to make a copy and get out of the way.

dzup-ui's unit of distribution is a **package export**. `@dzup-ui/core` publishes
15 `exports` subpaths onto `dist/`; the consumer imports `DzButton`, receives a
compiled symbol, and receives fixes by bumping a semver range.

These are not the same operation and cannot be made the same operation. **For the
144 public components, the mapping does not work, and the study's answer to
question 1 is no.** Concretely, emitting `DzButton` as a `registry:ui` item would
require inlining, at minimum:

- `DzButton.vue`, `DzButton.types.ts`, `DzButton.tokens.ts`, `DzButton.variants.ts`;
- the `Base*Props` interfaces it extends from `@dzup-ui/contracts`
  (`props.types.ts`) and the frozen variant taxonomies (ADR-02);
- `utilities/cn.ts`, `tailwind-variants@0.3.1`, `tailwind-merge`, `clsx`;
- for most components, a Reka UI primitive (ADR-07) and the ADR-20 provider chain
  (`DzThemeProvider`, locale, direction, portals, motion, defaults, nonce);
- the `--dz-*` tokens the recipe references — 674 of them.

…and the moment those bytes land in a consumer's repo they are outside
`component-ownership.manifest.json`, outside `validate:tokens`,
`validate:tv-slots`, `validate:anatomy-parts`, `validate:rtl`, the 144-row
capability matrix, the 534-cell AT matrix, and the contract specs. The product of
dzup-ui is not the 205 `.vue` files; it is the **1,327-entry governed manifest
and the evidence attached to it**. Copying the files distributes the part that is
cheap and discards the part that is expensive.

For contrast, this is the real thing shadcn-vue ships — measured, not recalled
(fetched 2026-09-02, `https://www.shadcn-vue.com/r/styles/default/button.json`):

```jsonc
{
  "name": "button",
  "type": "registry:ui",
  "dependencies": ["reka-ui"],
  "registryDependencies": [],
  "files": [
    { "path": "ui/button/Button.vue", "content": "<script setup lang=\"ts\">…", "type": "registry:ui", "target": "" },
    { "path": "ui/button/index.ts",  "content": "import { cva } from \"class-variance-authority\"…", "type": "registry:ui", "target": "" }
  ]
}
```

Two files, ~2.6 KB, no `$schema`, no `title`, no `description`, `cva` recipe
inlined beside the SFC. That is a *component you own*. dzup-ui's `DzButton` is
not that object and should not pretend to be.

### 4.2 The mapping that does work — and is already taken

The schema has a second, entirely legitimate mode: distribute **compositions that
depend on the package**. `dependencies[]` is npm; `registryDependencies[]` is
source. Put the library in the first and leave the second empty, and `shadcn add`
becomes *"drop this composed file in, and here are the two npm packages it
needs"*.

That is exactly what `apps/landing/src/blocks/registryItem.ts` does, and it is
the correct reading of the schema for a compiled library. It is not a workaround
— `registry:block` means "a complex multi-file component", and a block composed
from `DzBadge, DzHeading, DzText, DzButton` is precisely that.

### 4.3 The spike — proven by execution, not argument

Rather than assert the mapping works, §10's throwaway spike ran the **canonical
`shadcn` CLI, version 4.20.0** (measured 2026-09-02; note the task brief's
"CLI 3.0" is two majors behind) against the repository's **own emitted
artifacts**, unmodified, in a project with no framework at all.

| Spike | Command | Result |
|---|---|---|
| **S1** | `shadcn add ./hero-centered.json` (byte-identical to `apps/landing/public/r/hero-centered.json`) | ✅ `Checking registry` — **schema accepted**. ❌ then **failed**: `npm install @dzup-ui/core @dzup-ui/tokens` → `E404 Not Found`. **Zero files written.** |
| **S2** | same item, `dependencies: []` | ✅ **`Created 1 file: src/components/blocks/hero-centered.vue`** |
| **S3** | `tokens.json`, `dependencies: []` | ✅ **`Updating src/style.css`** — 23 B → **78,806 B** |
| **S4** | inspect the written CSS | 673 vars under `:root`, 123 under `.dark`, `@custom-variant dark (&:is(.dark *))`, and a CLI-generated `@theme inline { … }` of 673 lines. **`data-theme` appears 0 times. `@layer` appears 0 times.** |

**S1 and S2 together are the whole answer to question 1.** The schema fit is real
and proven — a canonical shadcn CLI, in a project containing no React, no Vue,
and no framework, accepted dzup-ui's registry item and wrote a `.vue` file to the
right place. The *only* thing that failed is npm publication. The format is not
the blocker. **Publication is the blocker**, and publication is owner authority
(README §3 `<authority>`, and TASK-N5-01).

### 4.4 Finding A4-F4 — the installed token theme is inert under dzup-ui's own dark mode

`tokensItem.ts`'s spike note says *"only the activating selector differs"*.
Measured (S3/S4), the consequence is larger than that phrasing implies:

1. **`data-theme` occurs 0 times** in the 78.8 KB the CLI wrote. dzup-ui's own
   runtime toggles dark via `[data-theme="dark"]`. A consumer who installs
   `tokens.json` standalone and then uses `DzThemeProvider`'s dark toggle gets
   **light tokens in dark mode** — the 123 dark values sit under `.dark`, which
   nothing in dzup-ui sets. It works only if they also adopt shadcn's `.dark`
   convention, which the note mentions but the artifact does not enforce or
   document at the install site.
2. **`@layer` occurs 0 times.** The CLI writes the tokens **unlayered**. Under
   ADR-19 decision 2 that means they beat *every* library layer including
   `dz-tokens` — permanently, and silently, with no upgrade path. For a consumer
   who *also* `@import`s `@dzup-ui/tokens/css`, the installed copy wins forever
   and a token fix shipped in a later `@dzup-ui/tokens` never reaches them.
3. The CLI additionally synthesised an `@theme inline` block of **673 lines**:
   **319** remapped into Tailwind's `--color-*` namespace
   (`--color-dz-colors-primary-50: var(--dz-colors-primary-50)`), **354** emitted
   as identity mappings (`--dz-spacing-0: var(--dz-spacing-0)`). This is a shadcn
   heuristic operating on token names it does not understand. It is probably
   harmless under Tailwind v4's `inline` semantics, but **UNVERIFIED** — it was
   not built through a real Tailwind pipeline in this spike, and it means the
   installed artifact is materially **not** the same thing as
   `@import '@dzup-ui/tokens/css'`.

This is a real, measured defect in a shipping artifact, found by running it. It
is cheap to fix (§5.5 folds the fix into the theme-preset packet) and it is a
concrete instance of the general risk in §7.2.

---

## 5. Question 2 — what should an OSS `registry.json` expose?

Each candidate argued in or out, against the measured state.

### 5.1 Blocks — **IN** (already shipping, 87 items)

A block is a *composition*, not a primitive: `hero-centered` imports
`DzBadge, DzButton, DzHeading, DzText` from `@dzup-ui/core` and composes them
into 3.9 KB of page scaffolding. Copying it is the *correct* semantics — a hero
section is meant to be edited beyond recognition, and it has no API surface, no
contract spec, no capability row and no ownership entry to sever. The library
keeps the primitives; the consumer owns the arrangement. **This is the model.**

### 5.2 Templates — **IN** (already shipping, 44 items)

Same argument at a larger grain (77 files, 734 KB). Correctly namespaced under
`/r/templates/` because slugs collide with block ids (`sign-in`,
`product-detail`). Note the schema now has a native alternative: `include`
(shadcn changelog, **May 2026**) composes a large source registry from multiple
`registry.json` files, and `shadcn registry validate` checks the composition
before publishing. The repo's directory split predates and duplicates that; it
works, and moving to `include` is optional polish, not a fix.

### 5.3 Animations — **IN** (already shipping, 60 items)

`apps/landing/src/gallery/registryItem.ts` already solved the hardest sub-case
honestly: 56 of the catalogue's effects import a landing-local `src/motion`
primitive that **is not published**, so the item **bundles the primitive's
source** rather than naming an unresolvable dependency. That is the right call
and it is a preview of the `@dzup-ui/motion` package decision (their Open
Decision D-2) — worth flagging that when `@dzup-ui/motion` does ship, those 237
inlined files should shrink back into a `dependencies[]` entry.

### 5.4 The token theme — **IN** (already shipping, 1 item) — with A4-F4 to fix

`registry:theme` with 673 + 123 `cssVars` is the schema's designed vehicle for
design tokens, and shadcn's own theme items use exactly this shape. Keep it; fix
the `.dark` / `[data-theme]` mismatch and the missing layer (§4.4).

### 5.5 Theme presets — **IN (new). This is the one genuinely new item class worth adding.**

The task asked whether theme presets are distributable — "the DTCG export and
ThemeRecipe are both real and shipping". Measured: they are, and the machinery to
project them already exists.

`packages/tokens/src/theme-recipe.ts`, exported from `@dzup-ui/tokens`'s main
entry (`index.ts:137`, `:151`):

| Fact | Measured |
|---|---|
| Presets | **8** — `dzup, emerald, rose, amber, slate, violet, mono, custom` (`THEME_RECIPE_PRESETS`) |
| Axes | palettes (7 × 11 shades), `radius`, `shadow`, `density` (`compact\|cozy\|spacious`), `font` (6), `mode`, `direction`, `motion` |
| Projection | **`themeRecipeToCssVariables(recipe, mode) → Record<string, string>`** — already returns exactly the `cssVars` shape a `registry:theme` item needs |
| Serialization | `encodeThemeRecipe` / `decodeThemeRecipe` / `themeRecipeToUrl` / `themeRecipeFromUrl` |
| Versioning | `THEME_RECIPE_VERSION = 1`, future versions **rejected fail-closed** |

The marginal cost is one shaping module and one loop in `build-registry.ts` —
`toTokensItem()` already proves the pattern, and `themeRecipeToCssVariables()`
removes the CSS-parsing step entirely (the existing tokens item parses
`dist/tokens.css` with a brace-depth state machine; a preset item would not need
to). **8 new `registry:theme` items for roughly the code volume of
`tokensItem.ts`.**

Two further arguments:

- **The ecosystem converged on this concept independently.** shadcn shipped
  **presets** in **April 2026** (verified 2026-09-02): `PresetConfig` carries
  `version, style, baseColor, theme, chartColor, iconLibrary, font, fontHeading,
  radius, menuAccent, menuColor, url`; `shadcn preset decode|resolve|url|open`
  and `shadcn apply [preset]` exist in CLI 4.20.0's `--help` (measured);
  `shadcn/preset` exports `encodePreset`/`decodePreset` for "a short, URL-safe
  preset code". That is `ThemeRecipeV1` + `encodeThemeRecipe` + `themeRecipeToUrl`,
  arrived at separately. dzup-ui's version is **older and has more axes**
  (density, direction, motion, per-palette hue/chroma). The competitive read from
  `04-competitive-benchmark.md` — theme builder, ThemeRecipe's URL serialization
  is the hard part, already built — is confirmed by this convergence.
- **It closes A4-F4 as a side effect**, because a preset item is authored from
  the recipe rather than scraped from CSS, so the `light`/`dark` bucketing and
  the activating selector are chosen deliberately rather than inherited from a
  parser.

**Out of scope for a preset item:** the DTCG export
(`packages/tokens/dist/tokens.dtcg.json`, 292,239 B, 774 typed + 26 untyped
tokens, 319 aliases, gated by `validate:tokens:dtcg`). DTCG is a **tool
interchange** format for Figma/Style Dictionary/Terrazzo — the shadcn CLI has no
`$type`/`$value` reader and would write it verbatim into a consumer's project as
an inert 285 KB JSON file. Publish it as a package subpath (`@dzup-ui/tokens/dtcg`
— **already an export**) and link it from the docs site; do **not** make it a
registry item. `N2-T1-dtcg-export-handoff.md` §2 records that ThemeRecipe's
non-light/dark axes are *"a runtime recipe that regenerates token values, not a
token set; DTCG has no vocabulary for a parameterised generator"* — the shadcn
preset concept is exactly the vocabulary DTCG lacks, which is why presets belong
in the registry and DTCG does not.

### 5.6 `component-meta.json` — **IN as a served file, OUT as an `add`-able item** (already correct)

The existing decision is right and should be left alone. `build-registry.ts`
copies it into `/r/` but deliberately keeps it out of `registry.json`: it is not
something a consumer installs, it is the machine-readable API that `@dzup-ui/mcp`
and the docs site read. Per `N2-A2-component-meta-handoff.md` §13 it is
**1,472,622 B** as generated (1,748,539 B at this commit) and *"not fine to ship
whole to a browser"* — which is also a reason it must never become a registry
item, because `shadcn add` would write all of it into someone's repo.

### 5.7 Full component source — **OUT. Argue it explicitly, and record the refusal.**

The arguments *for* are real and should be stated rather than strawmanned:

1. **Discovery.** AI builders (v0, Bolt, Lovable) index registries; per-component
   items are more discoverable than 87 blocks.
2. **The "own your components" pitch** is genuinely what a segment of the 2026
   market wants.
3. **No npm publication needed** — a source registry works without
   `@dzup-ui/core` ever reaching npm, which given §3.6 is not a trivial
   advantage.

Against, and decisively:

1. **It contradicts ADR-19.** §2.2: consumers already have five layers of
   override authority without source. Distributing source adds *nothing* they
   could not already do and removes the contract that made it safe.
2. **It voids every gate.** 1,327 manifest entries, 144 capability rows × 1,661
   evidence cells, 534 AT cells, 29 validators, contract specs — all of it
   describes `packages/core/src`. A vendored copy is governed by nothing, and the
   library would be publishing evidence about code its users are not running.
   That is worse than publishing no evidence.
3. **There is no version and no upgrade path.** shadcn registry items carry no
   version field (**UNVERIFIED** that any exists — I could not find item
   versioning in `registry-item.json`, the API reference, or the FAQ; only
   GitHub *ref* pinning, `#branch`/`#tag`/`#sha`, is documented). Every copied
   component is a permanent fork. For a *block* that is the point. For a
   component with a 534-cell AT matrix behind it, it means the accessibility
   fixes in N1-O3 reach nobody.
4. **Support cost is unbounded and unmeasurable.** §7.1.
5. **It is a one-way door.** Blocks can be withdrawn; a component API that 500
   projects have vendored cannot.

**Recommendation: record "no per-component source distribution" as a standing
refusal in README §5**, beside "a blanket unstyled mode" and "a second styling
engine". It is the same decision as those two, and it should be written down in
the same place so it stops being re-litigated.

### 5.8 A "get started with dzup-ui" bootstrapper — **IN, conditionally (Option B)**

One item worth adding that is neither a block nor a theme: a single
`registry:item` that installs the token theme, lists `@dzup-ui/core` +
`@dzup-ui/tokens` in `dependencies`, writes one `DzThemeProvider` wiring file via
`files[].target`, and uses `envVars` for nothing in OSS (it becomes the Pro
license-key vehicle — §6.4). `npx shadcn@latest add <origin>/r/dzup-ui.json`
becomes the one-line onboarding the docs site (N2-D1) can print. Cheap; blocked
on the same publication decision as everything else.

### 5.9 `registry:base` / `registry:style` — **OUT**

`registry:base` describes "entire design systems" and carries `style`,
`iconLibrary`, `baseColor`, `theme` — fields that reconfigure the consumer's
whole shadcn setup. dzup-ui is not a shadcn style; it is a different library that
happens to use the same distribution format for its blocks. Claiming
`registry:base` would assert an integration depth that does not exist and would
put dzup-ui in the position of overwriting a consumer's `components.json`. No.

---

## 6. Question 3 — a private authenticated registry for Pro

### 6.1 What Pro is today (measured in `ui/dzup-ui-pro`, 2026-09-02)

> Pro custody has moved since README §2 was written (`esmir` @ `6c04972`, 22
> ahead). It is now at **`cda4816`** *"docs(program-2026-08): record the graph
> programme, and open program-2026-09"* with **47 dirty entries**. Nothing in Pro
> was touched by this study except the one cross-link in §12.

| Fact | Value |
|---|---|
| `.npmrc` | `@dzup-ui:registry=https://npm.pkg.github.com`, `@dzup-ui-pro:registry=https://npm.pkg.github.com`, `//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}` |
| `@dzup-ui-pro/pro` | `0.1.0-alpha.0`, `publishConfig: { registry: npm.pkg.github.com, access: "restricted" }`, `files: ["LICENSE","README.md","dist"]` |
| `@dzup-ui-pro/graph` | `0.1.0-alpha.0`, same, `tag: "alpha"`, `files: [CHANGELOG, LICENSE, README, THIRD-PARTY-NOTICES, dist, docs]` |
| `@dzup-ui-pro/contracts` | `0.0.0-placeholder`, `private: true` |
| License | **`SEE LICENSE IN LICENSE`** — not MIT |
| Source | **155 `.vue`** across `packages/pro/src` + `packages/graph/src` |
| Registry artifacts | **none** — `find . -name registry.json` outside `node_modules` → 0 |
| Entitlement code | **none** (N4-L1's own gap statement: *"zero license-key/entitlement code"*) |

So Pro's distribution today is: **compiled `dist` only, over GitHub Packages,
gated by a GitHub token**. The credential is already a GitHub PAT in
`NODE_AUTH_TOKEN`.

### 6.2 The three auth models, verified against current docs (2026-09-02)

**(a) Private GitHub repository registry** — verified from
`ui.shadcn.com/docs/registry/github`:

- Install form: `shadcn add <owner>/<repo>/<item>`; the repo needs a
  `registry.json` at its root.
- **Public repos are read anonymously; the GitHub CLI is never invoked.** The CLI
  tries anonymous first and uses credentials **only when the root
  `registry.json` is not publicly readable** — so a private repo *is* the access
  control.
- Private auth: `gh auth login` once, **or** `GH_TOKEN` / `GITHUB_TOKEN`
  (`GH_TOKEN` wins). Recommended: a **fine-grained PAT with read-only Contents**.
- Reads go through GitHub's Contents API **pinned to resolved commit SHAs**; refs
  via `#branch`, `#tag`, `#<40-char sha>`.
- **Limits: 5 MiB per file. GitHub Enterprise not supported. Symlinks behave
  inconsistently between anonymous and authenticated reads.**

**(b) Self-hosted authenticated endpoint** — verified from
`ui.shadcn.com/docs/registry/authentication` and `/namespace`. `components.json`:

```json
{
  "registries": {
    "@dzup-pro": {
      "url": "https://registry.dzup-ui.com/{name}.json",
      "headers": { "Authorization": "Bearer ${DZUP_PRO_TOKEN}" }
    }
  }
}
```

`{name}` (required) and `{style}` (optional) are substituted; `${VAR}` expands
from `process.env` at runtime, with tokens kept in `.env.local`. Custom headers
(`X-API-Key`, `X-Workspace-Id`) and query `params` are equally supported. The CLI
surfaces **401 / 403 / 429** and displays custom error messages from the server.
Resolution: parse namespace → look up config → substitute → apply auth → fetch +
schema-validate → resolve dependencies recursively.

**(c) Do neither** — Pro stays npm-only over GitHub Packages.

### 6.3 Comparison against what Pro actually needs

| | (a) private GitHub repo | (b) self-hosted endpoint | (c) no registry |
|---|---|---|---|
| New infrastructure | **none** | a service, an issuer, a revocation list, uptime, on-call | none |
| Credential | GitHub PAT — **the same class of credential `NODE_AUTH_TOKEN` already is** | a dzup-issued token | GitHub PAT |
| Per-seat tokens | ✗ (repo access is per-account/team) | ✓ | ✗ |
| Per-tier item gating | ✗ without one repo per tier | ✓ (the server decides what a token may fetch) | n/a |
| Revocation | remove repo access | ✓ immediate, per token | remove repo access |
| Telemetry / usage signal | GitHub audit log only | ✓ full | ✗ |
| Version pinning | ✓ `#tag` / `#sha` — **better than (b)** | must be built | ✓ semver |
| Onboarding friction | low — Pro consumers already have the token | medium (a second credential) | lowest |
| Failure mode for the consumer | GitHub outage | **our** outage | npm/GHP outage |
| Cost to reach v1 | days | weeks + ongoing | zero |

**(a) is the strong answer for a first Pro registry**, and the reason is not
technical elegance — it is that **it introduces no new credential**. A Pro
customer who can `npm install @dzup-ui-pro/pro` from GitHub Packages already
holds a GitHub token; the same token, or a fine-grained sibling with read-only
Contents on one repo, makes `shadcn add dzup-ui/pro-registry/<item>` work. Two
distribution channels, one credential, one revocation gesture.

**(b) is what you build when per-seat entitlement and usage telemetry become
revenue-relevant** — i.e. after N4-L1 decides the tier model, not before. Do not
build a licensing server to answer a distribution question.

### 6.4 The licensing hook — and the trap in it

**This pairs with `ui/dzup-ui-pro/docs/program-2026-09/pro-depth-tasks.md`
`TASK-N4-L1` §3 ("distribution interaction").** The recommendation from this side
of the cross-link:

**Treat registry auth and entitlement as orthogonal, and say so in N4-L1's
packet.** They answer different questions:

- Registry auth answers *"may you **download** this?"* It is enforced at fetch
  time, once, by GitHub or by our server.
- A license key answers *"may you **run** this in production?"* It is enforced in
  the provider chain, at runtime, forever.

Conflating them makes both worse. A revoked registry token does not un-copy
source that was already fetched, and it does not stop a `node_modules` copy from
running — so registry auth alone is not entitlement. Conversely a runtime key
cannot gate what a consumer already has on disk — so entitlement alone is not
access control. N4-L1's own `<honesty>` requirement ("entitlement is deterrence
and revenue hygiene, not DRM") is the right frame and it applies here too.

**The clean hook is delivery, not enforcement.** `registry-item.json` has an
`envVars` field (verified in the schema, 2026-09-02). A Pro registry item can
declare `DZUP_PRO_LICENSE_KEY`, so `shadcn add` writes the variable into the
consumer's env scaffolding at install time and the N4-L1 provider-chain check
finds it already wired. The registry becomes the *distribution* of the key's
slot; the key itself is issued by whatever N4-L1 designs, and enforcement stays
exactly where N4-L1 puts it (default-off, graceful notice, never a hard break —
N4-L1's `<consumer_respect>`).

**Finding A4-F5 — a Pro *source* registry is a licensing hazard that a Pro npm
package is not.** Pro ships `SEE LICENSE IN LICENSE` and `files: ["dist"]`; a
consumer receives compiled output under a proprietary licence. A registry item
that writes **Pro source** into a consumer's repository hands them that source
permanently, under whatever terms the file header carries, with no revocation
path and no runtime check that can reach it. If a Pro registry is built, its items
must be **compositions built from `@dzup-ui-pro/*` npm packages** — the same
`dependencies[]`-not-`registryDependencies[]` discipline
`blocks/registryItem.ts` already established for OSS — and never the 155 `.vue`
files themselves. This is a harder constraint for Pro than for OSS, because for
OSS (MIT) the licence cost of a leak is zero.

### 6.5 The GitHub Packages relation, stated plainly

They are complementary, not alternatives:

| | GitHub Packages (`npm.pkg.github.com`) | Private GitHub registry (`shadcn add`) |
|---|---|---|
| Delivers | compiled `dist`, versioned, semver-updatable | composed source, copied once, forked forever |
| Suits | the 155 Pro components | Pro blocks/templates/starters |
| Auth | `NODE_AUTH_TOKEN` (GitHub PAT) | `GH_TOKEN` / `gh auth login` (GitHub PAT) |
| Update path | `npm update` | none |

The right Pro shape is the OSS shape with the access control moved: **components
by package, compositions by registry, one GitHub credential for both.**

---

## 7. Question 4 — costs and risks

### 7.1 The support surface is already declared; publication is when it is incurred

This is the honest framing, and it is why the decision is live now rather than
hypothetical. **401 files / 1,688,275 B of Vue and TypeScript source are already
shaped, committed, and addressable as copy-out artifacts** (§3.2). What is
missing is a resolving host and two npm packages. So the support surface has been
**declared** without being **incurred** — and the moment §3.6's two 404s become
200s, it is incurred in full, retroactively, for 191 items nobody has ever
supported.

What "support surface" concretely means here:

- **No version, no recall.** A copied block cannot be updated, deprecated, or
  fixed. `hero-centered.vue` at 3.9 KB, copied 500 times, is 500 forks. The
  N1-O3 WCAG fixes (28 target-size, 18 reflow measured failures) reach
  `@dzup-ui/core` consumers on a version bump and reach copied-block consumers
  **never**.
- **Bug reports arrive against code we cannot see.** The consumer edited it —
  that is the point of a block — so every report is against an unknown diff.
- **Accessibility claims do not travel.** The 144-row capability matrix and the
  534-cell AT matrix describe `packages/core`. A block's a11y depends on the
  consumer's edits. Any published evidence must be scoped to the *components*,
  explicitly, or the registry quietly launders component evidence into block
  claims. (`apps/landing/src/blocks/a11y.spec.ts` exists — worth checking what it
  actually asserts before any evidence claim is attached to a block.)
- **AI-builder amplification cuts both ways.** The reason to be in this format is
  that v0/Bolt/Lovable consume it. That also means a defect in one block is
  replicated by a generator at machine speed, and 87 `/r/<id>.md` pages plus
  `llms-full.txt` are explicitly written *for* those generators to ingest.

**Mitigation that costs almost nothing:** state the support boundary in the
registry itself. `registry-item.json` has `meta` (already used for
`meta.components`) and `docs` (*"installation guidance or documentation"*, per
the schema). One `docs` line per item — *"blocks are scaffolding: copied, not
versioned; the components they compose are supported through `@dzup-ui/core`"* —
makes the boundary travel with the artifact instead of living on a web page the
consumer's agent never read. **Do this before publishing, not after.**

### 7.2 What it does to the ownership manifest and the public-API gates

**For the current registry (blocks/templates/animations/tokens): nothing.** Not
one of the 1,327 manifest entries is distributed as source. The registry lives in
`apps/landing`, composes from published exports, and `registryDependencies: []`
means the CLI never tries to resolve a `Dz*` symbol. The manifest still describes
exactly what consumers run.

**For component-source distribution (§5.7): it breaks them structurally.** The
manifest would describe 144 governed components while consumers run N ungoverned
forks of them. `public-api.manifest.json` would describe an API surface that is
no longer the only way to reach the code. Every ratchet in README §3
`<generated_authority>` — anatomy ceiling 137↓, story-DoD 51↓, browser failures
46↓, unclassified 29↓ — would be measuring a decreasing subset of the deployed
population. **The gates would keep passing and would stop meaning anything.**
That is the strongest single argument in this study and it is why §5.7 is a
refusal rather than a deferral.

**For the registry's own governance: A4-F2 is the gap.** There is no
`validate:registry`. Adding one is small — `build-registry.ts` already has the
read-only check-mode pattern (`--check-llms`) and `packages/tooling`'s delegation
pattern for "may not depend on `@dzup-ui/*`" is established by both
`validate:mcp` and `validate:llms`.

### 7.3 Other measured risks

| Risk | Measured state | Severity |
|---|---|---|
| **Dead host baked into distributed artifacts** | `homepage` and every install URL name `dzup-ui.com`, NXDOMAIN (A4-F3). `origin.ts` already tells this story once about a `.dev` host. A consumer's `shadcn add` bakes the URL into their project — *"the wrong host outlives the fix"* | 🔴 blocks publication |
| **Unpublished dependencies** | every item's `dependencies[]` names two npm 404s; S1 proves the install dies there and **writes nothing** | 🔴 blocks publication |
| **Committed registry is stale** | `/r/registry.json` mtime precedes HEAD's commit time; no gate (A4-F2) | 🟠 |
| **Stale `dist` is what `dependencies[]` would resolve to** | 5.7 MB, 8 days + one N2-S1 behind, git-ignored, ungated (A4-F1) | 🟠 |
| **Installed theme inert under dzup dark mode** | 0 `data-theme`, 0 `@layer` in 78.8 KB written (A4-F4) | 🟠 |
| **Pro source under a proprietary licence** | 155 `.vue`, `SEE LICENSE IN LICENSE`; source copy is irrevocable (A4-F5) | 🔴 if a Pro source registry is ever considered |
| **Repo size** | `/r` is 3.4 MB tracked; a deploy adds a further 1.75 MB `component-meta.json` (untracked). `N2-D3` finding **D3-F10** notes the docs site is the only static artifact with no size ceiling — the registry is the second | 🟢 |
| **`shadcn` CLI is not a stable API** | the API reference states *"The CLI commands themselves are not part of the public API"*; only the documented `shadcn/registry`, `shadcn/schema`, `shadcn/preset` imports are stable. CLI 4.20.0 today; the brief said 3.0 | 🟢 monitor |
| **Vue support is asserted, not documented** | registry docs: *"works with any project type and any framework, and is not limited to React"*. But `components.json` docs are React-assuming (`rsc`, `tsx`) and mention no non-React framework. **S2/S3 prove `add` works** for our items; `init` on a Vue project is **UNVERIFIED** | 🟠 verify before publishing an install one-liner |

---

## 8. Options

Each with what it costs, what it risks, and the **first implementation packet**.

### Option 0 — Freeze: keep generating, never publish

- **Do:** nothing. The generators keep running; `/r` stays a local artifact.
- **Cost:** ~0.
- **Risk:** 282 committed artifacts rot against an ungated generator (A4-F2);
  **7 of 9 `@dzup-ui/mcp` tools remain non-functional in production forever**,
  which makes the entire N2 agent lane undeliverable; the DTCG/ThemeRecipe
  first-mover window (`04-competitive-benchmark.md`) closes.
- **First packet:** none.
- **Verdict:** the honest status quo, and unacceptable as a destination.

### Option A — Make what exists real ⭐ **RECOMMENDED**

Do not extend scope. Fix the four things that make the shipping registry
non-functional and ungoverned.

1. `TASK-N5-01` (0.x policy + changelog reconciliation, **16 unreleased
   changesets** measured) → the authority to publish `@dzup-ui/core` +
   `@dzup-ui/tokens` (+ `contracts`).
2. Resolve `SITE_ORIGIN` — register/point `dzup-ui.com`, or change the constant.
   **`[!owner]`**: this is a domain decision, not an engineering one.
3. Add **`validate:registry`** — committed `/r/**` must equal a fresh render;
   delegate to `build-registry.ts --check` exactly as `validate:llms` delegates
   to `--check-llms`.
4. Fix **A4-F4** (theme `.dark` / `[data-theme]` / layering) and add the `docs`
   support-boundary line (§7.1) to every item before first publish.

- **Cost:** small in code (one validator, one check-mode flag, one shaping fix);
  the rest is owner authority.
- **Risk:** incurs the support surface of 191 items (§7.1) — bounded, and bounded
  *by design*, because none of it is component source.
- **First packet:** **`TASK-N5-01`**, then a new **`TASK-N2-A5` — "registry
  freshness gate + publication readiness"**.

### Option B — A + theme presets + a bootstrapper item

Everything in A, plus §5.5 (8 `registry:theme` preset items projected from
`themeRecipeToCssVariables()`) and §5.8 (one `registry:item` onboarding
bootstrapper).

- **Cost:** roughly one `tokensItem.ts` — the projection function already exists.
- **Risk:** ~0 marginal; the presets are already `@dzup-ui/tokens` public API,
  version-gated at `THEME_RECIPE_VERSION = 1`, fail-closed on future versions.
- **Upside:** lands in the same conceptual slot the ecosystem moved into in April
  2026 (`shadcn preset`), with more axes; feeds the N2-D1 docs-site theme
  builder; closes A4-F4 properly rather than patching it.
- **First packet:** **`TASK-N2-A6` — "theme-preset registry items"** (after A).

### Option C — Private Pro registry on a private GitHub repository

Pro blocks/templates/starters composed from `@dzup-ui-pro/*` npm packages, in a
private repo, `shadcn add <owner>/<repo>/<item>`, authenticated by the GitHub PAT
Pro consumers already hold.

- **Cost:** moderate — a Pro registry generator (mirroring `build-registry.ts`),
  a private repo, docs. **No new infrastructure and no new credential.**
- **Risk:** 5 MiB/file ceiling, no GitHub Enterprise, no per-seat granularity, no
  usage telemetry. **A4-F5 is a hard constraint: compositions only, never the 155
  `.vue` files.**
- **Blocked on:** N4-L1 deciding the tier/entitlement model first — the registry
  is a delivery mechanism for a commercial decision that has not been made.
- **First packet:** **Pro `TASK-N4-L1` §3** (distribution posture), then a new
  **Pro `TASK-N4-R1` — "Pro composition registry on a private GitHub repo"**.

### Option D — Self-hosted authenticated registry service

`registries: { "@dzup-pro": { url, headers: { Authorization: "Bearer ${…}" } } }`,
per-seat tokens, per-tier item gating, revocation, telemetry.

- **Cost:** high and **ongoing** — a service, a token issuer, a revocation list,
  uptime, on-call, and a second credential in every consumer's `.env.local`.
- **Risk:** dzup-ui becomes an availability dependency of its customers' builds.
- **Verdict:** **defer.** Correct only once per-seat entitlement is
  revenue-relevant, i.e. downstream of N4-L1's tier decision, and only if (a)
  proves insufficient.
- **First packet:** N4-L1 + an infrastructure packet that does not exist.

### Option E — Publish component source as `registry:ui` items

- **Cost:** very high (§5.7): 144 components × (SFC + types + tokens + variants +
  contracts + `cn` + Reka + provider + 674 tokens), plus a second styling
  contract to maintain.
- **Risk:** §7.2 — **the gates keep passing and stop meaning anything.**
  One-way door.
- **Verdict:** **refuse**, and record it in README §5 beside the other standing
  refusals so it is not re-litigated.
- **First packet:** none. This option exists in the document so the owner can
  reject it explicitly rather than by omission.

---

## 9. Recommendation

**Option A now; Option B as a cheap follow-on; Option C only after N4-L1;
Option D deferred; Option E refused and recorded.**

**Rationale in one sentence:** the shadcn registry format already fits dzup-ui,
because the repository already found the one mapping that works — compositions
that depend on the package, never the package as source — and shipped 191 items
through it; what is missing is not schema work but the two publication acts
(`@dzup-ui/*` on npm, a resolving origin) that no prompt in this program is
authorised to perform, plus the one freshness gate the registry never got.

**The "do not build a registry" answer that `<honesty>` invited is, precisely,
the answer** — with the emphasis on *build*. The correct next move is not
construction. It is publication authority, one validator, and a refusal written
down.

---

## 10. The spike — throwaway, scratchpad-only, fully reproducible

**Location:** `…/scratchpad/a4-spike` — outside the repository, per README §3
`<authority>`. **Nothing was written into `ui/dzup-ui` by the spike.** No registry
was published, registered or exposed; the only network writes were npm package
*reads*.

```bash
# 1. a bare project — no framework, no React, no Vue
mkdir a4-spike && cd a4-spike
#    package.json (private), components.json (style/aliases/tailwind),
#    src/style.css, tsconfig.json

# 2. the repository's OWN emitted artifacts, copied byte-for-byte
cp ui/dzup-ui/apps/landing/public/r/hero-centered.json .
cp ui/dzup-ui/apps/landing/public/r/tokens.json .

npx --yes shadcn@latest --version          # -> 4.20.0   (measured 2026-09-02)

# S1 — unmodified item
npx --yes shadcn@latest add ./hero-centered.json --yes
#   - Checking registry.
#   ✔ Checking registry.                     <- SCHEMA ACCEPTED
#   - Installing dependencies.
#   Command failed: npm install -- "@dzup-ui/core" "@dzup-ui/tokens"
#   npm error 404 Not Found - GET https://registry.npmjs.org/@dzup-ui%2fcore
#   -> zero files written

# S2 — same item, dependencies: []
npx --yes shadcn@latest add ./hero-nodeps.json --yes
#   ✔ Created 1 file:
#     - src\components\blocks\hero-centered.vue

# S3 — tokens.json, dependencies: []
npx --yes shadcn@latest add ./tokens-nodeps.json --yes
#   ✔ Updating src\style.css                 23 B -> 78,806 B

# S4 — inspect
grep -c 'data-theme' src/style.css   # 0
grep -c '@layer'     src/style.css   # 0
#   :root -> 673 --dz-* ; .dark -> 123 --dz-* ; @theme inline -> 673 lines
#   (319 remapped to --color-*, 354 identity)
#   plus @custom-variant dark (&:is(.dark *))
```

**What the spike proves:** the format fit is real (S2, S3 — a canonical shadcn
CLI wrote a `.vue` file and 78.8 KB of `--dz-*` tokens into a project with no
framework); the blocker is publication (S1 — schema accepted, npm 404, nothing
written); and there is one shipping defect worth fixing before publication
(S4 → A4-F4).

---

## 11. Owner decisions `[!owner]`

| # | Decision | Recommendation |
|---|---|---|
| **A4-D1** | **Publish or freeze.** `@dzup-ui/core`, `tokens`, `contracts` on npm — yes or no? Everything else in this study is downstream of it. | **Publish**, gated behind `TASK-N5-01`'s 0.x policy. |
| **A4-D2** | **The origin.** `dzup-ui.com` is NXDOMAIN (A4-F3) and is baked into 282 committed artifacts. Register it, or change `SITE_ORIGIN` and regenerate? | Decide **before** first publish. `origin.ts`'s own header explains why: *"the wrong host outlives the fix."* |
| **A4-D3** | **`validate:registry`** (A4-F2) — build it, or accept that `/r/**` is the one generated artifact class with no freshness gate? | **Build it.** The check-mode pattern already exists in the same file. |
| **A4-D4** | **Theme presets** (§5.5) — 8 `registry:theme` items from `ThemeRecipe`, in or out? | **In** (Option B). Near-zero marginal cost; the projection function exists. |
| **A4-D5** | **Pro distribution posture** — private GitHub repo (C), self-hosted service (D), or npm-only (status quo)? | **(C)**, and only after N4-L1 fixes the tier model. Cross-linked in §12. |
| **A4-D6** | **Record the refusal.** Add "no per-component source distribution" to README §5's standing refusals? | **Yes.** Same class as "a blanket unstyled mode" and "a second styling engine". |
| **A4-D7** | **A4-F4** — the installed theme is inert under `[data-theme="dark"]` and unlayered. Fix `tokensItem.ts`, document the `.dark` requirement at the install site, or both? | **Both**, folded into Option B. |

---

## 12. Cross-links

- **Pro `TASK-N4-L1` §3** (`ui/dzup-ui-pro/docs/program-2026-09/pro-depth-tasks.md`)
  — "distribution interaction: GitHub Packages today, the private-registry option
  from the OSS registry evaluation". §6 of this document is that option; §6.4 is
  the recommended posture on the licensing hook (orthogonal; `envVars` as the
  delivery vehicle); **A4-F5** is a constraint N4-L1 must carry.
  *A one-line pointer to this file was added to that task's gap note — the only
  write this study made outside `ui/dzup-ui/docs/program-2026-09/reports/`.*
- `reports/N2-A1-mcp-governance-handoff.md` §14 — the nine governed MCP tools;
  **seven read `/r/*`** (§3.5).
- `reports/N2-A2-component-meta-handoff.md` §13 — what `component-meta.json` can
  and cannot render; why it is served at `/r/` but is not an `add`-able item
  (§5.6).
- `reports/N2-A3-llms-gate-handoff.md` §15 — the Context7 evaluation; the closest
  prior art to this study in shape, and the same `[!owner]` ending.
- `reports/N2-T1-dtcg-export-handoff.md` §2–3 — the DTCG artifact, the theme axis
  decision, and why ThemeRecipe's other axes are *"a runtime recipe … DTCG has no
  vocabulary for a parameterised generator"* (§5.5).
- `reports/N2-D3-playgrounds-handoff.md` — **D3-F2** (git-ignored, stale `dist`),
  re-measured here as **A4-F1**; **D3-F10** (no size ceiling), extended in §7.3.
- `docs/adr/` ADR-19 — the five-layer styling contract; §2.2 is the argument that
  it *is* the distribution decision.

---

## 13. Findings

| # | Finding | Severity |
|---|---|---|
| **A4-F1** | `packages/core/dist` — the only thing `@dzup-ui/core` publishes — is git-ignored (`.gitignore:9`), zero tracked `dist/` files repo-wide, 5.7 MB on disk, newest artifact **2026-08-25T09:24Z**: 8 days and one full N2-S1 rollout stale, with no gate able to see it. Re-measures **D3-F2** at `51dec93`. `CLAUDE.md`'s ADR-12 ("committed dist artifacts") describes something the repository does not do. | 🟠 |
| **A4-F2** | **There is no `validate:registry`.** 282 committed `/r/**` artifacts have no freshness gate, while `llms`, `docs-pages`, `component-meta`, `readme-facts` and `tokens:dtcg` all do — and `build-registry.ts` already implements the required read-only check mode for the two files beside them. Measured drift: `/r/registry.json` mtime **precedes HEAD's own commit timestamp**. | 🟠 |
| **A4-F3** | **Neither end of the distribution chain resolves.** `dzup-ui.com` → NXDOMAIN; `@dzup-ui/{core,tokens,contracts,mcp}` → npm 404 (all measured 2026-09-02, with a passing control). 282 committed artifacts name an install URL and two dependencies that do not exist. | 🔴 |
| **A4-F4** | The shipping `registry:theme` item installs **inert under dzup-ui's own dark mode**: the CLI writes 123 dark vars under `.dark`, `data-theme` appears **0 times**, and `@layer` appears **0 times** in the 78,806 B written — so the theme also permanently outranks every ADR-19 library layer. `tokensItem.ts`'s spike note predicted the selector difference; the consequence is larger than "only the activating selector differs". Measured, not inferred (S3/S4). | 🟠 |
| **A4-F5** | A Pro **source** registry is a licensing hazard a Pro npm package is not: Pro is `SEE LICENSE IN LICENSE` with `files: ["dist"]`, and a registry item that writes Pro source hands over 155 components' worth of proprietary source permanently, with no revocation and no runtime check that can reach it. Pro registry items must be **compositions over `@dzup-ui-pro/*`**, never the SFCs. | 🔴 (if C or D is chosen) |
| **A4-F6** | The task brief's premise was two majors stale: **shadcn CLI is 4.20.0**, not 3.0 (measured). `include` + `shadcn registry validate` landed May 2026; **presets** (`encodePreset`/`decodePreset`, `shadcn preset decode\|resolve\|url\|open`, `shadcn apply`) landed April 2026 and are conceptually `ThemeRecipeV1` + `encodeThemeRecipe` arrived at independently — dzup-ui's version is older and has more axes. | 🟢 |

---

## 14. What was verified, and what was not

**Verified externally, fetched 2026-09-02:**

| Claim | Source |
|---|---|
| `registry.json` = `$schema`, `name`, `homepage`, `include`, `items` | `ui.shadcn.com/docs/registry/registry-json` |
| 12 item types (`base, block, component, ui, hook, theme, page, file, style, lib, font, item`); `files[]` = `path`/`type`/`content`/`target`; `target` required for `registry:file` and `registry:page` | `ui.shadcn.com/docs/registry/registry-item-json` + `ui.shadcn.com/schema/registry-item.json` |
| Namespaces: `components.json.registries`, `{name}`/`{style}`, `@ns/item`, `${VAR}` from `process.env` | `ui.shadcn.com/docs/registry/namespace` |
| Auth: `headers` (Bearer / custom) and `params`; `.env.local`; CLI surfaces 401/403/429 and custom server errors | `ui.shadcn.com/docs/registry/authentication` |
| GitHub registries: `<owner>/<repo>/<item>`; public read anonymously, private via `gh auth login` or `GH_TOKEN`/`GITHUB_TOKEN`; fine-grained PAT, read-only Contents; Contents API pinned to commit SHAs; refs `#branch`/`#tag`/`#sha`; **5 MiB/file**; **no GitHub Enterprise**; symlinks inconsistent | `ui.shadcn.com/docs/registry/github` |
| Build/serve: `shadcn build` → `public/r`; `loadRegistry()`/`loadRegistryItem()` for dynamic routes; *"Imports should always use the `@/registry` path"* | `ui.shadcn.com/docs/registry/getting-started` |
| `shadcn/registry`, `shadcn/schema`, `shadcn/preset` are the stable API; *"The CLI commands themselves are not part of the public API"* | `ui.shadcn.com/docs/registry/api-reference` |
| `include` + `shadcn registry validate` (May 2026); presets + `encodePreset`/`decodePreset` (April 2026) | `ui.shadcn.com/docs/changelog/*` |
| MCP server discovers registries from `components.json`; supports third-party and private registries | `ui.shadcn.com/docs/mcp` |
| **CLI 4.20.0**; subcommands `init\|create, apply, add, diff, docs, view, search\|list, migrate, eject, info, build, mcp, preset, registry`; `registry` has `add`, `validate` | measured — `npx shadcn@latest --version` / `--help` |
| **Real third-party registry:** `magicui.design/r/registry.json` — 247 items (77 `registry:ui`, 168 `registry:example`, 1 `registry:style`, 1 `registry:lib`), no `$schema`, **source form** (`files[].path`, no inline `content`), 16 items carry `cssVars` + `css` | fetched, parsed |
| **Real Vue registry item:** `shadcn-vue.com/r/styles/default/button.json` — `registry:ui`, `dependencies: ["reka-ui"]`, two files with **inline `content`** (`ui/button/Button.vue`, `ui/button/index.ts` with a `cva` recipe) | fetched, parsed |

**UNVERIFIED — do not treat as fact:**

1. **Vue project `init`.** The registry docs say the format *"works with any
   project type and any framework, and is not limited to React"*, but
   `components.json`'s own documentation is React-assuming (`rsc`, `tsx`) and
   names no non-React framework. The spike proved **`add`** works against a
   hand-written `components.json`; it did **not** test `shadcn init` in a real
   Vue/Vite/Nuxt project. **Verify before publishing an install one-liner.**
2. **Registry item versioning.** No version field or update mechanism appears in
   `registry-item.json`, the API reference, or the FAQ. Only GitHub **ref**
   pinning (`#tag`/`#sha`) is documented. §5.7's "no upgrade path" argument rests
   on absence of evidence — strong, but absence.
3. **The `@theme inline` identity mappings.** 354 lines of `--dz-x: var(--dz-x)`
   were written by the CLI (S4). Under Tailwind v4's `inline` semantics they are
   probably harmless; this was **not** built through a real Tailwind pipeline and
   should be before Option B ships.
4. **v0 / Bolt / Lovable consumption.** The task's premise that these builders
   consume `registry.json` is repeated here as *premise*, not as verified fact —
   only shadcn's own "Open in v0" handoff is documented, and no third-party
   builder's ingestion behaviour was tested.
5. **`shadcn registry validate` against `/r/**`.** Not run: the command validates
   **source** registries (`registry.json` + on-disk file paths), and this repo
   emits **built** items with inlined `content`, which is a different input shape.
   S1's `✔ Checking registry` is the schema evidence instead.

---

## 15. Standing statements this document makes

1. **dzup-ui is not copy-source-styled, and must not become so.** ADR-19 already
   grants consumers everything copying would grant, without severing the gates.
2. **The registry is not new work.** It is 282 committed artifacts, three
   generators, four Vitest guards and 7 of 9 MCP tools, waiting on publication.
3. **Nothing in this study is release evidence.** Every number is bound to
   `51dec93` on a worktree with 269 uncommitted entries. It is *locally
   qualified*, which per README §3 is never CI, release, or production evidence.
4. **Nothing was published, registered, deployed, committed, pushed, dispatched,
   or exposed.** The spike wrote only to the scratchpad; the only repository
   writes are this file and one cross-link line (§12).
