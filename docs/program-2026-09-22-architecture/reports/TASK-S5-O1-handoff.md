# TASK-S5-O1 — i18n completeness: the completeness gate, the contribution path, plural rules, the RTL route, the Arabic typeface — handoff

> **All numbers bound to `main` @ `4e4e46f` plus this repository's uncommitted
> working tree (~250 dirty paths from eight prior tasks, preserved).**
> README §2 says `589be13`; that is STALE — quote `4e4e46f`.
> Locally qualified only: not CI, release or production evidence.

## Progress log (written while running)

- **Started 2026-09-24** at `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`, 250 dirty paths (pre-existing, preserved).
- `validate:all` measured at start: **54 `&&` links**. Pending changesets: **42**.
- `<done_check>` run first, per README §4. Result: **2 of 4 pass** (details in §0).
- Discovery: R5-O4 (2026-09-17) already closed three of the five sub-deliverables. Details in §0.

---

## 0. done_check outcome and what was found already done

### done_check — **2 of 4 at `4e4e46f`**

| # | Clause | Result | Evidence |
|---|---|---|---|
| 1 | `ls packages/core/src/i18n/locales/` → `de.json` present | **PASS** | `de.json`, `en.json` |
| 2 | `npx tsx packages/tooling/src/validators/i18n-completeness.ts` → gate exists, prints per-locale % | **FAIL** (before this task) | `ls: No such file or directory` (exit 2) |
| 3 | `node -e "…scripts…startsWith('i18n')"` → an `i18n:new` lane exists | **FAIL** (before this task) | printed empty string; the scaffold existed only as `generate:i18n-packs --scaffold <tag>` |
| 4 | `grep -rn 'plural' packages/core/src/i18n/*.spec.ts` → plural-category tests for a non-English rule set | **PASS** | `message-format.spec.ts:40` (Bosnian `one/few/other`), `:48` (French zero-is-singular), `:54` (Arabic `zero one two few many other`), `:61` (Arabic-Indic digits); `count-bearing.spec.ts:135` (Bosnian host pack) |

**Re-run at the end of the task: 4 of 4 pass** (clause 2 in its safe form) — gate
present and exit 0, `i18n:new` + `i18n:check` present, `validate:all` at **55**
links, the new spec **50 passed**. The recorded score for the ledger is the
**entry** score, **2 of 4 at `4e4e46f`**.

**Defective clauses (2 of 4).** Consistent with all eight prior tasks finding at
least one.

- **Clause 2 is a toolchain defect, not a content defect**: it prescribes `npx`,
  which in this repository fetches dependency-confusion placeholders that
  **exit 0 without running** — a false green. The runnable form is
  `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/i18n-completeness.ts`.
  Every `npx` line in this task's `<validation>` block has the same defect.
  Recorded as a correction; the `<validation>` block was executed in the safe form.
- **Clause 2's second defect**: it is the only clause that can decide the task's
  headline question ("is there a completeness gate?") and it names a path that
  did not exist, so a fresh agent reading only `<done_check>` cannot distinguish
  "not built" from "built elsewhere". `validate:i18n-packs` *did* already own
  four of the six checks the gate needs (see §0.2) — the check gave no way to see
  that.
- **Clause 3 is under-specified**: it asks only that *some* `i18n*`-prefixed
  script exist, which a no-op would satisfy. It also cannot see that the scaffold
  capability already existed under a different name
  (`generate:i18n-packs --scaffold <tag>`), so running it naively would have
  produced a **duplicate scaffold implementation**. Checked the code first
  (README §4.6) and wired `i18n:new` to the existing implementation instead.
- **Clause 4 passed, and it retires task step 3 as stated.** Plural categories
  for non-English rule sets were already tested at `4e4e46f`. The residual gap
  it cannot see is a *different* question — see §0.3.
- The `<validation>` block also writes to `/tmp`, which is **not writable on this
  host** (`/usr/bin/bash: /tmp_out.txt: Permission denied`, reproduced). Every log
  went to the session scratchpad; **no log file was written into the repository**,
  and every exit code was read from a file rather than through a pipe.

### 0.1 The prompt's gap statement is partly stale

The `_Gap:_` note says "no landing route renders RTL" and "AR-2 found zero
Arabic typefaces vendored … the R5-O4 packet did the engineering and stopped on
two owner inputs". Measured at `4e4e46f`, **R5-O4 went further than the gap note
records**:

