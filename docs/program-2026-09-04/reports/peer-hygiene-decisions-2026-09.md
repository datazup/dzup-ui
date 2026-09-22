# Peer and dependency hygiene — the four decisions

> **Packet:** TASK-R1-O6, `docs/program-2026-09-04/release-exit-tasks.md`.
> **Repository:** `ui/dzup-ui` on `main` @ **`527dbd1`** (`feat: land
> program-2026-09-04 R2 — evidence, AT matrix, URL policy, WCAG lanes, perf
> contract`), **not** `99b963a` as the task file says. The worktree carries
> 266 uncommitted paths from TASK-R1-O1…O5 at the time of measurement;
> **nothing belonging to another packet was reverted, stashed, cleaned or
> committed.**
> **Everything below is a local run on 2026-09-21.** Locally qualified. Not CI,
> not release, not production evidence.
> **Predecessor:** [`../../program-2026-09/reports/peer-hygiene-2026-09.md`](../../program-2026-09/reports/peer-hygiene-2026-09.md)
> (TASK-N5-04, measured at `6f1f653`, 2026-09-03). This document supersedes its
> numbers where they have moved and says where.

---

## 0. The decision table

One row per item. **Nothing here has been executed**: a search of
`docs/program-2026-09-04/EXECUTION-STATUS.md`, the three
`docs/program-2026-09/EXECUTION-STATUS*.md` ledgers and every
`reports/*decision*.md` finds **no recorded owner decision** on any of the four,
and TASK-R0-O1 — the packet that would consolidate them — is still `[ ]`.

| # | Item | Options | Recommendation | Blocks | State |
|---|---|---|---|---|---|
| **1** | `lucide-vue-next` → `@lucide/vue` swap **and** the two installed versions | **(a)** swap all three manifests to `@lucide/vue@^1.47.0`, run the codemod, re-record visual baselines · **(b)** align the two app ranges to `^0.477.0`, swap later · **(c)** leave both | **(a)** — it is the only option that clears *both* defects, and the moment is cheapest now because the visual baselines (R2-O6) and the AT matrix (R2-O2) are **not yet locked**. Fallback **(b)** if the owner wants to defer the re-baseline: it is one line per app manifest and clears the red gate on its own. **Changeset `minor`, not `patch`** — see §1.6, where this packet disagrees with N5-04 and says why | `validate:peers` is **red** at `527dbd1` · supply-chain report cleanliness (R1-O3) · criterion C12 | **open — D174 / D175** |
| **2** | `reka-ui` as a non-optional peer | **(a)** leave · **(b)** `peerDependenciesMeta.optional` alone · **(c)** `optional` **+** a `./components/*` subpath surface | **(a) leave, and record it** — N5-04-F1 measured a Button-only bundle at **zero bytes** of `reka-ui`; the requirement is one barrel edge, `DzSpeedDial → DzTooltip`. **(b) is measurably worse than doing nothing** (N5-04-F2) and `validate:peers` would pass it. **(c)** buys a `node_modules` entry for the price of freezing 637 emitted module paths as public API in a `0.2.0` package | nothing today; it is the *reopening condition* in §2.3 that matters | **open — D178 (a formality: record (a))** |
| **3** | The Node floor `^20.19.0 \|\| >=22.13.0` | **(a)** fix the one `globSync` import, keep the floor (R1-O4 **D160**'s recommendation) · **(b)** `>=22.13.0` (N5-04 **D3**'s recommendation; ADR-18 pre-authorises it) · **(c)** `>=24.0.0` | **(b)** — and this packet **differs from R1-O4 D160(a)**, deliberately: (a) fixes one import but leaves an EOL major in the published `engines` that *nothing has ever run green*, and R1-O4 itself says "a sweep is owed, not just this one fix". §3 sets out the disagreement. **(c) is rejected**: Node 22 LTS runs to April 2027 and a library floor that excludes it is aggressive | ADR-18 acceptance text (TASK-R0-O2) · 1.0 criterion **C10** · the Nuxt fixture matrix pin at 4.4.5 (N5-03 **D4**) | **open — D176** |
| **4** | `apps/sandbox` — remove or justify | **(a)** remove the workspace, its deploy configs, **both** its classification entries (changesets `ignore` **and** `release-policy.json`) and its doc references · **(b)** keep, with the justification written · **(c)** retire the **deployment** only, keep the tree | **(c) now, (a) once the owner confirms the Coolify resource can go.** **(a) is not an agent action**: `apps/sandbox` has a *declared production deployment* whose domain **resolves and answers** (§4.2), and no prompt in this programme authorises a deployment or DNS change. Also **measured: removing it does not clear the icon gate** — `apps/landing` declares `^0.475.0` too | the `apps/*` story in TASK-R0-O1 · R1-O3's candidate digest (**D173**) | **open — D177** |

