# TASK-N1-O2 — Firefox and WebKit browser-matrix execution and per-engine triage

> **Task:** `docs/program-2026-09/evidence-execution-tasks.md` → TASK-N1-O2.
> **Baseline:** `main` @ `51dec93c73214af2d1e424e3454a7122691fea48` — **worktree dirty** (§2).
> **Run date:** 2026-08-31. **Platform:** win32, Windows 11 Pro 10.0.26200, node v24.14.1, yarn 4.16.0.
> **Maturity reached:** `browser-qualified (locally, two of three engines)` —
> **locally qualified, worktree-dirty — NOT admissible as release evidence until an owner
> commits this tree and re-runs.** See §2. Never CI, release or production evidence.

**Headline.** The twelve configured Firefox and WebKit projects had never executed. They
have now, twice each, against all 88 runnable targets in all six conditions.

- **Firefox 151.0 — zero divergence.** All 46 cross-engine ledger entries reproduced with
  the same verdicts and, to within text-metric rounding, the same numbers. Zero
  Firefox-specific failures, zero exceptions, zero harness defects.
- **WebKit 26.5 — two component divergences and one harness defect.** 44 of 46 entries
  reproduced. The two that did not are recorded with their measurements. The harness defect
  made **84 of 88 components** report a false `reduced-motion` failure; it is found,
  root-caused to a WebKit divergence from the CSS Animations spec, fixed, and re-verified
  on all three engines.
- **The 46 are cross-engine, not a chromium artefact.** That was the open question the
  chromium ledger itself posed ("the first run on another engine will say so by failing on
  an unexpected pass"). The answer: they are real on Gecko and on WebKit too.
- **The chromium ratchet (46) is untouched** — `e2e/matrix/known-failures.json` is
  byte-identical to `HEAD` (§5).
- **`yarn validate:all` → EXIT 0**, 27/27 links (§7).
- **A separate, larger finding:** the surviving chromium run record covers **2 of 6**
  chromium projects, not 6 (§1e). A partial re-run on 2026-08-25 overwrote the real one.

---

## 1. Discovery

### 1a. The 18 project definitions

`playwright.config.ts` builds them as a cross-product, not a hand-written list:

```
MATRIX_CONDITIONS = default · forced-colors · reduced-motion · rtl · touch · zoom-400
ENGINES           = chromium (Desktop Chrome) · firefox (Desktop Firefox) · webkit (Desktop Safari)
matrixProjects    = 3 × 6 = 18 projects named matrix-{engine}-{condition},
                    testDir ./e2e/matrix, metadata { engine, condition, lane: 'matrix' }
```

Plus the three pre-existing **functional** projects (`chromium`, `firefox`, `webkit`) over
`./e2e`, each carrying `testIgnore: /[\\/]matrix[\\/]/` so the matrix directory does not
silently triple their runtime. 21 projects in total; 18 of them are the matrix.

| condition | context options the project adds | what the spec then asserts |
|---|---|---|
| `default` | — | a focused element carries a visible indicator |
| `forced-colors` | `forcedColors: 'active'` | the indicator survives when the OS replaces the palette (WCAG 1.4.11) |
| `reduced-motion` | `reducedMotion: 'reduce'` | nothing is still animating 1 s after the story settles |
| `rtl` | *(story global `direction:rtl`, not a context option)* | the document actually computed `direction: rtl` |
| `touch` | `hasTouch`, `isMobile`, viewport 390×844 | every pointer target ≥ 24×24 CSS px (WCAG 2.5.8) |
| `zoom-400` | viewport 320×800 | no horizontal document overflow > 1 px (WCAG 1.4.10) |

`rtl` is a story global rather than a context option deliberately: direction is a document
property the Storybook `direction` global already owns, and that global also wires
`DzProvider` with an Arabic locale — which is the thing under test.

### 1b. The target set

`e2e/matrix/targets.generated.ts` (generated; byte-identical to `HEAD`, verified §5):

| | count |
|---|---|
| targets total | **144** (tier A 55 · B 67 · C 21 · D 1) |
| in lane (tier B–D; tier A is deliberately out) | **89** |
| runnable (in lane **and** has a story) | **88** |
| declared `unrun` (in lane, no story) | **1** — `DzThemeProvider` (tier B, `providers`) |

Tier A's absence is a recorded decision, not an omission: 55 badges and separators through
18 cells buys sampling nobody reads, at a cost that gets the lane switched off; they keep
the single chromium lane `e2e/components` already gives them.

Each project therefore runs **177 tests** = 88 targets × 2 specs (`renders under the
condition`, `condition assertion`) + 1 `test.fixme` that prints the unrun target with its
reason. Six projects per engine = **1 062 tests**, of which 1 056 execute and 6 are the
declared-unrun cell repeated once per condition.

### 1c. The exceptions / ratchet file format, as it stood before this task

| file | role | state at task start |
|---|---|---|
| `e2e/matrix/known-failures.json` | The **ratchet**. 46 entries `{component, condition, measured{engine, …}, reason}`. `conditions.spec.ts` turns a hit into `test.fail()`, so Playwright **fails the run when the cell unexpectedly passes**. It can only shrink. | 46 entries — 28 `touch`, 18 `zoom-400`, every one `measured.engine = "chromium"`. Its own `measuredOn` field says: *"firefox and webkit have not run this lane yet, so an entry may turn out to be engine-specific. The first run on another engine will say so by failing on an unexpected pass."* |
| `e2e/matrix/engine-exceptions.json` | Per-`{engine, condition}` **capability**. An entry removes one cell from the lane and must say why, at which engine version, and when it was last re-checked. | `exceptions: []` — empty, and deliberately so ("a blanket skip is not an exception"). |
| *(none)* | Per-**engine** ratchet | **Did not exist.** `knownFailure(component, condition)` took no engine argument, so all three engines were held to one ledger. |

**The consequence, and it is load-bearing for everything below:** because the lookup was
engine-agnostic, running Firefox and WebKit put every one of the 46 chromium entries under
`test.fail()` on those engines too. That is the designed mechanism — an entry that is
chromium-only announces itself as an *unexpected pass*, which fails the run. It worked
exactly as written (§4).

### 1d. How results feed the capability matrix

`packages/tooling/src/quality/generate-capability-matrix.ts`, case `browser-matrix`, before
this task:

```
state = test-results/matrix-report.json exists
        ? (component has any known-failures entry ? 'present' : 'pass')
        : 'unrun'
```

That is the **whole** derivation. It is **engine-agnostic and condition-agnostic**: the
report is consulted only for its existence, never for which of the 18 projects it contains.

**Therefore the task's premise that Firefox/WebKit cells were `unrun` is not what the
artifact says.** All 89 `browser-matrix` cells were already `pass` (47) or `present` (42);
**none was `unrun`**, and none could move. What was missing was any way for a cell to
distinguish "chromium only, two of six conditions" from "three engines, six conditions
each". §6 records what was built instead, and what actually moved.

### 1e. The surviving chromium run record covers 2 of 6 projects — a finding in its own right

`test-results/matrix-report.json` is the only copy of the chromium run and is git-ignored
(N0-05 §8 D5). Read rather than trusted:

```
stats                 expected 352 · skipped 2 · unexpected 0 · duration 509 s
startTime             2026-08-25T11:35:50.423Z
config.argv           … test e2e/matrix --project=matrix-chromium-default --project=matrix-chromium-rtl
projects in results   matrix-chromium-default (176 expected, 1 skipped)
                      matrix-chromium-rtl     (176 expected, 1 skipped)
```

`docs/program-2026-08/EXECUTION-STATUS.md` records a **six-condition** chromium run on
2026-08-24 — "1 055 passed, 6 skipped, 1 environment failure" — which is where the 46
entries came from. **That record no longer exists.** A partial two-project re-run on
2026-08-25 overwrote it. Chromium today has *no* surviving evidence for `forced-colors`,
`reduced-motion`, `touch` or `zoom-400`, and the capability matrix has been presenting a
2-of-18-project report as browser evidence for 89 rows since 08-25.

This is D5 from the N0-05 handoff, realised: it did not take a `git clean` to destroy the
record — one ordinary partial re-run did it, silently, with no gate firing.

### 1f. Engine versions installed (recorded in the run metadata)

`npx playwright install firefox webkit` → **exit 0, nothing to download**; both binaries
were already present at the revisions Playwright 1.61.1 pins. Versions read from a live
launch, not from a lockfile:

| engine | version | Playwright revision | executable | user agent |
|---|---|---|---|---|
| chromium | **149.0.7827.55** | `chromium-1228` | `…\ms-playwright\chromium-1228\chrome-win64\chrome.exe` | `…HeadlessChrome/149.0.7827.55…` |
| firefox | **151.0** | `firefox-1532` | `…\ms-playwright\firefox-1532\firefox\firefox.exe` | `…rv:151.0) Gecko/20100101 Firefox/151.0` |
| webkit | **26.5** | `webkit-2311` | `…\ms-playwright\webkit-2311\Playwright.exe` | `…AppleWebKit/605.1.15 … Version/26.5 Safari/605.1.15` |

`@playwright/test` and `playwright` are both pinned at **1.61.1**.

**Windows-specific notes, recorded verbatim as the task asked.** No engine failed to launch;
no launch produced an error at any point in this task. Two platform facts matter:

1. **Playwright's WebKit on Windows is not Safari.** The binary is `Playwright.exe` (the
   WinCairo WebKit port) and it reports a **macOS** user agent
   (`Macintosh; Intel Mac OS X 10_15_7`). Every WebKit result below is a WebKit-engine
   result on Windows. It is **not** evidence about Safari on macOS or iOS and must not be
   quoted as such. Firefox and chromium ship native Windows builds, so their results carry
   no equivalent caveat.
