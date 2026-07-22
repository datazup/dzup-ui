---
"@dzup-ui/core": patch
---

**`DzCommandPalette`: search the whole `label`, not just what the row happens to render.**

The palette documented `label` as its search key and filtered `props.items` on it — but Reka's
`ComboboxItem` also registers each row's *rendered text* (`textValue || textContent`) with
`ComboboxRoot` and hides any row its own filter scores zero. That second filter sat downstream
of, and invisible to, the first, so it silently won.

The effect only shows up in the pattern `label` exists for: a consumer that puts a full search
haystack in `label` (ids, tags, keywords) and renders a shorter caption through the `#item`
slot. Those rows were then filtered by the caption. On this repo's own site that made every
block unfindable by its id, its tags, or the `Dz*` components it is built from — all three
indexed and weighted — while the visible title still matched, and nothing in the DOM showed why.

`ComboboxRoot` now gets `ignore-filter`, leaving this component's filter the only one. Matching
is unchanged in kind: it uses the same `Intl.Collator`-backed comparison Reka's filter used, so
it stays case- and accent-insensitive (`resume` still finds `Résumé`).

Also removes a `:filter-function` binding that had quietly stopped doing anything — it is not a
`ComboboxRoot` prop in Reka 2.x, so it fell through to `$attrs` and onto the listbox element.

No API change: same props, same emits, same slots. Rows that were being filtered out despite a
matching `label` now appear, which is the documented behaviour.
