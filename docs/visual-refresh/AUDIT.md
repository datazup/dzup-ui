# Visual-Quality Audit — Phase 0

**Scope:** `@dzup-ui/tokens` primitive/semantic/component tiers + the 15 most-used component
variant files in `@dzup-ui/core`.
**Goal:** Decide exactly which **token values** (and the rare structural variant) to change so
dzup-ui-built UI matches hand-styled modern Tailwind: rich layered shadows, clear surface
elevation, a confident accent, snappy motion, visible focus rings, and crisp type rhythm.

**Hard constraints (frozen by ADR-02 / Contract Spec v1):**

- Values only. No renaming / adding / removing token keys, variant keys, or component props.
- All existing keys are kept; only their right-hand values change.
- Prefer primitive / semantic / component-tier changes (wide cascade) over per-component variant edits.
- Colors and shadows expressed in OKLCH (codebase standard).

---

## 1. Axis Scores (0–100)

| Axis                      | Score  | One-line justification                                                                                                                                                                     |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Color richness / contrast | **48** | Primary chroma 0.18 reads muted vs. confident SaaS accents (~0.22–0.25); status hues fine. The real contrast hit is surface-vs-surface, not text.                                          |
| Elevation / shadow scale  | **30** | Worst axis. Light-mode alphas (0.04–0.15) are barely visible; `md` is a hairline; cards default to `sm`. No layered "ambient + key" depth.                                                 |
| Radius scale              | **62** | Reasonable but conservative. Card uses `lg` (0.5rem) where modern surfaces sit at 0.625–0.75rem; buttons at `md` (0.375rem) feel dated next to 0.5rem norms.                               |
| Spacing density           | **70** | 4px base scale is complete and well-formed. Card padding (`spacing-6`/24px) and table density are fine; no structural problem.                                                             |
| Motion / transitions      | **58** | Durations OK (150/200/300) but the only easing actually wired is `ease-default` (a symmetric in-out); no spring/emphasized curve, and `bounce` is unused. Snappy enough, not characterful. |
| Focus treatment           | **45** | Button/control rings are 2px (good), but **input ring is 1px with 1px offset** — nearly invisible, the highest-traffic control. Ring color = primary-500 (muted, see color axis).          |
| Typographic rhythm        | **72** | Heading scale, weights, tracking are solid and modern (tight tracking on large sizes). Minor: body relies on default leading; headings already use snug/tight well.                        |

**Worst offenders per axis**

- Elevation: `SHADOW_SCALE.md`/`lg` (cards, dialogs, popovers all look flat); `DzCard` elevated default = `shadow-sm`.
- Color: `--dz-primary` (primary-500 @ chroma 0.18); `--dz-surface-raised` (see §1.1).
- Focus: `INPUT_TOKENS --dz-input-focus-ring-width: 1px` + `--dz-input-focus-ring-offset: 1px`.
- Radius: `CARD_TOKENS --dz-card-radius` (lg) and `BUTTON_TOKENS --dz-button-radius` (md).
- Motion: `EASINGS` — no emphasized/standard split actually consumed.

### 1.1 Confirmed: surface-raised elevation collision (light mode)

In `semantic/light.ts`:

```
--dz-background:     var(--dz-colors-neutral-50)
--dz-surface-raised: var(--dz-colors-neutral-50)   ← identical to background
--dz-surface:        oklch(1 0 0)                   (white)
```

`--dz-background` and `--dz-surface-raised` resolve to the **same** `neutral-50`. A "raised"
surface placed on the page background is therefore visually flat — no elevation separation at
all. This is the single biggest reason the system reads "flat/muted." Dark mode is correct
(`neutral-950` bg vs `neutral-800` raised). **This must be fixed in §2.2.**

The cleaner modern arrangement (light): page background = a faint neutral-100-ish tint, plain
surfaces = white, raised surfaces = white **plus** a real shadow. Below we (a) push `background`
slightly darker than the white surface so cards/raised surfaces visibly float, and (b) make
`surface-raised` = white so raised-on-page has true tonal separation, paired with the stronger
shadow scale from §2.1.

---

## 2. Prioritized Delta List

Priority key: **P0** = fixes the flat look directly (ship first); **P1** = strong polish; **P2** = refinement.

### 2.1 Shadows — `packages/tokens/src/primitives/shadows.ts`

