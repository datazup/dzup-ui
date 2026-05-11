# Prompt: Apply DESIGN.md To A dzup-ui App

Use this prompt when an application already consumes `@dzup-ui/core` and
`@dzup-ui/tokens`, and you need an LLM agent to apply an app `DESIGN.md` to the
current implementation.

This prompt is for app implementation. It should not modify the reusable
`ui/dzup-ui` library unless the user explicitly asks for a library change.

## Prompt

```text
You are applying a DESIGN.md contract to an existing Vue application that uses
@dzup-ui/core and @dzup-ui/tokens.

Repository and scope:
- Target app: <APP_PATH>
- Design contract: <PATH_TO_DESIGN_MD>
- Optional structured tokens: <PATH_TO_DESIGN_TOKENS_JSON>
- dzup-ui mapping rules: ui/dzup-ui/MAPPING_TOKENS.md

Goal:
Apply the design contract to the app using dzup-ui token overrides and dzup-ui
components. Keep the app's business logic, routing, API calls, and data flow
unchanged.

Required first pass:
1. Read the target app's local AGENTS.md or repo instructions if present.
2. Confirm package manager, app structure, and local validation commands.
3. Read DESIGN.md and ui/dzup-ui/MAPPING_TOKENS.md.
4. Inspect current dzup-ui usage:
   - @dzup-ui/tokens/css import
   - @dzup-ui/core/styles import
   - DzThemeProvider or data-theme strategy
   - app-owned stylesheets that can hold --dz-* overrides
   - raw controls/components that duplicate dzup-ui behavior
5. Produce a short implementation plan before editing.

Token mapping rules:
- Prefer app-owned CSS variable overrides over modifying dzup-ui source.
- Map DESIGN.md colors to existing --dz-* semantic tokens first:
  --dz-background, --dz-foreground, --dz-surface, --dz-surface-raised,
  --dz-muted, --dz-muted-foreground, --dz-border, --dz-border-hover,
  --dz-ring, --dz-primary, --dz-primary-foreground, --dz-primary-hover,
  --dz-success, --dz-warning, --dz-danger, --dz-info, and matching
  foreground/muted roles.
- Map component-specific values to component tokens when the value belongs to
  one component family, for example --dz-button-radius or --dz-sidebar-bg.
- Map spacing/radius/elevation/typography to existing dzup-ui scales where
  possible.
- Treat negative spacing and one-off extracted values as implementation
  exceptions. Do not promote them to reusable tokens.
- Do not create new dzup-ui primitives unless the user explicitly approved a
  library change.

Control mapping rules:
- Replace raw action buttons with DzButton, DzIconButton, DzCopyButton,
  DzToggleButton, or DzSplitButton when behavior matches.
- Replace raw text fields with DzInput, DzTextarea, DzInputGroup, or an
  appropriate form component when behavior matches.
- Replace repeated panels with DzCard parts when the structure is a true card.
- Replace status pills with DzBadge, DzTag, or existing status components.
- Replace modal/sheet/popover/dropdown surfaces with dzup-ui overlay components
  only if focus behavior, trigger behavior, and escape/outside-click behavior
  can be preserved.
- Replace data tables with DzTable or DzDataGrid only if sorting, filtering,
  pagination, row keys, and accessibility roles remain correct.
- Preserve custom app components when they contain product-specific behavior
  that dzup-ui does not cover.

Interaction contract:
- Use button semantics for explicit actions.
- Use control semantics for navigation, selection, toggles, list rows, and menu
  items.
- Use input semantics for direct text entry.
- Use input-shell semantics for composite fields that delegate to nested inputs.
- Do not duplicate raw border/radius/focus class sets in templates when a
  dzup-ui component or interaction utility already covers the behavior.

Patch constraints:
- Do not overwrite DESIGN.md or DESIGN.generated.md.
- Do not change unrelated files.
- Do not change public API contracts unless explicitly requested.
- Do not refactor unrelated app layout or feature behavior.
- Keep edits narrow and route/component focused.
- If the app has unrelated dirty files, work around them and do not revert them.

Expected output:
1. A concise mapping plan:
   - token overrides to add or update
   - controls/components to migrate
   - files to edit
   - validation commands to run
2. The implementation patch.
3. A final summary:
   - files changed
   - DESIGN.md tokens mapped
   - dzup-ui components introduced or retained
   - validation commands and results
   - residual gaps or values left for human review

Validation:
- Run focused typecheck/lint/tests for the target app when available.
- Run browser or screenshot smoke checks for layout-sensitive changes when the
  app can be started locally.
- If validation fails for unrelated pre-existing reasons, separate those from
  current-slice failures.
```

## Expected Mapping Plan Shape

```md
# DESIGN.md to dzup-ui Application Plan

## Scope
- Target app:
- Design contract:
- Routes/components touched:

## Token Overrides
| DESIGN.md source | dzup-ui token | File | Decision |
| --- | --- | --- | --- |

## Control Migration
| Current pattern | dzup-ui target | File | Risk |
| --- | --- | --- | --- |

## Validation
- [ ] typecheck:
- [ ] lint:
- [ ] tests:
- [ ] browser smoke:

## Out Of Scope
- Reusable dzup-ui library token changes
- Public component API changes
- Generated evidence mutation
```

## Preferred Patch Pattern

Add app-owned overrides in one stable stylesheet:

```css
:root {
  --dz-background: <mapped value>;
  --dz-foreground: <mapped value>;
  --dz-primary: <mapped value>;
  --dz-ring: var(--dz-primary);
}

[data-theme="dark"] {
  --dz-background: <mapped dark value>;
  --dz-foreground: <mapped dark value>;
}
```

Then migrate local raw controls only where behavior matches:

```vue
<script setup lang="ts">
import { DzButton, DzCard, DzCardBody, DzCardHeader, DzInput } from '@dzup-ui/core'
</script>
```

Do not introduce a wrapper component solely to hide one dzup-ui import. Add an
app wrapper only when it centralizes real product behavior or repeated layout
policy.

