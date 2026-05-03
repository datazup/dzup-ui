# Sidebar & AppShell Design Token Audit

Date: 2026-04-29
Task: 1.1 (PM plan: `apps/website-app/docs/analysis/dzup-ui-shell-improvement-pm-plan-2026-04-29.md`)
Scope: `ui/dzup-ui/packages/tokens/`, `ui/dzup-ui/packages/core/`, `shared-kit/shared-app-kit/dzup-theme/`, `apps/**`

## 1. Token Source Files

The tokens package uses a **TypeScript codegen pipeline**, not hand-written CSS.

```
ui/dzup-ui/packages/tokens/src/
├── generate.ts              ← build script (yarn workspace @dzup-ui/tokens generate)
├── index.ts
├── component/
│   ├── sidebar.ts           ← Family A source (SIDEBAR_TOKENS object)
│   ├── appshell.ts          ← AppShell tokens (APPSHELL_TOKENS object)
│   ├── button.ts, card.ts, …
├── semantic/
│   ├── light.ts             ← Family B source (sidebar block at lines 90-99)
│   └── dark.ts              ← Family B dark overrides (lines 93-102)
├── primitives/              ← color, spacing, …
└── utils/
```

`generate.ts` imports all `*_TOKENS` objects, calls `formatVars()`, and `writeFileSync` to `dist/tokens.css`. Plain Node ESM, no separate build tool.

**Phase 1 edit targets:** `src/component/sidebar.ts`, `src/component/appshell.ts`, `src/semantic/light.ts`, `src/semantic/dark.ts`.

## 2. Cross-File Token Usage (source only)

| Token | Refs | Defined | Read |
|---|---|---|---|
| `--dz-sidebar-bg` | 92 | `semantic/light.ts`, `semantic/dark.ts`, `preset-dark-sidebar.css`, `base.css` | `DzSidebar.tokens.ts`, website-app `App.vue`, `legacy-aliases.css` |
| `--dz-sidebar-text` | 63 | `component/sidebar.ts`, `preset-dark-sidebar.css`, `base.css` | `DzSidebar.tokens.ts`, `legacy-aliases.css` |
| `--dz-sidebar-border` | 62 | `semantic/light.ts`, `semantic/dark.ts`, `preset-dark-sidebar.css`, `base.css` | `DzSidebar.tokens.ts`, website-app `App.vue` |
| `--dz-sidebar-item-active-bg` | 52 | `semantic/light.ts`, `semantic/dark.ts`, `component/sidebar.ts`, `preset-dark-sidebar.css` | `DzSidebar.tokens.ts`, `legacy-aliases.css` |
| `--dz-sidebar-item-active-text` | 43 | `semantic/light.ts`, `semantic/dark.ts`, `component/sidebar.ts` | `DzSidebar.tokens.ts`, `legacy-aliases.css` |
| `--dz-sidebar-item-hover-text` | 40 | `semantic/light.ts`, `semantic/dark.ts`, `component/sidebar.ts` | `DzSidebar.tokens.ts` |
| `--dz-sidebar-item-hover-bg` | 38 | `semantic/light.ts`, `semantic/dark.ts`, `component/sidebar.ts` | `DzSidebar.tokens.ts`, codev-app `App.vue` |
| `--dz-sidebar-text-hover` | 32 | `component/sidebar.ts`, `preset-dark-sidebar.css` | `DzSidebar.tokens.ts`, `legacy-aliases.css` |
| `--dz-sidebar-width` | 28 | `component/sidebar.ts`, `base.css` | `DzSidebar.tokens.ts`, `DzSidebar.vue` |
| `--dz-sidebar-collapsed-width` | 26 | `component/sidebar.ts`, `base.css` | `DzSidebar.tokens.ts`, `DzSidebar.vue` |
| `--dz-sidebar-foreground` | 25 | `semantic/light.ts`, `semantic/dark.ts` | `DzSidebar.tokens.ts`, website-app `App.vue` |
| `--dz-sidebar-overlay-bg` | 19 | `component/sidebar.ts` | `DzSidebar.tokens.ts` |
| `--dz-sidebar-header-bg` / `--dz-sidebar-footer-bg` | 17 each | `semantic/light.ts`, `semantic/dark.ts` | (read only in dist consumers) |
| `--dz-sidebar-heading` | 15 | `semantic/light.ts`, `semantic/dark.ts` | (no source reader) |
| `--dz-appshell-main-bg` | 61 | `semantic/light.ts`, `semantic/dark.ts`, `component/appshell.ts`, `base.css` | `DzAppShell.tokens.ts`, codev-app views |
| `--dz-appshell-header-height` | 24 | `component/appshell.ts`, `base.css` | `DzAppShell.tokens.ts` |
| `--dz-appshell-sidebar-width` | 18 | **undefined in any source** | `DzAppShell.variants.ts`, `DzAppShell.spec.ts` |
| `--dz-appshell-header-bg` / `--dz-appshell-header-border` | 18 each | `semantic/light.ts`, `semantic/dark.ts`, `component/appshell.ts` | `DzAppShell.tokens.ts` |

