# Mapping DESIGN.md Tokens To dzup-ui

This document defines how an application `DESIGN.md` or generated
`DESIGN.generated.md` should map into the `dzup-ui` token model.

The goal is alignment, not automatic promotion. `DESIGN.md` describes an app or
product design contract. `@dzup-ui/tokens` remains the source of truth for the
library's reusable token families and emitted `--dz-*` CSS custom properties.

## Source And Target

| Layer | Owner | Purpose |
| --- | --- | --- |
| `DESIGN.md` | App or product | Human-reviewed design contract for one app, product, brand, or extracted UI |
| `DESIGN.generated.md` | Extraction tooling | Browser-evidence draft that needs review before promotion |
| `DESIGN.tokens.generated.json` | Extraction tooling | Structured token candidates with evidence metadata |
| `@dzup-ui/tokens` primitives | `ui/dzup-ui` | Stable raw palettes and scales |
| `@dzup-ui/tokens` semantic tokens | `ui/dzup-ui` | Theme-aware roles such as surface, foreground, border, primary, status, and ring |
| `@dzup-ui/tokens` component tokens | `ui/dzup-ui` | Component defaults and override points such as button sizes or sidebar paint |
| `@dzup-ui/core` component variants | `ui/dzup-ui` | Runtime component classes that consume `--dz-*` variables |

`DESIGN.md` can propose values and roles. It does not directly add or rename
library tokens. Promotion into `@dzup-ui/tokens` requires mapping, review, and
validation.

## dzup-ui Token Tiers

`@dzup-ui/tokens` emits a three-tier CSS custom property system:

| Tier | Source path | CSS shape | Use |
| --- | --- | --- | --- |
| Tier 1: Primitive | `packages/tokens/src/primitives/*` | `--dz-colors-primary-500`, `--dz-spacing-4`, `--dz-radius-md`, `--dz-shadow-sm`, `--dz-text-sm` | Raw palettes and scales |
| Tier 2: Semantic | `packages/tokens/src/semantic/{light,dark}.ts` | `--dz-background`, `--dz-foreground`, `--dz-border`, `--dz-ring`, `--dz-primary`, `--dz-success` | Theme-aware app roles |
| Tier 3: Component | `packages/tokens/src/component/*` | `--dz-button-md-height`, `--dz-input-border-focus`, `--dz-sidebar-bg` | Component family defaults and override points |

Generated CSS is written by `packages/tokens/src/generate.ts` into
`packages/tokens/dist/tokens.css`. Component implementations in
`@dzup-ui/core` consume these variables through CSS `var()` usage, usually in
variant files or component-local `*.tokens.ts` files.

## Mapping Rules

1. Map observed raw values to the nearest existing primitive scale first.
2. Map product intent to semantic tokens only when the role is clear.
3. Map component-specific behavior to component tokens only when the value is
   tied to one component family.
4. Keep app-specific names and domain semantics out of the reusable library.
5. Preserve extracted evidence next to every proposed mapping.
6. Do not create new primitives for one-off values until the value appears in
   multiple contexts or has a reviewed product rationale.
7. Do not remove generated evidence. A curated mapping should sit beside it.

## Field Mapping

| DESIGN.md field | dzup-ui destination | Mapping guidance |
| --- | --- | --- |
| `colors` | Primitive color palettes, semantic color roles, or component color tokens | Raw colors become palette candidates. Repeated role evidence maps to semantic roles. Component-only colors map to component tokens. |
| `typography` | Typography primitives and component typography tokens | Family, size, weight, line-height, and letter-spacing should be grouped into text-style candidates before promotion. |
| `spacing` | `--dz-spacing-*` primitives or component spacing tokens | Positive values map to the nearest spacing step. Negative values are implementation exceptions, not primitives. |
| `rounded` | `--dz-radius-*` primitives or component radius tokens | Very large values map to `--dz-radius-full`. Partial radii usually stay component-local. |
| `elevation` | `--dz-shadow-*` primitives or component shadow tokens | Parse shadow layers and map to the closest shadow step. Preserve raw CSS evidence. |
| `components` | `packages/tokens/src/component/*` and `@dzup-ui/contracts` concepts | Generic buckets such as button, input, surface, navigation, badge, table, and dialog map to component families only after review. |

## Color Mapping

Use this sequence:

1. Normalize observed color values to a comparable color space.
2. Cluster near-equivalent values.
3. Match clusters to an existing dzup-ui palette family and shade when possible.
4. Assign semantic aliases only from role evidence such as CSS source field,
   component usage, route coverage, and state usage.
5. Add or modify palette config only when the product needs a stable brand
   family, not just because a generated color is unmatched.