| Prompt step | State at `4e4e46f` | Cited, not rebuilt |
|---|---|---|
| 3 — plural/select proved on a non-English rule set | **Already done** | `packages/core/src/i18n/message-format.spec.ts` (Bosnian, French, Arabic 6-category); `count-bearing.spec.ts` |
| 4 — one route renders RTL end to end | **Already done** | `apps/landing/e2e/rtl.spec.ts` (2 tests, titles carry `rtl`); fix was `apps/landing/src/App.vue` wrapping every route in `DzProvider :direction` (R5-O4 **D62**). Ratchet "landing routes proven RTL end to end 0 → 1" already moved on 2026-09-17. |
| 5 — Arabic typeface decision sheet | **Already done, still open** | `docs/program-2026-09-04/reports/TASK-R5-O4-typeface-decision.md` = decision **D63** (rec. C now / B opt-in token / A never in `core.css`) |
| 2 — contribution path | **Partly done** | `packages/core/docs/i18n.md`, `CONTRIBUTING.md` "Translations" |
| 1 — completeness gate with per-locale % | **Missing** | this task |
| 2 — `yarn i18n:new <tag>` | **Missing as a lane**; capability existed | this task |

So this task's real residual is narrower than its prose: **the gate, the `i18n:*`
lanes, a plural-category check at the *data* level, and the two decision sheets
brought up to date.** The rest is cited.

### 0.2 `validate:i18n-packs` already owns four of the six checks the gate needs

Read before writing anything (README §4.6). `packages/tooling/src/validators/i18n-packs.ts`
(425 lines, 9 rules) already enforces, per catalog key:

| The prompt asks for | `i18n-packs` rule | Verdict |
|---|---|---|
| missing keys | 1 `missing` / `both` | **already covered** |
| extra keys | 2 `unknown` / `duplicate` | **already covered** |
| placeholder arity mismatches | 4 `arguments` (names **and** selector kind) + 3 `syntax` | **already covered** |
| per-locale counts | `PackCoverage` — prints `de scaffold 0/116 translated, 116 explicit fallback` | counts yes, **percentage no** |
| untranslated-identical values | — | **not covered** |
| a per-locale completeness percentage | — | **not covered** |
| plural-category correctness *per locale's own CLDR rule set* | — | **not covered** (see §0.3) |
| the Arabic typeface absence made visible in a gate | — | **not covered** |

**Decision: a separate gate, extending rather than duplicating.**
`i18n-completeness.ts` imports `checkPack`, `flattenCatalog`, `catalogKeys` and
`LOCALES_DIR` from `i18n-packs.ts` and derives its arity/missing columns from the
same `checkPack()` call, so the two gates cannot disagree. Rationale for two
files rather than one: `i18n-packs` answers *"is this pack structurally valid and
is every key accounted for"* — a **structural** question with a binary answer,
already a `validate:all` link with a 16-spec seeded-failure suite. The
completeness gate answers the **product** question — *"how much of this locale is
really translated, is it grammatically correct for its own plural rule set, and
does its script have a typeface"* — which carries a **ratchet** (`minSupportedLocales`)
and a **declared-scaffold register**. Folding a ratchet file and a decision
register into a structural validator would make one gate's failure mean two
different things. Both stay short; neither duplicates a line of logic.

### 0.3 The plural gap is at the *data* level, not the formatter level

`message-format.ts:96` holds `PLURAL_CATEGORIES = {zero, one, two, few, many, other}`
and `:258` rejects a selector that is not one of them. That is a **global CLDR
name check**. What nothing checks is the **per-locale requirement**:

```
packages/core/src/i18n/message-format.ts:434
  out += render(exact ?? node.options[category] ?? node.options.other!, count)
```

A Polish pack whose `{count, plural, …}` declares only `one` and `other` parses,
passes `validate:i18n-packs` rule 4 (same argument, same selector kind), and at
runtime **silently falls through to `other`** for `few` (2–4) and `many` (5+) —
grammatically wrong Polish, invisible to every existing gate. Arabic needs six
categories and would fall through on four of them. This is the defect class the
prompt's `<formatter_first>` requirement is about, and it is a *pack* rule, not a
formatter rule: the formatter's fallback is correct behaviour for a pack that is
still being filled; what is missing is a gate that says the pack is not finished.

Implemented as rule `plural-categories`, driven by
`Intl.PluralRules(locale, { type }).resolvedOptions().pluralCategories` — no
hand-written table, per the prompt's requirement.

### 0.4 Contribution path: what existed, what was missing

