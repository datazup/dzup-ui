# ADR-19 — Public styling contract: layers, parts, states, and typed overrides

- **Status:** Proposed (TASK-OSS-P3-01, 2026-08-20)
- **Extends:** ADR-04 (token-only styling), ADR-17 (token source of truth)
- **Depended on by:** TASK-OSS-P3-02 (anatomy metadata), P3-03 (five pilots),
  P3-04 (styling cookbook), and every Pro styling slice
- **Does not change any code.** It fixes names so the packets that follow do
  not each invent their own.

## Context

The reassessment records finding **H3**: only a minority of Core components
expose consistent part/slot attributes, and the theming documentation reserves
component-level override behaviour for "a future decision". This is that
decision.

### What the repository actually does today (measured 2026-08-20)

| Mechanism | State on `main` @ `be76ddb` |
|---|---|
| Cascade layers | **Already shipped**, and named `dz-tokens, dz-base, dz-components` — declared twice, in `packages/tokens/src/generate.ts` (emitted into `tokens.css`) and in `packages/core/src/styles/base.css` (emitted into `core.css`) |
| `data-part` | **7 occurrences in 2 files** (`DzCodeBlock.vue`, `TeamMemberBadge.vue`) out of 143 public components |
| `data-slot` | 0 occurrences |
| `data-state` | 79 component files |
| `data-tone` / `data-disabled` / `data-invalid` / `data-loading` | 37 / 64 / 18 / 16 files |
| `data-size` / `data-variant` / `data-orientation` | 11 / 10 / 6 files |
| A typed per-instance override prop | **Does not exist** — no component takes `ui`, `parts`, or `classes` |
| DTCG token pipeline | **Does not exist** — see "Deferred" below |
| ADR documents on disk | **1 of 8.** `docs/adr/` held only ADR-18 before this file; ADR-02/04/07/12/15/16 have no document in this repo or in `workspace-docs/repos/dzup-ui/docs/adr/` (which holds ADR-17 alone). The registry is the table in `CLAUDE.md`. |

Three things follow from that table, and they are the reason this ADR is
shaped the way it is.

**1. The styling surface is already public, just undeclared.** `core.css` ships
rules like `.dz-panel[data-size=lg]`, `.dz-toolbar[data-variant=elevated]` and
`.dz-kbd[data-size=xs]` — the library's own stylesheet selects on these
attributes. They are load-bearing for anyone who reads the CSS, and nothing
declares them, tests them, or stops a component from dropping one.

**2. `data-state` is already used two incompatible ways.**
`packages/contracts/src/data-attributes.types.ts` types it as a closed union:

```ts
type DataState = 'open' | 'closed' | 'active' | 'inactive'
  | 'checked' | 'unchecked' | 'indeterminate' | 'selected'
```

`DzButton.vue` emits `:data-state="loading ? 'loading' : resolvedDisabled ? 'disabled' : 'idle'"` —
three values, none of them in that union. Neither is wrong; the premise is. One
global enum cannot cover a disclosure widget and a button, and pretending it
does means the type says nothing.

**3. Layer names cannot be treated as a blank page.** The reassessment's plan
spells the order `dz.reset, dz.tokens, dz.base, dz.components, dz.utilities,
dz.overrides`. `@layer dz.components` is a *sublayer named `components` inside a
layer named `dz`* — a different layer from the shipped top-level `dz-components`,
not a re-spelling of it. Adopting the dotted form is a rename of every layer the
library has already published.

## Decision

### 1. Token interchange: `--dz-*` is the contract; DTCG is a prerequisite packet, not a claim

`@dzup-ui/tokens` has **no DTCG pipeline**. Tokens are TypeScript maps under
`packages/tokens/src/{primitives,semantic,component}/`; `generate.ts` projects
them into `dist/tokens.css`, `dist/tokens.d.ts` and `dist/tailwind-theme.js`.
There is no `$value`/`$type` document anywhere in the package.

