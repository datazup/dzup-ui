# TASK-R5-O7 — Token gates and DTCG follow-ons

> **Complete.** Written incrementally across two sessions — the first crashed
> mid-task and this one resumed it (see §2a). Run date 2026-09-15, `main` @
> `99b963a` (did not move), worktree dirty (**685 paths** at the resuming
> session's start, eleven packets' work). Evidence class: **locally qualified,
> worktree-dirty**. No commit/push/publish/CI dispatch/deployment.

## 0. `<done_check>` result — the brief's paths are wrong (premise correction)

All five checks were run. **The first two name files that do not exist:**

| # | `done_check` command | Result |
|---|---|---|
| 1 | `grep -n "schema" packages/tooling/src/validators/tokens-dtcg.ts` | **`No such file or directory`** — the DTCG gate is `packages/tooling/src/token-checks/dtcg-round-trip.ts` |
| 2 | `grep -rn "var(--dz" packages/tooling/src/validators/tokens*.ts` | **`No such file or directory`** — `validate:tokens` is three scripts in `token-checks/` |
| 3 | `ls packages/tokens/dist/tokens.high-contrast.*` | absent |
| 4 | `yarn validate:tokens … grep -c "unused\|cycle"` | no such sections |
| 5 | `ls …/TASK-R5-O7-sync-decision.md` | absent (exit 2) |

`validate:*` for tokens lives in `packages/tooling/src/token-checks/`, not
`…/validators/`. Checks 1–2 are therefore **false-fails on a wrong path**, not
evidence of absence — re-run against the real paths, they still fail, so the
task ran in full. Corrected `done_check` recorded in §7 as **D42**.

## 1. Baseline measurement (before any edit)

*(filled in as the task runs)*

### 1.1 The reference gate found live drift — 51 undeclared names, 18 of them fatal

Measured before any edit, at `99b963a`, over `packages/core/src` (1,140 files):

| Measure | Value |
|---|---|
| Distinct `--dz-*` declared by `dist/tokens.css` | **674** *(matches N2-T1 exactly)* |
| Declared once component CSS + inline styles are added | **814** |
| Distinct `--dz-*` referenced in `packages/core/src` | **436** |
| **Referenced but declared nowhere** | **51** |
| — of those, carrying **no fallback** (declaration is discarded) | **18** |
| — of those, carrying a fallback (consumer hooks) | **33** |

`validate:tokens` is three scripts — `color-lint` (raw colour literals),
`design-md-check` (DESIGN.md freshness), `intent-text-contrast`. **None reads
component source for `var(--dz-*)`.** The gate is therefore **new**, not an
extension, and it is the gate N1-O3 **D4** recommended by name.

## 2. The 18 fatal references (`unknown-token`)

Nine were the **exact G2 defect class** — a real name misspelled, no fallback,
declaration silently dropped by the CSS parser:

| Site | Was | Is now |
|---|---|---|
| `DzMeterGroup.variants.ts:14,74` | `--dz-space-2` | `--dz-spacing-2` |
| `DzMeterGroup.variants.ts:69` | `--dz-space-4`, `--dz-space-1` | `--dz-spacing-4`, `--dz-spacing-1` |
| `DzMeterGroup.variants.ts:74` | `--dz-font-size-sm` | `--dz-text-sm` |
| `DzPersonaSelector.vue:98,107` | `--dz-font-size-xs` | `--dz-text-xs` |
| `DzPersonaSelector.vue:104` | `--dz-font-size-sm` | `--dz-text-sm` |
| `DzTimePicker.variants.ts:113` | `--dz-font-weight-medium` | `--dz-font-medium` |

Every target was verified present in `tokens.css` before the rename. These are
trivial by the `<stop_conditions>` test (a name swap onto an existing token), so
they were fixed here rather than deferred.

The other nine are `DzCodeBlock.tokens.ts` naming component tokens that
`@dzup-ui/tokens` never emits (`--dz-codeblock-radius`, `-font-family`,
`-font-size`, `-line-height`, `-header-padding-x/-y`, `-header-font-size`,
`-line-number-color`, `-line-number-width`). Not trivial — no target token
exists. **`codeBlockTokens` has no consumer at all** and
`DzCodeBlock.variants.ts` styles itself with raw Tailwind utilities, so the map
documents a theming API the component does not implement. Each name was given
the fallback matching the utility the component actually renders today (zero
pixel change) and allowlisted; wiring or deleting the map is **D45**.

