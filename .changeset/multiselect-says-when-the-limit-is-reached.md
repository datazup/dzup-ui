---
"@dzup-ui/core": patch
---

**`DzMultiSelect` says when `maxSelections` is reached.**

At the limit the remaining options are disabled; a screen-reader user now hears why. A polite
live region announces "Maximum selected. Remove an option to choose another." and, while
the limit holds, the same text joins the input's `aria-describedby`. The string is the new
catalog key `DzMultiSelect.maxReached`, overridable through `DzProvider`
messages like every other catalog string; packs list it as a fallback until translated.
