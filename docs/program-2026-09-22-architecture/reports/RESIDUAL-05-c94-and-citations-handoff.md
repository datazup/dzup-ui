# RESIDUAL-05 — the keyboard half of C9.4 (`D-RES04-1`) and the substring-match citation (`D-RES02-2`)

> Repository `ui/dzup-ui` (OSS, `@dzup-ui/*`), HEAD
> **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`**, worktree dirty **by design**
> (**304 paths at start** — the 16-task programme plus RESIDUAL-01…04). No commit,
> push, CI dispatch, publish, `yarn install`, baseline replacement or screenshot
> capture was performed. Written **incrementally**, phase by phase: three agents in
> this programme stalled mid-task and only incremental writes saved their work.

**Status: COMPLETE.** Both items fixed, each proved able to fail by a seeded break on non-test source, each seed restored byte-identically. Item 1 measured the keyboard path instead of inferring it and found a **bigger** defect than the one it was sent to fix. Item 2 measured how much existing evidence is real (**193 of 201**) and the capability matrix **moves in the worse-looking, truer direction**: `unrun` **400 to 403**, reported and not hidden, with **no ceiling touched**. Two decisions closed, two raised.

## 0. Start state, recorded before anything was touched

| Check | Value at start |
|---|---|
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain \| wc -l` | **304** |
| `sha256sum yarn.lock` | `6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb` |
| `find packages apps e2e -name '__screenshots__'` | **nothing** |
| `git worktree list` | one entry |

<!-- PHASES APPENDED BELOW -->

---

## 1. Item 1 (`D-RES04-1`) — the keyboard path, **measured** in real chromium

RESIDUAL-04 was explicit that it **inferred** reachability. This packet probed it.
Probe: a throwaway story (`packages/core/stories/forms/Residual05Probe.stories.ts`,
deleted in §7) driving a real `DzCombobox` on the mocked host, in the app-local
runner, reading the live DOM and `document.activeElement` at each step.

```
cd apps/storybook
node node_modules/vitest/vitest.mjs run --project=storybook \
  ../../packages/core/stories/forms/Residual05Probe.stories.ts
→ 1 file, 1 test, 1 failed (the probe's own forced throw), 8.25 s, EXIT=1  (file-captured)
```

### 1.1 The headline: the retry control is **not reachable by `Tab` at all**

This is the bigger finding the brief asked to be named as such if it turned up. It did.

| Probe line | Measured value |
|---|---|
| Tabbable descendants of `[data-part="content"]` in the error state | **exactly one — the retry button itself** (`BUTTON[part=options-retry]<Try again>`) |
| `retry.tabIndex` · `retry.disabled` | **`0`** · **`false`** — the button is perfectly focusable |
| `activeElement` before the walk | `INPUT#v-0[part=input]{aria=Person}` — the panel's own combobox input |
| `activeElement` after **one** `{Tab}` | **`BUTTON[part=root]<After>`** — the *host page's* next button, **not** the retry |
| retry reached anywhere in an 8-deep `{Tab}` walk | **`false`** |
| the panel after that one `{Tab}` | **gone** — `[data-part="options-state"]` is `null` and `[data-part="content"]` count is **0** |

So the control is focusable and is the only tabbable thing in the panel, and `Tab`
**still** cannot reach it: the panel is portalled to `document.body`, so `Tab` from
the input follows *document* order into the host page, and the combobox closes the
popup on `Tab` as a combobox should. The walk ends after one key because the panel
it was walking no longer exists.

**That is a WCAG 2.1.1 (Keyboard) failure, not a focus-order one.** `Try again` is
the only way to recover a failed option load, and on this evidence **a keyboard-only
user cannot operate it at all**. The pointer fix RESIDUAL-04 shipped is real and
necessary; it does not give the control a keyboard route, and neither does the
focus-restoration half — restoration only matters once something *can* be focused.

### 1.2 Enter and Space, with the control focused programmatically

Since `Tab` cannot deliver focus, the probe placed it there itself (`retry.focus()`)
and measured both activation keys. This is the case a user reaches via a screen
reader's virtual cursor / form-controls mode, or any AT that focuses without `Tab`.

| Step | `document.activeElement` | retry in DOM | `[data-part="content"]` | `data-state` | row state | retries / requests |
|---|---|---|---|---|---|---|
| before `{Enter}` | **`BUTTON[part=options-retry]<Try again>`** | true | 1 | — | `error` | 0 / 1 |
| after `{Enter}` (sync) | **`BODY`** | **false** | **1** | — | `loading` | 1 / 2 |
| after `{Enter}` (+120 ms) | **`BODY`** | **false** | **1** | **`open`** | `loading` | 1 / 2 |
| before `Space` | **`BUTTON[part=options-retry]<Try again>`** | true | 1 | — | `error` | 1 / 2 |
| after `Space` (sync) | **`BODY`** | **false** | **1** | — | `loading` | 2 / 3 |
| after `Space` (+120 ms) | **`BODY`** | **false** | **1** | **`open`** | `loading` | 2 / 3 |

**Both keys fire the handler** (`retries` and `requests` both advance), so activation
works. **Both keys land `activeElement` on `BODY`** — the measured focus loss
`D-RES04-1` predicted, confirmed for `Enter` *and* for `Space`, at the instant of
activation and still 120 ms later.

**And one half of the prediction is measured false, which is worth stating plainly:
the panel does *not* close.** `[data-part="content"]` is still present and
`data-state="open"` after both keys. So the keyboard path is **not** the pointer
path's dismissal bug: it is a pure focus-loss bug. The user's keyboard position is
destroyed — focus falls to `document.body`, so the next `Tab` restarts from the top
of the document and there is no focus ring anywhere — but the popup survives.
RESIDUAL-04 wrote *"the same dismissal would follow"*; on this measurement it does
not, and the honest report is the smaller defect plus the larger reachability one.

### 1.3 Seven keyboard routes, none of which reaches the control