---

## 1. Item 1 — the icon library

### 1.1 What is true at `527dbd1`

Both halves of the N5-04 premise are **still true**, re-measured today by two
independent routes:

| Fact | Route 1 — `yarn.lock` | Route 2 — what is unpacked |
|---|---|---|
| Two versions installed | `lucide-vue-next@npm:^0.475.0` → `0.475.0` and `lucide-vue-next@npm:^0.477.0` → `0.477.0`, two separate blocks | `node_modules/lucide-vue-next/package.json` → **0.475.0** (hoisted); `packages/core/node_modules/lucide-vue-next/package.json` → **0.477.0** (nested) |
| Three declarers | `packages/core` `^0.477.0` · `apps/landing` `^0.475.0` · `apps/sandbox` `^0.475.0` | same |
| Deprecated upstream | — | `npm view lucide-vue-next@0.477.0 deprecated` → *"Package deprecated. Please use @lucide/vue instead."* The **whole package** is deprecated: `npm view lucide-vue-next deprecated` returns the same string for `latest` (`1.0.0`) |

### 1.2 Two more declarers, in surfaces the lockfile cannot see

Found while building the gate, and in neither N5-04 nor the task file:

| Surface | What it declares | Why no gate could see it |
|---|---|---|
| `apps/landing/playground-template/package.json` | `"lucide-vue-next": "^0.475.0"` | It is **not a workspace** — the globs are `packages/*` and `apps/*`, and this sits one level deeper — so `yarn.lock` has no entry for it and `validate:peers` never reads it. It is the manifest a visitor **downloads** |
| `apps/landing/public/r/*.json` | **40 of 89** registry items name `lucide-vue-next` in `dependencies` **and** inline it in their copied file content | Generated build output. `validate:registry` gates their internal consistency (every file resolves, no Pro source, theme layered) but says nothing about *which* icon package they hand out. A `shadcn add` **copies** that list into a consumer's repository and the copy is irrevocable — A4-F5's own reasoning |
| `apps/landing/public/llms-full.txt` | **41** occurrences of `lucide-vue-next` in code samples an MCP client reads | Generated from the metadata artifact; `validate:llms` checks freshness and structure, not dependency currency |

So the swap's real surface is **3 workspace manifests + 1 shipped template + 22
core modules + ~157 `apps/landing` import lines + 5 `apps/sandbox` lines + 40
registry payloads + `llms-full.txt`**, and the last three are generated: they
are fixed by re-running a generator, never by editing.

The gate now carries two clauses for this. `shipped-manifest-ident` **fails**
when the template names an ident no workspace uses any more — the exact shape of
"we swapped the three manifests and forgot the template", which every other
clause would call green. `generated-surface-drift` **reports** the registry
count, because the fix is always `yarn build:registry`.

**The done-check's first clause is a trap.** It reads
`yarn why lucide-vue-next | grep -c 'lucide-vue-next@'` → *"0 (swapped) or 1
(single version)"*. The real value is **5**, because `yarn why` prints one line
per *importer* (three `@dzup-ui/core` workspace instances, `@dzup-ui/landing`,
`@dzup-ui/sandbox`), not one per version. A count of 1 would have meant one
importer, not one version. The gate built by this packet counts versions.

### 1.3 What has moved since N5-04 (2026-09-03 → 2026-09-21)