2. **All 12 `{engine, condition}` pairs were re-measured on Windows** by creating the exact
   context the matrix creates and reading the media feature back. All 12 resolve, so the
   2026-08-24 claim still holds on Windows: **WebKit accepts `forcedColors` and Firefox
   accepts `isMobile`**, contrary to older received guidance.

| pair | chromium 149 | firefox 151 | webkit 26.5 |
|---|---|---|---|
| `forced-colors` → `(forced-colors: active)` | true | true | true |
| `reduced-motion` → `(prefers-reduced-motion: reduce)` | true | true | true |
| `touch` → `(pointer: coarse)` | true | true | true |
| `zoom-400` → 320 px viewport applies | yes | yes | yes |

Recorded into `engine-exceptions.json` as `reCheckedAt: 2026-08-31` with the three engine
versions and the method. **`exceptions` stays empty: not one `{engine, condition}` pair had
to be removed from the lane.**

### 1g. Sharding plan (discovery step 3)

The chromium lane's recorded wall clock was 509 s for two projects. Measured here, a
six-project engine sweep takes **20–28 min** at `workers: 1` — comfortably inside a
session, so **no sharding and no coverage reduction was needed**. Each engine ran as one
invocation of six projects so the static Storybook preview starts once. Engines ran
**sequentially, never in parallel**: `webServer.reuseExistingServer` is `false` for the
static lane and `--strictPort` is set, so two concurrent invocations collide on port 6106,
and CPU contention would perturb the one timing-sensitive condition.

---

## 2. Dirty-worktree inventory and the admissibility statement

### 2a. The statement

`<run_integrity>` says a run from a dirty worktree is not admissible as evidence, and
`<authority>` forbids committing. The worktree could not be cleaned, so admissibility is
handled by **recording**, not by blocking:

> **These numbers are `locally qualified, worktree-dirty`. They are NOT admissible as
> release evidence until an owner commits this tree and re-runs.** They are not CI
> evidence, not release evidence, not production evidence. Every ledger this task wrote
> carries `sourceCommit: 51dec93c73214af2d1e424e3454a7122691fea48` **plus**
> `worktreeDirty: true` and an `admissibility` string pointing here. Nowhere in this
> document, in `engine-ratchets.json`, in `engine-exceptions.json` or in the regenerated
> capability matrix are they presented as clean-tree evidence.

The run is nonetheless exactly reproducible: the inventory below pins the working-tree
content of every file that differed from `51dec93` at run time, by SHA-256.

**What of the dirt could actually have influenced the result.** 33 of the 47 files are
`packages/core/stories/**` — those are compiled into the Storybook the matrix drives, so
they are load-bearing and are hashed. 4 are generated matrices/manifests and 1 is a
`story-dod` ceiling: read by validators, not by the browser lane. `apps/storybook/vitest.config.ts`
is read by `storybook:test`, not by Playwright. The remaining 8 are program documents. The
matrix harness itself (`playwright.config.ts`, `e2e/matrix/*`) was **clean at run start**
and is separately hash-verified in §5.

### 2b. `git status --porcelain` at run start (verbatim, 41 lines)

```
 M apps/storybook/stories/_data/capability.generated.ts
 M apps/storybook/vitest.config.ts
 M docs/program-2026-08/EXECUTION-STATUS.md
 M docs/program-2026-08/README.md
 M packages/core/docs/capability-matrix.json
 M packages/core/docs/quality-matrix.json
 M packages/core/manifests/component-ownership.manifest.json
 M packages/core/stories/buttons/DzSpeedDial.stories.ts
 M packages/core/stories/data/DzAccordion.stories.ts
 M packages/core/stories/data/DzCalendar.stories.ts
 M packages/core/stories/data/DzChip.stories.ts
 M packages/core/stories/data/DzDataGrid.stories.ts
 M packages/core/stories/data/DzDataView.stories.ts
 M packages/core/stories/data/DzInfiniteScroll.stories.ts
 M packages/core/stories/data/DzOrderList.stories.ts
 M packages/core/stories/data/DzTable.stories.ts
 M packages/core/stories/data/DzTag.stories.ts
 M packages/core/stories/data/DzTree.stories.ts
 M packages/core/stories/forms/DzCascader.stories.ts
 M packages/core/stories/forms/DzCheckboxGroup.stories.ts
 M packages/core/stories/forms/DzInplace.stories.ts
 M packages/core/stories/forms/DzListbox.stories.ts
 M packages/core/stories/forms/DzMention.stories.ts
 M packages/core/stories/forms/DzPersonaSelector.stories.ts
 M packages/core/stories/forms/DzRadioGroup.stories.ts
 M packages/core/stories/forms/DzTimePicker.stories.ts
 M packages/core/stories/forms/DzTreeSelect.stories.ts
 M packages/core/stories/layout/DzResizable.stories.ts
 M packages/core/stories/media/DzCarousel.stories.ts
 M packages/core/stories/media/DzImageComparison.stories.ts
 M packages/core/stories/navigation/DzAnchor.stories.ts
 M packages/core/stories/navigation/DzMegaMenu.stories.ts
 M packages/core/stories/navigation/DzSidebar.stories.ts
 M packages/core/stories/overlays/DzCommandPalette.stories.ts
 M packages/core/stories/overlays/DzConfirmDialog.stories.ts
 M packages/core/stories/overlays/DzContextMenu.stories.ts
 M packages/core/stories/overlays/DzDropdownMenu.stories.ts
 M packages/core/stories/overlays/DzPopconfirm.stories.ts
 M packages/core/stories/overlays/DzTour.stories.ts
 M packages/tooling/src/quality/story-dod-ceiling.json
?? docs/program-2026-09/
```

### 2c. Per-file SHA-256 of the working-tree content at run start (47 files)

The untracked directory is expanded to its files. Hashes are of the **working tree**
content, i.e. exactly what the Storybook build and the validators read.

