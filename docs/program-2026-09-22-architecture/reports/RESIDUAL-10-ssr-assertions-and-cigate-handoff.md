# RESIDUAL-10 — the SSR bare-truthiness sweep, and asserting the `ciGate` claims

**Tree:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` + uncommitted worktree (the
16-task programme + RESIDUAL-01…09, uncommitted **by design** — the owner commits).
**Run:** 2026-09-28. **Repository:** `ui/dzup-ui` (OSS, `@dzup-ui/*`) only.

> **Written incrementally.** Every section was appended as soon as its evidence
> existed, because four agents in this session stalled mid-task and only the
> already-written sections survived. A section that is present is measured.

## 0. The batch, and the entry state measured before anything was touched

| # | item | source | section |
|---|---|---|---|
| 1 | the bare-`toBeTruthy()` sweep in `packages/core/tests/ssr/ssr-smoke.spec.ts` | RESIDUAL-02 §6 item 7 | §1–§3 |
| 2 | assert each declared `ciGate` against `.github/workflows/` instead of trusting a grep | RESIDUAL-09 "Not finished, named" | §4 |

```
git rev-parse HEAD                                   ->  4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a
git status --porcelain | wc -l                        ->  333
node -e "…scripts['validate:all'].split('&&').length" ->  61   (link 61 = `yarn validate:browser-lane`)
```

The full `git status --porcelain` **listing** (not the count) was snapshotted to
the session scratchpad **outside** the repository, by a command that creates
nothing inside it, before any file was read for editing.

### 0.1 The brief's own numbers for item 1 are a grep artifact — corrected here

The brief states *"65 `toBeTruthy()` calls across 63 `it` blocks"*. Measured on
this tree, both halves are wrong, and the first one is wrong for a reason worth
naming because it is the same class of error this programme keeps finding:

```
grep -c 'toBeTruthy' packages/core/tests/ssr/ssr-smoke.spec.ts           ->  65
grep -cE '^\s*expect\(html\)\.toBeTruthy\(\)' …/ssr-smoke.spec.ts        ->  57
grep -c '^  it' …/ssr-smoke.spec.ts                                      ->  64   (1 of them `it.skip`)
```

**65 is the number of LINES containing the string**, and **eight of them are
prose** — the file header's RESIDUAL-02 table explains what `toBeTruthy()` fails
to assert and quotes it five times, plus three in-test comments that say what a
call used to assert. The number of `toBeTruthy()` **calls** is **57**, across
**64** `it` blocks (63 executed, 1 `it.skip`). A `grep -c` over a file that
documents its own history counts the documentation.

### 0.2 Section order, and what was appended when

Sections were written in this order, each as soon as its evidence existed: §1 after the
measurement pass, §2–§3 after the rewrite and the seeded breaks, §4 after item 2 and its
seeded flips, §5–§10 after the three lanes. The browser-lane figures and the final
`validate:all` line counts were substituted last, from files, because the first browser
run stalled (§5.5) and the chain was run twice (§5.3).

---

## 1. Item 1, pass A — what those blocks were actually hiding

### 1.1 The inventory, derived by parsing the file rather than grepping it

A `grep` cannot tell a sole assertion from one of several, so the file was parsed
into `it` blocks and each block classified by the `expect(` statements inside it
(script kept in the session scratchpad, not in the repository):

| class | blocks |
|---|---:|
| sole assertion is `expect(html).toBeTruthy()` | **36** (one of them `it.skip`) |
| sole assertion is `expect(typeof html).toBe('string')` | **2** |
| **total blocks asserting nothing about the output** | **38 of 64** |
| `toBeTruthy()` **paired** with a real assertion | 21 |
| no truthiness at all — RESIDUAL-02's five | 5 |

RESIDUAL-02 §6 item 7 predicted "36 … 24 more pair it". The 36 is exact. The
pairing count is **21**, not 24, and the residue is the two `typeof` blocks plus
RESIDUAL-02's own five — so the honest figure for *"blocks whose SSR output has
never been checked"* is **38**, not 36.

### 1.2 Every one of the 38 rendered, and its output measured

Each block's component was rendered through the file's own `ssrRender` helper with
the file's own props, and the string measured: total bytes, bytes left after every
HTML comment is stripped, the first tag, and the tag census.

**Eight components render NOTHING AT ALL — the seven-byte-comment case, eight more
times.**

| component | bytes | bytes after comments stripped | output |
|---|---:|---:|---|
| **`DzTour`** | **11** | **0** | a single false `v-if` marker — the root is a `Teleport` guarded on `open && activeStep`, and `open` defaults `false` |
| **`DzDialog`** | **16** | **0** | an empty fragment, open and close markers only |
| **`DzPopover`** | **16** | **0** | idem |
| **`DzSheet`** | **16** | **0** | idem |
| **`DzDropdownMenu`** | **16** | **0** | idem |
| **`DzContextMenu`** | **16** | **0** | idem |
| **`DzCommandPalette`** | **27** | **0** | an empty fragment wrapping a false `v-if` marker |
| **`DzTooltip`** | **32** | **0** | nested empty fragments |

`expect(html).toBeTruthy()` passed on six of the eight, and
`expect(typeof html).toBe('string')` passed on the other two — which is weaker
still, because it also passes on the empty string.

**Five more render a container with ZERO children — the empty-track shape
RESIDUAL-02 found on `DzSegmented`, five more times.**

| component | bytes | output |
|---|---:|---|
| `DzButtonGroup` | 300 | `div` with `role="group"`, slot fragment **empty** |
| `DzTimeline` | 141 | `div` with `role="list"`, **0** `listitem` |
| `DzList` | 124 | `ul` with `role="list"`, **0** `li` |
| `DzTabs` | 195 | `div` with the tabs root parts, **0** `role="tab"`, **0** `role="tabpanel"` |
| `DzStepper` | 169 | `div` with `role="group"`, **0** steps |

`DzTable` is a sixth of this shape but was not in the 38: it already asserted
`toContain('table')`, which its `role="table"` satisfies while the `<table>` is
empty.

The remaining 25 of the 38 do render real structure. The full per-component census
is §1.3; nothing asserted later in this report is absent from it.

### 1.3 Measured output of the 25 that do render — the set every new assertion draws on

| component | bytes | first tag | tags | attributes the render actually carries |
|---|---:|---|---|---|
| `DzChip` | 807 | `span` | span×2 | `role="status"`, `data-state=idle`, `data-tone=neutral`, root part |
| `DzSkeleton` | 144 | `div` | div×1 | `aria-hidden="true"`, `data-state=loading` |
| `DzEmpty` | 280 | `div` | div×1 | `role="status"`, `data-state=ready`; every inner branch `v-if`-absent with no props |
| `DzCheckbox` | 1,321 | `label` | label, button, span×2 | `role="checkbox"`, `aria-checked=false`, `aria-required=false`, `data-state=unchecked`, `type=button`, root/control/label parts |
| `DzSwitch` | 946 | `label` | label, button, span×3 | `role="switch"`, `aria-checked=false`, `data-state=unchecked`, root/control/indicator/label parts |
| `DzSelect` | 2,462 | `div` | div, button, span, svg, path, **select** | `role="combobox"`, `aria-expanded=false`, `aria-controls`, `data-placeholder="Pick fruit"`, `data-state=closed`, `dir=ltr`, plus a visually-hidden native `select` |
| `DzSlider` | 2,264 | `div` | div, span×4 | `role="slider"`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-orientation=horizontal`, `tabindex=0`, `data-tone=primary`, `dir=ltr` |
| `DzRadioGroup` + 2 × `DzRadio` | 2,430 | `div` | div, label×2, button×2, span×2 | `role="radiogroup"`, `aria-orientation=vertical`, `dir=ltr`, **2** × `role="radio"` with `aria-checked=false` and `data-state=unchecked`, both labels |
| `DzTextarea` | 716 | `div` | div, textarea | root/input parts, the placeholder |
| `DzNumberInput` | 3,279 | `div` | div×2, button×2, svg×2, input | `role="spinbutton"`, `type=text`, `inputmode=numeric`, `aria-label="Decrease value"` and `"Increase value"`, both `tabindex="-1"` |
| `DzPasswordInput` | 1,820 | `div` | div×2, input, button, svg | `type="password"`, `aria-label="Show password"`, `aria-pressed=false`, root/control/input/toggle parts |
| `DzSearchInput` | 1,583 | `div` | div×2, span, svg, input | `type="search"`, `aria-label="Search"`, root/control/icon/input parts |
| `DzFlex` | 75 | `div` | div×1 | no aria; `flex flex-row gap-[var(--dz-spacing-4)]` |
| `DzGrid` | 87 | `div` | div×1 | `grid grid-cols-1 gap-[var(--dz-spacing-4)]` |
| `DzStack` | 75 | `div` | div×1 | `flex flex-col gap-[var(--dz-spacing-4)]` |
| `DzSpacer` | 52 | `div` | div×1 | `aria-hidden="true"`, `flex-1 shrink` |
| `DzAspectRatio` | 91 | `div` | div×1 | inline `aspect-ratio:1` |
| `DzCode` | 295 | `code` | code, span | root part, slot text |
| `DzCaption` | 182 | `small` | small, span | root part, slot text |
| `DzCalendar` | **55,877** | `div` | div×54, button×45, span×8, svg×2 | `role="grid"`, **7** `columnheader`, **42** `gridcell`, 42 ISO day keys, `data-mode=single`, `data-view=month`, `aria-label="Previous month"` and `"Next month"`, `aria-live=polite` |
| `DzDataView` | 934 | `div` | div×3, p | `data-layout=list`, `data-size=md`, an `aria-live="polite"` sr-only region reading `No items`, **and a nested `role="status"`** repeating it |
| `DzDataGrid` | 1,698 | `div` | div, table, thead, tbody, tr×3, th, td×2 | `role="grid"`, `role="rowgroup"`×2, **1** `columnheader` (`Name`), **2** `gridcell` (`Ada`, `Grace`), `aria-label="Data grid"` |
| `DzMegaMenu` | 1,011 | `nav` | nav, ul, li, a | nav root; the `ul` carries **`role="menubar"`**; the `li` carries **no role**; the `a[href]` carries `role="menuitem"` |
| `DzSidebar` | 544 | *(fragment)* | nav, div | an **empty teleport anchor pair**, then `nav` with `role="navigation"`, `aria-label="Sidebar navigation"`, `data-state=expanded` |
| `DzAccordion` | — | — | — | **not measured: the block is `it.skip`.** Reka's `AccordionRoot` stalls `renderToString` under jsdom (upstream, documented in the file since before this programme). Left skipped; §3.4 records it as the one honest gap |

24 rendered + `DzAccordion` unmeasured = the 25. 8 + 5 + 25 = **38**, which is the
inventory in §1.1 accounted for with nothing dropped.

### 1.4 What the eight zero-byte renders mean, component by component — measured

Rendering the same eight **with a default slot** (a probe `<button>`) settles
whether "nothing" is a defect or the contract:

```
DzDialog        + slot  ->   74 B   fragment markers + <button data-probe="trigger">Open</button>
DzSheet         + slot  ->   74 B   same shape
DzPopover       + slot  ->   90 B
DzTooltip       + slot  ->  106 B
DzDropdownMenu  + slot  ->  106 B
DzContextMenu   + slot  ->  106 B
```

**All six are pure provider wrappers.** Each template is one Reka root
(`DialogRoot`, `PopoverRoot`, `TooltipProvider` + `TooltipRoot`,
`DropdownMenuRoot`, `ContextMenuRoot`) containing a single `<slot />`, and none of
those roots renders an element of its own. So with no slot the correct output
**is** nothing, and the assertable contract is *"the slot is the entire output and
the component adds no wrapper element"* — which a wrapper `div` (a real
SSR-visible regression and a guaranteed hydration mismatch) would break.

The last two are different, and this is the finding of pass A:

```
DzCommandPalette  { open: true, items: [...] }  ->  27 B   identical to the closed render
DzTour            { open: true, steps: [...] }  ->  40 B   an empty teleport anchor pair, nothing else
```

**Neither block was exercising the thing its own title claims.** Both titles read
*"without reaching for a teleport target"*, and both rendered with the overlay
**closed**, so the teleport branch was never reached at all: `DzTour`'s root is a
`Teleport` guarded on `open`, and `DzCommandPalette`'s portal sits inside
`DialogRoot` behind the same model. Opened, both still put nothing in the document
flow — which is the real, assertable claim, and it is **not** what the file was
testing. The capability matrix reads this very file for the `portal-hydration`
cell of both components.

---

## 2. Item 1, pass B — what was changed, and what each block now has to satisfy

### 2.1 The one file, and the API effect

| file | change | API effect |
|---|---|---|
| `packages/core/tests/ssr/ssr-smoke.spec.ts` | header extended with the RESIDUAL-10 measurement; **37 of the 38** blocks rewritten; 11 of them now render real children or a real slot; one new local helper (`withoutComments`) and one constant (`TRIGGER`) | **none.** Test-only file, not published, in no `files` array. **No changeset is owed.** |

`eslint --fix` was **not** used. The first lint pass was clean (`--max-warnings 0`,
exit 0) and nothing had to be fixed by hand.

**Block count is unchanged: 64 `it` blocks, 63 executed + 1 `it.skip`, before and
after.** No test was added or removed. That is deliberate — the task was to make
the existing 38 discriminate, not to grow the file, and it keeps the suite totals
comparable with RESIDUAL-09's handover.

### 2.2 Blocks asserting nothing: 38 → 1

```
sole expect(html).toBeTruthy()          36  ->  1   (the `it.skip`)
sole expect(typeof html).toBe('string')  2  ->  0
total                                   38  ->  1
```

The remaining one is `dzAccordion`, which is `it.skip`. §3.4 states why it is left
alone rather than given an assertion that never runs.

### 2.3 What the rewritten blocks now require, by family

Each line was chosen so that an empty render, a childless render or an error
render cannot satisfy it — and, where the component's whole job is a class, so
that a hard-coded value fails it too.

- **buttons** — `DzButtonGroup` now renders **two** `DzButton`s: `role="group"`,
  `data-state="idle"`, **exactly 2** `<button`, and the labels extracted as an
  **ordered** list `['Left','Right']`.
- **data** — `DzTable`: the element `<table `, not the substring `table` (which
  `role="table"` alone satisfied), plus both anatomy parts and a caption slot that
  must reach a real `<caption>`. `DzChip`: root tag `<span`, `data-tone="neutral"`
  and `data-state="idle"` (both resolved in `setup`), the label, and **no**
  `<button>` and **no** `tabindex` while `closable` is false. `DzTimeline`: two
  `DzTimelineItem`s, **exactly 2** `role="listitem"`, statuses and labels both
  **ordered**. `DzList`: `<ul` root, **2** `<li`, **exactly one**
  `aria-selected="true"` and one `data-state="active"` — the selection resolved on
  the server, not after hydration.
- **feedback** — `DzProgress` (circular): `<svg`, **exactly 2** `<circle` (track
  and indicator), `role="progressbar"` and `aria-valuenow="40"` with both bounds.
  Previously `toContain('svg')`, which the `xmlns` URL satisfies. `DzSkeleton`:
  one `<div`, `aria-hidden="true"`, `data-state="loading"`, `animate-pulse`, and
  **no text content at all**. `DzEmpty`: rendered with `title` and `description`,
  **exactly 2** `<p>` whose texts are asserted **in order**, and no `<svg>` since
  no icon was passed.
- **forms** — `DzCheckbox` / `DzSwitch`: the `<label>` root (so the text names the
  control with no `id` round-trip), `role`, `aria-checked="false"`,
  `data-state="unchecked"`, the parts, the label text. `DzSelect`: `role="combobox"`,
  `aria-expanded="false"`, `data-state="closed"`, **the placeholder text present in
  the server HTML** (the component computes the label from `items` precisely
  because Reka's registry is empty on the server — its own source comment says so,
  and this is the assertion that holds it), **exactly one** `<button`, **no**
  `role="listbox"`, and `dir="ltr"`. `DzRadio`: `role="radiogroup"`, **2**
  `role="radio"`, **2** `aria-checked="false"` and **0** `"true"` — a pre-checked
  radio submits a value nobody chose. `DzSlider`: `role="slider"`, both bounds,
  `tabindex="0"` (reachable before hydration), the indicator part.
- **inputs** — `DzTextarea`: `<textarea `, the element. `DzNumberInput`:
  `role="spinbutton"`, `type="text"` **with** `inputmode="numeric"` (the component's
  deliberate choice), **2** `<button`, both stepper names. `DzPasswordInput`:
  `type="password"` **and `not.toContain('type="text"')`** — a password that reaches
  the browser unmasked has already shown the value, and correcting it on hydration
  is too late. `DzSearchInput`: `type="search"`, **exactly 1** `<input`.
- **layout** — the five primitives render one element and no content, so the
  **resolved class is the component**. Each asserts the exact class string
  including its token: `flex flex-row gap-[var(--dz-spacing-4)]`,
  `grid grid-cols-1 gap-…`, `flex flex-col gap-…`, `flex-1 shrink` plus
  `aria-hidden="true"`, and `style="aspect-ratio:1;"`. A hard-coded gap fails
  these too (ADR-04).
- **navigation** — `DzTabs` now renders the compound set: `role="tablist"`, **2**
  `role="tab"`, **2** `role="tabpanel"`, ordered trigger labels, exactly one
  selected tab and one active panel, the inactive panel carrying `hidden` **in the
  server HTML**, the active panel's body present and the inactive one's **absent**,
  and each panel labelled by its own trigger id. `DzStepper` renders two
  `DzStepperItem`s: `role="group"`, the label, **2** indicators, ordered titles.
- **overlays** — all six wrappers: `withoutComments(html)` **exactly equals** the
  probe child. That is the strongest form available for a component whose contract
  is *"add nothing"*, and it fails on any wrapper element (§3.2 seed C proves it).
- **typography** — `DzCode`: `<code ` and the mono **token**. `DzCaption`:
  `<small ` and `text-[var(--dz-muted-foreground)]` — the muted *foreground*, which
  is CLAUDE.md rule 1b and the one substitution `validate:tokens` exists to reject.
- **tier C** — `DzCalendar`: `role="grid"`, **exactly 7** `columnheader`, a
  gridcell count asserted as `% 7 === 0` and `>= 28` rather than pinned to 42
  (a month renders 5 or 6 weeks depending on today's date, and a pinned 42 is a
  test that fails on a calendar), one resolvable ISO date per cell, and both month
  controls named through the catalog with no provider mounted. `DzDataView`: the
  layout and size data attributes, the empty text, a polite live region.
  `DzDataGrid`: `role="grid"`, **2** `rowgroup`, **1** `columnheader`, **2**
  `gridcell` with the cell texts **ordered**. `DzMegaMenu`: `<nav` root,
  `role="menubar"`, **exactly 1** `role="menuitem"` on a **real `<a href>`** (a
  top level that only works after hydration is invisible to a crawler), and **no**
  panel content. `DzSidebar`: the **teleport anchor pair**, then the nav with its
  role, label, state and body part. `DzCommandPalette` and `DzTour`: rendered
  **open**, asserting the teleport was reached and that nothing — no overlay, no
  panel, no row text — reaches the document flow.

### 2.4 Three blocks deliberately assert LESS than they could, and say so at the assertion

A test that pins a defect makes the defect the contract; a test that pins the
corrected value is red on a green tree. So where pass A surfaced a defect, the
block asserts the structure that **is** correct and carries a comment naming what
it does not pin and why — the same treatment RESIDUAL-02 gave `DzPagination`'s
nested landmarks.

| block | not asserted | finding |
|---|---|---|
| `dzStepper` | each step's `data-state`, and the presence of `aria-current` | §3.1 finding 1 |
| `dzMegaMenu` | the role on the `<li>` between the menubar and the menu item | §3.1 finding 2 |
| `dzDataView` | **how many** nodes announce `No items` | §3.1 finding 4 |

### 2.5 One measurement made while writing an assertion, worth recording

A bare count of `tabindex="-1"` in `DzNumberInput`'s server HTML reads **3**, not
2 — and the third is **prose**. The component's own explanatory comment quotes the
attribute, and **Vue's server renderer ships template comments verbatim**, so any
assertion that counts an attribute string in this repository is also counting the
source comments that discuss it. The assertion was rewritten to match the
attribute **pair** (`aria-label="Decrease value" tabindex="-1"`). This is the same
family of error as §0.1's `grep -c`: a file that documents itself defeats counting
by substring.

---

## 3. Item 1, pass C — the defects, and the proof the new assertions discriminate

### 3.1 Numbered findings

**Finding 1 🔴 — `DzStepperItem` renders EVERY step as `completed` on the server,
and no step as current.**
`DzStepperItem.vue:28` assigns its own index in `onMounted`:

```
const stepIndex = ref(-1)
onMounted(() => { if (ctx) { stepIndex.value = ctx.registerStep() } })
const status = computed(() => {
  if (stepIndex.value < ctx.activeStep.value) return 'completed'
  …
```

`onMounted` **never runs during SSR**, so `stepIndex` stays `-1`, and `-1 < 0` is
true for every step of a stepper on its first step. Measured on a two-step
stepper with `modelValue: 0`: **both** items render `data-state="completed"` and
**both** render the completed check-mark `<svg>`; **no** element carries
`aria-current="step"`. So the server HTML of any wizard says every step is done
and none is current — and because hydration then corrects both the attribute and
the indicator subtree, it is also a hydration mismatch on every stepper that
server-renders. **Not fixed here**: the fix is to obtain the index during `setup`
rather than `onMounted`, which changes the registration order semantics of a
shared counter on a published component and risks double registration; it wants
its own packet with `DzStepper.spec.ts` and `DzStepper.gating.spec.ts` in scope.
Raised as `D-RES10-1`.

**Finding 2 🟡 — `DzMegaMenu`'s menubar owns a `listitem`.**
The expanded top level renders `nav > ul[role="menubar"] > li (no role) >
a[role="menuitem"]`. Two axe structure rules are engaged, and the role table in
the vendored `axe-core` is the source for both: `menubar.requiredOwned` is
`group | menuitemradio | menuitem | menuitemcheckbox | menu | separator`, and the
`li`'s implicit `listitem` is none of them (`aria-required-children`); and
`listitem.requiredContext` is `list`, which the `ul` stopped being the moment it
was given `role="menubar"` (`aria-required-parent`). **Not fixed here**: the fix
is one attribute (`role="none"` on the `<li>`) but it is a published a11y-tree
change on a Tier C component, so it owes a changeset and an AT consideration.
Raised as `D-RES10-2`.

> **A correction to this finding's own first draft, kept because the wrong version
> is instructive.** It first read *"the browser lane's axe pass is green, so the
> expanded menubar is not what that lane renders"*. That was an inference, and it
> was wrong. Measured instead: both rules carry the `wcag2a` tag, which
> `apps/storybook/.storybook/preview.ts` pins in `a11y.options.runOnly`, so they
> **do** run over this component in the browser lane. What the lane does with the
> result is the other half — `preview.ts` sets `a11y.test: 'todo'` **globally**,
> which is report-only, and a family opts into enforcement by spreading `a11yError`
> into its story metas. **41 story files do. `DzMegaMenu.stories.ts` is not one of
> them, and no file under `stories/navigation/` is.** So the lane's green result says
> nothing whatever about `DzMegaMenu`'s axe result: a violation there is surfaced in
> the report and **cannot fail CI**, by design and by rollout stage. That is a
> *stronger* reason to fix the markup than the sentence first written, and it is
> precisely the "an input that is read but cannot fail CI" distinction item 2 of this
> batch exists to keep honest — found, this time, in the report's own prose.

**Finding 3 🟢 — `DzChip` declares `role="status"` on every chip.**
`DzChip.vue:109` sets `role="status"` unconditionally. `status` is an ARIA live
region, so every chip that is added, relabelled or removed is announced; and
`status` is not a `nameFromContent` role, so the chip's own label stops being its
accessible name. With `closable` it also gets `tabindex="0"`, making it a focusable
live region with no widget role. Measured, not inferred — the role is in the
server HTML of a chip rendered with nothing but a label. **Not fixed**: what a
chip should be (`generic`? `listitem` inside a `DzChipGroup`? nothing?) is a design
decision, not an agent's. Raised as `D-RES10-3`.

**Finding 4 🟢 — `DzDataView` announces its empty state twice.**
The root renders an `sr-only` `aria-live="polite" aria-atomic="true"` region whose
content is `No items`, and the empty branch below it renders a `DzEmpty` whose root
carries `role="status"` — itself a live region — with the same `No items` inside.
Two live regions, one string, one render. **Not fixed**: it is one of the two roles
that should go, and which one depends on `DzEmpty`'s own `role="status"` (see
finding 3's neighbourhood). Raised as `D-RES10-4`.

**Finding 5 🟢 — `DzSelect` puts an internal sentinel in the server HTML.**
`DzSelect.vue:113` defines `EMPTY_VALUE_SENTINEL = '__DZ_SELECT_EMPTY__'` to map
an empty external value onto something Reka accepts, and the hidden native
`<select>` in the server output carries it verbatim: `value="__DZ_SELECT_EMPTY__"`.
It is inert in a browser (`value` is not a content attribute of `<select>`, and the
element has no options), so this is a hygiene finding rather than a bug — but an
internal marker is shipping in the rendered HTML of every unset select. **Not
fixed**, raised as `D-RES10-5`.

**Finding 6 — the two `portal-hydration` citations were vacuous.** This is
§1.4's measurement restated as a finding because it is an *evidence* defect rather
than a component defect: the capability matrix reads `ssr-smoke.spec.ts` for the
`portal-hydration` cell of `DzCommandPalette` and `DzTour`, both blocks were titled
*"without reaching for a teleport target"*, and both rendered the overlay
**closed** — so neither reached a teleport, and the cell's evidence was a render
that could not have failed. Fixed here, not raised: both now render `open: true`,
assert the teleport anchor pair and assert that nothing reaches the document flow.

### 3.2 Four seeded breaks, on component SOURCE, one family each

Every seed is on a `.vue` file, never on the test. All four files were **clean at
`HEAD`** before seeding (`git status --porcelain` on them printed nothing), so the
restore is provable from `git status` as well as from the hashes. `git checkout`
was **not** used — the files were copied back from byte-exact backups.

```
sha256 before seeding
  4653bb8a301d2053cecd7590c3ac0e5f076cb51b067df630934b9748e17305bc  data/DzTimelineItem.vue
  29f5507f967f8d200d543506480bed0d2c6f046aa4f605e4bfa8370e0b7346a8  layout/DzStack.vue
  e7a624a4c9f142a22b5764ec8adab93900caddc12a3f66edd54c586d88a31491  overlays/DzDialog.vue
  15625fe14201d19845cb7cf1f3e499a254debfd8d47c500bc1d2bf6d65bebce7  navigation/DzSidebar.vue
```

| # | family | seed | run | failing tests — **exactly** |
|---|---|---|---|---|
| **A** | data | `DzTimelineItem.vue:67` `role="listitem"` → `role="none"` | **exit 1**, `1 failed / 62 passed / 1 skipped` | `sSR: data > dzTimeline renders one listitem per item in SSR` — `expected +0 to be 2` |
| **B** | layout | `DzStack.vue:54` the direction fallback `'column'` → `'row'` | **exit 1**, `1 failed / 62 passed / 1 skipped` | `sSR: layout > dzStack renders a column flex box with the token gap in SSR` — received `class="flex flex-row gap-[var(--dz-spacing-4)]"` |
| **C** | overlays | `DzDialog.vue` template: `<slot />` wrapped in `<div class="contents">` | **exit 1**, `1 failed / 62 passed / 1 skipped` | `sSR: overlays > dzDialog passes its slot through and adds no element in SSR` — received `<div class="contents"><button data-probe="trigger">Open</button></div>` |
| **D** | navigation (tier C) | `DzSidebar.vue:229` `role="navigation"` → `role="region"` | **exit 1**, `1 failed / 62 passed / 1 skipped` | `sSR: tier C > dzSidebar degrades its teleport rather than reaching for a target in SSR` — `expected … to contain 'role="navigation"'` |

**One failure per seed, and in every case the one block that owns the broken
component.** That is the precision claim: a seed that reddened the file would
prove nothing about which assertion caught it. Note also what did *not* fail —
seed B changed a class shared with `DzFlex`'s variant table and `dzFlex`,
`dzGrid` and `dzSpacer` stayed green, because each asserts its own resolved class.

**Restore, proved byte-identical, all four at once:**

```
sha256sum -c before.sha256
  data/DzTimelineItem.vue: OK
  layout/DzStack.vue: OK
  overlays/DzDialog.vue: OK
  navigation/DzSidebar.vue: OK                      exit 0
git status --porcelain <all four>   ->  no output (clean, as before the seeds)
vitest run …/ssr-smoke.spec.ts      ->  exit 0   63 passed | 1 skipped
```

### 3.3 The old assertion measured against the same broken trees

Under each of the four seeds, `expect(html).toBeTruthy()` on the same render
**passes**, because the render is still a non-empty string in all four cases: 141 B
of childless timeline, a `flex-row` stack, a wrapped dialog slot, a sidebar whose
landmark became a generic region. That is not argued here — it is the definition of
the assertion, and the eight zero-byte renders in §1.2 are the stronger version of
the same demonstration: six of them passed `toBeTruthy()` while emitting **0 bytes
of anything but comments**.

### 3.4 The one component left honestly unasserted, with the reason

**`dzAccordion` — `it.skip`, still asserting only truthiness, left as it is.**
Reka's `AccordionRoot` stalls `renderToString` under jsdom (an upstream issue the
file has documented since before this programme), so the block is skipped, the
assertion never executes, and **there is no output to have measured**. Writing a
structural assertion inside a skipped block would put coverage in the file that
does not exist anywhere — the exact substitution this programme exists to remove.
It is named in the file header as the one exception and left alone.

Nothing else was left unasserted. In particular the eight zero-byte renders were
**not** waved off as unassertable: six have a real contract (*"the slot is the
whole output"*) that is now asserted by exact equality, and the other two have a
real degradation (*"the teleport is reached and nothing reaches the document"*)
that is now asserted with the branch actually taken.

---

## 4. Item 2 — the `ciGate` claims are now asserted, not grepped

RESIDUAL-09's own closing section named this: *"Every `ciGate` in this batch was
measured by a human grep over `.github/workflows/` … it is the only thing in this
batch whose correctness depends on a human having grepped correctly."* It also named
the mechanism to extend — `validators/browser-lane.ts`'s textual `[ci-gate]` read —
rather than a new gate. That is what was done.

### 4.1 The six values, re-verified from the workflows before a line was written

Not taken from RESIDUAL-09. Re-measured on this tree, by hand first so the
validator could be checked against something:

| input | declared | grep over all 8 workflow files | verdict |
|---|---|---|---|
| **`story-dod`** | **`true`** | `ci.yml:163` `run: yarn validate:story-dod`, in job **`validate`** (`ubuntu-latest`). Lines 124–253 of that job carry **no** `continue-on-error`; the only one in the file is **line 515**, on the *visual e2e step* | **true confirmed** |
| `at-matrix` | `false` | `at-matrix` **0** · `at-runs` **0** · `at-scripts` **0** · `at:ingest` **0** · `test:at` **0** matches | **false confirmed** |
| `perf-baselines` | `false` | `test:perf` **0** · `DZUP_PERF_GATE` **0** matches | **false confirmed** |
| `browser-matrix` | `false` | `e2e:matrix` **0** · `browser-evidence` **0** · `engine-ratchets` **0** · `e2e/matrix` **0** matches | **false confirmed** |
| `visual-baselines` | `false` | `test:e2e:visual` **1** match — `ci.yml:516`, in job `e2e`, and the step at 512–516 carries `continue-on-error: true` on **line 515**. `visual:accept` **0** | **false confirmed, and for a different reason than the others**: a job *does* run this lane; it cannot fail |
| `browser-engine-ratchets` | `false` | same sweep as `browser-matrix`, same **0** | **false confirmed** |

All six agree with RESIDUAL-09. The point of this item is not that they were wrong;
it is that **nothing would have said so if they became wrong.**

### 4.2 What the validator now requires

Clause 7 of `checkBrowserLane`, implemented as `checkCiGateClaims`. It reads the
`ciGate` values **as published** — `packages/core/docs/capability-matrix.json`,
`inputs[*].gate.ciGate`, which is what a reader of the docs site sees — and every
file under `.github/workflows/`, and for each input asks one question: **is there a
job that runs this input's lane and can fail?**

- **"runs the lane"** is a substring match over the step's `run:` text **after
  expansion through the root `package.json` scripts**, transitively (depth 6, cycle
  guarded). Without that expansion `yarn validate:all` is four words; with it, it is
  the 61 links it chains — which is why `validate-min-runtime.yml` shows up as a
  second enforcing job for `story-dod` and not as a blank. `yarn workspace <pkg>
  <script>` is deliberately **not** followed: that name belongs to another manifest
  and resolving it in the root's would answer about a different script.
- **"can fail"** is `continue-on-error: true` on **neither** the step **nor** its
  job. The two are matched by separate anchored patterns at their own indentation
  (4 spaces for a job, 8 for a step), never by `includes` over a job block — the
  live `ci.yml` carries it on a *step* while `chromatic.yml` and `vue-next.yml` carry
  it on *jobs*, and conflating them is exactly how a demoted lane reads as a gate.
- **`ciGate: true`** requires **≥ 1** such job. Zero is `✗ [ci-gate-claim]`, and the
  message names the input, the commands searched, the job count and file list
  searched, and — when a job runs the lane but is advisory — *which* job and step,
  so the diagnostic distinguishes "nobody runs it" from "it runs and cannot fail".
- **`ciGate: false`** requires **0** such jobs. One or more is `✗ [ci-gate-drift]`,
  naming the file, the job, the step and the matched command. This is the half
  RESIDUAL-09 could not have caught by grepping once: a lane that quietly *gains*
  enforcement leaves a `false` understating what blocks a merge, with a `blockedOn`
  sentence still naming acts that have already happened.

**And it fails closed on three further things**, because a check that can be
silently skipped is the thing being replaced:

| situation | rule | why it is not a "skip" |
|---|---|---|
| the capability matrix cannot be read or has no `inputs` map | `ci-gate-declaration` | an unreadable artifact is how a clause stops running with nobody noticing |
| **0** files read from `.github/workflows/` | `ci-gate-declaration` | every `false` would pass vacuously and the clause would read green |
| an input declares `ciGate` with no lane declared in `CI_GATE_LANES` | `ci-gate-declaration` | a **seventh input** would otherwise arrive unverified and look covered |
| a `CI_GATE_LANES` entry names an input the matrix no longer declares | `ci-gate-declaration` | a lane entry matching no input verifies nothing while reading as coverage |

### 4.3 What a "lane" is, per input, is declared with its reason — and that is the load-bearing part

`CI_GATE_LANES` is a table of `{ input, laneCommands, why }`. The `why` is not
decoration: the answer differs **in kind** between inputs, and getting it wrong is
how a check like this becomes a rubber stamp.

The hard case is `at-matrix`. `validate:at-matrix` and `validate:at-runs` **do** run
in CI, on `ubuntu-latest`, without `continue-on-error` — they are links 23 and 57 of
`validate:all`. Counting them would make an input with **0 of 534 cells executed**
read as gated. They check the **shape** of a record and exit 0 over an empty
directory, by design. So `at-matrix`'s lane commands are `at:ingest` and `test:at` —
the transcription of a record a *named person* wrote — and the reason is written
beside them. The opposite case is `story-dod`, whose evidence *is* static analysis
over committed story text, so the validator **is** the lane and there is nothing
else to run.

`visual-baselines` is the third kind and the most useful to have declared: a job
runs its lane today and the declaration is `false` **because that step is
`continue-on-error`**. That is the distinction this clause measures rather than
assumes, and §4.5 seed 3 turns it red by deleting one line of YAML.

### 4.4 The verdict table the validator now prints every run

```
  ciGate claims — 8 workflow file(s), 20 job(s) read from .github/workflows/
    story-dod                declared true  enforcing 2   ci.yml:validate, validate-min-runtime.yml:validate-min-runtime
    at-matrix                declared false enforcing 0   no job runs the lane
    perf-baselines           declared false enforcing 0   no job runs the lane
    browser-matrix           declared false enforcing 0   no job runs the lane
    visual-baselines         declared false enforcing 0   1 advisory job(s): ci.yml:e2e
    browser-engine-ratchets  declared false enforcing 0   no job runs the lane

✓ browser-lane: … and every declared `ciGate` matches what the workflows do.
```

Printed whether or not anything fails, because the value of the clause is that the
six answers are **measured on every run** and a reader of the log should see which
way each went. Note that it independently re-derives §4.1's hand measurement,
including the `e2e` job being *advisory* rather than absent — the one distinction a
grep for a script name cannot make.

### 4.5 Three seeded changes, each proved to turn the gate red

All three restored by **byte copy** (never `git checkout`). `ci.yml` was **clean at
`HEAD`**, so its restore is provable from `git status` as well as from its hash;
`capability-matrix.json` was already ` M` at entry and its hash is the authority.

```
sha256 before seeding
  bac2e11f48a4c43c505884dfc3766070a819365335376c22344abff2c60f5c50  packages/core/docs/capability-matrix.json
  ff42773098ade68167e159d16bcde53d4d078beb573eb71b6a6fbf68a0e0a044  .github/workflows/ci.yml
```

**Seed 1 — flip the declaration `story-dod` `true` → `false`.** The direction
RESIDUAL-09 could not have caught: a real gate under-declared.

```
node …/tsx …/validators/browser-lane.ts   ->  exit 1
  story-dod  declared false  enforcing 2   ci.yml:validate, validate-min-runtime.yml:validate-min-runtime
✗ [ci-gate-drift] capability-matrix input `story-dod` declares `ciGate: false`, but
  .github/workflows/ci.yml job `validate` step `Story definition of done` runs
  `validate:story-dod` and carries no `continue-on-error` on either the step or the job.
1 browser-lane violation(s).
```

**Seed 2 — flip the declaration `visual-baselines` `false` → `true`.** The direction
the brief names first: a claimed gate nothing enforces.

```
  ->  exit 1
  visual-baselines  declared true  enforcing 0   1 advisory job(s): ci.yml:e2e
✗ [ci-gate-claim] capability-matrix input `visual-baselines` declares `ciGate: true`, but no
  job in .github/workflows/ runs its lane and can fail. Searched 20 job(s) across 8 file(s)
  (chromatic.yml, ci.yml, landing-e2e-snapshots.yml, min-peer.yml, publish-prerelease.yml,
  release.yml, validate-min-runtime.yml, vue-next.yml) for `test:e2e:visual` or
  `visual:accept`; the 1 job(s) that do are advisory: .github/workflows/ci.yml job `e2e`
  step `Run visual snapshot tests (Chromium, report-only)`. Either the declaration is wrong
  or the gate was lost.
1 browser-lane violation(s).
```

**Seed 3 — change nothing in the declaration; delete `continue-on-error: true` from
`ci.yml:515`.** This is the seed that matters most, because it is the scenario in
which *no human edits a declaration at all*: a lane silently becomes a gate.

```
  ->  exit 1
  visual-baselines  declared false  enforcing 1   ci.yml:e2e
✗ [ci-gate-drift] capability-matrix input `visual-baselines` declares `ciGate: false`, but
  .github/workflows/ci.yml job `e2e` step `Run visual snapshot tests (Chromium, report-only)`
  runs `test:e2e:visual` and carries no `continue-on-error` on either the step or the job.
  The lane became a gate and the declaration did not follow, so the matrix understates what
  can fail a merge — and every `blockedOn` sentence beside it is now stale.
1 browser-lane violation(s).
```

**Restore, all three, proved byte-identical:**

```
sha256sum -c before.sha256
  packages/core/docs/capability-matrix.json: OK
  .github/workflows/ci.yml: OK                                    exit 0
git status --porcelain .github/workflows/ci.yml   ->  no output (clean, as before)
node …/tsx …/validators/browser-lane.ts           ->  exit 0   ✓, all six match
```

### 4.6 Implemented files, and the API effect

| file | change | API effect |
|---|---|---|
| `packages/tooling/src/validators/browser-lane.ts` | module header gains a *"The `ciGate` claims"* section; **new exports** `CAPABILITY_MATRIX_PATH`, `WORKFLOW_DIR`, `SCRIPT_EXPANSION_DEPTH`, `CI_GATE_LANES`, `parseWorkflowJobs`, `expandYarnScripts`, `findEnforcingJob`, `findLaneJobs`, `checkCiGateClaims`, and the types `CiGateLane`, `WorkflowStep`, `WorkflowJob`, `DeclaredCiGate`; `BrowserLaneInputs` gains **three required** fields (`workflowFiles`, `rootScripts`, `declaredGates`); `readBrowserLaneInputs` reads the workflow directory and the matrix; clause 7 added to `checkBrowserLane`; the CLI prints the verdict table | **internal tooling, not a published package. No changeset is owed.** The three new fields are **required**, so every constructor of a `BrowserLaneInputs` is a compile error until updated — there is exactly one (`readBrowserLaneInputs`) plus the spec fixture, both updated. Optional fields were rejected deliberately: a caller that omitted them would silently stop verifying anything, which is fail-open |
| `packages/tooling/src/validators/browser-lane.spec.ts` | fixture gains the three fields and a `GATED_WORKFLOW` that carries every shape the clauses read; **+19 tests** (**18 → 37**) — four for the job/step parser, three for the script expansion, eleven for the claim check, and one added to the live-repository block. The old file reads 16 `it` calls but one is an `it.each` over the four required dev dependencies, so the honest before-count is **18** | — |

**Lint and type errors were fixed by hand, and `--fix` was not used.** The first
`typecheck:tooling` after the clause was written reported **41 `error TS`**, every one of
them `noUncheckedIndexedAccess` on a regex capture group or an array index — the tooling
package compiles with that flag on, and a `RegExp` capture is `string | undefined` under
it. All 41 were fixed by hand (`?? ''` on captures, `?.` on indexed reads in the spec).
The first `eslint --max-warnings 0` over the three edited files reported **9 errors**:
1 `style/quote-props`, 2 regexp (`prefer-w`, `use-ignore-case`), 4
`regexp/no-super-linear-backtracking` on `\s*` before `.*`, and 2
`style/max-statements-per-line`. The backtracking four were fixed by removing the
ambiguity rather than silencing it — `/^run:(.*)$/` plus `.trim()` instead of
`/^run:\s*(.*)$/` — and the four `continue-on-error` patterns were hoisted into named
constants in the same pass, which is why the parser now reads them by name.

**`validate:all` stays at 61 links.** No new link was needed:
`yarn validate:browser-lane` is **already link 61**, the last one, added there by
RESIDUAL-03 precisely so existing link numbers hold. Measured, not assumed:
`scripts['validate:all'].split('&&').length` → **61** before and after. So the new
clause runs inside the chain with no renumbering anywhere.

### 4.7 Two tests with teeth, beyond the fixtures

The fixtures prove the rules *can* fail — 17 of the 19 new cases are fixtures. The other **two** read the **live** repository, so
the declaration cannot quietly drift out of the validator's reach:

1. *"declares a lane for every input the live matrix gates"* — reads the real
   artifact and asserts the set of inputs declaring `ciGate` **equals** the set
   `CI_GATE_LANES` covers. A seventh input is a red test, not silence.
2. *"story-dod is the ONLY input whose lane a CI job enforces today"* — re-derives
   the answer from the workflows on every run and pins it to `['story-dod']`. That
   sentence has been quoted in three reports of this programme; it is now a
   measurement rather than a citation.

---

## 5. Aggregate qualification — pre-existing versus new

### 5.1 Order of operations, stated so the evidence can be trusted

Every number below is from a run made **after** every source and document edit in
this batch was on disk, except where a section says otherwise. The three lanes were
run in this order and each exit code was written to a **file** with an absolute
path, then the log read — never a completion notice, and never through a pipe.

### 5.2 The edit made an artifact stale, exactly as RESIDUAL-02 predicted it would

`ssr-smoke.spec.ts` is a **declared input of the capability matrix**, so editing it
makes the artifact stale regardless of whether any cell moves. `yarn regenerate:all`
was run rather than the six-step column being copied:

```
yarn regenerate:all   ->  exit 0   7 of 7 steps
```

Afterwards, only what should have changed did:

```
packages/core/docs/capability-matrix.json                    CHANGED  (§6, two cells)
packages/core/docs/component-meta.json                       CHANGED  (its capability join)
packages/core/docs/quality-matrix.json                        IDENTICAL
packages/core/manifests/component-ownership.manifest.json     IDENTICAL
packages/core/security/inline-style-inventory.json            IDENTICAL
```

The inventory being identical is worth naming: no `.vue` carrying an inline `style=`
was edited in this batch, and the four that were **temporarily** edited for the
seeded breaks were restored byte-identically before any suite ran (§3.2).

### 5.3 The three lanes, end to end

```
node -e "…scripts['validate:all'].split('&&').length"   ->  61       (unchanged)
yarn validate:all > <abs>.log 2>&1 ; echo "exit $?" > <abs>.exit
  ->  exit 0    1,311 lines · 52 lines carrying ✓ · ZERO lines carrying ✗
                (run TWICE end to end: once before this report was written, 1,312 lines,
                 and once after every document in this batch was on disk, 1,311.)

yarn test > <abs>.log 2>&1 ; echo "exit $?" > <abs>.exit
  ->  exit 0    Test Files 575 passed (575)
                Tests 11,215 passed | 3 skipped | 1 todo (11,219)
                Duration 344.09 s        — green on the FIRST run, no reporter flake

browser lane, app-local runner invoked from apps/storybook:
  node node_modules/vitest/vitest.mjs run --project=storybook
  ->  exit 0    170 files passed (170) · 1,462 tests · 1,462 passed · 0 failed · 192.06 s
```

**11,196 → 11,215 is exactly +19, and it is accounted for**: `browser-lane.spec.ts`
went from **18** to **37** tests (the old count reads 16 `it` calls, but one is an
`it.each` over the four required dev dependencies). `ssr-smoke.spec.ts` is unchanged
at **63 passed + 1 skipped**, because the sweep rewrote blocks rather than adding
them. File count unchanged at **575**: no spec file was added, and the throwaway
measurement probe was **deleted before any suite run** (§8).

### 5.4 Advisories in the run — every one pre-existing

- **`! [dirty-input]` × 4** (`validate:evidence-binding`) — the four generated
  artifacts have declared inputs modified in the worktree. The gate's own words:
  *"the COMMITTED binding is what this gate proves; this line is not a failure."*
  Register row #2 (commit the worktree), unchanged.
- **`! [deprecated-ident]`** — `lucide-vue-next` deprecated upstream. Register row #3
  option (a), still open.
- **`! visual per-component coverage gates on win32 while CI runs linux`** — an
  honest declaration, reported not failed, and the reason `visual-baselines`
  declares `ciGate: false`. §4 now asserts that declaration rather than trusting it.
- **`⚠ docs-freshness`** — the pre-build lane cannot assert a build, by design.

Nothing in this list is new, and **there is no `✗` anywhere in the log** — the first
batch in this programme to be able to say that of `validate:all` after RESIDUAL-08
made it true.

**The two runs differ by exactly one line, and it is worth naming.** The earlier run
carried a `validate:published-imports` advisory the final run does not:

```
diff <first run> <final run>
206d205
<   STALE @dzup-ui/core: dist (…10:43:05Z) predates
        packages/core/src/components/navigation/DzSidebar.vue (…11:46:00Z)
        — this run is evidence about that older build
```

That is the seeded-break restore showing up in a **timestamp**: copying `DzSidebar.vue`
back gave it a new mtime, so the pre-build lane correctly reported that it was judging
an older `dist` — and link 60 (`yarn build`) then refreshed it, so the next run's lane
saw a dist newer than its inputs. `STALE` lines: **1 → 0**. The same demonstration
RESIDUAL-02 §3.3 recorded, from the same cause, and it is why the build sits at the END
of the chain. Every other difference between the two logs is build-output ordering and
elapsed times.

### 5.5 The browser lane's first attempt stalled and was killed — recorded, not hidden

The quoted browser-lane result is from the **second** run. The first one is worth
writing down, because "the lane is green" is a claim about the lane and this was not.

```
run 1  169 of 170 story files completed, 0 FAIL, then no output for ~25 minutes.
       The missing file was identified by set difference against the collected list:
         packages/core/stories/forms/DzMention.stories.ts
       The parent node process' CPU moved 115.33 s -> 115.84 s over several minutes
       (i.e. it was not working), with 176 browser processes alive.
       Killed. 37 `chrome` processes were then terminated to clear the leak.
run 2  exit 0 · 170 files passed (170) · 1,462 tests · 1,462 passed · 0 failed · 192.06 s
       grep -c FAIL  ->  0
```

**Why this is not attributed to this batch's changes.** Nothing in this batch touches
`DzMention`, its stories, the storybook config, the vitest browser config or any
dependency of that lane — the two edited files are a `packages/core/tests/ssr` spec
and a `packages/tooling` validator, neither of which the browser lane loads. Run 2
executed the identical invocation on the identical tree and returned the handed
baseline exactly (170 / 1,462 / 1,462 / 0). So the stall was environmental — the
browser-process leak this repository has hit before (RESIDUAL-03, RESIDUAL-04) — and
it is recorded here rather than smoothed over, because a second run that is quoted as
if it were the first is the kind of thing this programme exists to stop.

**One side effect the owner should know about, stated plainly.** Clearing the leak
killed **37 processes named `chrome`**. On Windows, Playwright's bundled chromium and
a person's own Google Chrome are **both** `chrome.exe`, and nothing in the process
list distinguishes them after the fact. **If a Chrome window closed on this machine at
that moment, this batch did it.** No repository state was affected.

---

## 6. Ratchet movements (old → new)

| ratchet / counted quantity | old | new | evidence |
|---|---|---|---|
| **`unclassified`** | 29 | **29** | `✓ ownership-manifest: … 29/29 unclassified` |
| **`maxWithoutAnatomy`** | 41 | **41** | same line: `41/41 public components without anatomy` |
| **`maxProposedCitedFromCode`** | 3 | **3** | `✓ adr-status: … 3 Proposed (ADR-18, ADR-19, ADR-20) · 3 cited … all 3 grandfathered (ceiling 3)` |
| **AT cells executed** | 0 of 534 | **0 of 534** | `executed cells  0 of 534` |
| **locales at ≥ 95 %** | 1 (`en`) | **1 (`en`)** | `locales at >= 95 % completeness: 1 (en) — floor 1` |
| **capability `pass`** | 585 | **585** | re-summed from the artifact |
| **capability `fail`** | 0 | **0** | same |
| **capability `present`** | 608 | **610** | **MOVED — §6.1** |
| **capability `stale`** | 22 | **22** | same, `ceiling 22` |
| **capability `unrun`** | 400 | **398** | **MOVED — §6.1** |
| **capability `excepted`** | 47 | **47** | same |
| capability rows / cells | 144 / 1662 | **144 / 1662** | unchanged |
| **`validate:all` chain links** | 61 | **61** | measured by splitting on `&&`, before and after |
| **`validate:all` `✗` count** | 0 | **0** | `grep -c '✗'` over the whole log |
| Pending changesets | 48 | **48** | `48 pending changeset(s), 0 major, 0 mixed` |
| `ssr-smoke.spec.ts` `it` blocks | 64 (63 + 1 skip) | **64** (63 + 1 skip) | none added, none removed |
| **`ssr-smoke.spec.ts` blocks asserting nothing about output** | **38** | **1** | §2.2 — the 1 is the `it.skip` |
| `ssr-smoke.spec.ts` `expect(html).toBeTruthy()` calls | 57 | **20** | 19 of them **paired** with a real content assertion in a block outside this batch's 38, plus the one in the `it.skip`. Left alone deliberately: a redundant truthiness check beside a real assertion is harmless, and rewriting 19 already-discriminating blocks is churn the brief did not ask for |
| `ssr-smoke.spec.ts` `expect(typeof html)` calls | 2 | **0** | both were sole assertions; §2.3 |
| `browser-lane.spec.ts` tests | 18 | **37** (+19) | measured per file |
| `yarn test` tests | 11,196 | **11,215** (+19) | §5.3 — exactly the spec delta |
| `yarn test` files | 575 | **575** | no spec file added |
| Declared `ciGate` values nothing asserts | **6 of 6** | **0 of 6** | §4 |
| inline-style inventory sites | 133 | **133** | artifact byte-identical |

**No ceiling was raised and no allowlist widened.** No `*ceiling*.json` file was
opened for writing — `find packages -name '*ceiling*.json' -newermt <session start>`
is **empty**. Every change in this batch is *stricter*: 37 unfalsifiable assertions
became falsifiable, and the validator gained four failure modes it did not have.

### 6.1 The two cells that moved, and why it is a movement rather than a slip

**`present` 608 → 610 and `unrun` 400 → 398 — two cells, and they are the same two.**

```
DzTimelineItem  ssr-sample  unrun  artifacts []
             -> present     artifacts ["packages/core/tests/ssr/ssr-smoke.spec.ts"]
DzListItem      ssr-sample  unrun  artifacts []
             -> present     artifacts ["packages/core/tests/ssr/ssr-smoke.spec.ts"]
DzStepperItem   ssr-sample  present (already) — gained a SECOND artifact, state unchanged
```

The cause is the fix itself. Making `DzTimeline` and `DzList` render real children
means this spec now **structurally loads** `DzTimelineItem.vue` and `DzListItem.vue`,
and `filesLoadingComponent` — RESIDUAL-05's *structural* predicate, which replaced the
substring match RESIDUAL-02 caught laundering a citation — grants each an
`ssr-sample` artifact on that basis. Both cells were `unrun` with an **empty**
artifact list; both now cite a spec that really does render them and assert
`role="listitem"` counts, `<li>` counts, ordered labels and the selected state.

This is checked, not assumed: `DzTabList`, `DzTabTrigger` and `DzTabContent` are also
newly loaded by this spec and have **no matrix row at all**, so they moved nothing;
`DzButton` was already cited; and no other row in the 144 changed by a single byte.

**It is reported as a movement rather than presented as "nothing changed"**, because
the frozen set named these numbers and an agent that moved one quietly would be doing
the thing this programme exists to stop. The direction is the one the programme wants
— evidence appearing where there was an empty list — and the alternative was to leave
`DzTimeline` and `DzList` rendering empty containers, which is the defect being fixed.

---

## 7. Owner decisions — one closed, five raised

### 7.1 Closed to the limit of agent authority

| item | new status |
|---|---|
| **RESIDUAL-02 §6 ranked item 7** — the remaining SSR smoke blocks | **CLOSED as far as an agent may take it.** 38 of 64 blocks asserted nothing about their output; **37** now assert rendered structure, and the 38th is an `it.skip` whose assertion never runs, left alone with the reason in the file header (§3.4). Four seeded breaks on component **source**, one family each, each failing **exactly one** test and restored byte-identically (§3.2). Five component findings raised, one evidence defect fixed (§3.1) |
| **RESIDUAL-09 §15.4** — *"every `ciGate` was measured by a human grep and nothing asserts them"* | **CLOSED.** `validate:browser-lane` (already link 61) now verifies **each** declared `ciGate` against every file under `.github/workflows/`, in **both** directions, with four fail-closed cases; three seeded changes proved it exits non-zero naming the input and the workflow evidence, including one that touches **no declaration at all** (§4.5). All six values re-verified by hand first and all six confirmed |

### 7.2 Raised

1. **`D-RES10-1` 🔴 — `DzStepperItem` renders every step `completed` on the server,
   and none current.** `stepIndex` is assigned in `onMounted`, which never runs during
   SSR, so `-1 < activeStep` is true for every step: both items of a two-step stepper
   emit `data-state="completed"` with the completed check-mark, and nothing carries
   `aria-current="step"`. Also a hydration mismatch, since hydration corrects both the
   attribute and the indicator subtree. Options: (a) register during `setup`;
   (b) derive the index from the parent's child list at render time; (c) leave it and
   document that a stepper must not be server-rendered. **Recommendation: (a)**, with
   `DzStepper.spec.ts` and `DzStepper.gating.spec.ts` read first — it changes the
   registration semantics of a shared counter on a published component and owes a
   changeset, which is why an agent did not take it.
2. **`D-RES10-2` 🟡 — `DzMegaMenu`'s menubar owns a `listitem`.** `ul[role="menubar"]
   > li` (no role) `> a[role="menuitem"]` engages two ARIA structure rules, both read
   from the vendored `axe-core` role table: `menubar.requiredOwned` excludes
   `listitem`, and `listitem.requiredContext` is `list`, which the `ul` stopped being.
   Worth knowing alongside, and **measured rather than inferred** (§3.1's own first
   draft got this wrong and the correction is kept there): both rules **do** run in the
   browser lane — they carry the `wcag2a` tag `preview.ts` pins in
   `a11y.options.runOnly` — but the lane's global gate is `a11y.test: 'todo'`,
   report-only, and a family opts into enforcement with `a11yError`. **40 of the 169
   `.stories.ts` files the lane collects opt in; 129 do not, including all 16 under
   `stories/navigation/`.** So the lane's green result says nothing about this
   component's axe result. Options: (a) `role="none"` on the `<li>`; (b) drop the
   `ul`/`li`; (c) record a WCAG deviation. **Recommendation: (a)** — one attribute, no
   pixel change, both rules pass.
3. **`D-RES10-3` 🟢 — `DzChip` declares `role="status"` on every chip**, making every
   chip a live region and removing its own text as its accessible name (`status` is
   not `nameFromContent`); with `closable` it is also a focusable live region with no
   widget role. Options: (a) remove the role; (b) `listitem` inside a chip group;
   (c) keep and document. **Recommendation: (a)**, but it is a design decision.
4. **`D-RES10-4` 🟢 — `DzDataView` announces its empty state twice**: an `sr-only`
   `aria-live="polite"` region and a nested `role="status"` empty state both carry
   `No items`. Options: (a) drop the wrapper region; (b) drop `role="status"` from
   `DzEmpty` (couples to 3); (c) make the sr-only region announce the **count**
   instead. **Recommendation: (c)** — the two regions exist for different messages,
   so making them different messages keeps both purposes.
5. **`D-RES10-5` 🟢 — `DzSelect` ships `value="__DZ_SELECT_EMPTY__"` in the server
   HTML.** An internal sentinel reaching the rendered markup of every unset select.
   Inert in a browser, so hygiene rather than a bug. Options: (a) map it back to `''`
   on the hidden native element; (b) leave it and note it in the component header so
   nobody files it twice; (c) omit the hidden select when there is no value.
   **Recommendation: (a)** if it is one binding, **(b)** otherwise.

### 7.3 Not raised, because there is no choice in it — but it is work someone owes

**`perfInputGate` and `visualInputGate` still *derive* `ciGate` from a platform
comparison, not from the workflows.** `visualInputGate` computes
`ciGate = ledger.scope.platform === authoritative` and `perfInputGate` hardcodes
`false`. Both happen to be right today, and §4 now **checks** them against the
workflows — so a wrong derivation is caught. But the generator and the validator
reach the same answer by different routes, and the honest end state is for the
generator to derive `ciGate` from the same workflow read the validator performs, so
there is one definition rather than two that agree. That is a refactor of
`generate-capability-matrix.ts` with `browser-lane.ts` as the source of truth, and it
was out of scope here because it would move the artifact for a reason unrelated to
either item. Ranked as next-packet item 3.

---

## 8. Residue — nothing left behind, proved by difference

| thing | state |
|---|---|
| the measurement probe | `packages/core/tests/__probe-ssr-dump.spec.ts` was written **outside** `packages/core/tests/ssr/` on purpose — that directory is the capability matrix's `ssrSpecs` glob — used for three measurement passes, then **deleted**. `git status --porcelain packages/core/tests/` lists only the four `M` entries that were already there, and `ls packages/core/tests/` shows no probe. No suite was run while it existed except the probe itself |
| the four seeded `.vue` files | `DzTimelineItem.vue`, `DzStack.vue`, `DzDialog.vue`, `DzSidebar.vue` — all four **clean at `HEAD`** before seeding, all four `sha256sum -c` **OK** after, all four absent from `git status --porcelain` |
| the two seeded `ciGate` targets | `capability-matrix.json` and `.github/workflows/ci.yml` — both `sha256sum -c` **OK**; `ci.yml` was clean at `HEAD` and is clean again |
| `yarn.lock` | **untouched.** sha256 `dcef3ed26f23fd00ea99f64ba8c977442bdcc6abd776300c323dc99a63e076cf`, byte-identical to the value RESIDUAL-09 recorded. Its ` M` status is **the owner's `yarn install` of 2026-09-28 09:36**, not this session's. No `yarn install` was run and none is owed |
| screenshots / PNGs | none. No `__screenshots__` directory and no stray image; the browser lane was run, not re-baselined |
| scratch files inside the repository | none. Every log, backup, hash file and probe output lives in the session scratchpad **outside** the repository, and the scratch directory was created by a command that touches nothing inside it |
| `.changeset/` | untouched. **48** pending, as received. No published package's declared surface changed: the two edited files are a test spec and an internal tooling validator, neither in any `files` array |

### 8.1 Dirty paths — 333 → 333, and the two full listings are IDENTICAL

```
git status --porcelain | wc -l          before 333   after 333
diff <before listing> <after listing>   ->  no output, exit 0
```

Not "+0 by coincidence": **every path this batch touched was already dirty at entry**,
and the new report sits inside the already-`??` `docs/program-2026-09-22-architecture/reports/`
entry. Verified by name against the entry snapshot:

```
 M packages/core/tests/ssr/ssr-smoke.spec.ts                     (line 216 of the entry listing)
 M packages/core/docs/capability-matrix.json                      (187)
 M packages/core/docs/component-meta.json                         (188)
 M apps/docs/**  ×151 + apps/docs/.vitepress/generated/nav.json    (4–155)
 M apps/storybook/stories/_data/capability.generated.ts            (160)
 M docs/program-2026-09-22-architecture/EXECUTION-STATUS.md        (168)
?? docs/program-2026-09-22-architecture/reports/                   (266 — the report and the register live here)
?? packages/tooling/src/validators/browser-lane.ts                 (309)
?? packages/tooling/src/validators/browser-lane.spec.ts            (308)
```

---

## 9. Ranked next packet

1. **Register #2 / `D127` — commit the 333-path worktree.** Owner-only, unchanged as
   the single act that unblocks the most. It is now also the only thing between three
   green lanes and that greenness being *citable*: the four `! [dirty-input]`
   advisories exist purely because it has not happened, and every assertion and
   `ciGate` check this batch added is qualified against an uncommitted tree.
2. **`D-RES10-1` — `DzStepperItem`'s server-side status.** Promoted above the other
   findings because it is the only 🔴: it is user-visible on first paint, it is a
   hydration mismatch, and it is a defect **in the component**, not in the evidence
   about it. Needs the two stepper specs read first and a `patch` changeset.
3. **Make the generator derive `ciGate` from the same workflow read the validator
   performs** (§7.3). `visualInputGate` compares platforms and `perfInputGate`
   hardcodes `false`; both are now *checked* against the workflows, but there are two
   routes to one answer. Importing `parseWorkflowJobs` / `findEnforcingJob` into
   `generate-capability-matrix.ts` would leave one definition. ~1 h, and it moves the
   artifact, so it belongs in a batch that is regenerating anyway.
4. **`D-RES10-2` — `DzMegaMenu`'s menubar structure**, and the measurement beside it.
   The fix is one attribute and no pixel change. The more interesting number came out
   of correcting this report's own draft: the browser lane **runs** both ARIA structure
   rules over this component and **cannot fail on them**, because `navigation` has not
   opted into `a11yError` and the global gate is `test: 'todo'` — and that is true of
   **129 of the 169 `.stories.ts` files the lane collects**. The lane's 0-failure
   result covers far less than it reads as, per family, and nothing aggregates that
   today. `stories/Accessibility.mdx` carries the rollout table; a gate that counted
   opted-in families and ratcheted it is the obvious successor to this batch's item 2.
5. **`D-RES09-1` — write the changeset rule into `release-policy.json`'s comment.**
   Unchanged from RESIDUAL-09's ranking and now hit a second time: this batch changed
   the bytes of `packages/core/docs/capability-matrix.json` again (two cells), added
   no changeset, and had to re-decide the same question. Ten minutes.
6. **`D-RES02-2`'s residue — audit the rest of the citation lists.** RESIDUAL-05
   replaced the predicate and measured the standing damage; this batch is a live
   demonstration that the *new* predicate behaves correctly (two citations appeared
   because two components are genuinely rendered, and three newly-loaded components
   with no matrix row moved nothing). That is evidence the predicate is sound, which
   makes a full audit cheaper to justify now than before.
7. **`D-RES10-3` / `D-RES10-4` / `D-RES10-5`** — the three 🟢 findings. Small, real,
   and each is a design or hygiene call rather than a bug; they belong in one batch
   with a designer's eye on `DzChip`'s role and `DzEmpty`'s.
8. **`dzAccordion`'s skip.** The one honest gap left in `ssr-smoke.spec.ts` (§3.4).
   The block is skipped for an upstream Reka stall, so the work is *upstream
   triage* — does `AccordionRoot` still stall `renderToString` on the current Reka? —
   not a test edit. If it no longer stalls, un-skipping it yields one more measured
   component; if it still does, the skip should cite a version rather than "known".

---

## 10. State of the tree at handover

```
HEAD                             4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a   (unchanged)
git status --porcelain | wc -l   333    (entry 333; the two full listings DIFF EMPTY)
yarn.lock                        ` M`, sha256 dcef3ed2…e076cf — the OWNER's install, untouched
committed                        nothing. No push, no CI dispatch, no publish, no
                                 deployment, no baseline replacement, no `yarn install`
validate:all                     EXIT=0 · 61 links · 1,312 lines · 52 ✓ · ZERO ✗
yarn test                        EXIT=0 · 575 files · 11,215 passed · 3 skipped · 1 todo · 0 failed
browser lane                     exit 0    170 files passed (170) · 1,462 tests · 1,462 passed · 0 failed · 192.06 s
pending changesets               48, as received
ceiling files opened for writing none (`find … -newermt <session start>` empty)
```

**Files this batch wrote or edited — four, all already dirty at entry:**

```
 M packages/core/tests/ssr/ssr-smoke.spec.ts                    item 1
?? packages/tooling/src/validators/browser-lane.ts              item 2
?? packages/tooling/src/validators/browser-lane.spec.ts         item 2
 M packages/core/docs/capability-matrix.json  + component-meta.json + 152 docs pages
                                                                regenerated, sanctioned order
?? docs/program-2026-09-22-architecture/reports/RESIDUAL-10-…-handoff.md   this report
 M docs/program-2026-09-22-architecture/EXECUTION-STATUS.md      the batch ledger entry
?? docs/program-2026-09-22-architecture/reports/owner-decision-register-2026-09-22.md  §16
```

**What a reader should not over-read from this report.** The `ciGate` clause is a
**textual** read, by the same deliberate choice the module header made for the
original `[ci-gate]` rule: it asserts that a job invokes a lane's command and carries
no `continue-on-error`, **not** that GitHub would schedule that job, that the runner
would have the browser, or that the step would pass. And item 1's assertions are SSR
assertions: they prove what the **server** emits, which is the half of the contract a
mounted test cannot see, and not what the component does after hydration.