| N5-04 recorded | Today |
|---|---|
| "`npm view lucide-vue-next version` → `1.0.0`" — quoted as the successor's version | **Two different packages.** `lucide-vue-next` `latest` is `1.0.0` and **deprecated**; the successor `@lucide/vue` is at **`1.47.0`**, published from `lucide-icons/lucide` `packages/vue`, ISC, with npm provenance (SLSA v1) and **no deprecation** |
| Prepared diff pins `"@lucide/vue": "^1.0.0"` | **47 minors stale.** `^1.0.0` would resolve to `1.47.0` anyway under caret, but writing `^1.0.0` records a version nobody measured. Use `^1.47.0` |
| "Verify before applying that `@lucide/vue` exports the same 18 identifiers" | **Verified: 18 of 18 present**, in both `dist/lucide-vue.d.ts` and the ESM barrel's runtime exports. §1.4 |
| "Changeset level: **patch** for core (no public API change)" | **Disputed — `minor`.** §1.6 |
| "this is not a size problem" | **Half true.** It is not a size problem *today*; the swap **adds** ~1 kB gzip. §1.5 |

### 1.4 The mapping table — the swap contract

Full contract, including the codemod and every measured delta:
[`icon-swap-contract-2026-09.md`](./icon-swap-contract-2026-09.md).

**18 identifiers, 22 modules, 0 renames.** Every identifier `@dzup-ui/core`
imports exists in `@lucide/vue@1.47.0` under the same name, so the codemod is a
module-specifier rewrite and nothing else. **`<stop_conditions>` clause
"`@lucide/vue` lacks an icon the library uses" does not fire.**

Three things do change, and they are why this is not a one-line diff:

1. **3 glyphs were redrawn** — `CalendarIcon`, `Clock`, `Filter`. `Filter` is
   now an alias of a *different module* (`funnel.mjs`) with entirely new path
   data.
2. **All 18 rendered `<svg class>` values change** — 0.x emitted
   `lucide lucide-x-icon`, 1.x emits `lucide lucide-x`, and two gain an alias
   class (`lucide-funnel lucide-filter`, `lucide-ellipsis lucide-more-horizontal`).
   **No file in this repository selects on those classes** (one grep, one hit,
   and it is a prose comment in `DzColorModeToggle.vue`) — a *consumer's*
   stylesheet may.
3. **1.x emits `aria-hidden="true"` by default** when an icon carries no
   accessible name and no default slot. 0.x never did. Very probably an
   improvement; still a change to the accessibility tree the AT matrix records.

### 1.5 The bundle numbers, measured today

The 18 glyphs, bundled by esbuild with `vue` external, minified, tree-shaken:

| | raw | gzip |
|---|---:|---:|
| `lucide-vue-next@0.477.0` | 3,337 | 1,376 |
| `@lucide/vue@1.47.0` | 5,769 | 2,444 |
| **delta** | **+2,432** | **+1,068** |

The delta is almost entirely a **fixed runtime cost**, not a per-glyph one:

| glyphs bundled | Δ raw | Δ gzip |
|---:|---:|---:|
| 1 | +1,908 | +864 |
| 5 | +1,995 | +905 |
| 18 | +2,432 | +1,068 |

1.x carries a larger shared runtime — a provider context (`setLucideProps`),
`buildLucideIconNode`, `mergeClasses`, alias class handling, `aria-hidden`
defaulting and non-scaling-stroke support — where 0.x had a 20-line `Icon` and
a `defaultAttributes` object.

**This reverses N5-04's framing.** N5-04 said *"do not argue this on bundle
size, there are only 1,206 of them"*. There are now ~1,068 **more** of them
after the swap, roughly doubling the library's total icon cost. It is still a
kilobyte, and currency still wins the argument — but the swap is not free and
the memo should not pretend it is.

### 1.6 Changeset level — this packet says `minor`, N5-04 said `patch`

Under `packages/contracts/VERSIONING.md` a `0.x` **minor is the breaking
level**. N5-04 called the swap `patch` on the grounds of "no public API
change". Three measured consumer-visible changes say otherwise:

1. every icon's rendered `class` attribute changes (§1.4 (2)) — `data-part` and
   `data-state` are the *contracted* hooks under ADR-19, but a `lucide-*` class
   is a real attribute in shipped DOM and a consumer can select it;
2. `aria-hidden="true"` appears where it did not (§1.4 (3));
3. three glyphs are different drawings (§1.4 (1)).

A `patch` that changes what renders is the kind of release note nobody reads
until it breaks them. **Recommend `minor` for `@dzup-ui/core`**, and it is a
cheap `minor`: the package is `0.2.0` and `validate:release-policy` R5 refuses
`major` anyway.

### 1.7 The cheapest green path, if the owner defers the swap

Option (b): change two lines.