| st | sha256 | path |
|---|---|---|
| `M` | `93bb54f6e414388b6295c3112023e257d5bbdc74a9b87db0bbf3ce613e400cc4` | `apps/storybook/stories/_data/capability.generated.ts` |
| `M` | `e178cb2f43c4686fe719e3ccc78b997ae20514c60612ed8819da853eb73b518e` | `apps/storybook/vitest.config.ts` |
| `M` | `243ed58af1ba1e6a2532ee60dd15a887ccf74acfb7dd158494d8dcbdbd5f2410` | `docs/program-2026-08/EXECUTION-STATUS.md` |
| `M` | `d9b59bf6b324893e1ce03179735151088ddefbdc88fed92aab24bbf150eaea1e` | `docs/program-2026-08/README.md` |
| `M` | `b13729a0a780670867428fe9823cd07beee0fbfc8558ab50419158ddf5576958` | `packages/core/docs/capability-matrix.json` |
| `M` | `b8944f40a87f0dc3984d1d43fea789710c7f42f4f2fe71612af39c1aa77cf777` | `packages/core/docs/quality-matrix.json` |
| `M` | `5301a45ecb0586db1370ebe1b446c6c5fbe6277659a204bbac84db2cda772573` | `packages/core/manifests/component-ownership.manifest.json` |
| `M` | `b485a61085cb131016f9d6f9de239c51048564b3a7bb336a012da0de15ea0dba` | `packages/core/stories/buttons/DzSpeedDial.stories.ts` |
| `M` | `7d383f23256a534ac2820b1dd66561d0e1e333dc9c8531dfc73b39444cbb6046` | `packages/core/stories/data/DzAccordion.stories.ts` |
| `M` | `b1ae348175c9024549df7d673abfed844317134c3332a44fc744184cc1d10263` | `packages/core/stories/data/DzCalendar.stories.ts` |
| `M` | `95845c2036bb561e08d5b0733dea79c18d5e51248d8caea75bdfaf02d07e43c3` | `packages/core/stories/data/DzChip.stories.ts` |
| `M` | `f9f4e00f99991653aa1523f7c45861902a7a4a412110cca81e2b8ecf87c3d12b` | `packages/core/stories/data/DzDataGrid.stories.ts` |
| `M` | `c9601514a69274f69a5da88a586797f66d72cce920b34c61e57a23526298b3f0` | `packages/core/stories/data/DzDataView.stories.ts` |
| `M` | `34e49d5a8c459bf6a55d423e8f89b69b604ad6cb9b4e324e6f765fb0498a65b0` | `packages/core/stories/data/DzInfiniteScroll.stories.ts` |
| `M` | `7965527ed2d754e31403da1bae97cc07f6b4fea7a99ac0290f714f72c7c55ffc` | `packages/core/stories/data/DzOrderList.stories.ts` |
| `M` | `fd4b2e449ff030b1b269507280329a38b1a30ad153a6c173e08b2419935edee9` | `packages/core/stories/data/DzTable.stories.ts` |
| `M` | `f9742948896ffaadfd9442d1dc79f2bb5410c3f000854fd1767e67dc8c7b6d2f` | `packages/core/stories/data/DzTag.stories.ts` |
| `M` | `b153e78dbb82272aab558605f1493f1e07511dff61bada8061da3ae1a268be08` | `packages/core/stories/data/DzTree.stories.ts` |
| `M` | `645e98dad2e1ff7e533f7fbe79f390f47fc0531aa438d4c57c051ff3c7e84148` | `packages/core/stories/forms/DzCascader.stories.ts` |
| `M` | `2aacd89e660ca42037a59cd90445c35d3f2d6f8a6ea4b14e3187bd2aed36cf45` | `packages/core/stories/forms/DzCheckboxGroup.stories.ts` |
| `M` | `ffe1626efc910194b748030ef86b910fc211191e312acf6ad676eb5110cb3cba` | `packages/core/stories/forms/DzInplace.stories.ts` |
| `M` | `9d6198df11b8e7ae0ab02f9f8ca8ee583b78437d7a6a71cd652f3454fb0a592b` | `packages/core/stories/forms/DzListbox.stories.ts` |
| `M` | `786575ebc241fdb8a8416f0525ee08c95df201fdc25fb0afb33094d5cad22ea5` | `packages/core/stories/forms/DzMention.stories.ts` |
| `M` | `d9c90cefc110c4d547778ceea4a486612db00b16ff65ef4cf29e16a474a92b40` | `packages/core/stories/forms/DzPersonaSelector.stories.ts` |
| `M` | `92615a7fa49563252ee326c9e4786d7e3f734b553a221b36b2cbe85a1808c3c4` | `packages/core/stories/forms/DzRadioGroup.stories.ts` |
| `M` | `f36b362ae89b7652dc36e25d2a02d62091b4d99db026e8e226b7a0701f063da8` | `packages/core/stories/forms/DzTimePicker.stories.ts` |
| `M` | `89ebc90e8addeae63dbbea509c8c1edc926a7af202cffafeced043a96c649d06` | `packages/core/stories/forms/DzTreeSelect.stories.ts` |
| `M` | `e2e07681002b16ca7e02e247795c9abcc006866cd9e221a2fab157b84dc28b5c` | `packages/core/stories/layout/DzResizable.stories.ts` |
| `M` | `af0b290fdac2d8bdecb83759f640ad8240e2ba8d1b5d825cfb766a8242413fb4` | `packages/core/stories/media/DzCarousel.stories.ts` |
| `M` | `7e8e82926a015d443a018ac8ff9031f664649076bbfa928014b320293798f17a` | `packages/core/stories/media/DzImageComparison.stories.ts` |
| `M` | `fb577bec6a262c9c09e6b54054225f63d16aaa4a6f9dcec3fcd89265498a9faf` | `packages/core/stories/navigation/DzAnchor.stories.ts` |
| `M` | `e9d4493c0c1d6a0045a8339f7024604fa529e729d77af73d2392dadb67b2e39f` | `packages/core/stories/navigation/DzMegaMenu.stories.ts` |
| `M` | `d93da15e3a3f689c26e051002e48dae2d99971b62a8cc5797c04adec3519c3c2` | `packages/core/stories/navigation/DzSidebar.stories.ts` |
| `M` | `3c521f6c7890028a5c661ba194126abd7bd781d1e9baf7653f6c057876f57cdb` | `packages/core/stories/overlays/DzCommandPalette.stories.ts` |
| `M` | `d58f2e3362db637699e220cba1ff871b4e67c2ef80ff8cec7c52a6bfaf5f89ba` | `packages/core/stories/overlays/DzConfirmDialog.stories.ts` |
| `M` | `92c977aa0c9ae58fd675c709c34a6c84e5eac736cfca3b28217e2ca86e44ad70` | `packages/core/stories/overlays/DzContextMenu.stories.ts` |
| `M` | `b1b5319aed7591d31f2076e8daa8017d4ce1aeaf05d7f3210b75a790ad9ad9b2` | `packages/core/stories/overlays/DzDropdownMenu.stories.ts` |
| `M` | `47458520b28b7c5b21354bc9c280e296d740571fab40f5e6bb4eef4a4fa3b5ca` | `packages/core/stories/overlays/DzPopconfirm.stories.ts` |
| `M` | `5082dc242b01c0504dfb6bf0846dfdf9f21ff4144658c41c36bf2ef65ab7133d` | `packages/core/stories/overlays/DzTour.stories.ts` |
| `M` | `554bdf87cf6daea1434fd3cae5c41ddcb3cbe370a212a1414ce0be3d274236e1` | `packages/tooling/src/quality/story-dod-ceiling.json` |
| `??` | `d1387c05c7c48dc91e72a29785718a8a6f42599b234883b1b93cfe35eebcb791` | `docs/program-2026-09/consumer-agent-surface-tasks.md` |
| `??` | `29c3e47a80a2863b680765484a821dd7b3ed23221396923e05dde50a761eb004` | `docs/program-2026-09/evidence-execution-tasks.md` |
| `??` | `166b634a5495bcc8d473b8d0db0e325dde807ae9fe38f618c88fe4a6e79625c3` | `docs/program-2026-09/EXECUTION-STATUS.md` |
| `??` | `f6cabebec26e38bd96c75ac95fa963abd80285e91ff234390639a744f28ba9d6` | `docs/program-2026-09/README.md` |
| `??` | `b995f8d6c0aaf8179fef023c25eb473eab94dd6d22b5db4fbc763569877b06f4` | `docs/program-2026-09/release-and-toolchain-tasks.md` |
| `??` | `34d43db5388cfe67c25bea29b949db2b49766595ae2b7223d67846e7cc455154` | `docs/program-2026-09/reports/N0-05-rebind-handoff.md` |
| `??` | `cca174d36bb3e7ac9180c937545e04a7b220f149111329d6afc443f362324cca` | `docs/program-2026-09/reports/N1-O1-story-dod-handoff.md` |

