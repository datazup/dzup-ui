# ADR-19 — Public styling contract: layers, parts, states, and typed overrides

- **Status:** Proposed (TASK-OSS-P3-01, 2026-08-20)
- **Extends:** ADR-04 (token-only styling), ADR-17 (token source of truth)
- **Depended on by:** TASK-OSS-P3-02 (anatomy metadata), P3-03 (five pilots),
  P3-04 (styling cookbook), and every Pro styling slice
- **Does not change any code.** It fixes names so the packets that follow do
  not each invent their own.

> **Amendments — 2026-09-04, TASK-R5-O1.** The acceptance packet
> (`docs/program-2026-09/reports/N5-05-adr-19-acceptance-packet.md`) measured
> **13 divergences** between this document and the code at `99b963a`. They are
> closed here: four by shipping the code the ADR decided (the three missing
> cascade layers, the `DataState` widening, the layer-order fixture, the parts
> vocabulary), the rest by amending the text where the code was right and the
> ADR was not. Every amended passage is dated inline. **The status line above is
> deliberately unchanged** — acceptance is an owner act (TASK-R0-O2), and this
> task produced its input, not its signature.
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
| `dz-reset` | box-model and document normalisation | Core — **moved 2026-09-04** (TASK-R5-O1) out of `dz-base` into its own layer in `base.css` |
| `dz-tokens` | `--dz-*` declarations, light and dark | `@dzup-ui/tokens` |
| `dz-base` | element defaults and shared interaction utilities (`.dz-focus-ring-*`, `.dz-disabled-*`) | Core |
| `dz-components` | per-component rules and component-token defaults (`.dz-panel`, `.dz-panel[data-size=lg]`) | Core, and Pro for its own components |
| `dz-utilities` | library-provided single-purpose helpers | Core — **registered and empty**: the library ships no utility class outside `dz-base` today, and registering the name is what fixes the order (2026-09-04) |
| `dz-overrides` | **empty in the library — reserved for consumers** | consumer |

Rules that come with the order:

- **Nothing the library ships is unlayered**, with two recorded exceptions that
  must stay unlayered and must stay documented where they are written: the print
  block in `base.css`, and `.dz-prose` (rich-content typography, which must beat
  layered component styles the way consumer utilities do).
- **A consumer override needs no `!important`.** Unlayered CSS beats every
  layer, and `dz-overrides` beats every library layer, so both routes win.

  > **Shipped and measured, 2026-09-04 (TASK-R5-O1).** All six slots are now
  > declared, in `packages/core/src/styles/base.css` **and** in the statement
  > `packages/tokens/src/generate.ts` emits into `tokens.css` — both, because CSS
  > registers a layer at its FIRST appearance, so a single statement would have
  > left the order dependent on which sheet a bundler emitted first.
  > `yarn test:e2e:layer-order` asserts it in chromium, firefox and webkit
  > **against the packed tarballs**: unlayered consumer CSS wins in *both* import
  > orders, and a rule in `@layer dz-overrides` beats `dz-components`, with no
  > `!important` anywhere in the fixture.
  >
  > **One measured limit, recorded rather than smoothed over.** A consumer sheet
  > that opens `@layer dz-overrides { … }` **before** the dzup stylesheets are
  > evaluated registers that layer first, and the library's own statement then
  > appends `dz-reset … dz-components` after it — so `dz-components` wins and the
  > override silently does nothing. Repeating the statement in both published
  > sheets does not fix this and nothing the library ships can: it cannot make a
  > declaration appear before a sheet that loads earlier. The documented
  > arrangement is therefore *dzup stylesheets first*, and the unlayered route,
  > which is order-independent, is the one to reach for when that cannot be
  > guaranteed. Asserted, in all three engines, so it cannot change unnoticed.

- **`!important` in library CSS is a defect — with one carve-out.** Corrected
  2026-09-04: there are **three rules / six declarations**, not two.
  `.dz-field-input-reset` (`base.css`) and `.dz-tab-close-btn:hover` are debt
  with an owner. `.dz-native-input:-webkit-autofill` is a **permanent recorded
  exception**: the WebKit autofill UA rule genuinely cannot be overridden without
  it, so it belongs beside the print block and `.dz-prose` as unlayered-or-
  important by necessity rather than in a debt list nobody can ever clear.

