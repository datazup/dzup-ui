# dzup-ui — Free-Tier Apps Audit & Remediation Plan (`apps/landing` + `apps/storybook`)

> **Status:** Specification. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Audit date:** 2026-07-14 · **Commit:** `be20f40` (branch `main`)
> **Scope:** the two public-facing free-tier apps — `apps/storybook` (the component docs)
> and `apps/landing` (the marketing front door, which mounts the Storybook under
> `/storybook/`). Component code in `packages/core` is in scope **only** where an app
> gate proves it broken (TASK-FREE-01 is exactly that case).
>
> **Method:** every gate command was executed on this checkout. Failing commands were
> re-run in isolation to isolate root causes, and both app source trees were swept for
> stale claims, dead code, missing gates, and unfinished work. Every claim below carries
> a `file:line` or a command output. Nothing here is inferred from documentation.
>
> **The through-line:** the same disease the design review named — **claims that outrun
> enforcement** — but in its terminal form. In `packages/core` the gates exist and were
> never pulled. In the two apps, *the gates do not cover the apps at all*: `yarn lint`
> lints `packages/` only, `yarn typecheck:all` enumerates `packages/*` tsconfigs only,
> and coverage thresholds `include` only `packages/*/src`. Three of the four things that
> could have caught the P0s below are validators that exist and are wired to nothing.
> The result is a shop window whose front door does not build, whose headline number is
> wrong by 66, and whose primary call-to-action 404s in production.
>
> **Relationship to other docs:** [`design-tasks.md`](./design-tasks.md) (TASK-DS-*) covers
> the core design system; [`new-features.md`](./new-features.md) (TASK-NF-*) covers app
> *features*; [`tasks.md`](./tasks.md) (TASK-0.*/TASK-X.*) covers the Storybook Sprint-0
> machinery. **This doc covers what is still broken or missing after all three.** Where a
> task here completes something one of those began, it says so.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
> **Priority:** 🔴 P0 (broken gates & shipped-broken artifacts) · 🟠 P1 (false claims, unenforced gates, UX holes) · 🟢 P2 (coverage & polish)
> **Numbering:** `TASK-FREE-*`, distinct from `TASK-DS-*`, `TASK-NF-*`, `TASK-APP-*`, `TASK-0.*`, `TASK-X.*`.

---

## Gate status, measured on this checkout

| Gate | Result | Detail |
|---|---|---|
| `yarn workspace @dzup-ui/storybook build` | ❌ **exits 1** | Dies in `build:playground` → `ENOENT … packages/core/dist/core.css`. The `&&` chain aborts, so `storybook build` **never runs**. See TASK-FREE-01. |
| CI job `storybook` | ❌ **structurally broken** | `ci.yml:227-230` builds only `@dzup-ui/tokens`, then calls `yarn storybook:build`. `packages/core` is never built and its `dist/` is not committed (`git ls-files packages/core/dist` → **0**). Same failure as above, on every run. |
| CI job `chromatic` | ❌ broken, **masked** | `chromatic.yml:48-65` runs `buildScriptName: build` with *neither* a tokens nor a core build. Hidden by `continue-on-error: true` (`chromatic.yml:28`). |
| `yarn workspace @dzup-ui/landing build` | ⚠️ **green but ships broken** | Succeeds, and **silently omits `dist/storybook/`** when `apps/storybook/storybook-static` is absent — which on a clean clone it always is (gitignored, `.gitignore:10`). `serve-storybook.ts:113` `closeBundle()` returns early with no warning. Every "Browse components" CTA 404s. See TASK-FREE-02. |
| `vue-tsc -p apps/landing/tsconfig.json` | ❌ **7 errors** | 5 × `TS2322` (4 × `DzText as="h4"` — not a valid `TextElement`; 1 × `unknown`→`boolean`), 1 × `TS2532`/`TS2345` in `serve-storybook.ts:61-62`, 1 × `TS6133`. **Not run by any gate, in CI or locally.** |
| `eslint apps/` | ❌ **~4,200 problems / 403 files** | 1,625 errors + 2,601 warnings across the two apps' source. **97% auto-fixable.** `yarn lint` = `eslint packages/` (`package.json:16`) — `apps/` has *never* been linted. A further 99,588 problems come from one generated artifact that is not eslint-ignored. |
| `yarn test` (incl. `apps/*/src`) | ✅ **1,657 pass / 22 files** | The landing block-a11y suite is real and green. `vitest.config.ts:25` does include `apps/*/src/**/*.spec.ts`. |
| Coverage threshold (80%) | ⚠️ **does not apply to apps** | `vitest.config.ts:34` — `coverage.include: ['packages/*/src/**']`. Both apps contribute nothing and are held to no bar. |
| `yarn validate:exports` | ✅ pass — **and wrong** | Reports "0 errors" while `packages/core/package.json:23` exports `"./styles": "./dist/core.css"`, a file no build emits. The validator has a blind spot for non-JS export targets. This is *why* TASK-FREE-01 shipped. |
| Storybook a11y gate | ⚠️ **1 of 11 families** | `preview.ts:89` sets `a11y.test: 'todo'` (report-only) globally. `a11yError` is spread by exactly **4 files, all in `cards`** — 172 of 176 story files are unenforced. Documented backlog: **220 failing stories**. |
| Landing hero visual snapshot | ⚠️ never runs in CI | Baselines are `…-chromium-win32.png` only; CI is `ubuntu-latest` and `ci.yml:375` greps for `"renders real pixels"`, skipping the screenshot assertions. |

---

## The three shipped-broken artifacts, root-caused

### 1. `@dzup-ui/core/styles` points at a file that no build produces

This is the deepest defect found, and it explains two red CI jobs and a broken published package at once.

| Evidence | |
|---|---|
| `packages/core/package.json:23` | `"./styles": "./dist/core.css"` — a **published subpath export** |
| `README.md:52` | `@import "@dzup-ui/core/styles";` — the documented install step |
| `packages/core/src/index.ts` | **does not import** `src/styles/base.css` (grep for `css` → no hits) |
| `packages/core/vite.config.ts` | no `cssFileName`, no CSS entry |
| `find packages/core/dist -name '*.css'` | **0 files** — after a successful `yarn build` |

So `dist/core.css` **can never be emitted**. Three things consume it:

1. `apps/storybook/scripts/build-playground.mjs:85` `copyFile(…/core.css)` → **ENOENT → `yarn storybook:build` exits 1** → the `storybook` and `chromatic` CI jobs cannot pass.
2. `packages/core/package.json` ships the broken export to npm — a consumer running the README's own instruction gets a module-resolution error.
3. `README.md` documents it.

It has stayed invisible because **every app masks it with a Vite alias** to the source file (`apps/landing/vite.config.ts:17`, `apps/sandbox/vite.config.ts:16`), and `yarn validate:exports` does not check non-JS export targets.

### 2. The landing production build silently ships without the Storybook

`apps/landing/vite/serve-storybook.ts:113-119`:

```ts
closeBundle() {
  // Self-contained production output: dist/storybook/**.
  if (!existsSync(staticDir)) return   // ← silent no-op
  cpSync(staticDir, resolve(__dirname, '../dist/storybook'), { recursive: true })
}
```

`staticDir` = `apps/storybook/storybook-static`, which is **gitignored** (`.gitignore:10`) and therefore absent on any clean clone or CI runner. The dev/preview path *does* warn (`:91`); the **build path does not**. The CI `landing-perf` job (`ci.yml:376-378`) builds the landing without ever building the Storybook.

Consequence: `dist/` contains no `storybook/`, and every one of these resolves to a 404 —
`LINKS.components`, `LINKS.gettingStarted`, `LINKS.theming`, `LINKS.designTokens`,
`LINKS.accessibility`, `LINKS.contributing`, `componentDocs()` (every "Built with" badge on
every template page), and all 139 entries of the ⌘K component palette (`config.ts:98-125`).

The file's own header comment says it "keep[s] using that committed artifact (ADR-12)" —
**the artifact is not committed.** The comment is the bug.

### 3. The "Try it now" REPL requests a stylesheet that is never written

`stories/_blocks/playground.config.ts:87` injects `<link rel="stylesheet" href="${base}dzup-core.css">` into the sandbox `<head>`. `build-playground.mjs:72` sets `cssFileName: 'dzup-core'`, but the script's own success log (`:86`) says it writes *"dzup-core.mjs + tokens.css + core.css"* — no `dzup-core.css`, and `ls public/playground/` confirms it: `dzup-core.mjs`, `tokens.css`. The REPL 404s on every load.

`scripts/verify-repl.mjs` exists precisely to catch this — it drives Playwright against the built Storybook and asserts the REPL compiles a live `DzButton`. It is **wired to nothing**: not in `package.json` scripts, not in any workflow.

---

## Claims that are not true

The library's own discipline is stated in `apps/landing/src/config.ts:126-133`: *"Hand-maintained
counts drift — this one used to read 147 while the real figure was 139. Never replace it with a
literal."* `FACTS.freeComponents` obeys it. **Nine other places do not.**

| Claim | Where | Reality |
|---|---|---|
| "147 components" | `index.html:10`, `:20`, `:26`, `:44` (JSON-LD), `data.ts:44` (home feature grid), `compare.ts:77` | `COMPONENTS.length` = **139** |
| Family counts summing to 147 | `data.ts:20-32` | The 11 numbers sum to **167** |
| "163 Vue 3 component files" | `Introduction.mdx:9` + the 11-row table at `:43-53` | **205**. 10 of 11 rows are wrong (Data 22→31, Forms 22→31, Layout 16→21, Media 10→14, …). `ComponentStatus.mdx:72` says 205 — **the two docs pages contradict each other**, and `DESIGN.md` (generated, authoritative) says 205. |
| "41 enterprise components across 8 families" | `ProPage.vue:21-30`, `config.ts:137-138` | `PRO_COMPONENTS` (`data.ts:147-161`) has **13** entries across **7** families |
| "90+ copy-paste Vue blocks" | `config.ts:206` (the site-wide announcement bar) | **87** |
| "59 effects · 11 categories" | `data.ts:113` | **60** effects. `gallery/catalog.ts:70` separately says "nine categories" above an array of 11. |
| "across all 175 story files" | `Accessibility.mdx:46` | **176** |
| `story-status.ts` "holds the line… so a component can never quietly drop off the roadmap" | `ComponentStatus.mdx:79-81`, `:112-113` | The validator exists (`packages/tooling/src/validators/story-status.ts`, with a spec). `grep -rn "story-status" package.json .github/` → **0 hits.** It runs in no script and no CI job. |
| `@dzup-ui/core/styles` | `README.md:52` | Never emitted (see above) |

Credit where it is due: `TESTIMONIALS` is **deliberately empty** (`config.ts:178`) with a comment
explaining that fabricating social proof is not acceptable, and `useLiveStats` degrades unpublished
star/download counts to **null** rather than inventing them (`generated/liveStats.ts:23-26`). The
honesty discipline is real; it just isn't *enforced*, so every hand-typed number drifted.

---

## How these tasks are written

Each task is a **ready-to-run prompt** for a coding agent, authored per Anthropic's
prompt-engineering guidance:
[be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct),
[use XML tags](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/use-xml-tags),
[give Claude a role](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts),
[let Claude think](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/chain-of-thought),
and [multishot examples](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/multishot-prompting).

Every block carries a `<role>`, a one-sentence `<task>`, the `<motivation>` an agent cannot infer,
named `<requirements>` sub-tags each of which is a checkable constraint, ordered `<steps>`, an
`<example>` where prose would be ambiguous, and `<success_criteria>` that is the definition of done.
Instructions are phrased as **what to do**, not what to avoid. Copy a block verbatim into an agent.

```xml
<repo_conventions source="CLAUDE.md + ADR-04/12/15/17 + measured on commit be20f40 — authoritative">
  <apps>
    apps/landing — Vite 6 + Vue 3 + vue-router SPA (port 3001, strictPort). 12 routes + a catch-all.
      src/pages/ (12), src/components/ (21 + blocks/ + themes/), src/blocks/ (87 .vue across 12 categories),
      src/templates/ (44 dirs), src/motion/ (32 components + 5 directives + 7 composables),
      src/gallery/ (60 effect demos), src/composables/ (9), src/lib/, src/data.ts, src/data/compare.ts.
      Static facts in src/config.ts. GENERATED (never hand-edit): src/generated/components.ts (139 rows,
      from scripts/build-component-index.ts), src/generated/liveStats.ts, public/r/**, public/llms*.txt,
      public/sitemap.xml, public/robots.txt.
      Build = build:registry && build:animations-registry && build:component-index && build:stats
      && build:sitemap && vite build. NOTE: `vite build` runs NO vue-tsc — a green build does not
      mean clean types. Typecheck it explicitly with `vue-tsc -p apps/landing/tsconfig.json`.
    apps/storybook — Storybook 10 (@storybook/vue3-vite). Config in .storybook/{main,manager,preview}.ts.
      Addons: addon-docs, addon-a11y, addon-themes, addon-vitest, addon-designs (registered but used by
      ZERO stories). 176 story files in packages/core/stories/{family}/; shared helpers in stories/_shared/;
      21 MDX guides in apps/storybook/stories/; doc blocks in stories/_blocks/.
      Build = build:releases && build:playground && build:llms && storybook build (an && chain: any
      script failing aborts the Storybook build entirely).
    apps/sandbox — LEGACY. Last touched 2026-06-09, not in CI, superseded by Storybook per docs/tasks.md.
      Still gated by `yarn validate:sandbox-parity`. Do not add to it. See TASK-FREE-18.
  </apps>
  <styling>
    Token-only, exactly as core (ADR-04): every CSS value references var(--dz-*). No raw hex/rgb/hsl,
    no hardcoded Tailwind color classes. This applies to STORIES and LANDING code too — they are the
    docs surface and the shop window. `--dz-{intent}` is a fill/border colour, NEVER a text colour; use
    `--dz-{intent}-muted-foreground` for intent-coloured text. Landing may layer its own --lp-* tokens
    on top of --dz-* primitives, but never a parallel colour system.
  </styling>
  <a11y>WCAG 2.2 AA. Keyboard reachable, visible focus rings (--dz-ring), semantic landmarks, one h1
    per route, honour prefers-reduced-motion. Verify light AND dark — Playwright defaults to LIGHT, so a
    dark-only defect hides unless the run sets prefers-color-scheme: dark.</a11y>
  <validation>
    Run these; do not claim a task passes without the relevant one green.
      yarn typecheck                              # packages/core only — SKIPS both apps
      vue-tsc -p apps/landing/tsconfig.json       # the ONLY landing typecheck (7 known errors today)
      yarn lint                                   # eslint packages/ only — SKIPS both apps.
                                                  # `yarn lint` exits 1 on 107 PRE-EXISTING errors in 12
                                                  # files. That is the baseline, not your regression.
      yarn test                                   # vitest; includes apps/*/src/**/*.spec.ts.
                                                  # 1 PRE-EXISTING win32 failure in interaction-contract
                                                  # .spec.ts (backslash vs forward slash) is the green
                                                  # baseline on Windows.
      yarn build                                  # ALL packages. REQUIRED before any storybook build —
                                                  # build:playground reads packages/core/dist.
      yarn storybook:build                        # currently exits 1; TASK-FREE-01 fixes it
      yarn workspace @dzup-ui/landing build       # currently green but silently incomplete; TASK-FREE-02
      yarn workspace @dzup-ui/storybook test-storybook   # play() + axe in real Chromium
      yarn validate:tokens                        # color-lint + DESIGN.md contrast + intent-text contrast
  </validation>
  <scope>Free tier. Never gate a demo, never add a paywall, never introduce a parallel token system.
    Reserve the word "Pro" strictly for the paid tier.</scope>
  <honesty>Never print a number a build step did not derive. If a count appears in prose, it must come
    from a generated module or be asserted by a spec. Never fabricate a testimonial, a logo, a download
    count, or a star count — the repo already refuses to (config.ts:178), and that discipline is a
    feature, not an accident.</honesty>
</repo_conventions>
```

---

# 🔴 P0 — Broken gates and shipped-broken artifacts

These four ship today. Two CI jobs cannot pass; the production landing build omits its own
primary destination; the docs' flagship interactive feature 404s.

---

## [x] TASK-FREE-01 — Emit `dist/core.css`, unbreak the Storybook build, and close the validator blind spot