Layered "ambient + key" shadows with materially higher alpha. Modern hand-styled Tailwind shadows
sit around 0.08–0.18 ambient with a tighter darker key layer. All OKLCH black, two-layer.

| Pri | File       | Token / Selector          | Current value                                                    | Proposed value                                                     | Rationale                                                              |
| --- | ---------- | ------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| P0  | shadows.ts | `SHADOW_SCALE.xs`         | `0 1px 2px oklch(0 0 0 / 0.04)`                                  | `0 1px 2px oklch(0 0 0 / 0.06)`                                    | Barely-there → faint but present hairline.                             |
| P0  | shadows.ts | `SHADOW_SCALE.sm`         | `0 1px 3px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)`   | `0 1px 3px oklch(0 0 0 / 0.10), 0 1px 2px oklch(0 0 0 / 0.06)`     | Card resting elevation; current is invisible on white.                 |
| P0  | shadows.ts | `SHADOW_SCALE.md`         | `0 4px 6px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04)`   | `0 4px 8px oklch(0 0 0 / 0.10), 0 2px 4px oklch(0 0 0 / 0.07)`     | Default elevated card/menu depth; biggest single visible win.          |
| P0  | shadows.ts | `SHADOW_SCALE.lg`         | `0 10px 15px oklch(0 0 0 / 0.08), 0 4px 6px oklch(0 0 0 / 0.04)` | `0 12px 20px oklch(0 0 0 / 0.12), 0 4px 8px oklch(0 0 0 / 0.08)`   | Hover lift + select/dropdown content; needs real separation from page. |
| P1  | shadows.ts | `SHADOW_SCALE.xl`         | `0 20px 25px oklch(0 0 0 / 0.1), 0 8px 10px oklch(0 0 0 / 0.04)` | `0 24px 32px oklch(0 0 0 / 0.16), 0 8px 12px oklch(0 0 0 / 0.10)`  | Dialog content; must feel clearly afloat over the overlay scrim.       |
| P1  | shadows.ts | `SHADOW_SCALE.2xl`        | `0 25px 50px oklch(0 0 0 / 0.15)`                                | `0 32px 64px oklch(0 0 0 / 0.22), 0 12px 24px oklch(0 0 0 / 0.12)` | Top-tier modals/command palette; add a key layer for richness.         |
| P2  | shadows.ts | `SHADOW_SCALE.inner`      | `inset 0 2px 4px oklch(0 0 0 / 0.05)`                            | `inset 0 2px 4px oklch(0 0 0 / 0.07)`                              | Slightly deeper wells (inputs/filled surfaces).                        |
| P0  | shadows.ts | `SHADOW_SCALE_DARK.sm`    | `0 1px 3px oklch(0 0 0 / 0.15), 0 1px 2px oklch(0 0 0 / 0.1)`    | `0 1px 3px oklch(0 0 0 / 0.30), 0 1px 2px oklch(0 0 0 / 0.20)`     | Dark surfaces absorb light; needs higher alpha for any read.           |
| P0  | shadows.ts | `SHADOW_SCALE_DARK.md`    | `0 4px 6px oklch(0 0 0 / 0.15), 0 2px 4px oklch(0 0 0 / 0.1)`    | `0 4px 8px oklch(0 0 0 / 0.35), 0 2px 4px oklch(0 0 0 / 0.22)`     | Default elevated depth in dark mode.                                   |
| P1  | shadows.ts | `SHADOW_SCALE_DARK.lg`    | `0 10px 15px oklch(0 0 0 / 0.2), 0 4px 6px oklch(0 0 0 / 0.1)`   | `0 12px 20px oklch(0 0 0 / 0.45), 0 4px 8px oklch(0 0 0 / 0.28)`   | Hover/dropdown depth in dark mode.                                     |
| P1  | shadows.ts | `SHADOW_SCALE_DARK.xl`    | `0 20px 25px oklch(0 0 0 / 0.25), 0 8px 10px oklch(0 0 0 / 0.1)` | `0 24px 32px oklch(0 0 0 / 0.55), 0 8px 12px oklch(0 0 0 / 0.30)`  | Dialogs in dark mode.                                                  |
| P2  | shadows.ts | `SHADOW_SCALE_DARK.2xl`   | `0 25px 50px oklch(0 0 0 / 0.35)`                                | `0 32px 64px oklch(0 0 0 / 0.60), 0 12px 24px oklch(0 0 0 / 0.35)` | Top-tier modals, dark.                                                 |
| P2  | shadows.ts | `SHADOW_SCALE_DARK.xs`    | `0 1px 2px oklch(0 0 0 / 0.1)`                                   | `0 1px 2px oklch(0 0 0 / 0.20)`                                    | Hairline in dark.                                                      |
| P2  | shadows.ts | `SHADOW_SCALE_DARK.inner` | `inset 0 2px 4px oklch(0 0 0 / 0.15)`                            | `inset 0 2px 4px oklch(0 0 0 / 0.25)`                              | Inset wells, dark.                                                     |