"Not reachable by `Tab`" would be a weak claim if some other key reached it, so
every plausible route out of the panel's input was driven, each on a **fresh** error
state, in the same probe run (`EXIT=1`, the probe's own throw):

| Keys, from `INPUT[part=input]` in the error state | `activeElement` after | on retry? | panel alive |
|---|---|---|---|
| `{Shift>}{Tab}{/Shift}` | **`BODY`** | false | **0 — closed** |
| `{ArrowDown}` | `INPUT[part=input]` | false | 1 |
| `{ArrowUp}` | `INPUT[part=input]` | false | 1 |
| `{Home}` | `INPUT[part=input]` | false | 1 |
| `{End}` | `INPUT[part=input]` | false | 1 |
| `{PageDown}` | `INPUT[part=input]` | false | 1 |
| `{Tab}{Tab}` | **`BODY`** | false | **0 — closed** |

The arrow/`Home`/`End`/`PageDown` family is Reka's option-navigation set and there
are **no options to navigate** in the error state, so focus never leaves the input.
`Tab` and `Shift+Tab` leave the panel and close it. **There is no keyboard route to
`Try again` on this control.**

### 1.4 It is the seam's behaviour, not one control's

`DzMultiSelect`, measured in the same run:

```
MS tabbables-in-panel: ["BUTTON[options-retry]<Try again>"]
MS before-Enter:  active=BUTTON[options-retry]<Try again>  isRetry=true
MS after-Enter:   active=BODY   retryConnected=false   panel=1   contentState=open
                  state=loading   retries=1   requests=2
```

Identical to `DzCombobox`: activation works, focus falls to `BODY`, the panel stays
open. So the focus-loss half is a property of the **shared row** and belongs on the
shared row — which is exactly the argument RESIDUAL-04 made for the pointer half.

### 1.5 A second conformance gap the probe walked into — `DzSelect` is **not** a host of the shared row

RESIDUAL-04 used `DzSelect` as its control group (*"`DzSelect` is not affected"*) and
counted **seven hosts of the shared row**. Both statements need correcting, and the
correction is the more interesting half of this item.

```
grep -rln DzOptionsState packages/core/src/components/forms/*.vue
  → DzCascader.vue  DzCombobox.vue  DzListbox.vue  DzMention.vue
    DzMultiSelect.vue  DzTransfer.vue  DzTreeSelect.vue       (7 — and no DzSelect.vue)
grep -c mousedown packages/core/src/components/forms/DzSelect.vue   →  0
```

`DzSelect` renders the async-options row **itself**, in its own template
(`DzSelect.vue:449`): its own `options-state` part with `role="status"` /
`aria-live="polite"`, its own message part, its own retry button. It is the exact
near-copy `DzOptionsState`'s own header says the component exists to prevent
(*"hoping the seventh copy still matched the first a year later"*). It has a reason
to exist — `DzSelect` publishes an `options-state` **slot** the shared component does
not have — but the consequence is that **neither** half of C9.4 had reached it:
no `@mousedown.prevent` (RESIDUAL-04's fix never touched this file) and no focus
return. Its pointer path passes anyway because Reka's `SelectContent` is a modal,
focus-trapped layer, which is precisely why nobody noticed the copy.

So the seam has **eight** hosts, seven on the shared row and one off it, and the
control group that "proved" `DzSelect` unaffected was measuring a different
implementation. Measured here: `DzSelect` fails the keyboard clause exactly like the
other two (§1.9, run 4).

### 1.6 Implemented files, and the API effect

| File | Change | API effect |
|---|---|---|
| `packages/core/src/components/forms/optionsStateFocus.ts` | **new.** `withRetryFocusReturn(retry, fallback, activate)` — C9.4's second half, **one definition**. It captures whether the retry owned focus *before* activating, and after the flush focuses the fallback **only if** focus was actually dropped on the body | **new internal module in `@dzup-ui/core`.** Not exported from the family barrel, not in any `index.ts`, so no public surface. Precedent for a bare helper in a family directory: `components/data/treeNavigation.ts` |
| `packages/core/src/components/forms/DzOptionsState.vue` | row gains `ref` + `tabindex="-1"` + `dz-focus-ring-control-inset`; retry gains `ref` and a `handleRetry` click binding; `handleRetry` delegates to the helper; the `@mousedown.prevent` comment's "keyboard activation is unaffected" line corrected | **behavioural fix, published package.** No prop, emit, slot, anatomy part, state value, message key or variant changed. The row gains `tabindex="-1"` (programmatically focusable, **not** in the tab order) and one focus-ring utility class |
| `packages/core/src/components/forms/DzSelect.vue` | two refs; `handleRetry` delegates to the same helper; its row gains `tabindex="-1"` + the ring class; **its retry gains `@mousedown.prevent`**, which every other host already had | same. The added `@mousedown.prevent` is a **conformance** change, not a measured defect fix — `DzSelect`'s pointer path already passed |
| `packages/core/stories/_shared/asyncOptionsHost.ts` | `walkAsyncOptionsStates` gains a **fifth phase**, `keyboard retry — C9.4`, asserted on the **contract** | none — stories are not published. **No test added or removed:** phases are `step`s inside one `play()`, so all eight story files keep their exact test counts |
| `.changeset/keyboard-retry-no-longer-drops-focus-on-the-body.md` | **new.** `@dzup-ui/core: patch` | the changeset itself |

**A changeset IS owed and was added.** `@dzup-ui/core` is in
`packages/tooling/scripts/release-policy.json`'s `published` list. `patch`, because
no declared surface changed — a control a keyboard user could activate but not
survive is a defect, not a feature.

**Why one helper module instead of a line in each component.** `DzSelect` is off the
shared row, so the rule has two homes whether or not it is factored out. RESIDUAL-02
hit the same shape with `isUntranslated` and resolved it the same way: **move the
definition, do not copy it**, so the two call sites cannot drift. The helper carries
the whole argument in its header; neither component re-argues it.

### 1.7 What the assertion asserts — the contract, not the implementation

The new phase deliberately does **not** assert that `activeElement` is the row. That
would pin *this* fix rather than the clause, and it would be false for `DzMention`,
which legitimately restores focus to its text control instead. What it asserts:

```ts
await waitFor(() => expect(row()).not.toBeNull())   // 1. the panel is still open
await expect(active).not.toBe(doc.body)             // 2. focus was not dropped
await expect(active!.isConnected).toBe(true)
await expect(active!.getAttribute('data-part')).not.toBeNull()  // on a NAMED element
host.resolve()
await waitFor(() => expect(row()).toBeNull())
await expectOptions()                               // 3. and the panel still works
```

1. **The popup stays open.** The row still being in the document *is* the panel still
   being rendered — when the layer dismisses, the whole panel including the row
   unmounts (RESIDUAL-04's probe A measured a content count of `0`). This holds on
   every host, portalled or in-canvas, without the walk having to know which.
2. **Focus lands on a named, stable element** — not the body, connected, and carrying
   a `data-part`, i.e. a member of the component's published anatomy. Which name is
   the host's business: the state row for seven of them, the text input for
   `DzMention`.
3. **And the panel is still usable:** each caller's own `expectOptions()` requires a
   *visible* option, which a dismissed panel cannot produce.

### 1.8 Seeded breaks — two, on **component source**, each restored byte-identically

Final bytes under proof:

```
07c4ee99e421c7c1d8a50d7d71a8fcbe77ad03a107dcad248683360535e39e6b  optionsStateFocus.ts
17c24e863c36cd50111162f3f9b099666eb8a61576535bb3fb9282d3d586ab31  DzOptionsState.vue
9f2cc962b7ad1bdbaf36b49caf0d041762a19c0a05e4abcb3bd6f52b922b107c  DzSelect.vue
```

| # | Seed, on component source | Result | Failing line | Restore |
|---|---|---|---|---|
| 1 | `withRetryFocusReturn`'s `fallback()` result replaced with `null`, so the focus return silently does nothing (`optionsStateFocus.ts`) | **3 failed / 51 passed, `EXIT=1`** — `DzCombobox`, `DzMultiSelect` **and `DzSelect`**; `DzMention` **passed** | `asyncOptionsHost.ts:216` — the "not the body" assertion | `sha256sum -c` all three **OK**, `EXIT=0` |
| 2 | `tabindex="-1"` deleted from the **shared row only** (`DzOptionsState.vue`) | **2 failed / 39 passed, `EXIT=1`** — `DzCombobox`, `DzMultiSelect`; **`DzSelect` passed** | same line | `sha256sum -c` all three **OK**, `EXIT=0` |

Both seeds are on *component* source, never on the test — the standard the last three
batches used. Two results are worth reading rather than skipping:

- **Seed 1's `DzMention` pass is not a gap, it is the fallback semantics working.**
  `DzMention` restores focus itself, so it does not depend on the helper's fallback and
  must not fail when the fallback is broken. That is the assertion refusing to pin an
  implementation detail, measured.
- **Seed 2's `DzSelect` pass is the §1.5 finding, measured a second way.** Breaking the
  *shared* row cannot touch `DzSelect`, because `DzSelect` is not on it. If anyone
  doubts the two implementations are genuinely independent, this is the proof.

### 1.9 Focused validation for item 1

| # | Command | Result | Exit (from a log file) |
|---|---|---|---|
| 1 | probe run 1 — Tab reachability + `Enter`/`Space`, **before the fix** | §1.1 / §1.2 | `EXIT=1` (the probe's own throw) |
| 2 | probe run 2 — seven keyboard routes + `DzMultiSelect`, **before the fix** | §1.3 / §1.4 | `EXIT=1` (same) |
| 3 | probe run 3 — `Enter` / `Space` / pointer click, **after the fix** | `Enter` → `active=DIV[options-state]`, on the row, panel present, `data-state` `open` · `Space` → **identical** · **pointer click → `active=INPUT[part=input]`, unchanged** | `EXIT=1` (same) |
| 4 | the **eight** story files that drive the shared walk, first run | **1 failed / 96 passed** — `DzSelect` only, at `asyncOptionsHost.ts:216`: the §1.5 finding | **`EXIT=1`** |
| 5 | the **nine** seam story files after `DzSelect` was wired | **9 files · 105 tests · 105 passed** | **`EXIT=0`** |
| 6 | seeded break 1 | **3 failed / 51 passed** | **`EXIT=1`** |
| 7 | seeded break 2 | **2 failed / 39 passed** | **`EXIT=1`** |
| 8 | `node …/vitest run packages/core/src/components/forms/` | **59 files · 889 tests · 889 passed** | **`EXIT=0`** |
| 9 | `node …/eslint --max-warnings 0` on the four changed files | clean; `--fix` **not** used — one `jsdoc/no-multi-asterisks` on a line beginning with an emphasised word was fixed by hand | **`EXIT=0`** |
| 10 | `node …/vue-tsc --noEmit -p packages/core/tsconfig.json` | no output | **`EXIT=0`** |

Run 3 is the one that proves the fix is **narrow**: the pointer path's
`activeElement` is still the panel's input, so RESIDUAL-04's behaviour is preserved
exactly and the keyboard path is the only thing that moved.

### 1.10 What item 1 does **not** fix, and why that is the bigger row

The focus-restoration half is done and proved. **Reachability is not fixed**, and it
cannot be fixed inside the row: making a portalled button `Tab`-reachable from a
combobox input is a change to how each panel manages focus, not a change to the row
inside it. Naming the shape of the fix so the decision is cheap for the owner:

- The retry control is the **only** tabbable element in the panel and `Tab` is
  reserved by the combobox pattern for leaving it, so `Tab` is not the route.
- The WAI-ARIA-conformant routes would be either (a) make the retry an
  `aria-activedescendant` target of the existing arrow-key navigation the input
  already owns, or (b) stop unmounting the control at all — keep it rendered while
  `state === 'loading'` and merely `disabled`, which is a one-line change to
  `useAsyncOptions().canRetry`'s consumers and would also delete the whole
  unmount-under-your-own-press class of defect, or (c) move retry off the row
  entirely and onto the control's own keyboard map (e.g. `Enter` on an error row
  re-requests).
- **(b) is the cheapest and the most likely to be right**, and it makes both halves
  of C9.4 vestigial rather than load-bearing — which is a strong hint that the
  unmount, not the focus, is the actual defect. It is *not* taken here: it changes
  what eight published controls render in the `loading` state, which is a visual and
  AT re-baseline, and `canRetry` is a documented computed on a published composable.

Raised as **`D-RES05-1`** (§5).

---

## 2. Item 2 (`D-RES02-2`) — the capability matrix cited evidence by substring match

### 2.1 The mechanism, exactly

`packages/tooling/src/quality/generate-capability-matrix.ts` derived **three** of the
matrix's evidence kinds through one helper:

```ts
/** Files under `dir` whose contents name the component. */
function filesMentioning(files: readonly { path: string, source: string }[], component: string) {
  const word = new RegExp(`\\b${component}\\b`)
  return files.filter(f => word.test(f.source)).map(f => rel(f.path))
}
```

Call sites: `axe` (over `packages/core/tests/a11y/*.spec.ts`), `ssr-sample` and
`portal-hydration` (both over `packages/core/tests/ssr/*.spec.ts`). A cell with at
least one hit reads `present` with that file as its published artifact; a cell with
none reads `unrun`.

`\b…\b` over the **whole file text** means a comment is evidence. Three real shapes
of prose in this repository grant a citation:

1. a header sentence — `* Tests DzDatePicker, DzFileUpload, DzSlider, …` naming a
   component the file does not import;
2. a **"tested elsewhere" note** — `// Note: DzCheckbox, DzRadio, DzSwitch, DzSelect
   are tested in inputs.a11y.spec.ts.` Read that again: a sentence whose *meaning* is
   "this file does not test these" is what grants this file their citations;
3. an explanatory aside — RESIDUAL-02's own comment, which named the provider
   component and silently added a file to its SSR evidence list.

### 2.2 How much of the existing evidence is real — **the headline**

Measured over the checked-in `capability-matrix.json` at `4e4e46f`, by recomputing
every citation both ways. The audit first verified it reproduces the **recorded**
artifacts exactly under the old predicate (0 mismatching cells in 432), so it is
measuring the shipped generator and not an approximation of it.

| | Count |
|---|---|
| Citations across the three substring-derived kinds | **201** |
| **Genuine** — the spec actually loads the component | **193 (96.0 %)** |
| **Substring-only artefacts** — prose, nothing more | **8 (4.0 %)** |
| Cells that lose **every** artifact, i.e. `present` → `unrun` | **3** |
| Citations the substring rule **missed** and structure finds | **0** |

Per kind: `axe` **7 of 64** false · `ssr-sample` **1 of 118** · `portal-hydration`
**0 of 19**. Per file, every false citation traces to four files, and five of the
eight to one sentence:

| Count | File |
|---:|---|
| **5** | `packages/core/tests/a11y/forms.a11y.spec.ts` |
| 1 | `packages/core/tests/a11y/media.a11y.spec.ts` |
| 1 | `packages/core/tests/a11y/data.a11y.spec.ts` |
| 1 | `packages/core/tests/ssr/dz-provider-ssr.spec.ts` |

The eight, named, because a number without names is not an audit:

| Tier | Component | Kind | The file it cited | Cell was | Cell now |
|---|---|---|---|---|---|
| B | `DzCheckbox` | `axe` | `forms.a11y.spec.ts` | `present` (2 artifacts) | `present` (1) |
| B | `DzRadio` | `axe` | `forms.a11y.spec.ts` | `present` (2) | `present` (1) |
| B | `DzSwitch` | `axe` | `forms.a11y.spec.ts` | `present` (2) | `present` (1) |
| B | `DzSelect` | `axe` | `forms.a11y.spec.ts` | `present` (2) | `present` (1) |
| **C** | **`DzDatePicker`** | `axe` | `forms.a11y.spec.ts` | `present` (1) | **`unrun`** |
| **B** | **`DzCarousel`** | `axe` | `media.a11y.spec.ts` | `present` (1) | **`unrun`** |
| **C** | **`DzTree`** | `axe` | `data.a11y.spec.ts` | `present` (1) | **`unrun`** |
| B | `DzPagination` | `ssr-sample` | `dz-provider-ssr.spec.ts` | `present` (3) | `present` (2) |

Four of the first five are `forms.a11y.spec.ts`'s *"are tested in
inputs.a11y.spec.ts"* note — and they are harmless in effect, because those four
really are covered by `inputs.a11y.spec.ts` and keep that citation. **The three bold
rows are the ones that matter: `DzCarousel`, `DzDatePicker` and `DzTree` had no axe
evidence at all and the matrix said they did.** `DzDatePicker` is the sharpest case:
`forms.a11y.spec.ts`'s header says *"Tests DzDatePicker, …"* and the file **never
imports it**, so a Tier C component's accessibility evidence was one stale sentence
in a docblock.

**So 96 % of the existing evidence is real.** That is the honest answer, and it is
better news than the mechanism deserved — the hole was wide open and mostly nobody
had fallen in. But it was not *nobody*, and no gate could tell the difference, which
is why 4 % is worth a packet.

### 2.3 What a citation requires now — structural, not textual

Implemented in a new module rather than inline, because the same decision is made by
three call sites and will be made by a fourth.

| File | Change | API effect |
|---|---|---|
| `packages/tooling/src/quality/spec-component-refs.ts` | **new.** `stripComments`, `componentsLoadedBy`, `filesLoading` | internal tooling, **not a published package** — no changeset owed |
| `packages/tooling/src/quality/spec-component-refs.spec.ts` | **new. 21 cases**, 8 of them asserting that prose grants nothing | — |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | `filesMentioning` → `filesLoadingComponent`, which delegates to `filesLoading`; the three call sites renamed; the header records the measurement | same — internal tooling |
| `packages/core/docs/capability-matrix.json` | **regenerated** — 8 citations removed, 3 cells `present` → `unrun`, 4 totals lines (§2.5) | none |
| `apps/storybook/stories/_data/capability.generated.ts` | **regenerated** by the same command (it is the narrowed projection the Storybook page imports) | `apps/*` is private |

The component must be **loaded** by the file, which prose cannot do. Three rules,
each one chosen because a real citation in this repository depends on it — the specs
were read first, and they do not all reference their subjects the same way:

1. **Its module is imported** — a static or dynamic import whose specifier's basename
   is the component (`…/DzButton.vue`). All **eleven** `tests/a11y/*.a11y.spec.ts`
   files and **three of the six** `tests/ssr/*.spec.ts` files work this way.
2. **It is an import binding** — a named or default import from a components or
   providers module.
3. **It is named to a dynamic loader.** `form-controls-ssr.spec.ts` and
   `form-layouts-ssr.spec.ts` import through a template literal
   (`import(\`…/${family}/${name}.vue\`)`) behind a `load(family, name)` helper, so
   the component name arrives as a **string-literal argument** and there is no
   specifier to match. Those are genuine loads carrying **many** of the 118
   `ssr-sample` citations, so a rule that only understood specifiers would have
   deleted real evidence. This rule is the loosest of the three and is **gated on the
   file actually containing such a loader** — `spec-component-refs.spec.ts` asserts
   it stays shut in a file that has none.

All three run against a **comment-stripped** source, hand-scanned rather than
regexed (a `//` inside a URL and a `/*` inside a string are both asserted). That is
what makes the rule structural: prose cannot produce an import, and prose that
*quotes* one is not read at all.

**What it deliberately does not claim.** An import proves the component is loaded, not
that the spec asserts anything about it. Proving assertion needs a per-component test
outcome — the `gate` shape the matrix uses elsewhere — and is a larger change than
closing the citation hole. An import is the **floor**, and it is a floor a comment
cannot reach. Recorded in the module header so the next reader does not mistake the
one for the other.

### 2.4 Fail closed — proved three ways, each restored byte-identically

Bytes under proof:

```
031f7b633b8d16dda439f6efb99d3dba016077f7391f70b32cd6cb1c671251de  capability-matrix.json
7e8d5f780d85a8c164014944b76bf03f924d5ec553a52c707b08deb1d8e13c87  capability.generated.ts
6aa78e181e0f7e93a44991d0cdf68018e50636a4efd66f0c87e71081144ff8f1  buttons.a11y.spec.ts
```

**Proof A — the seeded comment grants nothing.** A comment naming the two components
that this batch had just moved to `unrun` was seeded into a spec that imports
neither:

```
packages/core/tests/a11y/buttons.a11y.spec.ts
+ // SEEDED PROBE (RESIDUAL-05): DzCarousel and DzTree are covered elsewhere, not here.

yarn generate:capability-matrix   → EXIT=0, totals UNCHANGED
sha256sum -c   capability-matrix.json: OK   capability.generated.ts: OK
yarn validate:capability-matrix   → EXIT=0   ✓ fresh   unrun 403 (baseline 400, +3)
```

**Both generated artifacts are byte-identical with the comment on disk.** The
citation is not granted, so nothing goes stale and there is nothing for a gate to
catch — which is the correct outcome, not a missing gate.

**Proof B — the same seed against the OLD predicate, so the A/B is on the real
generator rather than argued.** `filesMentioning`'s body was seeded back in place of
the delegation and the generator re-run with the comment still on disk:

```
  tier       pass     fail  present    stale    unrun excepted
  B          325        0      304        0      247       41      ← back to the baseline
  C          147        0      117       21       87        2      ← back to the baseline

diff <post-fix matrix> <old rule + seeded comment>
  DzCarousel  axe:  "state": "unrun" → "present",
                     + "packages/core/tests/a11y/buttons.a11y.spec.ts"
  DzTree      axe:  "state": "unrun" → "present",
                     + "packages/core/tests/a11y/buttons.a11y.spec.ts"

yarn validate:capability-matrix   → EXIT=0   ✓ capability-matrix: fresh
```

Read that in order. **One comment, whose own text says the two components are covered
*elsewhere*, bought them two `present` accessibility-evidence cells citing a file
that imports neither — and the gate passed, `✓ fresh`, with the totals restored to
exactly the frozen baseline.** That is the defect, reproduced on demand, and it is
also the reason the frozen baseline should not be trusted as a target: under the old
rule, *making the number right* and *making the evidence right* pull in opposite
directions.

Restored: generator and spec file copied back from byte copies, regenerated,
`sha256sum -c` → all three **OK**, `EXIT=0`, and `git status --porcelain` on
`buttons.a11y.spec.ts` prints **nothing** (clean, as before the seed).

**Proof C — a gate does fire on a hand-planted citation.** The remaining hole after
proof A would be someone editing the artifact by hand. One fake citation was written
straight into the committed matrix (an `axe` cell flipped `unrun` → `present` citing
`buttons.a11y.spec.ts`):

```
yarn validate:capability-matrix
✗ [freshness] packages/core/docs/capability-matrix.json is stale.
  Run `yarn generate:capability-matrix` and commit the result.
1 capability-matrix violation(s).                                    EXIT=1
```

Restored, `sha256sum -c` **OK**, and the gate is green again with
`✓ capability-matrix: fresh` (`EXIT=0`). So the two halves compose: the **generator**
refuses to invent a citation from prose, and **gate 1** refuses a citation the
generator would not have produced. Neither was true yesterday.

### 2.5 The capability-matrix movement — old → new, exactly, and not hidden

| Total | Old (`4e4e46f`) | **New** | Δ |
|---|---|---|---|
| `pass` | 585 (A 106 · B 325 · C 147 · D 7) | **585** (106 · 325 · 147 · 7) | **0 — `pass` did not move** |
| `fail` | 0 | **0** | 0 |
| `present` | 608 (175 · **304** · **117** · 12) | **605** (175 · **303** · **115** · 12) | **−3** |
| `stale` | 22 (0 · 0 · 21 · 1) | **22** (0 · 0 · 21 · 1) | 0 |
| `unrun` | **400** (65 · **247** · **87** · 1) | **403** (65 · **248** · **89** · 1) | **+3** |
| `excepted` | 47 (4 · 41 · 2 · 0) | **47** (4 · 41 · 2 · 0) | 0 |
| rows / cells | 144 / 1662 | 144 / 1662 | 0 |

**`pass` did not move**, because the three kinds involved never produce `pass` — they
produce `present` (an artifact exists) or `unrun` (none does). The brief anticipated
`pass → unrun`; the measured movement is **`present → unrun`**, which is the same
correction one state to the left. Naming it precisely matters, because `pass` is the
number a reader of the page trusts most and it is untouched.

**The three cells that moved, in full:** `DzCarousel` (B) `axe`, `DzDatePicker` (C)
`axe`, `DzTree` (C) `axe` — each `present` with one artifact, now `unrun` with none.
**These three components have no axe evidence and never did.** The matrix now says so.

**The whole diff of the artifact is 21 removed and 10 added lines, and nothing else:**
4 totals lines, 8 citation entries, 3 state flips. No note was added or changed, no
other cell, row, input, provenance stamp or ordering moved.

**No ceiling was raised, no allowlist widened, and no `*ceilings*.json` file was
opened for writing.** `unrun` does not need one: `capability-matrix-ceilings.json`
says of `unrunCells` — in its own checked-in words — *"REPORT ONLY … a recorded
baseline, not a gate, and deliberately so … An unrun cell is a gap the page exists to
SHOW; failing on it is how a matrix becomes a thing people delete."* The validator
agrees at `capability-matrix.ts:460`. So the gate prints the drift and passes:

```
unrun 403 (baseline 400, +3) · A 65 · B 248 · C 89 · D 1
  Reported, not gated
✓ capability-matrix: fresh, and no Tier D cell is unexplained.     EXIT=0
```

**That printed `+3` is the honest record and it is deliberately left standing.**
Re-baselining `unrunCells.baseline` to 403 would be the natural tidy-up and it is
**not done here**: the number and its per-tier split are a recorded measurement with
a written derivation (*"400 at 4e4e46f, down from 441 before this task"*), and
rewriting it is the owner's act, not an agent's. Raised as **`D-RES05-2`** (§5).
The alternative — keeping 400 by keeping a fake citation — is the thing this packet
exists to refuse.

### 2.6 Focused validation for item 2

| # | Command | Result | Exit (from a log file) |
|---|---|---|---|
| 1 | the audit — recompute all 201 citations both ways | 193 genuine · 8 substring-only · 3 emptied cells · 0 gained · **0 of 432 cells where the old predicate fails to reproduce the checked-in artifacts** | **`EXIT=0`** |
| 2 | `node …/vitest run …/spec-component-refs.spec.ts` | **21 passed** | **`EXIT=0`** |
| 3 | `node …/eslint --max-warnings 0` on the three tooling files | clean. `--fix` **not** used: four real problems fixed by hand — two `regexp/no-super-linear-backtracking`, one `regexp/use-ignore-case`, one `regexp/no-contradiction-with-assertion`, plus three `no-template-curly-in-string` in fixtures that must *contain* a template opener (§2.7) | **`EXIT=0`** |
| 4 | `yarn typecheck:tooling` | no output | **`EXIT=0`** |
| 5 | `yarn generate:capability-matrix` | `144 components, 1662 evidence cells`; totals in §2.5 | **`EXIT=0`** |
| 6 | `yarn validate:capability-matrix` | `✓ fresh, and no Tier D cell is unexplained` · `unrun 403 (baseline 400, +3)` · `22 stale — ceiling 22` | **`EXIT=0`** |
| 7 | proof A — seeded comment, new rule | artifacts **byte-identical**, gate green | **`EXIT=0`** |
| 8 | proof B — seeded comment, old predicate restored | two `unrun` → `present` cells citing a file that imports neither component; **gate still green** | **`EXIT=0`** |
| 9 | proof C — hand-planted citation in the artifact | `✗ [freshness] … is stale` | **`EXIT=1`** |
| 10 | restores | `sha256sum -c` on all three files **OK** three separate times; `buttons.a11y.spec.ts` back to **clean** in `git status` | **`EXIT=0`** |

### 2.7 A lint rule this packet had to work around, recorded rather than fought

`no-template-curly-in-string` reads a string literal's **value**, not its raw text, so
a `$` escape does not satisfy it. Three fixtures in
`spec-component-refs.spec.ts` must *contain* a literal `${` — they are source text
about source text, and the template-literal loader is the thing under test. The
fixtures now build it by concatenating a `DOLLAR` constant, with the reason written
beside it so the obvious "simplification" (typing the two characters) does not
reintroduce a lint error. Same shape as `DzOptionsState.vue`'s note about
`validate:anatomy-parts` having no comment stripping (RESIDUAL-04 §9): a gate that
reads text cannot tell a subject from a mistake, and the cheapest correct answer is a
note, not a rule change.

---

## 3. Aggregate qualification — pre-existing vs new

Every exit code below was read out of a **file**, never from a harness completion
notice. The reason is RESIDUAL-03 §6.2's and it keeps earning its restatement: a
wrapper whose last statement is `echo` reports the wrapper. In RESIDUAL-04 the
harness reported "exit code 0" for a run whose log ended `VALIDATE_ALL_EXIT=1`.

### 3.1 The lanes

| Lane | Handed baseline | **This batch** | Verdict |
|---|---|---|---|
| `yarn typecheck` | 0 | **`EXIT=0`**, no output | held |
| `yarn typecheck:all` | 0 | **`EXIT=0`**, no output | held |
| `yarn lint` | 0 | **`EXIT=0`**, no output under `--max-warnings 0`; `--fix` **not** used | held |
| `yarn build` | 0 | **`EXIT=0`**; the `git status --porcelain` listing is **identical** before and after | held |
| unit suite | 573 files · 11,153 passed · 3 skipped · 1 todo · 0 failed | **574 files · 11,174 passed · 3 skipped · 1 todo · 0 failed · `EXIT=0`** | **+1 file, +21 tests — exactly this batch's new spec and its 21 cases** |
| browser lane (`yarn storybook:test`) | 170 files · 1,462 tests · 1,462 passed · 0 failed | **170 files · 1,462 tests · 1,462 passed · 0 failed · 96.35 s · `EXIT=0`**, `grep -c FAIL` → **0** | **identical — no regression** |
| `yarn validate:all` | 61 links, exit 1 at link 51 only | **61 links (measured), exit 1, exactly one `✗` in 470 lines, at link 51** | **same link, same clause, same text — no new failure** |

**The unit suite needed two runs, and both are reported.** Run 1: the *same* counts
(574 / 11,174 / 0 failed) but `EXIT=1`, with **57 unhandled errors** —
`ReferenceError: requestAnimationFrame is not defined` inside
`node_modules/@formkit/auto-animate`, all attributed to
`apps/landing/src/pages.interactions.spec.ts`, all *"caught after test environment was
torn down"*. Run that file alone: **13 passed, 0 errors, `EXIT=0`**, and
`grep -c 'DzSelect\|DzOptionsState\|optionsStateFocus'` over it is **0**. So it is the
documented load-dependent teardown race, not this batch's. Run 2 of the whole suite:
**`EXIT=0`, no errors.** Both runs are quoted rather than only the green one.

**The browser lane count is unchanged for a structural reason, not by luck.** The new
C9.4 phase is a `step` inside an existing `play()`, and Storybook's vitest integration
counts one test per **story**. So the lane gains an assertion on **eight** components
and stays at 1,462 tests — which also means the frozen lane number cannot be used to
detect the addition. Recorded so nobody reads 1,462 → 1,462 as "nothing happened".

### 3.2 `validate:all` — the failing link, and what it is not

```
node -e "…scripts['validate:all'].split('&&').length"   →  LINKS=61      (measured, never quoted)
yarn validate:all > log 2>&1 ; echo "VALIDATE_ALL_EXIT=$?" >> log
  470 lines · 39 lines carrying ✓ · exactly one ✗        →  VALIDATE_ALL_EXIT=1

✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0"              ← no declarant at all
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core, @dzup-ui/landing, @dzup-ui/sandbox
```

**Failing link: 51** (`yarn validate:peers` → `validate:icon-duplicates`). Identical
link, clause and text to RESIDUAL-01 §4.5, RESIDUAL-02 §3.3, RESIDUAL-03 and
RESIDUAL-04 run 25. **PRE-EXISTING**: every manifest reads `^0.477.0` and the
`0.475.0` row is an orphan lockfile resolution, which clears on the owner's
`yarn install` — an act withheld from every agent. `yarn.lock` was not touched.

**The chain reached link 51, so links 1–50 are green against this batch's files in
fact and not by argument** — including the four this batch's inputs feed:

```
✓ anatomy-parts: 622 data-part emissions across 142 components … 0/0 undeclared      (link 14)
✓ capability-matrix: fresh, and no Tier D cell is unexplained.                       (link 24)
  unrun 403 (baseline 400, +3) · A 65 · B 248 · C 89 · D 1   ← Reported, not gated
✓ component-meta: fresh, complete for all 144 public components, and every debt
  number at its ceiling.                                                             (link 35)
✓ docs pages fresh — 144 component pages + index + 6 evidence pages + nav + …        (link 38)
```

Note what did **not** happen this time: no gate was driven red by this batch's own
evidence. RESIDUAL-04 broke link 14 with a comment that quoted an anatomy attribute
and link 35 with a story whose line ranges moved; this batch's component comments were
written in prose from the start (`DzOptionsState.vue`'s `NB for the next editor` note
is why) and no story file was added or edited, so `component-meta.json` never moved.

**Links 52–61 remain unreached inside the aggregate** — the programme's standing
caveat, since `&&` halts at 51. Each was run individually against this tree:

| link | gate | exit |
|---|---|---:|
| 52 | `validate:licenses` | **0** |
| 53 | `validate:tree-shake` | **0** |
| 54 | `validate:evidence-binding` | **0** |
| 55 | `validate:deprecations` | **0** |
| 56 | `validate:adr-status` | **0** |
| 57 | `validate:at-runs` | **0** |
| 58 | `validate:docs-freshness` | **0** |
| 59 | `validate:runtime-floor` | **0** |
| 60 | `yarn build` | **0** |
| 61 | `validate:browser-lane` | **0** |

### 3.3 A regeneration input the sanctioned order does not name

Worth its own subsection because it cost this batch a red unit suite and the next
batch will hit it too.

`packages/core/security/inline-style-inventory.json` records, per site, the **line
number** of every `style=` attribute and `:style` binding in published component
source. `DzSelect.vue` carries `style="contain: layout style"`, and this batch's added
lines pushed it from **363 to 387**. `inline-style-inventory.spec.ts` compares the
artifact with a fresh derivation site for site, so it failed:

```
AssertionError: expected [ Array(133) ] to deeply equal [ Array(133) ]
    "file": "packages/core/src/components/forms/DzSelect.vue",
-   "line": 363,
+   "line": 387,
```

**No link of the sanctioned regeneration order refreshes it.** The command is
`yarn csp:inline-style-inventory`, and it is not `ownership`, `quality`, `capability`,
`component-meta`, `llms` or `docs-pages`. Regenerated: **`EXIT=0`**, the delta is
**exactly one line number**, and every disposition count is unchanged
(`recipe-movable 78 · layout-static 3 · custom-property 0 · required-dynamic 19 ·
unclassified-binding 33`), so no ceiling in that artifact moved either.

Carry this forward: **any edit that adds a line above an inline style in a component
owes this artifact**, the sanctioned order will not remind you, and the only thing
that catches it is the full unit suite — not `typecheck`, not `lint`, not
`validate:all`.

### 3.4 The other five failures of the first unit run, and why they are gone

The first full run had **5 failures in 4 files**. Four of them —
`apps/landing/src/claims.spec.ts` (story-tree counts),
`packages/tooling/scripts/generate-readme-facts.spec.ts` (×2, README catalog facts)
and `packages/tooling/src/quality/generate-matrix-targets.spec.ts` (derived story ids
vs the built Storybook index, which named `probe-residual05--after-fix` out loud) —
were caused by **this batch's own probe story file still being on disk**. That is a
genuinely useful accident: three independent gates noticed a single added story file
within one suite run, which is the story tree being properly fenced. The probe was
deleted; all four pass (**63 passed, `EXIT=0`**). The fifth was §3.3.

---

## 4. Ratchet movements (old → new)

Every figure re-read from the artifact that owns it, not quoted from a prior report.
**No ceiling raised, no allowlist widened, and no `*ceilings*.json` file opened for
writing.**

| Ratchet / counted quantity | Old | **New** | Source of truth |
|---|---|---|---|
| `maxUnclassified` | 29 | **29** | `packages/tooling/src/ownership/unclassified-ceiling.json` |
| `maxWithoutAnatomy` | 41 | **41** | same file |
| `maxProposedCitedFromCode` | 3 | **3** | `packages/tooling/scripts/adr-registry.json` |
| capability `pass` | 585 | **585** | `packages/core/docs/capability-matrix.json` `.totals` |
| capability `fail` | 0 | **0** | same |
| capability `present` | 608 | **605** | same — **the corrected number (§2.5)** |
| capability `stale` | 22 | **22** | same |
| capability `unrun` | **400** | **403** | same — **the corrected number; reported, not gated** |
| capability `excepted` | 47 | **47** | same |
| capability rows / cells | 144 / 1662 | **144 / 1662** | same |
| AT executed | 0 of 534 | **0 of 534** | `validate:at-runs` (link 57) and `generate:docs-pages` |
| locales ≥ 95 % | 1 | **1** (`minSupportedLocales: 1`, `minCompletenessPercent: 95`) | `i18n-completeness-ceilings.json` |
| inline-style dispositions | 78 / 3 / 0 / 19 / 33 | **78 / 3 / 0 / 19 / 33** | `inline-style-inventory.json` |
| `validate:all` links | 61 | **61** (measured) | `package.json` |
| `validate:all` failing link | 51 | **51** (same clause, same text) | §3.2 |
| unit suite | 573 files / 11,153 | **574 / 11,174** | +1 spec file, +21 cases |
| browser lane | 170 files / 1,462 tests | **170 / 1,462** | unchanged |
| Pending changesets | 44 | **45** (+1, `@dzup-ui/core: patch`) | `ls .changeset/` excluding `README.md` and `config.json` — **measured**, not carried from the 43 an earlier batch quoted, which predates RESIDUAL-04 adding one |
| Dirty paths | 304 | **311** | §6 |

**Two numbers moved and both are corrections, stated as such.** `present` −3 and
`unrun` +3 are the same three cells, and they moved because three components were
credited with accessibility evidence that does not exist. **`pass` did not move, no
ceiling was adjusted to absorb the change, and no fake citation was kept to preserve a
number.** The `+3` prints on every run of `validate:capability-matrix` until somebody
either gives those three components real axe renders (`D-RES05-2` option (c),
recommended) or re-baselines the recorded number (option (a), an owner act).

---

## 5. Owner decisions — two closed, two raised

Recorded in the register's **§12** addendum (appended; §11's rows keep their original
text and gain dated status rows).

### Closed

- **`D-RES04-1`** 🟠 → 🟢 — **the focus half is CLOSED.** §11.2's recommendation was
  *"(b) then (c)"*; both were executed, in that order. The reachability part is split
  out as `D-RES05-1` because it is not a focus bug and cannot be fixed inside the row.
- **`D-RES02-2`** 🟡 → 🟢 — **CLOSED, option (a)**, plus the audit its own row asked
  for. It was not the first accidental citation: there were eight.

### Raised

1. **`D-RES05-1` 🟠 — the retry control is not reachable by keyboard at all.**
   Measured over seven routes (§1.1, §1.3): `Tab` and `Shift+Tab` leave the panel and
   close it, and the arrow/`Home`/`End`/`PageDown` family never leaves the input. The
   control is focusable and is the only tabbable element in the panel, and no key
   delivers focus to it. `Try again` is the **only** recovery affordance for a failed
   option load, so this is **WCAG 2.1.1** on a functional control, on every host whose
   panel is portalled. It predates RESIDUAL-04 and RESIDUAL-05 and neither batch's fix
   changes it. Options: (a) make the retry an `aria-activedescendant` target of the
   arrow-key navigation the input already owns · (b) **stop unmounting it** — keep it
   rendered while `state === 'loading'` and `aria-disabled` (**not** `disabled`: Chrome
   blurs a disabled element, which reintroduces the focus loss) · (c) move retry onto
   the control's own keyboard map · (d) accept and document.
   **Recommend (b)** — smallest change that fixes reachability, and it makes *both*
   halves of C9.4 vestigial, which is a strong hint that the **unmount** was always the
   defect. ~1–2 h plus an a11y review, a visual re-baseline and an AT re-baseline;
   `canRetry` is a documented computed on a published composable, so it is not an
   agent's call.
2. **`D-RES05-2` 🟢 — re-baseline `unrunCells` 400 → 403, or close the gap instead.**
   Options: (a) re-baseline with the per-tier split and a note that the rise is a
   citation correction · (b) leave 400 so the `+3` keeps printing · (c) give
   `DzCarousel`, `DzDatePicker` and `DzTree` real axe renders in their families' a11y
   specs, which returns the number to 400 **honestly**.
   **Recommend (c) then (a).** All three are Tier B/C with a declared anatomy, so an
   axe render is cheap (~1 h) and it is the only option that improves the product
   rather than the bookkeeping. Until then (b) beats (a): a printed `+3` is a to-do
   list.

**Left explicitly to their owners, unchanged by this batch:** the one `yarn install`
that clears `validate:all` link 51 (`D-RES01-1`) · `D-RES04-2`, the host-driven
`searchable` double filter · the `browser-matrix` input's missing `gate` block and
whether the Storybook lane should be a capability-matrix input at all (RESIDUAL-03
items 3–4) · the 25 body-wiping jsdom specs (S5-O2) · `D91` · register #2 / `D127`,
the commit itself.

---

## 6. Residue — nothing left behind, proved by difference

| Check | Start | End |
|---|---|---|
| `git rev-parse HEAD` | `4e4e46f…410a` | **`4e4e46f…410a`** — unchanged |
| `git status --porcelain \| wc -l` | **304** | **311** (+7; six attributed below, the seventh not — see the note) |
| `sha256sum yarn.lock` | `6332fae9…87adb` | **`6332fae9…87adb` — identical**, and `git status --porcelain yarn.lock` prints nothing |
| `yarn install` run? | — | **no.** None owed: no manifest dependency or version changed |
| `find packages apps e2e -name '__screenshots__'` | nothing | **nothing.** Nine browser-lane runs, five with failing stories (three of those deliberately seeded), wrote **zero** PNGs — the addon sets `screenshotFailures: false` |
| `*.png` newer than session start under `packages`/`apps`/`e2e` | — | **none** |
| Probe story file | — | `packages/core/stories/forms/Residual05Probe.stories.ts` created and **deleted**; `ls packages/core/stories/forms/ \| grep -ci residual` → **0** |
| Probe directory | — | `.residual05/` created and **removed**; it held only logs, byte copies, JSON snapshots and the audit script, was never added to `.gitignore`, and appears in no listing at the end |
| Files temporarily modified and restored | — | **five**, each verified by `sha256sum -c` against a byte copy taken first: `optionsStateFocus.ts` (`07c4ee99…9e6b`) · `DzOptionsState.vue` (`17c24e86…ab31`) · `DzSelect.vue` (`9f2cc962…107c`, restored twice — once after seeded break 1, once after the `component-meta` attribution test) · `generate-capability-matrix.ts` (old predicate seeded and restored) · `packages/core/tests/a11y/buttons.a11y.spec.ts` (seeded comment, restored to **clean** — `git status` prints nothing for it). `capability-matrix.json` was also swapped back and forth three times and ends on `031f7b63…51de`, the state `validate:capability-matrix` requires |
| `git worktree list` | one entry | one entry |
| Commit / push / CI dispatch / publish / baseline capture / screenshot capture | — | **none** |
| Ceilings, allowlists, `*ceilings*.json` | — | **untouched** (§4). Five of them show as `??` in `git status` — `capability-matrix-`, `i18n-completeness-`, `perf-baselines-`, `runtime-floor-` and `visual-baselines-ceilings.json` — because earlier batches created them and they are not committed yet. **None was opened for writing here**; `capability-matrix-ceilings.json` was **read only**, to establish that `unrunCells` is report-only (§2.5) |

**This batch's six provable paths:**

```
 M packages/core/src/components/forms/DzSelect.vue                        (clean at start, verified)
 M packages/core/security/inline-style-inventory.json                     (clean at start, verified)
?? packages/core/src/components/forms/optionsStateFocus.ts
?? packages/tooling/src/quality/spec-component-refs.ts
?? packages/tooling/src/quality/spec-component-refs.spec.ts
?? .changeset/keyboard-retry-no-longer-drops-focus-on-the-body.md
```

Everything else this batch touched was **already dirty** at session start:
`DzOptionsState.vue`, `packages/core/stories/_shared/asyncOptionsHost.ts`,
`packages/tooling/src/quality/generate-capability-matrix.ts`,
`packages/core/docs/capability-matrix.json`,
`apps/storybook/stories/_data/capability.generated.ts` (its diff against `HEAD`
carries earlier batches' changes — perf and visual input notes, `excepted 13 → 41`),
`docs/program-2026-09-22-architecture/EXECUTION-STATUS.md`, and the register plus this
report inside the already-`??` `reports/` directory entry.

**The seventh path is unattributed, and that is a measurement gap in this batch, not a
mystery to wave at.** Only the *count* was snapshotted at session start, not the
listing, so a path that became dirty outside this batch's edits cannot be
distinguished from one inside them. The likely cause is a **concurrent session**:
`docs/program-2026-09-22-planning/README.md` and
`docs/program-2026-09-22-planning/planning-docs-disposition.md` are both ` M` and
belong to a programme this batch never opened, and the standing guidance for this
repository is that other sessions write under `docs/` at the same time. The cheap
lesson, recorded for the next batch: **snapshot `git status --porcelain` to a file at
session start, not `wc -l`.**

---

## 7. Ranked next packet

1. **`D-RES05-1` option (b) — stop the retry control unmounting itself.** ~1–2 h plus
   an a11y review and two baselines, and it is the only item here that fixes a
   **WCAG 2.1.1** failure on a documented affordance. It also retires the two fixes
   this batch and RESIDUAL-04 shipped, turning `@mousedown.prevent` and
   `withRetryFocusReturn` from load-bearing into belt-and-braces. Must land with a
   browser-lane assertion that reaches the control **by `Tab`** — otherwise it is
   unprovable, which is exactly how the keyboard half stayed open for a week.
2. **`D-RES05-2` option (c) — give `DzCarousel`, `DzDatePicker` and `DzTree` real axe
   renders.** ~1 h. All three are Tier B/C with a declared anatomy and their families'
   a11y specs already exist, so it is three `render` + `axe` blocks. It takes `unrun`
   back to 400 **honestly** and closes the only ratchet this batch moved.
3. **Register #2 / `D127` — commit the 311-path worktree.** Owner-only, unchanged as
   the single act that unblocks the most, and now also the only thing between this
   batch's evidence and its own citability.
4. **`D-RES01-1` — the one `yarn install`.** Still the cheapest act with the largest
   measured effect: link 51 is this batch's only red and it is the same red, for the
   same reason, with **zero** declarants left on the old range.
5. **Outcome-verify the 193 surviving citations.** This batch made a citation mean
   "the spec loads the component"; it still does not mean "the spec asserts something
   about it". The `gate` shape the matrix already uses elsewhere is the vehicle. ~3 h,
   and it is the natural successor to item 2 of this batch rather than a new idea.
6. **`D-RES04-2` option (b) — stop a host-driven `searchable` control re-filtering its
   host's rows.** ~1 h, a `minor` to `@dzup-ui/core`, unchanged from RESIDUAL-04's
   ranking — and now with one more reason to do it: §1.5 shows `DzSelect` is the
   control that carries the most duplicated seam logic, so it is the file to open once.
7. **Decide whether `DzSelect` should host the shared row.** ~2 h of deciding, more of
   doing. It publishes an `options-state` slot the shared component lacks, so the
   merge means giving `DzOptionsState` a slot and forwarding it — a real refactor of a
   published component's DOM. The argument for it is this batch: **two of the last
   three defects in the seam were "the copy did not get the fix"**.
8. **Add `csp:inline-style-inventory` to the documented regeneration order** (§3.3).
   ~10 minutes of editing a list, and it saves the next batch a red unit suite.
9. **The 25 body-wiping jsdom specs** (S5-O2's packet) — ~8 h, untouched, still the
   prerequisite for moving the 153 clean component specs into browser mode.
10. **`D91`** — the owner's coverage re-baseline. Still the keystone for Vitest 4 and
    therefore Vite 8. Nothing here changed it.

---

## 8. The two questions this packet existed to answer

**1. Can a keyboard user operate `Try again`?** **No** — and that is a larger finding
than the focus loss it was sent to fix. The focus loss is real, was measured on
`Enter` and on `Space`, on three controls, and is fixed and proved. Reachability is
not fixed, is now measured rather than hypothesised across seven keyboard routes, and
is raised as `D-RES05-1`. The honest summary is that **C9.4 is now completely
implemented and C9.4 was never sufficient.**

**2. How much of the capability matrix's evidence is real?** **96 % of it** — 193 of
201 citations in the three substring-derived kinds are structurally verifiable, and
the 8 that are not are now impossible to create. Three components lose an evidence
cell they never earned, so the matrix's `unrun` count **rises by 3** and the page says
so on every run. That number is worse-looking and more true, no ceiling was moved to
soften it, and the one change that would have kept it at 400 — keeping a citation the
audit had just proved false — is the thing this packet was written to make impossible.

**Status: COMPLETE**, to the limit of agent authority. What remains is owner work:
one commit, one `yarn install`, and two decisions.
