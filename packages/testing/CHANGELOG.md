# @dzup-ui/testing

## 0.2.0

### Minor Changes

- 7edd39a: `expectKeyboardContract` can now assert the shape of a tab order

  A new `tabStops` option, for the one row the existing options cannot evidence: a
  declared `Tab`.

  ```ts
  expectKeyboardContract(wrapper, anatomy, {
    tabStops: { of: '[role="checkbox"]', expect: 'each' },
  })
  ```

  **Why neither existing option works.** `handled: ['Tab']` asserts the component
  called `preventDefault()`, which is what a focus **trap** does and the opposite of a
  row that says focus moves. `platform: ['Tab']` fails, deliberately: the table of
  elements whose documented behaviour is a given key credits activation and text entry
  only, **never navigation**, because `Tab` is not a behaviour of an element — it is
  the document's focus order, and crediting any focusable node for any `Tab` row is
  the verdict this check exists to refuse.

  **A `Tab` row makes one of two opposite claims**, and telling them apart is the
  whole content of the row:

  | The row says                                | Pass             | Mechanism                                                          |
  | ------------------------------------------- | ---------------- | ------------------------------------------------------------------ |
  | "each box in the group is its own tab stop" | `expect: 'each'` | every node in the order                                            |
  | "the toolbar is one tab stop"               | `expect: 'one'`  | a roving `tabindex`, which takes the siblings **out** of the order |

  An audit found the first of those published against a citation that proves the
  second, so a single `Tab` key list could not have told them apart either.

  **What it asserts**, and it fails on any of them: `Tab` is in the declared contract;
  the selector matches at least two nodes, because a claim about order over one node is
  not a claim; exactly all of them or exactly one is in the tab order; and the key is
  **driven** — a cancelable `Tab` keydown is dispatched and the component must not have
  consumed it. The root counts when it matches the selector, which is how a roving
  focus group built on the container (Reka's `RovingFocusGroup` puts `tabindex="0"` on
  the group and `-1` on every item) reads as one tab stop rather than as none.

  It does not prove the browser's order matches DOM order — `tabindex` above zero,
  `inert` and portals all reorder it, and that belongs in a browser lane. Existing
  calls are unaffected; the option is opt-in.

- 2d51eec: **The security fixture corpus is now a published format, not just TypeScript to read: JSON Schema, a stricter checker, and a fixture for peers installed at the wrong version.**

  `@dzup-ui/testing/security-corpus` moves to **schema 1.1.0**. Until now the only
  way to learn the format was to read the source. A second repository had no schema
  to validate its fixture files against, so "shared format" was a promise nothing
  checked.

  **New: JSON Schemas shipped beside the data.** `security-corpus/security-corpus.schema.json`
  and `security-corpus/peer-compatibility.schema.json` (draft-07) are in the tarball.
  Their paths are exported as `SECURITY_CORPUS_SCHEMA_FILE` and
  `PEER_COMPATIBILITY_SCHEMA_FILE`. Point a fixture file's `$schema` at one and your
  editor validates it as you type.

  **Vocabulary additions:**
  - sinks `markdown` and `mermaid-svg`. They use the same spelling as the sanitizer
    seam's `DzSanitizeSink` contexts, so Markdown or Mermaid source is never sent to
    a raw-HTML sink, where it would prove nothing.
  - outcome `admitted`: the value reaches the sink live because a named policy
    deliberately allows it (an internationalized hostname, a document under the size
    ceiling). It is not a neutralization, and like `inert` it requires a rationale
    longer than 80 characters.
  - `extensions["<reverse-dns namespace>"]` on files and fixtures, for data that
    only one consumer understands.

  **New: peer-compatibility fixtures.** `PeerCompatibilityFixture` describes a
  declared peer that is `absent`, `installed` or **`incompatible`**, and the
  diagnostic a consumer must then see (`install` · `validate` · `build` · `runtime`,
  naming the peer). Load them with `loadPeerCompatibilityFixtures()`; validate your
  own with `checkPeerCompatibilityFile()`. The first incompatible record is Vue 2.7
  installed against `vue ^3.5.0`.

  **Breaking (minor, under `packages/contracts/VERSIONING.md`):** `checkCorpusFile()`
  now refuses some files it used to accept:
  - **Keys the format does not define.** Move consumer-specific data under
    `extensions`.
  - **Ids that are not `{category}.{family}.{case}` in lowercase kebab segments.**
  - **An `inert` claim with a rationale of 80 characters or fewer.** The README
    already stated this rule, but only this package's own spec enforced it.

  `SecuritySink` and `NeutralizationOutcome` also gain values, so an exhaustive
  `switch` over `fixture.required` needs the new cases. No existing fixture id,
  payload or required outcome changed. The 34 fixtures only gained `$schema` and
  the new `schemaVersion`.