| DESIGN.md evidence | Preferred dzup-ui token |
| --- | --- |
| App page background | `--dz-background` |
| Main text color | `--dz-foreground` |
| Secondary or muted text | `--dz-muted-foreground` |
| Raised panel background | `--dz-surface` or `--dz-surface-raised` |
| Default border | `--dz-border` |
| Hover border | `--dz-border-hover` |
| Focus outline or ring | `--dz-ring` |
| Primary action background | `--dz-primary` |
| Primary action foreground | `--dz-primary-foreground` |
| Success, warning, danger, info states | `--dz-success`, `--dz-warning`, `--dz-danger`, `--dz-info` and matching foreground or muted roles |
| Input background or border | `--dz-input-bg`, `--dz-input-border`, `--dz-input-border-focus`, `--dz-input-placeholder` |
| Card or popover background | `--dz-card`, `--dz-popover` and matching foreground roles |
| Sidebar surface or navigation paint | `--dz-sidebar-*` component tokens |

Do not map every `color`, `borderColor`, or `outlineColor` occurrence to a new
semantic token. The same rendered value can serve different roles. Role comes
from usage and review, not only from the value.

## Typography Mapping

Generated typography evidence should be grouped into text styles before it is
mapped. A text style is the tuple:

```text
fontFamily + fontSize + fontWeight + lineHeight + letterSpacing
```

| DESIGN.md evidence | Preferred dzup-ui token |
| --- | --- |
| Sans family | `--dz-font-sans` |
| Mono family | `--dz-font-mono` |
| Font size | `--dz-text-xs` through `--dz-text-9xl` |
| Line height | `--dz-leading-none`, `tight`, `snug`, `normal`, `relaxed`, `loose` |
| Font weight | `--dz-font-normal`, `medium`, `semibold`, `bold`, etc. |
| Letter spacing | `--dz-tracking-normal`, `wide`, etc. |
| Button typography | `--dz-button-font-family`, `--dz-button-font-weight`, `--dz-button-*-font-size` |

If a product needs named roles such as `body`, `caption`, `heading`, or
`display`, define those in the app-level `DESIGN.md` first. Add library-level
semantic typography only after several components need the same reusable role.

## Spacing Mapping

`dzup-ui` spacing is a 4px-based scale emitted as `--dz-spacing-*`.

| Observed value | Preferred token |
| --- | --- |
| `0px` | `--dz-spacing-0` |
| `2px` | `--dz-spacing-0_5` |
| `4px` | `--dz-spacing-1` |
| `6px` | `--dz-spacing-1_5` |
| `8px` | `--dz-spacing-2` |
| `10px` | `--dz-spacing-2_5` |
| `12px` | `--dz-spacing-3` |
| `16px` | `--dz-spacing-4` |
| `20px` | `--dz-spacing-5` |
| `24px` | `--dz-spacing-6` |
| `28px` | `--dz-spacing-7` |
| `32px` | `--dz-spacing-8` |
| `40px` | `--dz-spacing-10` |
| `48px` | `--dz-spacing-12` |
| `64px` | `--dz-spacing-16` |
| `80px` | `--dz-spacing-20` |

Negative spacing values from extraction are implementation exceptions. They
should be recorded in review output, not promoted to `@dzup-ui/tokens`.

Component sizing should prefer existing component tokens. For example, button
heights should map to `--dz-button-md-height` or another button size token, not
to a new generic spacing token.

## Radius Mapping

| Observed value | Preferred token |
| --- | --- |
| `0px` | `--dz-radius-none` |
| `4px` | `--dz-radius-sm` |
| `6px` | `--dz-radius-md` |
| `8px` | `--dz-radius-lg` |
| `12px` | `--dz-radius-xl` |
| `16px` | `--dz-radius-2xl` |
| `24px` | `--dz-radius-3xl` |
| `9999px` or extremely large radii | `--dz-radius-full` |

Partial radii such as `0px 0px 8px 8px` are component shape decisions. Keep
them in component tokens or component CSS until there is a reusable primitive
reason to promote them.

## Elevation Mapping

Map shadow candidates to `--dz-shadow-*` by visual weight and layer structure:

| DESIGN.md evidence | Preferred token |
| --- | --- |
| No shadow | `--dz-shadow-none` |
| Small single-layer shadow | `--dz-shadow-xs` or `--dz-shadow-sm` |
| Card or popover elevation | `--dz-shadow-sm` or `--dz-shadow-md` |
| Dialog, dropdown, or overlay elevation | `--dz-shadow-lg`, `--dz-shadow-xl`, or `--dz-shadow-2xl` |
| Inset shadow | `--dz-shadow-inner` |

Raw CSS shadow strings should remain in generated evidence. The reviewed
mapping should reference the closest dzup-ui token and explain any mismatch.

## Component Mapping

Map generated component buckets to dzup-ui component families conservatively.

