# TASK-N1-O1 — Author the 51 tier-required Story DoD items (P5-02 close-out)

> Handoff for [`evidence-execution-tasks.md` → TASK-N1-O1](../evidence-execution-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-08-31 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD (binding for every number below):** `51dec93c73214af2d1e424e3454a7122691fea48`
> **Worktree at run start:** dirty **docs-only** plus the four one-line `sourceCommit`
> re-binds landed by TASK-N0-05. No `packages/**`, `apps/**` or `e2e/**` file was
> modified before this task began.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`, Storybook 10.5.1, Vitest 3.2.6
> (browser mode, Playwright chromium).
>
> **Nothing is committed, pushed, dispatched to CI, or published.** Per README §3
> `<authority>` this run stops at "locally qualified".
>
> **Headline: story-DoD tier-required open count 51 → 0.** 51 stories authored across
> 32 components and 8 families; the ceiling file is lowered to `{states: 0,
> accessibility: 0, real-world: 0}`. No DoD rule was weakened, no item was re-triaged
> to advisory, no component tier was lowered, and no waiver was added.

---

## 1. Discovery — the authoritative list, as it stood BEFORE anything was written

Source of truth, read at HEAD before editing:
`npx tsx packages/tooling/src/validators/story-dod-tiers.ts --all`, which joins
`validators/story-dod.ts`'s six advisory checks to `packages/core/docs/quality-matrix.json`
through `quality/story-dod-triage.ts`.

### 1a. What makes an item *tier-required*

`TIER_REQUIRED_CHECKS` (in `packages/tooling/src/quality/story-dod-triage.ts`) is the
whole rule, and it is a rule about **risk tier**, not about count:

| check | required from tier | why that tier owes it (triage's own reasoning) | what the validator actually looks for |
|---|---|---|---|
| `states` | **B**+ | "A component with states nobody can see in a story has states nobody reviews." Applicability is derived from the component's own `.types.ts` — a component declaring none of `disabled`/`loading`/`readonly`/`invalid`/`error`/`required` is not asked. | an export named exactly `States` |
| `accessibility` | **C**+ | "The APG narrative and the expected announcements; the manual AT matrix (P5-04) is written against it." | an export named exactly `Accessibility` |
| `real-world` | **C**+ | "A composite that only appears alone has never been shown doing the thing it exists for." | an export whose name starts with `RealWorld` |

The other three advisory checks — `gallery` (155 open), `controls-live`, `play` — are
**not** tier-required and were deliberately left alone. `gallery` is the largest number
in the report and the cheapest to inflate; closing it would move a headline percentage
and reduce risk for nobody. It stays at 155.

### 1b. The 51 items, grouped by family (30 `states` / 11 `accessibility` / 10 `real-world`)

Every one of the 32 components already had a story **file**; none of them had the story
the file's tier owed. Nothing was created from scratch — all 51 were appended to the
existing `packages/core/stories/{family}/Dz{Name}.stories.ts` (stories are never
colocated with the component).

#### buttons — 1 item / 1 component

| component | tier | required story kind |
|---|---|---|
| `DzSpeedDial` | B | `states` |

#### data — 16 items / 10 components

| component | tier | required story kind |
|---|---|---|
| `DzAccordion` | B | `states` |
| `DzChip` | B | `states` |
| `DzInfiniteScroll` | B | `states` |
| `DzTag` | B | `states` |
| `DzCalendar` | C | `states`, `accessibility`, `real-world` |
| `DzDataGrid` | C | `states` |
| `DzDataView` | C | `states`, `accessibility`, `real-world` |
| `DzOrderList` | C | `states`, `accessibility`, `real-world` |
| `DzTable` | C | `states` |
| `DzTree` | C | `states` |

#### forms — 17 items / 9 components

| component | tier | required story kind |
|---|---|---|
| `DzCheckboxGroup` | B | `states` |
| `DzInplace` | B | `states` |
| `DzListbox` | B | `states` |
| `DzRadioGroup` | B | `states` |
| `DzCascader` | C | `states`, `accessibility`, `real-world` |
| `DzMention` | C | `states`, `accessibility`, `real-world` |
| `DzPersonaSelector` | C | `states`, `accessibility`, `real-world` |
| `DzTimePicker` | C | `states`, `accessibility` |
| `DzTreeSelect` | C | `accessibility`, `real-world` |

#### layout — 1 item / 1 component

| component | tier | required story kind |
|---|---|---|
| `DzResizable` | B | `states` |

#### media — 2 items / 2 components

| component | tier | required story kind |
|---|---|---|
| `DzCarousel` | B | `states` |
| `DzImageComparison` | B | `states` |

#### navigation — 7 items / 3 components

| component | tier | required story kind |
|---|---|---|
| `DzAnchor` | B | `states` |
| `DzMegaMenu` | C | `states`, `accessibility`, `real-world` |
| `DzSidebar` | C | `states`, `accessibility`, `real-world` |

#### overlays — 7 items / 6 components

| component | tier | required story kind |
|---|---|---|
| `DzConfirmDialog` | B | `states` |
| `DzContextMenu` | B | `states` |
| `DzDropdownMenu` | B | `states` |
| `DzPopconfirm` | B | `states` |
| `DzCommandPalette` | C | `states` |
| `DzTour` | C | `accessibility`, `real-world` |

**Totals:** 51 items · 32 components · 8 families
(buttons 1, data 16, forms 17, layout 1, media 2, navigation 7, overlays 7).

### 1c. Anatomy / `ui`-prop cross-reference (discovery step 3)

Nine components in the whole repo declare an ADR-19 anatomy
(`DzButton`, `DzDialog`, `DzDialogContent`, `DzFileUpload`, `DzInput`, `DzProvider`,
`DzSelect`, `DzTable`, `DzThemeProvider`). **Exactly one of them — `DzTable` — is in
this task's list.** Its `States` story is therefore written against the published
anatomy rather than against class names: it asserts every declared part
(`root`/`content`/`title`/`header`/`body`/`row`/`cell`/`footer`) is present, that
`[data-part="root"]` carries `data-state="ready" | "loading"`, and that exactly one
`[data-part="row"]` carries `data-state="selected"`.

The other 31 components declare no anatomy, so there is no `data-part` contract to
exercise. Where they nonetheless publish `data-*` state hooks of their own
(`data-state`, `data-disabled`, `data-invalid`, `data-loading`, `data-active`,
`data-highlighted`, `data-panel-resize-handle-enabled`), the new stories assert against
those rather than against rendered classes — that is what makes them useful to N2-S1's
`ui`-adoption rollout and to a future theme author.

### 1d. Shape copied from existing stories (discovery step 2)

Read before writing: `DzCombobox` (Tier C form control), `DzTable` (Tier C data,
anatomy declarer), `DzDialog`/`DzPopconfirm` (Tier B/C overlays), `DzDataGrid` (Tier C
data). The house conventions they establish and every new story follows:

- `import { expect, screen, userEvent, waitFor, within } from 'storybook/test'`
- `render: () => ({ components, setup/data, template })`, token-only styling in the
  template (`var(--dz-*)`), no raw colour literals, no `<style scoped>`
- portalled surfaces (popovers, dialogs, menus, command palette) are queried through
  `screen` / `within(document.body)`, never through `canvasElement`
- a JSDoc block directly above each export, since that is what Storybook renders as the
  story description
- `a11yError` is opted into per family at the `meta` level — **buttons, cards, media and
  overlays are gated at `test: 'error'`**, so the new stories in those four families are
  axe-enforced, not report-only. Every new overlay play function therefore ends with its
  surface **closed**, so the a11y sweep that runs after `play` sees the same DOM the
  existing stories already audit clean.

---

## 2. Stories authored — what each demonstrates and what its play function asserts

All 51 have a `play()` that **asserts**; none merely performs. 51 new `play` functions,
0 stories without one.

### 2.0 Files changed, and their API effect

`git diff --stat` → **40 files changed, 5,017 insertions(+), 135 deletions(−)**.

| group | files | change | public-API effect |
|---|---|---|---|
| `packages/core/stories/**/*.stories.ts` | 32 | +51 story exports with asserting `play()`s; 8 files gained a `waitFor`/`userEvent`/`screen` import; `DzTable.stories.ts` gained a `DzTableFooter` import | **none** — stories are not shipped |
| `packages/tooling/src/quality/story-dod-ceiling.json` | 1 | `{states: 30, accessibility: 11, real-world: 10}` → `{0, 0, 0}` (`--write`) | **none** — a ratchet ceiling |
| `packages/core/docs/capability-matrix.json` + `apps/storybook/stories/_data/capability.generated.ts` | 2 | regenerated (`generate:capability-matrix`) because the story-DoD input moved; 52 cells `unrun` → `pass` | **none** — generated evidence projection |
| `apps/storybook/vitest.config.ts` | 1 | one path segment + a comment (§3a) | **none** — test config |

**Zero files under `packages/core/src/`, `packages/contracts/`, `packages/tokens/` or any
`index.ts` barrel were touched.** No prop, emit, slot, type, token or variant taxonomy
changed; `validate:exports`, `validate:dts` and `validate:ownership` are all green and
report no delta.

### 2a. buttons (1)

| story | scenario demonstrated | play asserts |
|---|---|---|
| `DzSpeedDial.States` | closed / open-with-one-action-disabled / whole-dial-disabled | closed dial's `role="menu"` is `aria-hidden="true"` and every action is `tabindex="-1"`; open dial drops `aria-hidden` and its enabled actions are `tabindex="0"`; the disabled action is `disabled` while its siblings are not; a disabled trigger is `disabled` + `aria-expanded="false"`; and the live dial really toggles `aria-expanded` both ways (so the negatives are measured against a working baseline) |

### 2b. data (16)

| story | scenario demonstrated | play asserts |
|---|---|---|
| `DzAccordion.States` | enabled / one item disabled / whole accordion disabled | root `data-state` `ready` vs `disabled`; an enabled trigger toggles `aria-expanded` and reveals its panel; the locked item's trigger is `disabled` and stays collapsed while its sibling expands; both triggers of the root-disabled accordion are `disabled` and collapsed. Disabled triggers are asserted, never clicked — `dz-disabled-control` sets `pointer-events: none`, so a click would never be delivered |
| `DzCalendar.States` | enabled / read-only / disabled, same month, same value | `aria-readonly` / `aria-disabled` on the right grids only; the disabled calendar's `Next month` is `disabled` while the read-only one's is enabled; clicking a day commits on the enabled calendar and is refused on the read-only one (model unchanged); the disabled calendar's cells carry `data-disabled` + `aria-disabled` |
| `DzCalendar.Accessibility` | **keyboard-only** APG `grid` navigation | exactly one day button is tabbable (roving tabindex); Tab reaches it; ArrowRight → `2026-06-16`, ArrowDown → `2026-06-23`, Home → `2026-06-21`, Enter commits `2026-06-21`, PageDown → `2026-07-21` — each verified on `document.activeElement`'s `data-iso` and on the bound model. No pointer is used |
| `DzCalendar.RealWorldBooking` | booking availability: `minDate`/`maxDate` window + `disabledDate` + `#day` slot + summary panel | out-of-window and fully booked days are `aria-disabled`/`data-disabled`; an available day books and drives both the day and the remaining-slot count in the summary aside |
| `DzChip.States` | idle / disabled / non-closable | `data-state` + `data-disabled` on the root; the disabled chip's remove button is `disabled`; pointer close and the Delete shortcut both emit `close` on the idle chip (counter goes 0→1→2); Delete is suppressed while disabled (counter stays 0); a non-closable chip has no remove control |
| `DzDataGrid.States` | ready / loading / empty | ready: `data-state="ready"`, no `aria-busy`, grid with header + 3 rows; loading: `aria-busy="true"`, `data-loading`, and the `role="grid"` table is **replaced** (queryByRole → null), not left stale underneath; empty: consumer's `#empty` slot renders and no grid exists |
| `DzDataView.States` | ready / loading / disabled / empty | loading replaces the list with `aria-hidden` skeletons and announces "Loading items"; **disabled keeps every record readable and only switches the controls off** (sort `combobox`, both layout toggles and the paginator all `disabled`); empty announces its title through the same live region |
| `DzDataView.Accessibility` | list semantics + **keyboard-only** layout switch | `role="list"` with `listitem` per record in either layout; `aria-labelledby` to the visible heading; `Sort by` combobox and `View layout` group are named; Tab into the roving toggle group, ArrowRight, Enter → `aria-pressed` moves, `data-layout` flips to `grid`, and list semantics survive the switch |
| `DzDataView.RealWorldCatalog` | storefront catalog: header + count + sort + paging + layout choice | sorting re-orders the **whole** collection, not the visible page (cheapest product moves from page 2 to page 1); paging moves the window and the polite announcement follows (`Showing 5 to 8 of 8 items`); the shopper's layout choice survives sorting and paging |
| `DzInfiniteScroll.States` | idle / loading / error / end / disabled | per-state announcement text in the polite region; `aria-busy` while loading; `role="alert"` + working Retry on error (counter 0→1); and the contract a screenshot cannot show — **the IntersectionObserver sentinel is mounted only while another page can be requested** (present for idle+loading, absent for error, end and disabled) |
| `DzOrderList.States` | enabled / disabled / selectable-selected / keyboard-grabbed | `Move up` is disabled at row 0 and `Move down` live, and clicking it really reorders; the disabled list keeps all five rows readable while all four controls are dead and the root carries `data-disabled`; `selectable` turns rows into `option`s in an `aria-multiselectable` listbox and a selected row stamps `data-state="selected"`; Space on a focused row enters `aria-grabbed` + `data-state="grabbed"` and Escape clears it |
| `DzOrderList.Accessibility` | **WCAG 2.5.7** — every drag reachable by keyboard | roving tabindex (exactly one row tabbable); Tab reaches the list past the controls; ArrowDown ×2 to row 2; Space announces `Grabbed item at position 3 of 5`; ArrowUp really reorders the model and announces `Item moved to position 2 of 5.`; Space drops and announces it; the committed order is asserted as a full array; Escape cancels an in-flight grab |
| `DzOrderList.RealWorldDashboardOrder` | dashboard widget ordering with a persisted order string | the saved order starts at the default; clicking a row makes it the control target and `Move to top` promotes it (`errors › revenue › signups › latency`); resetting the bound array re-renders the list, proving the array is the single source of truth |
| `DzTable.States` | **ADR-19 anatomy**: ready + selected row / loading | all eight declared parts present; `[data-part="root"]` `data-state` `ready` vs `loading`; `aria-busy` on the `<table>` while loading; exactly one `[data-part="row"][data-state="selected"]`, and it is the right row; and the part that is easy to get wrong — while loading, `DzTableBody` **replaces** its rows with `aria-hidden` skeletons, so the only row left in the accessibility tree is the header and the previous page's values (`INV-1001`) are gone |
| `DzTag.States` | idle / disabled / non-closable | same three-way contract as `DzChip`, plus: a closable tag is `tabindex="0"` in **both** states so the disabled state stays discoverable, and a non-closable tag has no `tabindex` at all |
| `DzTree.States` | ready / loading / tree-disabled / node-disabled | the root's single `data-state` resolves in priority order (`disabled` > `loading` > `ready`); APG tree semantics on the ready tree (`aria-expanded`, `aria-level`, exactly one tabbable row); a disabled **node** is `aria-disabled` + `tabindex="-1"` and refuses selection while its sibling accepts it |

### 2c. forms (17)

| story | scenario demonstrated | play asserts |
|---|---|---|
| `DzCascader.States` | enabled-with-value / disabled-same-value / invalid | root `data-disabled`/`data-state`/`data-invalid`; the disabled trigger is `disabled` and **the clear affordance is withdrawn**, so a disabled cascader's value cannot be emptied; the enabled one offers Clear and really opens; `aria-invalid` + `role="alert"` message; `Germany` is `aria-disabled` inside an otherwise-live cascade |
| `DzCascader.Accessibility` | **keyboard-only** cascade | closed trigger has `aria-haspopup="listbox"` and no `aria-controls`; Tab reaches it; ArrowDown opens and wires `aria-controls`; ArrowRight descends `Level 1 → 2 → 3`; ArrowDown + Enter commits `cn → zj → nb` and closes the panel, with the trigger showing `Ningbo` |
| `DzCascader.RealWorldShippingRegion` | shipping-address region field with label, hint and a gated submit | the trigger takes its name from the visible label and its hint from `aria-describedby`; the form cannot advance on an incomplete path; walking USA → California → San Francisco commits `us / ca / sf` and enables submit; clearing returns the form to `incomplete` + disabled |
| `DzCheckboxGroup.States` | enabled / group-disabled / one-box-disabled | `role="group"` root with `data-state` + `data-disabled`; group `disabled` propagates through the injected context to every child (`disabled` + `data-disabled` on each); a single disabled box leaves its sibling live and checkable; toggling reaches the `string[]` model |
| `DzInplace.States` | display / edit / disabled | `data-state="display"` vs `"edit"`; the disabled trigger is a `disabled` button **and carries no pencil affordance at all**; activating swaps to `edit` and focuses the field; Escape returns to `display` without committing; Enter commits; the disabled control never leaves `display` and never renders a textbox |
| `DzListbox.States` | enabled / disabled control / disabled option + invalid | selection works in the enabled control (so the negatives are measured); root `data-disabled` propagates to every option; `data-invalid` + `aria-invalid` on the `role="listbox"` + `role="alert"` message; a disabled **option** is the only one refused while its siblings still select |
| `DzMention.States` | idle / disabled / **loading** / invalid | `data-disabled`, `data-invalid` + `aria-invalid` + `role="alert"`; and the state that only exists at runtime: typing the trigger against a never-settling async resolver puts the root into `aria-busy="true"` + `data-loading`, renders the loading row, and shows **no** `role="listbox"` |
| `DzMention.Accessibility` | APG editable-combobox, **keyboard only** | `aria-haspopup`/`aria-autocomplete`/`aria-expanded`, no `aria-controls` while closed; Tab reaches the textarea; typing `@` opens the list and wires `aria-controls` to the listbox's id; the active option is published through `aria-activedescendant` (and is `aria-selected`) **while focus stays in the textarea**; ArrowDown moves the active option, Enter inserts `@Bob Smith`, Escape dismisses a re-opened list without inserting |
| `DzMention.RealWorldCommentComposer` | issue-tracker composer with two triggers (`@` people, `#` labels), submit and a thread | an empty draft cannot be posted; `@Ca` resolves against people and `#fea` against labels **in the same control**; the draft carries both tokens; submitting appends to the thread and resets the composer and the submit button. Binds the **default** `v-model` rather than `v-model:value`, because the named model cannot be reset externally once the user has typed (D8) |
| `DzPersonaSelector.States` | enabled / disabled-with-selection / empty roster | `disabled` travels down into the composed `DzCombobox` — the search field and the options toggle are disabled, and nothing still enabled inside is tabbable; the enabled control really opens; an empty roster still opens and shows the consumer's `#empty` copy rather than a silent blank panel. The clear button's missing `disabled` is D9 |
| `DzPersonaSelector.Accessibility` | **keyboard-only** assignment | the search field is a named combobox, collapsed at rest; Tab reaches it; typing `gra` filters the roster to one option; ArrowDown highlights it (`data-highlighted`) and Enter commits `grace`, collapsing the list |
| `DzPersonaSelector.RealWorldReviewRequest` | review-request panel with an assignee card and unassign | `change` carries the whole `Persona`, so the card can show name **and** role where `v-model` alone would only give the id; unassigning returns the panel to its empty state |
| `DzRadioGroup.States` | enabled / required / group-disabled / one-option-disabled | `data-required` + `aria-required="true"` on the `role="radiogroup"`; `data-state`/`data-disabled`; exclusive selection (choosing Pro clears Basic) and the model follows; group `disabled` reaches every radio; one disabled option leaves its sibling selectable |
| `DzTimePicker.States` | enabled-with-value / disabled-same-value / invalid | both hold `10:30` but only the enabled one offers `Clear time`; the disabled trigger is `disabled` and `aria-expanded="false"` forever; the enabled trigger really opens and closes; `aria-invalid` + `role="alert"` |
| `DzTimePicker.Accessibility` | **keyboard-only** panel, named controls | `aria-haspopup="dialog"`; Tab reaches the trigger, Enter opens; every panel control is named (`Select hours`, `Select minutes`, `OK`); selecting 14:30 through the panel commits; and the step that strands keyboard users when missing — Escape closes **and focus returns to the trigger** |
| `DzTreeSelect.Accessibility` | combobox + `role="tree"`, **keyboard only** | `aria-haspopup="tree"`; Tab reaches the trigger; ArrowDown opens the panel, wires `aria-controls` and sets `aria-activedescendant` to an id that exists and reads `Fruit`; ArrowRight expands the branch instead of committing it; ArrowDown steps into the children (activedescendant follows); Enter commits `apple` and closes; Escape dismisses a re-opened panel without changing the selection. It deliberately asserts **no** claim about where DOM focus sits once open — see D10 |
| `DzTreeSelect.RealWorldCatalogFilter` | catalog category facet, checkbox mode with propagation | the unfiltered count is the whole catalog (57); checking the `Vegetable` parent commits its whole subtree (chips for Carrot **and** Potato, count 23) — the behaviour a flat multi-select cannot express; removing one chip removes only that category (count 9) |

### 2d. layout (1)

| story | scenario demonstrated | play asserts |
|---|---|---|
| `DzResizable.States` | resizable / frozen (disabled on group **and** handle) | group `data-disabled`; handle-level `data-disabled` + `data-panel-resize-handle-enabled="false"`; `aria-orientation` on the live separator; focusing the live separator and pressing ArrowRight really widens panel A (measured with `getBoundingClientRect()`); the frozen layout's geometry is byte-identical after the same keys |

### 2e. media (2)

| story | scenario demonstrated | play asserts |
|---|---|---|
| `DzCarousel.States` | ready / disabled / empty | `data-state` follows slide registration (`ready` vs `empty`), not a prop; `data-disabled` only on the disabled carousel; **Next really advances the enabled carousel and is refused by the disabled one** (dot `aria-selected` unmoved), and a dot click is refused too — so the refusal is in the model, not in one control |
| `DzImageComparison.States` | enabled / disabled slider | both report the full `role="slider"` ARIA contract at 50; the enabled grip is `tabindex="0"`, unflagged, and ArrowRight moves `aria-valuenow` past 50; the disabled one is `aria-disabled="true"`, `tabindex="-1"` (so a keyboard user is not stranded on an inert control), root `data-disabled`, and ArrowRight/End leave `aria-valuenow` at 50 |

### 2f. navigation (7)

| story | scenario demonstrated | play asserts |
|---|---|---|
| `DzAnchor.States` | active / inactive / disabled entry | `aria-current="location"` + `data-active` on the active entry only; a disabled entry is `aria-disabled="true"`, `tabindex="-1"` **and** `pointer-events: none` (asserted on computed style — it cannot be clicked at all); activating a live entry moves both the announcement and the `v-model:active` value |
| `DzMegaMenu.States` | enabled with one disabled entry / whole menubar disabled | a disabled entry is `aria-disabled` + `data-disabled` + `pointer-events: none`; the live menubar really opens a panel, and a disabled link **inside** the open panel carries the same announcement; Escape closes; a disabled menubar pushes a real `disabled` attribute down to every panel-owning trigger, so none can be tabbed to, clicked or expanded |
| `DzMegaMenu.Accessibility` | WAI-ARIA **menubar** keyboard contract, no pointer | roving tabindex (exactly one `menuitem` tabbable); Tab reaches the bar; ArrowRight/ArrowLeft move along it; ArrowDown opens the panel **and lands on its first link**; ArrowDown cycles links inside the panel; Escape closes and **returns focus to the trigger** |
| `DzMegaMenu.RealWorldSiteHeader` | marketing-site primary header: brand + menubar + CTA | the menubar is a named landmark inside the header; a panel-owning entry advertises `aria-haspopup`; opening a second entry closes the first (only one panel ever open); a leaf entry is a real `<a>` with **no** `aria-haspopup`/`aria-expanded` — the case that most often breaks the menubar pattern |
| `DzSidebar.States` | expanded / collapsed / active / disabled item | root `data-state` `expanded` vs `collapsed`; `role="navigation"`; item `data-state` `active`/`inactive` with `aria-current="page"` on the active one only; a disabled item is `aria-disabled` + `tabindex="-1"`; the collapsed rail **drops** its labels rather than clipping them, while keeping them reachable by accessible name |
| `DzSidebar.Accessibility` | landmark + keyboard order | the sidebar is findable as `navigation` by name; exactly one item claims `aria-current="page"`; Tab reaches the first live item and the order goes Dashboard → Sessions → Settings, **skipping the disabled Billing entry**; Enter activates the focused entry and `aria-current` moves with it, still exactly once |
| `DzSidebar.RealWorldAppShell` | application shell: brand, sections, live route, footer collapse control | the route highlight and the main region move together; collapsing to the rail drops the visible labels **but keeps the accessible names and the route highlight** — the part an icon rail most often loses; expanding restores the labels without changing the route |

### 2g. overlays (7)

| story | scenario demonstrated | play asserts |
|---|---|---|
| `DzCommandPalette.States` | closed / open / disabled command / no results | closed means **absent**, not hidden (no `dialog`, no `combobox` in the document); open is a modal dialog with an auto-focused search field; a disabled command stays **listed** with `data-disabled` while the roving highlight steps over it however many times the list is advanced; a non-matching query renders the empty copy and zero options; Escape returns to closed with nothing run |
| `DzConfirmDialog.States` | closed / open idle / **loading** | closed means absent; both actions live when idle; while an async confirm is in flight the **dialog stays open**, the confirm button is `aria-busy="true"` and `disabled`, and cancel is withdrawn so the request cannot be abandoned mid-write; when it settles the dialog closes and the outcome reaches the page |
| `DzContextMenu.States` | closed / open / disabled command | closed means absent; right-click opens a **named** menu; a disabled command stays listed with `aria-disabled` + `data-disabled` while the roving highlight steps over it; Enter runs the highlighted command and returns to the closed state |
| `DzDropdownMenu.States` | closed / open / disabled item | closed means absent and the trigger says `aria-expanded="false"`; open flips `aria-expanded`, keeps `aria-haspopup="menu"` and puts a visible `role="menu"` in the document; a disabled item is announced (`aria-disabled` + `data-disabled`) and skipped by the roving highlight; Enter activates the highlighted item, closes the menu and reaches the page. (It deliberately does **not** assert the trigger's `aria-controls` — see D11) |
| `DzPopconfirm.States` | closed / open idle / **loading** | closed means absent; open is a `role="alertdialog"` naming the action; while loading the popover stays open, confirm is `aria-busy` + `disabled` and cancel is withdrawn; `loading` clearing closes the popover and the outcome lands |
| `DzTour.Accessibility` | modal dialog + focus trap + live region, keyboard driven | `aria-modal="true"`, accessible **name** from the step title and **description** from the step body; the polite region reads `Step 1 of 3`; focus is inside the popover on open and **stays trapped** (tabbing past the last control wraps rather than landing on the page underneath); advancing re-announces `Step 2 of 3`; Escape dismisses the whole tour |
| `DzTour.RealWorldOnboarding` | first-run onboarding of the app's own chrome | **skipping is not completing** — the two outcomes are told apart by `@close` vs `@finish`, which is what a product must persist; the tour is restartable and its step counter starts over; `Back` returns to the previous step without leaving the tour; walking to the end marks onboarding complete |

---

## 3. Component source touched

### 3a. Trivial fixes applied — 1 file, and it is **not** component source

| file | change | why it was unavoidable |
|---|---|---|
| `apps/storybook/vitest.config.ts` | `pkgRoot = resolve(dirname, '../../..')` → `resolve(dirname, '../..')` (+ a comment) | **`yarn storybook:test` could not start at all at HEAD.** `dirname` is `apps/storybook/`; three `..` walk to the directory *above* the repo, so `createDzupResolution` threw `no 'packages/' directory under …/internal-dev/ui` while vitest was still loading its config — a startup error, before a single story ran. `apps/landing/vite.config.ts` derives the same root correctly as `resolve(__dirname, '../..')`. This is a pre-existing tooling defect (the line dates from `d3047a8`, last touched by `7984c68`), not a regression from this task, and the fix is one path segment. It is reported as a tooling failure in §4 as well. |

**Zero `packages/core/src/**` files were modified.** No `.vue`, `.types.ts`, `.tokens.ts`,
`.variants.ts`, spec or barrel was touched. No public API, prop, emit, slot, token or
variant taxonomy changed.

### 3b. Defects found while writing the stories and **NOT** fixed

Each of these was exposed by trying to write an honest story for a declared state. None
is trivial — every one is a behavioural change to component source with existing stories
and specs written against the current behaviour — so each is reported for its owner
rather than fixed here. The stories were written to assert what is **true**, never to
certify the defect as intended.

| # | component | defect | evidence | severity / suggested lane |
|---|---|---|---|---|
| **D1** | `DzTree` | **Tree-level `disabled` is presentational only.** `<DzTree disabled>` stamps `data-state="disabled"` + `data-disabled` on the root, but the prop is never put into the injected context, so every row keeps its roving `tabindex`, its click handler, its expand chevron and its selection. Only per-node `node.disabled` actually disables anything. | `DzTree.vue` provides `{…}` at L195 with no `disabled` member; `DzTree.types.ts`'s `DzTreeContext` has no `disabled`; `DzTreeItem.vue` consults only `props.node.disabled` (L45/73/95/102/151) and `rowTabindex` never reads the context. | **Medium.** A consumer who greys the tree still ships an interactive tree. Fix touches `DzTree.vue` + `DzTreeItem.vue` + the context type → N5 lane or its own follow-up. The `States` story asserts only the root attributes and the per-node behaviour, both of which are correct today. |
| **D2** | `DzResizable` | **Group-level `disabled` is presentational only.** `DzResizableContext` carries `direction` and `size` only, so `<DzResizable disabled>` stamps `data-disabled` on the `SplitterGroup` and nothing else — the handles stay focusable and Arrow keys still resize. Freezing a layout today requires `disabled` on **every** `DzResizableHandle` as well. | `DzResizable.vue` L45-49 (`const context: DzResizableContext = { direction, size }`); `DzResizable.types.ts` L29 declares the key with the same two members; `DzResizableHandle.vue` reads only `props.disabled`. | **Medium.** Same shape as D1. The `States` story sets `disabled` on both levels and says so in its description, so the docs do not teach the broken combination. |
| **D3** | `DzMention` | **The `loading` prop is dead — shadowed by an internal ref of the same name.** `withDefaults(defineProps<DzMentionProps>(), { … loading: false … })` (L61) declares a `loading` prop, but `const loading = ref(false)` (L135) is a `<script setup>` binding, which wins over the prop in template scope. Every template reference (`data-loading`, `aria-busy`, the `v-if="loading"` loading row, the `announcement` computed) reads the ref. `props.loading` is referenced nowhere. `<DzMention loading>` does nothing. | `DzMention.vue` L61 vs L135; `grep props.loading` → no hits. Note that `DzMention.types.ts` L115's `loading?:` is a **slot**, not a prop, so `story-dod`'s `declaredStateProps` also matched the wrong declaration here (see D6). | **Medium.** Fix is a rename, but which side keeps the name is an API decision (does a consumer get to force the loading state?). The `States` story reaches the loading state the only way it is reachable — a pending async resolver — and says so in its description. |
| **D4** | `DzCascader`, `DzTreeSelect` | **Nested interactive controls inside a `role="combobox"` button.** The clear affordance (`<span role="button" tabindex="-1" aria-label="Clear selection">`) and, in `DzTreeSelect`, each chip's remove control are rendered **inside** the `<button role="combobox">` trigger. That is axe's `nested-interactive` rule and the HTML "no interactive content in a button" rule. | `DzCascader.vue` L559-571 (span inside the `<button>` opened at L534); `DzTreeSelect.vue` L662-671 inside the trigger opened at L620. | **Medium-high (EAA-era).** Not caught today because `forms` has not opted into `a11yError`, so its axe sweep is report-only. Belongs with N1-O3's WCAG lane. Fixing it moves DOM out of the button → a real layout/API change, not a story fix. |
| **D5** | `DzOrderList` | **`:ariaLabel` instead of `:aria-label` on the `<ul>`.** Every sibling attribute on the same element is kebab-cased (`:aria-labelledby`, `:aria-describedby`); this one is camelCase, so it only reaches `aria-label` through modern ARIA reflection (`el.ariaLabel`) and silently does nothing anywhere reflection is unavailable. | `DzOrderList.vue` L549. | **Low.** A one-token fix, but it is component source and unverified across engines — deliberately left for the owner and routed to N1-O2, which is the packet that will actually measure Firefox/WebKit. The `Accessibility` story names the list with `aria-labelledby` instead, which is bound correctly. |
| **D6** | `packages/tooling/src/validators/story-dod.ts` | **`declaredStateProps` matches slot and nested-interface declarations, not just props.** It tests `^\s{2}(disabled\|loading\|…)\?:` against the whole `.types.ts` file, so any two-space-indented member of *any* interface counts — `DzMention`'s `loading?:` **slot** and `DzAnchor`'s/`DzSidebar`'s item-level `disabled?:` all made their components "applicable" for `states`. | `story-dod.ts` L≈195 `declaredStateProps`; `DzMention.types.ts` L115 is inside the Slots interface. | **Low, and it errs safe.** It over-includes rather than under-includes, so no tier-required item was missed. Worth tightening (scope the regex to the `*Props` interface) so the `states` denominator means what it says. Reported, not changed — narrowing a gate's applicability during a task whose job is to satisfy that gate would be exactly the gaming `<no_gaming>` forbids. |
| **D7** | `useFocusTrap` (as used by `DzTour`) | **Focus is trapped but never restored.** `deactivate()` removes the keydown listener and nothing else, so dismissing a `DzTour` (Skip, Escape, or Finish) leaves focus on `<body>` instead of returning it to the element that opened the tour. `DzPopconfirm` and Reka-based overlays do restore focus; this one does not. | `packages/core/src/composables/useFocusTrap/useFocusTrap.ts` — `activate()` focuses `focusable[0]`, `deactivate()` has no counterpart; `DzTour.vue` L205 is its only wiring here. | **Medium (WCAG 2.4.3 Focus Order).** The `Accessibility` story asserts the trap, the naming and the announcements — all of which are correct — and deliberately does **not** assert focus restoration, because it does not happen. Route to N1-O3's a11y lane. |

The next four were found by the Storybook interaction lane itself once it could run
(§4e T1) — they are the reason four of the new stories had to be rewritten before they
would pass, and they are **measured**, not inferred:

| # | component | defect | evidence | severity / suggested lane |
|---|---|---|---|---|
| **D8** | `useDualModel` → `DzCascader`, `DzKnob`, `DzMention`, `DzRating`, `DzTagsInput`, `DzTreeSelect`, `DzInplace` | **A `v-model:value`-only consumer loses control of the value after the first user edit.** `useDualModel` reads `primary.value` whenever it is not `undefined` and **writes to both** models. A consumer who binds only the legacy named model leaves `primary` as component-local state — but the first write latches a value into it, and from then on `get()` prefers that local state and every external write to `value` is ignored. Resetting a form field silently does nothing. | Measured: `DzMention.RealWorldCommentComposer` bound `v-model:value="draft"`, submitted, set `draft = ''`; the thread received the text (so the parent's write happened) while the textarea still read `ping @Carol Williams please look at #feature `. `useDualModel.ts` `get: () => (isEmpty(primary.value) ? legacy.value : primary.value)` with `set` writing both. | **High.** It is a silent data bug in seven public controls, and the escape hatch (bind the default `v-model`) is undocumented at the call site. Route to N5-01/N5-02 — deciding it is a semver question. The story now binds the contract-conforming default `v-model`, which works, and says so. |
| **D9** | `DzCombobox` (and everything composed on it, incl. `DzPersonaSelector`) | **The clear button ignores `disabled`.** `<ComboboxCancel v-if="model">`'s `<button>` has no `:disabled` binding and no `dz-disabled-*` class, while its sibling `ComboboxTrigger` button does (`:disabled="resolvedDisabled"`). A disabled combobox holding a value therefore still renders a live, clickable Clear control. | Measured: `DzPersonaSelector.States` asserted every button in the disabled control was disabled and got back `<button aria-label="Clear selection" tabindex="-1" …>` — enabled. `DzCombobox.vue` L390-402 vs L404-410. | **Medium.** `tabindex="-1"` keeps it out of the tab order, so keyboard users are safe; pointer and AT users are not. One-line fix, but it is component source with a visible behaviour change → owner's call. The story now asserts the two controls that *are* disabled plus "nothing enabled in a disabled control is tabbable". |
| **D10** | `DzTreeSelect` | **Two focus mechanisms at once.** The component is built as a `role="combobox"` that keeps DOM focus and publishes the active node through `aria-activedescendant` (its own L502 comment says so), but the popover moves DOM focus onto the tree's roving `tabindex="0"` row when the panel opens. The trigger then advertises an `aria-activedescendant` it does not own — which APG forbids — and the trigger's own key handler stops receiving keys (the tree's does instead). | Measured: `DzTreeSelect.Accessibility` asserted `expect(trigger).toHaveFocus()` after ArrowDown and got back the `[data-dz-tree-row]` for `Fruit`. | **Medium.** Functionally the keyboard flow still works (the tree handles the keys and re-emits its active key, so `aria-activedescendant` does follow), which is why it has never been noticed. Pick one mechanism. Route to N1-O3. The story now asserts the observable outcomes and explicitly does not pin where focus sits. |
| **D11** | `DzDropdownMenu` | **Dangling `aria-controls`.** While the menu is open the trigger advertises `aria-controls="reka-dropdown-menu-content-v-1"`, but no element in the document carries that id — axe's `aria-valid-attr-value`, and an AT user following the reference finds nothing. | Measured: `DzDropdownMenu.States` asserted `document.getElementById(trigger.getAttribute('aria-controls'))` contained the `role="menu"` element and got `null`. | **Medium.** Invisible to the current gate only because every dropdown story's `play()` ends with the menu closed, so the axe sweep never sees the open state — which is itself worth fixing. Route to N1-O3. The story now asserts `aria-haspopup="menu"` plus a visible `role="menu"` instead. |

---

## 4. Validation ladder

Tooling failures and component failures are reported separately, per
`<repo_conventions><validation>`.

### 4a. The ladder as the task specifies it

`yarn validate:all` (typecheck + lint + 26 validators) was run to completion as well, and
is **EXIT 0 — all 27 links green**. Two links needed work beyond authoring the stories,
and both are recorded here rather than buried:

- `validate:capability-matrix` went **stale** the moment the story corpus changed, because
  the matrix consumes the story-DoD report as one of its four inputs. Regenerated with
  `yarn generate:capability-matrix` (a class-R pure regeneration per the N0-05
  classification); the run-record inputs it reads — `test-results/matrix-report.json`,
  `known-failures.json`, `engine-exceptions.json`, `perf/baselines.json` — were MD5-checked
  before and after and are byte-identical (§4f).
- `validate:tokens` flagged one **false-positive-shaped-but-real** hit: the string `#fea`
  in `DzMention.RealWorldCommentComposer` (a hashtag search query) parses as a
  three-digit hex colour. Changed the query to `#feat`, which still matches `feature`. No
  suppression marker was added — the rule was satisfied, not silenced.


| # | command | result |
|---|---|---|
| 1 | `yarn validate:story-dod` | **PASS** — every enforced check green; reported items 366 → **314** |
| 2 | `yarn validate:story-dod-tiers` | **PASS** — 0/0, 0/0, 0/0 after `--write` |
| 3 | `yarn validate:story-status` | **PASS** — every `Core/<Family>/<Component>` story carries exactly one `status:*` tag |
| 4 | `yarn storybook:build` | **PASS** — **24.15 MB / 25 MB budget** (422 files, 397 JS chunks) |
| 5 | `yarn storybook:test` | **51/51 new stories pass**; **3 pre-existing failures** in files this task never touched (§4c). Exit 1 because of those three. |
| 6 | `yarn typecheck` | **PASS** — 0 errors, 0 output |
| 7 | `yarn lint` (`--max-warnings 0`) | **PASS** — 0 errors, 0 warnings, 0 output |

### 4b. `validate:story-dod` — the advisory report, before → after

| check | level | before | after | Δ |
|---|---|---|---|---|
| `controls-driven` | enforced | 161/161 | 161/161 | — |
| `controls-live` | reported | 134/161 | 134/161 | — |
| `gallery` | reported | 14/169 | 14/169 | — (not tier-required; deliberately untouched) |
| **`states`** | reported | **27/62** | **57/62** | **+30** |
| `dark-mode` | enforced | 169/169 | 169/169 | — |
| **`accessibility`** | reported | **103/169** | **114/169** | **+11** |
| **`real-world`** | reported | **99/169** | **109/169** | **+10** |
| `play` | reported | 156/169 | 157/169 | +1 |
| `description` | enforced | 169/169 | 169/169 | — |
| **total reported items** | | **366** | **314** | **−52** |

The residual `states` 5, `accessibility` 55 and `real-world` 60 are all **Tier A**
components, which the triage rule does not ask for them. They are advisory and stay
visible; nothing was waived.

### 4c. `yarn storybook:test` — Storybook interaction + a11y sweep

`vitest run --project=storybook` (browser mode, Playwright **chromium**, headless). This
runs every story's `play()` **and** the axe sweep, at `test: 'error'` for the four
families that have opted in (buttons, cards, media, overlays) and report-only elsewhere.

**Final run (the fourth, after every correction below and after the `validate:tokens`
fix): `Test Files 3 failed | 165 passed (168)` · `Tests 3 failed | 1437 passed (1440)` ·
105.56 s wall.** Exit 1, entirely on the three pre-existing failures below. The run
sequence was 10 failures → 5 → 3 → **3**, and the last two runs are identical, so the
residual three are stable and independent of this task's edits.

| result | count |
|---|---|
| **new stories from this task** | **51 / 51 pass**, including every axe-enforced overlay, button and media story |
| component failures caused by this task | **0** |
| pre-existing component/story failures, unrelated to this task | **3** |

#### The three failures, and why none of them is this task's

None of the three files appears in this task's diff. All three are red at HEAD; they had
simply never been seen, because the lane could not start (§4e T1).

| story | failure | root cause (evidence) |
|---|---|---|
| `forms/DzFormField.stories.ts > Invalid With Error` | `Unable to find an accessible element with the role "alert"` | `DzFormMessage.vue` L8 states in its own header comment: *"The error is announced with `aria-live="polite"` and **not** `role="alert"`."* The component was changed in `e986952` ("Every form control binds, describes and reveals itself the same way"); the story's `canvas.getByRole('alert')` was not. Story drift, ~13 commits old. |
| `forms/DzFormParts.stories.ts > Invalid with Error Message` | `Unable to find role="alert"` | Same root cause, same commit. |
| `compositions/i18n/Localisation.stories.ts > Translated` | `TypeError: Cannot read properties of undefined (reading 'find')` at `DzSelect.vue:199` | The story renders `<DzSelect :options="options" …>` (L90) but `DzSelect` takes **`items`**, so `props.items` is `undefined` and `selectedLabel`'s `props.items.find(…)` throws while `SelectTrigger` renders. A stale prop name in the story. |

These are **reported, not fixed**: they are component/story defects in files outside this
task's scope, and two of them require deciding whether the *component* or the *story* is
right about `role="alert"` (`DzFormMessage`'s comment argues the component is, which
would make it a story fix — but that is the form-a11y owner's call, and it interacts with
D4/O5's question about opting `forms` into `a11yError`).

#### What it took to get the 51 green

The first run that could start reported 10 failures: 3 pre-existing (above) and **7 in
the new stories**. All seven were assertions I had written from reading the source rather
than from observing the browser, and every one of them was corrected by making the story
assert what the component *actually* does — not by relaxing the story:

| story | first-run failure | correction |
|---|---|---|
| `DzDataView.States` | `getByText('No products found')` matched twice | the empty title is echoed by the polite live region; assert the unique empty *description* instead, and keep the separate live-region assertion |
| `DzInfiniteScroll.States` | `/loading more/i` matched three times | `Loading more items` is in both the live region and the spinner's `sr-only` label; assert the visible `Loading more…` exactly |
| `DzTable.States` | expected 2 rows, found 1 | **a real finding**: `DzTableBody` *replaces* its rows with `aria-hidden` skeletons while loading, so my "the rows stay readable underneath" was wrong. The story now asserts the truth — the only row left in the a11y tree is the header, skeletons are `aria-hidden`, and `INV-1001` is gone — which is the better contract anyway |
| `DzMention.RealWorldCommentComposer` | the composer did not reset | **D8** — bind the contract-conforming default `v-model` |
| `DzPersonaSelector.States` | a `Clear selection` button was enabled inside a disabled control | **D9** — assert the two controls that *are* disabled, plus "nothing enabled here is tabbable" |
| `DzTreeSelect.Accessibility` | focus was on a tree row, not the trigger | **D10** — assert the observable keyboard outcomes and explicitly stop asserting where focus sits |
| `DzDropdownMenu.States` | `document.getElementById(aria-controls)` → `null` | **D11** — the trigger's `aria-controls` names an id that is never rendered; assert `aria-haspopup="menu"` + a visible `role="menu"` instead |

**D11** joins the defect list: `DzDropdownMenu`'s trigger advertises
`aria-controls="reka-dropdown-menu-content-v-1"` while the menu is open, but no element in
the document carries that id — a dangling `aria-controls`, which is axe's
`aria-valid-attr-value`. It is invisible to the gate today only because every dropdown
story's `play()` ends with the menu closed, so the axe sweep never sees the open state.
Severity **medium**, route to N1-O3; it is a Reka/`DzDropdownMenuContent` wiring question,
not a story fix.

### 4d. `yarn lint`

**PASS** — `eslint packages/ apps/ --max-warnings 0`, exit 0, 0 lines of output. Every
new story was written to house style and `npx eslint packages/core/stories --fix`
reported nothing to change on the final pass.

`yarn typecheck` (`vue-tsc`) — **PASS**, exit 0, 0 errors, run after every batch of
stories and again after the seven corrections above.

### 4e. Tooling failures (separate from component failures)

| # | failure | disposition |
|---|---|---|
| **T1** | `yarn storybook:test` **could not start at HEAD**: `Error: createDzupResolution: no 'packages/' directory under …/internal-dev/ui`, thrown while vitest was loading `apps/storybook/vitest.config.ts`. Pre-existing, unrelated to this task's stories, and it makes the whole Storybook interaction lane unrunnable. | **Fixed** (§3a): `resolve(dirname, '../../..')` → `resolve(dirname, '../..')`. Reported here because a mandated gate that has never been able to start is a finding in its own right — it means every `play()` in the repo has been unverified by this lane for as long as the bug has existed. |

### 4f. Run-record integrity

`test-results/matrix-report.json` (git-ignored, the only copy of the chromium
browser-matrix run) was snapshotted before this task and re-verified after every step:

| moment | MD5 |
|---|---|
| task start | `15b4139314e12569cc160609fa0692a3` |
| after ceiling write + `storybook:build` | `15b4139314e12569cc160609fa0692a3` |
| after three full `storybook:test` runs + the final `storybook:build` | `15b4139314e12569cc160609fa0692a3` |

No browser, perf or AT run record was written, emptied or overwritten by this task.

---

## 5. Ratchet movements

| ratchet | source of truth | old | new | note |
|---|---|---|---|---|
| **story-DoD tier-required — `states`** | `packages/tooling/src/quality/story-dod-ceiling.json` | 30 | **0** | lowered with `--write` after the count reached 0 |
| **story-DoD tier-required — `accessibility`** | same | 11 | **0** | " |
| **story-DoD tier-required — `real-world`** | same | 10 | **0** | " |
| **story-DoD tier-required — total** | same | **51** | **0** | the P5-02 close-out |
| story-DoD advisory reported | `validate:story-dod` | 366 | 314 | not a ceiling; reported for context |
| unclassified ownership symbols | `unclassified-ceiling.json` | 29 | 29 | untouched |
| public components without anatomy | `component-ownership` gate | 136 | 136 | untouched (**136, not 137** — the N0-05 correction stands) |
| browser measured failures (chromium) | `e2e/matrix/known-failures.json` | 46 | 46 | untouched, file MD5 unchanged |
| ADR registry-only citations | `adr-registry.json` | 14 | 14 | untouched |
| AT cells executed | `e2e/at-matrix/index.json` | 0/534 | 0/534 | untouched |

### Capability-matrix cell movement (regenerated, not re-run)

The matrix's `story-dod` input moved, so 52 cells changed state from `unrun` to `pass`.
No browser, AT or perf cell moved — those are class-X run records and were untouched.

| tier | pass (before → after) | present | stale | unrun (before → after) | excepted |
|---|---|---|---|---|---|
| A | 106 → 106 | 160 | 0 | 79 → 79 | 4 |
| B | **279 → 296** | 264 | 0 | **365 → 348** | 9 |
| C | **111 → 146** | 99 | 10 | **154 → 119** | 0 |
| D | 7 → 7 | 10 | 1 | 1 → 1 | 2 |
| **total** | **503 → 555** | 533 | 11 | **599 → 547** | 15 |

+52 pass / −52 unrun, which is exactly the 52 story-DoD report items this task closed
(51 tier-required + 1 `play`). The 11 stale cells are the pre-existing `perf-baseline`
ones N0-05 recorded as D3 — unchanged, and not this task's to clear.

### Storybook bundle size against the 25 MB budget

| | total on disk | files | JS chunks | budget | headroom |
|---|---|---|---|---|---|
| before (N0-05 handoff / task brief) | 23.50 MB | — | — | 25 MB | 1.50 MB |
| **after (this task)** | **24.15 MB** | 422 | 397 | 25 MB | **0.85 MB** |

**+0.65 MB for 51 stories** — 51 new story exports plus their play functions, at roughly
13 KB each on disk. `yarn workspace @dzup-ui/storybook check:size` reports
`Storybook build 24.15 MB within budget 25 MB`. No story was deleted to make room.

> **Budget warning for the next packet.** 0.85 MB of headroom is about 65 more stories at
> this task's density. `gallery` is the largest remaining advisory category at **155**
> open items; closing it inside the current budget is not possible without either raising
> the budget or code-splitting the two largest artifacts (`assets/jsx-*.js` 4.14 MB and
> `sb-manager/globals-runtime.js` 3.14 MB, neither of which is story content). Flagged
> for the owner, not decided here.

---

## 6. Items that could not be authored

**None.** All 51 tier-required items were authored as real, asserting stories. No
impossibility report is owed, no item was waived, no ceiling was raised, no component's
tier was lowered, and no check was re-levelled from `report` to anything weaker.

Three items came close enough to be worth recording, because each was resolved by
writing the story **around** a component defect rather than by excepting the item:

| item | complication | how it was resolved without weakening the rule |
|---|---|---|
| `DzTree [states]` | tree-level `disabled` does not actually disable anything (D1) | the story shows all four states and asserts the root's `data-state` resolution plus the per-node behaviour, both of which are real; the propagation gap is reported, not asserted as correct |
| `DzResizable [states]` | group-level `disabled` does not reach the handles (D2) | the story sets `disabled` on the group **and** the handle — the combination that actually freezes the layout — and its description says why; the gap is reported |
| `DzMention [states]` | the `loading` prop is dead (D3) | the loading state is reached through a pending async resolver, which is the only path that works; the story's description records that the prop is inert and points at this handoff |

---

## 7. Unresolved owner decisions

| # | decision | evidence | who needs to call it |
|---|---|---|---|
| **O1** | **D1/D2 — should container-level `disabled` propagate?** `DzTree` and `DzResizable` both accept `disabled` on the container and both stop at a `data-` attribute. Two ways out: propagate it through the existing context (a behavioural change, and `DzTree`'s current `Disabled` story documents today's behaviour), or narrow the prop's documented meaning to "presentational only" and add the missing per-item guidance. | §3b D1, D2 | Component owner + ADR-19 reviewer (the styling contract is what `data-disabled` is for). |
| **O2** | **D3 — who owns `DzMention`'s `loading`?** Rename the internal ref and make the prop authoritative (a consumer can force the busy state), or delete the prop and document that loading is resolver-driven. Either is a public-API change. | §3b D3 | N5-01 / N5-02 lane (0.x policy governs whether removing a prop is legal). |
| **O3** | **D4 — nested interactive controls in `DzCascader` / `DzTreeSelect` triggers.** Fixing it means moving the clear/remove affordances out of the `role="combobox"` button, which changes DOM structure and possibly the `#value` slot contract. It is also the reason `forms` cannot safely opt into `a11yError` today. | §3b D4 | N1-O3 (WCAG lane) + component owner. |
| **O3b** | **D11 — `DzDropdownMenu`'s dangling `aria-controls`.** Either render the id Reka's trigger points at, or stop emitting `aria-controls`. Related: every overlay story closes its surface before the axe sweep runs, so no axe rule is ever evaluated against an *open* overlay — worth a deliberate "one story per overlay leaves it open" convention. | §3b D11, §4c | N1-O3 + overlay owner. |
| **O4** | **D7 — focus restoration in `useFocusTrap`.** Adding restore-on-deactivate is a composable-wide behaviour change affecting every consumer, not just `DzTour`. | §3b D7 | N1-O3 (WCAG 2.4.3) + composable owner. |
| **O5** | **Should `forms`, `data`, `navigation` and `layout` opt into `a11yError`?** Four families now have tier-required `Accessibility` stories but still run axe at `test: 'todo'`, so those stories prove keyboard behaviour and ARIA wiring by assertion while the axe sweep beside them is advisory. D4 is the known blocker for `forms`. | `_shared/a11y.ts`; `a11yError` is present in buttons, cards, media, overlays only | Owner, once D4 is closed. |
| **O6** | **Storybook budget vs the 155 open `gallery` items.** 0.85 MB of headroom remains. Closing `gallery` at this density does not fit. | §5 | Owner: raise the budget, split the non-story bundles, or leave `gallery` open (it is not tier-required). |
| **O7** | **T1 — has the Storybook interaction lane ever run in CI?** The config bug meant `yarn storybook:test` could not start. If CI runs it, CI has been green on a startup error; if CI does not run it, every `play()` in the repo has been unverified. | §4e T1 | Release/CI owner. Worth a CI-config audit before N5. |

---

## 8. Ranked next packet

1. **N1-O3 (WCAG lane)** — now unblocked and better armed. It inherits six measured
   a11y defects from this task (D4 nested-interactive ×2, D7 focus restoration, D10
   double focus mechanism, D11 dangling `aria-controls`) on top of its own 28
   target-size + 18 reflow failures, and the 11 new `Accessibility` stories give it
   per-component keyboard evidence to regression-test the fixes against.
2. **N1-O2 (Firefox/WebKit matrix)** — the 51 new stories are new matrix targets;
   `e2e/matrix/targets.generated.ts` should be regenerated **before** the engines run so
   the new stories are in-lane rather than silently absent. D5 (`:ariaLabel`) is an
   engine-sensitive defect that lane will actually measure.
3. **T1 follow-up (CI audit)** — establish whether the Storybook interaction lane runs in
   CI at all. Cheap, and it decides how much the green run in §4c is worth.
4. **D1/D2 propagation fix** — small, self-contained, and it removes two "documented but
   untrue" states from the catalogue.
5. **N2-S1 (anatomy + `ui` rollout)** — `DzTable.States` is now the worked example of a
   story written against a declared anatomy rather than against classes; the other 12
   alignment components can copy its shape as they declare theirs.
6. **`gallery` (advisory, 155)** — only after O6 is decided. It is the largest number
   left and the least valuable to close.

### Maturity level reached

`aggregate-qualified (locally)` for the story corpus. Per `<evidence_rules>` this is a
**locally qualified** run on a docs-dirty worktree: it is not CI, release or production
evidence, and it produces **no** browser-matrix, AT or perf evidence. The chromium
Storybook interaction run in §4c is a single-engine local run; Firefox and WebKit remain
unrun and are N1-O2's to execute.