```diff
--- a/apps/landing/package.json
--- a/apps/sandbox/package.json
-    "lucide-vue-next": "^0.475.0",
+    "lucide-vue-next": "^0.477.0",
```

then `yarn install`. **Not applied here**: it rewrites `yarn.lock`, a shared
file in a worktree carrying 266 uncommitted paths from five other packets, and
it would be pure churn if the owner takes (a). `apps/*` are `private` workspaces
under `release-policy.json`, so option (b) carries **no changeset**.

---

## 2. Item 2 — `reka-ui` stays a non-optional peer

### 2.1 The single edge, restated so it is not re-derived

`DzButton.vue.js` reaches **5** external packages across a **5-module** graph
and `reka-ui` is **not** among them. The `./buttons` barrel reaches it through
exactly one edge — **`DzSpeedDial` composing `DzTooltip`** — and `./typography`
through the same three files. Measured by N5-04 in a plain-Vite consumer built
from real tarballs, outside the repository
([`peer-hygiene-2026-09.md`](../../program-2026-09/reports/peer-hygiene-2026-09.md) §1.1):

| entry | `reka-ui` | exit | bundle |
|---|---|---:|---|
| `{ DzButton } from '@dzup-ui/core/buttons'` | present | 0 | 161,501 B, **0 occurrences of `reka`** |
| same | absent | **1** | `Rollup failed to resolve import "reka-ui" from …/DzTooltip.vue.js` |
| `{ DzCard } from '@dzup-ui/core/cards'` | absent | 0 | 150,593 B |
| deep file import of `DzButton.vue.js` | absent | 0 | 161,501 B |

**Install: true. Ship: false.** The obligation is an install-time one and costs
zero shipped bytes.

### 2.2 New input since N5-04: the floor has now been exercised

TASK-R1-O4 built `test:min-peer`, which derives each floor from
`peerDependencies` rather than writing it down, pins it with `resolutions`, and
**asserts the version on disk equals the floor** (exit 2 if not). Its result:
`vue@3.5.0` and **`reka-ui@2.0.0` install under npm's own peer resolution**, a
packed `@dzup-ui/core@0.2.0` installs beside them without lifting either, and
**8 components SSR-render from the tarball at the floor, including the
`reka-ui`-backed `DzTooltip`**.

The `<stop_conditions>` case handed to this packet — *"the min-peer lane cannot
pin a lower `reka-ui` because of a transitive constraint"* — **did not occur**.
There is no transitive constraint to report.

### 2.3 The condition that would reopen this

Reopen **only** when a **per-component entry surface** is wanted for its own
sake (deep imports are what per-component tree-shaking documentation usually
assumes). Then it must land as a **pair**, never alone:

- `"peerDependenciesMeta": { "reka-ui": { "optional": true } }` **plus** a
  `./components/*` subpath in `packages/core`'s `exports`.
- Alone, `optional` is **measurably worse than doing nothing** (N5-04-F2): a
  Button-only build still fails, and the diagnostic degrades from
  `Rollup failed to resolve import "reka-ui"` to
  `"TooltipProvider" is not exported by "__vite-optional-peer-dep:reka-ui:…"`.
  **`validate:peers` already understands `peerDependenciesMeta.optional` and
  would report that configuration green.**
- The price of the pair is freezing **637 emitted module paths** as public API
  in a package that is `0.2.0` and has not shipped `1.0`.

Nothing else reopens it. A second `reka-ui` edge appearing is not a reason —
one edge or ten, the install obligation is identical.

---

## 3. Item 3 — the Node floor

### 3.1 Every input, in one place