`packages/core/docs/i18n.md` §5 "Contributing a locale pack" (6 numbered steps)
and `CONTRIBUTING.md` "Translations" already existed (R5-O4). The Storybook
toolbar already carries **both** contributor controls —
`apps/storybook/.storybook/preview.ts:156` `direction` ("Render every story
right-to-left, under an Arabic locale") and `:169` `pseudoLocale` ("accented,
padded +30% and framed in `[!!! !!!]`"). Discovery item 4 asked whether the
pseudo-locale is a contributor's first test: **it is available but the
contribution path never named it** — `pseudoMessages()` is internal and not
reachable from the published package, so the toolbar is the only route and the
docs did not say so. Fixed by extending §5, not rewriting it.

### 0.5 Measured baseline at `4e4e46f`

| Measurement | Value |
|---|---|
| catalog keys (`enMessages` flattened) | **116** (R5-O4 recorded 110; +6 from later tasks) |
| `en.json` | 116/116 translated, 0 fallback, `complete`, published |
| `de.json` | **0/116 translated, 116 explicit fallback**, `scaffold`, unpublished |
| `validate:i18n-packs` | exit 0, 0 violations |
| font binaries tracked (`git ls-files` for `woff/woff2/ttf/otf`) | **0** — AR-2's finding still holds |
| landing routes proven RTL end to end | **1** (`/blocks`, `apps/landing/e2e/rtl.spec.ts`) |
| `validate:all` links | **54**, exits 1 at link 50 `validate:peers` (pre-existing D174/D175) |

---

## 1. Implemented files and API effect

**No published API surface changed.** Everything new lives in
`@dzup-ui/tooling`, which is `private: true`, and in root scripts and docs.
`packages/core/docs/` is not in `packages/core/package.json` `files`
(`["LICENSE","README.md","dist"]`), so the docs edits are not published either.
**Therefore no changeset** — a version bump with no consumer-visible change is
noise, and `yarn validate:changelog` exits 0 without one. Pending changesets stay
at **42**.

### New

| File | What |
|---|---|
| `packages/tooling/src/validators/i18n-completeness.ts` | The gate. Four failing rules (`plural-categories`, `undeclared-scaffold`, `stale-declaration`, `supported-floor`) plus `arity` re-reported from `i18n-packs`, and one report-only class (`script-support`). Exported pure functions: `requiredPluralCategories`, `pluralUses`, `pluralCategoryGaps`, `isUntranslated`, `scriptForLocale`, `trackedFontBinaries`, `scriptFontToken`, `measurePack`, `checkRegister`, `renderTable`, `scriptFindings`, `readConfig`. Imports `checkPack`/`flattenCatalog`/`catalogKeys`/`LOCALES_DIR` from `i18n-packs.ts` and `parseMessage` from Core's `message-format.ts` — no logic duplicated. |
| `packages/tooling/src/validators/i18n-completeness.spec.ts` | **50 specs**, every failing rule seeded once. The plural block asserts Polish, Arabic, Welsh, Japanese, Russian-ordinal and English category sets with **no translation in the repository** — it tests category sets, never a translated sentence. |
| `packages/tooling/src/validators/i18n-completeness-ceilings.json` | `supported.minSupportedLocales` (**1**, `min`-direction so `validate:stop-conditions` SC-7 watches it), `supported.minCompletenessPercent` (**95**), the `scaffolds` register (`de`, D59, with `blockedOn`), and the `scriptSupport` register (latin / arabic / hebrew, each with `provisionedBy`, `decision`, `wouldBeProvisionedBy`). |
| `docs/…/reports/TASK-S5-O1-typeface-decision.md` | Refreshed D63 sheet: three OFL candidates with the obligation that actually bites each, the size cost reported **unmeasured with the exact `pyftsubset` command and why it was not run**, and the measurements that *were* taken. |
| `docs/…/reports/TASK-S5-O1-translator-decision.md` | D59 sheet: 116 keys / 44 groups / 318 words / 1,896 chars / 82 keys at 1–2 words / 10 plurals, and a derived 3.5–6.5 h estimate with its assumptions stated. |

### Changed

| File | What |
|---|---|
| `package.json` | `validate:i18n-completeness` (+ its `//` rationale), chained as **link 10** of `validate:all` directly after `validate:i18n-packs`; `i18n:new` (a **lane over** `i18n-packs.ts --scaffold`, not a second implementation); `i18n:check` (`validate:i18n-packs && validate:i18n-completeness`). |
| `packages/tooling/src/validators/stop-conditions.json` | `i18n-completeness-ceilings.json` added to `ceilingFiles`, so SC-7 watches the new floor. Strictly more coverage; no allowlist widened. |
| `packages/core/docs/i18n.md` | Status header re-bound to `4e4e46f` (116 keys, 1 supported locale); §4 pack table 110 → 116 with a completeness column and the "completeness ≠ translated" rule; a new "The second gate" section documenting all four rules and why script findings never fail; §5 rewritten from 6 to 8 steps — `yarn i18n:new`, the Storybook pseudo-locale/RTL pre-flight as **step 2** rather than an afterthought, the per-language plural requirement, `yarn i18n:check`, and the `minSupportedLocales` raise as the act that makes "two locales ship" a gated fact. |
| `CONTRIBUTING.md` | "Translations" 4 steps → 5, with the measured key count (116), the Storybook pre-flight, and the per-language plural point. |

### The hole this closes, stated exactly

A pack with **all 116 values copied verbatim from English** and an `exports`
entry passes `validate:i18n-packs` completely — `complete 116/116`, zero
violations — and ships English as German. Seeded and measured: the completeness
gate reads it **0 %, `supported: false`**
(`i18n-completeness.spec.ts` → "a pack that copied English wholesale reads 0 %,
not 100 %"). That is the gate's headline value; the plural rule is the second.

---

## 2. Focused validation

Every exit code read from a file, never through a pipe. `/tmp` is not writable on
this host, so the `<validation>` block's `/tmp/s5o1-validate-all.log` redirect was
reproduced failing and every log went to the session scratchpad.

| Command (run as written, except `npx` → `node node_modules/tsx/dist/cli.mjs`) | Exit |
|---|---|
| `yarn validate:i18n-completeness` | **0** |
| `yarn validate:i18n-packs` | **0** |
| `yarn i18n:check` (both, in order) | **0** |
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/i18n-completeness.spec.ts` | **0** — **50 passed** |
| `… packages/core/src/i18n … + i18n-completeness.spec.ts + i18n-packs.spec.ts` | **0** — 6 files, **132 passed** |
| `yarn validate:rtl` | **0** |
| `yarn validate:hardcoded-strings` | **0** |
| `yarn validate:changelog` | **0** (no changeset needed — nothing published changed) |
| `yarn validate:doc-snippets` · `yarn validate:docs-size` | **0** · **0** |
| `yarn typecheck` | **0** |
| `yarn typecheck:tooling` | **0** (first run **2**, **1 error, mine**: an unused `directionForLocale` import left from a draft that resolved direction locally before `checkPack` was found to already do it — removed) |
| `yarn lint` (touched files) | **0** (first run **1**, **5 errors, all mine**: import order, named-import order, an arrow at top level, an `it` title starting `AR-2`, and one double-quoted `join(", ")`. **Fixed by hand — `eslint --fix` was not used**, per the standing warning that it corrupted a string literal here) |
| `yarn validate:stop-conditions` | **1 — PRE-EXISTING**, and **not a `validate:all` link.** SC-1 (dirty tree — 253 paths, by design), SC-3, SC-5, SC-8 fired and SC-11 is unattested; SC-7 is `unevaluable` because the previous release candidate `2026-09-21-527dbd1` records no `ratchets.json`. None of the five relates to this task's ceilings file; registering it in `ceilingFiles` only widens SC-7's coverage. |

### The gate's output, verbatim at `4e4e46f`

```
i18n completeness — 116 catalog keys, 2 pack(s)

| Locale | Dir | Keys | Translated | Identical-to-en | Missing | Arity errors | Plural-category errors | Completeness |
|---|---|---:|---:|---:|---:|---:|---:|---|
| de | ltr | 116 | 0 | 0 | 0 | 0 | 0 | 0 % (scaffold — owner: name a translator (TASK-S5-O1 decision 1, carries R5-O4 D59), decision D59) |
| en | ltr | 116 | — | — | 0 | 0 | 0 | source (100 %) |

locales at >= 95 % completeness: 1 (en) — floor 1

script/typeface provisioning (report-only, never fails this gate):
  [script-support] latin: token-stack — pack(s): de, en
  [script-support] arabic: none — decision D63; 0 font binaries tracked in this repository, so the host supplies the face — no pack exercises it (forward declaration — unasserted, not passing)
  [script-support] hebrew: none — decision D63; 0 font binaries tracked in this repository, so the host supplies the face — no pack exercises it (forward declaration — unasserted, not passing)

i18n completeness: 2 pack(s) measured, 0 violation(s)
```

**Per-locale completeness: `en` source (100 %), `de` 0 %.** One locale at or above
the threshold. The figure to quote is **"1 locale supported, 1 declared scaffold at
0 %, 0 non-conforming"** — never "2 locales".

### Seeded drift — every failing rule proved on real files, with no invented translation

Three seeded runs, each reverted; the locales directory is back to `de.json` +
`en.json` and `git status` shows no `ar.json` or `pl.json`.

1. **`i18n:new` + `undeclared-scaffold`.** `yarn i18n:new ar` → exit 0, wrote
   `ar.json` with `"direction": "rtl"` resolved automatically and 116 explicit
   fallbacks. Gate → **exit 1**, `[undeclared-scaffold] … "ar" is 0 % complete,
   below the 95 % supported threshold, and is not listed in scaffolds`. The
   Arabic script row simultaneously flipped from `no pack exercises it` to
   `pack(s): ar`. File deleted.
2. **`plural-categories` + `identical`.** Scaffolded `pl.json`, then moved
   **the English string, verbatim** (`{count, plural, one {# day} other {# days}}`)
   under `DzCountdown.days` — not a translation, and that is the point. Gate →
   **exit 1**, row `pl | ltr | 116 | 1 | 1 | 0 | 0 | 1 | 0 %`:
   `[plural-categories] … {count} declares no "few", "many" branch, and pl selects
   cardinal few, many, one, other — the formatter would render `other` for those
   counts, which is the wrong form in this language`. One value translated,
   one identical, completeness still 0 %. File deleted.
3. **A finding about the *other* gate, from run 2.** With `pl.json` holding that
   one English-copied value, `yarn validate:i18n-packs` → **exit 1**:
   `[export] "pl" has translations but no "./i18n/locales/pl.json" export`. Its
   rule 9 counts **one** value as "has translations", so it demands publication of
   a pack that is 0 % complete by this gate's measure. It fails closed (a human
   must add the export), so it ships nothing — but the two gates' notions of
   "published" and "supported" disagree. Recorded as **finding F1**; a proposed
   fix is in §6.

The remaining rules (`stale-declaration` ×2 shapes, `supported-floor`, `arity`,
the unused-category report, `=N` not substituting for a category, and the
copied-wholesale case) are seeded in `i18n-completeness.spec.ts` — in memory, so
no fabricated pack ever reaches disk.

---

## 3. Aggregate qualification

`yarn validate:all` run **end to end once**, exit code read from a file:

```
validate:all exit 1
```

**Link count measured, not quoted: 55** (`node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"`)
— 54 at the start of this task, +1 for `validate:i18n-completeness` inserted as
**link 10**.

| | |
|---|---|
| **Sole red** | **link 51 `validate:peers`** — `✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may` (`^0.475.0` from `@dzup-ui/landing` + `@dzup-ui/sandbox`, `^0.477.0` from `@dzup-ui/core`). **PRE-EXISTING**, open decision **D174/D175** (the `lucide-vue-next` → `@lucide/vue` swap). **Not this task's**, and not touched. |
| **Links 1–50** | **green in that run**, including this task's new **link 10**, which printed `i18n completeness — 116 catalog keys, 2 pack(s) … 0 violation(s)` inside the aggregate (log lines 11–25) directly after `validate:i18n-packs`'s `0 violations` (lines 6–10). |
| **Links 52–55** | **never reached** in the aggregate (the chain is `&&`). Run individually: `validate:licenses` **0** · `validate:tree-shake` **0** · `validate:evidence-binding` **0** · `validate:deprecations` **0**. |
| **Green total** | **50 of 55** reached-and-green + 4 verified individually = **54 of 55 exit 0**; 1 pre-existing red. |

**Nothing new went red.** The red's position moved 50 → **51** purely because a
link was inserted ahead of it; a report quoting "link 50" is now stale, as the
EXECUTION-STATUS note records.

### Other lanes

| Lane | Result |
|---|---|
| `yarn typecheck` | **0** |
| `yarn typecheck:tooling` | **0** (one self-inflicted error on the first run, fixed) |
| `yarn lint` | **0** (five self-inflicted errors on the first run, all fixed **by hand**) |
| `yarn test` (full suite) | **0** — **564 files, 10,926 passed, 3 skipped, 1 todo, 0 failed**. Baseline at the start of this task was 563 / 10,876, so the delta is **exactly +1 file and +50 tests**: this task's spec and nothing else. Run after `validate:all` so the two did not contend for the machine; the `[vitest-worker] Timeout calling "onTaskUpdate"` load flake did not occur, so only one run is quoted. |
| `yarn build` | **not re-run.** Nothing in a built package changed: the new gate lives in `@dzup-ui/tooling` (`private: true`, not built), and `packages/core/docs/` is outside `packages/core` `files`. No `vite.config`, entry, export map or source file of any published package was touched. |
| **No generated artifact was regenerated**, so the sanctioned regeneration order (ownership → quality → capability → component-meta → llms → docs-pages) did not apply. Confirmed by `validate:{ownership,component-meta,llms,docs-pages,capability-matrix,readme-facts}` all green inside the aggregate. `packages/core/docs/i18n.md` is hand-written and feeds no generator (grepped: nothing under `apps/docs` or `packages/tooling` reads it). |

### Maturity ladder

**specified → implemented → focused-validated → aggregate-qualified** (except the
one pre-existing link). **Not** browser-qualified by this task — it added no
browser lane and ran none; the RTL route's browser evidence is R5-O4's
(`apps/landing/e2e/rtl.spec.ts`, 2 tests, win32, 2026-09-17) and is **cited, not
re-run**. Not packaged, not released.

---

## 4. Ratchet movements (old → new)

| Ratchet | Old | New | Note |
|---|---|---|---|
| **Locales at ≥ 95 % completeness** | 1 (`en`) — *unmeasured, asserted by prose* | **1 (`en`) — measured, gated, floored** | **The count did not move, and it must not have.** Moving it would require a translation, and writing one is fabricating evidence of a supported locale. What moved is that it is now a *number a gate prints and refuses to let fall* (`minSupportedLocales: 1`, `min`-direction, watched by SC-7). The target of 2 is **owner decision 1**. |
| `de` completeness | "scaffold", no figure | **0 % — printed, on the record under D59** | |
| Catalog keys | 110 (R5-O4, `569d887`) | **116** at `4e4e46f` | +6 from tasks between; not this task's work, but every estimate in the decision sheets is bound to 116 |
| `validate:all` links | **54** | **55** — `validate:i18n-completeness` inserted as **link 10**, immediately after `validate:i18n-packs` | Placed there so structure is proven before completeness is measured against it. The pre-existing red (`validate:peers`, D174/D175) moves from link **50 → 51**; links **52–55** remain unreached in the aggregate. |
| `validate:all` links green | 49 of 54 | **50 of 55** | +1 = the new link, verified 0 |
| Locale gates | 1 (`validate:i18n-packs`) | **2** | |
| `i18n:*` contributor lanes | **0** | **2** (`i18n:new`, `i18n:check`) | done_check clause 3 |
| Ceiling files watched by SC-7 | 11 | **12** | coverage widened, nothing loosened |
| Plural-category assertions against a non-English rule set | 4 (Bosnian, French, Arabic, Arabic-Indic digits — R5-O4, *formatter* level) | **4 + 50 at the *pack* level** (Polish, Arabic, Welsh, Japanese, Russian ordinals, English) | The formatter was already proved; the pack rule is new |
| Landing routes proved RTL end to end | **1** | **1 — unchanged** | Already closed by R5-O4 (`apps/landing/e2e/rtl.spec.ts`, D62). Cited, not rebuilt. The prompt's gap note ("no landing route renders RTL") was stale. |
| Font binaries tracked | 0 | **0 — unchanged, and now re-measured on every gate run** | Nothing vendored. The measurement moved from a one-off in a report to a line of every `validate:all` run |
| Typeface decision sheets | 1 (R5-O4, size cost open) | **2** — the new one closes the licence detail and reports the size cost **unmeasured, with the command** | D63 stays **open** |
| Test files / tests | 563 / 10,876 | **564 / 10,926** | Exactly +1 file and +50 tests — this task’s spec and nothing else; 0 failed |
| Pending changesets | **42** | **42 — unchanged** | Nothing published changed; `validate:changelog` exit 0 |
| Dirty paths | 250 | **255** | +5: 3 new validator files, plus `CONTRIBUTING.md` and `packages/core/docs/i18n.md` newly touched. 3 new reports live inside the already-untracked `reports/` directory, which `git status --porcelain` collapses to one line. **Nothing committed, stashed, reverted or cleaned.** |

**No ratchet was raised, no ceiling lifted, no allowlist widened.** The one number
that could have been flattered is `locales at ≥ 95 %`; it reads **1**, and the two
scaffolded packs created to prove the gate fires were both deleted.

---

## 5. Owner decisions raised

### Decision 1 — name the first translated locale and its translator 🟠 (carries **D59**)

Full sheet: [`./TASK-S5-O1-translator-decision.md`](./TASK-S5-O1-translator-decision.md).

**The measured ask:** 116 keys · 44 component groups · 318 words · 1,896
characters · 82 keys are 1–2 words · 10 carry a plural. Derived estimate
**3.5–5 h** for a 2-category language, **4.5–6.5 h** for a 4- or 6-category one,
including a Storybook context pass and a named reviewer's hour. (Derived
arithmetic with its assumptions stated, not a measured rate.)

| Option | | |
|---|---|---|
| **A** | commission `de`, the scaffold that exists | proves the pipeline; German has the **same two plural categories as English**, so it leaves the plural half of the contract untested by real content |
| **B** | commission `pl` (4 categories) or `ar` (6 + RTL + the typeface question) | strongest proof: exercises `plural-categories` against content a translator wrote, and `ar` puts a real pack behind the direction path that today has only a landing-route test |
| **C** | keep waiting | the catalog grew 110 → 116 in seven days; the ask grows with it |

**Recommendation: B (`pl` or `ar`) — but take A if the German speaker is the one
actually available.** Availability beats elegance: one finished locale of any kind
moves `minSupportedLocales` 1 → 2 and turns every i18n claim here from a single
data point into a gated fact. The four concrete steps are in the sheet's §6; the
last one — raising `minSupportedLocales` and deleting the pack's `scaffolds` entry
— is the edit that makes "two locales ship" unfalsifiable.

### Decision 2 — the Arabic (and Hebrew) typeface 🟠 (carries **D63**, AR-2 decision 1 / D-10)

Full sheet: [`./TASK-S5-O1-typeface-decision.md`](./TASK-S5-O1-typeface-decision.md).
**Nothing was vendored and no purchase was made.**

| Option | Licence | Bytes | Blocking prerequisite |
|---|---|---|---|
| **A** vendor an OFL face | **SIL OFL 1.1** for all three candidates. **Noto Sans Arabic** — no Reserved Font Name. **IBM Plex Sans Arabic** — "Plex" **is** reserved, and a `pyftsubset` build is a modified build, so a subset **may not be called Plex**, which destroys the one thing A was for. **Vazirmatn** — no RFN, Persian-tuned proportions. | **unmeasured** (measuring means downloading a font, which is the first half of vendoring) × **4 weights**. What *is* measured: the entire `packages/core/dist/core.css` is **19,865 bytes**, so an Arabic subset of one weight already exceeds the whole published stylesheet — **enough to decide A without the byte count** | **yes, blocking** — `validate:licenses` scans `package.json` dependencies only, so a font under `packages/` **passes the licence gate silently** (AR-2's finding, still true at `4e4e46f`). A binary-asset licence gate must exist first |
| **B** `--dz-font-family-arabic` opt-in token | none | **0** | no |
| **C** host obligation, documented | none | **0** | no — and it is **already in force and now gated** |

**Recommendation (unchanged from R5-O4, reasons now closed): C now · B next as a
`patch` · A never inside `@dzup-ui/core`.** C needs no action to hold — the gate
prints the absence on every `validate:all` run. B costs zero bytes, improves the
default on every platform that has one of `Segoe UI` / `Tahoma` / `Geeza Pro` /
`Noto Sans Arabic` (all four Windows faces measured present on this host at
0.9–1.2 MB each, zero download), needs **one** visual fixture, and **reports its own
arrival** — the gate flips that row to `token-provisioned` with no edit anywhere.
If A is ever taken: **Noto Sans Arabic**, and as a separate opt-in package
(`@dzup-ui/fonts-arabic`), never `@font-face` in `core.css`.

### Decision 3 — reconcile "has translations" with "is supported" 🟢 (finding **F1**, new)

`validate:i18n-packs` rule 9 treats **one** translated value as "has
translations" and therefore demands a published `exports` entry. Measured: a
`pl.json` holding a single **English-copied** value made that gate exit 1 with
`"pl" has translations but no "./i18n/locales/pl.json" export` while the
completeness gate read it **0 %**. It fails closed, so nothing ships — but the two
gates disagree about what a publishable locale is.

| Option | |
|---|---|
| **A** leave it — both gates go red, a human resolves | zero cost; the disagreement is a standing trap for the next contributor |
| **B** make rule 9's `published` predicate use *effective* (non-identical) translations | one predicate change in `i18n-packs.ts`, reusing `isUntranslated`; the two gates then agree by construction |
| **C** move publication entirely behind the 95 % threshold | cleanest, but blocks the legitimate case of shipping a genuinely partial pack that falls back to English — which R5-O4 deliberately supported |

**Recommendation: B.** It is small, it removes a contradiction rather than
documenting one, and it keeps partial packs publishable. **Not taken here** —
`i18n-packs.ts` is another task's gate with its own 16-spec suite, and changing its
publication semantics is a decision, not a fix.

> **Addendum 2026-09-25 — F1 / decision 3 is CLOSED. Option B implemented by
> RESIDUAL-02** ([`RESIDUAL-02-filed-defects-handoff.md`](./RESIDUAL-02-filed-defects-handoff.md) §2).
> Nothing above is rewritten; this note is the disposition.
>
> `isUntranslated` **moved** to `i18n-packs.ts` — importing it the other way would
> have made the dependency circular, since this gate already imports `checkPack`
> from there — and is now the single definition both gates read.
> `PackCoverage.effective` was added, `status`'s `scaffold` test and rule 9 both
> turn on it, and this gate's `identical` is `coverage.translated −
> coverage.effective` rather than a second loop. `SOURCE_LOCALE` replaces the
> `'en'` that was hard-coded in two files. The 16-spec suite is now **24**.
>
> **The defect was two lines, not one.** `status` derived `complete` from the raw
> count too, so a pack copying **all 116** English values read `complete` and rule 9
> demanded its publication as a real locale — measured by seeding it and restoring
> the old derivation byte-exactly. That is worse than the one-value case this
> finding described.
>
> **Every current fact is preserved byte-for-byte:** `en` source 100 %, `de`
> scaffold 0/116 with 116 explicit fallbacks, `locales at >= 95 % completeness: 1
> (en) — floor 1`. The completeness gate's entire output is unchanged. Probe packs
> were written to `locales/`, measured, and deleted; the directory holds only
> `en.json` and `de.json`.
>
> **One divergence, recorded not hidden:** the task brief asked that a pack with one
> *genuine* translation not count as "has translations". That is option **C**, which
> this report rejected in writing. Option B was implemented as recommended, so one
> real translation is still publishable and rule 9 still asks for its export; the
> choice is handed to the owner as `D-RES02-3` rather than made silently.

### Decision 4 — Arabic numeral style, still unasserted 🟢 (AR-2 decision 4, restated)

`formatMessage` renders **Arabic-Indic digits** under `ar` today (asserted at
`message-format.spec.ts:61`). Whether a product wants Arabic-Indic or ASCII digits
is `ar` vs `ar-u-nu-latn`, and there is **no default that is right for everyone**.
Reported **unasserted with that reason** rather than defaulted. **Recommendation:**
document both tags in `i18n.md` §2 when the first Arabic pack lands, and leave the
choice with the host. Not fixed here — it would mean choosing on a consumer's
behalf, which the provider contract exists to avoid.

---

## 6. Ranked next packet

1. **Owner: decision 1 — name the locale and the translator.** Everything else in
   the locale layer is built, gated and documented; this is the only input the
   engineering cannot supply, and it is what moves `minSupportedLocales` 1 → 2.
   Cost to the owner: two names. Cost to the translator: 3.5–6.5 h.
2. **D63 option B — `--dz-font-family-arabic` and `--dz-font-family-hebrew`
   tokens** (`patch`, zero bytes distributed). Add the tokens under
   `:lang(ar), :lang(fa), :lang(ur)` / `:lang(he), :lang(yi)`, plus **one** visual
   fixture (an Arabic label under `dir=rtl`) in `e2e/visual/` `scope.fixtures`.
   The completeness gate flips those rows to `token-provisioned` automatically, so
   the improvement records its own arrival. This is the cheapest real improvement
   to RTL rendering available and it needs no procurement.
3. **Finding F1 / decision 3 — one predicate in `i18n-packs.ts` rule 9** so
   "has translations" means *effectively* translated. Small, removes a
   contradiction between two gates, reuses `isUntranslated`.
4. **A binary-asset licence gate.** Blocking prerequisite for D63 option A and a
   standing hole regardless: `validate:licenses` reads `package.json` dependencies
   only, so **any** binary committed under `packages/` — a font, an image, a
   sample dataset — passes it silently. AR-2 found this; it is still true at
   `4e4e46f`.
5. **`yarn i18n:new` in the docs site.** The contribution path now lives in
   `packages/core/docs/i18n.md` and `CONTRIBUTING.md`; neither is a page a
   prospective translator lands on. A generated docs page for the locale
   contribution path would put it where someone looking for it would look.

### What blocks the owner packets, S0-O2 next

**Nothing in this task blocks S0-O2** (owner-decision register refresh +
publication decision). It *feeds* it: **four decisions** are handed over, two of
them carrying existing register entries.

| Register entry | State after this task |
|---|---|
| **D59** (first locale / translator) | still **open**; now has a measured ask (116 keys / 318 words) and a ranked recommendation. Decision 1 above. |
| **D63** (Arabic typeface) | still **open**; licence detail closed, size cost reported **unmeasured with the command and the reason it was not run**, and the absence is now printed by a gate on every `validate:all` run. Decision 2 above. |
| **F1 / decision 3** | **CLOSED 2026-09-25 — fixed by RESIDUAL-02, option B as recommended.** See the addendum below. |
| **decision 4** | **new-as-restated** — AR-2 decision 4 (Arabic numeral style) is still **unasserted** and is reported unasserted, not defaulted. Needs a register id. |

Two things S0-O2 should carry forward as *corrections*, both found here:

- The programme README §2's `validate:all` link count is now wrong again: **55**,
  not 54. It has changed **five** times in three days. The note at
  EXECUTION-STATUS line 22 is updated.
- This task's `<done_check>` and `<validation>` blocks contain the **14th
  recurrence** of the `npx` false-green defect (D77's neighbour) and the repeated
  `/tmp` assumption. Four prompts remain unrun in this programme; all four should
  have both corrected before an agent reads them.

---

## Progress log — close

- **ENDED 2026-09-24** at `4e4e46f`, **255** dirty paths (250 at start, all preserved).
- `git status --porcelain -- packages/core/src/i18n/locales/` is empty: the two
  packs (`ar.json`, `pl.json`) scaffolded to prove the gate fires were both
  deleted, and `locales/` holds exactly `de.json` + `en.json` as it did at start.
- Nothing committed, pushed, stashed, reverted or cleaned. No font vendored, no
  translation written, no ratchet raised, no allowlist widened, no baseline
  replaced, no procurement.