## 2a. Crash recovery — what the dead session left, what was repaired

The session that opened this file died immediately after writing §2, with the
words *"Both gates green. Now the high-contrast cascade."* Verified against the
tree before anything was changed:

| What it left | State found | Action |
|---|---|---|
| `token-references.{ts,spec.ts}` + allowlist + ceilings | complete; **exit 0** re-run directly | kept |
| `dtcg-schema.ts`, `json-schema-draft07.ts` (+ specs), `schemas/dtcg-format-2025.10.schema.json` | complete; **exit 0** re-run directly. **Not recorded in §0–§2** — it wrote them after its last handoff append | kept, documented here |
| 9 G2-class token fixes (§2) | present in the three component files | kept |
| `package.json` | both gates registered **and** added to `validate:all` | kept |
| high-contrast cascade | **nothing** — no file, no partial, no stub | built (§3) |

No orphan allowlist entry, no script registered without an implementation, no
partially generated artifact. The "both gates" of its last message are
`validate:tokens:refs` and `validate:tokens:schema`; both were re-run here
reading the exit code directly, not through a pipe, and both returned **0**. Its
design decisions were completed, not re-litigated.

### The one real repair: it never linted its own files, and `validate:all` was red

Running the gates is not running the chain. **`yarn validate:all` failed at
link 2 — `yarn lint` — with 43 errors and 2 warnings in three files the dead
session wrote**, none of them previously reported anywhere:

| File | Errors |
|---|---|
| `token-checks/json-schema-draft07.ts` | 20 (`consistent-list-newline`, `top-level-function`) |
| `token-checks/json-schema-draft07.spec.ts` | 18 (12 formatting + **8 `ts/no-explicit-any`**) |
| `token-checks/token-references.ts` | 5 (`no-unused-capturing-group`, `prefer-w`) |

This is exactly the failure mode the brief warned about from the other angle: the
session verified the thing it built and not the chain it joined, so it reported
"both gates green" over an aggregate its own files had broken. Had I trusted its
last words, this task would have shipped `validate:all` red at link 2 and blamed
link 17.

Repaired: 33 auto-fixable, then by hand —

- the two regexes given non-capturing groups;
- the **eight `any` casts replaced with a typed `at(root, ...path)` path helper**
  rather than suppressed. The casts existed because the mutation tests reach
  deep into a cloned document; the helper gives that traversal an
  index-signature type, so the tests keep working with no `any` and no
  `eslint-disable`.

`eslint packages/tooling/src/token-checks/` → **exit 0**. All three gates re-run
afterwards → **exit 0** each, with identical output. `packages/tooling` tsc is
**13 before and 13 after**, none in `token-checks/`.

One correction to its numbers: §2 says **436** distinct `--dz-*` referenced. The
gate now reports **433**, because its own nine fixes collapsed three misspelled
names onto names already counted. §2 is left as written — it was true when
measured, before the fixes landed.

---

## 3. Implemented files + API effect

### 3.1 The third cascade — `packages/tokens/src/semantic/high-contrast.ts` (new)

115 ABI names, identical to light and dark, valued in **CSS system colours**.

**The map is derived, not written.** An ordered role table is applied to the key
set of `LIGHT_SEMANTIC_TOKENS`, and a name matching no rule **throws at module
load**. This is the point of the file: light and dark are exactly 115 keys with
zero dark-only names, and a second hand-written literal map would hold that
invariant only until someone added a token and updated two files out of three.
Adding a semantic token without deciding its high-contrast role is now a build
failure.

Final distribution over the 115:

`CanvasText 37 · ButtonFace 31 · Canvas 21 · ButtonText 7 · ButtonBorder 7 ·
Highlight 3 · GrayText 3 · LinkText 2 · oklch(0 0 0 / 0.6) 2 · HighlightText 1 ·
Field 1`

Ten of the thirteen permitted system colours are used; the two non-keyword values
are ceiling HC-1. `AccentColor`, `SelectedItem` and `Mark` are deliberately
excluded as unevenly implemented — every role is expressible without them.