```xml
<role>
You are a build engineer for a Vue 3 component library published to npm. You treat a package's
`exports` map as a contract with consumers: every declared target must exist in the tarball. You
know that a validator that passes while the artifact is missing is worse than no validator, because
it converts a loud failure into a silent one.
</role>

<task>
Make `packages/core` actually emit `dist/core.css`, so that `@dzup-ui/core/styles` resolves, the
Storybook build stops failing, and the Chromatic job can run — then extend `validate:exports` so a
non-JS export target can never again point at a file the build does not produce.
</task>

<motivation>
`packages/core/package.json:23` declares `"./styles": "./dist/core.css"`. `README.md:52` tells every
consumer to `@import "@dzup-ui/core/styles"`. Neither works: `packages/core/src/index.ts` never
imports `src/styles/base.css`, `packages/core/vite.config.ts` sets no `cssFileName`, and
`find packages/core/dist -name '*.css'` returns **zero files** after a successful `yarn build`.

The blast radius is larger than one broken import:

  • `apps/storybook/scripts/build-playground.mjs:85` copies that file. It ENOENTs, the script sets
    `process.exitCode = 1`, and the `&&` chain in `apps/storybook/package.json:16` aborts — so
    `storybook build` NEVER RUNS. `yarn storybook:build` exits 1 on any checkout.
  • CI job `storybook` (`ci.yml:227-230`) builds only `@dzup-ui/tokens` and then calls
    `yarn storybook:build`. `packages/core/dist` is not committed (`git ls-files` → 0). The job
    is structurally red on every single run.
  • CI job `chromatic` (`chromatic.yml:48-65`) builds nothing at all before `buildScriptName: build`.
    It is red too, and `continue-on-error: true` (`:28`) has been hiding it.
  • A real npm consumer following the README gets a module-resolution error.

It stayed invisible because every app in this repo masks it with a Vite alias to the SOURCE file
(`apps/landing/vite.config.ts:17`, `apps/sandbox/vite.config.ts:16`) — so it works in dev and in
the landing build, and only breaks for the two consumers that use the real dist: the Storybook
playground, and anyone who installs the package.

And `yarn validate:exports` reports "0 errors" while all of this is true, because it only checks
JS/DTS targets. Fixing the CSS without fixing the validator leaves the trap armed for the next
non-JS export someone adds.
</motivation>

<requirements>
  <emit>`yarn workspace @dzup-ui/core build` must produce `packages/core/dist/core.css`, containing
    the contents of `packages/core/src/styles/base.css`. Choose the mechanism deliberately and say
    which you chose and why: either (a) import `./styles/base.css` from `src/index.ts` and pin the
    emitted name with `build.lib.cssFileName: 'core'`, or (b) add an explicit CSS build step/entry.
    Option (a) is simpler but makes the CSS a side effect of importing the JS entry — check
    `sideEffects` in `packages/core/package.json` still correctly lists `"*.css"` so tree-shaking is
    not broken for consumers who do NOT want the base layer.</emit>
  <no_regression>The ESM-only guarantee (ADR-11) must hold: `find packages/core/dist -name "*.cjs"`
    stays empty. The per-family subpath exports (`./buttons`, `./cards`, …) must still resolve —
    verify `dist/components/<family>/index.js` still exists for all 11 families after your change.</no_regression>
  <playground>After the fix, `yarn build && yarn storybook:build` must exit 0 and
    `apps/storybook/public/playground/core.css` must exist and be non-empty.</playground>
  <ci_ordering>The `storybook` job (`ci.yml:227-230`) and the `chromatic` job (`chromatic.yml:48-65`)
    must each build the packages they depend on before building the Storybook. Add a `yarn build`
    step (or at minimum tokens + core) to both. Do NOT rely on committed dist artifacts — they are
    gitignored.</ci_ordering>
  <validator>Extend `packages/tooling/scripts/validate-exports.ts` so that EVERY export target,
    including plain-string targets like `"./styles": "./dist/core.css"` and any `.css`/`.json`
    target, is asserted to exist on disk after a build. It must FAIL on today's tree (before your
    emit fix) and PASS after. Add a unit spec covering the string-target case.</validator>
  <chromatic>Remove `continue-on-error: true` from `chromatic.yml:28` ONLY IF the job is green after
    your fix and the first baseline is accepted. If baselines are not yet accepted, leave it and say
    so explicitly in your summary — do not silently leave a red job masked.</chromatic>
  <docs>`README.md:52` must remain correct after the change. If you rename the emitted file, update
    the export map, the README, and `build-playground.mjs` together.</docs>
</requirements>

<steps>
  1. Reproduce, and record the exact failure: run `yarn build`, then
     `find packages/core/dist -name "*.css"` (expect 0 results), then `yarn storybook:build`
     (expect exit 1 with ENOENT on `core.css`). Paste both outputs into your working notes.
  2. Read `packages/core/vite.config.ts` and `packages/core/src/index.ts`. Decide between mechanism
     (a) and (b) above and write down the trade-off you are accepting.
  3. Implement the emit. Rebuild. Confirm `packages/core/dist/core.css` exists and its contents match
     `src/styles/base.css`.
  4. Run `yarn storybook:build`. Confirm exit 0 and that `public/playground/core.css` is written.
  5. Extend `validate-exports.ts` to check string and non-JS targets. Confirm it would have caught
     this: `git stash` your emit fix, run the validator, see it FAIL; unstash, see it PASS.
  6. Add the missing build steps to the `storybook` and `chromatic` CI jobs.
  7. Run the full gate list from `<repo_conventions><validation>`.
  8. Add a changeset (patch) describing the fixed `./styles` export — this is a consumer-visible fix.
</steps>

<example name="what the validator must now catch">
  <!-- packages/core/package.json -->
  "./styles": "./dist/core.css"        ← a plain string target, not a {types,import} object.
                                         validate-exports.ts currently walks only the object form,
                                         so this line is never checked. It must be.
  Expected new validator output on the UNFIXED tree:
    ✗ @dzup-ui/core  "./styles" → ./dist/core.css   (file does not exist)
    Export validation failed: 1 error
</example>

<success_criteria>
  - `yarn build` emits a non-empty `packages/core/dist/core.css`.
  - `yarn storybook:build` exits 0 from a clean `packages/*/dist`.
  - `yarn validate:exports` fails on the pre-fix tree and passes on the post-fix tree; a spec covers
    the string-target case.
  - The `storybook` and `chromatic` CI jobs build their package dependencies before building.
  - `find packages/core/dist -name "*.cjs"` is empty; all 11 family subpath exports still resolve.
  - A patch changeset exists.
</success_criteria>
```

---

## [x] TASK-FREE-02 — Make the landing build fail loudly when it cannot ship the Storybook

```xml
<role>
You are a release engineer. Your rule: a build that cannot produce a complete artifact must fail,
never succeed quietly with a hole in it. You are especially suspicious of `if (!exists) return`
inside a build hook.
</role>

<task>
Change `apps/landing`'s production build so it either mounts a real Storybook at `/storybook/` or
fails with a clear error — and wire the CI landing job to build the Storybook first, so the deployed
site's primary call-to-action stops 404ing.
</task>

<motivation>
`apps/landing/vite/serve-storybook.ts:113-119`:

    closeBundle() {
      if (!existsSync(staticDir)) return          // ← silent no-op
      cpSync(staticDir, resolve(__dirname, '../dist/storybook'), { recursive: true })
    }

`staticDir` is `apps/storybook/storybook-static`, which is **gitignored** (`.gitignore:10`) and so
is absent on every clean clone and every CI runner. The dev and preview paths warn when it is
missing (`serve-storybook.ts:91`); the build path returns silently.

CI job `landing-perf` (`ci.yml:376-378`) runs `yarn workspace @dzup-ui/landing build` having built
only the tokens. So the landing `dist/` it produces contains **no `storybook/` directory at all**,
and every one of these links is dead in production:

    LINKS.components  LINKS.gettingStarted  LINKS.theming  LINKS.designTokens
    LINKS.accessibility  LINKS.contributing                        (src/config.ts:98-125)
    componentDocs(name)   — every "Built with" badge on all 44 template detail pages
    all 139 rows of the ⌘K component palette (src/generated/components.ts)

That is the site's entire reason to exist: the landing page is the front door to the free docs, and
the front door opens onto a 404.

The file's own header claims it uses "that committed artifact (ADR-12)". The artifact is NOT
committed. The comment is the bug — fix the comment as well as the code.
</motivation>

<requirements>
  <fail_loud>In `closeBundle()`, a missing `staticDir` must THROW with an actionable message naming
    the exact command to run (`yarn storybook:build`), not return. A production build that cannot
    include the Storybook is a failed build.</fail_loud>
  <escape_hatch>Provide one explicit opt-out for the rare case where the landing is genuinely built
    standalone: an env var such as `LANDING_SKIP_STORYBOOK=1`. When set, log a prominent warning and
    skip. Default (unset) = fail. Document it in `apps/landing/scripts/README.md`.</escape_hatch>
  <ci>The `landing-perf` job (`ci.yml:355-395`) must build tokens → core → storybook → landing, in
    that order, so the artifact it measures is the artifact users would get. This depends on
    TASK-FREE-01; do that first or this job stays red.</ci>
  <smoke>Add a build-output assertion the CI job runs after the landing build: `dist/storybook/index.html`
    exists and is non-empty. A 3-line script or a shell `test -s` step is sufficient — the point is
    that the omission can never again be silent.</smoke>
  <comment>Correct the header comment in `serve-storybook.ts:9-15`. It asserts the storybook-static
    build is committed per ADR-12. It is gitignored. State what is actually true.</comment>
  <types>While in this file, fix the two `vue-tsc` errors it currently produces:
    `serve-storybook.ts:61` (`Object is possibly 'undefined'`) and `:62` (`string | undefined` not
    assignable to `string`) — both from indexing `.split('?')[0]` under `noUncheckedIndexedAccess`.</types>
</requirements>

<steps>
  1. Prove the bug: `rm -rf apps/storybook/storybook-static && yarn workspace @dzup-ui/landing build
     && ls apps/landing/dist/`. Observe a green build with no `storybook/` directory. Record it.
  2. Rewrite `closeBundle()` to throw with an actionable message, gated by the `LANDING_SKIP_STORYBOOK`
     escape hatch.
  3. Fix the two type errors at `:61-62` and the false ADR-12 comment at `:9-15`.
  4. Reorder the `landing-perf` CI job to build tokens → core → storybook → landing, and add the
     `dist/storybook/index.html` existence assertion after the build step.
  5. Verify end to end: from a clean tree, `yarn build && yarn storybook:build &&
     yarn workspace @dzup-ui/landing build`, then confirm `apps/landing/dist/storybook/index.html`
     exists and that `yarn workspace @dzup-ui/landing preview` serves a working `/storybook/`.
  6. Verify the failure path: `rm -rf apps/storybook/storybook-static`, rebuild the landing, and
     confirm it now FAILS with your message.
  7. `vue-tsc -p apps/landing/tsconfig.json` — the two `serve-storybook.ts` errors are gone.
</steps>

<success_criteria>
  - A landing build with no `storybook-static` present FAILS, naming `yarn storybook:build`.
  - `LANDING_SKIP_STORYBOOK=1` skips it with a loud warning.
  - After a full build, `apps/landing/dist/storybook/index.html` exists, and CI asserts it.
  - The `landing-perf` job builds its dependencies in order.
  - `vue-tsc -p apps/landing/tsconfig.json` reports 0 errors in `serve-storybook.ts`.
  - The header comment no longer claims the artifact is committed.
</success_criteria>
```

---

## [x] TASK-FREE-03 — Fix the REPL's 404'd stylesheet and put `verify-repl.mjs` in CI

```xml
<role>
You are a docs-infrastructure engineer. The interactive playground is the single most fragile thing
in this Storybook — custom `compiler-sfc` resolution, an import map, a CDN Tailwind build, and a
MutationObserver theme bridge — and you believe fragile things must be verified by a machine on
every push, not by a human remembering to look.
</role>

<task>
Make the embedded `@vue/repl` playground load every stylesheet it references, and wire the existing
`scripts/verify-repl.mjs` into CI so a broken playground fails the build.
</task>

<motivation>
`apps/storybook/stories/_blocks/playground.config.ts:85-87` injects three stylesheets into the REPL
sandbox `<head>`:

    <link rel="stylesheet" href="${base}tokens.css">
    <link rel="stylesheet" href="${base}core.css">
    <link rel="stylesheet" href="${base}dzup-core.css">     ← never written

`build-playground.mjs:72` sets `cssFileName: 'dzup-core'`, but the script's own success log at `:86`
says it writes *"dzup-core.mjs + tokens.css + core.css"* — and `ls apps/storybook/public/playground/`
confirms exactly that. `dzup-core.css` does not exist, so the "Try it now" editor on
`GettingStarted.mdx:22` — the first interactive thing a new user touches — requests a 404 on every
load. (Once TASK-FREE-01 lands, `core.css` will at least resolve; `dzup-core.css` still will not.)

`scripts/verify-repl.mjs` was written to catch precisely this: it serves `storybook-static/`, drives
Playwright, and asserts the REPL compiles a live `DzButton`. Its own header says *"One-off
verification (not wired into CI)"*. `grep -rn "verify-repl" package.json .github/` → **0 hits.** The
check exists and has never run. `validate-llms.mjs` is orphaned the same way.
</motivation>

<requirements>
  <resolve>Decide whether `dzup-core.css` should exist or the link should go. Determine empirically
    whether the core lib build emits ANY component CSS (it may not — core styles via `tv()` +
    Tailwind, so there may be no scoped SFC CSS to emit at all). If it emits nothing, DELETE the
    `dzup-core.css` link line and the `cssFileName` option, and say so. If it does emit styles, make
    the filename and the link agree. Do not leave a link to a file that is not written.</resolve>
  <verify>Wire `verify-repl.mjs` into `package.json` as a `verify:repl` script and into the
    `storybook` CI job, running against the freshly built `storybook-static`. It must FAIL the job if
    the REPL does not render a live component.</verify>
  <llms>Wire `validate-llms.mjs` into `package.json` as `validate:llms` and into the `storybook` CI
    job, right after `build:llms`. It validates the generated llms.txt structure (balanced fences,
    non-ragged tables) and is currently orphaned.</llms>
  <no_404>After the fix, loading the Storybook and opening the Getting Started playground must produce
    ZERO 404s in the network log. Assert this in `verify-repl.mjs` if it does not already: fail on any
    failed request originating from the sandbox iframe.</no_404>
</requirements>

<steps>
  1. Land TASK-FREE-01 first (`core.css` must resolve before you can judge what else is missing).
  2. Run `yarn workspace @dzup-ui/storybook build:playground` and list `public/playground/`. Record
     exactly which files are produced.
  3. Decide the `dzup-core.css` question on that evidence and implement it in BOTH
     `playground.config.ts` and `build-playground.mjs` so the two agree.
  4. Add `verify:repl` and `validate:llms` scripts; run them locally against a built Storybook.
  5. Extend `verify-repl.mjs` to fail on any 404 from the sandbox iframe.
  6. Add both to the `storybook` CI job after the build step.
  7. Confirm the job fails if you deliberately break the stylesheet link, then revert.
</steps>

<success_criteria>
  - Opening the Getting Started REPL produces no 404s; the component renders fully styled in light
    and dark.
  - `yarn workspace @dzup-ui/storybook verify:repl` exists, passes, and runs in CI.
  - `yarn workspace @dzup-ui/storybook validate:llms` exists, passes, and runs in CI.
  - Deliberately removing a stylesheet link makes the CI job fail.
</success_criteria>
```

---

## [x] TASK-FREE-04 — Derive every published count, and add the spec that stops the drift

```xml
<role>
You are an engineer who treats a number printed in a user-facing page exactly like a number printed
in an invoice: it must be derived from a source of truth, and a test must fail if it drifts. You have
read `apps/landing/src/config.ts:126-133`, where this repo already wrote that rule for itself — and
you are here because nine other places ignored it.
</role>

<task>
Replace every hand-typed component/block/effect/template count in both apps with a derived value, and
add one spec that fails the build if any published claim disagrees with its generated source.
</task>

<motivation>
`FACTS.freeComponents` (`config.ts:136`) is correctly derived from `COMPONENTS.length` = **139**, and
its comment warns: *"Hand-maintained counts drift — this one used to read 147 while the real figure
was 139. Never replace it with a literal."*

Every other count in both apps is a literal, and they are all wrong:

  • "147 components"  → index.html:10, :20, :26, :44 (JSON-LD), src/data.ts:44 (the home feature
                        grid — a headline card), src/data/compare.ts:77.  Real: 139.
  • src/data.ts:20-32 — the 11 per-family numbers sum to 167. They match neither 147 nor 139 nor 205.
  • "90+ blocks"      → src/config.ts:206, the site-wide announcement bar.  Real: 87.
  • "59 effects · 11 categories" → src/data.ts:113.  Real: 60 effects.
    src/gallery/catalog.ts:70 separately says "nine categories" above an array of 11.
  • "41 components across 8 families" → src/pages/ProPage.vue:21-30 + config.ts:137-138, rendered
    directly above a list of 13 components across 7 families (src/data.ts:147-161).
  • Introduction.mdx:9 + the table at :43-53 → "163 Vue 3 component files"; 10 of the 11 rows are
    wrong (Data 22→31, Forms 22→31, Layout 16→21, Media 10→14, Navigation 19→23, Feedback 17→20,
    Typography 5→8, Buttons 8→10, Inputs 7→8, Overlays 31→33). Real total: 205 — which is what
    ComponentStatus.mdx:72 and the GENERATED DESIGN.md both say. Two docs pages contradict each other.
  • Accessibility.mdx:46 — "across all 175 story files". Real: 176.

This is not cosmetic. "147 components" is in the `<meta name="description">`, the OpenGraph card, and
the JSON-LD `SoftwareApplication` block — it is the number Google, X, LinkedIn and every AI crawler
will quote about this library. And the Pro page promises 41 components over a list of 13, which is
the kind of gap a prospective customer notices.

CLAUDE.md already states the counting rule: the count is glob-derived by
`packages/tokens/src/design-md.ts` at generate time and feeds DESIGN.md; every exported `.vue`
counts, including compound sub-parts. Nothing else consumes that.
</motivation>

<requirements>
  <single_source>Every count rendered to a user must read from a generated module, not a literal.
    Extend the existing generators rather than inventing a new one:
      - components (205 catalog / 139 documented) — `packages/tokens/src/design-md.ts` already
        derives the catalog count; `apps/landing/scripts/build-component-index.ts` already derives the
        documented count. Expose BOTH, and the per-family breakdown, from a generated module.
      - blocks (87) — `apps/landing/src/blocks/registry.ts` (`BLOCKS.length`).
      - effects (60) + categories (11) — `apps/landing/src/gallery/catalog.ts` (`CATALOG.length`,
        `CATEGORIES.length`).
      - templates (44) — `apps/landing/src/templates/registry.ts`.
      - pro components (13) + pro families (7) — `apps/landing/src/data.ts` (`PRO_COMPONENTS`).
    State clearly, wherever both appear, which number is the CATALOG size (205, every exported .vue)
    and which is the DOCUMENTED size (139, components with their own Storybook page). DESIGN.md
    already publishes both with the rule stated; mirror its wording, do not invent a third rule.</single_source>
  <static_html>`index.html` is static and cannot import TS. Generate its head at build time: extend
    an existing landing build script (or add a small one to the `build` chain) that rewrites the
    description / og:description / twitter:description / JSON-LD description from the derived counts.
    A build-time template is acceptable; a hand-edited literal is not.</static_html>
  <mdx>`Introduction.mdx`'s family table must be generated, not typed. Feed it from the same generated
    module (a `_data/` module in `apps/storybook/stories/` following the existing
    `_data/componentStatus.ts` and `_data/releases.generated.ts` pattern). Fix
    `Accessibility.mdx:46` (175 → derived).</mdx>
  <pro_page>`ProPage.vue` must render `PRO_COMPONENTS.length` and the count of distinct families in
    it. If the 41/8 figures are a genuine roadmap target rather than a present-tense claim, then say
    so in words the copy cannot be misread — e.g. "13 shipped, 41 planned across 8 families" — and
    derive the 13 and the 7. Do not print a forward-looking number in the present tense.</pro_page>
  <spec>Add `apps/landing/src/claims.spec.ts` (and a Storybook-side equivalent, or extend the landing
    one to read the MDX) that FAILS if any published claim disagrees with its generated source. It
    must assert against the actual rendered strings — read `index.html`, `data.ts`, `config.ts`,
    `compare.ts`, and `Introduction.mdx` from disk and check the numbers in them. A spec that only
    compares two constants to each other proves nothing.</spec>
  <catalog_comment>`src/gallery/catalog.ts:70` says "The nine gallery categories" above an 11-element
    array. Fix the comment. Also remove the stale planning comment at `catalog.ts:12` ("Tasks 3–9 fill
    in the remaining ~30 effects") — they were filled in.</catalog_comment>
</requirements>

<steps>
  1. Inventory: grep both apps for `147`, `163`, `90+`, `59 effects`, `41`, `175`, and every
     per-family digit in `data.ts:22-32` and `Introduction.mdx:43-53`. Write the list down; you will
     verify each one is gone at the end.
  2. Establish the derived values by running the generators and printing: catalog components,
     documented components, per-family counts, blocks, effects, categories, templates, pro components,
     pro families, story files. Record all ten numbers.
  3. Extend the generated modules to expose them.
  4. Replace every literal, starting with the four in `index.html` (build-time generated).
  5. Regenerate the `Introduction.mdx` family table from data.
  6. Rewrite the Pro page copy so its numbers are derived and its tense is honest.
  7. Write `claims.spec.ts`. Prove it works: temporarily change one number back to `147` and watch it
     fail; revert.
  8. Run `yarn test`, `vue-tsc -p apps/landing/tsconfig.json`, `yarn storybook:build`, and
     `yarn workspace @dzup-ui/landing build`.
</steps>

<example name="the spec must read the real artifacts, not two constants">
  // apps/landing/src/claims.spec.ts
  import { readFileSync } from 'node:fs'
  import { COMPONENTS } from './generated/components.ts'
  import { BLOCKS } from './blocks/registry.ts'

  it('index.html never states a component count that is not the derived one', () => {
    const html = readFileSync('apps/landing/index.html', 'utf8')
    const claimed = [...html.matchAll(/(\d+)\s+accessible, open-source Vue 3 components/g)]
    expect(claimed.length).toBeGreaterThan(0)            // the claim must still be there…
    for (const [, n] of claimed)
      expect(Number(n)).toBe(COMPONENTS.length)          // …and it must be right.
  })

  it('the announcement bar block count matches the registry', () => {
    expect(ANNOUNCEMENT?.message).toContain(String(BLOCKS.length))
  })
</example>

<success_criteria>
  - `grep -rn "147\|163 Vue\|90+ copy-paste\|59 effects" apps/` returns no user-facing hits.
  - Every count in both apps traces to a generated module.
  - `Introduction.mdx`'s table is generated and its total equals `DESIGN.md`'s 205.
  - The Pro page's numbers match `PRO_COMPONENTS`, and any roadmap figure is marked as such.
  - `claims.spec.ts` exists, passes, and demonstrably fails when a literal is reintroduced.
  - All app builds and typechecks green.
</success_criteria>
```

---

## [x] TASK-FREE-05 — Put both apps under `lint` and `typecheck`

```xml
<role>
You are a build engineer restoring a quality gate that was never wired up. You understand that
turning on a linter over 400 unlinted files is a two-commit job — a mechanical autofix commit, then
a small human-judgement commit — and that mixing them makes the diff unreviewable.
</role>

<task>
Bring `apps/landing` and `apps/storybook` under `yarn lint` and `yarn typecheck`, fixing the 7 real
type errors and the ~4,200 lint problems, and make CI enforce both.
</task>

<motivation>
Neither app has ever been linted or typechecked:

  • `package.json:16` — `"lint": "eslint packages/"`. `apps/` is not in the glob.
  • `package.json:15` — `"typecheck:all"` enumerates only `packages/*` tsconfigs. `apps/landing/
    tsconfig.json` is never checked, in CI or locally, and the landing `vite build` runs no `vue-tsc`,
    so a green build says nothing about types.
  • `apps/storybook/.storybook/main.ts:101-103` — `typescript: { check: false }`. Stories are never
    typechecked either.
  • Neither `apps/landing/package.json` nor `apps/storybook/package.json` has a `lint` or `typecheck`
    script at all.

Measured today: `vue-tsc -p apps/landing/tsconfig.json` → **7 errors**, and `eslint apps/` → **1,625
errors + 2,601 warnings across 403 files**, of which **97% are auto-fixable** (indent, quotes,
comma-dangle, semi — i.e. the file was simply never run through the formatter).

Four of the seven type errors are the SAME real bug — `DzText` given `as="h4"`, which is not a valid
`TextElement` (`SettingsLayout.vue:79,108,154`, `TableCard.vue:98`). These are shipped blocks that
users copy-paste. The fix is `DzHeading`, not a cast.

A further **99,588** lint problems come from one file — `apps/storybook/public/playground/dzup-core.mjs`,
a generated Vite lib bundle that is not eslint-ignored. Ignoring it is a prerequisite for the rest of
this task being reviewable at all.
</motivation>

<requirements>
  <ignore_generated>Add to `eslint.config.js` `ignores` (`eslint.config.js:29-36`) every generated
    artifact in both apps, so the linter only ever sees hand-written code:
      apps/storybook/public/playground/**   apps/storybook/stories/_data/releases.generated.ts
      apps/landing/public/r/**              apps/landing/src/generated/**
      apps/landing/public/llms*.txt         apps/*/dist/**   apps/*/storybook-static/**
    Verify: `eslint apps/` must report roughly 4,200 problems, not 105,000.</ignore_generated>
  <two_commits>Commit 1: `eslint apps/ --fix` ONLY. No hand edits. Commit 2: the remaining ~130
    non-autofixable problems, by hand. Do not mix them — a 4,000-line formatting diff with real fixes
    buried in it cannot be reviewed.</two_commits>
  <real_fixes>The non-autofixable residue is mostly `unused-imports/no-unused-vars`,
    `no-use-before-define`, `regexp/no-super-linear-backtracking` (31 — treat these as real: they are
    ReDoS-shaped), `no-console` (35 — allow in `scripts/`, remove from `src/`), and
    `vue/attribute-hyphenation`. Fix each on its merits. Do NOT add `eslint-disable` to silence one
    unless you write the justification inline, as the repo's existing 13 disables all do.</real_fixes>
  <types>Fix all 7 `vue-tsc` errors:
      - `SettingsLayout.vue:79,108,154` + `TableCard.vue:98` — `DzText as="h4"` is invalid. `DzText`
        caps at non-heading elements; use `DzHeading :level="4"`. These are copy-paste blocks — the
        fix must be the one you would want a user to copy.
      - `AppShell.vue:76` — `unknown` not assignable to `boolean`; narrow it properly, do not cast.
      - `serve-storybook.ts:61-62` — handled by TASK-FREE-02; skip if that landed.
      - `verify-auth.mts:3` — unused `writeFile` import; delete it.</types>
  <scripts>Add `"lint"` and `"typecheck"` scripts to BOTH app package.jsons. Root: change
    `"lint": "eslint packages/"` → `"eslint ."`, and add `vue-tsc --noEmit -p apps/landing/tsconfig.json`
    to `typecheck:all`.</scripts>
  <ci>The `lint` and `typecheck` CI jobs must now cover the apps. They must be GREEN when you are
    done — if you cannot get to zero, do not weaken the rule; finish the work.</ci>
  <baseline>`yarn lint` currently exits 1 on **107 pre-existing errors in 12 files under `packages/`**.
    That is the known baseline (see MEMORY / docs/design-tasks.md). Decide explicitly: either fix
    those 107 as part of this task (preferred — the gate is worthless while it is red) or scope this
    task to `apps/` with a separate `lint:apps` script and file a follow-up. State which you chose.</baseline>
</requirements>

<steps>
  1. Add the generated-artifact ignores. Re-measure: `eslint apps/ --format json` piped through a
     counter. Confirm the count drops from ~105,000 to ~4,200.
  2. Commit 1: `eslint apps/ --fix`. Review the diff is purely mechanical. Commit.
  3. Commit 2: work the remaining problems by hand, rule by rule, smallest first.
  4. Fix the 7 type errors. For the four `DzText as="h4"` cases, verify the replacement renders the
     same visual weight — these are blocks users copy, so the output must still look right. Check the
     block in the browser at `/blocks`, light and dark.
  5. Add the `lint`/`typecheck` scripts to both apps and to the root.
  6. Update `.github/workflows/ci.yml`'s `lint` and `typecheck` jobs.
  7. Resolve the 107-error baseline question and say what you decided.
  8. Confirm: `yarn lint` → 0 errors. `yarn typecheck:all` → 0 errors. `yarn test` → green.
</steps>

<success_criteria>
  - `eslint .` covers both apps, ignores every generated artifact, and exits 0.
  - `vue-tsc -p apps/landing/tsconfig.json` reports 0 errors.
  - `typecheck:all` includes the landing; the CI `lint` and `typecheck` jobs are green.
  - No new `eslint-disable` lacks an inline justification.
  - No `DzText as="h4"` remains anywhere in `src/blocks/`.
  - The formatting commit and the fix commit are separate.
</success_criteria>
```

---

# 🟠 P1 — Unenforced gates, false surfaces, and UX holes

---

## [x] TASK-FREE-06 — Pull the a11y ratchet past Cards, and fix the token that makes it impossible

> **Landed 2026-07-16.** Token fixed at the token (`--dz-warning` 500→400; the
> advertised pair now 5.87:1 in both themes, gate-asserted). Buttons, Overlays and
> Media joined Cards on `a11yError` — 4/11 families enforced, `test-storybook`
> green. Found en route: `a11yDisableRules` was a silent no-op under the global
> `runOnly` tag gate (fixed in `stories/_shared/a11y.ts`), and `stories/_gallery`
> (19 failing stories) had never been counted in any backlog. The ordered
> remainder is tracked as **TASK-DS-13** in `design-tasks.md`;
> `Accessibility.mdx` reports the re-derived 2026-07-16 numbers.

```xml
<role>
You are an accessibility engineer. You know that a report-only a11y check is not a gate — it is a
list of things you have decided to keep shipping. You also know that a contrast failure baked into a
design token cannot be fixed story-by-story, and must be fixed at the token.
</role>

<task>
Fix the `--dz-warning-foreground` contrast defect, then flip the a11y gate from report-only to
enforced for the next family, and land a per-family rollout plan that ends with all 11 enforced.
</task>

<motivation>
`apps/storybook/.storybook/preview.ts:89` sets `a11y: { test: 'todo' }` — report-only — for every
story. Enforcement is opt-in by spreading `a11yError` from `packages/core/stories/_shared/a11y.ts:31`,
and exactly **four files do it, all in `cards`**: `DzCard`, `DzCardParts`, `DzImageCard`,
`DzStatCard`. **172 of 176 story files are unenforced.**

The measured backlog, from the docs' own page (`Accessibility.mdx:52-65`), is **220 failing stories**:

    Forms 82 · Data 39 · Navigation 36 · Inputs 26 · Layout 14 · Feedback 13
    Media 3 · Typography 3 · Compositions 3 · Overlays 1 · Buttons 0 · Cards 0

Buttons is at **zero** and `Accessibility.mdx:54` already calls it "the next family to flip". It has
not flipped.

The dominant failure class is `color-contrast` — **152 of the 220** — and `Accessibility.mdx:112-116`
admits the root cause is a **live token defect**: `--dz-warning-foreground` on `--dz-warning` measures
**3.51:1**, below the 4.5:1 AA threshold, and ships that way. No amount of per-story work fixes that;
it has to be fixed in `packages/tokens`. Until it is, entire families are un-flippable.

Note the related rule already encoded in CLAUDE.md and enforced by `yarn validate:tokens`:
`--dz-{intent}` is a **fill/border** colour and never a text colour — `text-[var(--dz-danger)]` fails
AA on the page background. A large share of the 152 are stories reaching for the intent colour as text
where they should use `--dz-{intent}-muted-foreground`.
</motivation>

<requirements>
  <token_first>Fix `--dz-warning-foreground` in `packages/tokens` so the pair
    `--dz-warning-foreground` on `--dz-warning` meets **4.5:1** in BOTH light and dark. Do not fix it
    by changing `--dz-warning` itself if that breaks its use as a solid fill elsewhere — check
    `--dz-warning-solid` and the existing usages first. Re-run `yarn tokens:generate` and
    `yarn validate:tokens`; the contrast gate that asserts DESIGN.md's advertised pairs must pass.</token_first>
  <flip_buttons>Flip `buttons` to `a11yError` (it audits clean at 0 findings). Then flip `cards`'
    neighbours in ascending backlog order: Overlays (1), Media (3), Typography (3), Compositions (3),
    Feedback (13), Layout (14), Inputs (26), Navigation (36), Data (39), Forms (82).</flip_buttons>
  <this_task_scope>In THIS task, land: the token fix, Buttons enforced, and the next TWO smallest
    families enforced (Overlays, Media). File the remainder as a tracked, ordered follow-up with the
    per-family counts, so the ratchet has a visible finish line. Do not attempt all 220 at once.</this_task_scope>
  <no_blanket_disables>Where a story genuinely cannot pass, disable the ONE specific rule with
    `a11yDisableRules('<rule-id>')` (`_shared/a11y.ts:47` — currently exported and never used) and
    write the justification inline. Never disable the a11y check wholesale for a story.</no_blanket_disables>
  <remove_noop>`packages/core/stories/buttons/DzSplitButton.stories.ts:353` sets
    `a11y: { test: 'todo' }`, which is already the global default — a no-op that will silently
    UNDO the family flip for that file. Remove it (or convert it to a justified single-rule disable
    if it is actually needed).</remove_noop>
  <landing_parity>The landing's own a11y suite (`apps/landing/src/blocks/a11y.spec.ts`) explicitly
    cannot check colour contrast — jsdom has no layout, so axe returns *incomplete*, not *fail*
    (`a11y.spec.ts:17-27`). Note this honestly; do not claim the blocks are contrast-clean. Consider
    whether the Playwright landing run can cover contrast for the blocks, and say what you conclude.</landing_parity>
</requirements>

<steps>
  1. Measure the token defect yourself: compute the contrast of `--dz-warning-foreground` on
     `--dz-warning` in light and dark using the repo's own `packages/tooling/src/token-checks/
     oklch-contrast.ts`. Record both numbers.
  2. Fix the token. Regenerate. Re-measure. Both ≥ 4.5:1.
  3. Run `yarn workspace @dzup-ui/storybook test-storybook` and capture the CURRENT per-family
     violation counts from `a11y-report/`. Do not trust `Accessibility.mdx`'s numbers — re-derive them;
     they may have moved since they were written.
  4. Remove the no-op at `DzSplitButton.stories.ts:353`.
  5. Flip Buttons to `a11yError`. Run the suite. It must be green.
  6. Fix Overlays (1 finding) and Media (3 findings) and flip both.
  7. Update `Accessibility.mdx` with the re-derived counts and the enforced-family list. The page
     must state what is enforced TODAY, not what was planned.
  8. File the ordered remainder with its counts.
</steps>

<success_criteria>
  - `--dz-warning-foreground` on `--dz-warning` ≥ 4.5:1 in light and dark; `yarn validate:tokens` passes.
  - `buttons`, `overlays`, `media` join `cards` on `a11yError`; `test-storybook` is green.
  - The no-op `a11y: { test: 'todo' }` override is gone.
  - `Accessibility.mdx` reports re-derived, current numbers and the true enforced list.
  - A tracked follow-up lists the remaining families in ascending-backlog order with counts.
</success_criteria>
```

---

## [x] TASK-FREE-07 — Actually deploy the free apps

> **⚠ Discrepancy found 2026-07-16 (during TASK-FREE-08–11):** this task is
> checked off, but **no deploy artifact exists on this branch** —
> `.github/workflows/` contains only `ci.yml`, `chromatic.yml`,
> `publish-prerelease.yml`, `release.yml` (no `deploy.yml`, and `git log` shows
> none was ever committed), there is no `netlify.toml`, and `dzup-ui.com` does
> not resolve. Either the deploy work was never committed or it lives outside
> this repo. Until it lands: the prerender decision in TASK-FREE-08, the
> SPA-404 status in TASK-FREE-09 and the `dzup-ui.com` allowlist entry in
> `check-external-links.mjs` all carry explicit "deploy pending" caveats.

```xml
<role>
You are a DevOps engineer. You have just discovered that a product whose entire purpose is to be
looked at has no public URL.
</role>

<task>
Add a deployment for the landing site (with the Storybook mounted under `/storybook/`) so the free
tier has a permanent, public home at the origin the code already claims.
</task>

<motivation>
There is **no deploy anywhere in this repo.** The workflows are `ci.yml`, `chromatic.yml`,
`publish-prerelease.yml`, `release.yml` — the last two publish npm packages. There is no
`netlify.toml`, no `vercel.json`, no `gh-pages` job. The Storybook exists only as a **7-day GitHub
Actions artifact** (`ci.yml:238-243`) and as whatever URL the **non-blocking, currently-failing**
Chromatic job emits.

Meanwhile the code is written as though a deploy exists:

  • `apps/landing/src/config.ts:16` — `SITE_ORIGIN = 'https://dzup-ui.com'`, used to build every
    absolute canonical URL and every JSON-LD `BreadcrumbList` item.
  • `public/sitemap.xml` — 139 absolute URLs under that origin.
  • `public/robots.txt` — points crawlers at that sitemap.
  • `apps/storybook/scripts/build-llms.mjs:26-28` — asserts the generated files "are reachable at
    `/storybook/llms.txt`".
  • The `@dzup-ui/mcp` server reads the site's static `/r` and `/storybook/llms` artifacts over HTTP.

All of it points at an origin that serves nothing. The MCP server, the shadcn-style `npx shadcn add`
registry under `/r`, the llms.txt files for AI crawlers, the 139-URL sitemap — every one of these is
infrastructure built for a deployment that was never done.
</motivation>

<requirements>
  <one_origin>The landing and the Storybook must ship to ONE origin, with the Storybook at
    `/storybook/` — that is what `STORYBOOK_BASE` (`config.ts:19`) and every `storybookDocs()` link
    already assume. Do not deploy them to two hosts and cross-link; that breaks the relative-URL
    design that `serve-storybook.ts` was written for.</one_origin>
  <build_order>The deploy must build tokens → core → storybook → landing, in that order (TASK-FREE-01
    and TASK-FREE-02 are hard prerequisites; without them the deployed site has no `/storybook/`).</build_order>
  <choose>Pick ONE host and justify it in one sentence in the workflow header. GitHub Pages is the
    zero-cost default and needs no new secret; Netlify/Vercel/Cloudflare Pages give PR previews,
    which are worth a lot for a docs site. If you pick Pages and the custom domain `dzup-ui.com` is
    not yet owned, deploy to the `github.io` subpath and set `SITE_ORIGIN` from an env var so the
    canonical URLs match wherever it actually lands — a canonical pointing at a domain you do not
    control is worse than no canonical.</choose>
  <origin_is_derived>`SITE_ORIGIN` must not be a literal that disagrees with reality. Drive it (and
    therefore the sitemap, robots.txt, and JSON-LD) from a single build-time env var with the current
    value as the default.</origin_is_derived>
  <smoke>After deploy, a smoke step must fetch and assert 200 on: `/`, `/blocks`, `/templates`,
    `/storybook/`, `/storybook/llms.txt`, `/r/registry.json`, `/sitemap.xml`. A deploy that 404s its
    own primary CTA must fail.</smoke>
  <caching>Serve `/storybook/**` and `/assets/**` with long cache lifetimes and `index.html` with a
    short one. State the headers you set.</caching>
</requirements>

<steps>
  1. Confirm TASK-FREE-01 and TASK-FREE-02 are landed. Without them there is nothing to deploy.
  2. Choose the host; write the one-sentence justification.
  3. Add the deploy workflow: build in dependency order, then publish `apps/landing/dist/`.
  4. Make `SITE_ORIGIN` env-driven; thread it through `build-sitemap.ts` and the JSON-LD.
  5. Add the post-deploy smoke assertions.
  6. Deploy. Open the real URL. Click "Browse components". Confirm it lands in a working Storybook.
  7. Verify `/storybook/llms.txt` and `/r/registry.json` are fetchable — the MCP server depends on both.
  8. Update the README with the live URL.
</steps>

<success_criteria>
  - A public URL serves the landing site, with a working Storybook at `/storybook/`.
  - The 7 smoke URLs all return 200, asserted by the workflow.
  - `SITE_ORIGIN`, the sitemap, robots.txt and the JSON-LD all agree with the real origin.
  - The README links the live site.
</success_criteria>
```

---

## [x] TASK-FREE-08 — Fix the SEO layer: share images, missing route metadata, and the prerender question

> **Landed 2026-07-16.** Site-wide 1200×630 `og-default.png` + full favicon set /
> manifest generated by `scripts/build-brand-assets.mts` (committed) and wired into
> `index.html`; `DEFAULT_HEAD` now inherits it on every route. The 87 dead
> `/og/<id>.png` references are fixed by a manifest, not a build-time Playwright
> run: `scripts/build-og-images.ts` (`build:og`, in the build chain) inventories
> which OG cards actually exist and `router.ts` only advertises those — everything
> else falls back to the default card. The same script derives a **PNG** share card
> per template from its committed WebP thumbnail (WebP stays on-page). `/pro`,
> `/animations` and `/templates` got real heads + self-canonicals;
> `/templates/:slug/preview` is `noindex` (parity with the block preview).
> `llms.txt`/`r/<id>.md` block links now use the canonical `/blocks/<id>` shape.
> `sitemap.xml` carries git-derived `<lastmod>` on all 139 URLs (one `git log`
> pass; `BlockDef.path` was added so blocks can be dated).
>
> **Prerender decision: REJECTED for now.** Evidence: the built `dist/` contains
> exactly one HTML document (`index.html` — the landing is a client-rendered SPA
> with an empty `<div id="app">`), so a non-JS crawler sees the home head on every
> route; there is no live deploy to `curl` (dzup-ui.com does not resolve —
> TASK-FREE-07's workflow is not in this repo despite its checkbox; see the note in
> that task). Mitigations shipped instead: the static head is build-time-correct
> (counts + default share card), every route without JS still gets a valid
> title/description/og:image, and discovery is covered by the 139-URL sitemap +
> llms.txt. Prerendering 139 routes would have to coexist with the FOUC IIFE,
> `startViewTransition` guards and a theme set on `<html>` — worth doing only when
> a deploy exists to verify against. Revisit as a follow-up once TASK-FREE-07's
> deploy is real; a post-build Playwright snapshot pass over the sitemap URLs is
> the recommended mechanism.

```xml
<role>
You are a technical SEO engineer working on a documentation site that is a client-rendered SPA. You
know that the difference between "Google can index this" and "a link to this page looks like anything
when pasted into Slack" is entirely a question of what is in the HTML *before* JavaScript runs.
</role>

<task>
Give every route a correct, crawlable share card and canonical URL — fixing the 87 pages that
advertise a 404 image, the four routes with no metadata at all, and the 44 preview URLs that
self-canonicalise to the home page — and decide, with evidence, whether to prerender.
</task>

<motivation>
The per-route head machinery in `apps/landing/src/router.ts:453-513` is genuinely well built: it sets
title/description/og/twitter/canonical/robots/JSON-LD and correctly RESETS to a captured
`DEFAULT_HEAD` on routes that declare none. The problem is what it is fed.

  1. **`og:image` does not exist site-wide.** `index.html:22` declares
     `twitter:card = summary_large_image` but there is **no `og:image` or `twitter:image` anywhere in
     `index.html`**. So `DEFAULT_HEAD.image` resolves to `''` (`router.ts:379`) and `applyHead`
     actively *removes* the tags (`router.ts:485-488`). Every share of the home page, /pro, /blocks,
     /animations, /themes, /templates, /ai and /compare renders a bare text card.

  2. **All 87 block share images 404.** `router.ts:192` sets `image: '/og/${block.id}.png'`.
     `scripts/shoot-og.mts:59` writes to `public/og/` — and **`public/og/` does not exist**. It is not
     gitignored, and `yarn og` is NOT in the `build` chain (`package.json:14`). Eighty-seven pages
     advertise an image that has never been generated.

  3. **Four routes have no `meta.head` at all** — `/pro` (`router.ts:123`), `/animations` (`:208`),
     `/templates` (`:229`), and `/templates/:slug/preview` (`:261-267`). They inherit the home page's
     title, description AND canonical, so three primary marketing surfaces plus 44 preview URLs all
     declare `<link rel="canonical" href="https://dzup-ui.com/">` — they tell Google they *are* the
     home page. `/blocks/preview/:id` gets this right (`robots: noindex`, `:163`); the template
     preview was missed.

  4. **Template share images are `.webp`** (`router.ts:247`). X/Twitter and LinkedIn do not reliably
     render WebP `og:image`.

  5. **No prerender.** `src/main.ts` is a plain `createApp().mount()`; `index.html:75` ships an empty
     `<div id="app">`. Googlebot executes JS, but most social scrapers, Bing, and AI crawlers do not —
     so for them, all 131 detail pages serve the home page's static head, and the entire per-route SEO
     layer in `router.ts` is invisible. This is the single highest-leverage SEO decision on the site.
</motivation>

<requirements>
  <og_images>Either wire `yarn og` into the landing `build` chain so `public/og/*.png` is generated on
    every build, or remove the `og:image` from `router.ts:192`. Advertising a 404 image is strictly
    worse than advertising none. If you wire it in, check the build-time cost (87 Playwright
    screenshots) and cache/skip unchanged blocks — a 5-minute build is not acceptable.</og_images>
  <default_image>Add a site-wide `og:image` + `twitter:image` to `index.html` (absolute URL, 1200×630,
    PNG or JPEG). Set `DEFAULT_HEAD.image` from it so every route without a specific image inherits it.</default_image>
  <route_heads>Add `meta.head` to `/pro`, `/animations`, and `/templates` with a real title,
    description and self-canonical. Add `robots: 'noindex'` to `/templates/:slug/preview`, matching
    `/blocks/preview/:id`.</route_heads>
  <webp>Emit a PNG or JPEG alongside each template thumbnail for `og:image` use, or point `og:image`
    at a generated PNG. Keep the WebP for on-page rendering.</webp>
  <prerender>Evaluate prerendering (`vite-plugin-prerender`, `vite-ssg`, or a small Puppeteer
    post-build pass over the 139 sitemap URLs) and either implement it or write a short, reasoned
    rejection into this doc. Bring evidence: fetch a deployed route with `curl` and show what a
    non-JS crawler actually sees. Do not decide this from intuition.</prerender>
  <llms_consistency>`public/llms.txt` links blocks as `/blocks#hero-centered` while `router.ts:195`
    declares `/blocks/hero-centered` canonical. Make them agree — AI crawlers are a first-class
    audience for this project (there is a whole `/ai` page and an MCP server).</llms_consistency>
  <sitemap>Add `lastmod` to the static routes and the blocks (`build-sitemap.ts:98` sets it only for
    templates).</sitemap>
  <favicon>`public/` has no favicon, no apple-touch-icon, and no web manifest. The site has no icon.
    Add them.</favicon>
</requirements>

<steps>
  1. Prove the breakage: build the landing, then `ls apps/landing/dist/og/` (expect: no such
     directory) and `grep -c "og:image" apps/landing/dist/index.html` (expect: 0).
  2. Generate a default OG image; add it to `index.html` and `DEFAULT_HEAD`.
  3. Wire (or remove) the per-block OG generation. Time the build before and after.
  4. Add the four missing `meta.head` entries.
  5. Resolve the WebP question for template cards.
  6. Fix the llms.txt/canonical URL-shape mismatch; add sitemap `lastmod`.
  7. Add favicon + apple-touch-icon + manifest.
  8. Investigate prerendering with real evidence and either implement or write the rejection.
  9. Validate: paste three URLs (home, a block, a template) into a card validator; all three must
     render a title, a description and an image.
</steps>

<success_criteria>
  - Every route emits a resolvable `og:image`; `dist/og/` exists or the tag is gone.
  - `/pro`, `/animations`, `/templates` have their own title/description/canonical.
  - `/templates/:slug/preview` is `noindex`; no route canonicalises to `/` unless it IS `/`.
  - `llms.txt` block URLs match the canonical route shape.
  - The site has a favicon.
  - The prerender decision is written down with evidence, either way.
</success_criteria>
```

---

## [x] TASK-FREE-09 — Add a 404 page, an error boundary, and async failure states

> **Landed 2026-07-16.** `NotFoundPage.vue` replaces the silent catch-all
> redirect: it explains what happened (with block/template-specific copy — the
> slug guards now route unknown ids there, URL preserved via `pathMatch`, instead
> of silently landing on the gallery), embeds a search over the same unified
> index as the ⌘K palette, links the primary destinations, and is `noindex`.
> `main.ts` sets `app.config.errorHandler` (log + a plain-DOM fatal banner that
> works even when Vue rendering is what broke) and `App.vue` wraps `<RouterView>`
> in the library's own `DzErrorBoundary` with a Try-again/Go-home fallback —
> dogfooded and it was good enough. Every lazy block/template mounts through
> `src/lib/lazyComponent.ts` (skeleton after 200 ms, 2 auto-retries, 15 s
> timeout, shared `AsyncError` with a reload action). Specs in
> `src/router.spec.ts` cover the 404 resolution (unknown path/block/template,
> URL kept, noindex head) and the async error/success paths.
>
> **HTTP status caveat:** an SPA cannot set a 404 status from the client, and no
> host config exists in this repo to set it server-side — **there is no deploy**
> (see TASK-FREE-07 note). When the deploy lands, configure the host to serve
> the SPA fallback with a 404 status for unmatched paths.

```xml
<role>
You are a frontend engineer who has watched a lazy chunk fail to load mid-deploy and turn a
production SPA into a white rectangle with no message. You add the boring safety nets first.
</role>

<task>
Give the landing site a real 404 route, a top-level error handler, and loading/error states for its
lazily-loaded blocks and templates.
</task>

<motivation>
Three holes, all in the same class — the app has no behaviour for "something went wrong":

  1. **No 404.** `router.ts:301` — `{ path: '/:pathMatch(.*)*', redirect: '/' }`. Every typo, every
     dead inbound link, every renamed route silently lands the user on the home page with no
     explanation. (`src/templates/not-found/NotFound.vue` exists — as a *template we sell*. The site
     does not use it for itself.)

  2. **No error boundary.** `src/main.ts` (16 lines) sets no `app.config.errorHandler`, and no
     component in the app calls `onErrorCaptured`. Any throw inside any lazy route chunk blanks the
     page. The library itself SHIPS `DzErrorBoundary` and `DzAsyncBoundary` in
     `packages/core/src/components/feedback/` — the landing dogfoods neither.

  3. **No async failure states.** `src/blocks/registry.ts:202` — `defineAsyncComponent(loader)` with
     no `errorComponent`, no `loadingComponent`, no `timeout`. There are 87 blocks and 44 templates
     behind lazy loaders. A failed chunk during a deploy renders nothing, with no message and no
     retry. Exactly one `<Suspense>` exists in the whole app (`TemplatePreviewPage.vue:70-77`).

This is a design-system marketing site. Its own error-handling components are a selling point. Not
using them on the site that sells them is a credibility problem as much as a UX one.
</motivation>

<requirements>
  <not_found>Replace the catch-all redirect with a real `NotFoundPage.vue` that returns a proper 404
    experience: an explanation, a search entry point (the ⌘K palette already exists —
    `useGlobalSearch`), and links to /blocks, /templates and the Storybook. Give it
    `meta.head` with `robots: 'noindex'`.</not_found>
  <status_code>An SPA cannot set an HTTP status from the client. Whichever host TASK-FREE-07 picks,
    configure it to serve the SPA fallback with a **404 status** for unmatched paths where the host
    supports it, so crawlers are not told these pages exist. If the host cannot, say so.</status_code>
  <error_boundary>Set `app.config.errorHandler` in `src/main.ts` (log + a user-visible fallback) AND
    wrap the `<RouterView>` in `App.vue` with the library's own `DzErrorBoundary`. Dogfood the
    component; if it is not good enough for this, that is a finding about the component.</error_boundary>
  <async_states>Give `defineAsyncComponent` in `blocks/registry.ts:202` (and the template loaders) a
    `loadingComponent` (a skeleton — `DzSkeleton` exists), an `errorComponent` with a retry action,
    and a `timeout`. Use `DzAsyncBoundary` if it fits.</async_states>
  <slug_distinction>`router.ts:99-115` currently redirects an unknown block/template slug to the
    gallery. After this task, an unknown slug should reach the 404 page — a removed block and a
    mistyped URL should be distinguishable, and both should say what happened.</slug_distinction>
  <verify>Prove each path works: visit `/nonsense`, throw deliberately inside a route component, and
    simulate a failed chunk load (block the chunk request in devtools). All three must produce a
    useful screen, not a blank one.</verify>
</requirements>

<steps>
  1. Build `NotFoundPage.vue` from real `Dz*` components; wire it to the catch-all with `noindex`.
  2. Redirect unknown block/template slugs to it instead of the gallery.
  3. Add `app.config.errorHandler` and wrap `<RouterView>` in `DzErrorBoundary`.
  4. Add loading/error/timeout to the async block + template loaders.
  5. Test all three failure paths by hand, in light and dark. Screenshot each.
  6. Add specs: the router resolves an unknown path to `NotFound`; the async loader surfaces its
     error component on rejection.
  7. Configure the host's 404 status handling (or record that it cannot).
</steps>

<success_criteria>
  - `/nonsense` renders a real 404 page with search and navigation, marked `noindex`.
  - A throw inside a route renders the error boundary, not a blank page.
  - A failed block chunk renders an error state with a retry, not nothing.
  - Unknown block/template slugs reach the 404, not a silent gallery redirect.
  - Specs cover the router 404 and the async error path.
</success_criteria>
```

---

## [x] TASK-FREE-10 — Fix the landing's own accessibility: route focus, route announcements, and three missing `<h1>`s

> **Landed 2026-07-16.** `App.vue` gained an `afterEach` guard that moves focus to
> the new page's `<h1>` (fallback `<main>`, `tabindex="-1"`, `preventScroll`,
> outline suppressed for that programmatic focus only) — skipped on initial load
> and same-path/hash navigation — plus a visually-hidden `aria-live="polite"`
> route announcer built on the library's own `DzVisuallyHidden`. The three
> h1-less routes are fixed via a `headingLevel` prop on `Section.vue` (semantics
> only; the 3xl visual is unchanged): `/templates`, `/templates/:slug` and
> `/compare` now open with a real `<h1>`. The new page-level suite
> (`src/pages.a11y.spec.ts`) mounts the real App on all 11 chromed routes and
> asserts exactly one `<h1>`, no skipped heading levels, zero serious/critical
> axe violations (structural A/AA — jsdom cannot judge contrast, same caveat as
> the block suite), the focus move, and the announcer. It immediately caught a
> real defect: `/blocks/:id` jumped h1→h3 (`BlockPreview`'s title); fixed with a
> `headingLevel` prop (index keeps h3, detail passes 2). Preview routes are
> exempt from heading assertions **by decision** — they are embed surfaces whose
> embedded template owns the heading structure.
>
> **`href="#"` audit decision:** the 77 placeholder anchors live inside block/
> template *demo content* — the snippets users copy — where a placeholder link is
> the honest demo. All carry accessible names (visible text), enforced by the
> axe `link-name` rule in the per-block suite and the new page suite; none is a
> focus trap. Rewriting them to `<button>` would change what users copy, so they
> stay. **Verification caveat:** NVDA/VoiceOver and OS-level reduced-motion runs
> were not performed in this pass (no AT available in the environment) — the
> focus/announcer behaviour is spec-covered, and the focus move is inert with
> respect to the View Transition guard by construction (both run after the
> navigation is confirmed); a manual screen-reader pass is still owed.

```xml
<role>
You are an accessibility engineer auditing the marketing site of an accessibility-focused component
library. You hold it to the standard it sells.
</role>

<task>
Add focus management and a route announcer to the landing SPA, and give `/templates`,
`/templates/:slug` and `/compare` the `<h1>` they are missing.
</task>

<motivation>
The landing's a11y foundations are good — there is a real skip link (`App.vue:44`, styled
visible-on-focus at `:139-156`), proper landmarks, thorough `prefers-reduced-motion` handling
(`useReducedMotion.ts`, `router.ts:317-323`, `App.vue:126-136`), focus return on menu close
(`TopNav.vue:65`), and a roving tabindex in `BlockCategoryNav.vue:105`. Three things are missing, and
they are the three that matter most for an SPA:

  1. **No focus management on route change.** Nothing in `App.vue` or `router.ts` moves focus after
     navigation. `scrollBehavior` (`router.ts:303-306`) moves the *viewport*; a keyboard or
     screen-reader user stays parked exactly where they were, in the old page's DOM position. Every
     subsequent Tab continues from the stale location.

  2. **No route announcement.** There is no `aria-live` region announcing the new page. The `<title>`
     updates (`router.ts:470`), but not all assistive tech announces title changes in a client-routed
     SPA — this is the standard SPA a11y defect, and the standard fix is a visually-hidden live region.
     The library ships `DzVisuallyHidden` for exactly this.

  3. **Three routes have no `<h1>`.** `Section.vue:34` renders `<DzHeading :level="2">`.
     `TemplatesPage.vue:307`, `TemplateDetailPage.vue:229` and `ComparePage.vue:19` use `Section` as
     their top-level heading and declare no `<h1>` anywhere — so those three pages begin at `<h2>`.
     Every other route has one (`Hero.vue:74`, `AiIdePage.vue:89`, `AnimationsPage.vue:229`,
     `BlockDetailPage.vue:120`, `BlocksIndexPage.vue:320`, `ProPage.vue:21`, `ThemesPage.vue:220`).

Note also: the block/template demo content renders **40+ `href="#"` links** on live pages
(`blocks/auth/SignIn.vue:60,105`, `blocks/marketing/NavBar.vue:47`,
`blocks/application/AppShell.vue:90,101,134,135`, and many more). Defensible inside a copy-paste demo;
less so on the public site, where they are real no-op links a keyboard user will tab through.
</motivation>

<requirements>
  <focus>On every route change, move focus to the new page's `<h1>` (preferred — it announces the page
    name) or to `<main>` as a fallback. Use `tabindex="-1"` on the target and remove the outline on
    programmatic focus only. Do NOT do this on the initial page load, and do NOT do it when the user
    navigated via an in-page anchor.</focus>
  <announcer>Add a visually-hidden, `aria-live="polite"` route announcer in `App.vue` that speaks the
    new page title after navigation completes. Use the library's own `DzVisuallyHidden`.</announcer>
  <h1>Give `/templates`, `/templates/:slug` and `/compare` a real `<h1>`. Either add an `h1` prop/slot
    to `Section.vue` or author the `<h1>` in the page above the first `Section`. Exactly one `<h1>`
    per route.</h1>
  <heading_order>After the fix, verify heading order on every route: no skipped levels, exactly one
    `h1`. The two chromeless preview routes (`BlockPreviewPage`, `TemplatePreviewPage`) have no heading
    at all — decide whether that is correct for an embed surface and record the decision.</heading_order>
  <href_hash>Audit the `href="#"` links. For blocks rendered on the live site, prefer `<button>` where
    the element is a control, or a real target where it is a link. Where a placeholder link is
    genuinely the right demo content, it must not be a keyboard trap or a focus sink — at minimum give
    it an accessible name that says what it would do.</href_hash>
  <test>Extend the landing test suite beyond blocks: add an axe pass over the 12 PAGES (currently
    zero page-level a11y tests — `a11y.spec.ts` covers only the 87 blocks). Assert one `h1` per route
    and no skipped heading levels.</test>
  <reduced_motion>The route-change focus move must not fight the View Transitions in
    `router.ts:317-323`. Verify with `prefers-reduced-motion: reduce` set, and without.</reduced_motion>
</requirements>

<steps>
  1. Add the `<h1>`s to the three routes. Verify visually — they must not change the design; if
     `Section`'s h2 was carrying the visual weight, keep the styling and change only the semantics.
  2. Add the route announcer and the focus-move, in `App.vue` + an `afterEach` guard.
  3. Test with a real screen reader (NVDA or VoiceOver) across three navigations. A code-only change
     here is not verified.
  4. Audit the `href="#"` links; fix the ones on live-rendered surfaces.
  5. Add the page-level axe suite and the heading-order assertions.
  6. Run the full landing suite, light and dark.
</steps>

<success_criteria>
  - Every route has exactly one `<h1>` and no skipped heading levels, asserted by a spec.
  - Focus moves to the new page heading on navigation; a screen reader announces the page.
  - A page-level axe suite covers all 12 routes and passes.
  - No `href="#"` on a live surface is an unnamed focus sink.
  - Verified under `prefers-reduced-motion` and without.
</success_criteria>
```

---

## [x] TASK-FREE-11 — Repair every external link, badge, and org reference

> **Landed 2026-07-16.** The real org is **datazup** (the git remote;
> `api.github.com/repos/datazup/dzup-ui` → 200, repo public). Every
> `github.com/dzup-ui/*` reference is gone (config.ts, Contributing.mdx,
> packages/mcp manifests) and `apps/landing/src/orgConsistency.spec.ts` fails if
> two org strings ever coexist again. Fetched-and-verified repairs: Discord
> invite (404 via the invite API) and X handle (404) **removed** — CommunityCTA
> now points at Issues; `LINKS.discussions` → `LINKS.issues` (the repo has
> Discussions disabled); footer badges reduced to the ones that render (live
> GitHub stars, static MIT license badge now linking the LICENSE, static CWV
> badge) — npm version/bundlephobia/npm-license badges removed until
> `@dzup-ui/core` is published (registry → 404), same for the README; the
> SocialProof npm tile links the install guide while unpublished; the dead
> `datazup/dzup-ui-pro` links (repo does not exist) were replaced with honest
> /pro-page prose (and the README's hand-typed "40 enterprise components" claim
> went with them). The dead Storybook deep links were fixed against the ids in
> the freshly BUILT `index.json` — which corrected this audit itself: the Design
> Tokens guide is an *attached* MDX page, so its real id is
> `guides-design-tokens--designtokens` (the `--docs` id this doc recommended
> never existed), and the new gate found **three more** dead links to it
> (Introduction.mdx ×2, Theming.mdx) plus the landing's own
> `LINKS.designTokens`; `contributing--docs` and
> `core-typography-dzheading--size-vs-level` were the other true ids. The two
> `../../CLAUDE.md` filesystem links now point at GitHub. The copyright year is
> derived. Bonus rot
> found by the new checker: `packages/mcp` carried a THIRD identity
> (`dzup-ui.dev`) and a dead MCP `$schema` URL — normalised to `dzup-ui.com` /
> the live `server.schema.json`, and `io.github.dzup-ui/mcp` → `io.github.datazup/mcp`.
>
> **Gates added:** `yarn check:links` (`scripts/check-external-links.mjs`)
> fetches every external URL on the identity surfaces (footer, CTAs, README, MDX
> guides, manager theme, MCP manifests; documented allowlist for the pending
> `dzup-ui.com` origin and hosts that block scripted requests) — wired into the
> `validate` CI job; `check:mdx-links` (`apps/storybook/scripts/check-mdx-links.mjs`)
> resolves every `?path=/docs|story/<id>` deep link in the MDX against the built
> `storybook-static/index.json` and rejects filesystem-relative links — wired into
> the `storybook` CI job after the build. Scanning the *rendered* HTML instead was
> considered and rejected: both apps are JS-rendered (the landing `dist/` has one
> HTML file), so source-level surfaces + the built story index are what's real.

```xml
<role>
You are a release engineer doing the pass that decides whether a first-time visitor trusts this
project. A broken badge in the footer says "unmaintained" louder than any README says "production
ready".
</role>

<task>
Make every external link and badge in both apps either work or not be there, and settle the
`datazup` vs `dzup-ui` GitHub-org contradiction.
</task>

<motivation>
The two apps disagree with each other about which GitHub org owns this project:

  • `apps/landing/src/config.ts:113` — `github: 'https://github.com/dzup-ui/dzup-ui'`
  • `apps/landing/src/components/Footer.vue:56,80` — shields badge + Actions link for **`datazup/dzup-ui`**
  • `apps/storybook/.storybook/manager.ts:52` — `https://github.com/datazup/dzup-ui`
  • `apps/storybook/stories/Introduction.mdx:14` — `github.com/datazup/dzup-ui-pro`
  • `apps/storybook/stories/Contributing.mdx:143` — `github.com/**dzup-ui**/dzup-ui/blob/main/docs/...`

One of the two orgs is wrong everywhere it appears. Meanwhile `useLiveStats.ts:33-35` states plainly
that the GitHub repo and the npm package **are both unpublished and their APIs 404 today** — which
means the footer currently renders four broken badge images (`Footer.vue:53-82`: GitHub stars, npm
version, bundlephobia size, and a "License" badge whose `href` points at the CHANGELOG).

Other dead ends:
  • `Typography.mdx:63` → `?path=/docs/getting-started-design-tokens--docs` — no such story id.
    The correct id is `guides-design-tokens--docs`. Dead link.
  • `ComponentStatus.mdx:141` → `?path=/docs/guides-contributing--docs#design-reference` — Contributing's
    `<Meta title="Contributing" />` makes its id `contributing--docs`. Dead link.
  • `GettingStarted.mdx:40` and `Contributing.mdx:18` → `[…](../../CLAUDE.md)` — filesystem-relative
    links inside a rendered docs page. They resolve to nothing in a browser.
  • `config.ts:117` — `discord: 'https://discord.gg/dzup-ui'`. A Discord invite is a random slug; a
    vanity URL of this shape almost certainly does not exist.
  • `config.ts:118` — `twitter: 'https://twitter.com/dzup_ui'`.
  • `Footer.vue:47` — `const year = 2026`, hardcoded. It will say © 2026 in 2028.