Reproduce with:

```bash
git rev-parse HEAD                 # 51dec93c73214af2d1e424e3454a7122691fea48
git status --porcelain
git status --porcelain | while read -r st path; do sha256sum "$path"; done
```

### 2d. What the lane was actually driven against

`yarn workspace @dzup-ui/tokens build` (exit 0) then `yarn storybook:build` (exit 0) —
**24.15 MB, within the 25 MB budget** — rebuilt at run time because one story file
(`DzMention.stories.ts`) was newer than the previous static build. Both sweeps then ran
with `STORYBOOK_E2E_STATIC=1 STORYBOOK_E2E_PREBUILT=1` against that one build, so both
engines saw byte-identical Storybook output.

---

## 3. Per-engine totals

Definitions, kept separate on purpose (`<evidence_rules>`: never collapse evidence into
aggregate test counts):

- **cells run** — test results that executed. 176 per project (88 targets × 2 specs).
- **passed** — the assertion held.
- **expected failure (ratcheted defect)** — the cell is in a ledger, ran as `test.fail()`,
  and failed as the ledger says. A **real component defect**, counted, never skipped.
- **unexpected pass** — a ledger cell that passed on this engine. Fails the run by design;
  each one is an engine divergence that must be measured and recorded.
- **unexpected failure** — a cell that failed with no ledger entry. Either a new component
  defect or a harness defect; each is triaged in §4.
- **declared-unrun** — the `test.fixme` for a lane target with no story. Visible, not hidden.

### 3a. Firefox 151.0 — final run (against the fixed harness)

| condition | cells run | passed | failed-defect (ratcheted) | excepted-engine | harness-defect | declared-unrun |
|---|---|---|---|---|---|---|
| `default` | 176 | 176 | 0 | 0 | 0 | 1 |
| `forced-colors` | 176 | 176 | 0 | 0 | 0 | 1 |
| `reduced-motion` | 176 | 176 | 0 | 0 | 0 | 1 |
| `rtl` | 176 | 176 | 0 | 0 | 0 | 1 |
| `touch` | 176 | 148 | **28** | 0 | 0 | 1 |
| `zoom-400` | 176 | 158 | **18** | 0 | 0 | 1 |
| **total** | **1 056** | **1 010** | **46** | **0** | **0** | **6** |

In-lane targets 89 (88 runnable + 1 declared-unrun). Wall clock **23.4 min**, exit 0.
Report `test-results/matrix-report-firefox.json`, MD5 `cea7f1dbf59f191de7c0c2a3fef0b313`.

### 3b. WebKit 26.5 — final run (against the fixed harness)

| condition | cells run | passed | failed-defect (ratcheted) | excepted-engine | harness-defect | declared-unrun |
|---|---|---|---|---|---|---|
| `default` | 176 | 176 | 0 | 0 | 0 | 1 |
| `forced-colors` | 176 | 176 | 0 | 0 | 0 | 1 |
| `reduced-motion` | 176 | 176 | 0 | 0 | **0** *(84 before the §4 H1 fix)* | 1 |
| `rtl` | 176 | 176 | 0 | 0 | 0 | 1 |
| `touch` | 176 | 149 | **27** | **1** (`DzLightbox`) | 0 | 1 |
| `zoom-400` | 176 | 159 | **17** | **1** (`DzOrderList`) | 0 | 1 |
| **total** | **1 056** | **1 012** | **44** | **2** | **0** | **6** |

In-lane targets 89. Wall clock **19.9 min**, exit 0.
Report `test-results/matrix-report-webkit.json`, MD5 `08f00b9e195bf4c68253fd248d7a59f7`.

### 3c. Chromium — control only, not a sweep

`matrix-chromium-reduced-motion` was run once as a control for the H1 harness fix:
**176 cells run, 176 passed, 0 failures, 1 declared-unrun.** No other chromium project was
run: re-running the chromium sweep is outside this task's scope, and the durable chromium
record stays as §1e describes it (2 of 6 conditions).

### 3d. Cross-engine roll-up

| | firefox 151.0 | webkit 26.5 |
|---|---|---|
| projects executed | 6 / 6 | 6 / 6 |
| in-lane targets | 89 (88 runnable + 1 declared-unrun) | 89 |
| cells run | 1 056 | 1 056 |
| passed | 1 010 | 1 012 |
| **failed — real component defect** | **46** | **44** |
| **excepted — engine divergence, recorded** | **0** | **2** |
| **harness/environment defect** | **0** | **0** after fix (84 before) |
| unclassified | **0** | **0** |
| exit code | 0 | 0 |

---

## 4. Full triage — every failure, one classification, with evidence

`<triage>`: every failure gets **exactly one** classification. Total failures across both
engines, both runs: **46 + 44 + 2 + 84 = 176 distinct classified outcomes**, zero
unclassified.

### 4a. Class (a) — real component defect: 46 on Firefox, 44 on WebKit

These are the existing chromium ratchet entries, now measured on two more engines. **No
fix is made here** — fixes belong to N1-O3.

**Firefox reproduced all 46 with identical verdicts.** 41 of 46 also matched chromium's
recorded number exactly; the other 5 differ only by Gecko text metrics, never by verdict:

| condition | component | chromium (recorded 2026-08-24) | firefox 151.0 (2026-08-31) |
|---|---|---|---|
| `touch` | `DzFieldArray` | undersized=3, smallest `input 159×21` | undersized=**2**, smallest `input 162×21` |
| `touch` | `DzInput`, `DzInputMask`, `DzProvider`, `DzSearchInput` | smallest `input 159×21` | smallest `input **162**×21` |
| `touch` | `DzRating` | smallest `div 116×20` | smallest `div 116×**20.5**` |
| `zoom-400` | `DzDataGrid` | overflow 197 px | overflow **195** px |
| `zoom-400` | `DzTable` | overflow 102 px | overflow **101** px |
| `zoom-400` | `DzTabs` | overflow 49 px | overflow **43** px |

The largest divergence is 6 px on `DzTabs`, and every one of them still fails. The
`DzFieldArray` count difference (3 → 2 undersized) is the only structural one and is a
text-metric consequence too: one input clears 24 px height on Gecko's line box and does
not on Blink's.

**WebKit reproduced 44 of 46**, same verdicts, with two exceptions promoted to class (b).

Failing components, unchanged from the chromium ledger:

- `touch` (28, WCAG 2.5.8 Target Size): `DzBreadcrumb DzCheckbox DzCheckboxGroup DzCombobox
  DzDatePicker DzDateRangePicker DzFieldArray DzInplace DzInput DzInputMask DzLightbox*
  DzMultiSelect DzNumberInput DzPasswordInput DzPersonaSelector DzProvider DzRadio
  DzRadioGroup DzRangeSlider DzRating DzResizable DzSearchInput DzSlider DzSplitter
  DzTagsInput DzTree DzTreeItem DzTreeSelect`
- `zoom-400` (18, WCAG 1.4.10 Reflow): `DzAnchor DzDataGrid DzFieldArray DzImageComparison
  DzMenu DzOrderList* DzOtpInput DzPersonaSelector DzPopconfirm DzRangeSlider DzScrollArea
  DzSlider DzSpeedDial DzTable DzTabs DzToolbar DzTour DzTransfer`