**Six ceilings, recorded rather than worked around** (the task's
`<stop_conditions>` — *"when a high-contrast value cannot be expressed in the
token ABI, record the ceiling"*):

| # | Limit | Tokens |
|---|---|---|
| HC-1 | Alpha compositing has no system-colour equivalent; the two scrims keep their light literal | 2 |
| HC-2 | Categorical colour is not expressible — 10 charts, 6 statuses, 2 progress bands all collapse to `CanvasText` | 18 |
| HC-3 | Hover/active collapse onto their base keyword; the OS palette has no hover colour | 21 |
| HC-4 | `GrayText` is ~3.95:1 on white `Canvas` — **below AA**, so `--dz-muted-foreground` is `CanvasText`, not `GrayText` | 3 kept grey |
| HC-5 | The ABI has no `--dz-input-foreground`, so `Field`/`FieldText` is the one pair this cascade cannot state | 1 gap |
| HC-6 | Import order matters for the 3 cross-tier shadowed `--dz-appshell-*` names | 3 |

HC-2 is deliberately **loud**: a chart that renders as one solid colour is
visibly broken, which is the correct signal that it owes a non-colour encoding
under WCAG 1.4.1 anyway. Cycling six keywords would have hidden that behind
colours the OS never promises to keep distinct.

HC-4 is the one place the obvious mapping is wrong. Every reference maps "muted"
to `GrayText`; in a theme whose entire purpose is contrast, that would make muted
body text the one thing that fails AA.

### 3.2 `packages/tokens/src/generate.ts` — a fourth stylesheet

`generateHighContrastCss()` writes **`dist/tokens.high-contrast.css`** (10,128 B,
115 declarations, twice):

- `[data-theme="high-contrast"]` **inside** `@layer dz-tokens` — same tier and
  specificity as `[data-theme="dark"]`, so it behaves like any other theme.
- `@media (forced-colors: active) { :root { … } }` **outside** `@layer`, for the
  reason the reduced-motion block in `tokens.css` is outside it: an override the
  user asked the OS for must always win, and an unlayered rule beats every
  layered one regardless of bundler emit order. Established precedent in this
  exact file, not a new idea.

**`dist/tokens.css` is byte-identical** — md5 `a0bd784b…` before and after, the
same hard requirement N2-T1 held. The new sheet is opt-in (**D46**) so no
existing consumer gains a byte.

`packages/tokens/package.json` gains `"./css/high-contrast"`.
`validate:exports` passes.

### 3.3 `dtcg-round-trip.ts` — extended to three cascades

`checkHighContrastCascade()` adds two check classes:

- **`high-contrast`** — the stylesheet and the token map agree, in both
  directions, by name and value.
- **`high-contrast-parity`** — the opt-in block and the forced-colors block do
  not diverge (the same rule, for the same reason, as the two dark blocks), and
  the third cascade declares exactly the names light *and* dark declare.

It reconstructs from the token map when `dist/` is absent, matching how the gate
already handles `tokens.css`. New stats line:

```
high-contrast:  115 values matched, key-identical to light and dark
                (dist/tokens.high-contrast.css)
```

### 3.4 `packages/tokens/TOKENS.md`

A new subsection under "Themes" documenting the third cascade, the import order
HC-6 depends on, and why the group is absent from the DTCG export.

### 3.5 What was NOT changed

No component. No `--dz-*` name. No token value in light or dark. No Figma work.
`dist/tokens.dtcg.json` is unchanged (800 tokens) — see **D47**.

---

## 4. Focused validation output — exact exit codes, read directly

Every command below was run with `cmd; echo "exit $?"`, never through a pipe.

| Command | Exit | Result |
|---|---|---|
| `packages/tokens tsc --noEmit` | **0** | clean |
| `eslint` (6 files I changed) | **0** | clean after 3 fixes of my own (2 regex, 1 jsdoc) |
| `eslint packages/tooling/src/token-checks/` | **0** | clean after repairing the dead session's 43 errors (§2a) |
| `yarn validate:tokens` | **0** | 0 raw literals · DESIGN.md fresh, 97 refs, 96 AA pairs · intent-text contrast clean |
| `validate:tokens:refs` | **0** | 433 distinct `--dz-*` over 3,310 files · 814 declared (674 from `tokens.css`) · 44 hooks · **271 unused at ceiling** · **0 cycles** |
| `validate:tokens:schema` | **0** | valid against the vendored official DTCG 2025.10 schema |
| `validate:tokens:dtcg` | **0** | 774 typed + 26 untyped · 319 aliases · 649 light + 649 dark vs 674/674 · **115 high-contrast** |
| `validate:exports` | **0** | 0 errors, with the new subpath |
| `vitest packages/tokens/src packages/tooling/src/token-checks` | 1 | **242 passed, 1 failed** — `landing-token-fallbacks`, an inherited KNOWN-RED |

### 4.1 Determinism — measured twice, not asserted

`tokens.generate` run three times. `dist/tokens.high-contrast.css` md5
`e9452dfdc6df88b6b4bd6c5dcb050814` on every run; `dist/tokens.css` md5
`a0bd784b0aa7420b001d8fc0bc364a0f`, unchanged from before the task.

### 4.2 Proof the new checks fail — seeded, confirmed red, restored

Nothing here is believed green on its own word.

| Seed | Expected | Got |
|---|---|---|
| Removed `accent-foreground` from the `CanvasText` rule | pairing check red | **exit 1** — `--dz-accent-foreground (ButtonText) on --dz-accent (Canvas) is not an OS-guaranteed pair` |
| `--dz-ring: Highlight` → `ButtonFace` in the shipped sheet | round-trip red | **exit 1** — 2 issues, one `high-contrast`, one `high-contrast-parity` |

Both restored; hashes re-verified identical afterwards, and both gates returned
to **exit 0**.

**The first seed was not a drill — it is a defect the check found in my own role
table while it was being written.** `--dz-accent` maps to `Canvas` (it is a
subtle background, like `-muted`), but `--dz-accent-foreground` initially fell
through to the generic `-foreground$` rule and became `ButtonText`. `ButtonText`
on `Canvas` is not an OS-guaranteed pair — it merely happens to work on the
default desktop theme. That is exactly the class of bug system colours are
supposed to eliminate, and only the pair table caught it. `HIGH_CONTRAST_PAIRS`
and `GUARANTEED_SYSTEM_PAIRS` exist because of it.

The spec also asserts the fall-through is **reachable** — a rule table ending in
a catch-all would pass every other assertion in the file while silently
defeating the build-time throw.

---

## 5. Aggregate qualification

**`yarn validate:all` was run END-TO-END, twice, exit code read directly from the
process (never through a pipe).**

| Run | Result |
|---|---|
| Before the lint repair | **exit 1 at link 2, `yarn lint`** — 43 errors in the dead session's three files (§2a) |
| After the lint repair | **exit 1 at link 17, `validate:capability-matrix`** — 12 stale cells, `browser-matrix` artifact absent, `DzFileUpload` Tier D cell unrun |

The chain is now **40 links** (38 → 40: `validate:tokens:refs` at 20,
`validate:tokens:schema` at 22 — both after the failing link, so its position is
unchanged). **Links 1–16 pass, including `typecheck` and the repaired `lint`.**
Links 19–22 — the four token links — were additionally each verified
individually at **exit 0**, since the `&&` chain stops at 17 and never reaches
them.

The second run is the documented pre-existing state and **the aggregate is not
called green over it**. The first run is the finding: the dead session's "both
gates green" was true of the gates and false of the chain.

`yarn test` keeps its 2 inherited failures (`landing-token-fallbacks`,
`story-dod-tiers countOpen`). The first appears in my focused run above;
`tokens.css` is byte-identical before and after this task, so it cannot be
caused by it.

**One KNOWN-RED figure is stale and should be re-baselined.** The brief records
`packages/tooling` tsc at **7** errors; measured here it is **13**, across
`anatomy-source{,.spec}`, `perf-bench.spec`, `playground.spec`,
`accept-visual-baseline`, `story-dod-triage`, `at-matrix.spec`,
`component-meta.spec`, `story-dod-tiers.spec` and `vendor-sublayers.spec`.
**Zero are in `token-checks/`** — none is mine. The growth is other packets'
uncommitted work in a shared dirty tree, not a regression from this task.

Maturity reached: **focused-validated**, worktree-dirty. Not
aggregate-qualified, not browser-qualified, not packaged, not released.

---

## 6. Ratchet movements

| Ratchet | Old | New | Direction |
|---|---|---|---|
| `validate:all` links | 38 | **40** | ↑ by the two new gates |
| Semantic cascades emitted | 2 (light, dark) | **3** | new |
| Cascades under the round-trip gate | 2 | **3** | ↑ |
| High-contrast ABI parity | *(no cascade existed)* | **115 / 115 / 115**, key-identical | new ratchet |
| Unused tokens | *(no gate)* | **271** at ceiling | initialised, falls only |
| Alias cycles | *(no gate)* | **0** | initialised, must stay 0 |
| Cross-tier shadowing | 3 at ceiling | **3** at ceiling | unmoved — still `--dz-appshell-*`, see D48 |
| `tokens.dtcg.json` tokens | 800 | **800** | deliberately unmoved (D47) |
| DTCG export cascades | 2 | **2** | unmoved (D47) |
| High-contrast ceilings | — | **6** (HC-1…HC-6) | new, documented |

---

## 7. Owner decisions

`D42` and `D45` were raised by this task before the crash; `D46`–`D49` are new.

### D42 (restated) — the brief's `<done_check>` names two files that do not exist

Token gates live in `packages/tooling/src/token-checks/`, not `.../validators/`.
Checks 1–2 were false-fails on a wrong path. The corrected block:

```bash
grep -n "schema" packages/tooling/src/token-checks/dtcg-schema.ts | head
grep -rn "var(--dz" packages/tooling/src/token-checks/token-references.ts | head -1
ls packages/tokens/dist/tokens.high-contrast.* | head -1
yarn validate:tokens:refs 2>&1 | grep -i -c "unused\|cycle"   # NOT validate:tokens
ls docs/program-2026-09-04/reports/TASK-R5-O7-sync-decision.md
```

Note check 4: the unused and cycle reports live in `validate:tokens:refs`, a
`validate:all` link of its own. Chaining them into `validate:tokens` as the
brief's wording implies would run them twice per aggregate. **Recommendation:**
amend the task file's `done_check`; no code change.

### D46 — high-contrast ships as a separate opt-in stylesheet

**Options:** (a) fold the 115 declarations into `dist/tokens.css`; (b) a separate
`dist/tokens.high-contrast.css` behind a second import.
**Taken: (b).** No component implements the theme yet, so (a) would cost every
consumer bytes for a theme none can select, and would have moved
`declaredByTokensCss` off the 674 that `token-references.spec.ts` pins. (b) keeps
`tokens.css` byte-identical. **Reversal is one line** in `generate.ts` if the
owner later wants it in the default sheet.

### D47 — high-contrast is absent from `tokens.dtcg.json`, and this is a spec limit

DTCG 2025.10 **cannot express a CSS system colour.** Measured against the
vendored official schema: `$type` is an enum of thirteen, and `color` requires a
`colorSpace` with numeric `components`. A system colour is a reference to the
platform, not a value in any colour space.

**Options:** (a) omit the cascade from the export; (b) emit it with a fabricated
oklch/sRGB approximation; (c) emit it under a non-standard `$type`.
**Taken: (a).** (b) would put a value in the interchange file that the library
does not ship — a design tool would render swatches that are not the product, and
the round-trip would compare the export against a value the stylesheet does not
contain. (c) fails the schema gate this same task added.

This is a **compatibility note, not a schema fork** — the task's stop condition
for exactly this case. The guarantee is not lost, only relocated: the round-trip
gate checks the third cascade against its token map in both directions.
**Owner action:** none required. Revisit if DTCG adds a platform-colour type.

### D48 — T1-D1 carried forward: the three cross-tier shadowed `--dz-appshell-*`

Originally **N2-T1 D1** (its §8; the brief's "T1-D1"). Unchanged and still
unresolved: `--dz-appshell-header-bg`, `--dz-appshell-header-border` and
`--dz-appshell-main-bg` are declared by both the semantic tier and a later
component-tier `:root` block. `--dz-appshell-header-border` ships `neutral-300`
while `semantic/light.ts` declares `neutral-200` — the semantic declaration is
dead code, and the other two agree only by luck.

**This task gives it a second reason to be fixed.** Those same three names are
the only ones in the new cascade whose value depends on stylesheet import order
(ceiling **HC-6**): `[data-theme="high-contrast"]` and the component `:root`
block are both specificity (0,1,0), so importing `tokens.css` first (as
documented) makes high-contrast win, and reversing the imports silently leaves
those three at light values.

**Options:** (a) delete the appshell block from `semantic/{light,dark}.ts` —
**changes a shipped border colour in light mode**; (b) delete the colliding
entries from `component/appshell.ts` — keeps today's pixels, loses the
`var(--dz-border)` indirection; (c) leave it, ceiling held at 3.
**Recommendation: (b).** It is the only option that is pixel-neutral today, it
removes HC-6 as a side effect, and it lets `SHADOWED_ACROSS_TIERS` fall 3 → 0.
Still an owner call — it is a token-source change with a visible-pixel risk, and
the task's `<scope>` forbids token changes without an owner pick.

I raised `:root[data-theme="high-contrast"]` (specificity (0,2,0), wins in either
import order) and rejected it: it would drop subtree theming, which
`[data-theme="dark"]` supports. Fixing the double declaration is the right layer.

### D49 — the ABI has no `--dz-input-foreground` (ceiling HC-5)

`--dz-input-bg` maps to `Field`, but input text inherits `--dz-foreground`
(`CanvasText`), so `Field`/`FieldText` is the one OS-guaranteed pair this cascade
cannot state. Safe in practice — every shipping OS theme gives `Field` and
`Canvas` the same value — but it is a gap in the ABI, not a choice made here.
**Options:** (a) add `--dz-input-foreground` to all three cascades; (b) leave it
and keep the ceiling. **Recommendation: (a)**, but it is a token **addition**
across three cascades and the scope boundary forbids taking it here.

### `[!owner]` — Tokens Studio / Figma sync

Full packet at
[`./TASK-R5-O7-sync-decision.md`](./TASK-R5-O7-sync-decision.md).
Recommends **one-way, repo → Figma, after the docs site is live**, and carries a
measurement worth surfacing: of the 311 distinct `oklch()` triples in
`tokens.css`, **29 shift visibly (>0.05 linear) when gamut-mapped into the sRGB
that Figma variables store**, clustered on the **primary blue ramp**. No gate in
this repo can see that divergence, because it happens inside Figma. The
converter was validated against white, black and the three sRGB primaries first.

---

## 8. Ranked next packet

1. **D48 / N2-T1 D1** — one owner decision retires a 🔴 finding, a ratchet
   (3 → 0) and ceiling HC-6 together. Cheapest high-value item on the board.
2. **D45** — wire or delete `DzCodeBlock.tokens.ts`; nine tokens document a
   theming API the component does not implement (N2-T1 F-3 found the same tier
   dead on both ends).
3. **Components under `[data-theme="high-contrast"]`** — the cascade exists and
   is gated, but nothing renders it yet. The natural first consumer is the
   forced-colors column already in the e2e matrix.
4. **HC-2 follow-through** — charts and status indicators need a non-colour
   encoding. They owe it under WCAG 1.4.1 in forced-colors regardless of this
   cascade; the cascade only makes the debt visible.
5. **Re-baseline the KNOWN-RED tooling tsc figure** (7 → 13) so the next session
   is not told a stale number.

---

## 9. `git status --short` — start and end (D5 mitigation)

- **Start of this session:** 685 paths. HEAD `99b963a`.
- **End:** 690 paths. HEAD `99b963a` — **did not move**.

Of the 5 new paths, **2 are mine**: `packages/tokens/src/semantic/high-contrast.ts`
and `…/high-contrast.spec.ts`. (`docs/program-2026-09-04/` is a single untracked
entry, so this report and the decision packet add no path.) The remaining 3 are
concurrent sessions writing the same worktree.

Files this task modified: `package.json`, `packages/tokens/package.json`,
`packages/tokens/TOKENS.md`, `packages/tokens/src/generate.ts`,
`packages/tokens/src/index.ts`, `packages/tokens/src/semantic/index.ts`,
`packages/tooling/src/token-checks/dtcg-round-trip.ts`.

Nothing was checked out, reverted, stashed or regenerated outside
`packages/tokens/dist/`. `DESIGN.md` was rewritten by `tokens:generate` and is
**unchanged** (absent from `git status`). No file on the not-mine list was
touched. No commit, push, publish, CI dispatch, deployment or baseline
replacement.