| DESIGN.md component bucket | dzup-ui concept | Token destination |
| --- | --- | --- |
| `button` | `DzButton`, `DzIconButton`, `DzToggleButton`, split/copy buttons | `packages/tokens/src/component/button.ts`, button variant classes |
| `input` | `DzInput`, select, combobox, date picker, field shells | `packages/tokens/src/component/input.ts`, shared control tokens |
| `navigation` | sidebar, tabs, breadcrumbs, menus | Sidebar tokens, control tokens, navigation component variants |
| `surface` | cards, panels, app shell regions | `card`, `appshell`, semantic surface tokens |
| `badge` | `DzBadge`, status chips, tags | `badge` tokens and status semantic roles |
| `table` | `DzTable`, `DzDataGrid`, list/grid data views | data component tokens and semantic surface/border tokens |
| `dialog` | dialogs, popovers, overlays, drawers | `dialog` tokens, overlay semantic tokens |
| `heading` | typography components and slots | typography primitives first; component token only if tied to a component |

Component token promotion needs more than a bucket name. Require at least:

- observed parts, such as root, label, icon, header, body, footer, or item
- observed variants, such as solid, outline, ghost, neutral, primary, danger
- observed visible states, such as default, hover-visible, disabled, selected,
  expanded, invalid, loading, or busy
- route and viewport coverage
- accessibility evidence when relevant

## App Overrides

Apps should override dzup-ui through CSS variables, not by forking component
classes.

```css
:root {
  --dz-primary: oklch(0.55 0.18 260);
  --dz-ring: var(--dz-primary);
  --dz-button-radius: var(--dz-radius-lg);
}

[data-theme="dark"] {
  --dz-background: var(--dz-colors-neutral-950);
  --dz-foreground: var(--dz-colors-neutral-50);
}
```

For product-specific presets, keep overrides in an app or theme package. Do not
move brand-only tokens into `@dzup-ui/tokens` unless they are generic enough for
all library consumers.

## Automated Application Workflow

Use this workflow when an app already uses `@dzup-ui/core` and
`@dzup-ui/tokens`, and the goal is to apply a reviewed `DESIGN.md` contract to
that app.

The automation should produce a plan and a patch. It should not directly mutate
the dzup-ui library unless the task explicitly targets reusable library tokens.

### Required Inputs

| Input | Required | Purpose |
| --- | --- | --- |
| App `DESIGN.md` or promoted `DESIGN.generated.md` | Yes | Source design contract |
| `DESIGN.tokens.generated.json` | Preferred | Structured token candidates and evidence |
| `MAPPING_TOKENS.md` | Yes | dzup-ui mapping rules |
| App package files | Yes | Confirm the app consumes `@dzup-ui/core` and `@dzup-ui/tokens` |
| App root styles | Yes | Find the right place for app-level `--dz-*` overrides |
| App component inventory | Preferred | Identify raw controls that should become dzup-ui components |
| Current screenshots or UX extraction artifacts | Preferred | Verify the patch against rendered UI evidence |

### Generated Outputs

Automation should write or report these outputs:

```text
DESIGN_TO_DZUP_UI_PLAN.md
DESIGN_TO_DZUP_UI_PATCH_SUMMARY.md
```

Generate the first-pass plan with:

```bash
yarn design:application-plan --app <app-path> --design <app-path>/DESIGN.md --out <app-path>/docs/DESIGN_TO_DZUP_UI_PLAN.md
```

Add `--tokens <app-path>/DESIGN.tokens.generated.json` when structured
extraction evidence exists. The command is read-only except for the generated
plan file; implementation patches still require the follow-up app-specific
editing pass.

For small tasks the plan and summary may be inline in the agent response, but
for broad app-wide work they should be checked into the target app docs folder.

### Application Steps

1. Confirm package usage.
   - The app should import `@dzup-ui/tokens/css` and `@dzup-ui/core/styles`.
   - The app should use `DzThemeProvider` or a documented equivalent
     `data-theme` strategy.
2. Locate the app override layer.
   - Prefer an app-owned stylesheet such as `src/styles/design-tokens.css`,
     `src/styles/theme.css`, or `src/assets/main.css`.
   - Keep overrides app-owned unless the requested change is a reusable
     dzup-ui library improvement.
3. Map design tokens.
   - Map raw values to existing `--dz-*` primitives, semantic roles, or
     component tokens using this document.
   - Add app-level CSS variable overrides for reviewed product values.
4. Map controls.
   - Replace repeated raw buttons, fields, cards, dialogs, tabs, badges, and
     data tables with `@dzup-ui/core` components where the behavior matches.
   - Preserve app-specific business logic and routing.
5. Apply interaction contracts.
   - Use `DzButton` or button semantics for explicit actions.
   - Use `DzInput` or input semantics for text entry.
   - Use control semantics for navigation, selection, toggles, list rows, and
     menu items.
   - Use `input-shell` semantics for composite controls with nested inputs.
