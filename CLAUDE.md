# CLAUDE.md -- dzup-ui Architecture Reference

> Authoritative reference for all agents in `.claude/agents/`.
> Package scope: `@dzup-ui/*` (NOT @dzip-ui).

## Packages (dependency order)

```
contracts  -->  (types only, zero runtime deps)
tokens     -->  (no deps)
core       -->  tokens + contracts
compat     -->  never imported by stable core
codemods   -->  migration tooling
nuxt       -->  core integration module
```

**Import boundary rules:**
- `contracts` has NO runtime dependencies on core
- `core` depends on `tokens` + `contracts`
- `compat` is never imported by stable `core`

## Canonical Types (`@dzup-ui/contracts`)

```ts
type CanonicalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type CanonicalTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
```

**Family variants** (frozen per ADR-02):

| Type             | Values                                     |
|------------------|--------------------------------------------|
| ButtonVariant    | `solid` `outline` `ghost` `text` `link`    |
| CardVariant      | `elevated` `outlined` `flat`               |
| InputVariant     | `outline` `filled` `underlined`            |
| AlertVariant     | `filled` `outline` `subtle` `ghost`        |
| BadgeVariant     | `solid` `outline` `subtle`                 |
| TabsVariant      | `line` `enclosed` `pills`                  |
| ProgressVariant  | `bar` `circular`                           |
| ChipVariant      | `solid` `outline` `subtle`                 |

**Base prop interfaces** (in `contracts/src/props.types.ts`):
`BaseAccessibilityProps`, `BaseBehaviorProps`, `BaseAppearanceProps<TSize, TVariant>`,
`BaseValidationProps`, `BaseInteractiveProps<TVariant>`, `BaseFormControlProps<TVariant>`

## Component Structure

**205** `.vue` files in `packages/core/src/components/` across 11 families:
`buttons`, `cards`, `data`, `feedback`, `forms`, `inputs`, `layout`, `media`,
`navigation`, `overlays`, `typography`

> The count is **glob-derived**, not hand-maintained: `packages/tokens/src/design-md.ts`
> counts `.vue` files at generate time and feeds DESIGN.md. Re-run
> `yarn tokens:generate` after adding a component; never edit a count by hand.
> Counting rule: every exported `.vue` component, **including** compound
> sub-parts such as `DzCardBody` and `DzSplitButtonMenu`.

17 composables in `packages/core/src/composables/`.

### File layout — flat within each family

Components are **not** nested in a folder of their own. Every file for every
component in a family sits directly in the family directory, and each family has
exactly one `index.ts` (11 in total, one per family — not one per component).

```
packages/core/src/components/buttons/
  DzButton.vue                # <script setup lang="ts"> implementation
  DzButton.types.ts           # Props, emits, slots interfaces (extends contracts)
  DzButton.tokens.ts          # Component-specific token mappings
  DzButton.variants.ts        # tailwind-variants tv() style definitions
  DzButton.contract.spec.ts   # Contract conformance tests
  DzButton.spec.ts            # Unit/behavior tests (vitest)
  DzButtonGroup.vue           # …the next component, same directory
  DzSplitButton.vue
  DzSplitButtonMenu.vue       # compound sub-part — bare .vue, no sibling files
  index.ts                    # ONE per family: re-exports every component in it
```

Only `.vue` + `.types.ts` are universal. `.tokens.ts` and `.variants.ts` exist
where a component needs them (`DzCopyButton` has no `.tokens.ts`; `DzIconButton`
has no `.variants.ts`), and compound sub-parts are often a lone `.vue`.

Stories are NOT colocated -- they live in:
`packages/core/stories/{FAMILY}/DzComponent.stories.ts`

## Styling: tailwind-variants + Design Tokens (ADR-04)

Components use `tv()` from `tailwind-variants` in `.variants.ts` files. **No `<style scoped>`, no raw color literals, no hardcoded Tailwind colors.**

CSS values reference design tokens via `var(--dz-*)`:

```ts
// DzButton.variants.ts (real excerpt)
import { tv } from 'tailwind-variants'

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center font-[var(--dz-button-font-weight)]',
  variants: {
    size: {
      md: 'h-[var(--dz-button-md-height)] px-[var(--dz-button-md-padding-x)] text-[length:var(--dz-button-md-font-size)]',
    },
    tone: {
      primary: '',
    },
  },
  compoundVariants: [
    { variant: 'solid', tone: 'primary', class: 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]' },
  ],
  defaultVariants: { variant: 'solid', size: 'md', tone: 'primary' },
})
```