- **Vendor sublayers are registered, not improvised.** A rule that selects a node
  another library renders (`[data-reka-*]`, `.reka-*`, and the equivalents for
  Radix, Floating UI, Vaul, TanStack) is the CSS form of the §3 rule that keeps
  Reka internals out of the parts contract, and it needs an owner and a way out.
  `packages/core/src/styles/vendor-registry.json` records selector, owner, reason
  and exit condition; `yarn validate:vendor-sublayers` fails on an incomplete
  entry, on an entry whose rule has been deleted, and on a vendor-shaped selector
  with no entry. The registry is **empty**, measured empty on `99b963a` — the
  only contact with Reka is a custom property the library *reads* — which is
  precisely why the third rule exists (2026-09-04).
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
  word for the node; the validator lists such names in its report so the
  vocabulary can grow deliberately instead of by accident.

  > **Grown once, deliberately, 2026-09-04 (TASK-R5-O1; N2-S1 S1-D1).** The
  > mechanism worked as specified: `validate:anatomy-parts` reported **14 shipped
  > names across 7 components** sitting outside the original 30. Seven name a job
  > that recurs and are now **in** the vocabulary — `clear`, `toggle`,
  > `filename`, `language`, `body`, `row`, `cell`. The other seven were reviewed
  > and deliberately kept component-specific, recorded with a reason in
  > `ANATOMY_PART_EXTENSIONS` (`packages/contracts/src/anatomy.types.ts`):
  > `copy-button` and `line-number` (DzCodeBlock), `decrement` and `increment`
  > (a stepper has two buttons that are not interchangeable), and the three
  > `options-*` names, which are **held** for the `DzOptionsState` decision
  > below. Nothing was renamed: renaming a shipped part name is breaking, which
  > is exactly why the review had to happen while the cost was still low. The
  > validator now distinguishes *folded in* / *reviewed extension* / *held* /
  > *nobody has looked at it*, and the last of those has a ceiling of **zero**.
- **Parts are a promise about identity, not about structure.** A part may move in
  the tree, gain a wrapper, or change element type in a minor release. Removing
  or renaming one is a breaking change.
- **Reka UI internals never become parts.** A node that exists only because Reka
  renders it is not addressable; if a consumer needs it, Core wraps it in a node
  of its own and names that. This is the P3-03 stop condition, stated here so it
  is a rule rather than one task's caveat.
- **An unexported internal's parts are governed only when *every* host declares
  them.** *(Added 2026-09-04, TASK-R5-O1 — the rule this section was missing;
  packet D19-10 / N2-S1 S1-F2.)* A library-internal Vue component with no
  ownership-manifest entry — `DzOptionsState.vue` is the case — renders into the
  DOM of every component that imports it, so its `data-part` names land in seven
  public components at once. It is neither a compound part (it has no
  `parentComponent`) nor a public component, so no single anatomy owns it. The
  rule that follows: such an emission counts as declared when **every** importing
  host declares it, and it therefore cannot be closed one component at a time.
  Its disposition — inline it, make it a compound part with a `parentComponent`,
  or add an ownership kind for a shared internal — is its own decision
  (N2-S1 **S1-D4**), and it is what `maxUndeclaredEmissions: 3` and the three
  `held` part names both wait on.

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

  > **Performed 2026-09-04 (TASK-R5-O1).** It had not been:
  > `data-attributes.types.ts` still declared the closed eight-value union as the
  > attribute type fourteen days after this ADR was written, and `DzButton` had
  > been emitting `idle | loading | disabled` — none of them in it — since it
  > shipped. The widening on its own would only remove a check, so it landed with
  > the gate that replaces it: **`validate:anatomy-parts` now reads every
  > `data-state` literal a template can produce and fails when the component
  > anatomy (or a composing parent) does not declare it.** Measured at the
  > widening: **0** violations across all 32 declaring components; **1** in a
  > compound part (`DzTableRow` emits `expanded`, which `DzTable` does not
  > declare) held under a ratcheting ceiling; and **88** values from components
  > that declare no anatomy at all, under a second ceiling that falls as the
  > rollout reaches them. The gate was proven by seeding an out-of-enum value on
  > `DzButton` and observing exit 1.
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
  accepts one of these props emits the matching attribute on its root.

  > **Corrected 2026-09-04 (TASK-R5-O1; packet D19-6).** This clause used to say
  > *"P3-02's validator reports the ones that do not (today: most of them)"*.
  > **No such gate was ever built** — `anatomy-parts.ts` contains no reference to
  > `data-size`, `data-variant`, `data-tone`, `data-density` or
  > `data-orientation`, and nothing else measures them. The recipe attributes are
  > therefore **declared public and unenforced**, and the size of the gap is
  > unmeasured rather than "most of them". This clause is the one part of §4 that
  > is a forward commitment. The follow-up is named in the Consequences: build it
  > with the `data-scope` emitter as one `useAnatomy()` attribute bag, because a
  > second hand-written per-node attribute is the failure mode this program has
  > recorded five times.
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
- **A compound part carries `ui` for its own parts, and its parent is not
  required to.** *(Clarified 2026-09-04, TASK-R5-O1; packet D19-12.)*
  `DzDialogContentProps` declares `ui?: DzDialogContentUi` and `DzDialog` has no
  `ui` prop at all — correctly, because `DzDialogContent` owns
  `overlay`/`content`/`header`/`viewport`/`footer` and `DzDialog` renders no
  element of its own. §5 was silent on the case, which is why the count of `ui`
  declarations propagated through three task briefs as a wrong number: it is
  **26 public components + 1 compound part**, not 27 components and not 5.
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