### Patch Changes

- 7edd39a: `expectKeyboardContract` can assert a platform-owned key, and a `when` may name a prop

  `expectKeyboardContract` was exported and **called by no component spec**. Wiring
  it into eight of them found two things the helper could not express, so it gains two
  options. Both are additive: an existing call behaves exactly as it did.

  **`platform: readonly string[]`** — keys the caller asserts are owned by a native
  element _in the rendered tree_. For each one the check fails unless the mounted DOM
  contains an element whose documented HTML behaviour is that key: a `<button>`,
  `<summary>` or `<select>` for Enter and Space, an `<a href>` for Enter, a checkbox
  or radio `<input>` for Space, a text field for a character, a `<dialog>` for Escape,
  or a node carrying an activation role.

  This is the half of a keyboard contract that only a runtime check can see. Four
  components in `@dzup-ui/core` — `DzCheckboxGroup`, `DzCollapse`, `DzFieldArray`,
  `DzRadioGroup` — declare a key whose receiving node is the _consumer's_: the
  component is a `<div>` and a `<slot />`, so no source scan can say whether anything
  answers the key, only a spec that mounts it with real children.

  It is **not** interchangeable with `handled`, which asserts that the component
  called `preventDefault()`. `handled` is right for a key the component overrides and
  wrong for a platform key: Reka's `CheckboxRoot` and `RadioGroupItem` prevent `Enter`
  only, because Space on a `<button>` _is_ the activation and preventing it would
  break the toggle. Like the static checker, `platform` credits activation and text
  entry only and **never navigation** — a declared arrow is a claim about roving
  focus, and roving focus always takes code.

  **`conditions: readonly string[]`** — single-word `when` values that are legitimate
  contexts rather than typos, in practice the component's own prop names. The
  coherence check calls a single lowercase `when` that is neither a declared part nor
  a declared state _"almost always a typo"_, and **twelve values in live use**
  (`clickable`, `interactive`, `open`, `closable`, `dropzone`, …) are prop names. The
  rule had never been called, so neither half was ever true; the first spec to call it
  failed on arrival. The decision is that a `when` may name a prop, made sayable
  rather than by deleting the rule — the rule is the only thing between a published row
  and a context that does not exist. The failure message now says how to admit one.

  `keyboard.ts` also gains the unit spec it never had: 24 tests, pinning both new
  options in both directions, because an assertion helper that cannot fail is worse
  than no helper at all.