**Token naming**: `--dz-{component}-{property}` (e.g. `--dz-button-md-height`)
**Global tokens**: `--dz-primary`, `--dz-radius-sm`, `--dz-shadow-xs`, etc.

## Token Ownership (ADR-17)

`@dzup-ui/tokens` is canonical for:

- primitive token scales
- semantic theme tokens
- shared public token families

Component-local `*.tokens.ts` files in `core` remain valid for:

- component anatomy mapping
- local implementation adaptation
- family-specific subpart token indirection

Do not describe the current system as fully centralized at the component-token level. The repo currently uses a hybrid model.

## Import Patterns

```ts
// Relative imports use .ts extensions
import { cn } from '../../utilities/cn.ts'

// Types from contracts
import type { ButtonVariant, CanonicalSize } from '@dzup-ui/contracts'

// Props: withDefaults + defineProps
const props = withDefaults(defineProps<DzButtonProps>(), {
  variant: 'solid',
  size: 'md',
  tone: 'primary',
  type: 'button',
})

// Emits: typed
const emit = defineEmits<DzButtonEmits>()

// Slots: typed
defineSlots<DzButtonSlots>()

// v-model: defineModel (ADR-16) -- NOT manual prop+emit
const modelValue = defineModel<string>()
```

## Type Definitions Pattern

```ts
// DzButton.types.ts (real excerpt)
import type { BaseAccessibilityProps, ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'

export interface DzButtonProps extends BaseAccessibilityProps {
  variant?: ButtonVariant
  size?: CanonicalSize
  tone?: CanonicalTone
  disabled?: boolean
  loading?: boolean
}

export interface DzButtonEmits {
  click: [e: MouseEvent]
  focus: [e: FocusEvent]
  blur: [e: FocusEvent]
}

export interface DzButtonSlots {
  default?: () => unknown
  prefix?: () => unknown
  suffix?: () => unknown
}
```

## Key ADRs

| ADR    | Topic                                              |
|--------|----------------------------------------------------|
| ADR-02 | Contract-first design (frozen variant taxonomies)  |
| ADR-04 | Token-only styling (no raw colors)                 |
| ADR-07 | Reka UI for headless primitives                    |
| ADR-12 | Generated `dist/` is published, never committed (corrected 2026-09-04) |
| ADR-13 | Calendar/date-picker date math delegated to `@internationalized/date` via `useCalendar` — **see the number-collision note below** |
| ADR-15 | FOUC prevention                                    |
| ADR-16 | `defineModel` for v-model                          |
| ADR-17 | Token source of truth and component token ownership |
| ADR-18 | Runtime floor and validator runner (`docs/adr/`)   |
| ADR-19 | Public styling contract: layers, parts, states, `ui` (`docs/adr/`) |
| ADR-20 | Provider contract: locale, direction, messages, formats, portals, motion, defaults, nonce, test ids (`docs/adr/`) |

> Only ADR-18, ADR-19 and ADR-20 have a document in `docs/adr/`. The rest are
> recorded by this table and by the source comments that cite them; they are
> listed as debt in `packages/tooling/scripts/adr-registry.json`, and
> `yarn validate:adr-references` fails on any *new* ADR number cited without
> one. Writing one of them means deleting its entry and lowering the ceiling.
>
> All three documented ADRs are **`Accepted`**, by the owner on 2026-09-26.
> `validate:adr-references` reads each document's own `Status:` line and
> ratchets `maxProposedCitedFromCode`, the number of distinct `Proposed` ADRs
> cited from code. It is **0**, so code may not build on a new `Proposed` ADR
> until the owner accepts it. Accepting one is an owner act: flip the
> `Status:` line and lower the ceiling in the same change.

### ADR-13 is two different decisions — a number collision, not a mistake

*Recorded 2026-09-22 (TASK-R0-O2). Neither document is renamed.*

| Tier | ADR-13 means | Where |
|---|---|---|
| **dzup-ui** (this repo) | Calendar and date-picker date math is delegated to `@internationalized/date` through the `useCalendar` composable | No document. Recorded in `adr-registry.json` and in the `DzCalendar` / `DzDatePicker` / `DzDateRangePicker` headers |
| **dzup-ui-pro** | Composite component dependencies require exact source/target admission — **Accepted 2026-08-10** | `ui/dzup-ui-pro/docs/adr/ADR-13-composite-component-dependencies.md` |

The two tiers share one ADR number space and have never coordinated it. **The
resolution is naming, not renumbering:** inside this repository a bare `ADR-13`
always means the date-math decision; any citation that crosses tiers must be
written `dzup-ui ADR-13` or `dzup-ui-pro ADR-13`. Renumbering either side was
rejected — Pro's is Accepted and cited from Pro source, this one is cited from
10 sites here, and a renumber breaks every existing citation to buy tidiness.

