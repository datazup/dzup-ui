# TASK-N5-04 — three of four premises measured wrong, one dependency deprecated, and a locale nobody can translate

> **Packet:** TASK-N5-04, the closing packet of the N5 release-engineering lane
> (System Program 2026-09).
> **Repository:** `ui/dzup-ui` on `main` @ `6f1f653`, 0 ahead / 0 behind
> `origin/main`. **HEAD did not move.** The worktree carries the uncommitted
> output of TASK-N5-01/02/03/05; **nothing belonging to another packet was
> reverted, stashed, cleaned or committed.**
> **Decision packet:** [`peer-hygiene-2026-09.md`](./peer-hygiene-2026-09.md).
> **Everything below is a local run.** Locally qualified. Not CI, not release,
> not production evidence.

---

## 1. Headline

The packet was asked to prepare four decisions. Three of the four arrived with a
premise that measurement contradicts.

| # | Premise as handed to this packet | Measured |
|---|---|---|
| D1 | `reka-ui` is a required peer, so **Button-only apps must install it** | **Install: true. Ship: false** — a Button-only bundle contains **zero bytes** of `reka-ui`, and `DzButton` itself never imports it. The requirement comes from the barrel, through one edge: `DzSpeedDial → DzTooltip`. |
| D2 | `lucide-vue-next` is a hard dependency (**icon lock-in**) | True — and the whole library's icon cost is **1,206 gzip bytes**. The finding the premise misses: **the pinned version is deprecated upstream** ("use `@lucide/vue`"), and **two versions are installed in this repository right now**. |
| D3 | Raising the Node floor to `>=22.13.0` **deletes the hand-maintained RTL subtag list** (ADR-20 §4) | **False.** `Intl.Locale.prototype.getTextInfo()` first exists in **Node 24.0.0**. Measured on 20.19.0, 22.13.0, 22.23.2, 23.0.0, 24.0.0, 24.20.0. |
| D4 | One locale ships with **no contribution path** | True, and understated: **the base catalog and its type are unreachable from the published package by every path it exposes.** A translator cannot obtain the 97 strings. |

That makes **four consecutive packets, now five**, whose brief was measurably
wrong — and for the first time the errors run in *both* directions. D1 and D3
overstate the problem; D2 and D4 understate it.

**Implemented:** one report-only reporter (§6). **Prepared but not applied:**
every `package.json` change, in the decision packet, as reviewed text.
**No dependency-graph change shipped.** `packages/core/package.json` is
byte-identical to HEAD.

---

## 2. Findings

### `N5-04-F1` — the peer requirement belongs to the barrel, not the component

`DzButton.vue.js` reaches **5** external packages across a **5-module** graph
and `reka-ui` is not among them. The `./buttons` barrel reaches it through
exactly one edge — `DzSpeedDial` composing `DzTooltip`. `./typography` reaches it
through the same three files.

Measured in a plain-Vite consumer installed from real tarballs, outside the
repository, exit codes read unpiped:

| entry | `reka-ui` | exit | bundle |
|---|---|---:|---|
| `{ DzButton } from '@dzup-ui/core/buttons'` | present | 0 | 161,501 B, **0 occurrences of `reka`** |
| same | **absent** | **1** | `Rollup failed to resolve import "reka-ui" from …/DzTooltip.vue.js` |
| `{ DzCard } from '@dzup-ui/core/cards'` | **absent** | **0** | 150,593 B |
| deep file import of `DzButton.vue.js` | **absent** | **0** | 161,501 B |

Three import paths to `DzButton`, **six bytes** apart. `./cards` is the only
component entry point that reaches neither `reka-ui` nor `lucide-vue-next` — the
repository already has one entry point with the property the reassessment wants.

### `N5-04-F2` 🔴 — `peerDependenciesMeta.optional` alone makes it *worse*, and no gate would catch that

