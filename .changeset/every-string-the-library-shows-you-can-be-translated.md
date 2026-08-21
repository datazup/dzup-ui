---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

**Every user-visible string the library renders is now translatable from one place.**

Before this release, `@dzup-ui/core` shipped **54 static `aria-label` values
across 27 components that no application could change at all** — not with a
prop, not with a provider. An Arabic application shipped `aria-label="Clear
input"` and had no way to do otherwise. A further **39 literal defaults on
`*Text`/`*Label`/`*Placeholder` props across 24 components** could only be
changed one instance at a time, which is repetition rather than localisation.

All of them now resolve through one catalog:

```vue
<DzProvider
  locale="fr-FR"
  :messages="{
    DzInput: { clear: 'Effacer le champ' },
    DzSelect: { noResults: 'Aucun résultat' },
  }"
>
  <App />
</DzProvider>
```

**Nothing changes until you supply a catalog.** Every value in the shipped
English catalog is byte-identical to the literal it replaced — including one
inconsistency that was deliberately *not* tidied: `DzCascader` uses `Search…`
(U+2026) where `DzSelect` and `DzListbox` use `Search...`. Normalising them
would be a visible change to three components smuggled in under a refactor.

Overrides apply **per key**, so translating `DzTimePicker.confirm` keeps the
other ten strings that component renders.

**New in `@dzup-ui/contracts`: `DzMessageCatalog`**, an empty interface that each
tier augments from its own package:

```ts
declare module '@dzup-ui/contracts' {
  interface DzMessageCatalog {
    DzChart: { noData: string }
  }
}
```

Core contributes its ~38 components this way, which makes the extension
mechanism ADR-20 §9 requires of Pro **the same one Core itself uses** rather
than a second-class hook. It also augments a package Pro already depends on:
Pro depends inward on Core *contracts* and must never import Core's runtime.

**All `Intl` construction is cached, and one case was pathological.**
`DzAnimatedNumber.tween.ts` built its `Intl.NumberFormat` *inside* the function
a running tween calls **once per frame** — and ECMA-402 requires locale data to
be resolved on construction. Formatting 1,000 rows now constructs at most one
formatter per (locale, options) pair, which is asserted rather than claimed. The
cache moved to a module that imports nothing, so the framework-free tween
helpers can reach it.

**One behaviour change, and it fixes a hydration bug.** `DzAnimatedNumber`,
`DzTimePicker` and `useRelativeTime` used to format with `Intl`'s *ambient*
locale when given no explicit one. That is not the same value on a Node server
as in a visitor's browser, so a server-rendered figure or a "2 minutes ago"
could hydrate into a different language or a different group separator — a
mismatch invisible to anyone developing in the locale their server runs in. They
now use the application's declared locale, falling back to `en-US`.

The pure exported helpers `formatNumber`, `formatRelativeTime` and
`formatAbsoluteTime` keep their signatures **and** their semantics: an omitted
`locale` still means the runtime's own. Only the composable and the components
changed.

**New gate: `yarn validate:hardcoded-strings`.** Fails on a static `aria-label`
in a template or a literal default on a user-visible prop. It reads the
`<template>` block only, so JSDoc `@example` strings — 11 of them, which the
first inventory pass wrongly swept up — are not flagged. A line may be exempted
with a `hardcoded-string-ok: <reason>` comment, and the reason lives next to the
string rather than in a list somewhere else.

**New in Storybook: a Pseudo-locale toolbar.** Renders every string accented,
padded +30% and framed in `[!!! … !!!]`, across every story rather than a chosen
few. Un-accented text is a string the catalog does not reach; a missing `!!!]`
is a label that clipped. The pseudo catalog is generated from the English one,
so a message added tomorrow is covered today.

**Known gap, stated rather than fixed:** `DzOrderList`'s `dragHandleLabel` is
documented as "accessible label for each row's drag handle" and **nothing
renders it** — the handle is `aria-hidden="true"`. Its literal stays, with the
reason in the source. Giving that handle an accessible name is an accessibility
decision, not a codemod.
