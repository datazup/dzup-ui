# css-order

Token layer first, then component styles, then app styles.

The order is not cosmetic: `@dzup-ui/tokens` declares the `--dz-*` custom
properties every component stylesheet reads, so a component stylesheet loaded
first paints with unresolved variables. App CSS comes last so a consumer can
override without `!important`.