**Orphans (read but never defined):** `--dz-sidebar-foreground-hover` (4 refs), `--dz-sidebar-mobile-width` (1), `--dz-sidebar-active-bg`, `--dz-sidebar-active-text`, `--dz-sidebar-hover` (2 each), `--dz-appshell-content-offset`, `--dz-appshell-root-bg`, `--dz-appshell-main-overflow`, `--dz-appshell-content-bg` (1 each).

## 3. DzAppShell Token Coverage

`src/component/appshell.ts` defines 8 tokens:

| Token | In `DzAppShell.variants.ts`? |
|---|---|
| `--dz-appshell-header-height` | ❌ (hardcoded `h-16`) |
| `--dz-appshell-header-bg` | ❌ |
| `--dz-appshell-header-border` | ❌ |
| `--dz-appshell-header-z-index` | ❌ (hardcoded `z-30`) |
| `--dz-appshell-header-padding-x` | ❌ (hardcoded `px-4`) |
| `--dz-appshell-main-bg` | ❌ |
| `--dz-appshell-main-padding` | ❌ |
| `--dz-appshell-transition` | ❌ (hardcoded `duration-300 ease-in-out`) |
| **`--dz-appshell-sidebar-width`** | **✅ (only token read by variants — but undefined in source)** |

**Critical bug:** `--dz-appshell-sidebar-width` is read by `DzAppShell.variants.ts:17` (`ml-[var(--dz-appshell-sidebar-width,0px)]`) but no source file defines it. This is the root cause of the website-app auto-margin issue — variants emit a default of `0px`, but `DzAppShell.vue:49` writes the variable from the `sidebarWidth` prop, double-applying width.

## 4. Family A vs Family B Mapping

| Family A (`component/sidebar.ts`) | Family B (`semantic/{light,dark}.ts`) | Status |
|---|---|---|
| `--dz-sidebar-bg` | `--dz-sidebar-bg` | **Cascade collision** — A defaults to `var(--dz-surface)`; B hard-codes `neutral-900/950`. B wins at Tier 2. |
| `--dz-sidebar-border` | `--dz-sidebar-border` | Same collision |
| `--dz-sidebar-text` | `--dz-sidebar-foreground` | **Name mismatch** |
| `--dz-sidebar-text-hover` | *(none)* | A only |
| `--dz-sidebar-item-hover-bg` | `--dz-sidebar-item-hover-bg` | ✓ |
| `--dz-sidebar-item-hover-text` | `--dz-sidebar-item-hover-text` | ✓ |
| `--dz-sidebar-item-active-bg` | `--dz-sidebar-item-active-bg` | ✓ |
| `--dz-sidebar-item-active-text` | `--dz-sidebar-item-active-text` | ✓ |
| *(none)* | `--dz-sidebar-heading` | B only |
| `--dz-sidebar-header-padding`, `--dz-sidebar-header-border` | `--dz-sidebar-header-bg` | Partial (A: structural, B: bg) |
| `--dz-sidebar-footer-padding`, `--dz-sidebar-footer-border` | `--dz-sidebar-footer-bg` | Partial |
| `--dz-sidebar-width`, `--dz-sidebar-collapsed-width` | *(none)* | A only |
| `--dz-sidebar-z-index`, `--dz-sidebar-transition` | *(none)* | A only |
| `--dz-sidebar-overlay-bg`, `--dz-sidebar-overlay-z-index` | *(none)* | A only |
| `--dz-sidebar-item-radius`, `--dz-sidebar-section-*` | *(none)* | A only (7 structural tokens) |

**Decision:** Adopt Family B names for color tokens (canonical: `--dz-sidebar-foreground`, not `--dz-sidebar-text`). Keep Family A structural tokens (widths, padding, transition, z-index, radius). Resolve cascade collision by removing `--dz-sidebar-bg` / `--dz-sidebar-border` from `semantic/{light,dark}.ts` — those values belong only in the brand preset.

## 5. External Consumers

11 unique files (8 canonical paths after worktree dedup):

| File | Refs |
|---|---|
| `shared-kit/shared-app-kit/dzup-theme/src/styles/preset-dark-sidebar.css` | 14 |
| `shared-kit/shared-app-kit/dzup-theme/src/styles/base.css` | 10 |
| `shared-kit/shared-app-kit/dzup-theme/src/styles/legacy-aliases.css` | 6 |
| `apps/website-app/apps/web/src/App.vue` | 4 |
| `apps/codev-app/apps/web/src/App.vue` | 2 |
| `apps/codev-app/apps/web/src/views/OrchestrationWorkspaceView.vue` | 1 |
| `apps/codev-app/apps/web/src/views/ForbiddenView.vue` | 1 |
| `apps/codev-app/apps/web/src/views/AdminOrchestrationView.vue` | 1 |
| `apps/codev-app/apps/web/src/components/orchestration/OrchestrationPropsPanel.vue` | 1 |
| `apps/codev-app/apps/web/src/components/orchestration/ChatInputBar.vue` | 1 |
| `apps/website-app/apps/web/src/__tests__/AppShell.test.ts` | 1 |