`*` = does not reproduce on WebKit; see 4b.

### 4b. Class (b) — engine-specific divergence, recorded in the per-engine ratchet: 2, both WebKit

Both were surfaced by the mechanism the chromium ledger predicted: an **unexpected pass**,
which failed the WebKit run until it was measured and recorded. Neither was skipped.

**B1 · `DzOrderList` / `zoom-400` / webkit 26.5 — a 1 px layout-rounding divergence.**
The assertion allows overflow ≤ 1 px. Measured on the same page at the same width:

| engine | `documentElement.scrollWidth` | `clientWidth` | overflow | verdict |
|---|---|---|---|---|
| chromium 149 | 322 | 320 | **2 px** | fail |
| firefox 151 | 322 | 320 | **2 px** | fail |
| webkit 26.5 | 321 | 320 | **1 px** | pass (at the boundary) |

The component overflows 320 px on all three engines. WebKit rounds the same layout to
exactly the tolerance. This is **not** evidence that `DzOrderList` reflows — it is the
smallest entry in the ledger sitting one pixel from the line. Fixing it in N1-O3 removes
the divergence with it. **No upstream issue: this is rounding, not a bug in any engine.**

**B2 · `DzLightbox` / `touch` / webkit 26.5 — a transient teleported overlay, and the
chromium entry is measurement-unstable.** Measured control-by-control at the exact moment
the matrix measures (`t=0`, immediately after `sb-show-main`) and again one second later:

| engine | `t=0` matching controls | `t=0` undersized | `t=+1 s` matching controls |
|---|---|---|---|
| chromium 149 | **11** | **3** (`button 16×16`, `button 20×20`, `button 20×20`) | **8** |
| firefox 151 | **11** | **3** (identical) | 8 |
| webkit 26.5 | **8** | **0** | 8 |

The three undersized controls live in a **teleported overlay that exists for under a
second**. Chromium and Firefox catch it; WebKit has already removed it at `t=0`.

The important half of this finding is not about WebKit. **The chromium ratchet entry for
`DzLightbox:touch` was measured against DOM that is gone a second later**, so it is
timing-unstable on chromium too. The WebKit pass is *not* evidence that the controls are
≥ 24×24. The chromium entry is **left untouched** — this task may not move that ratchet —
and the instability is raised as owner decision **D3** in §8.

Both are recorded in the new `e2e/matrix/engine-ratchets.json` under
`engines.webkit.notReproducing`, each with all three engines' measurements, a reason, an
`upstreamIssue` field (`null`, honestly — neither is an engine bug) and `reCheckedAt`.
**Neither is a skip:** the cell still loads the story, still costs wall clock, and still
reports; only the *expectation* is withdrawn for that one engine.

### 4c. Class (c) — harness/environment defect: 1 defect, 84 affected cells, WebKit only

**H1 · `matrix-webkit-reduced-motion` reported 84 of 88 components as "still animating",
and not one of them was animating.**

*Symptom.* First WebKit sweep: 84 unexpected failures, every one
`Error: <Component> is still animating under prefers-reduced-motion: reduce`, every one
naming a single `DIV`. Deterministic — an isolated re-run of just that project reproduced
exactly 84.

*Root cause, measured.* The animating element is **Storybook's own loading spinner**:

```
{ playState: "running", ctor: "CSSAnimation", name: "sb-rotate360",
  node: "DIV.sb-loader", parent: "DIV.sb-preparing-story sb-wrapper",
  duration: 700, iterations: null }            ← null = infinite
```

`.sb-preparing-story` is hidden with `display: none` once the story shows and is **never
removed** from the DOM. Same page, same moment, three engines:

| engine | `.sb-preparing-story` present | its computed `display` | `document.getAnimations()` running |
|---|---|---|---|
| chromium 149 | yes | `none` | **0** |
| firefox 151 | yes | `none` | **0** |
| webkit 26.5 | yes | `none` | **1 — `DIV.sb-loader`** |

CSS Animations Level 1 is explicit: *"Setting the `display` property to `none` will
terminate any running animation applied to the element and its descendants."* Chromium and
Firefox terminate it; **WebKit 26.5 does not.** The trigger is therefore a genuine WebKit
divergence from the spec — but the *defect* is the harness's, because the assertion queried
`document.getAnimations()` across the entire document, so Storybook chrome could be
reported as a component failure. The measured object was never a `dzup-ui` component:
`inCanvas: false` for all 84.

*Classification.* **(c) harness/environment defect** — exactly one classification. It is
not (a): no component is at fault. It is not (b): an `engine-exceptions.json` entry would
remove the `{webkit, reduced-motion}` cell from the lane, and the condition *is* measurable
on WebKit — removing it would have hidden every real reduced-motion defect on that engine
forever.

*Fix (applied, one expression).* `e2e/matrix/conditions.spec.ts`, `reduced-motion` case:
`getAnimations()` is now filtered on `node.isConnected && node.checkVisibility()`. That
states the real rule rather than special-casing a class name — **an animation on an element
with no box cannot be perceived, so it cannot violate prefers-reduced-motion** — and it
keeps portalled overlays in scope, because they have boxes. `checkVisibility()` was
verified supported on all three engines before use.

*Re-verified after the fix, full projects, not spot checks:*

| project | before | after |
|---|---|---|
| `matrix-webkit-reduced-motion` | 84 failed / 92 passed | **176 passed, 0 failed** |
| `matrix-firefox-reduced-motion` | 176 passed | **176 passed** (unchanged) |
| `matrix-chromium-reduced-motion` | *(no surviving record)* | **176 passed** |

The WebKit behaviour is written into `engine-exceptions.json` as a new `engineBehaviours`
entry with its measurement, its impact and its resolution — and **not** as an `exception`,
because the lane did not narrow. `exceptions` remains `[]`. `upstreamIssue` is `null` with
an explicit note: **no upstream WebKit bug id was verified from this offline environment**,
so the normative spec sentence is cited instead and confirming or filing a bug is an owner
action (§8 D5). No issue number is invented.

### 4d. Cross-reference against the N1-O1 defect register (D1–D11) and its 3 test failures

The matrix asserts render plus one property per condition. It does not run `play()`
functions, does not run axe, and does not drive interactions — so most of the N1-O1 register
is structurally outside what this lane can see. Stated explicitly rather than left implied:

| N1-O1 | measured by this lane? | outcome |
|---|---|---|
| **D5** `DzOrderList` uses `:ariaLabel` not `:aria-label` — *N1-O1 routed this defect to N1-O2 by name* | **Yes — measured, and answered.** See below. | **Not an engine divergence.** But a real SSR defect was found. |
| **D1** `DzTree` tree-level `disabled` presentational only | no — needs interaction | unchanged, still open |
| **D2** `DzResizable` group-level `disabled` presentational only | no — needs interaction | unchanged, still open |
| **D3** `DzMention` `loading` prop shadowed by a ref | no — needs prop control | unchanged, still open |
| **D4** `DzCascader`/`DzTreeSelect` nested-interactive in a `role="combobox"` | no — needs axe | unchanged, still open. Both components *do* appear in the `touch` ledger, for an unrelated reason (16×16 controls) |
| **D6** `story-dod` `declaredStateProps` over-matches | no — validator, not browser | unchanged |
| **D7** `useFocusTrap` never restores focus | no — needs interaction | unchanged |
| **D8** `useDualModel` loses control after first edit | no — needs interaction | unchanged |
| **D9** `DzCombobox` clear button ignores `disabled` | no — needs a disabled fixture | unchanged. `DzCombobox` is in the `touch` ledger for a different control |
| **D10** `DzTreeSelect` two focus mechanisms | no — needs keyboard | unchanged |
| **D11** `DzDropdownMenu` dangling `aria-controls` | no — needs the menu open | unchanged |
| 3 pre-existing `storybook:test` failures (`DzFormField`/`DzFormParts` `role="alert"`, `Localisation` passing `:options`) | **no** — different runner (`vitest --project=storybook`), different assertions | **None re-appeared as a browser-matrix failure**, on either engine, in either sweep. They are not browser defects. |