</motivation>

<requirements>
  <one_org>Establish which GitHub org is real. Fix every reference to it in both apps and in the
    README. Add a spec or a lint rule that fails if two different org strings appear in the repo.</one_org>
  <badges>For each of the four footer badges: if the underlying resource does not exist yet, REMOVE
    the badge. A broken image is worse than no image. Bring them back when the repo and package are
    public. If they do exist, fix the org and verify each URL returns an image (fetch it).</badges>
  <license_badge>`Footer.vue:71-72` labels a badge "License" and links it to `LINKS.changelog`. Point
    it at the LICENSE, or remove it.</license_badge>
  <social>Verify the Discord invite and the X/Twitter handle resolve. Remove or correct whichever does
    not. Do not ship a social link to a 404.</social>
  <mdx_links>Fix the two dead Storybook deep-links (`Typography.mdx:63`,
    `ComponentStatus.mdx:141`) and replace the two `../../CLAUDE.md` filesystem links with either a
    GitHub URL or inline prose.</mdx_links>
  <year>Derive the copyright year (`Footer.vue:47`).</year>
  <link_check>Add a link checker to CI over both apps' rendered output (the built landing `dist/` and
    the built `storybook-static/`): every internal link resolves, every external link returns < 400.
    Allow an explicit allowlist for rate-limited hosts. This is the gate that keeps the repair done.</link_check>
