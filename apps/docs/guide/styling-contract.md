---
title: Styling contract
description: The five layers you are allowed to rely on when you restyle a dzup-ui component, and the one thing you should not do.
---

# The styling contract

dzup-ui is **restyleable by contract, not unstyled**. If you want a genuinely
headless primitive, use [Reka UI](https://reka-ui.com) directly — that is outside
this library's support contract. What this library promises instead is a small
set of named hooks that will not move under you.

This page is the how-to. The position itself — why there is no unstyled mode,
what "by contract" obliges, and how far the rollout has actually got — is the
published [styling posture statement](/evidence/styling-posture), whose numbers
are generated rather than written.

::: warning Status
The contract is specified by **ADR-19**, which is still *Proposed* — accepting it
is an owner decision. Its layer names and its `data-part` / `data-state` /
`ui`-prop mechanisms are shipped and load-bearing today; the anatomy declarations
that make each component's parts discoverable are being rolled out family by
family. A component page shows its declared parts when it has them, and says
nothing when it has not declared any — *"has not declared parts"* is not the same
claim as *"has no parts"*, and this site does not collapse the two.
:::

## The five layers

1. **Design tokens.** `--dz-*` custom properties, generated from TypeScript token
   maps in `@dzup-ui/tokens`. This is the interchange surface, and it is stable.
   See [Design tokens](./tokens).
2. **Component tokens.** Per-component custom properties named
   `--dz-{component}-{property}` (for example `--dz-button-md-height`), which
   resolve to the global tokens. Re-map one and every instance follows.
3. **Typed recipes.** Styling is written with `tv()` from `tailwind-variants` in
   a `.variants.ts` file beside each component. There is **no `<style scoped>`**
   anywhere in the library and no raw colour literal — every CSS value goes
   through `var(--dz-*)`.
4. **Stable `data-part` / `data-state` attributes.** Selectable from your own
   stylesheet. Components that declare an anatomy list their parts on their page.
5. **The typed `ui` prop.** A per-instance override keyed by part name, so you
   can restyle one instance without a selector war.

## Cascade layers: library CSS always loses

The library emits its rules inside cascade layers (`dz-tokens`, `dz-base`,
`dz-components`). Unlayered author CSS beats every layered rule regardless of
specificity, so **your stylesheet wins by default** — you do not need `!important`
and you do not need to out-specify the library.

## Theming

Light/dark and brand themes are switched with a `data-theme` attribute on an
ancestor element, typically `<html>`. Tokens cascade from there. The Nuxt module
injects a FOUC-prevention script (ADR-15) so the theme is applied before first
paint.

## The one thing not to do

Do not select library class names. They are implementation detail of the `tv()`
recipes and carry no stability promise. Use, in order of preference: a token
re-map, the `ui` prop, then a `data-part` selector.

## Where the facts on a component page come from

Anatomy parts shown on a component page come from that component's declared
anatomy (ADR-19), joined into the metadata artifact by the extraction pipeline.
They are not inferred from the template, and they are not hand-listed here.