### 6. Migration: dual-emit for one release series; removal is breaking

> **Amended 2026-09-04 (TASK-R5-O1)** to reconcile with
> `packages/contracts/VERSIONING.md` §7.2. The original wording said removal
> "is a **major** change" and that the `DataState` widening "ships as a minor".
> Under `VERSIONING.md` §1 a `major` before 1.0 *is* `1.0.0` and
> `validate:release-policy` refuses it, so read literally this section forbade
> removing a part until the library was stable. Wording only; the intent —
> removal is breaking, addition is not — is unchanged.

- Components that already emit a legacy attribute for a node keep emitting it
  **alongside** the new `data-part`, marked in source with
  `// TODO(remove-after: <version>)`.
- Dual-emit lasts **one release series**. Removing or renaming a part is
  **breaking, and therefore a minor while the library is `0.x`** (a major from
  1.0), and needs its own changeset; nothing here authorises a release of any
  kind.
- Adding parts, states, recipe attributes or `ui` to a component is **additive**,
  and additive ships as a **patch** at `0.x`.
- The `DataState` widening in decision 4 is a **type-level widening** — every
  value that type-checked before still type-checks — so under `VERSIONING.md`
  §2.1 it is a **patch**.

## Prerequisite packet — DISCHARGED

**P3-00 — DTCG emit for `@dzup-ui/tokens`.** *(Discharged by TASK-N2-T1;
recorded here 2026-09-04 by TASK-R5-O1 — packet D19-9. This section previously
said the pipeline did not exist and forbade any document from describing it,
which by then blocked documents from describing a pipeline that ships and is
gated.)*

`packages/tokens/src/dtcg.ts` and `src/generate-dtcg.ts` emit
`dist/tokens.dtcg.json` (`$value`/`$type`, groups mirroring
primitives/semantic/component). `yarn validate:tokens:dtcg`
(`packages/tooling/src/token-checks/dtcg-round-trip.ts`) resolves every alias
through an independent DTCG reader and asserts each resolved value equals what
`dist/tokens.css` computes for the same `--dz-*` name, in both theme cascades.
It runs inside `yarn validate:all`.

The prohibition this section carried is narrowed to the rule it was always
protecting: **the TypeScript token maps remain the single source of truth, and
the DTCG document is a generated projection of them — never a second source.**

## Consequences

*Re-measured 2026-09-04 (TASK-R5-O1) against `99b963a`. The original bullets were
written on 2026-08-20 and three of them had become false — one of them a promise
of a consumer-visible capability that did not exist.*

- P3-02 defined `ComponentAnatomy` against these names rather than proposing
  them. The contract is declared by **32 `.anatomy.ts` files** (31 public
  components + `DzDialogContent`, a compound part), emitting **118 static
  `data-part` sites across 37 components** in 36 distinct names. The
  `maxWithoutAnatomy` ratchet has fallen 142 → 138 → 137 → 136 → **113**, one
  direction only.
- The measured baseline was honest and unflattering — 2 of 143 components emitted
  any `data-part` when this ADR was written — and it remains unflattering:
  **113 of 144 public components have still not declared an anatomy.** Three
  families are complete (`inputs` 8/8, `buttons` 8/8, `typography` 8/8); nine are
  not. The validator counts down and never claims a state the code lacks.
- The typed override prop `ui` ships on **26 public components and 1 compound
  part**. A compound part may carry `ui` for its own parts without its parent
  declaring one — `DzDialogContent` does, `DzDialog` does not.
- **The `DataState` widening has been performed** (2026-09-04). It removed a
  type-level guarantee that was already false — `DzButton`'s
  `idle | loading | disabled` violated the closed union from the day it shipped.
  Real safety now sits in the per-component enum, checked against **source** by
  `validate:anatomy-parts` and against **rendered DOM** by `expectAnatomy`. Under
  `VERSIONING.md` §2.1 the widening is a **patch**.