- 527dbd1: **A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**

  **WCAG 2.2 SC 2.5.7 Dragging Movements was measured as not met on three
  surfaces** — `DzResizable`, `DzSplitter` and `DzTable`'s column resize. All
  three were keyboard-operable, and a keyboard path satisfies SC 2.1.1, not this
  one: the criterion is about pointer input and asks for a single pointer without
  dragging. `DzTable`'s handle was the worst of them, because `@click.stop` sat on
  it and discarded the one plain press that might have been a non-drag path.

  Each of the three now carries a **stepper pair** — one control that shrinks, one
  that grows:
  - **Nothing moves until you reach for it.** The pair is absolutely positioned
    over the gutter (or, for a column, over the header cell) and rests fully
    transparent, so it occupies no layout and paints nothing: every splitter and
    every table header looks exactly as it did, and no consuming layout shifts.
    It is revealed by hovering the gutter, by focusing the separator, or by one
    tap on a device that has no hover. The **DOM** does gain two buttons per
    handle, so a consumer's own DOM snapshot of one of these three components will
    need re-recording — that is the one thing this change asks of you.
  - **It is the same step as the keyboard.** On a splitter, a press dispatches the
    very `keydown` the arrow keys already drive, so the step is `keyboardResizeBy`
    and `Shift` is still the full sweep. On a column, both paths call one
    function: 8 px, or 24 px with `Shift`.
  - **There is no prop to switch it off.** A conformance claim a consumer can
    withdraw is not one worth publishing.
  - Each control is **24 × 24 CSS px**, the SC 2.5.8 floor, measured in chromium,
    firefox and webkit.

  New `data-part` names you can style and test against: `step-decrease` and
  `step-increase` on the resizable, splitter and table anatomies. `DzTable`'s
  column-resize handle also gains `data-part="separator"` — it has carried
  `role="separator"` all along — plus `aria-valuenow` and `aria-valuemin`, so a
  screen reader is told the width it is changing.

  Four catalog keys, so nothing is hard-coded English:
  `DzResizableHandle.shrinkPane`, `DzResizableHandle.growPane`,
  `DzTableCell.narrowColumn`, `DzTableCell.widenColumn`.

  **The packages now declare a supported-browser floor.** All six published
  packages carry a `browserslist` key naming the same range. It is not a
  preference: it is the lowest range the published CSS can be generated for, so a
  declaration below it would be a promise the build could not keep. The
  browser-support evidence page reads it out of the tree and prints, beside it,
  the engines the matrix actually drives — a browser the floor admits and no lane
  measures is named as supported by declaration and nothing more.

  This is a `patch` under `packages/contracts/VERSIONING.md`: every part, key and
  attribute above is **added**, none is removed, renamed or narrowed, and §3's
  accessibility carve-out puts a corrected rendered accessibility attribute in the
  patch position deliberately — we would rather ship the fix than hold it for a
  range bump.

