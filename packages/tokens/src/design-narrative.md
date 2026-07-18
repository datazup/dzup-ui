# dzup-ui — Design System

`dzup-ui` is a **Vue 3 component library**: it *is* the design system, not a
brand-consuming app. Everything below is projected from `@dzup-ui/tokens`, the
single source of truth. This file is a portable, high-level art-direction
snapshot for tools that can't run the MCP; for full component APIs, use the
depth channel below.

<!-- dz:overview -->

## Personality

Calm, precise, and engineering-grade. Neutral-forward surfaces let a single
indigo **primary** carry brand emphasis; status colors (success, warning,
danger, info) are reserved for meaning, never decoration. Motion is quick and
functional — see [Motion](#motion) for the real duration scale — corners are
softly rounded, and elevation is subtle. The system ships light and dark themes
from one token set.

## How to consume

```ts
// 1. Tokens (CSS custom properties — the styling contract)
import '@dzup-ui/tokens/css'
// 2. Component styles
import '@dzup-ui/core/styles'

// 3. Theme: wrap the app, or set data-theme on <html>
//    <DzThemeProvider> … </DzThemeProvider>   (SSR-safe, prevents FOUC)
//    or  <html data-theme="dark">
```

All styling flows through `--dz-*` CSS custom properties. Never hard-code a
value that a token already expresses — reference `var(--dz-*)` instead. Light is
the default (`:root`); `[data-theme="dark"]` and the `prefers-color-scheme`
fallback supply the dark ramp.

## Depth channel — `@dzup-ui/mcp`

This file is deliberately **high-level**. For the full catalog — <!-- dz:catalog -->,
and every prop, slot, and token — connect the `@dzup-ui/mcp` server in an
MCP-capable tool (Cursor, Claude Code, Windsurf). Prefer the MCP for production
work; use this DESIGN.md when no server is available (Stitch, Figma Make, quick
sessions, external consumers).

## Colors

Palettes are authored in **OKLCH** for perceptually uniform shades (50–950).
Two groups: **intent** palettes wired to semantic roles (primary, secondary,
success, warning, danger, info, neutral) and a **decorative** spectrum for
data-viz and tags. Reach for a decorative palette only when no intent token
expresses your purpose.

**Contrast, precisely.** Every documented *text* pair below clears WCAG 2.2 AA
(4.5:1, SC 1.4.3), and the focus ring clears SC 1.4.11 (3:1). Both are asserted
in CI, in light **and** dark, by the `validate:tokens` gate — a token change
that drops a pair under its threshold fails the build. What is **not** gated:
`--dz-border`, `--dz-input-border`, `--dz-input-placeholder`, and
`--dz-disabled-foreground` resolve below 3:1 against their own surfaces
(`--dz-border` sits at ~1.6:1 on the page). Treat borders as decorative
separators — never rely on one alone to convey a control's state or boundary.

Semantic roles resolve differently per theme; both are shown resolved to their
concrete OKLCH value so this table is self-contained.

<!-- dz:colors -->

Each intent also exposes a state set: `{intent}` (fill), `{intent}-foreground`
(legible text on the fill), `{intent}-hover`, `{intent}-active`,
`{intent}-muted` (subtle tinted background), `{intent}-muted-foreground`, and
`{intent}-border`. A 10-way `--dz-chart-*` categorical scale is available for
data-viz.

**`--dz-{intent}` is not a text color.** It is shade 500 — a fill and a border.
As text it fails AA on the page background (3.69–4.38:1 in light) and on its own
subtle fill (3.72–4.26:1). The readable shade is `{intent}-muted-foreground`,
which clears AA on every surface above (7.31–10.25:1 light, 8.03–10.19:1 dark).
So: `bg-[var(--dz-danger)] text-[var(--dz-danger-foreground)]` for a solid fill;
`bg-[var(--dz-danger-muted)] text-[var(--dz-danger-muted-foreground)]` for a
subtle one; `border-[var(--dz-danger)]` for a boundary. The
`validate:tokens` gate fails the build on `text-[var(--dz-{intent})]` over a
`{intent}-muted` fill.

## Typography

<!-- dz:typography -->

## Spacing

<!-- dz:spacing -->

## Elevation

Shadows use OKLCH black. Dark mode raises opacity because dark surfaces absorb
light.

<!-- dz:elevation -->

## Shapes

<!-- dz:shapes -->

## Motion

<!-- dz:motion -->

## Layering

Stacking is a contract, not a negotiation. Pick the layer whose *meaning*
matches your surface and use its token — never invent a `z-index`, and never
add one "just above" another component. If nothing here fits, the surface
probably belongs inside an existing layer rather than beside it.

<!-- dz:layers -->

## Breakpoints

<!-- dz:breakpoints -->

## Components

dzup-ui exposes **9 shared component token families**. Style via component
tokens (`--dz-{component}-*`) and the frozen variant taxonomies below (ADR-02);
don't reach past them into raw CSS. This is a map, not an API reference — use
the MCP or the Storybook catalog for props, slots, and events.

<!-- dz:components -->

Variant, size, and tone taxonomies are **frozen** (ADR-02): `size` is
`xs · sm · md · lg · xl`; `tone` is `neutral · primary · success · warning ·
danger · info`. Do not invent new variants — compose existing ones.

## Do's & Don'ts

These are seeded from real agent failures — one entry per bad generation.

**Do**

- **Do** import and compose existing `@dzup-ui/core` components. Find them via
  `@dzup-ui/mcp` or the Storybook catalog before building anything.
- **Do** style exclusively through `var(--dz-*)` tokens.
- **Do** stay inside the frozen variant / size / tone taxonomies (ADR-02).
- **Do** let the theme system drive light/dark — author once against semantic
  roles, not per-theme hard-coded colors.

**Don't**

- **Don't** recreate a button, input, card, dialog, or badge that already
  exists — use `DzButton`, `DzInput`, `DzCard`, `DzDialog`, `DzBadge`.
- **Don't** emit raw hex, `rgb()`, `hsl()`, or hard-coded Tailwind colors
  (`bg-blue-500`). Only `var(--dz-*)`. (CLAUDE.md rule #1.)
- **Don't** use `<style scoped>` — style through `tv()` variants (ADR-04).
- **Don't** hard-code a second dark palette — semantic roles already invert.
- **Don't** restate component APIs from memory — consult the MCP; this file is
  intentionally shallow.

## References

- `@dzup-ui/tokens` — the source of truth this file is generated from
- `@dzup-ui/mcp` — on-demand depth channel (full component/block/template APIs)
- `CLAUDE.md`, ADR-02 / ADR-04 / ADR-17 — architecture law