| Input | Source | Says |
|---|---|---|
| Node 20 is EOL | ADR-18, verbatim | left maintenance **April 2026**; ADR-18 already calls `>=22.13.0` "defensible today, and … increasingly hard to argue against" |
| Raising to `>=22.13.0` does **not** delete the RTL list | N5-04 **D3**, measured on six Node builds | `Intl.Locale.prototype.getTextInfo()` first exists in **Node 24.0.0**. ADR-20 §4's stated reason is wrong, and so is its prediction |
| The predecessor API is **not** a substitute | N5-04 D3 | `Intl.Locale.prototype.textInfo` exists at the floor and returns **different directions on different Node versions at identical ICU versions** (`dv`/`khw`/`arc`: ltr on 20.19.0, rtl on 22.13.0, both ICU 76.1). For a library whose SSR output must match client hydration, that is worse than a checked-in list |
| The floor pins the Nuxt matrix | N5-03 **D4** | `nuxt ≤ 4.4.5` declares `^20.19.0 \|\| >=22.12.0`; `nuxt ≥ 4.4.6` declares `^22.12.0 \|\| ^24.11.0 \|\| >=26.0.0`. **The Node 20 floor is what pins the fixture matrix at 4.4.5** — and that is a cost, not a benefit |
| **The floor is false on its 20.x branch** | TASK-R1-O4 **D160**, from a CI log | `packages/core/.../landing-token-fallbacks.spec.ts:49` imports `globSync` from `node:fs`; `fs.globSync` is `@since v22.0.0`. `yarn test` **cannot pass** on `20.19.0`, which `.nvmrc` pins. This is 1.0 criterion **C10** |
| **The lane that would have caught it was measuring something else** | TASK-R1-O4 **F2** | `validate-min-runtime` ran `generate:exports:core`, which **rewrites `packages/core/src/index.ts`**, then linted the rewritten file. Every historical red of that job was D158's generator drift misread as a Node-floor failure. **There has never been a green run on the 20.x floor** |

### 3.2 Where this packet differs from TASK-R1-O4 D160

R1-O4 recommended **(a) fix the `globSync` import and keep the floor**, on the
grounds that it is one import in one spec and `^20.19.0` is a published promise.
That is a fair reading and it is the *smaller* change. This packet recommends
**(b) `>=22.13.0`** instead, for three reasons R1-O4 raises but does not weigh:

1. **R1-O4 says the sweep is owed, and nobody has done it.** Its own words:
   *"One `@since v22` API reached the tree unnoticed because nothing runs on the
   floor, and there may be others, and they will only surface one dispatch at a
   time."* Fixing one import restores the *claim* without restoring the
   *evidence*. A floor is only a floor if something green runs on it, and after
   F2 nothing ever has.
2. **Upstream has already decided.** Nuxt ≥ 4.4.6 dropped Node 20. Holding the
   floor keeps `packages/nuxt`'s fixture matrix pinned at 4.4.5 indefinitely —
   the repository is paying for Node 20 with a frozen integration target.
3. **It is a published `engines` promise about an unmaintained runtime.** Node
   20 has received no security updates since 2026-08-20. Advertising it in a
   package heading for 1.0 is the opposite of the supply-chain posture R1-O3
   just built.

(a) remains the right **interim** if the owner wants C10 closed this week
without touching CI: it is one import, and it does not foreclose (b).

### 3.3 What (b) costs, exactly

`yarn validate:engines` holds three declarations plus **14 concrete CI
`node-version:` pins** in agreement, so the change is:

- `package.json` + `packages/mcp/package.json` `engines.node` → `">=22.13.0"`
- `.nvmrc` `20.19.0` → `22.13.0`
- ~14 workflow pins, and `ci.yml`'s unit-test matrix leg
  `['20.19.0','22.13.0']` → `['22.13.0','24.20.0']`
- `CONTRIBUTING.md`
- **an ADR-18 amendment** — and ADR-18 is one of only three ADRs with a
  document, so there is a real text to amend
- **an ADR-20 §4 correction.** Both §4 and its "Alternatives considered"
  section assert the floor is the reason the RTL list exists. Moving the floor
  without amending both leaves two documents promising a delegation the new
  floor still cannot perform. The accurate statement is the one N5-04 measured:
  *`getTextInfo()` requires Node ≥ 24.0.0, and its predecessor `textInfo` —
  which IS available at the floor — returns different directions on different
  Node versions at identical ICU versions, which a library with SSR cannot
  accept.*
- **re-running the Nuxt fixture matrix** against ≥ 4.4.6 once unpinned

Changeset level: **minor (breaking)** — a runtime floor is part of what a
consumer must satisfy.

### 3.4 The list the floor was blamed for is wrong today, and a floor will not fix it

N5-04 measured `RTL_LANGUAGES` in
`packages/core/src/composables/provider/useDzLocale.ts` against ICU on Node
24.20.0 and found **2 of 14 entries wrong**: `'uz-AF'` is dead code
(`directionForLocale` lower-cases before the `Set.has()` lookup, so it can never
match) and `'ha'` is simply wrong (ICU says `ltr` on every Node version tested).
Nothing catches either — the provider spec asserts only `ar-EG`/`he`/`fa-IR`/
`ur-PK` → rtl and `en-US`/`bs-BA` → ltr.