- 4c9fb7a: **Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**

  Until now the only sanctioned way to restyle a dzup-ui component was a design
  token or the `class` on its root. Anything else — a spinner inside a button, the
  error message under an input, a dialog's backdrop, a select's portaled listbox —
  was reachable only by writing a descendant selector against class names that
  `tailwind-variants` generates and is free to change. Those selectors worked
  until they didn't, and nothing told anyone when they stopped.

  ADR-19 (`docs/adr/ADR-19-public-styling-contract.md`) makes that surface
  explicit. This release lands the machinery and the first five components.

  **New in `@dzup-ui/contracts`**
  - `ComponentAnatomy` — a component's declared parts, states, component tokens,
    recipe axes and risk tier.
  - `ANATOMY_PART_VOCABULARY` — the shared part names, so `content` means the same
    thing on a dialog and on a popover.
  - `AnatomyPart<A>` and `UiOverrides<A>` — derived types that make a part name a
    compile error rather than a class that lands nowhere.

  **New in `@dzup-ui/testing`**
  - `expectAnatomy(wrapper, anatomy)` — asserts the rendered DOM emits every
    declared part exactly once (or is declared optional) and no undeclared one.
    Runner-independent, and it takes the anatomy structurally, so the package
    needs no dependency on `@dzup-ui/contracts`.

  **New in `@dzup-ui/core`: `data-part` and `ui` on five components**

  | Component          | Parts you can now address                                                                                           |
  | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
  | `DzButton`         | `root`, `spinner`                                                                                                   |
  | `DzInput`          | `root`, `control`, `input`, `prefix`, `suffix`, `spinner`, `clear`, `error`                                         |
  | `DzSelect`         | `root`, `trigger`, `icon`, `content`, `viewport`, `input`, `item`, `item-indicator`, `item-label`, `empty`, `error` |
  | `DzDialogContent`  | `overlay`, `content`, `header`, `viewport`, `footer`                                                                |
  | `DzTable` (family) | `root`, `content`, `title`, `header`, `body`, `row`, `cell`, `footer`                                               |

  ```vue
  <!-- before: a selector against a generated class, and a prayer -->
  <style>
  .my-form .inline-flex > svg {
    height: 24px !important;
  }
  </style>

  <!-- after -->
  <DzButton loading :ui="{ spinner: 'h-6 w-6' }">Save</DzButton>
  <DzSelect :items="items" :ui="{ content: 'max-h-40', item: 'py-3' }" />
  <DzDialogContent :ui="{ overlay: 'backdrop-blur-sm' }" />
  ```

  Overrides merge through `cn()` (clsx + tailwind-merge), so a conflicting utility
  replaces the component's own rather than fighting it. **No `!important` is
  needed, and Playwright asserts that in a real browser** rather than the docs
  asserting it in prose.

  **`DzDialog` declares `parts: 'none'`** — it wraps Reka's `DialogRoot`, which is
  a provider and renders no element. That is an answer, not an omission: the
  dialog's surface is declared on `DzDialogContent`, where the nodes are.

  **Nothing is removed, and every existing override keeps working.**
  - `class` lands exactly where it always did — the button root, the input's
    visual field, the select trigger, the dialog panel, the table's scroll
    container. `ui.root` is the new way to reach an outer node.
  - `data-dz-dialog-overlay`, `data-dz-search-input` and `data-dz-no-results` are
    still emitted, now alongside `data-part` (dual-emit for one minor series;
    removing them needs a major).
  - `DzDialogContent`'s `overlayClass` still applies. It is deprecated in favour
    of `:ui="{ overlay: … }"`; both work, and `ui` takes precedence.

  **Two things this release deliberately does not claim**

  `DzSelect` and `DzTable` declare `componentTokens: []`, because they own no
  `--dz-select-*` or `--dz-table-*` custom property — they style from global
  semantic tokens. Declaring invented names would have documented override points
  that do not exist. Per-instance restyling of those two goes through `ui`.

  `DzButton` mirrors `data-tone` but not `data-variant` or `data-size`, though it
  declares all three recipe axes. Its contract spec asserts that gap rather than
  hiding it, so closing it is a visible change rather than a silent one.

  **138 of 143 public components have not declared an anatomy yet.**
  `yarn validate:ownership` reports the number against a ceiling that only
  ratchets down, and the Storybook docs say plainly, per component, when a
  component has not declared one.

- a01965f: **Components now declare what their keys do, and the documentation renders the table from that declaration instead of saying it has not been derived.**

  Until this release the library had no machine-readable keyboard contract. The one
  generated keyboard signal was the capability matrix's `keyboard-spec` cell, and
  that cell was a regular expression over the unit spec: it recorded _that_ some
  key was asserted, never _which_ key did _what_. So every one of the 144 generated
  component pages carried the sentence **"Not yet derived"** exactly where an
  accessibility reviewer looks first, and the only honest alternative would have
  been a hand-typed table that nothing could check and that would be wrong within
  a release.

  **New in `@dzup-ui/contracts`**

  `ComponentAnatomy` gains an optional `keyboard` field:

  ```ts
  export const anatomy = {
    parts: ['root', 'spinner'],
    states: ['idle', 'loading', 'disabled'],
    componentTokens: ['--dz-button-md-height'],
    keyboard: [
      { key: 'Enter', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
      { key: ' ', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
    ],
    riskTier: 'B',
  } as const satisfies ComponentAnatomy
  ```

  Each `KeyboardBinding` carries the key as `KeyboardEvent.key` spells it, any
  modifiers, the part or state it applies in, what it does, the WCAG success
  criteria it is the mechanism for, the APG pattern it implements, and whether it
  swaps meaning in a right-to-left document. `keyboard: 'none'` is an **explicit
  claim** that the component has no keyboard behaviour of its own — deliberately a
  different fact from the field being absent, and the two are never collapsed.

  **In `@dzup-ui/core`:** 104 components declare a contract — 393 bindings across
  85 components, plus 19 that declare `'none'`.

  **New in `@dzup-ui/testing`:** `expectKeyboardContract` / `checkKeyboardContract`
  hold a rendered component to its declaration — that every binding's context names
  a part or state the component actually declares, that no key is declared twice,
  that nothing contradicts the component's own RTL contract, and that something in
  the tree can receive a key at all.

  **What you get as a consumer.** Every component page now publishes a real
  keyboard table with WCAG and APG references per row, and the components that have
  not declared one say _"not declared"_ rather than implying they have no keyboard
  behaviour. The same declaration is what the manual screen-reader scaffolds cite,
  so a tester drives the component's promises rather than the pattern's from
  memory.

  **Two things this release makes visible rather than fixes.** `DzMenu` and
  `DzSidebar` are assigned the APG `menu` and `treeview` patterns but implement
  neither pattern's keyboard — their items are links and buttons in document order
  with no roving index — and their declarations now say so. And because
  `keyboard-spec` is measured against the declared contract instead of against any
  key at all, the number of components whose spec exercises everything they promise
  is **5**, not the 29 the old presence test reported.

