---
"@dzup-ui/core": patch
---

`DzCarouselDots` no longer renders an empty `tablist`

ARIA requires a `tablist` to own at least one `tab`, and this one owns a `tab` per
registered slide — so a carousel whose slides come from an empty collection published
a named, childless `tablist`. Measured with axe in exactly that state:
`aria-required-children`, *"Expecting ARIA child role to be added: tab"*, and it
persisted rather than being a mount-order flicker. The dots list now renders nothing
until it has a tab to own.

One consequence worth knowing about: slides register themselves in their own mounted
hooks, so the dot list appears on the tick after the carousel mounts rather than during
its first render. That is one microtask, before the first paint, and it also removes a
transient empty `tablist` that every carousel used to emit for that same tick. No prop,
emit, slot, `data-part`, `data-state` or message key changed.