`ui/dzup-ui-pro` — no sidebar/appshell token consumers.

## 6. Recommended Canonical Token Set

Adopt Family B color names + Family A structural names. Add missing pieces.

### Tier 3 — `@dzup-ui/tokens` (`src/component/sidebar.ts`)

| Token | Neutral default |
|---|---|
| `--dz-sidebar-bg` | `var(--dz-surface)` |
| `--dz-sidebar-foreground` | `var(--dz-muted-foreground)` |
| `--dz-sidebar-foreground-hover` | `var(--dz-foreground)` *(NEW, replaces `--dz-sidebar-text-hover`)* |
| `--dz-sidebar-border` | `var(--dz-border)` |
| `--dz-sidebar-heading` | `var(--dz-muted-foreground)` |
| `--dz-sidebar-item-hover-bg` | `var(--dz-accent)` |
| `--dz-sidebar-item-hover-text` | `var(--dz-accent-foreground)` |
| `--dz-sidebar-item-active-bg` | `var(--dz-primary)` |
| `--dz-sidebar-item-active-text` | `var(--dz-primary-foreground)` |
| `--dz-sidebar-header-bg` | `var(--dz-surface)` *(NEW)* |
| `--dz-sidebar-footer-bg` | `var(--dz-surface)` *(NEW)* |
| `--dz-sidebar-overlay-bg` | `var(--dz-overlay-bg)` |
| `--dz-sidebar-width` | `16rem` |
| `--dz-sidebar-collapsed-width` | `4rem` |
| `--dz-sidebar-z-index` | `var(--dz-z-sticky)` |
| `--dz-sidebar-transition` | `width var(--dz-duration-normal) var(--dz-ease-default)` |

### Tier 3 — `@dzup-ui/tokens` (`src/component/appshell.ts`)

Add: `--dz-appshell-sidebar-width: var(--dz-sidebar-width)` *(NEW — fixes orphan)*. Keep the 8 existing.

### Deprecated aliases

In `src/component/sidebar.ts` keep for one minor:
- `--dz-sidebar-text: var(--dz-sidebar-foreground)`
- `--dz-sidebar-text-hover: var(--dz-sidebar-foreground-hover)`
Mark `@deprecated` in TS JSDoc.

### Tier 2 — `semantic/light.ts` / `semantic/dark.ts`

Remove all `--dz-sidebar-*` entries. Hard-coded brand values do not belong in the semantic tier; they belong in `@datazup/dzup-theme/preset-dark-sidebar.css` only. This eliminates the cascade collision.

### Tier 2 — `@datazup/dzup-theme/preset-dark-sidebar.css`

Rewrite to write the canonical Family B names: `--dz-sidebar-foreground`, `--dz-sidebar-foreground-hover`, `--dz-sidebar-heading`, `--dz-sidebar-header-bg`, `--dz-sidebar-footer-bg`, `--dz-sidebar-overlay-bg`, plus the existing item hover/active tokens. Drop `--dz-sidebar-text` and `--dz-sidebar-text-hover` writes (deprecated aliases handle them).

### Migration in `DzSidebar.variants.ts` (Phase 3)

| Today | Target |
|---|---|
| `bg-[var(--dz-background)]` | `bg-[var(--dz-sidebar-bg)]` |
| `text-[var(--dz-foreground)]` | `text-[var(--dz-sidebar-foreground)]` |
| `hover:bg-[var(--dz-muted)]` | `hover:bg-[var(--dz-sidebar-item-hover-bg)]` |
| `bg-black/50` | `bg-[var(--dz-sidebar-overlay-bg)]` |
| `w-64` / `w-16` | `w-[var(--dz-sidebar-width)]` / `w-[var(--dz-sidebar-collapsed-width)]` |

### Migration in `DzAppShell.variants.ts` (Phase 2)

| Today | Target |
|---|---|
| `h-16` | `h-[var(--dz-appshell-header-height)]` |
| `z-30` | `z-[var(--dz-appshell-header-z-index)]` |
| `border-b px-4` | `border-b border-[var(--dz-appshell-header-border)] px-[var(--dz-appshell-header-padding-x)] bg-[var(--dz-appshell-header-bg)]` |
| `duration-300 ease-in-out` | `transition-[var(--dz-appshell-transition)]` |
| `ml-[var(--dz-appshell-sidebar-width,0px)]` | DELETE (sidebar is a flex sibling) |
| (no main bg/padding) | `bg-[var(--dz-appshell-main-bg)] p-[var(--dz-appshell-main-padding)]` |

## Critical bugs found beyond Phase 1 scope

1. **`--dz-appshell-sidebar-width` orphan** — read but never defined. Source plan and PM plan both implicitly assumed it was defined. Phase 1.2 must add it.
2. **Cascade collision on `--dz-sidebar-bg` and `--dz-sidebar-border`** — defined at both tier 2 and tier 3. Tier 2 wins, masking the neutral defaults. Removing tier 2 entries (per §6) fixes this.
3. **`--dz-sidebar-foreground-hover` orphan** — already referenced 4× but never defined. Phase 1.2 adds it.