- c954da0: **Expose the built `@dzup-ui/testing/resolution` entrypoint for checkout co-development.**

  The published testing package now exports `createDzupResolution` and its types
  through built JavaScript and declarations. External build configurations can
  import this public subpath instead of the private, source-only
  `@dzup-ui/tooling/resolution` entrypoint. Existing private tooling imports remain
  compatible; the resolution algorithm is unchanged.

  This is a Node build-configuration helper. It requires an explicit absolute
  dzup-ui checkout root; `externalized` mode also requires the selected packages
  to be built. It does not install packages, build a checkout, or establish npm
  registry availability. Applications consuming installed packages should use
  their native package exports without checkout aliases.

- 4c9fb7a: **Components lay out, navigate and point the right way in a right-to-left document — and say so in a form something can check.**

  `DzProvider` has resolved `dir` since the previous release. What it could not fix
  is CSS: **55 lines across 26 variants files used physical `left`/`right`
  utilities**, so an Arabic application got a mirrored document with borders,
  padding and text alignment still pinned to the physical left. They are logical
  now — `ms`/`me`, `ps`/`pe`, `border-s`/`border-e`, `rounded-s`, `text-start`.

  **`DzTable` is the clearest case:** its header and body cells were `text-left`,
  so every cell in an Arabic table aligned against the wrong edge while the table
  itself mirrored.

  **Tab keyboard navigation followed the keycap, not the reading order.** APG's
  tabs pattern is written as _previous_ and _next_; `useTabs` hard-coded
  ArrowRight as next. In Arabic the next tab is to the **left**, so a user
  pressing the key that points at the next tab got the previous one. The
  horizontal keys now follow the direction. The vertical keys deliberately do not:
  `dir` is about the inline axis, and ArrowUp is ArrowUp in every language.

  **New: an `rtl` field on component anatomy** (`@dzup-ui/contracts`), with three
  axes because they fail independently:

  ```ts
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] }
  ```

  - `mirrors` — `layout` or a deliberate `none`
  - `keyboard` — whether ArrowLeft/ArrowRight exchange meaning
  - `icons` — parts whose icon carries direction and mirrors with the layout

  **New: `yarn validate:rtl`.** A component declaring `mirrors: 'layout'` may not
  use a physical utility in its variants. Genuinely physical cases say so in the
  file with a `rtl-physical-ok` comment and a reason — source code (a gutter that
  stays left because code reads left-to-right), `align="left"` on `DzHeading` and
  `DzText` (an author naming a side, not asking for the start edge), and
  `DzSheet`'s `side` (whether a sheet mirrors is a product decision, recorded
  rather than taken).

  **New: `packages/core/docs/rtl-matrix.md`**, generated from the declarations by
  `yarn generate:rtl-matrix` so the table cannot drift from them.

  **New in `@dzup-ui/testing`:** `expectRtl`, `checkRtl`, `expectRtlComputed` and
  `forwardArrow`. `expectRtlComputed` **throws under jsdom rather than passing** —
  jsdom does no layout, so it cannot resolve a class-driven `margin-inline-start`,
  and a test that cannot check its claim should say so instead of going green.

  **New in Storybook: a Direction toolbar** that renders every story right-to-left
  under an Arabic locale, alongside the pseudo-locale toggle.

  **Coverage, stated plainly:** 7 components declare an RTL contract, because the
  field lives in the anatomy and only 7 declare an anatomy. The logical-property
  migration covered the whole catalog regardless. The two rollouts are the same
  rollout.