**D5, answered.** Two measurements:

1. **Client, all three engines.** ARIA reflection is supported *and attribute-reflecting* on
   chromium 149, firefox 151 and webkit 26.5: setting `el.ariaLabel = 'x'` sets the
   **`aria-label` attribute** (`hasAttribute('aria-label') === true` on all three). Vue's
   `shouldSetAsProp` sees `'ariaLabel' in el`, sets the DOM property, and the property
   reflects. So `:ariaLabel` is **not** silently lost on any engine in this matrix. D5's
   worry does not materialise in the browser lane.
2. **SSR — and here it does bite.** `renderToString` of `h('ul', { ariaLabel: 'Reordered
   items' })` emits:

   ```html
   <ul arialabel="Reordered items"></ul>
   ```

   `arialabel` is a meaningless attribute. **The list is unnamed in server-rendered HTML
   until hydration patches it**, and no browser matrix can ever catch that because the
   matrix drives a client-rendered Storybook. This is a real, newly-measured defect and it
   is *why* D5 should be fixed, in a way the browser lane alone could not have shown.
   Routed to N1-O3 / N5 as a one-token fix (`:ariaLabel` → `:aria-label`) with SSR
   evidence attached.

   Note the `Default` story passes neither `ariaLabel` nor `aria-labelledby`, so the
   component's own binding is not exercised by any built story — the mechanism was measured
   directly instead.

### 4e. Reproducibility of the classification

Firefox was run **twice** — once against the harness as committed, once against the fixed
harness. The per-cell measured values are **identical between the two runs** (`diff` of the
extracted measurement table: no differences). WebKit's `reduced-motion` failure count was
identical (84) in the full sweep and in an isolated single-project re-run. No result in this
handoff rests on a single observation.

---

## 5. Ratchet state

### 5a. Chromium ratchet — verified untouched, with proof

| artifact | working tree | `HEAD` blob | verdict |
|---|---|---|---|
| `e2e/matrix/known-failures.json` | git blob `e52f8d0fd7c5f5e5516f44032810142a64c364b8`, MD5 `36f2d41db8879270343488ff8e775daf` | `e52f8d0fd7c5f5e5516f44032810142a64c364b8` | **byte-identical — 46 entries, untouched** |
| `e2e/matrix/targets.generated.ts` | `142a46c7da1506554551c56557caa6c39ca46856` | same | untouched |
| `playwright.config.ts` | `0c49f0f07d780076cb1fe583ea124564df525773` | same | untouched |

**The chromium run record survived every Playwright invocation.** Backed up before the
first command and MD5-verified after each of the six sweeps, probes and re-runs:

| moment | `test-results/matrix-report.json` MD5 |
|---|---|
| task start (matches the value N1-O1 §4f recorded) | `15b4139314e12569cc160609fa0692a3` |
| after Firefox smoke | `15b4139314e12569cc160609fa0692a3` |
| after WebKit smoke | `15b4139314e12569cc160609fa0692a3` |
| after Firefox sweep 1 | `15b4139314e12569cc160609fa0692a3` |
| after WebKit sweep 1 | `15b4139314e12569cc160609fa0692a3` |
| after the isolated `reduced-motion` re-run | `15b4139314e12569cc160609fa0692a3` |
| after Firefox sweep 2 | `15b4139314e12569cc160609fa0692a3` |
| after WebKit sweep 2 + chromium control | `15b4139314e12569cc160609fa0692a3` |
| **task end** | **`15b4139314e12569cc160609fa0692a3`** |

`test-results/.last-run.json` (MD5 `f196824657d8858bc7fa44eecbba38b1`) is also unchanged.
**How:** every Playwright invocation passed `--output=.tmp-n1o2/artifacts-*`, so
Playwright's start-of-run cleaning never touched `test-results/`, and
`PLAYWRIGHT_JSON_OUTPUT` was pointed at a scratch path, never at the chromium report. A
copy of the record was taken before the first command and held outside the repository.

### 5b. Per-engine ratchets initialised — `e2e/matrix/engine-ratchets.json` (new file)

| engine | version | conditions run | cross-engine entries reproducing | `notReproducing` (engine divergences) | `engineOnly` |
|---|---|---|---|---|---|
| chromium | 149.0.7827.55 | **2 / 6** (durable record only) | 46 (asserted by `known-failures.json`, measured 2026-08-24, record lost) | **0** | **0** |
| **firefox** | **151.0** | **6 / 6** | **46 / 46** | **0** | **0** |
| **webkit** | **26.5** | **6 / 6** | **44 / 46** | **2** — `DzOrderList:zoom-400`, `DzLightbox:touch` | **0** |

These are ratchets, not documentation. `knownFailure()` in `e2e/matrix/fixtures.ts` is now
engine-aware, so:

- a `notReproducing` entry that starts failing on that engine **fails the run** (it is no
  longer expected to pass there),
- a cross-engine entry that starts passing on **any** engine still fails the run as an
  unexpected pass,
- removing an entry is the only way either number goes down.

The two ledgers stay separated on purpose: `known-failures.json` is the **cross-engine**
ratchet at 46 and this task did not touch it; `engine-ratchets.json` carries only the
per-engine delta. Merging them would have meant editing the chromium ratchet to record a
WebKit fact.

### 5c. Every other ratchet — unmoved

| ratchet | ceiling / source | before | after | verdict |
|---|---|---|---|---|
| browser measured failures (cross-engine) | `e2e/matrix/known-failures.json` | 46 | **46** | **HOLDS** — file byte-identical |
| firefox engine divergences | `engine-ratchets.json` | *(did not exist)* | **0** | initialised |
| webkit engine divergences | `engine-ratchets.json` | *(did not exist)* | **2** | initialised, each measured |
| engine-condition exceptions | `engine-exceptions.json` → `exceptions` | 0 | **0** | **HOLDS** — the lane did not narrow |
| unclassified ownership symbols | `maxUnclassified: 29` | 29 | **29** | HOLDS |
| public components without anatomy | `maxWithoutAnatomy: 136` | 136 | **136** | HOLDS |
| story-DoD tier-required | `story-dod-ceiling.json` | 0 open | **0 open** | HOLDS (N1-O1 closed it) |
| ADR registry-only citations | 14 | 14 | **14** | HOLDS |
| AT cells executed | 0 / 534 | 0 | **0** | unchanged — out of scope |

**No ceiling was raised. No ceiling was edited. No component source was changed.**

---

## 6. Capability-matrix regeneration

### 6a. What actually moved — and the honest number

**Cells that moved from `unrun` to a real state: 0.** Not because the runs produced nothing,
but because **no `browser-matrix` cell was ever `unrun`** (§1d): the generator's only
question of the run record was whether the file exists, so all 89 cells were already `pass`
(47) or `present` (42) on the strength of a 2-of-18-project chromium report. The claim in
the task prompt that Firefox/WebKit cells showed `unrun` does not match the artifact.

`yarn generate:capability-matrix` → exit 0, `144 components, 1661 evidence cells`.

| | before | after |
|---|---|---|
| cell **state** changes | — | **0** |
| tier totals (`A/B/C/D` × 5 states) | — | **identical** |
| `browser-matrix` cells | 47 `pass` / 42 `present` | **47 `pass` / 42 `present`** |
| `browser-matrix` cells carrying **per-engine coverage** | **0** | **89** |
| `browser-matrix` cells citing `engine-ratchets.json` as an artifact | 0 | **89** |
| declared `inputs` | 4 | **5** — `browser-engine-ratchets` added |

`packages/core/docs/capability-matrix.json` MD5 `5d5de287900daf41bea3cf6194e62366` →
`faac22966edf44857aaa875a701f0543`; the Storybook projection
`apps/storybook/stories/_data/capability.generated.ts` moved with it
(`94d9152a50d40f91fc2aa1577763dbcf` → `c61319d493808992d1f1f32a72928601`), so the rendered
page shows the same facts.