6. Verify.
   - Run the target app's focused typecheck/test/lint command.
   - Run visual or browser smoke checks when the change affects layout or
     critical flows.
   - Report unrelated failures separately.

### Control Mapping

| Source pattern in app | Preferred dzup-ui target | Notes |
| --- | --- | --- |
| Raw `<button>` for actions | `DzButton`, `DzIconButton`, `DzCopyButton`, `DzSplitButton` | Preserve submit/navigation semantics. Use icon-only components for icon-only actions. |
| Toggle or pressed button | `DzToggleButton` or control semantics | Preserve `aria-pressed` or selected state. |
| Raw text input | `DzInput`, `DzTextarea`, `DzInputGroup` | Keep validation, labels, descriptions, and model bindings intact. |
| Checkbox, radio, switch, slider | Matching form/control component | Use control focus/disabled semantics. |
| Select, combobox, date picker | Matching dzup-ui form component | Do not collapse advanced picker behavior into plain inputs. |
| Repeated card or panel markup | `DzCard`, `DzCardHeader`, `DzCardBody`, `DzCardFooter` | Keep dense product dashboards restrained and scannable. |
| Status pill or count label | `DzBadge`, `DzTag`, status-specific component | Map status colors to semantic status tokens. |
| Alert, toast, notification, empty state | Feedback components | Preserve live-region and dismiss behavior. |
| Modal, sheet, dropdown, popover | Overlay components | Preserve focus trap, trigger, escape, and outside-click behavior. |
| Sidebar, tabs, breadcrumbs, pagination | Navigation components | Preserve route state and current/selected indicators. |
| Data table or grid | `DzTable` or `DzDataGrid` | Preserve row keys, sorting, filtering, pagination, and a11y roles. |
| Layout shell | `DzAppShell`, `DzSidebar`, stack/grid/layout primitives | Do not bake app route names into library components. |

### Safe Patch Policy

Automation may change:

- app-owned CSS variable overrides
- app component templates that use raw controls where a dzup-ui component is a
  behavior match
- app imports for `@dzup-ui/core` components
- app docs that record the mapping and validation result

Automation must not change by default:

- `ui/dzup-ui/packages/tokens/src/*`
- `ui/dzup-ui/packages/core/src/*`
- public component prop/event contracts
- generated `DESIGN.generated.md` evidence

Library changes require an explicit second task after the app mapping proves a
reusable gap.

## LLM Prompt Contract

Use [`DESIGN_MD_APPLICATION_PROMPT.md`](./DESIGN_MD_APPLICATION_PROMPT.md) as
the reusable implementation prompt. The prompt instructs an LLM to:

- read `DESIGN.md` and this mapping doc
- inspect the target app's actual dzup-ui usage
- produce a mapping plan before editing
- apply app-owned `--dz-*` overrides
- replace raw controls with dzup-ui components only when behavior matches
- preserve evidence and report validation

## Promotion Checklist

Before moving a value from `DESIGN.md` evidence into `ui/dzup-ui`:

- The value appears in reviewed `DESIGN.md` or in generated evidence with
  preserved route, viewport, count, and source-field metadata.
- The target tier is explicit: primitive, semantic, or component.
- Existing `--dz-*` tokens were checked before adding a new token.
- The mapping avoids app-specific names and product workflow terms.
- Light and dark behavior is defined when the token affects color.
- Component tokens name component parts and states when applicable.
- Accessibility implications are reviewed for contrast, target size, focus, and
  disabled states.
- `yarn tokens:generate` is run after token source changes.
- Relevant validation is run: `yarn validate:tokens`, focused component tests,
  and broader validation when public token names or component APIs change.

## Output Contract For Promotion Reviews

A promotion-review command should read generated evidence and write review
artifacts without mutating canonical files by default.

Recommended inputs:

```text
DESIGN.generated.md
DESIGN.tokens.generated.json
analysis/design-definition-audit.json
analysis/component-inventory.json
analysis/token-candidates.json
```

Recommended outputs:

```text
MAPPING_TOKENS.review.md
DESIGN.promotion.generated.json
```

`MAPPING_TOKENS.review.md` should list proposed mappings in this shape:

| Source | Evidence | Proposed dzup-ui token | Tier | Decision |
| --- | --- | --- | --- | --- |
| `#1b1d1f` text color | color, high count, dashboard routes | `--dz-foreground` | Semantic | needs review |
| `8px` radius | borderRadius, high count | `--dz-radius-lg` | Primitive | candidate |
| button md height | button bucket, md examples | `--dz-button-md-height` | Component | candidate |

Only a human-reviewed follow-up should update `packages/tokens/src/*` or
component variant files.