- 7edd39a: Publish a security-conformance runner, and extend the corpus for the Form System
  and Graph & Flow specs (TASK-S3-O3).

  The corpus has been a published **format** since TASK-R3-O4: one hostile input,
  and per sink kind the outcome that sink owes. A format is a description — any
  implementation of `DzSanitizerAdapter` can claim to honour it, and nothing
  checked. This makes it executable.

  **New subpath `@dzup-ui/testing/security-conformance`.** `runSecurityConformance(adapter, options)`
  takes any `DzSanitizerAdapter`-shaped object plus the versioned corpus and returns
  a per fixture × sink verdict report; `expectSecurityConformance(report)` throws
  with every failing cell in one message. Verdicts are **classes** (`blocked`,
  `escaped`, `stripped`, `passed-through`, `unchanged`), never output strings, so a
  DOMPurify patch release that changes whitespace does not turn the suite red.
  Which verdict satisfies which required outcome is a documented matrix rather than
  an ordering: escaping where stripping was required conforms and is reported
  `lossy`; stripping where escaping was required does not conform.

  **It fails closed.** A run with no adapter throws rather than reporting a clean
  result, and so does a run with no assertable cell — including the case where every
  fixture names only sinks a sanitizer does not guard. Every report carries a
  `failClosed` block whose four values are measured by actually doing the thing, so
  a suite cannot go green because it found nothing to test.

  **Five fixtures added** (34 → 39), from Form System spec doc 06 §10 and Graph &
  Flow spec doc 06 §"Security and trust boundary": a document-provided option label
  that is a template expression, renderer options spread onto an element as event
  attributes, a Markdown reference-link definition pointing at `javascript:`, an SVG
  label carrying `xlink:href="javascript:"`, and a 200-deep element nesting bomb.
  The last two are the first fixtures for the `mermaid-svg` and `markdown` sinks the
  format has carried since schema 1.1.0, and the nesting bomb is the first fixture
  for the `DzSanitizeLimits` depth ceiling.

  **A corpus _content_ version, separate from the schema version.**
  `SECURITY_CORPUS_VERSION` (1.1.0) versions what the fixtures say, with a content
  fingerprint recorded per release, so a fixture edit that forgets the bump fails
  locally instead of making a downstream recorded conformance result quietly wrong.
  `SECURITY_CORPUS_SCHEMA_VERSION` is unchanged at 1.1.0 — no field changed meaning
  and no vocabulary value was added.

  Additive: no existing fixture's id, payload or outcomes changed, no existing
  export changed, and nothing that used to be accepted is now refused. A `patch`
  per `required-export-subpaths.json`'s rule for adding a subpath, and per
  `packages/contracts/VERSIONING.md`, where `0.x` reserves `minor` for breaking
  changes.