### 6b. What a cell says now

The generator gained one function, `browserEngineNote()`, reading the **committed**
`engine-ratchets.json` — deliberately not the git-ignored Playwright reports, so
`validate:capability-matrix`'s freshness gate stays deterministic for anyone who runs it.
Example, `DzOrderList`:

> Known failures in zoom-400; see the ledger. chromium 149.0.7827.55 (playwright chromium
> v1228): 2/6 conditions (default, rtl), no expected failure in what it ran, **and did not
> run zoom-400 — where the ledger expects a failure**. firefox 151.0 (playwright firefox
> v1532): all 6 conditions, expected failure in zoom-400. webkit 26.5 (playwright webkit
> v2311): all 6 conditions, no expected failure in what it ran; **the cross-engine
> expectation for zoom-400 is withdrawn on this engine (measured divergence in
> e2e/matrix/engine-ratchets.json)**.

Three things a reader could not previously get from the matrix at all: which engines ran,
how much of the six-condition sweep each covered, and which engine diverged and why. The
`inputs` block now leads with `Engine coverage of the 6-condition sweep: chromium 2/6,
firefox 6/6, webkit 6/6.`

### 6c. Stale-cell detection reflects the new state

`validate:capability-matrix` → **`fresh, and no Tier D cell is unexplained`**, with
**11 stale cells reported by name** — the same 11 `perf-baseline` cells N0-05 §8 D3
identified, whose components moved at `e986952` after the baselines were captured. **No
`browser-matrix` cell is stale**, and none became stale: the two engines ran at `51dec93`,
the commit every row is bound to. The stale count did not move because this task produced no
perf evidence, which is the correct outcome, not an omission.

---

## 7. `yarn validate:all`, and tooling failures reported separately from component failures

### 7a. The gate

**`yarn validate:all` → EXIT 0. All 27 chained links green. Zero red gates.** Run bare, exit
code captured directly, output inspected separately — never through a pipe.

Links whose output changed as a result of this task:

| link | result |
|---|---|
| `validate:capability-matrix` | **PASS** — fresh, no Tier D cell unexplained, 11 stale reported by name |
| `validate:story-dod` | PASS — every enforced check passes; **314** reported items remain (366 − 52 authored by N1-O1) |
| `validate:story-dod-tiers` | PASS — no tier-required category above its ceiling |
| `validate:ownership` | PASS — 1 327 entries fresh, 29/29 unclassified, 136/136 without anatomy |
| `validate:quality-tiers` | PASS — 144/144 tiered (A55 B67 C21 D1), matrix fresh |
| `lint` (`--max-warnings 0`) | PASS — includes the three files this task edited and the one it added |
| the other 21 links | PASS, unchanged |

Additionally, `npx vitest run packages/tooling/src/validators/capability-matrix.spec.ts
packages/tooling/src/quality` → **19 tests passed, 2 files**, confirming the generator change
did not break the validator's own unit contract.

### 7b. Tooling failures (0)

**Zero tooling failures.** Specifically, nothing in this task hit the class of problems the
prior sessions warned about:

- **No `yarn <script>` exited 127.** `yarn workspace @dzup-ui/tokens build`,
  `yarn storybook:build`, `yarn generate:capability-matrix` and `yarn validate:all` all
  resolved and ran under `yarn`. `npx` was used only for `playwright`, `eslint`, `tsx` and
  `vitest` invocations that needed flags no script exposes.
- **No gate result was read through a pipe.** Every exit code was captured bare.
- **`playwright install`** exited 0 with nothing to download; no engine failed to launch;
  no launch error occurred at any point. **The first stop condition — "an engine cannot
  launch in this environment" — did not fire**, on either engine, on Windows.
- One self-inflicted shell mishap is recorded for completeness: an unquoted heredoc let
  bash expand backticks inside a JSON string, stripping four code spans and creating a
  stray empty `.sb-loader` file in the repository root. Both were detected and repaired
  within the session (`git status` is clean of it), and the file contents were re-verified
  field by field afterwards. The lesson is the one the P4-05/P5-03 handoffs already record:
  a shell heredoc is the wrong tool for writing text containing shell metacharacters.

### 7c. Component failures (90 measured, all classified)

Reported separately, as `<validation>` requires: **46 real component defects measured on
Firefox and 44 on WebKit**, all pre-existing, all already ratcheted, none newly introduced,
none fixed here. Plus the two engine divergences and the one harness defect of §4. **Zero
new component defects were found by either engine** — which is itself the headline result
for Firefox.

### 7d. Files changed by this task

