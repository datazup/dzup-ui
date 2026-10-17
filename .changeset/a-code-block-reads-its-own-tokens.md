---
"@dzup-ui/tokens": minor
"@dzup-ui/core": minor
---

**`DzCodeBlock` reads its own `--dz-codeblock-*` tokens, and every one of them is emitted.**

`CODEBLOCK_TOKENS` was exported but never written to `tokens.css`, the six
semantic `--dz-codeblock-*` colours were emitted with a dark palette that
nothing consumed, and `DzCodeBlock` painted itself with `--dz-muted` directly.
Now each name is declared exactly once and `DzCodeBlock` consumes all of them:

- The six colours stay in the semantic tier and now resolve to what the block has
  always looked like: `--dz-codeblock-bg` / `-header-bg` → `var(--dz-muted)`,
  `-text` → `var(--dz-foreground)`, `-border` → `var(--dz-border)`,
  `-header-text` / `-line-number` → `var(--dz-muted-foreground)`, in light and
  dark. **Their values in `tokens.css` change** (they were neutral-900/950
  shades); the high-contrast mapping is unchanged.
- `CODEBLOCK_TOKENS` now holds the layout half only and is emitted in the
  component tier: `--dz-codeblock-radius`, `-padding`, `-font-family`,
  `-font-size`, `-line-height`, `-header-padding-x`, `-header-padding-y`,
  `-header-font-size`, `-line-number-width`. **Removed keys:** `--dz-codeblock-bg`,
  `-border`, `-text`, `-header-bg` (now semantic only), `-header-color` (use
  `-header-text`), `-line-number-color` (use `-line-number`); none of them was
  ever emitted as CSS. `-line-number-width` is `2rem`, the gutter the block has
  always rendered.
- Line numbers take `--dz-codeblock-line-number` instead of the inherited text
  colour at 50% opacity.

Setting any `--dz-codeblock-*` property now re-skins code blocks.