</requirements>

<steps>
  1. Determine the real org (check the git remote, check which URL actually resolves). Write it down.
  2. Grep both apps + the README for both org strings; unify.
  3. Fetch each of the four badge URLs. Remove the ones that 404.
  4. Fetch the Discord and X URLs. Remove or fix.
  5. Fix the two dead MDX deep-links by resolving them against the real story ids (build the Storybook
     and check `storybook-static/index.json` for the true ids — do not guess).
  6. Replace the two `../../CLAUDE.md` links.
  7. Derive the year.
  8. Add the CI link checker; make it green.
</steps>

<success_criteria>
  - Exactly one GitHub org string appears in the repo, and it resolves.
  - No badge, social link, or docs deep-link in either app returns a 404.
  - The copyright year is derived.
  - A CI link checker covers both built apps and passes.
</success_criteria>
```

---

## [x] TASK-FREE-12 — Wire the orphaned validators; delete the dead weight

```xml
<role>
You are an engineer who has just found three validators, a bundled addon, and a scratch story
namespace that all exist, all cost something, and all do nothing. You are here to make each one
either load-bearing or gone.
</role>

<task>
Wire `story-status.ts` into CI, remove or use `@storybook/addon-designs`, delete the `Visual Refresh`
scratch namespace and the committed junk file, and resolve the duplicated Vite alias config.
</task>