The obvious fix was measured, not assumed. With
`"peerDependenciesMeta": { "reka-ui": { "optional": true } }` patched into the
installed tarball and `reka-ui` removed, the Button-only build still fails —
`exit 1` — and the diagnostic degrades:

```
"TooltipProvider" is not exported by
"__vite-optional-peer-dep:reka-ui:@dzup-ui/core:false",
imported by node_modules/@dzup-ui/core/dist/components/overlays/DzTooltip.vue.js
```

npm stops installing the package that would fix it, and the error now names an
internal Vite pseudo-module. `validate:peers` **already understands**
`peerDependenciesMeta.optional` and would pass this configuration. Shipping the
one-line change on its own would have been a regression that `validate:all`
reports as green.

The paired change *does* work: with a `./components/*` subpath added, a
Button-only build with `reka-ui` absent exits 0 and emits a bundle **byte-identical
(md5 `0780b6f8543b`)** to the deep-file build, while `DzDialog` fails with a
diagnostic naming both the peer and the missing symbol.

### `N5-04-F3` 🔴 — `lucide-vue-next@0.477.0` is deprecated upstream

Emitted by npm during the fixture install and confirmed by `npm view`:

```
npm warn deprecated lucide-vue-next@0.477.0: Package deprecated. Please use @lucide/vue instead.
```

`npm view lucide-vue-next version` → `1.0.0`. The repository pins `^0.477.0` in
`packages/core` and `^0.475.0` in two apps. **This is not in the brief, in any
prior handoff, or in any gate.** It is the strongest argument for D2 and it has
nothing to do with bytes.

### `N5-04-F4` — two `lucide-vue-next` versions are installed simultaneously

`packages/core` declares `^0.477.0` (resolved `0.477.0`, nested);
`apps/landing` and `apps/sandbox` declare `^0.475.0` (resolved `0.475.0`,
hoisted to the root). A caret on a `0.x` version pins the minor, so the ranges
can never unify, and `yarn.lock` carries both. Nothing sees it:
`validate:peers` reads `peerDependencies` only; `validate:externals` checks that
what `dist` imports is *declared*, not that it resolves once.

### `N5-04-F5` — the icon problem is a currency problem, and the bundle number kills the bundle argument

Two builds per entry, differing only in whether `lucide-vue-next` is external:

| entry | delta raw | delta gzip |
|---|---:|---:|
| `DzSelect` | +952 | **+453** |
| `DzPagination` | +1,388 | **+560** |
| **all 433 exports** | +3,438 | **+1,206** |

Core pulls **18 glyphs / 8,769 bytes** of a 1,556-icon, 1,099,363-byte package
(0.8%), plus 1,958 bytes of shared runtime. Meanwhile **`DzIcon` already has the
indirection** — `DzIconProps.icon` is typed `Component` and the file names
`lucide-vue-next` only in prose. The lock-in is 22 module-level imports inside
*other* components that no consumer can reach.

### `N5-04-F6` 🔴 — `getTextInfo()` needs Node 24, not Node 22

ADR-20 §4 rejects `Intl.Locale.prototype.getTextInfo()` "unavailable across this
repository's Node floor" and promises "when the floor moves past it, the list
becomes a one-line delegation." Measured:

| Node | ICU | `getTextInfo` | `.textInfo` |
|---|---|---|---|
| 20.19.0 | 76.1 | absent | present |
| 22.13.0 | 76.1 | **absent** | present |
| 22.23.2 | 78.2 | **absent** | present |
| 23.0.0 | 75.1 | absent | present |
| **24.0.0** | 77.1 | **present** | present |
| 24.20.0 | 78.3 | present | present |

The floor move ADR-18 pre-authorises (`>=22.13.0`) **does not unlock it.** The
ranked note handed to this packet — that raising the floor deletes a
hand-maintained i18n data table — is wrong, and the promise in ADR-20 §4 is
unfalsifiable as written because it names no version.

### `N5-04-F7` — the *predecessor* API is available at the floor and is not a substitute, which makes ADR-20's conclusion right for a better reason

