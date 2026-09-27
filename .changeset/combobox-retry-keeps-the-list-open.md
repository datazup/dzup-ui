---
"@dzup-ui/core": patch
---

**Pressing Retry in `DzCombobox` or `DzMultiSelect` no longer closes the list.** The button disappears as soon as the reload starts, so a mouse press used to drop focus to the page and close the popover. The list the user had just asked to reload vanished. The error row now keeps focus in the input, as `DzMention` already did (async-options contract C9.4), and the list stays open through loading → ready.