TASK-OSS-P3-01 carries the stop condition *"stop if the DTCG pipeline does not
exist in packages/tokens — report the gap as a prerequisite packet instead of
inventing a format."* It does not exist, so this ADR **does not** declare DTCG
the interchange authority. Instead:

- **The public token interchange surface is the generated `--dz-*` custom
  property set**, and it is stable. No renames in this program (ADR-04, ADR-17,
  and the program README's explicit non-goals).
- **The source of truth stays the TypeScript token maps.** Every published
  artifact is generated from them; none is hand-edited.
- **A DTCG emitter is a named prerequisite**, recorded below under "Prerequisite
  packet", and no downstream task may assume it. Anything a task needs *from*
  DTCG — a Figma round-trip, a third-party theme importer — is blocked on that
  packet, not on this ADR.

The rest of this ADR is independent of that gap: layers, parts, states and
typed overrides are decidable now, and they are what P3-02…04 actually consume.

### 2. Cascade layers: six slots, keeping the shipped hyphenated names

```css
@layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides;
```

Same six-slot ordering the reassessment asks for; the names extend the three
already published rather than replacing them.

Why not the dotted `dz.*` form: it renames `dz-tokens`, `dz-base` and
`dz-components`, which are emitted into two shipped stylesheets and are the
documented reason overrides work without `!important`. A rename would move every
existing rule into new layers, silently reorder any consumer sheet that already
writes `@layer dz-components { … }`, and buy nothing — sublayer grouping has no
use here, because the one thing consumers need (unlayered CSS beats all of it)
is true either way. A cosmetic rename that can break a consumer's cascade is not
a trade this program makes.

What each slot is for:

| Layer | Contents | Owner |
|---|---|---|
| `dz-reset` | box-model and document normalisation | Core (currently inside `dz-base`; moves in P3-03) |
| `dz-tokens` | `--dz-*` declarations, light and dark | `@dzup-ui/tokens` |
| `dz-base` | element defaults and shared interaction utilities (`.dz-focus-ring-*`, `.dz-disabled-*`) | Core |
| `dz-components` | per-component rules and component-token defaults (`.dz-panel`, `.dz-panel[data-size=lg]`) | Core, and Pro for its own components |
| `dz-utilities` | library-provided single-purpose helpers | Core |
| `dz-overrides` | **empty in the library — reserved for consumers** | consumer |

Rules that come with the order:

- **Nothing the library ships is unlayered**, with two recorded exceptions that
  must stay unlayered and must stay documented where they are written: the print
  block in `base.css`, and `.dz-prose` (rich-content typography, which must beat
  layered component styles the way consumer utilities do).
- **A consumer override needs no `!important`.** Unlayered CSS beats every
  layer, and `dz-overrides` beats every library layer, so both routes win.
  `!important` in library CSS is a defect; the two present today
  (`.dz-tab-close-btn`, `.dz-field-input-reset`) are recorded as debt for P3-03,
  not blessed.
- **Tailwind utilities a consumer generates stay outside these layers.** The
  library never emits the utility classes its `tv()` recipes name; the consumer's
  Tailwind build does. That is why `tv()` output cannot be "moved into
  `dz-components`" and why P3-03's requirement to do so applies to the library's
  own `.dz-*` rules only.

### 3. Parts: `data-part`, kebab-case, from a shared vocabulary

Every public component's stable anatomy nodes carry `data-part="<name>"`.

- **Names are kebab-case**, singular, describing the node's role, never its
  appearance: `content` not `white-box`, `trigger` not `top-button`.
- **The root node is always `data-part="root"`.** A component with exactly one
  addressable node declares `parts: ['root']`, not `parts: 'none'`; `'none'` is
  reserved for components that render no element of their own (renderless and
  pure-slot wrappers).
- **A shared vocabulary is used where it fits**, so that the same job has the
  same name across families:

  `root · trigger · content · viewport · overlay · panel · header · footer ·
  title · description · label · input · control · indicator · icon · prefix ·
  suffix · spinner · item · item-label · item-indicator · list · group ·
  group-label · separator · close · action · error · hint · empty · loader`

  A component may declare a name outside it when the vocabulary genuinely has no
  word for the node; the validator in P3-02 lists such names in its report so the
  vocabulary can grow deliberately instead of by accident.
- **Parts are a promise about identity, not about structure.** A part may move in
  the tree, gain a wrapper, or change element type in a minor release. Removing
  or renaming one is a breaking change.
- **Reka UI internals never become parts.** A node that exists only because Reka
  renders it is not addressable; if a consumer needs it, Core wraps it in a node
  of its own and names that. This is the P3-03 stop condition, stated here so it
  is a rule rather than one task's caveat.

### 4. States: a per-component `data-state` enum plus presence-only booleans

- **`data-state` is an enum declared per component**, in its anatomy (P3-02), and
  it holds the component's *lifecycle* value — exactly one at a time.
  `DzDisclosure` declares `['open','closed']`; `DzButton` declares
  `['idle','loading','disabled']`. Both are legal, and the declaration is what
  the conformance test checks.
- **The global `DataState` union in `@dzup-ui/contracts` stops being a closed
  list.** It is retained as a *named vocabulary of common values* for components
  that fit it, and `DataAttributes['data-state']` widens to `string` with the
  per-component enum carrying the real constraint. A union that a shipped
  component already violates is not a contract; keeping it as-is would only mean
  the next component quietly violates it too.
- **Boolean states are presence-only attributes**, absent when false — never
  `="false"`. This is already the rule in `data-attributes.types.ts` and it is
  reaffirmed here:
  `data-disabled · data-loading · data-invalid · data-readonly · data-required ·
  data-selected · data-checked · data-expanded · data-active · data-dragging ·
  data-pending`.
- **Recipe attributes are a third category and are public**:
  `data-size · data-variant · data-tone · data-density · data-orientation`.
  They mirror the resolved recipe value (after group/provider inheritance, not
  the raw prop) and they are what `core.css` already selects on. A component that
  accepts one of these props emits the matching attribute on its root; P3-02's
  validator reports the ones that do not (today: most of them).
- **States and recipes go on the node they describe**, which is usually but not
  always the root. A part carrying a state carries it on that part.

### 5. Typed per-instance overrides: the prop is `ui`

```ts
ui?: Partial<Record<Part, DzClassValue>>
```

- **`class` keeps its meaning**: it applies to the **root** only, merged through
  `cn()` (ADR-10). Nothing about existing usage changes.
- **`ui` addresses parts by name.** Values merge through the same `cn()`, so
  Tailwind conflict resolution behaves identically to `class`.
- **`Part` is the component's own declared part union**, so a typo is a type
  error and autocomplete lists the real anatomy.
- **`DzClassValue` is declared structurally in `@dzup-ui/contracts`**, not
  imported from `clsx`. It is structurally compatible with `clsx`'s `ClassValue`,
  and it keeps contracts free of a dependency on a styling library it otherwise
  has no reason to know about (the package's stated rule: zero runtime deps).

Why `ui` and not `parts` or `classes`:

- `parts` names the anatomy, not the thing being passed — the prop takes classes,
  and a future non-class override (a style object, a token map) would make the
  name a lie.
- `classes` collides with the plural of `class` in a template where `class` is
  already a reserved attribute, and reads as "more classes for the root".
- `ui` is short, already the convention consumers meet in Nuxt UI, and carries no
  implication about *what* the values are — which leaves room to accept more than
  class strings later without another rename.

### 6. Migration: dual-emit for one minor series, removal needs a major

- Components that already emit a legacy attribute for a node keep emitting it
  **alongside** the new `data-part`, marked in source with
  `// TODO(remove-after: <version>)`.
- Dual-emit lasts **one minor release series**. Removal is a **major** change and
  needs its own changeset; nothing here authorises a release of any kind.
- Adding parts, states, recipe attributes or `ui` to a component is **additive**
  and ships as a minor.
- The `DataState` widening in decision 4 is a **type-level widening** — every
  value that type-checked before still type-checks — and ships as a minor.

## Prerequisite packet (blocking nothing in P3, blocking any DTCG claim)

**P3-00 — DTCG emit for `@dzup-ui/tokens`.** Add a generated
`dist/tokens.dtcg.json` (`$value`/`$type`, groups mirroring
primitives/semantic/component), a schema check, and a spec asserting the DTCG
document and `tokens.css` are projections of the same maps. Until it exists, no
document, README, or task may describe DTCG as this library's token authority.

## Consequences

- P3-02 can define `ComponentAnatomy` against fixed names instead of proposing
  them, and its validator has something to measure "declared or explicitly
  `none`" against.
- The measured baseline is honest and unflattering: **2 of 143** public
  components emit any `data-part`. P3-03's five pilots are the first five; the
  remaining ~138 are the rollout, and the validator counts down rather than
  claiming a state the code does not have.
- The `DataState` widening removes a type-level guarantee that was already false.
  Real safety moves to the per-component enum, which is checked against rendered
  DOM by `expectAnatomy` rather than asserted in a type nobody enforced.
- Consumers gain `dz-overrides` immediately as a documented place to write, with
  no library change required — the layer statement is additive.
- Two `!important` declarations in `core.css` become recorded debt with an owner.

## Alternatives considered

**A public unstyled/headless mode.** Rejected — explicitly not admitted by the
reassessment, and it would double the surface this ADR exists to make small.

**A second styling engine (CSS Modules, vanilla-extract) beside `tv()`.**
Rejected — ADR-04 makes `tv()` the single mechanism; two engines means two
override stories and two answers to every cookbook question.

**BEM-style public class names (`.dz-button__label`).** Rejected — class names
are what `tv()` and `tailwind-merge` own, so a public class is a promise about
the internals of a generated string. Attributes are orthogonal to the class
machinery and survive every recipe change.

**Renaming layers to the dotted `dz.*` form.** Rejected — see decision 2. The
ordering the reassessment wants is delivered; only the spelling differs, and the
spelling is the part that would break consumers.

**Adopting DTCG now by hand-writing a JSON document.** Rejected — the task's
stop condition, and a second source of truth for tokens is precisely the failure
mode ADR-17 exists to prevent.

**Keeping `data-state` a closed global union and fixing `DzButton` to match.**
Rejected — there is no value in that union for a button ("active"? "selected"?),
so the fix would be to invent a wrong value rather than to admit the union does
not generalise.

## Rollout

1. This ADR is **Proposed** until a maintainer approves it. P3-02 may build the
   schema against it; P3-03 must not ship pilots on an unapproved contract.
2. P3-02 adds `ComponentAnatomy`, the conformance helper, the manifest field, and
   the validator that reports how many public components still lack anatomy.
3. P3-03 applies it to DzButton, DzInput, DzSelect, DzDialog, DzDataTable with
   dual-emit.
4. P3-04 documents the eight recipes against those pilots.
5. Rollout to the remaining components is ratcheted by the P3-02 validator, one
   family at a time, never by lowering the count.

## Validation hooks

| Hook | Added by | What it enforces |
|---|---|---|
| `validate:adr-references` | **this task** | every `ADR-NN` cited in source, docs or stories resolves to a document in `docs/adr/`, or to the ratcheted list of ADRs that are registry-only |
| `validate:contract-parity` (extended) | P3-02 | declared parts/states exist in rendered DOM; no undeclared `data-part` |
| `validate:ownership` (extended) | P3-02 | every public component has `anatomy` or an explicit `anatomy: "none"` |
| `validate:tokens` | exists | no raw color literals; every value references `var(--dz-*)` |
| override e2e | P3-03 | computed styles change through `ui` and `dz-overrides` with no `!important` in the fixture |