**Cascade:** every `shadow-[var(--dz-shadow-*)]` reference (DzCard, DzSelect content, DzDialog,
DzTooltip, DzSwitch thumb, popovers, menus) updates automatically.

### 2.2 Semantics — `packages/tokens/src/semantic/light.ts` + `semantic/dark.ts`

Fix the elevation collision and lift the accent confidence. Color richness is raised primarily
via the accent semantic mapping (the primitive chroma bump is in §2.3 as it is a primitive value).

| Pri | File              | Token / Selector        | Current value                  | Proposed value                 | Rationale                                                                                        |
| --- | ----------------- | ----------------------- | ------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| P0  | semantic/light.ts | `--dz-background`       | `var(--dz-colors-neutral-50)`  | `var(--dz-colors-neutral-100)` | Push page bg one step darker than white surfaces so cards/raised surfaces visibly separate.      |
| P0  | semantic/light.ts | `--dz-surface-raised`   | `var(--dz-colors-neutral-50)`  | `oklch(1 0 0)`                 | Eliminates the bg≡raised collision; raised = white floating over neutral-100 page + real shadow. |
| P1  | semantic/light.ts | `--dz-appshell-main-bg` | `var(--dz-colors-neutral-50)`  | `var(--dz-colors-neutral-100)` | Keep app shell main consistent with the new page background.                                     |
| P1  | semantic/light.ts | `--dz-muted`            | `var(--dz-colors-neutral-100)` | `var(--dz-colors-neutral-200)` | With bg now at neutral-100, muted fills (badges/hover) need one step more to stay distinct.      |
| P1  | semantic/light.ts | `--dz-border`           | `var(--dz-colors-neutral-200)` | `var(--dz-colors-neutral-300)` | Hairline borders currently disappear against neutral-50/white; one step darker reads crisp.      |
| P2  | semantic/light.ts | `--dz-overlay-bg`       | `oklch(0 0 0 / 0.5)`           | `oklch(0 0 0 / 0.6)`           | Slightly deeper scrim makes dialog elevation read; pairs with stronger `xl` shadow.              |
| P2  | semantic/dark.ts  | `--dz-surface-raised`   | `var(--dz-colors-neutral-800)` | `var(--dz-colors-neutral-800)` | (No change — dark separation already correct; listed for completeness, leave as-is.)             |
| P2  | semantic/dark.ts  | `--dz-border`           | `var(--dz-colors-neutral-700)` | `var(--dz-colors-neutral-700)` | (No change needed — adequate in dark.)                                                           |

> Note: the two trailing dark rows are explicitly **leave as-is** verifications, not edits — dark
> mode already has correct elevation/border separation. They are recorded so the §2.2
> implementer does not "balance" the light edits by touching dark.

### 2.3 Radius + component-tier — `radius.ts` + `component/*.ts`

Accent-confidence primitive bump lives here (it is a primitive `colors.ts` value), plus modern
radii and the input-focus-ring fix.

