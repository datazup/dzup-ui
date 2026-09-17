---
"@dzup-ui/contracts": patch
"@dzup-ui/core": patch
"@dzup-ui/testing": patch
---

**Your `class` beats `ui`, `asChild` has a published allowlist, and every component that puts your attributes somewhere unexpected now says so.**

Three composition rules existed only as prose. Nothing checked them, and one of
the three had shipped in two contradictory versions at once.

**The `ui` merge order is now decided and published.** ADR-19 §5 said `class`
and `ui` "merge through the same `cn()`" but never said in which order — and
`cn()` is tailwind-merge, so the order *is* the answer to which one takes
effect. Measured across the catalogue, 5 components passed `ui` first and 74
merge sites passed `class` first: the same two props produced opposite results
on `DzButton` and `DzCard`, and nothing said which was right.

The ratified order is **recipe → `ui` → your `class`**, exported as
`UI_MERGE_ORDER`. Your `class` is merged last and wins a conflict. That is what
ADR-19 §5 promises ("`class` keeps its meaning … nothing about existing usage
changes") and it is the rule that survives composition: when an application
wraps `DzButton` in its own `AppButton` and sets `ui` for a house style,
`<AppButton class="w-full">` still works instead of sending that author to
`!important`. Every component documentation page now states the order.

The components that merge the other way are recorded with a downward-only
ceiling rather than quietly fixed — re-ordering a merge changes rendered output,
so it is sequenced separately. A **new** component that merges the wrong way
fails the contract lane immediately.

**`asChild` has an allowlist.** `asChild` makes *your* element the rendered
node, so every promise about a root — the `data-part`, the recipe class, the
focus ring — stops applying there. `AS_CHILD_ALLOWLIST` now records the eight
components that do it, which element kinds each accepts, what each guarantees
(semantics, attributes, ref, disabled, keyboard) and why it is allowed. A
component cannot add itself: the list lives in `@dzup-ui/contracts`, and source
and list are checked against each other in both directions.

It also records one defect rather than hiding it: **`DzButton`'s `asChild` prop
is declared and does nothing.** The template never reads it. Use `as`, `href` or
`to` for polymorphism — those work. The prop is now marked `unimplemented` so
the gap is counted rather than discovered by a reader of the types.

**Anatomies can declare where your attributes land.** The new optional
`fallthrough` field answers "where does my `class` actually go?" for the two
shapes where the answer is not "the one root":

- **Multi-root components** — Vue cannot choose a target for a fragment, so the
  component does. `DzKnob`, `DzSidebar`, `DzLightbox`, `DzPopconfirm`,
  `DzTableRow`, `DzToastViewport` and `DzFieldArray` now each say which node
  they chose. `DzFieldArray` declares `target: 'none'`: it renders no element of
  its own, so a `class` you pass reaches nothing — a fact worth learning from
  the contract rather than from an empty DOM.
- **Controls that re-point `class` inward** — on `DzSlider`, `DzRangeSlider`,
  `DzRating`, `DzDatePicker`, `DzDateRangePicker` and `DzMention` your `class`
  lands on an inner part, so a width you pass applies there rather than to the
  whole component. Nothing moved; the behaviour is unchanged and now documented.

`DzPersonaSelector` additionally declares `delegatesTo: 'DzCombobox'` — it
renders no element of its own, and its root *is* a combobox.

**New testing helpers.** `@dzup-ui/testing` gains `expectUiMergeOrder`,
`expectFallthrough`, `expectAsChild`, `expectHandlerComposition` and
`expectExternalWrite`, alongside `expectAnatomy` and `expectKeyboardContract`.

`expectExternalWrite` is deliberately shaped as a *trace* rather than a
snapshot: it requires a reading taken after a user edit, because the defect it
exists to catch only appears after one.
