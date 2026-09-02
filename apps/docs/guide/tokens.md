---
title: Design tokens
description: The three-tier --dz-* token system, how to re-map it, and the DTCG interchange export.
---

# Design tokens

Every visual value in dzup-ui resolves to a CSS custom property named `--dz-*`.
There are no raw colour literals and no hardcoded Tailwind colours in the
library; `yarn validate:tokens` fails the build on either.

## Three tiers

| Tier | What it holds | Example |
| --- | --- | --- |
| Primitive | Raw scales — colour ramps, spacing steps, radii, shadows | `--dz-neutral-200` |
| Semantic | Intent-named values that switch with the theme | `--dz-primary`, `--dz-radius-sm` |
| Component | Per-component anatomy mapping | `--dz-button-md-height` |

The source of truth is the TypeScript token maps in `@dzup-ui/tokens`; the
stylesheet, the type declarations and the Tailwind theme are all generated from
them. Never hand-edit a generated token file.

::: tip Intent colours are fills, not text colours
`--dz-{intent}` (`--dz-danger`, `--dz-warning`, …) is a fill or border colour.
For intent-coloured **text** use `--dz-{intent}-muted-foreground`. The contrast
validator rejects `text-[var(--dz-danger)]` because it fails WCAG AA on the page
background.
:::

## Using them

Import the stylesheet once at your app entry:

```ts
import '@dzup-ui/tokens/css'
```

Then override any token from your own CSS. Because the library's rules live in
cascade layers and yours do not, an unlayered override wins without
`!important`:

```css
:root {
  --dz-primary: #6d28d9;
  --dz-radius-sm: 2px;
}
```

Scope a re-map to a subtree by putting it on any ancestor element rather than on
`:root`.

## Theme switching

```html
<html data-theme="dark">
```

Dark values are declared for the same token names, so nothing in your CSS needs
to change.

## DTCG interchange

`@dzup-ui/tokens` also exports the same tokens as a
[DTCG](https://tr.designtokens.org) document (`dist/tokens.dtcg.json`), so they
can be read by a design tool or a third-party pipeline. A round-trip gate asserts
that every value in the export resolves to exactly what the shipped stylesheet
computes for the same `--dz-*` name, in **both** theme cascades — the export
cannot quietly disagree with the CSS.
