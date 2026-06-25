# @dzup-ui/tokens

## 0.1.0

### Minor Changes

- ddd50b7: Canonicalize sidebar color tokens and add the missing `--dz-appshell-sidebar-width` definition.
  - New canonical token names: `--dz-sidebar-foreground`, `--dz-sidebar-foreground-hover`, `--dz-sidebar-heading`, `--dz-sidebar-header-bg`, `--dz-sidebar-footer-bg`. These already existed at the semantic tier; they are now also emitted at the component default tier, fixing the cascade collision that prevented `@datazup/dzup-theme` and similar brand presets from cleanly overriding sidebar paint.
  - `--dz-sidebar-text` and `--dz-sidebar-text-hover` are kept as deprecated aliases that resolve to the canonical names. They will be removed in the next major.
  - `--dz-sidebar-section-title-color` now resolves through `--dz-sidebar-heading` instead of `--dz-muted-foreground` directly. Apps that override the heading token will see the change reflected in section titles automatically.
  - New token `--dz-appshell-sidebar-width: var(--dz-sidebar-width)` — fixes a four-week-old orphan: `DzAppShell.variants.ts` reads this token but no source file defined it. With this fix the existing `DzAppShell` `sidebarWidth` prop has the correct token plumbing for downstream variant rewrites.

  No existing component variants change in this release. Variant rewrites that consume the canonical names ship in a follow-up minor (Phase 2 / Phase 3 of the shell improvement plan in `apps/website-app/docs/analysis/dzup-ui-shell-improvement-pm-plan-2026-04-29.md`).

## 0.1.0-alpha.0 (2026-04-02)

### Features

- Initial alpha release of dzup-ui design token system
- CSS custom properties with `--dz-*` namespace
- Light and dark theme support via `data-theme` attribute
- Tailwind CSS 4 integration via `@theme` directive
- Generated artifacts: tokens.css, tokens.d.ts, tailwind-theme.js
- Token categories: colors, spacing, radius, shadows, typography, transitions
- Semantic color tokens (primary, success, warning, danger, info)
- Component-level token overrides
