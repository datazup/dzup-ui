<!--
  HAND-WRITTEN prose, merged verbatim into the generated DzButton page under a
  "Usage notes" heading by `yarn generate:docs-pages`.

  PROSE ONLY. Do not write a prop, event, slot or default table here — those are
  generated from packages/core/docs/component-meta.json and a hand-typed copy is
  exactly the drift this split exists to prevent (constraint B9). If a fact you
  want is missing from the generated tables, add the field to the extraction
  pipeline and regenerate; do not type it in.
-->

`DzButton` is polymorphic: give it `href` and it renders an anchor, give it `to`
and it renders a router link, give it `as` and it renders whatever you name. The
variant, tone and size taxonomies are unchanged in every case, so a link styled
as a primary button is one prop away and does not need a wrapper.

Prefer `variant` for emphasis and `tone` for meaning. A destructive action is
`tone="danger"`, not a red override — the token layer already knows what red is
in the current theme, and it also knows what red is in dark mode.

When the button triggers an async action, drive `loading` from the pending state
rather than swapping the label. The component keeps its own width and announces
the busy state, so the layout does not jump and assistive technology is told what
happened.