- **All six cascade layers are declared**, in `base.css` and in the statement
  `tokens.css` carries, so `dz-overrides` is a documented place for a consumer to
  write with no library change required. That sentence used to be in this list
  and was **untrue for fourteen days**: three of the six layers existed nowhere,
  and a consumer writing `@layer dz-overrides { … }` won by CSS append-order
  accident for an unregistered layer, which would have stopped holding the moment
  the library registered anything after `dz-components`. It is now asserted on the
  packed tarballs in three engines (`yarn test:e2e:layer-order`), together with
  the one case that does **not** hold — a consumer sheet that registers
  `dz-overrides` before the dzup stylesheets load.
- **Three `!important` rules ship in `core.css`, not two.**
  `.dz-field-input-reset` and `.dz-tab-close-btn:hover` are debt with an owner.
  `.dz-native-input:-webkit-autofill` is a **permanent recorded exception** — the
  WebKit autofill UA rule cannot be overridden without it — and joins the print
  block and `.dz-prose` as unlayered-or-important by necessity.
- The recipe attributes (`data-size`, `data-variant`, `data-tone`,
  `data-density`, `data-orientation`) are declared public by §4 and **no gate
  measures them**. `core.css` already selects on them, so the surface is public
  whether or not it is enforced. Filed as a follow-up, to be built with the
  `data-scope` emitter as one `useAnatomy()` attribute bag.
- **Part identity is carried by convention, not by attribute.** Two measured
  collisions — a `[data-part="content"]` selector matching a `<table>` two
  components down, and `part "root" appears 5 times` on `DzSpeedDial` — were
  fixed with structural anchors. The residual case, `DzTooltipTrigger` merging
  its `data-state` onto `DzRelativeTime`'s own root, cannot be fixed structurally
  and is a **known limit**. Whether to add `data-scope` is an open owner decision
  with a costed sheet:
  `docs/program-2026-09-04/reports/TASK-R5-O1-data-scope-decision.md`.

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
| `validate:anatomy-parts` | **TASK-N2-S1**, extended by **TASK-R5-O1** | **source-level**: every static `data-part` is declared by its component's anatomy or a composing parent's; every non-optional declared part is emitted somewhere; every `data-state` literal a template can produce is declared by that component's `states`; part names outside the vocabulary are classified (folded in / reviewed extension / held / unreviewed) and only *unreviewed* is a failure. Ratchets: `maxUndeclaredEmissions` 3, `maxUnemittedDeclarations` 0, `maxUndeclaredStates` 1, `maxStatesWithoutAnatomy` 88, `maxUnreviewedPartNames` 0, `maxHeldPartNames` 3. **This replaces the `validate:contract-parity` extension this table originally assigned the job to, which was never built** — `contract-parity.ts` contains no reference to anatomy (packet D19-5) |
| `expectAnatomy` (`@dzup-ui/testing`) | P3-02, corrected by N2-S1 | **rendered-DOM**: declared parts and states exist in the mounted tree; a descendant `data-part="root"` is an anatomy boundary and is not descended into |
| `validate:vendor-sublayers` | **TASK-R5-O1** | a CSS selector reaching into a vendor's DOM has a registry entry with owner, reason and exit condition; an entry whose rule has been deleted fails; the registry is empty today |
| `validate:ownership` (extended) | P3-02 | every public component has `anatomy` or an explicit `anatomy: "none"` |
| recipe-attribute parity | **not built** | §4 declares `data-size/variant/tone/density/orientation` public. **No such gate exists.** Follow-up, to be built with the `useAnatomy()` attribute bag |
| `validate:tokens` · `validate:tokens:dtcg` | exists · TASK-N2-T1 | no raw color literals; every value references `var(--dz-*)`; the DTCG projection round-trips against `tokens.css` |
| override e2e (`e2e/components/styling-overrides.spec.ts`) | P3-03 | computed styles change through `ui` — including into a portaled listbox and a dialog backdrop — with no `!important` in the fixture. Playwright; not part of `validate:all` |
| layer-order e2e (`e2e/styling/layer-order.spec.ts`) | **TASK-R5-O1** | on the **packed tarballs**, in chromium/firefox/webkit: all six layers registered in order in both published stylesheets; unlayered consumer CSS wins in both import orders; `@layer dz-overrides` beats `dz-components`; and the one order that does not hold. No `!important` in the fixture. Playwright; `yarn test:e2e:layer-order` |
