# TASK-R5-O4 — i18n completeness: plural/select formatter, first locale pack, RTL closure — handoff

## Progress

- 2026-09-17 — started at `main` @ `569d887`, 0 ahead / 0 behind. `git status --short` at start:
  ` M docs/program-2026-09-04/EXECUTION-STATUS.md` (not this task's — a TASK-R3-O1 re-check note; preserved).
- Status row set to `[~]`.
- `<done_check>` run: 0 of 6 pass (no `PluralRules`, no `locales/`, no `validate:i18n-packs`, no semantics doc,
  no typeface sheet; no landing test title matches `rtl`). → run the task.
- Discovery done (see §1 inventories below once written). Key measured facts:
  - R1-O2 has not run: `./i18n` not exported; `DzMessageCatalog` augmentation unreachable from `dist/index.d.ts`.
  - Exporting runtime catalog values (`enMessages`, `formatMessage`, packs) from a JS subpath would add
    `unclassified` ownership entries (ceiling 29, may only fall; schema has no `utility` kind). Plan: `./i18n`
    exports a composable + types (classify cleanly); catalog and packs ship as JSON data under
    `./i18n/locales/*.json` (data, not symbols — the ownership generator skips non-JS targets like `./styles`).
  - Count-bearing strings built by concatenation: 5 components (DzCountdown, DzDataView, DzMention, DzRating
    title, DzTagsInput). None are in the catalog today (all script-block literals `validate:hardcoded-strings` cannot see).
  - Date semantics defect found: `DzTimePicker` formats a *plain* time through a local-zone `Date` merged with the
    host's `formats.date` defaults — a host `timeZone` default shifts the displayed wall-clock time.
  - APP-1 arrow-key defect: already fixed in the landing copy (`BlockCategoryNav.vue`, APP-1); the landing now has a
    Direction control (Theme Designer) but no test whose title names RTL.
  - form-readiness C6 (the "rtl matrix 10/34") now reads **37 pass / 7 unrun** at `a01965f` (moved by R5-O2 anatomy
    rollouts, not this task): DzFloatLabel, DzFormDescription, DzFormField, DzFormLabel, DzFormMessage, DzGrid, DzStack.
- DONE (focused green): contracts types (`DzMessage<A>`, `DzMessageArgsOf`, `DzMessageKey`, `DzLocalePack`, `DzInstant`,
  `DzPlainDate`, `DzPlainTime`); `cachedPluralRules`; `i18n/message-format.ts` (ICU subset parser/formatter, 27 specs);
  13 new catalog keys, 5 components converted (`count-bearing.spec.ts`, 22 specs); pseudo-locale syntax-aware;
  `DzTimePicker` plain-time zone fix (`temporal-semantics.spec.ts`; old code rendered 09:05 as 22:05 under a
  Kiritimati host zone, measured); `useDzMessageFormat` composable; `directionForLocale` moved framework-free.
- DONE: `validate:i18n-packs` gate (+14-spec seeded-failure suite), `generate:i18n-packs`, link added to
  `validate:all` after `hardcoded-strings` (40 → 41 links); `locales/en.json` (generated) + `locales/de.json`
  (SCAFFOLD — 0/110 translated, 110 explicit fallback; not published by the build).
- DONE (R1-O2 i18n-export slice): `./i18n` + `./i18n/locales/*.json` exports, vite entry + asset plugin, root barrel
  re-export, public-api manifest. Packed-tarball probe: `import('@dzup-ui/core/i18n')` → 1 key; `en.json` imports
  with `with {type:'json'}`; `de.json` → ERR_MODULE_NOT_FOUND (scaffold unpublished); root-only TS probe sees
  `DzMessageCatalog['DzCountdown']` (control: contracts alone does not).
- DONE: generated artifacts regenerated in order (ownership → component-meta → llms → docs-pages), each run twice
  byte-identical; `validate:{ownership,component-meta,llms,docs-pages,exports,mcp,externals,readme-facts,
  release-policy,hardcoded-strings,i18n-packs}` exit 0. Ownership +3 (2 type, 1 composable), unclassified held 29.
  component-meta also absorbed a PRE-EXISTING `DzInplace` drift from merge `63be543` (not this task).
  Provider-hook detection taught `useComponentMessageFormat`/`useDzMessageFormat`.
- DONE: changeset (`contracts` patch, `core` patch); `packages/core/docs/i18n.md` (syntax, fallback, escaping,
  semantics table, packs, contributing); CONTRIBUTING.md "Translations".
- DONE (landing RTL): new `apps/landing/e2e/rtl.spec.ts` (2 tests, titles carry `rtl`). RED before the fix —
  measured: `/blocks` under the RTL recipe had `dir=rtl` and a mirrored layout, but ArrowLeft moved to the LAST
  tab (LTR semantics): the Direction control wrote `<html dir>` only, so `useDzDirection()` still said `ltr` and the
  APP-1 fix was inert. Fix at the shared shell: `App.vue` wraps every route in `DzProvider :direction` from the
  recipe (preview routes: `?dir=`). GREEN after: 2 passed.
- DONE (visual fixtures): `TextStress.stories.ts` (CJK, combining marks, 4,096-char run, +40 % pseudo) over the
  `buttons` pilot; ledger schema 1.1.0 `scope.fixtures` (4); validator coverage/staleness + `visual:accept --fixture`;
  3 probe runs byte-identical ×8; 8 first captures accepted under delegation; `validate:visual-baselines` exit 0
  (58/58); `test:e2e:visual:pilot` 24 passed. Finding: button labels neither wrap nor truncate (overflow 16rem).
- DONE: typeface decision sheet (`TASK-R5-O4-typeface-decision.md`, rec. C now / B opt-in token / A never in core).
- Measured: `yarn test:e2e:landing -- --grep rtl` (the done_check form) runs ALL tests — 107 passed (5.0 m);
  `--grep rtl` without `--` runs the 2 RTL tests. `validate:tree-shake` exit 1 = PRE-EXISTING false positive (the
  substring `DzDataGrid` matches the catalog key `DzDataGridHeader`, present since P4-03); formatter code is
  absent from the DzAlert probe bundle (tree-shaken). `validate:capability-matrix` fresh: 22 stale perf-baseline cells
  (git-commit based, HEAD merges) + tier-d DzFileUpload browser-matrix — pre-existing.
- DONE (ladder): `yarn test` → README facts went stale (my new story file: 180 → 181), regenerated; the rest is
  pre-existing (§3). `validate:all` run twice end-to-end: first exit 1 at link 2 (**new**, my lint — two
  `antfu/curly` in `i18n-packs.ts`, fixed), then exit 1 at link 18/41 (`capability-matrix`, pre-existing);
  links 19–41 run individually, all exit 0. Matrix RTL project for touched components: 10 passed.
- ENDED 2026-09-17. `git status --short` at end: the pre-existing EXECUTION-STATUS.md change plus this task's files
  (listed in §1). `.tree-shake-test/` (tracked build leftovers) was rewritten and deleted by my tree-shake run and
  restored byte-for-byte from `HEAD` blobs (`git show`, no checkout); `.pw-out/` removed.

---

**Numbers below are bound to `main` @ `569d887` plus this task's uncommitted working tree.** Generated artifacts
this task regenerated now stamp `sourceCommit 569d887`; the ones it did not (quality, capability, AT) still stamp
`99b963a`. Locally qualified only — not CI, release or production evidence.

## 1. Implemented files and API effect

**Formatter and catalog (Core, `patch`)**
- `packages/core/src/i18n/message-format.ts` (new) — ICU MessageFormat subset: `{arg}`, `plural` (+ `=N`),
  `selectordinal`, `select`, apostrophe quoting; `offset:` and `number/date/time` types rejected. Values are data,
  output is text. Parsed-message cache (1,000 cap). Internal, not exported.
- `packages/core/src/i18n/intl-cache.ts` — `cachedPluralRules`.
- `packages/core/src/i18n/messages.ts` — **13 new keys**: `DzCountdown` ×6, `DzDataView` ×3, `DzMention` ×1,
  `DzRating` ×1 (new group), `DzTagsInput` ×2 (new group); count-bearing ones typed `DzMessage<Args>`; exports
  type `DzCoreMessageGroup`. No existing key renamed.
- `packages/core/src/i18n/useComponentMessages.ts` — internal `useComponentMessageFormat` (typed values, English
  fallback with English plural rules, dev warning once).
- `packages/core/src/i18n/useDzMessageFormat.ts` (new, **public composable**), `i18n/index.ts` (new; `./i18n`).
- `packages/core/src/i18n/pseudo.ts` — syntax-aware for plural messages.
- `packages/core/src/i18n/direction.ts` (new) — `directionForLocale` moved, unchanged, re-exported from `useDzLocale.ts`.
- Components: `DzCountdown` (units + `Intl.ListFormat` unit/long), `DzDataView`, `DzMention`, `DzRating`, `DzTagsInput`
  converted; `DzTimePicker` plain time formatted from a UTC value in UTC (**bug fix**).
- `packages/contracts/src/{provider.types,index}.ts` (`patch`, types only): `DzMessageArg`, `DzMessageValues`,
  `DzMessage`, `DzMessageArgsOf`, `DzMessageKey`, `DzLocalePack`, `DzInstant`, `DzPlainDate`, `DzPlainTime`;
  `DzFormatDefaults.date` documents instant-only zone semantics.
- Visible English changes: `DzDataView` "of 1 items" → "of 1 item"; counts ≥ 1,000 gain grouping (`1,234`).

**Export slice of TASK-R1-O2** — `packages/core/package.json` `./i18n`, `./i18n/locales/en.json`;
`packages/core/vite.config.ts` entry + `localePacks()` asset plugin (scaffolds not emitted); `src/index.ts`
re-exports `./i18n/index.ts`; `manifests/public-api.manifest.json` (`composables.i18n`, 2 types).

**Locale packs + gate** — `packages/core/src/i18n/locales/{en,de}.json`; `packages/tooling/src/validators/i18n-packs.ts`
(+ spec, 16 tests; 9 rules); root `package.json` `validate:i18n-packs` (link 7 of `validate:all`), `generate:i18n-packs`
(`--write`, `--scaffold <locale>`).

**Docs** — `packages/core/docs/i18n.md` (new: syntax, fallback, escaping, instant/plain table, packs, contributing),
`CONTRIBUTING.md` ("Translations"), `.changeset/a-count-reads-right-in-every-language-and-the-catalog-ships.md`,
`reports/TASK-R5-O4-typeface-decision.md`, `e2e/visual/README.md`.

**Landing RTL** — `apps/landing/src/App.vue` (`DzProvider :direction` from the recipe; `?dir=` on preview routes);
`apps/landing/e2e/rtl.spec.ts` (new, 2 tests).

**Visual fixtures** — `packages/core/stories/compositions/i18n/TextStress.stories.ts` (new);
`e2e/visual/{coverage.ts,visual-baselines.json}` (schema 1.1.0 `scope.fixtures`, 8 accepted records);
`packages/tooling/src/validators/visual-baselines.ts` (fixture coverage/staleness);
`packages/tooling/src/quality/accept-visual-baseline.ts` (`--fixture`); 8 PNGs.

**Tooling / regenerated** — `packages/tooling/src/meta/generate-component-meta.ts` (provider-hook regex learns the
two wrappers); `packages/tooling/src/resolution/dzup-resolution.spec.ts` (inline snapshot + my 2 specifiers only);
regenerated: ownership manifest, `component-meta.json`, `llms-full.txt`, 7 docs pages + nav + seeds,
`apps/landing/src/generated/counts.ts` (by `test:prepare`), `README.md` facts.

## 2. Focused validation

| Command | Result |
|---|---|
| `vitest run` i18n + provider + 6 touched component specs + `i18n-packs.spec.ts` | **13 files / 317 tests, exit 0** |
| `message-format.spec.ts` / `count-bearing.spec.ts` / `temporal-semantics.spec.ts` | 27 / 22 / 5 inside the above |
| `yarn validate:hardcoded-strings` · `validate:i18n-packs` | exit 0 · exit 0 (en 110/110; de scaffold 0/110) |
| `yarn validate:exports` · `validate:exports --built` | exit 0 · exit 0 (core 37 targets) |
| `yarn validate:tree-shake` | **exit 1, pre-existing false positive** — see §3 |
| `yarn typecheck` · `yarn typecheck:apps` · `yarn lint` | exit 0 · exit 0 · exit 0 |
| `yarn test:e2e:landing --grep rtl --project=chromium` | red before the shell fix (ArrowLeft → last tab), **2 passed** after |
| `yarn test:e2e:landing -- --grep rtl` (done_check form — runs everything) | **107 passed** (incl. 88-block ltr/rtl certification, hero baselines) |
| matrix `--project=matrix-chromium-rtl` for DzDataView/Mention/Rating/TagsInput/TimePicker | **10 passed** (no JSON report written; capability cells unchanged) |
| `yarn test:e2e:visual:pilot` · `validate:visual-baselines` | **24 passed** (16 + 8) · exit 0, 58/58 accepted |
| Packed tarballs (core/contracts/tokens, scratch consumer, junctioned peers) | `import('@dzup-ui/core/i18n')` → `['useDzMessageFormat']`; `en.json` imports; `de.json` → `ERR_MODULE_NOT_FOUND`; root-only TS probe sees Core's catalog keys, contracts-only control does not |

## 3. Aggregate qualification

- `yarn validate:all` (41 links) end-to-end, read directly: run 1 **exit 1 at link 2** — NEW, mine (lint in
  `i18n-packs.ts`), fixed; run 2 **exit 1 at link 18** `validate:capability-matrix` — PRE-EXISTING: a fresh build
  at `569d887` has **22 stale cells, all `perf-baseline`** (git-commit based; components moved in `a01965f`/`569d887`),
  plus `tier-d` DzFileUpload `browser-matrix` unrun with no artifact (the committed matrix already records that input
  absent). Links 1–17 passed in that run; links 19–41 run individually — **all 23 exit 0**.
- `yarn test`: 532 files, **5 failed / 9,845 passed / 4 skipped / 1 todo**. **2 NEW, mine, fixed**:
  `generate-readme-facts.spec.ts` ×2 (README said 180 story files; my story made it 181 — regenerated, spec 23/23
  green). **3 PRE-EXISTING**: `landing-token-fallbacks`, `story-dod-tiers countOpen`, and
  `dzup-resolution.spec.ts` inline snapshot missing `@dzup-ui/tokens/css/high-contrast` (exported since R5-O7; the
  "2 inherited failures" count omits it).
- `validate:tree-shake` exit 1 — PRE-EXISTING false positive: it substring-matches `DzDataGrid`, which the catalog key
  `DzDataGridHeader` has put in every messages-reading component's bundle since P4-03. A DzAlert probe bundle
  contains no `formatMessage`/`PluralRules` — the formatter tree-shakes out of components that do not plural.
- `packages/tooling` `tsc`: 12 errors, none in a file this task created; the two in `accept-visual-baseline.ts`
  (`file` missing from `record()`'s argument) exist at `HEAD` on the same calls.
- Tooling note: `test:e2e:visual:pilot` uses Playwright's default output `test-results/`, which Playwright empties;
  any local `test-results/matrix-report.json` (gitignored) would have been removed. The committed capability matrix
  already records that input absent.
- Maturity: implemented → focused-validated → aggregate-qualified *except* the pre-existing link 18; browser-qualified
  locally for the landing route, 5 matrix RTL cells and 8 fixture shots (win32). Not packaged, not released.

## 4. Ratchet movements

| Ratchet | Old | New |
|---|---|---|
| catalog keys (`en.json`) | 97 | **110** |
| count-bearing concatenated plurals in Core | 5 | **0** |
| locale packs | en only, unexported | **en published (110/110)**; `de` scaffold 0/110, unpublished |
| `validate:all` links / first failing | 40 / 17 | **41 / 18** (same cause) |
| ownership entries / unclassified | 1,328 / 29 | **1,331 / 29** (+2 type, +1 composable) |
| form-readiness C6 unrun | 34 (task brief) | **7 at `a01965f` — moved by R5-O2, not this task**: DzFloatLabel, DzFormDescription, DzFormField, DzFormLabel, DzFormMessage, DzGrid, DzStack |
| landing routes proven RTL end to end | 0 | **1** (`/blocks`) |
| landing e2e tests | 105 | **107** |
| per-component visual shots | 16 | **24** (16 + 8 fixtures; ledger schema 1.0.0 → 1.1.0) |
| pending changesets | 27 | **28** |
| `yarn test` failures (pre-existing) | "2" | **3** (resolution snapshot was uncounted) |

## 5. Decisions (D58–D66, full text in EXECUTION-STATUS.md)

Taken under owner delegation 2026-09-17 (all reversible): **D58** catalog as JSON + `./i18n` composable/types
(ownership ceiling) · **D59** `de` scaffold, no machine translation (pack `[!]`) · **D60** escaping = values-as-data +
sanitizer seam · **D61** plain-date types as `string` aliases · **D62** landing direction via shell `DzProvider` ·
**D64** 8 fixture baselines accepted (record an overflow finding). Open: **D63** Arabic typeface (rec. consumer
obligation now, opt-in system-stack token next, never vendor into `core.css`) · **D65** ~12 components' script /
template-literal English + gate blind spot · **D66** done_check item 6 does not filter.

## 6. Ranked next packet

1. **Owner: name the first locale and a human translator** (D59); translate, then add its `exports` entry (gate rule 9).
2. **D65 packet**: teach `validate:hardcoded-strings` bound template literals; move the §1 inventory into the catalog.
3. **Design call on button label overflow** (D64 finding): wrap vs truncate-with-title; re-accept fixtures after.
4. **TASK-R1-O2 remainder**: `validate:published-imports` must `import()` JSON exports `with { type: 'json' }`.
5. Refresh the `dzup-resolution` snapshot (`tokens/css/high-contrast`) and the tree-shake sentinel match (pre-existing).
