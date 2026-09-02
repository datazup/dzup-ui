<!--
  HAND-WRITTEN prose, merged verbatim into the generated DzAccordion page under a
  "Usage notes" heading by `yarn generate:docs-pages`.

  PROSE ONLY. This page in particular must NOT grow a hand-typed prop table: the
  extractor recovers nothing for this component, and filling the gap by hand
  would turn a visible, ratcheted defect into an invisible, unverifiable claim —
  which is strictly worse than the empty state the page currently admits to.
  The fix is to make the extractor resolve the union in
  `packages/tooling/src/meta/`, then regenerate.
-->

::: danger This component's API tables are empty because extraction failed, not because it has none
`DzAccordion` declares its props as a discriminated union — the single-open and
multiple-open forms are different shapes — and the metadata extractor cannot
resolve `defineProps<A | B>()`. It returns nothing and raises no error, so the
component scores as perfectly documented on every coverage ratio while telling
you nothing.

Until that is fixed, **read
`packages/core/src/components/data/DzAccordion.types.ts`** for the real surface.
It is the only accurate description of this component that currently exists.
:::

The accordion is a compound family: a root that owns size, variant and open
state, and item sub-parts that render the trigger and the panel. It is built on
Reka UI's accordion primitives (ADR-07), so keyboard interaction and the
`aria-expanded` / `aria-controls` wiring come from the primitive rather than from
this layer.

Choose the single-open form when the panels are alternatives and the multiple-open
form when they are independent sections; that choice is what selects the branch of
the union, and it changes the type of the bound value.