| file | change | class |
|---|---|---|
| `e2e/matrix/engine-ratchets.json` | **new** — per-engine ratchet, versions, commit binding, `worktreeDirty`, admissibility, the two measured WebKit divergences | evidence artifact |
| `e2e/matrix/engine-exceptions.json` | `reCheckedAt` 2026-08-31 + versions + method + result; new `engineBehaviours` entry for the WebKit `display:none` animation divergence. **`exceptions` still `[]`** | evidence artifact |
| `e2e/matrix/conditions.spec.ts` | H1 fix — `reduced-motion` filters `getAnimations()` on `isConnected && checkVisibility()`, with the measurement in the comment | harness |
| `e2e/matrix/fixtures.ts` | `knownFailure()` is engine-aware; reads `engine-ratchets.json`; both ledgers documented at the call site | harness |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | reads the committed engine ledger; `browserEngineNote()`; new `browser-engine-ratchets` input | generator |
| `packages/core/docs/capability-matrix.json` + `apps/storybook/stories/_data/capability.generated.ts` | regenerated | generated |
| `test-results/matrix-report-firefox.json`, `-webkit.json` | new run records (git-ignored, like chromium's) | run record |

**Zero files under `packages/core/src/**` were modified.** No `.vue`, `.types.ts`,
`.tokens.ts`, `.variants.ts`, spec or barrel was touched. No public API, prop, emit, slot,
token or variant taxonomy changed. **No commit, push, CI dispatch, baseline replacement or
publication was performed.**

### 7e. Stop conditions

| stop condition | fired? |
|---|---|
| an engine cannot launch in this environment | **no** — both launched, versions in §1f, zero launch errors |
| failure count so large that triage exceeds the session | **no** — 176 outcomes, **0 untriaged**, no partial handoff needed |
| triage requires editing component source beyond a trivial fix | **no** — zero component-source edits. The one fix made (H1) is in the *harness*, and it is one expression |

---

## 8. Unresolved owner decisions

| # | decision | evidence | owner call needed |
|---|---|---|---|
| **D1** | **The chromium browser lane has no durable six-condition evidence, and losing it required nothing unusual.** | §1e: `config.argv` in the only surviving record proves 2 of 6 projects. The 08-24 six-condition run was overwritten by an ordinary partial re-run on 08-25. Every `browser-matrix` cell has been derived from that 2-project file ever since. | Re-run `matrix-chromium-*` for all six conditions and, before doing so, decide how the record is protected. This task's mitigation (per-engine report filenames + `--output` away from `test-results/`) protects *new* records but does nothing about the next `yarn test:e2e:matrix`, which wipes `test-results/` wholesale. N0-05's D5 remedy — a committed, schema-pinned browser ledger — is now half-built: `engine-ratchets.json` is committed and carries per-engine coverage and totals. Finish it by making `validate:capability-matrix` **fail** (not note) when a `browser-matrix` cell degrades from `pass`/`present` to `unrun`. |
| **D2** | **The `46` is now proven cross-engine. Does the ledger's shape follow?** | §4a: Firefox reproduced 46/46, WebKit 44/46, with numbers matching to within text metrics. `known-failures.json` still says `measuredOn: "chromium only"` and every entry still says `measured.engine: "chromium"`. | The file's own text is now out of date in the direction of understating its authority. Updating it is a ratchet edit, which this task is forbidden to make. An owner should re-stamp `measuredOn` with the three-engine result and decide whether each entry gains a `reproducedOn: [firefox, webkit]` field — turning 46 chromium observations into 46 cross-engine ones, which is a stronger claim for the same number. |
| **D3** | **One of the 46 is measurement-unstable on chromium itself.** | §4b B2: `DzLightbox:touch` measures 3 undersized controls at `t=0` and 0 at `t=+1 s` on chromium, because they live in a teleported overlay that unmounts. The entry therefore depends on when the assertion happens to fire. | Decide whether the matrix should settle before measuring (a `waitForLoadState('networkidle')` or an explicit settle, which slows every one of 3 186 cells), or whether `DzLightbox`'s story should not transiently mount an overlay. Until then this entry is not reliable evidence in either direction, and N1-O3 should not "fix" it without re-measuring. |
| **D4** | **`DzOrderList` reflow sits 1 px from the tolerance.** | §4b B1: overflow 2 px on Blink and Gecko, 1 px on WebKit, against a `≤ 1 px` assertion. | It is the cheapest of the 18 reflow fixes and it removes an engine divergence for free. Worth being first in N1-O3's queue for that reason alone — but somebody should confirm the tolerance is right. A 1 px allowance that flips a verdict between engines is a tolerance doing real work. |
| **D5** | **The WebKit `display:none` animation divergence has no verified upstream issue.** | §4c: measured on all three engines against the normative CSS Animations Level 1 sentence. `upstreamIssue` is `null` in both ledger files, with a note saying why. | Someone with network access should find or file the WebKit bug and put the id in `engine-exceptions.json → engineBehaviours[0].upstreamIssue`. **No id was invented to fill the field.** The `<triage>` requirement is "upstream issue link *where one exists*" — none was verifiable from here. |
| **D6** | **`DzOrderList` binds `:ariaLabel`, and SSR renders `arialabel`.** | §4d: measured. Client-side the reflection saves it on all three engines; `renderToString` emits `<ul arialabel="…">`, so the list is unnamed until hydration. N1-O1 routed D5 here; this is the answer. | One-token fix (`:ariaLabel` → `:aria-label`), but it is component source. Route to N1-O3 or N5-02 with the SSR evidence attached — and consider whether `validate:*` or the SSR spec corpus should catch camelCase ARIA bindings generally, since nothing does today. |
| **D7** | **Playwright's WebKit on Windows is not Safari, and the evidence must not be quoted as if it were.** | §1f: `Playwright.exe`, WinCairo port, macOS user agent. | Decide whether WebKit evidence is acceptable from Windows for the "Baseline Widely Available" statement the docs site will publish, or whether a macOS runner is required before that claim ships. This is a CI-topology decision with a cost, and it should be made before DOCS-02 publishes evidence pages. |
| **D8** | **This entire run is worktree-dirty and therefore inadmissible as release evidence.** | §2. The task forbade committing and the tree could not be cleaned. | Commit the 47 files inventoried in §2c (they are N1-O1's stories plus program docs) and re-run both sweeps. The re-run is ~45 min of wall clock and is expected to reproduce these numbers exactly — Firefox already reproduced itself byte-for-byte across two runs (§4e). Until then nothing here may be quoted as CI, release or production evidence. |

---

## 9. Ranked next packet

| rank | packet | why now |
|---|---|---|
| **1** | **D8 — owner commits the tree, then re-run both sweeps** | Cheap (~45 min, unattended) and it converts this entire handoff from `locally qualified, worktree-dirty` into admissible evidence. Everything below is worth more once it is done, and nothing below depends on it being done first. |
| **2** | **D1 — re-run the chromium six-condition sweep and harden the record** | The largest remaining hole in the browser lane is now *chromium's*, not Firefox's or WebKit's. Two of six conditions is the weakest engine coverage in the matrix, and the component defects the missing four conditions measured (all 46 of them) currently rest on a run record that no longer exists. Pair it with the `validate:capability-matrix` degradation gate so this cannot recur. |
| **3** | **TASK-N1-O3 — fix the 46 measured WCAG 2.2 failures** | Now unblocked in the way the roadmap intended: N0-05 said to run O3 *after* O2 so a fix is not made against a chromium-only cluster. It is not chromium-only — 46/46 on Gecko, 44/46 on WebKit — so every fix is a three-engine fix. Order within it: `DzOrderList` first (D4, 1 px, removes a divergence), then the systemic 16×16/18×18 form-control hit areas (they fan out across ~20 of the 28), then the fixed-width reflow stories. Do **not** touch `DzLightbox:touch` until D3 is settled. |
| **4** | **D6 — the `:ariaLabel` SSR defect** | Newly measured, one token, and it is a silent accessibility defect in server-rendered output that no existing gate can see. Small enough to ride along with N1-O3. |
| **5** | **D2 — re-stamp `known-failures.json` with the three-engine result** | A ratchet edit, so it needs an owner. It strengthens the same number rather than moving it, and it stops the file from telling the next reader that only chromium has ever measured these. |
| **6** | **D5 — find or file the WebKit upstream issue** | Needs network access, not judgement. Blocks nothing, but the exceptions file should not carry a `null` where a link belongs. |
| **7** | **D7 — decide the macOS-runner question** | Only becomes urgent when DOCS-02 publishes per-component browser evidence. Deciding it early is cheaper than retracting a claim later. |
| **8** | **TASK-N1-O4 — manual AT cells** `[!owner]` | Still 0/534. Terminates in an owner gate (named tester and cadence) that no agent can satisfy; keep last, as N0-05 concluded. |

---

## Appendix — reproduction

```bash
cd ui/dzup-ui
git rev-parse HEAD                            # 51dec93c73214af2d1e424e3454a7122691fea48
git status --porcelain                        # compare against section 2b; hash per section 2c

npx playwright install firefox webkit         # exit 0, nothing to download at 1.61.1
npx playwright --version                      # 1.61.1

# Protect the chromium record BEFORE any Playwright command.
cp -a test-results/. <somewhere outside test-results>
md5sum test-results/matrix-report.json        # 15b4139314e12569cc160609fa0692a3

yarn workspace @dzup-ui/tokens build
yarn storybook:build                          # 24.15 MB within budget 25 MB

export STORYBOOK_E2E_STATIC=1 STORYBOOK_E2E_PREBUILT=1

# Firefox — 6 projects, one invocation, ~23 min. NOTE --output: it is what keeps
# Playwright's start-of-run cleaning away from test-results/.
PLAYWRIGHT_JSON_OUTPUT=$PWD/test-results/matrix-report-firefox.json \
npx playwright test e2e/matrix --output=.pw-out/firefox \
  --project=matrix-firefox-default --project=matrix-firefox-forced-colors \
  --project=matrix-firefox-reduced-motion --project=matrix-firefox-rtl \
  --project=matrix-firefox-touch --project=matrix-firefox-zoom-400
# → 1056 passed, 6 skipped, exit 0

# WebKit — sequentially, never in parallel (port 6106, --strictPort), ~20 min.
PLAYWRIGHT_JSON_OUTPUT=$PWD/test-results/matrix-report-webkit.json \
npx playwright test e2e/matrix --output=.pw-out/webkit \
  --project=matrix-webkit-default --project=matrix-webkit-forced-colors \
  --project=matrix-webkit-reduced-motion --project=matrix-webkit-rtl \
  --project=matrix-webkit-touch --project=matrix-webkit-zoom-400
# → 1056 passed, 6 skipped, exit 0

md5sum test-results/matrix-report.json        # still 15b4139314e12569cc160609fa0692a3
git hash-object e2e/matrix/known-failures.json
git rev-parse HEAD:e2e/matrix/known-failures.json   # must be equal

yarn generate:capability-matrix               # 144 components, 1661 cells
yarn validate:all                             # EXIT 0
```

Do **not** run `yarn generate:exports` (N0-05 D2). Do **not** run `yarn test:e2e:matrix`
without first moving `test-results/` aside — it wipes the directory, and that is how the
chromium six-condition record was lost (§1e).
