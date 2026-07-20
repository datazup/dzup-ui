---
'@dzup-ui/core': patch
---

Fix `DzPageHero` title gradient rendering as a solid bar: use `background-image`
instead of the `background` shorthand, which reset `background-clip` to
`border-box` and defeated `bg-clip-text` in consumer builds.