| Pri | File                 | Token / Selector                   | Current value                                        | Proposed value                                       | Rationale                                                                                                                     |
| --- | -------------------- | ---------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| P1  | primitives/colors.ts | `PALETTE_CONFIGS.primary.chroma`   | `0.18`                                               | `0.22`                                               | Confident, saturated accent (matches modern SaaS); cascades to `--dz-primary`, rings, links, active states. Hue 260 retained. |
| P2  | primitives/colors.ts | `PALETTE_CONFIGS.secondary.chroma` | `0.12`                                               | `0.14`                                               | Keep secondary visibly distinct from the richer primary.                                                                      |
| P1  | primitives/radius.ts | `RADIUS_SCALE.lg`                  | `0.5rem`                                             | `0.625rem`                                           | Card/dialog default radius; 0.5rem reads dated, 0.625rem is the modern surface norm.                                          |
| P2  | primitives/radius.ts | `RADIUS_SCALE.md`                  | `0.375rem`                                           | `0.5rem`                                             | Button/input default radius; softer, current look.                                                                            |
| P2  | primitives/radius.ts | `RADIUS_SCALE.xl`                  | `0.75rem`                                            | `0.875rem`                                           | Large surfaces (sheets, large cards) one step rounder for hierarchy with `lg`.                                                |
| P0  | component/input.ts   | `--dz-input-focus-ring-width`      | `1px`                                                | `2px`                                                | 1px ring on the highest-traffic control is nearly invisible; match button/control 2px.                                        |
| P0  | component/input.ts   | `--dz-input-focus-ring-offset`     | `1px`                                                | `2px`                                                | Visible standoff so the ring doesn't merge with the border.                                                                   |
| P1  | component/card.ts    | `--dz-card-shadow`                 | `var(--dz-shadow-sm)`                                | `var(--dz-shadow-md)`                                | Resting cards should sit at a clearly-visible elevation (paired with §2.1 md bump).                                           |
| P2  | component/button.ts  | `--dz-button-font-weight`          | `'500'`                                              | `'600'`                                              | Solid buttons read more confident/clickable at semibold; matches modern primary CTAs.                                         |
| P2  | component/control.ts | `--dz-control-transition`          | `all var(--dz-duration-fast) var(--dz-ease-default)` | `all var(--dz-duration-fast) var(--dz-ease-default)` | (No change — confirmed adequate; toggle thumb/track snappy.)                                                                  |

> The trailing `control.ts` row is a leave-as-is verification.

### 2.4 Structural variants — `*.variants.ts` (flagged only)

Only changes that **no token edit can achieve**. Kept minimal.

| Pri | File                         | Selector                    | Current                                            | Proposed                                                                                        | Rationale                                                                                                                                                                                                                                         |
| --- | ---------------------------- | --------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | cards/DzCard.variants.ts     | `variants.variant.elevated` | `bg-[var(--dz-card)] shadow-[var(--dz-shadow-md)]` | `bg-[var(--dz-card)] shadow-[var(--dz-shadow-md)] border border-[var(--dz-border)]`             | Modern elevated cards pair a soft shadow **with** a 1px hairline border for crisp edge definition on light backgrounds. No token can add a border line to a base that has none — must be structural. (Border color/width still flow from tokens.) |
| P2  | feedback/DzAlert.variants.ts | `base`                      | `...transition-all...`                             | `...transition-all... shadow-[var(--dz-shadow-xs)]` (filled/subtle only via compound, optional) | Optional: subtle lift on filled/subtle alerts. Flagged P2 — defer unless §2.1+§2.2 prove insufficient; revisit after re-baseline.                                                                                                                 |

> DzCard is the one firmly-recommended structural edit. DzButton/Dialog/Select/Tooltip/Switch
> all reach their target purely via the §2.1 shadow + §2.3 radius cascades — **no variant edits
> needed** for those, preserving the frozen contracts.

---

## 3. Application Order (for downstream tasks)

1. **§2.1 Shadows** (Task 2.1) — highest visible impact, zero contract risk.
2. **§2.2 Semantics** (Task 2.2) — fixes the bg≡raised collision; depends on §2.1 for the paired shadow.
3. **§2.3 Radius + component-tier** (Task 2.3) — accent chroma, radii, the input-ring fix, card resting shadow.
4. **§2.4 Structural variants** (Task 2.4) — the single DzCard border line (+ optional alert lift).

All proposals are value-only and keep every existing key. No props, variant keys, or token
names change — ADR-02 / Contract Spec v1 preserved.

## 4. Delta Counts

| Section                     | Effective edits | Verify-only (leave as-is)     |
| --------------------------- | --------------- | ----------------------------- |
| 2.1 Shadows                 | 13              | 0                             |
| 2.2 Semantics               | 6               | 2                             |
| 2.3 Radius + component-tier | 8               | 1                             |
| 2.4 Structural variants     | 1 (DzCard)      | 1 optional/deferred (DzAlert) |
| **Total**                   | **28 edits**    | 4                             |