`Intl.Locale.prototype.textInfo` exists on Node 20.19.0. It answers differently
on different Node versions **at the same ICU version**:

```
node 20.19.0 (icu 76.1):  dv=ltr  khw=ltr  arc=ltr
node 22.13.0 (icu 76.1):  dv=rtl  khw=rtl  arc=rtl
```

For a library whose SSR output must match client hydration, a direction resolver
that answers differently on the build machine and the runtime is worse than a
checked-in list. ADR-20's decision to keep the list is correct; its stated reason
("unavailable") is not, and its prediction ("one-line delegation when the floor
moves") is not either.

### `N5-04-F8` — the RTL list has two errors, one of them dead code, and nothing can see either

`packages/core/src/composables/provider/useDzLocale.ts`, 14 entries, measured
against ICU:

- **`'uz-AF'` is dead code.** `directionForLocale` lower-cases before the
  `Set.has()` lookup, so `uz-AF` → `uz-af` misses, the `uz` prefix misses, and
  Uzbek (Afghanistan) resolves `ltr`. ICU says `rtl`. The entry has never worked.
- **`'ha'` is wrong.** The list says rtl, annotated "Ajami"; ICU says `ltr` on
  every Node version measured.

`RTL_LANGUAGES` appears exactly three times in the repository, all inside its own
file. The provider spec asserts only `ar-EG`/`he`/`fa-IR`/`ur-PK` → rtl and
`en-US`/`bs-BA` → ltr — neither error is in the covered set.
**Neither fix requires a floor move**, which is the point: the list is broken
today and would still be broken on Node 22.

### `N5-04-F9` 🔴 — a translator cannot obtain the strings they are asked to translate

Measured against the published tarball, in Node:

```
import('@dzup-ui/core/i18n')                       → ERR_PACKAGE_PATH_NOT_EXPORTED
import('@dzup-ui/core/messages')                   → ERR_PACKAGE_PATH_NOT_EXPORTED
import('@dzup-ui/core/dist/i18n/messages.js')      → ERR_PACKAGE_PATH_NOT_EXPORTED
@dzup-ui/core barrel: 433 exports, of which enMessages / pseudoMessages /
                      useComponentMessages are NOT among them
```

And the type is unreachable too: the augmentation
`declare module '@dzup-ui/contracts' { interface DzMessageCatalog { … } }` lives
only in `dist/i18n/messages.d.ts`, which **nothing reachable from
`dist/index.d.ts` references**. A consumer's TypeScript program therefore sees
the *empty* `DzMessageCatalog` that `contracts` declares. The 97-key contract is
invisible on both the value and the type side.

`DzProvider` accepts a `messages` prop. The base catalog it merges over cannot be
obtained. "No contribution path" is not a documentation gap; it is an artifact
property.

### `N5-04-F10` — `test:nuxt-fixtures:pack` packs whatever `dist/` happens to be on disk

`node packages/nuxt/scripts/pack-fixtures.mjs` runs `yarn workspace <pkg> pack`
with no build step and no freshness assertion. Measured in this working tree: the
tarballs staged at 15:05 on 2026-09-03 were built from a `packages/core/dist`
last written **2026-08-25** — before the TASK-N5-02 ARIA changes present in the
same tree. After `yarn workspace @dzup-ui/core build`, the same pack produced
**583,429 bytes** where the earlier one produced **557,112**.

The Nuxt fixture lane is, in N5-03's own words, "the only existing runtime
observation post". It can silently observe a stale artifact. **This packet
rebuilt before packing** and its numbers are from the fresh dist; the concern is
for the lane, not for these measurements.

### `N5-04-F11` — no i18n parity gate exists, and one locale is what makes that safe

`package.json` has zero scripts matching `i18n|locale|messages|pseudo`.
Completeness is enforced only by `as const satisfies DzMessageCatalog`, which
compares `en` to itself. The pseudo-locale is *derived* from `en`, so it cannot
catch a missing key either. This is sound with one locale and unsound with two.
**The first translated pack is the moment the repository acquires a defect class
it cannot see** — a missing key rendering `undefined` in a language nobody on the
team reads.

---

## 3. `[!owner]` decisions

### `[!owner]` `N5-04-D1` — `reka-ui`: leave it, or buy an entry surface?

**Recommendation: leave it (Option A).** The cost the premise asserts does not
exist — a Button-only app ships zero bytes of Reka (F1). What remains is an
install-time obligation, and the measured price of removing it is freezing 637
emitted module paths as public API (`./components/*`) in a `0.2.0` package that
has not shipped `1.0`. Under `packages/contracts/VERSIONING.md` that makes every
future file move a breaking change.

If the owner wants deep imports for their own sake — a defensible want — **it
must land as a pair.** `peerDependenciesMeta` alone is F2: a measured regression
that `validate:all` reports as green.

Prepared diff: `peer-hygiene-2026-09.md` §1.5. Changeset level **minor
(breaking)**. Two gates would need to learn about a pattern subpath first:
`validate:exports` and `validate:dts`.

### `[!owner]` `N5-04-D2` — the icon contract: currency, substitutability, or both?

**Recommendation: both, sequenced B → C.** Do the currency swap
(`lucide-vue-next` → `@lucide/vue`) **first and alone** — mechanical, separately
reviewable, removes a deprecation warning from every consumer install, depends on
no design decision. Then the icon-slot contract: a tenth provider concern
(`DZ_ICONS_KEY`, 18 role-named slots), `useDzIcons()`, and 22 modules that stop
importing a vendor at module scope.

**Do not argue this on bundle size.** It is 1,206 gzip bytes for the entire
library (F5). Argue it on the fact that the library hard-codes a vendor into 22
components while `DzIcon`'s own JSDoc tells consumers icons are pluggable.

Prepared diffs: §2.5. Requires an **ADR-20 amendment** (the ADR enumerates nine
provider concerns; this is a tenth).

### `[!owner]` `N5-04-D3` — the Node floor

**Recommendation: move to `>=22.13.0`, and stop coupling it to the RTL list.**

ADR-18 already calls `>=22.13.0` "defensible today" and records that Node 20 left
maintenance in April 2026. Moving it drops an EOL major and unpins the Nuxt
fixture matrix from `4.4.5` (N5-03-D4). What it does **not** do is delete the
hand-maintained RTL list — that needs Node ≥ 24.0.0 (F6), and even then the
predecessor API's cross-version disagreement (F7) argues against delegating at
all.

The ADR-18 amendment should carry the measured availability table, so that
"when the floor moves past it" is never quoted again without a version. **ADR-20
§4 and its "Alternatives considered" section must be amended in the same
change** — otherwise the repository is left with two documents promising a
delegation the new floor still cannot perform.

Separately and independently of the floor: **fix the two list errors (F8).**
Prepared diffs: §3.5. Changeset level **minor (breaking)** for the floor.

### `[!owner]` `N5-04-D4` — locale packs

**Recommendation: pack format + parity gate, in the order export → gate → first
pack.**

The ordering is the recommendation. Exporting `./i18n` (F9) converts
"impossible" to "possible" and is a **patch**-level additive change. But **do not
check in a second locale before `validate:i18n-parity` exists** (F11). The
pseudo-locale is what makes that gate writable and exercisable *before* any human
translation exists — it is already a complete, correctly-shaped, machine-derived
catalog, and it should be the reference pack the gate asserts against.

D3 and D4 are the same surface. A pack should **declare** its direction, and
`directionForLocale()`'s subtag list should become the fallback for locales no
pack covers — not the primary mechanism. Prepared diffs: §4.5. Adding the gate
moves `validate:all` from **37** to **38** links; the next packet quoting a link
count needs to know that.

---

## 4. Validation ladder

Narrowest owning command first, then widened. **Every exit code below was read
from the unpiped process**, and every command was re-run without a pipe where a
pipe had been used. The lane's standing warning applies: a piped run of the
`reka-ui`-absent build reported `EXIT=0` over a Vite process that had exited 1.
That is the **fourth** sighting in this lane.

| # | Command | Exit | Result |
|---|---|---:|---|
| 1 | `npx eslint packages/tooling/src/peer-surface.ts packages/tooling/src/peer-surface.spec.ts --max-warnings 0` | 0 | after two fixes: an import-sort violation and `regexp/no-super-linear-backtracking` on the specifier pattern |
| 2 | `npx vitest run packages/tooling/src/peer-surface.spec.ts` | 0 | 10 passed |
| 3 | `npx tsx packages/tooling/src/peer-surface.ts` | 0 | reproduces every §1/§2 number |
| 4 | `yarn lint` | **0** | whole repo, `--max-warnings 0` |
| 5 | `yarn typecheck` | **0** | |
| 6 | `yarn typecheck:all` | **0** | 9 projects |
| 7 | `yarn validate:peers` | **0** | 7 compatible, 0 warnings, 0 incompatible |
| 8 | `yarn validate:externals` | **0** | 8 passed, 0 failed, 1 skipped |
| 9 | `yarn validate:all` | **1** | **37 links, fails at link 16** |
| 10 | `yarn test` | **1** | **2 failed / 504 passed (506 files)**; 9,191 passed / 2 failed / 3 skipped / 1 todo (9,197) |

### `yarn validate:all` — 37 links, exit 1 at link 16

Link 16 is `validate:capability-matrix`:

```
✗ [freshness] packages/core/docs/capability-matrix.json is stale.
1 capability-matrix violation(s).
```

**Inherited. This is N5-03-D1 and the correct state is red.** The matrix was
**not regenerated**; the artifact still overstates, and it should stay red until
the owner decides.

One correction to the brief. It described link 16 as 8 stale cells (7
button-family `visual` plus `DzOrderList`'s perf cell). A fresh build reports
**12 stale cells** — 11 in tier C, 1 in tier D. That reconciles exactly with
N5-03's own §10 table (`stale 10 → 11` for tier C, plus tier D's 1); the brief's
"8" was the *delta* the button family contributes, not the total. Nothing
changed; the number to quote is 12.

Links 1–15 pass. Links 17–37 pass when run individually — the chain is
`&&`-joined and stops. Links 32 (`validate:externals`) and 36 (`validate:peers`),
the two most relevant to this packet's subject, were run individually and pass
(rows 7–8).

### Failures separated

**Tooling failures caused by this packet: none.**

**Inherited, unchanged:**
- `validate:capability-matrix` (link 16) — N5-03-D1, owner-owned, correctly red.
- `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts`
- `packages/tooling/src/validators/story-dod-tiers.spec.ts`

Both spec failures were proven byte-identical to HEAD by TASK-N5-02 and are
untouched here.

**Delta introduced by this packet:** test files 503 → **504**, tests 9,187 →
**9,197** (+1 file, +10 cases), all passing. Failure count unchanged at 2.

### Ratchet movements

**None. Zero.**

- `packages/core/perf/baselines.json` — **not read-modified, not rewritten, not
  replaced.** `yarn perf:capture` was **not run**: it rebuilds every baseline and
  overwrites the file wholesale, which is a baseline replacement this packet has
  no authority for.
- `bundlesize.config.json` — untouched.
- `packages/core/docs/capability-matrix.json` — untouched.
- `packages/tooling/scripts/adr-registry.json` (`maxUndocumented: 14`) —
  untouched. The two ADR amendments recommended in D2/D3 would not change it;
  ADR-18 and ADR-20 are already documented.
- `validate:all` link count — **37 → 37.** The reporter added by this packet is
  deliberately outside the chain.

---

## 5. What I could not verify

- **That the `>=22.13.0` floor is actually installable across all 14 CI pins.**
  Not run. The floor change is prepared text only; it needs a
  `validate-min-runtime` dispatch, which this packet has no authority to trigger.
- **That `@lucide/vue@1.0.0` exports the same 18 identifiers.** Not measured —
  `MoreHorizontal` is already an alias of `ellipsis` in the current package, and
  alias sets change across majors. The D2 prepared diff says to verify this
  before applying it.
- **`DzTreeSelect`'s +5.0% against `packages/core/perf/baselines.json`.** Three
  of four overlapping components land within 1% of the committed medians;
  `DzTreeSelect` does not. The harness differs from `perf:capture` (`dist` vs
  `src` alias, different machine), so one component out of four is not a signal
  and **no regression is claimed**. It is recorded so the next `perf:capture` is
  read rather than skimmed.
- **Anything about a real registry install.** Every measurement used local
  tarballs and `file:` specifiers. No package was published, and the stop
  condition "measurement requires publishing packages" was never reached because
  the tarball route answered every question.
- **`textInfo`'s behaviour on the exact ICU builds CI uses.** The cross-version
  probes ran against `npx node@<v>` binaries on this Windows machine. The
  *disagreement* in F7 is a fact about those binaries; its exact cause (V8 vs ICU
  lookup path) was not root-caused.

---

## 6. Files

### Implemented — additive, reversible, and why

| File | Status | Reversible because |
|---|---|---|
| `packages/tooling/src/peer-surface.ts` | **new** | A new file nothing imports. Delete it and the repository is at its prior state. It is **not a gate**: exit 0 always, no committed baseline, no ratchet, and outside `validate:all` — so removing it cannot un-green anything. |
| `packages/tooling/src/peer-surface.spec.ts` | **new** | New file, 10 cases over pure functions, no fixture checked into the repo (it builds a throwaway package under `tmpdir()` and removes it in `afterAll`). |
| `package.json` | **modified: +2 lines** | `report:peer-surface` and its `//` doc key, adjacent to `report:component-sizes`. No other script references them; `validate:all` is unchanged. |

Why this and nothing else: the packet's stop condition is *"stop when a
'reversible' implementation turns out to touch public API."* Both suggested
implementations do. The locale-pack loader seam requires an `./i18n` subpath
export; the icon indirection type requires a new symbol in
`@dzup-ui/contracts`. Both are *additive* and both are **public API**, so both
stopped at a prepared diff. What was left is the thing that is genuinely
decision-independent: the measurement itself, made reproducible.

### Written

- `docs/program-2026-09/reports/peer-hygiene-2026-09.md` — the four-part packet.
- `docs/program-2026-09/reports/N5-04-peer-hygiene-handoff.md` — this file.

### Untouched, deliberately

- `packages/core/package.json` — byte-identical to HEAD. Every peer, dependency
  and `exports` change lives in the report as text.
- `apps/landing/package.json`, `apps/sandbox/package.json` — the second
  `lucide-vue-next` version is reported (F4), not fixed.
- `packages/core/perf/baselines.json`, `bundlesize.config.json` — no baseline was
  read-modified or replaced.
- `packages/core/docs/capability-matrix.json` — **not regenerated.** Link 16
  stays red.
- `packages/core/src/composables/provider/useDzLocale.ts` — the two RTL errors
  (F8) are reported with a prepared diff. Not applied: `directionForLocale`
  changes rendered direction for `uz-AF` and `ha` consumers, and the whole list
  may be replaced by D3.
- `docs/adr/ADR-18-*.md`, `docs/adr/ADR-20-*.md` — amendments recommended, not
  written. An ADR amendment is an owner act.
- `packages/nuxt/scripts/pack-fixtures.mjs` — F10 is reported, not fixed. It is
  N5-03's file and the fix changes what the fixture lane measures.
- Everything belonging to N5-01/02/03/05. No `git checkout --`, `restore`,
  `stash`, `clean`, `commit` or `push` was run at any point.

---

## 7. What this work refuses to imply

- **It does not imply `reka-ui` is cheap for consumers.** It implies `reka-ui` is
  cheap *for consumers who do not use Reka-backed components*, which is 1 of 12
  component families. A Dialog app pays ~10.7 kB gzip, and `DzDialog`'s own code
  is 584 of them.
- **It does not imply the icon contract is unnecessary because it is small.**
  1,206 gzip bytes is the argument *against* justifying it on size, not against
  building it. The argument for building it is F3 and F5's second half.
- **It does not imply the RTL list should be deleted.** F6 and F7 argue the
  opposite of the note that reached this packet: the list should be *kept*,
  *fixed*, and *documented as a deliberate choice* rather than as a workaround
  waiting on a floor.
- **It does not imply a floor of `>=22.13.0` is safe.** It implies ADR-18 already
  argues for it and that the RTL rationale is not among the reasons. Whether 14
  CI pins and a clean install survive the move is unrun.
- **It does not imply the four decisions are independent.** D3 and D4 are the same
  i18n surface; D1 and D2 are the same "install vs ship" distinction seen twice.
- **It does not imply the measurements are CI evidence.** One machine
  (win32/x64, Node 24.14.1), one afternoon, one dirty worktree. Every number is
  reproducible by the commands in §0 and §6 of the decision packet, and every
  number is *locally qualified* and nothing more.
- **It does not imply `yarn test` and `validate:all` are green.** They are not,
  and the two failures plus link 16 are inherited and correct.

---

## 8. Closing read on the N5 lane

With N5-01, -02, -03, -04 and -05 complete, the lane has produced: a versioning
policy, a working `changeset status`, nine removed lying ARIA props, a Vue-3.6
lane, a Nuxt-4 retarget, a library that Node can now actually `import()`, two ADR
acceptance packets, and this decision packet. **It has published nothing, bumped
nothing, and moved HEAD zero times.** That is exactly what it was told to do,
and it is also the lane's central problem.

**The single highest-value next packet: dispatch `validate-min-runtime` and the
`nuxt-majors` matrix, and land the exports-loadability gate N5-03 recommended
(`N5-03-D3`(2)).**

Not because those are the largest gaps, but because they are the ones that
convert this lane's output from *claims* into *evidence*. The lane's two most
serious findings — N5-03's `@dzup-ui/contracts` that Node could not load, and
this packet's F2 — are the same defect: **a configuration that every gate calls
green and that no consumer can use.** Thirty-seven validate links, 9,197 tests
and `typecheck:all` all passed over a package whose published entry point threw
`ERR_MODULE_NOT_FOUND`, because every one of them resolves like a bundler.
`peerDependenciesMeta.optional` would have passed `validate:peers` the same way.
A gate that `import()`s each published `exports` target under Node, plus one CI
job that has actually run at the declared floor, closes that class. Everything
else in the backlog is a refinement of gates that already work.

**The single greatest threat to the credibility of everything this lane
produced: the distance between what the gates measure and what a consumer
installs — and the fact that the one harness that closes that distance can
silently measure a stale artifact.**

F10 is the concrete form of it. `test:nuxt-fixtures:pack` runs `yarn pack` with
no build and no freshness assertion, and in this very working tree it produced
tarballs from a `dist` nine days older than the source beside it. The fixture
lane is the repository's only runtime observation post; N5-03's green result on
both Nuxt majors was, on the evidence of the file timestamps, obtained against a
`dist` that predated the ARIA changes sitting in the same tree. That does not
make the result wrong — but nobody can currently tell, and *"nobody can tell"* is
precisely the property this program exists to eliminate. Every downstream claim
that cites the fixture lane inherits that uncertainty. It is a one-line fix, it
is nobody's assigned task, and until it lands the lane's strongest evidence has a
footnote it cannot see.