**That is a test-shaped problem, not a floor-shaped one**, and this packet does
not own it: `useDzLocale.ts` belongs to the provider lane (TASK-R5-O3 / R5-O4).
Recorded here so the floor decision is not sold on a benefit it does not
deliver.

---

## 4. Item 4 — `apps/sandbox`

### 4.1 It is a live workspace, and the "abandoned" date is stale

| Fact | Measured at `527dbd1` |
|---|---|
| A workspace? | **Yes.** Root `workspaces` is `["packages/*","apps/*"]`; `apps/sandbox/package.json` is `@dzup-ui/sandbox@0.0.1`, `private: true`; `yarn.lock` carries `"@dzup-ui/sandbox@workspace:apps/sandbox"` |
| Size | **33 tracked files** |
| Linted? | **Yes** — `yarn lint` is `eslint packages/ apps/ e2e/ --max-warnings 0` (widened by TASK-R1-O1) |
| Type-checked? | **No** — `yarn typecheck` is `vue-tsc -p packages/core/tsconfig.json` only |
| In coverage? | **No** — `vitest.config.ts` includes `apps/landing/src/**` explicitly and comments that a wildcard "would silently adopt any future app tree, including the retired `apps/sandbox`" |
| In changesets? | **Yes, as an ignore entry** — `.changeset/config.json` `ignore: [… "@dzup-ui/sandbox"]` |
| "Last touched **2026-06-09**" (`docs/free-apps-audit.md:165`, repeated in `packages/tooling/src/validators/contract-parity.ts`'s doc comment) | **Stale by 11 weeks.** `git log -1 -- apps/sandbox` → **`7984c68`, 2026-08-25**, *"One derivation says how `@dzup-ui/*` resolves, and the apps inherit the RTL fixes"* — it was deliberately maintained after the date two documents call its abandonment |

### 4.2 It has a declared production deployment, and the domain answers

`deploy/sandbox/coolify.json` and `deploy/sandbox/coolify.staging.json` declare
a Coolify resource:

```json
"app": "dzup-ui-sandbox",
"resourceName": "dzup-ui-sandbox-production",
"domains": { "web": "dzup-ui-sandbox.dziphost.com" },
"remoteWorkspaceBuild": { "args": {
  "UI_WORKSPACE": "@dzup-ui/sandbox",
  "UI_DIST_PATH": "apps/sandbox/dist"
} }
```

Measured 2026-09-21, read-only:

| Probe | Result |
|---|---|
| `nslookup dzup-ui-sandbox.dziphost.com` | **resolves** → `213.199.40.69` |
| `curl -I https://dzup-ui-sandbox.dziphost.com/` | TLS handshake **completes**, certificate chain **untrusted** (`SEC_E_UNTRUSTED_ROOT`) |
| `curl -k -o /dev/null -w '%{http_code}' …/` | **503** |
| same, `/healthz` | **503** |

So: a host is listening, presenting an untrusted certificate, and serving 503
on the very path `postBuildAssertions.healthUrl` names. The deployment exists in
DNS and in configuration and is **not serving**. Contrast R1-O5 **D166**, where
`dzup-ui.com` is NXDOMAIN — this one is the opposite failure.

**Removing the workspace is therefore an infrastructure action, not a file
deletion**, and `<authority>` in README §5 withholds it: *"No … deployment,
domain/DNS change … is authorised by any prompt."*

### 4.3 Blast radius of option (a), complete

| Touches | What breaks / must change |
|---|---|
| `apps/sandbox/**` (33 files) | the tree itself |
| `yarn.lock` | the `@dzup-ui/sandbox@workspace:` entry; requires `yarn install` |
| `.changeset/config.json` | the `ignore` entry becomes a dangling name |
| `packages/tooling/scripts/release-policy.json` | it classifies `@dzup-ui/sandbox` as `private` (line 34). **`validate-release-policy.ts` has an explicit dangling-classification clause** — *"release-policy.json classifies X, which is not a workspace package. A renamed or deleted package leaves a stale classification behind"* (**R3**). So the removal breaks **two** classification references, not one, and both are read by the same gate |
| `deploy/sandbox/coolify.json`, `coolify.staging.json` | orphaned; the Coolify resource and the DNS record outlive them (§4.2) |
| `docs/qa/release/2026-09-21-527dbd1/candidate-content-digest.json` | digests **~30** `apps/sandbox/**` paths. Removing them makes R1-O3's candidate digest name deleted files — **exactly D173**, one commit later |
| `apps/docs/evidence/browser-support.md` | cites `apps/sandbox/{package.json,tsconfig.json,vite.config.ts}` as browser-support evidence sources |
| `vitest.config.ts`, `packages/tooling/src/validators/contract-parity.{ts,spec.ts}`, `.github/workflows/ci.yml:148` | comments only — they *explain* the retirement; each becomes a reference to something that no longer exists |
| `docs/{tasks,landing,blocks-old,free-apps-audit,free-apps-review,components/inputs,resolution-external-consumers}.md` | ~10 prose references, several load-bearing (`docs/tasks.md` is titled as the sandbox migration plan) |

**`<stop_conditions>` check:** *"stop and report when removing `apps/sandbox`
breaks a changeset or fixture reference."* It **does** break a changeset
reference — `.changeset/config.json`'s `ignore` array — which
`validate:release-policy` reads. Reported, not executed.

### 4.4 The fact that decides the sequencing

**Removing `apps/sandbox` does not clear the icon gate.** `apps/landing`
declares `lucide-vue-next@^0.475.0` independently, so version `0.475.0` keeps
resolving after the removal. Items 1 and 4 are independent; do not schedule one
to fix the other.

### 4.5 If the owner picks (b) — keep — this is the justification to sign

`apps/sandbox` is the repository's only **consumer-shaped** Vue application
besides `apps/landing`: a plain Vite + Vue 3 + `vue-router` app that imports
`@dzup-ui/core` and `@dzup-ui/tokens` as `workspace:*` and exercises the FOUC
script, the theme composable and the token CSS import the way a real consumer
would. Storybook does not exercise that path; `apps/landing` does, but it is
also the marketing site and its build is tuned for that. Keeping one small,
boring consumer app is cheap (33 files, no coverage obligation, no type gate)
and it is the only place where "does the library work in a plain app?" is
answerable by running something.

The honest counter: it has no tests, no CI job, no coverage floor and a broken
deployment, so today it answers that question only if a human opens it.

---

## 5. Recommended order

1. **D174 (item 1)** — the gate is red now and it is the only red this packet
   introduced. Either (a) or (b) clears it; (b) is two lines.
2. **D178 (item 2)** — a formality. Record "leave" and the reopening condition
   so the next programme does not re-derive it a fourth time.
3. **D176 (item 3)** — it is 1.0 criterion C10 and it blocks the ADR-18 text in
   TASK-R0-O2. Take (a) as the interim this week if (b) needs scheduling.
4. **D177 (item 4)** — lowest urgency and the highest blast radius; it belongs
   with the `apps/*` story in TASK-R0-O1, and its deployment half is infra.

---

## 6. Reproduction

```bash
cd ui/dzup-ui

# the gate, and the proof it fires
yarn validate:icon-duplicates;            echo "exit $?"   # 1 today
yarn validate:icon-duplicates --self-test; echo "exit $?"  # 0: 4 defects caught, 1 control passed
yarn validate:icon-duplicates --json > /tmp/icons.json

# the two versions, by two routes
yarn why lucide-vue-next
node -e "console.log(require('./node_modules/lucide-vue-next/package.json').version)"                 # 0.475.0
node -e "console.log(require('./packages/core/node_modules/lucide-vue-next/package.json').version)"   # 0.477.0

# the successor, and the deprecation
npm view @lucide/vue version                       # 1.47.0
npm view lucide-vue-next@0.477.0 deprecated        # "Package deprecated. Please use @lucide/vue instead."

# the codemod contract
node node_modules/vitest/vitest.mjs run packages/codemods/src/transforms/__tests__/swap-icon-library.spec.ts

# the sandbox deployment
nslookup dzup-ui-sandbox.dziphost.com
curl -sSk -o /dev/null -w "%{http_code}\n" https://dzup-ui-sandbox.dziphost.com/healthz
git log -1 --format='%h %ad %s' --date=short -- apps/sandbox
```
