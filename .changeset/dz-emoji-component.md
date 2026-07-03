---
"@dzup-ui/core": minor
---

Add `DzEmoji` — an accessible emoji primitive in the **media** family.

Renders an emoji glyph with a consistent type-scale (`xs`–`xl`) and correct
screen-reader semantics: decorative by default (`aria-hidden="true"`), or
meaningful (`role="img"` + `aria-label`) when a `label` is provided. Solves the
inconsistent announcement of raw emoji characters across assistive tech.