Whether the two tiers should share or split the number space from here is an
open owner decision (**TASK-R0-O2 D187**).

## Tooling

| Tool         | Purpose                                  |
|--------------|------------------------------------------|
| Vite         | Build                                    |
| Vitest       | Unit + contract tests                    |
| vue-tsc      | Type checking                            |
| ESLint v9    | Flat config linting                      |
| Storybook 10 | `@storybook/vue3-vite` dev environment   |
| Reka UI      | Headless accessible primitives           |
| Changesets   | Versioning and changelogs                |

## Quality Gates

All PRs must pass:
- `yarn typecheck` -- 0 errors
- `yarn lint` -- 0 errors
- 80%+ test coverage
- Contract Spec v1 conformance (`.contract.spec.ts`)
- WCAG AA accessibility

### Regenerating generated artifacts — the order, and what obliges each step

*Recorded 2026-09-25 (RESIDUAL-07). The order alone was documented before this and the
omissions broke three agents' validation runs in one programme. Each step below names
what makes it necessary, because that is the part that was missing.*

| # | Command | Owed when |
|---|---|---|
| 1 | `yarn generate:ownership` | a component is added, renamed or re-owned |
| 2 | `yarn generate:quality-matrix` | tier or story-DoD evidence changed |
| 3 | `yarn generate:capability-matrix` | any evidence cell changed |
| 4 | `yarn generate:component-meta` | **(a)** any *capability* change — it carries a **join** of `capability-matrix.json`, and `packages/tooling/src/docs/evidence.spec.ts` fails on the mismatch; **(b)** any *story* edit — it records each story's example **line range** |
| 5 | `yarn generate:llms` | any of 1–4 moved |
| 6 | `yarn generate:docs-pages` | **every** `component-meta.json` change — `apps/docs/.vitepress/generated/nav.json`'s `artifactSha256` **is** the sha256 of `component-meta.json` |
| 7 | **`yarn csp:inline-style-inventory`** | **any edit to a `.vue` that carries an inline `style=`** — `packages/core/security/inline-style-inventory.json` records the **line number** of every site, so a one-line insertion makes it stale with nothing added or removed |

**Step 7 is not part of the six-link order and `validate:all` does not check it at all.**
Measured 2026-09-25: steps 1–6 ran end to end, all exit 0, and the inventory was still
stale afterwards. The only gate that fails is the **unit suite** —
`packages/core/security/inline-style-inventory.spec.ts` › *"is fresh — the artifact and
the source agree, site for site"*. Two consecutive batches lost a red suite to this.

> **Run `yarn regenerate:all` rather than copying the column.** Added 2026-09-28
> (RESIDUAL-09, closing `D-RES07-2`): it runs exactly these seven steps in this order,
> **refuses to start** if any step names a script `package.json` no longer declares, and
> **stops at the first failure** — printing the step, its exit code and the steps that did
> **not** run, because a chain that continues produces artifacts derived from a stale
> predecessor. `yarn regenerate:all --list` prints the order and each trigger without
> running anything.
>
> **The table above is not redundant and is not to be deleted.** The script guarantees
> *what* runs when several artifacts are stale; the table is how you decide *which* steps
> are owed when only one is — and `packages/tooling/src/regenerate-all.spec.ts` asserts
> that the table and the script name the same seven commands in the same order, so neither
> can drift from the other.

## Quick Rules for Agents

1. **Never use raw colors** -- always `var(--dz-*)` tokens inside Tailwind classes
1b. **`--dz-{intent}` is a fill/border color, never a text color.** For intent-colored
   text use `--dz-{intent}-muted-foreground`. `text-[var(--dz-danger)]` fails WCAG AA
   on the page background and on `--dz-danger-muted`; `yarn validate:tokens` rejects it.
2. **Never use `<style scoped>`** -- use `tv()` in `.variants.ts`
3. **Always extend contracts** -- props interfaces extend `Base*Props` from `@dzup-ui/contracts`
4. **Use `defineModel`** for v-model, not manual prop+emit (ADR-16)
4b. **Never label an emits payload `event`** -- write `click: [e: MouseEvent]`. Vue
   names the event-name parameter `event`, so `[event: …]` prints
   `(event: "click", event: MouseEvent)`: `TS2300` in any published `.d.ts` that
   inlines the component (D152). `yarn validate:component-meta` rejects it.
5. **Use `.ts` extensions** in all relative imports
6. **Stories live separately** -- `packages/core/stories/{family}/`
7. **Respect import boundaries** -- contracts has no runtime deps, compat never imported by core