<motivation>
Five pieces of dead or unwired infrastructure, each of which is quietly making a claim it does not back:

  1. **`packages/tooling/src/validators/story-status.ts`** exists, with a spec.
     `ComponentStatus.mdx:79-81` and `:112-113` tell readers it *"holds the line… so a component can
     never quietly drop off the roadmap."* `grep -rn "story-status" package.json .github/` → **0 hits.**
     It is in no `validate:*` script and no CI job. **The docs page states a guarantee that does not
     exist.**

  2. **`@storybook/addon-designs@^11.1.3`** is a devDependency (`apps/storybook/package.json:31`) and
     registered (`main.ts:23`). **Zero stories use it** — `grep -rl "design:" packages/core/stories` on
     the `parameters.design` shape returns nothing meaningful. It adds an empty "Design" panel to all
     1,393 stories and weight to every build. `ComponentStatus.mdx:138-141` and `Contributing.mdx:112-115`
     honestly document that there is no Figma library — so the addon is a knowingly-shipped no-op.

  3. **The `Visual Refresh/*` namespace** — 8 story files in `packages/core/stories/_gallery/` publish
     under a root title that is not in `preview.ts`'s `storySort` order (`preview.ts:36-61`), so they
     land under the trailing `'*'` and appear in the **public sidebar**. They have no `tags`, no
     `status:*`, no `autodocs`, no `argTypes`, and 7 of 8 have no `play()`. They are invisible to
     `ComponentStatus.mdx` (which filters on `title.startsWith('Core/')`) but fully visible to users
     and to Chromatic. This is design-review scaffolding that was never removed.

  4. **`apps/storybook/debug-storybook.log`** — a **0-byte, committed** file. Nothing writes it;
     nothing reads it; `apps/storybook/.gitignore` does not cover it.

  5. **The same 6 workspace aliases are hand-maintained in three places** — `.storybook/main.ts:68-89`,
     `apps/storybook/vite.config.ts:9-19`, and `apps/storybook/vitest.config.ts:16-41` — and
     `apps/storybook/vite.config.ts` appears to be **entirely unused** (no script references it;
     `storybook dev/build` uses `main.ts`'s `viteFinal`, vitest uses `vitest.config.ts`). Three copies
     of a list that must agree, one of which is dead.

  (`validate-llms.mjs` and `verify-repl.mjs` are the same class of problem and are handled in
  TASK-FREE-03.)
</motivation>

<requirements>
  <story_status>Add `validate:story-status` to the root `package.json`, include it in `validate:all`,
    and add it to the `validate` CI job. Run it; if it fails on the current tree, fix what it finds —
    that is exactly the drift it was written to catch.</story_status>
  <designs>Decide: either (a) remove `@storybook/addon-designs` from `package.json` and `main.ts`
    until a Figma library exists, updating `ComponentStatus.mdx:138-141` and `Contributing.mdx:112-115`
    to stop describing an addon that is not installed; or (b) keep it and land at least one real
    `parameters.design` link to prove the integration works. Do not leave it installed and unused.
    Recommend (a) — the docs already admit there is no Figma library.</designs>
  <gallery>Resolve the `Visual Refresh/*` stories. If they are still useful, move them under a proper
    root, add them to `storySort`, and give them tags/status like every other story. If they were
    scaffolding, delete them. Either way they must not appear unsorted and untagged in the public
    sidebar.</gallery>
  <junk>Delete `apps/storybook/debug-storybook.log` and add it (and `*.log`) to the gitignore. Also
    remove `apps/landing/test-results/.last-run.json`, which is committed despite `test-results/`
    being gitignored.</junk>
  <aliases>Extract the 6 workspace aliases into ONE shared module that `main.ts`, `vitest.config.ts`
    (and `apps/landing/vite.config.ts`, which maintains its own copy) all import. Delete
    `apps/storybook/vite.config.ts` if you confirm nothing uses it — prove it first by grepping every
    script and config.</aliases>
  <dead_exports>`_shared/a11y.ts:47` exports `a11yDisableRules`, documented in `Accessibility.mdx:132-136`
    and never called. TASK-FREE-06 will start using it. Leave it; note it here so it is not deleted by
    mistake.</dead_exports>
</requirements>

<steps>
  1. Run `story-status.ts` by hand. Record what it reports on the current tree.
  2. Wire it into `validate:all` and the `validate` CI job; fix whatever it finds.
  3. Take the addon-designs decision; implement it end to end, including the two MDX pages.
  4. Decide and act on the 8 `Visual Refresh` stories.
  5. Delete the two committed junk files; extend the gitignores.
  6. Prove `apps/storybook/vite.config.ts` is unused, then extract the shared alias module and delete
     the dead file.
  7. `yarn validate:all`, `yarn storybook:build`, `yarn workspace @dzup-ui/storybook test-storybook`.
</steps>

<success_criteria>
  - `yarn validate:story-status` exists, runs in `validate:all` and in CI, and passes.
  - `addon-designs` is either removed (and the MDX updated) or demonstrably used by ≥1 story.
  - No untagged, unsorted story namespace appears in the public sidebar.
  - `debug-storybook.log` and `test-results/.last-run.json` are gone and gitignored.
  - The workspace aliases are defined once; `apps/storybook/vite.config.ts` is gone or justified.
</success_criteria>
```

### Outcome (2026-07-16) — three of the five premises were wrong

Done: `validate:story-status` is in `validate:all` and the `validate` CI job (it passes clean on the
current tree — nothing to fix, it just was never run). `@storybook/addon-designs` is uninstalled,
along with the `Design` column, the `design` field in `componentStatus.ts`, and the story-template
comment; the decision log has a closing entry. Removing it dropped **five** packages — the addon
dragged in a `@figspec/*` + `@lit/react` subtree. `debug-storybook.log` is deleted and `*.log` is
gitignored. The six workspace aliases now come from one module,
`packages/tooling/src/workspace-aliases.ts`, imported by `.storybook/main.ts`, `vitest.config.ts`,
`apps/landing/vite.config.ts` and `apps/sandbox/vite.config.ts`.

Corrections to this task, each verified before acting:

1. **`apps/storybook/vite.config.ts` is NOT dead — deleting it breaks the build.** It is unreferenced
   by any script, which is what the audit checked, but `@storybook/builder-vite` loads it by
   convention: `commonConfig()` calls Vite's `loadConfigFromFile(configEnv, viteConfigPath,
   projectRoot)` with `projectRoot = resolve(configDir, '..')`. It is also the ONLY source of
   `@vitejs/plugin-vue` — `@storybook/vue3-vite` does not depend on that plugin and never registers
   it. Deleting the file fails the preview build with *"Install @vitejs/plugin-vue to handle .vue
   files"* (reproduced). Kept and justified per the success criterion, slimmed to `plugins: [vue()]`
   with the proof in its header; its duplicate `tailwindcss()` (a second plugin instance on every
   build) and its alias copy — which was missing `@dzup-ui/core/styles` — are gone.
2. **There were five copies of the alias list, not three.** `apps/sandbox/vite.config.ts` had its own,
   and it plus `apps/landing` carried a 7th alias the two Storybook copies lacked. They had already
   drifted; the shared module is the superset.
3. **`apps/landing/test-results/.last-run.json` was never committed.** `git ls-files` shows nothing
   under `test-results/`, and `git check-ignore` resolves it to `.gitignore:12`. It is a local
   Playwright artifact, already correctly ignored. Nothing to fix.
4. **The `Visual Refresh` galleries are not abandoned scaffolding — they are load-bearing, and were
   kept.** Three days before this audit, commit `6c5f522` deliberately marked each `freestyle/*.vue`
   `token-check-disable-file` with a written rationale ("the raw-Tailwind visual target the token
   system is measured against; tokenizing it would erase the comparison"); `design-tasks.md:378`
   documents them as a legitimate exception, and `_gallery` is item 5 in the live a11y ratchet
   backlog (19 stories, first counted 2026-07-16). Deleting them would have erased the token system's
   measuring stick and quietly removed 19 known-failing stories from the backlog — making the ratchet
   look better than it is. Fixed the actual defect instead: the namespace is now pinned in
   `preview.ts` `storySort` (below `Core`) and every story carries a `gallery` tag, with the rationale
   in `packages/core/stories/_gallery/README.md`. They deliberately carry no `status:*` tag — the
   ladder grades components, and a composed demo screen is not one; both readers of that taxonomy
   already skip the namespace by design.

`a11yDisableRules` left in place for TASK-FREE-06 as instructed. Verified: `yarn storybook:build`
exits 0, all 24 gallery entries carry the tag in the built `index.json`, `yarn validate:story-status`
passes, tooling typecheck and lint are clean.

---

## [x] TASK-FREE-13 — Trim the landing's initial payload

```xml
<role>
You are a performance engineer. You know that a 400 kB gzipped JS budget for a marketing site is not
a budget — it is a note saying "we measured what we happened to ship".
</role>

<task>
Lazy-load the three route components that do not need to be eager, then tighten the bundle budget to
the new, real number.
</task>

<motivation>
`apps/landing/src/router.ts:5-8` eagerly imports **four** route components into the entry chunk:
`HomePage`, `ProPage`, `BlocksIndexPage`, `AnimationsPage`. Only `/` needs to be eager.

`BlocksIndexPage` is 653 lines and drags in `LazyBlockPreview`, `BlockCard`, `BlockCommandPalette`,
`BlockSearchBar`, `BlockCategoryNav`, `BlockAiCallout` and the whole 87-entry `BLOCKS` registry.
`AnimationsPage` is 671 lines and imports the entire 60-effect `CATALOG` (`AnimationsPage.vue:6`).
Neither is on the critical path for a first-time visitor landing on `/`.

The consequence is written into the budget file. `scripts/check-bundle-budget.ts:56-64` allows:

    entry JS 320 kB gzip · vendor-vue 55 kB · vendor-icons 30 kB · TOTAL INITIAL JS 400 kB

and `:39-41` admits it: *"Set with modest headroom over the measured baseline… Tighten these as the
entry chunk is trimmed."* A typical marketing-site target is 100–170 kB. The entry CSS budget
(60 kB) is set to `initial: false` (`:60`) — i.e. it is measured and then **not counted** by the gate.

Lighthouse CI (`lighthouserc.json`) hard-asserts LCP < 2.5 s and CLS < 0.1, but probes only **2 of 12
routes** (`/` and `/compare`), on the **desktop preset only** — no mobile run. And `a11y ≥ 0.9` is a
`warn`, not an `error`, so an accessibility regression cannot fail the build.
</motivation>

<requirements>
  <lazy>Convert `ProPage`, `BlocksIndexPage` and `AnimationsPage` to `() => import()`. Keep `HomePage`
    eager. Measure the entry chunk before and after and report both numbers.</lazy>
  <registry_split>The blocks and templates registries carry metadata for all 131 items in the eager
    graph even though the components themselves are lazy. Check whether the registry metadata can be
    split out of the entry chunk too (it is needed by the ⌘K palette, which is site-wide — so it may
    legitimately belong, but confirm rather than assume).</registry_split>
  <tighten>After the trim, set each budget to the new measured value plus a stated headroom (e.g.
    +15%). Write the reasoning in the file. A budget that is 2× the actual is not a gate.</tighten>
  <css>Make the entry CSS budget count (`check-bundle-budget.ts:60` — `initial: false`). CSS blocks
    render; it belongs in the initial-payload gate.</css>
  <lighthouse>Extend `lighthouserc.json` to probe at least `/`, `/blocks`, `/templates`, `/compare`
    and one block detail page, and add a **mobile** run. Promote `a11y` from `warn` to `error` — this
    is an accessibility library.</lighthouse>
  <honest_measurement>Machine drift makes sequential before/after timings worthless. Measure the
    BUNDLE (deterministic bytes), not wall-clock timings, for the entry-size claim. If you do measure
    runtime, interleave the two builds on two ports rather than running them back to back.</honest_measurement>
  <images>`TemplatesPage.vue:418-424` and `TemplateDetailPage.vue:406` render thumbnails with no
    `width`/`height` attributes (CLS is defended only by a CSS box) and no `srcset`. Add intrinsic
    dimensions. Also: **16 of 44 templates are missing their dark-mode thumbnail** — list them and
    either generate the missing ones or make the dark path fall back explicitly.</images>
</requirements>

<steps>
  1. Build and record the current entry/vendor/CSS gzip sizes from `check-bundle-budget.ts`.
  2. Lazy-load the three routes. Rebuild. Record the new sizes.
  3. Investigate the registry-metadata question; act or record why not.
  4. Rewrite the budgets to the new measured values + stated headroom; turn the CSS budget on.
  5. Extend the Lighthouse config (routes + mobile + a11y as error). Run it.
  6. Add intrinsic image dimensions; resolve the 16 missing dark thumbnails.
  7. Confirm every route still loads and the ⌘K palette still finds components, blocks and templates
     (it is site-wide and must not have been code-split away from the home page).
</steps>

<success_criteria>
  - Only `HomePage` is eagerly imported.
  - The initial-JS budget reflects the new measured entry size + a stated headroom, and the CSS
    budget counts.
  - Lighthouse probes ≥5 routes including mobile; `a11y` is an error-level assertion.
  - Every `<img>` has intrinsic dimensions; the dark-thumbnail gap is closed or explicitly handled.
  - Before/after entry sizes are reported.
</success_criteria>
```

### Outcome (2026-07-16) — entry JS 292.85 kB → 152.13 kB, and mobile turns out to fail LCP

Measured bytes, not timings, per `<honest_measurement>`. All numbers gzip, from
`check-bundle-budget.ts` on the built site:

| | baseline | after lazy routes | after source split |
|---|---|---|---|
| Entry JS | 292.85 kB | 252.50 kB | **152.13 kB** (−48%) |
| Initial JS total | 346.93 kB | 306.58 kB | **206.21 kB** (−41%) |
| Entry CSS | 42.96 kB | 38.16 kB | **38.16 kB** |

**The registry question, answered by measurement rather than assumption.** Attributing the entry
chunk's modules with `rollup-plugin-visualizer`: registry *metadata* is 22.5 kB and **legitimately
belongs** — `router.ts` needs it for `/blocks/:id` head resolution and `useGlobalSearch` for the
site-wide ⌘K palette, exactly as the task suspected. What did not belong was **169.0 kB across 87
`?raw` modules**: `blocks/registry.ts` globbed every block's full SFC text with `eager: true`, so
every first-time visitor to `/` downloaded the source of all 87 blocks to render the home page — 35%
of the entry's module weight, and bigger than the route split. That text now lives in
`blocks/sources.ts`, which only lazy chunks and the Node generators import; the entry is down to
**0** `?raw` modules (verified). `registryItem.ts`/`llmsText.ts` stay runtime-free and take a
`BlockSourceLookup` parameter — importing `sources.ts` there breaks the bare-Node generator, since
`import.meta.glob` needs a Vite transform (hit and fixed).

Budgets are re-set to measured + ~15% with the reasoning and the baseline in the file; every one now
sits at 86–87% of its limit instead of the old 92%/2×. The entry-CSS budget counts: it joins JS in a
new `Initial payload (JS+CSS)` gate. (Note: the old CSS budget *was* enforced individually — `initial:
false` only excluded it from the JS subtotal, not from the gate.)

Corrections and findings:

1. **The `<images>` premise is outdated.** `TemplatesPage.vue` already ships
   `width="1600" height="1000"` (committed), and `TemplateDetailPage.vue:406` is an `<iframe>`, not
   a thumbnail. The only `<img>` without both dimensions is a Footer badge.
2. **CLS was real but came from somewhere else — and lazy-loading made it worse.** Every lazy route
   measured CLS 0.44 desktop / 0.82 mobile against a 0.1 budget, while eager `/` was 0.000. Cause:
   `main` is `flex: 1` in a `min-height: 100vh` column, so while a route chunk is in flight the
   footer sits *inside* the viewport and is shoved down when the page mounts (captured the shift:
   `<FOOTER> y:152→0 h:671→0`). Pre-existing on `/compare` and `/templates`; my lazy-loading would
   have spread it to `/blocks`, `/pro` and `/animations`. Fixed with `.route-view { min-height:
   100vh }` — **CLS is now 0.000 on all five routes, both form factors.**
3. **Mobile fails LCP on every route, and never being measured is why nobody knew.** Lighthouse now
   probes 5 routes on desktop *and* mobile. a11y is `error` on both and passes (95–98). Desktop
   passes everything (LCP 0.66–1.19s). Mobile LCP: `/` 3.09s, `/blocks` 4.15s, `/templates` 3.77s,
   `/compare` 3.08s, `/blocks/hero-split` 4.34s — all over 2.5s, *after* the 48% entry cut. Mobile
   LCP is therefore `warn`, not `error`: arming it would paint CI red on day one, which fixes no LCP
   and teaches people to ignore the job. **This is open work, not a closed item** — see below.
   `lighthouserc.spec.ts` pins the URLs/thresholds across both configs and records LCP as the single
   sanctioned difference, so it cannot silently spread.
4. **The 16 missing dark thumbnails were degrading silently.** Confirmed 44 light / 28 dark. The
   gallery derived `<slug>-dark.webp` unconditionally, so those 16 404'd and fell back to a generic
   *icon* in dark mode while light mode showed a real screenshot. `build-og-images.ts` now emits
   `TEMPLATE_DARK_THUMB_SLUGS` (same "never advertise a missing image" pattern as `BLOCK_OG_IDS`),
   the page falls back to the light screenshot instead, and the generator warns the gap out loud on
   every build rather than letting the fallback hide it. Generating the missing 16 needs `yarn
   thumbnails`.

Verified: 1810/1810 landing tests pass; all 11 routes render with correct `h1`s and no JS errors; the
⌘K palette from `/` still finds components (`DzButton`), blocks (`hero`) and templates (`dashboard`).

**Follow-up (not done here):** mobile LCP 3.08–4.34s vs the 2.5s target, and the 16 dark thumbnails.
The next lever for LCP is TBT — 998ms on `/` — not bytes; the entry is already down 48%.

---

# 🟢 P2 — Coverage and polish

---

## [~] TASK-FREE-14 — Write the guides a serious design system is expected to have

> **Partially landed 2026-07-16 — the agreed minimum (guides 1–4) + the Overviews.**
> Remaining, in the task's own priority order: Icons (5), Performance (6), i18n/RTL
> (7), FAQ (8), Compositions Overview (9). The RTL page still needs its
> investigation pass first — do not write it before running a family under
> `dir="rtl"`, per `<rtl_honest>`.
>
> **Landed:** `Guides/SSR & Nuxt`, `Guides/Forms & Validation`,
> `Guides/Versioning & Deprecation`, `Guides/Migration`, all sorted into `preview.ts`
> and link-checked (110/110 deep links resolve).
>
> **Writing the guides found three live bugs, each bigger than the guide that found
> it.**
>
> 1. **The Component Status dashboard was rendering an error card in every built
>    Storybook.** `componentStatus.ts` aliased `import.meta` into a local
>    (`const viteMeta = import.meta as …; viteMeta.glob(…)`) to dodge the missing
>    `vite/client` types. `import.meta.glob` is a **compile-time transform Vite
>    matches syntactically** — aliasing silently defeats it, leaving a literal
>    `.glob()` call that throws `glob is not a function` at runtime. It type-checked,
>    built clean, and shipped broken, while `ComponentStatus.mdx` advertised itself as
>    the live matrix. Fixed (direct call, cast the result); the page renders 186 rows
>    again. **Nothing else in the repo used the aliased form** — every other glob
>    (`OpenInStackblitz`, the landing's `rawSources`/`registry`) calls it directly.
> 2. **Markdown tables have never rendered.** `remark-gfm` was neither installed nor
>    configured, and MDX2+ is CommonMark-only — which has no table syntax. Every
>    `| a | b |` block rendered as a literal row of pipes and dashes **in 13 MDX
>    files**, including every family Overview's "when to use which" table. Nothing
>    caught it because broken markdown still builds; it is just text. Installed and
>    wired `remark-gfm` into `addon-docs`, which fixes all 13 at once. Verified: zero
>    raw-pipe text remains and the tables are real `<table>`s.
> 3. **A third copy of the status-badge palette.** `_blocks/StatusBadge.ts` kept its
>    own Tailwind amber/blue/green/red-700 hexes, agreeing with neither the manager
>    nor the token ramp. Now reads TASK-FREE-17's token-backed `brandPalette.ts`.
>
> **Overviews are generated.** `_data/familyComponents.ts` parses the story corpus
> for name/family/`status:*`/the JSDoc-above-`const meta` blurb + Storybook's own id
> slug (verified against all 178 built `Core/*` docs ids — zero mismatches), and
> `_blocks/FamilyComponents.ts` renders it. All 11 Overviews now list **161
> components** (Forms 30, Data 22 — the previously-missing `DzCascader`, `DzKnob`,
> `DzTreeSelect`, `DzRating`, `DzAnimatedNumber`, `DzOrderList`, `DzCalendar` … all
> present and verified in the built app). The blurb now shares one source with the
> docs page, so the two cannot contradict each other, and the hand-typed
> `status="stable"` literals — which could silently disagree with the story's tag —
> are gone. Forms' hand-enumerated intro prose was cut for the same reason.
>
> **The SSR guide is derived and deliberately unflattering.** `_blocks/SsrCoverage.ts`
> parses `ssr-smoke.spec.ts`; its output matches a real `yarn test:ssr` run exactly
> (**54 covered / 1 skipped / 11 families**, verified against vitest). The guide
> states plainly that these are smoke tests — they prove nothing *throws* — that
> **there is no hydration testing at all**, and that `DzAccordion` is skipped rather
> than passing. It also documents that `@dzup-ui/nuxt` auto-imports from a
> **hand-maintained 138-name list** that nothing checks against core's exports, and
> that `includePro: true` cannot work because `@dzup-ui/pro` is not published.
>
> **The deprecation policy is now a decision, not a transcription** (agreed with the
> maintainer before writing): a deprecated API keeps working for **at least two minor
> releases and is removed only in a major**, and must ship a named replacement, a
> dev-mode warning, a changeset, and a migration path. Also recorded: an
> accessibility-contrast fix is a **patch**, not a major. `Guides/Migration` covers
> the one migration that actually exists — legacy dzup-ui → vNext via the real
> `dzup-codemod` transforms and the 11 `@dzup-ui/compat` adapters — and says outright
> that no major has happened yet rather than inventing one. Its "currently
> deprecated" list is generated (`DEPRECATED_ROWS`), so today's honest "none" fills
> itself in later.

```xml
<role>
You are a design-system technical writer. You know the difference between a component reference and
documentation: the reference tells you what the props are, the documentation tells you what to do
when you have to ship a form, upgrade a major version, or render right-to-left.
</role>

<task>
Add the missing MDX guides — migration/deprecation policy, SSR/Nuxt, forms & validation patterns,
i18n/RTL, performance, icons, and an FAQ — and fill the 45 components missing from the family
Overview pages.
</task>

<motivation>
The Storybook has 21 MDX pages and the ones that exist are good: Accessibility, Theming, Design
Tokens, Color Palette, Choosing Components, Component Status, Releases, Contributing, and 11 family
Overviews. What is **entirely absent**:

  • **Migration / upgrade guide** — none. `ComponentStatus.mdx:149-160` renders "🎉 No deprecated
    components" and stops. There is no story for a breaking change.
  • **Versioning & deprecation policy** — none. `Contributing.mdx` defines the status ladder
    (experimental → beta → stable) but never says what a deprecation means, how long support lasts, or
    when something is removed. The library ships Changesets and a `compat` package; neither is
    documented for consumers.
  • **SSR / Nuxt** — `@dzup-ui/nuxt` is a shipped package (it is in the root `build` script). It has
    **no docs page at all.** There is an SSR test suite (`yarn test:ssr`) and no SSR guide.
  • **Forms & validation patterns** — `Forms.mdx` is a family index, not a patterns guide. There are
    31 form components and no recipe for composing them: no vee-validate/zod integration, no
    submit/async-validation/error-summary pattern, nothing on `DzFieldArray` or `DzFormField`.
  • **i18n / RTL** — zero mentions anywhere in the repo. No `dir="rtl"` decorator, no RTL global.
  • **Performance** — `check-bundle-size.mjs` exists and nothing surfaces its output in the docs. No
    tree-shaking guidance, no "how big is this really" page.
  • **Icons** — `lucide-vue-next` is imported by 100+ stories and is undocumented.
  • **FAQ / troubleshooting** — none.
  • **Compositions Overview** — `preview.ts:56` sorts a `Compositions` entry that has no `.mdx`, unlike
    every other family.

And the family Overviews that DO exist are incomplete: **45 shipped components are listed on no
Overview page**, worst in Forms (9 missing: DzCascader, DzFloatLabel, DzInplace, DzKnob, DzListbox,
DzMention, DzRating, DzTagsInput, DzTreeSelect) and Data (7: DzAnimatedNumber, DzCalendar, DzCountdown,
DzDataView, DzDescriptions, DzInfiniteScroll, DzOrderList). A component that ships but appears on no
index page is, for a user browsing the docs, a component that does not exist.
</motivation>

<requirements>
  <priority>Write them in this order — it is descending by how often a real user is blocked:
    (1) SSR/Nuxt, (2) Forms & validation patterns, (3) Versioning & deprecation policy,
    (4) Migration guide, (5) Icons, (6) Performance, (7) i18n/RTL, (8) FAQ, (9) Compositions Overview.
    Landing all nine in one pass is acceptable; landing the first four is the minimum.</priority>
  <derived>Every count, list, or component name in a new guide must come from a generated source, per
    TASK-FREE-04. Do not hand-type another table.</derived>
  <overviews>Generate the family Overview component lists from the story titles rather than
    hand-maintaining them — that is exactly how the 45 went missing. `_data/componentStatus.ts` already
    parses the story corpus; reuse it.</overviews>
  <runnable>Where a guide shows code, make it runnable — the repo already has the `DzRepl` and
    `OpenInStackblitz` doc blocks (`stories/_blocks/`). A forms guide with a dead code block is half a
    guide.</runnable>
  <rtl_honest>For i18n/RTL: first establish whether the components actually WORK in RTL. Run a family
    under `dir="rtl"` and look. If they do not, the honest guide says so and files the gap — do not
    write a guide that implies support the library does not have.</rtl_honest>
  <ssr_honest>Same for SSR: `yarn test:ssr` exists. Report what it actually covers before writing the
    guide.</ssr_honest>
</requirements>

<steps>
  1. Establish ground truth first: run `yarn test:ssr` and record coverage; render one family with
     `dir="rtl"` and record what breaks. You cannot document either until you know.
  2. Generate the family Overview component lists from the story corpus; the 45 missing entries should
     appear automatically.
  3. Write the guides in the priority order above, each with runnable examples via `DzRepl`.
  4. For the deprecation policy, write the actual policy (support window, removal timeline, what a
     `status:deprecated` tag obliges) — it does not exist yet, so this is a decision, not a
     transcription. Get it agreed before writing it as fact.
  5. Add each new page to `preview.ts`'s `storySort` so it lands in the right place in the sidebar.
  6. `yarn storybook:build` green; every internal link in the new pages resolves (TASK-FREE-11's link
     checker will enforce this).
</steps>

<success_criteria>
  - SSR/Nuxt, Forms patterns, Versioning & deprecation, and Migration guides exist, with runnable
    examples.
  - Every family Overview lists every component in its family, generated from the story corpus.
  - The RTL and SSR pages state what is actually true, including the gaps.
  - New pages are sorted correctly in the sidebar and their links resolve.
</success_criteria>
```

---

## [x] TASK-FREE-15 — Enforce the story Definition of Done

> **Landed 2026-07-16.** `packages/tooling/src/validators/story-dod.ts` (+ spec),
> wired into `validate:all` and the CI `validate` job. Three checks **enforced**
> and green — `controls-driven` 155/155, `dark-mode` 167/167, `description`
> 167/167; five **reported** with counts so the distance stays visible.
> `Contributing.mdx` rewritten to match what is enforced.
>
> **Re-deriving the counts changed the task.** Four of this task's numbers did not
> reproduce, each because a DoD clause was being read past:
> - **`States` is 35 files, not 134.** The DoD already said "as applicable", and
>   **71 of 167 components declare no `disabled`/`loading`/`readonly`/`invalid`
>   prop at all** (`DzVisuallyHidden` has no state to show). Applicability is now
>   *derived from the component's own `.types.ts`* instead of assumed. The DoD was
>   not amended — its "as applicable" clause was made to mean something for the
>   first time. Still `report`-level: 27/62.
> - **`Default` is 3 files, not 26.** 23 files open with a better-named
>   controls-driven story (`Month` for DzCalendar, `Fab` for DzSpeedDial,
>   `ListLayout` for DzDataView); renaming them to `Default` would make the docs
>   *worse*. The rule is now "binds `args`", and applies only where `meta`
>   declares `args`/`argTypes` — anatomy pages like `DzDataParts` have no single
>   component to drive (its nominal `component` cannot render standalone).
> - **`DarkMode` is decorator usage, not export name** — 15 files apply
>   `darkModeDecorator` to a differently-named story.
> - **Missing descriptions were 16, not 49 — and all 16 already had prose.** Every
>   one was *displaced*: Storybook's `enrichCsfMeta` reads only the Babel
>   `leadingComments` of the `const meta` statement, and Babel attaches a comment
>   to the statement that FOLLOWS it — so a doc comment separated from `const meta`
>   by fixture data attaches to the fixture and renders nowhere. `DzDataGrid`,
>   `DzTree`, `DzCascader` and 12 others had good prose no user could read. Fixed
>   by relocating the block, not by writing new copy.
>
> **Found en route, and now reported:** `controls-live` — **23 pages declare
> `argTypes`, so Storybook renders a Controls panel, but no story binds `args`**;
> every knob in those panels is inert. That is the sharper form of DoD item 1 and
> the next check to promote (132/155).
>
> **Known blind spot, stated in the validator:** `dark-mode` is a regex. It cannot
> tell a correct preview from a broken one — a component that portals its panel
> out (`<Teleport to="body">` in DzPopconfirm/DzTour, Reka `DialogPortal` in
> DzSheetContent) escapes the decorator's wrapper `div` and resolves the **light**
> tokens. Those stories must also set `globals: { theme: 'dark' }`. The a11y run
> and Chromatic are what catch this, not the validator.
>
> **Not done:** the `gallery` (13/167), `accessibility` (102/167), `real-world`
> (98/167) and `states` (27/62) checks remain `report`-level. Promote one by
> changing its `level` once its straggler list is empty.

```xml
<role>
You are a design-system maintainer. You wrote a Definition of Done into the Contributing guide and
then never machine-checked it, and you have just measured how far the corpus drifted.
</role>

<task>
Make the story Definition of Done in `Contributing.mdx:40-50` a machine-enforced gate, and close the
gap for the families that fail it worst.
</task>

<motivation>
`Contributing.mdx:40-50` mandates 7 items per story file. Measured across the 167 non-gallery story
files:

    Default        141 / 167     (26 missing)
    *Gallery       95 / 167      (43% missing)
    States         33 / 167      (80% MISSING)
    DarkMode       130 / 167     (37 missing — incl. DzAppShell, DzSidebar, DzTour, DzPopconfirm)
    Accessibility  102 / 167     (65 missing)
    RealWorld*     98 / 167      (69 missing — incl. all 5 compositions)

And **49 of 176 files have no component description at all** — neither a JSDoc above `const meta` nor
an explicit `parameters.docs.description.component`. The Data family is worst: **11 of 22** files have
no description. A component page with no prose is an API dump.

The DoD is documented and nothing enforces it. That is the same shape as every other finding in this
audit.

Note the genuine strengths, which this task must not disturb: **257 `play()` functions across 163 of
176 files**, 155 files with `argTypes`, and 167 with a `status:*` tag. The story corpus is *strong* —
the gaps are specific and closable.
</motivation>

<requirements>
  <validator>Write a validator (in `packages/tooling/src/validators/`, alongside `story-status.ts`)
    that parses every `*.stories.ts` and asserts the DoD. Wire it into `validate:all` and CI, exactly
    as TASK-FREE-12 does for `story-status`.</validator>
  <ratchet>Do NOT turn it on at full strength against 167 files at once. Ratchet it: start with the
    checks that are nearly met (`Default` 141/167, `DarkMode` 130/167), enforce those, then work down.
    Record the per-check counts in the validator's output so the remaining distance is always visible.</ratchet>
  <descriptions>Close the 49 missing component descriptions. Each must say what the component is FOR
    and when to reach for it — not restate its name. Prioritise the 11 in Data.</descriptions>
  <states>`States` is missing from 134 of 167 files — the single biggest gap. Decide whether the DoD
    item is right: is a `States` story genuinely required for, say, `DzVisuallyHidden`? If the DoD is
    over-broad, AMEND THE DOD and say so. Do not create 134 hollow stories to satisfy a rule nobody
    believed in. Whichever way you go, the doc and the corpus must agree at the end.</states>
  <gallery_exempt>The 9 `_gallery` files are exempt from the DoD (they are visual matrices, not
    component pages) — but TASK-FREE-12 may delete them entirely. Coordinate.</gallery_exempt>
</requirements>

<steps>
  1. Re-derive the six DoD counts yourself; do not trust the numbers above without checking.
  2. Take the `States` decision first — it determines whether this task is 30 files or 164.
  3. Write the validator with per-check counts in its output.
  4. Enforce the two nearly-met checks; fix their stragglers.
  5. Write the 49 missing component descriptions, Data first.
  6. Wire the validator into `validate:all` and CI at its current ratchet position.
  7. Record the remaining distance so the next person can continue the ratchet.
</steps>

<success_criteria>
  - A DoD validator exists, runs in `validate:all` and CI, and reports per-check counts.
  - Every story file has a component description.
  - The `Default` and `DarkMode` checks are enforced and green.
  - `Contributing.mdx` and the enforced DoD agree — if the DoD was amended, it says so.
</success_criteria>
```

---

## [x] TASK-FREE-16 — Close the landing's test blind spots and retire `apps/sandbox`

> **Landed 2026-07-16.** Landing suite **1,657 → 1,918 tests, 30 files, green**.
>
> - **Router head machinery** — `apps/landing/src/router.head.spec.ts` (15 tests):
>   `applyHead` writes and restores, `DEFAULT_HEAD` fallback, `absoluteImage`,
>   og:url↔canonical, JSON-LD replaced-not-accumulated, robots set-and-cleared,
>   `scrollBehavior`. Asserts the real `document.head`.
>   **It is a separate file from `router.spec.ts` for a load-bearing reason:**
>   `DEFAULT_HEAD` is a module-load snapshot, so under jsdom a plain top-level
>   import snapshots ten empty strings and every "restores the default" assertion
>   passes against `''`. The head is seeded first, then the router is imported
>   dynamically. A guard test asserts the seed took, so the suite cannot go vacuous.
>   **Mutation-tested:** no-op'ing `removeJsonLd` and `absoluteImage` failed
>   exactly the 3 predicted tests.
> - **Templates + demos** — `templates/render.spec.ts`, `gallery/render.spec.ts`:
>   108 tests (44 templates + 59 demos + 5 meta), driven from the registries, each
>   its own named test. Mutation-tested too: dropping the `__asyncLoader()`
>   force-resolve failed 59/59 demo tests, confirming the Suspense false-pass trap
>   is really caught. **Found a real bug:** `morphing-dialog`'s `class="morph"` was
>   silently dropped (DzMorph's root is a fragment, so attrs can't auto-inherit)
>   and no `.morph` rule existed anywhere — a dead class; removed.
>   *Registry-shape correction:* templates use a bare dynamic `import()`, not
>   `defineAsyncComponent` — only the 59 demos need `__asyncLoader()`.
> - **The 12 pages were already covered** by `pages.a11y.spec.ts` (mount + one-h1 +
>   axe + focus + announcer), and `router.spec.ts` already covered the 404/slug
>   guards. The audit's "the router is completely untested / zero page tests" was
>   **stale** — TASK-FREE-08/09/10 added them. Only the head machinery was uncovered.
> - **Coverage** — `apps/*/src` is inside the gate at its measured floor
>   (statements 89 · branches 88 · functions **65** · lines 89), as a per-glob
>   threshold so `packages/` keeps its 80s. `functions` is the real gap: mount-and-
>   assert tests never invoke most handlers/factories.
>   **`testTimeout` 30s → 60s was required, not incidental:** under v8
>   instrumentation the `/blocks` axe sweep measures **35.2s**, so at 30s it timed
>   out *only* in `yarn test:coverage` — the job that gates merges.
> - **`apps/sandbox` retired**, with its gate ported first, not dropped:
>   `validate:sandbox-parity` → **`validate:contract-parity`**
>   (`packages/tooling/src/validators/contract-parity.ts` + spec), which asserts the
>   same thing against the story corpus. Measured before deleting: the sandbox
>   imported **150** components, the stories import **203**, and **0** were
>   sandbox-only — so nothing lost coverage and 53 components gained it. The port
>   also let the old validator's `KNOWN_UNCOVERED` list be deleted entirely: every
>   entry (`DzAppShell`, `DzSidebar*`) had since gained a spec. Also removed from
>   `tsconfig.json` references and the yarn workspace.
> - **e2e visual snapshots** — the `hero snapshot` test now carries a prominent
>   LOCAL-ONLY block explaining that only `…-win32.png` baselines are committed, why
>   CI greps for `renders real pixels` instead (that guard is pixel-histogram-based
>   and platform-independent), and exactly what to do to make it a CI gate. Linux
>   baselines were not committed — they cannot be generated from this Windows
>   checkout.
>
> **Found en route (unrelated to this task, fixed):** the story-color codemod had
> rewritten the CSS *property* `border` into a Tailwind class **inside `style="…"`
> strings** — 10 declarations across 4 files, e.g.
> `border border-[var(--dz-border)]: none;`. Browsers silently drop those, so
> `DzAppShell`/`DzSidebar` buttons rendered with a default border and `DzBlockUI`'s
> panel had none. Repaired; a probe of the current codemod confirms it now only
> touches `class=`/`:class=` attributes, so it will not recur.

```xml
<role>
You are a test engineer. You have found a well-tested app with a hole in exactly the place the tests
were hardest to write, and a dead app that is still a CI gate.
</role>

<task>
Test the landing's router head-management logic and its 12 pages, bring the apps under a coverage
threshold, and retire the abandoned `apps/sandbox`.
</task>

<motivation>
The landing test suite is genuinely good: 22 spec files, **1,657 passing tests**, including an axe
sweep over all 87 blocks in **both themes** (`src/blocks/a11y.spec.ts`) with a meta-test asserting the
rendered trust marks are a subset of the checks actually enforced (`certifications.ts`). That is
better than most libraries do. The blind spots are specific:

  • **The router is completely untested.** `router.ts:364-513` is ~150 lines of DOM head manipulation —
    `applyHead`, the `DEFAULT_HEAD` capture-and-reset, `absoluteImage`, the JSON-LD injection, the
    slug-resolution guards, the View Transitions guard, `scrollBehavior`. It is the most intricate
    logic in the app and it has **zero tests**. Every SEO defect in TASK-FREE-08 would have been
    caught by a test of this file.
  • **All 12 pages are untested.** Zero page-level tests, zero page-level a11y tests (TASK-FREE-10
    adds the latter).
  • **44 templates and 60 animation demos have no render test at all.** The blocks are covered; these
    are not.
  • **Coverage thresholds do not apply to the apps.** `vitest.config.ts:34` —
    `coverage.include: ['packages/*/src/**']`. The 80% gate (`ci.yml:426`) excludes `apps/` entirely.
  • **`apps/sandbox` is dead.** Last commit **2026-06-09**; `docs/tasks.md` describes migrating it
    into Storybook, which happened. It is not built, not deployed, not in CI — yet
    `yarn validate:sandbox-parity` still gates every PR against it (`ci.yml:117`), and it is one of
    the three apps `eslint apps/` now has to lint (TASK-FREE-05).
</motivation>

<requirements>
  <router>Test `router.ts` properly: `applyHead` sets and REMOVES each tag; `DEFAULT_HEAD` is captured
    once and restored on routes with no `meta.head`; `absoluteImage` produces absolute URLs against
    `SITE_ORIGIN`; the JSON-LD block is replaced not duplicated on repeat navigation; unknown
    block/template slugs resolve per TASK-FREE-09; `scrollBehavior` returns the right value for hash
    vs. plain navigation. Assert on the real `document.head`, not on a mock.</router>
  <pages>Add a smoke render test for each of the 12 pages: it mounts, it has exactly one `<h1>`
    (TASK-FREE-10), it does not warn. Remember the landing a11y harness gotchas — force-resolve
    `__asyncLoader()` before mounting (Suspense + flush yields an empty pass), never wipe
    `document.body` in `afterEach` (it breaks Teleport unmount), and polyfill `matchMedia`.</pages>
  <templates>Add a render smoke test over all 44 templates and all 60 animation demos — mount, assert
    no error, no console warning. Cheap, and it would catch a broken template before a user copies it.</templates>
  <coverage>Add `apps/*/src/**` to `coverage.include` and set a threshold. Start at whatever the
    measured number is, rounded down — a threshold below the current value is a ratchet, not a rubber
    stamp. Raise it in a follow-up.</coverage>
  <sandbox>Retire `apps/sandbox`: delete it, and delete `validate:sandbox-parity` from
    `package.json:32`, `validate:all` (`:41`) and `ci.yml:117`. Before deleting, check whether
    `sandbox-contract-parity.ts` asserts anything the Storybook does not — if it does, port that
    assertion to the Storybook first. Do not delete a gate without replacing what it covered.</sandbox>
  <win32_snapshots>`apps/landing/e2e/visual.spec.ts` snapshots are `…-chromium-win32.png` only, so the
    hero screenshot assertions never run on the Linux CI runner (`ci.yml:375` greps for
    `"renders real pixels"` to skip them). Either commit Linux baselines or state plainly in the file
    that the screenshots are a local-only check — do not leave it looking like CI coverage it is not.</win32_snapshots>
</requirements>

<steps>
  1. Write the router tests first — they are the highest value and they will fail against today's
     code in ways that confirm TASK-FREE-08's findings.
  2. Add the 12 page smoke tests, then the 44 template and 60 demo render tests.
  3. Measure app coverage; set `coverage.include` and a threshold at the measured floor.
  4. Audit `sandbox-contract-parity.ts` for anything unique; port it if so; then delete the sandbox
     and its gate.
  5. Resolve the win32-only snapshot situation.
  6. `yarn test` green; the coverage gate green.
</steps>

<success_criteria>
  - `router.ts`'s head management, guards and `scrollBehavior` are covered by tests that assert on the
    real `document.head`.
  - All 12 pages, 44 templates and 60 demos have a render smoke test.
  - `apps/*/src` is inside the coverage gate with a real threshold.
  - `apps/sandbox` and `validate:sandbox-parity` are gone, with anything unique they covered ported first.
  - The e2e visual snapshots either run in CI or are labelled as local-only.
</success_criteria>
```

---

## [x] TASK-FREE-17 — Storybook configuration polish

> **Landed 2026-07-16.** All six items closed. Verified by driving the built static
> app in Chromium, not by reading the config: picking **Mobile (375px)** really does
> resize the preview iframe to 375px.
>
> **Two of the six motivations did not survive contact.**
> - **"No way to preview at mobile or tablet width" was wrong.** The viewport tool
>   was already in the toolbar with Storybook's default set (`Small mobile`,
>   `Tablet`, …) — the grep for `viewport` in `.storybook/` missed it because the
>   tool ships in *core*, registered by the common-server preset, not by our config.
>   What was actually missing is that the set was **ours nowhere**: the token-derived
>   `RESPONSIVE_VIEWPORTS` in `stories/_shared/options.ts` was registered *per story*
>   and only three (`DzAppShell`, `DzContainer`, `DzGrid`) opted in. It is now global,
>   so all 205 components get it — and its widths are read from `BREAKPOINTS`.
>   `mobile` (375) is kept as a deliberate non-token and documented as such: the
>   scale starts at `sm` 640, so no token describes a phone.
> - **The Storybook version skew had moved.** The manifest says `^10.4.3` and the
>   lockfile resolved **10.4.6** — correct semver, not a skew. The real one was a
>   root `resolutions` pin (`@storybook/addon-vitest: 10.3.4`, added 2026-06-08 when
>   core *was* 10.3.4) holding the addon a minor behind the core it plugs into.
>   Dropping the stale pin floated it to 10.5.1 and inverted the skew (it then
>   demanded `storybook@^10.5.1` as a peer), so the whole stack was lifted to
>   **^10.5.1** together. No resolution needed now; `yarn storybook:build` green.
>
> **The hex check found real drift on its first run**, exactly as the task suspected:
> `neutral.600` was `#717171` (a flat grey) against a token resolving to `#585b60`
> (the hue-260 tinted grey) — the manager's light-mode `barTextColor`. All four
> status-badge colours were also *Tailwind's* amber/blue/green/red-700 rather than
> dzup-ui's own ramp of the same names. The literals now live in
> `.storybook/brandPalette.ts`, each paired with the token it mirrors;
> `packages/tooling/src/token-checks/manager-brand-palette.spec.ts` recomputes every
> one from `tokens.css` via a new `oklchToHex()` and fails on drift. The comparison
> is **exact** — the conversion reproduces the ramp to the byte, so a tolerance would
> only hide drift. Confirmed the check fails when the old `#717171` is reintroduced.
>
> Also: manager theme now subscribes to the `MediaQueryList` (it was a one-shot
> `.matches` read that could never fire twice) and gained a toolbar override
> (system → light → dark, persisted); `postinstall: playwright install chromium`
> removed from the root install path (CI installs Chromium explicitly at both call
> sites; `yarn storybook:install` remains for contributors); dead
> `tsconfig.json:25` include removed.

```xml
<role>
You are a Storybook maintainer closing the small gaps that separate a good docs app from a
professional one.
</role>

<task>
Add viewports and backgrounds, fix the manager theme's staleness and its hardcoded hex drift, and
resolve the Storybook version/lockfile skew.
</task>

<motivation>
Six smaller config issues, none individually blocking, all visible to every user of the docs:

  1. **No viewports, no backgrounds, no `globalTypes`.** Grep `viewport|backgrounds|globalTypes|
     initialGlobals` across `.storybook/` → zero hits. **There is no way to preview any component at
     mobile or tablet width.** For a responsive component library this is a conspicuous hole — and it
     is directly connected to the fact that the landing's block trust marks deliberately WITHHOLD a
     "Responsive" mark (`certifications.ts:12-16`) because no automated check backs it.

  2. **`manager.ts:101-104` reads `prefers-color-scheme` once at module load** and never re-reads it.
     A user who switches OS theme mid-session gets mismatched manager chrome until they reload. There
     is also no manual manager-theme toggle.

  3. **`manager.ts:20-32` hardcodes 11 hex literals** that must be kept in sync with
     `packages/tokens/dist/tokens.css` by hand — the comment at `:17` admits it. Nothing checks the
     sync. (The manager runs outside the token iframe, so literals are *necessary*; a **check** that
     they still match the tokens is not.)

  4. **Version skew.** `apps/storybook/package.json:46` pins `storybook: ^10.4.3`; the resolved install
     is **10.3.4**. CI runs `yarn install --immutable`, so CI runs 10.3.4 too — the manifest and the
     lockfile disagree about the minimum.

  5. **`postinstall: "playwright install chromium"`** (`apps/storybook/package.json:11`) downloads
     ~150 MB on **every** `yarn install` in the entire monorepo, for every contributor, including those
     who never open the Storybook — and CI then re-runs it explicitly at `ci.yml:268`.

  6. **`tsconfig.json:25`** includes `../../packages/core/src/**/*.stories.ts` — a dead include; there
     are zero story files under `packages/core/src`.
</motivation>

<requirements>
  <viewports>Configure a viewport set (at minimum: mobile 375, tablet 768, desktop 1280, wide 1600) in
    `preview.ts`. Use the token breakpoints from `@dzup-ui/tokens` (`primitives/breakpoints.ts`) rather
    than inventing new numbers — the docs must demo the same breakpoints the library ships.</viewports>
  <backgrounds>Add a backgrounds set driven by the theme tokens (surface / muted / inverse), so a
    component can be checked against the real surfaces it will sit on.</backgrounds>
  <manager_theme>Make the manager theme react to `prefers-color-scheme` changes (listen to the
    `MediaQueryList` rather than reading it once) and add a manual override.</manager_theme>
  <hex_check>Add a check that the 11 manager hex literals still match their token values — a small
    spec in `packages/tooling` that reads `tokens.css` and compares. The literals are unavoidable;
    the drift is not.</hex_check>
  <versions>Resolve the storybook version skew: either relax the manifest to `^10.3.4` or refresh the
    lockfile to 10.4.3. State which and why.</versions>
  <postinstall>Move the Playwright browser download out of the root install path — make it an explicit
    `storybook:install` step (one already exists at root `package.json:59`) rather than a
    `postinstall`. Contributors who never run the Storybook should not pay 150 MB.</postinstall>
  <dead_include>Remove the dead `tsconfig.json:25` include.</dead_include>
</requirements>

<steps>
  1. Add viewports + backgrounds from the token values; verify a component visibly re-flows at 375px.
  2. Fix the manager theme reactivity; add the manual toggle.
  3. Write the hex-vs-token sync check; run it (it may already be drifted — fix if so).
  4. Resolve the version skew and the postinstall.
  5. Remove the dead tsconfig include.
  6. `yarn storybook:build` green; open the built app and check the viewport toolbar works.
</steps>

<success_criteria>
  - A viewport toolbar with token-derived breakpoints, and a token-derived backgrounds set.
  - The manager theme follows the OS theme live and can be overridden manually.
  - A check enforces the manager hex ↔ token sync.
  - The manifest and lockfile agree on the Storybook version.
  - `yarn install` at the repo root no longer downloads Chromium.
</success_criteria>
```

---

## [x] TASK-FREE-18 — Clear the stale planning comments and the dead flags

> **Landed 2026-07-16.** The unglamorous pass turned up something that was not
> unglamorous at all.
>
> **CI's `test` job was structurally red on every fresh clone.** Chasing the
> generated-file policy exposed it: `apps/landing/src/generated/counts.ts` and
> `ogImages.ts` were **never committed** (`git log` → no history), yet the root
> `vitest.config.ts` includes `apps/*/src/**/*.spec.ts`, and `claims.spec.ts:44` and
> `router.head.spec.ts:24` import them *statically*. CI runs `yarn install && yarn
> test` with no generation step between, so neither spec could resolve its imports.
> Confirmed empirically by moving `counts.ts` aside: the spec fails to load. Both
> files are now committed, which repairs the job.
>
> **The policy decided itself.** The task offered "gitignore it or stop regenerating
> it" for `liveStats.ts`; both are wrong. `build-stats.ts` is deliberately fail-safe
> and reads the *previously committed* numbers as its offline fallback, so
> gitignoring it would destroy that degradation path. Generated files stay committed
> — documented in a new `src/generated/README.md`. The churn was fixed at the source
> instead: `generatedAt` now advances only when a metric actually changes, so an
> unchanged build rewrites the file byte-identically (verified across two runs). The
> generated module's own docstring was updated to match the new meaning.
>
> **The drift guard found real drift.** `public/r/**` (281 tracked files) now gets
> the same `git diff --exit-code` guard `packages/tokens/dist` has. It was needed:
> 91 registry files were stale, still advertising the pre-404 `/blocks#<id>` anchors
> and carrying an outdated block source (`sidebarCollapsed = v` vs the fixed
> `v === true`). All five generators verified idempotent before gating CI on them.
> `liveStats.ts` is excluded from the guard — it depends on live APIs and is the one
> file here that is not a pure function of the source tree.
>
> **Three audit claims did not reproduce.** The `catalog.ts` "Tasks 3–9" comment was
> already gone; the `/pro` "Phase 1 renders a coming soon" comment is **accurate**
> (the page really does render a waitlist state, badge and all) and was kept; and the
> `/animations` and templates-registry "placeholder" comments no longer exist. Two
> stale comments the audit missed were fixed: `router.ts:183` and `:211` both claimed
> unknown ids "redirect to the gallery" when `resolveBlockId` routes to a 404 without
> changing the URL. Also corrected: `build-component-index.ts` and
> `build-og-images.ts` described their own outputs' tracked-ness *exactly inverted*.
>
> `PRO_LIVE` deleted (zero consumers; the Phase-2 flip is a code change, not a flag).
> `useScrollReveal.ts` shim deleted and both importers moved to `../motion/index.ts`.
> `.env.example` added (one var: `VITE_ENABLE_LIVE_STATS`).
> `apps/storybook/stories/_data/counts.generated.ts` gitignored — unlike the landing
> copy, `storybook build` regenerates it before anything reads it.
>
> Landing: `vue-tsc` 0 errors, 1918/1918 tests pass.

```xml
<role>
You are an engineer doing the unglamorous pass that makes the codebase tell the truth about itself.
</role>

<task>
Delete or correct the comments that describe shipped features as unbuilt placeholders, and remove the
flags and shims that nothing reads.
</task>

<motivation>
`apps/landing/src/router.ts` still narrates a project that finished months ago:

  • `:121-122` — "Phase 1: renders a 'coming soon'" … for a 120-line `/pro` page.
  • `:129-130` — "The index page is a **placeholder until the catalog lands** (Task A3)" … above a
    route that lists **87 blocks**.
  • `:96-98` — "**The registry is empty during the foundation phase**, so every slug currently
    resolves here" … for a registry with **44 templates**.
  • `:206-207` — "**Placeholder page** until the gallery shell + catalog land (Task 2)" … for a
    671-line live gallery with 60 effects.
  • `gallery/catalog.ts:12` — "Tasks 3–9 fill in the remaining ~30 effects" … they are filled in.

And three things are dead:

  • `config.ts:143` — `PRO_LIVE` is declared and **read by nothing** (grep → zero consumers). The
    entire Phase-1/Phase-2 flag is inert.
  • `composables/useScrollReveal.ts:1-10` — a pure compat re-export shim of
    `../motion/directives/reveal.ts` whose own comment says "prefer importing from `../motion` in new
    code" — still imported by `HomePage.vue:12` and `BlocksIndexPage.vue:17`. An unfinished migration.
  • `generated/liveStats.ts:25` — a **committed generated file** with a baked
    `generatedAt: '2026-07-10'`, rewritten on every build, producing diff churn forever.

Separately, `useLiveStats` is **disabled by default**: `useLiveStats.ts:52` gates the refresh behind
`VITE_ENABLE_LIVE_STATS === 'true'` and there is **no `.env.example`** in `apps/landing`. So the two
"live" stat tiles are permanently the baked `null`s, and nobody can tell that is a configuration
choice rather than a bug.

None of this breaks anything. All of it makes the next person distrust every comment in the file.
</motivation>

<requirements>
  <comments>Correct or delete the five stale comments. A comment that describes the code as unbuilt
    when it is built is worse than no comment — the next reader must be able to trust what they read.</comments>
  <pro_live>Either wire `PRO_LIVE` to something real (it was designed to flip the `/pro` route target
    in Phase 2) or delete it. A flag nothing reads is a lie about the architecture.</pro_live>
  <shim>Finish the `useScrollReveal` migration: update the two importers to `../motion` and delete the
    shim.</shim>
  <generated>Either gitignore `src/generated/liveStats.ts` (it is generated on every build, like
    `public/r/**`) or stop regenerating it. Pick one; the current state guarantees churn.</generated>
  <env>Add `apps/landing/.env.example` documenting `VITE_ENABLE_LIVE_STATS` and any other env var the
    app reads, so the disabled-by-default behaviour is discoverable.</env>
  <registry_drift>`apps/landing/public/r/**` has **281 tracked files** that are also regenerated by
    `build:registry` on every build. Unlike `packages/tokens/dist` — which CI guards with
    `git diff --exit-code` after regenerating (`ci.yml:130-133`) — nothing checks that the committed
    registry still matches its source. Add the same guard, or gitignore it. Committed-and-regenerated
    with no drift check is the worst of both.</registry_drift>
</requirements>

<steps>
  1. Fix the five comments.
  2. Decide `PRO_LIVE`: wire it or delete it.
  3. Migrate the two `useScrollReveal` importers; delete the shim.
  4. Decide the generated-file policy for `liveStats.ts` and `public/r/**`; if they stay committed,
     add the `git diff --exit-code` regeneration guard to CI, mirroring the tokens one.
  5. Write `.env.example`.
  6. `yarn workspace @dzup-ui/landing build` green; `yarn test` green.
</steps>

<success_criteria>
  - No comment in `router.ts` or `catalog.ts` describes a shipped feature as a placeholder.
  - `PRO_LIVE` is either load-bearing or gone.
  - `useScrollReveal.ts` is gone and its importers use `../motion`.
  - Generated files are either gitignored or guarded by a CI regeneration diff check.
  - `.env.example` documents every env var the landing reads.
</success_criteria>
```

---

## Suggested execution order

1. **TASK-FREE-01** — nothing else is verifiable until the Storybook builds. It unblocks the
   `storybook` job, the `chromatic` job, TASK-FREE-02, TASK-FREE-03 and TASK-FREE-07, and it fixes a
   broken export in the **published** package. Do it first, alone.
2. **TASK-FREE-02 → TASK-FREE-03** — with the Storybook building, make the landing refuse to ship
   without it, and make the playground load. After these three, the free tier is *buildable* and
   *shippable* for the first time.
3. **TASK-FREE-05** — put the apps under lint and typecheck **before** the big content tasks, so
   everything after this lands clean. It is two commits: mechanical, then real.
4. **TASK-FREE-04** — the honesty pass. Do it before TASK-FREE-07: do not deploy "147 components" to
   a public URL.
5. **TASK-FREE-07** — deploy. The whole point of the free tier.
6. **TASK-FREE-06, 08, 09, 10, 11** — the P1 quality pass, parallelizable. TASK-FREE-06 (a11y ratchet)
   is the one with a hard dependency inside it: the `--dz-warning-foreground` token fix gates the
   contrast backlog, so start there.
7. ~~**TASK-FREE-12, 13** — wire the orphaned validators and trim the payload.~~ **Done 2026-07-16**
   (see each task's Outcome). Two things came out of them that outlive the tasks: the landing's
   **mobile LCP is 3.08–4.34s against a 2.5s target on every route** — measured for the first time,
   gated at `warn`, and now the site's biggest open perf item (the lever is TBT, not bytes) — and
   **16 of 44 templates still have no dark thumbnail** (`yarn thumbnails`).
8. **TASK-FREE-14 → 18** — coverage and polish, as capacity allows. TASK-FREE-15 and TASK-FREE-16
   are the ones that stop the debt re-accumulating; do those before TASK-FREE-14's writing marathon.

---

## What was checked and found healthy

For completeness — these were audited and need no action. Several are better than the industry norm
and should not be disturbed by the tasks above:

- **Story coverage is complete.** All 205 `.vue` components are documented: 141 have their own
  `*.stories.ts` and the remaining 64 are compound sub-parts, every one of which is rendered in a
  parent or `*Parts` story. There is **no coverage gap** — despite `Introduction.mdx` implying one.
- **The story corpus is strong**: **257 `play()` functions across 163 of 176 files**, 155 files with
  `argTypes`, 167 with a `status:*` tag, and 168 with a component description. The a11y *audit* runs on
  all 1,393 stories in a real browser; it is only the *enforcement* that is narrow (TASK-FREE-06).
- **Debt markers are essentially zero.** Across `apps/landing/src`, `apps/storybook`, and
  `packages/core/stories`: **0** TODO/FIXME/HACK, **0** `@ts-ignore`/`@ts-expect-error`, **0**
  `console.*` in `src/`, **0** `any`. The four `eslint-disable`s in the landing and the handful in the
  Storybook scripts all carry inline justifications. The debt in these apps is structural, not sloppy.
- **The landing's honesty discipline is real and rare.** `TESTIMONIALS` is deliberately empty with a
  comment refusing to fabricate social proof (`config.ts:151-178`); `useLiveStats` degrades unpublished
  star and download counts to `null` rather than inventing them; `certifications.ts:12-16` explicitly
  *withholds* a "Responsive" trust mark because no automated check backs it, and `:84-97` records known
  a11y debt and strips the affected blocks' marks. **Preserve all of this.** TASK-FREE-04 exists to
  extend that discipline to the numbers, not to weaken it.
- **The landing block a11y suite is genuinely good**: 87 blocks × light + dark × axe (WCAG A/AA),
  1,657 tests passing, plus meta-tests asserting the rendered trust marks are a subset of the checks
  actually enforced. It is honest about what it cannot check (colour contrast, under jsdom).
- **The per-route head machinery** (`router.ts:453-513`) is well engineered — it sets *and correctly
  resets* every tag. TASK-FREE-08 fixes what it is fed, not how it works.
- **`robots.txt` and `sitemap.xml` are generated, complete, and match the route table exactly** (139
  URLs = 8 static + 87 blocks + 44 templates), and `build-sitemap.ts:124-128` fails loud on an empty
  registry.
- **`FACTS.freeComponents` is correctly derived** and its comment states the rule the rest of the repo
  should have followed.
- **The token/registry/llms generation pipeline** (`build-registry.ts`, `build-component-index.ts`,
  `build-llms.mjs`, `build-releases.mjs`) is well built and correctly chained into the builds. Two of
  its *validators* are orphaned (TASK-FREE-03, TASK-FREE-12); the generators themselves are sound.
- **Storybook `autodocs` is correctly wired** — `main.ts:99` `autodocs: 'tag'` plus `tags: ['autodocs']`
  on 167 story files; the build emits 188 docs pages. (Worth stating because it *looks* broken at a
  glance and is not.)
</content>
</invoke>
