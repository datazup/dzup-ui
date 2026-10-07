---
"@dzup-ui/core": patch
---

Fix DzText and DzHeading font-family token resolution under Tailwind CSS 4 with
`font-(family-name:--dz-font-sans)`. Text without an explicit weight now inherits
the host weight without the family utility overriding it. The heading size
presets use semibold/bold weight tokens, so host token overrides apply while
the default weights remain unchanged.