- a01965f: **Your `class` beats `ui`, `asChild` has a published allowlist, and every component that puts your attributes somewhere unexpected now says so.**

  Three composition rules existed only as prose. Nothing checked them, and one of
  the three had shipped in two contradictory versions at once.

  **The `ui` merge order is now decided and published.** ADR-19 §5 said `class`
  and `ui` "merge through the same `cn()`" but never said in which order — and
  `cn()` is tailwind-merge, so the order _is_ the answer to which one takes
  effect. Measured across the catalogue, 5 components passed `ui` first and 74
  merge sites passed `class` first: the same two props produced opposite results
  on `DzButton` and `DzCard`, and nothing said which was right.

  The ratified order is **recipe → `ui` → your `class`**, exported as
  `UI_MERGE_ORDER`. Your `class` is merged last and wins a conflict. That is what
  ADR-19 §5 promises ("`class` keeps its meaning … nothing about existing usage
  changes") and it is the rule that survives composition: when an application
  wraps `DzButton` in its own `AppButton` and sets `ui` for a house style,
  `<AppButton class="w-full">` still works instead of sending that author to
  `!important`. Every component documentation page now states the order.

  The components that merge the other way are recorded with a downward-only
  ceiling rather than quietly fixed — re-ordering a merge changes rendered output,
  so it is sequenced separately. A **new** component that merges the wrong way
  fails the contract lane immediately.

  **`asChild` has an allowlist.** `asChild` makes _your_ element the rendered
  node, so every promise about a root — the `data-part`, the recipe class, the
  focus ring — stops applying there. `AS_CHILD_ALLOWLIST` now records the eight
  components that do it, which element kinds each accepts, what each guarantees
  (semantics, attributes, ref, disabled, keyboard) and why it is allowed. A
  component cannot add itself: the list lives in `@dzup-ui/contracts`, and source
  and list are checked against each other in both directions.

  It also records one defect rather than hiding it: **`DzButton`'s `asChild` prop
  is declared and does nothing.** The template never reads it. Use `as`, `href` or
  `to` for polymorphism — those work. The prop is now marked `unimplemented` so
  the gap is counted rather than discovered by a reader of the types.

  **Anatomies can declare where your attributes land.** The new optional
  `fallthrough` field answers "where does my `class` actually go?" for the two
  shapes where the answer is not "the one root":
  - **Multi-root components** — Vue cannot choose a target for a fragment, so the
    component does. `DzKnob`, `DzSidebar`, `DzLightbox`, `DzPopconfirm`,
    `DzTableRow`, `DzToastViewport` and `DzFieldArray` now each say which node
    they chose. `DzFieldArray` declares `target: 'none'`: it renders no element of
    its own, so a `class` you pass reaches nothing — a fact worth learning from
    the contract rather than from an empty DOM.
  - **Controls that re-point `class` inward** — on `DzSlider`, `DzRangeSlider`,
    `DzRating`, `DzDatePicker`, `DzDateRangePicker` and `DzMention` your `class`
    lands on an inner part, so a width you pass applies there rather than to the
    whole component. Nothing moved; the behaviour is unchanged and now documented.

  `DzPersonaSelector` additionally declares `delegatesTo: 'DzCombobox'` — it
  renders no element of its own, and its root _is_ a combobox.

  **New testing helpers.** `@dzup-ui/testing` gains `expectUiMergeOrder`,
  `expectFallthrough`, `expectAsChild`, `expectHandlerComposition` and
  `expectExternalWrite`, alongside `expectAnatomy` and `expectKeyboardContract`.

  `expectExternalWrite` is deliberately shaped as a _trace_ rather than a
  snapshot: it requires a reading taken after a user edit, because the defect it
  exists to catch only appears after one.

## 0.1.0 (2026-08-10)

### Minor Changes

- 573f2ae: Add a shared portal-placement contract and expose it on `DzDialogContent`,
  `DzConfirmDialog`, `DzSheetContent`, `DzPopoverContent`, `DzTooltipContent`,
  `DzDropdownMenuContent`, `DzContextMenuContent`, `DzSelect`, `DzMultiSelect`,
  `DzCombobox`, `DzCommandPalette`, and `DzLightbox`. Dialog content now identifies and
  supports customizing its single owned overlay, while production portal defaults
  remain unchanged.

  Publish `@dzup-ui/testing` with guarded DOM test-environment support so
  consumers can mount real Reka-backed components instead of replacing portals or
  design-system components with stubs.

### Patch Changes

- b357645: Prepare generated count projections before aggregate tests and make shared DOM animation-frame cleanup deterministic. Landing animation demos now release their timers and observers when unmounted.

## 0.1.0-alpha.0 (2026-08-08)

### Features

- Guarded DOM test-environment installer for Reka UI observer, scrolling, and
  pointer-capture requirements
- Optional Vitest setup entry for consumer test suites
