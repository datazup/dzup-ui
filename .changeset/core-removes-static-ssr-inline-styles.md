---
"@dzup-ui/core": patch
---

**Replace Core's static SSR inline styles with utility classes.**

The static containment and reset styles previously rendered as `style`
attributes now use equivalent utility classes. This removes all 81 inventoried
static inline-style sites, allowing the covered SSR/browser fixtures to render
those styles under a policy that blocks inline style attributes.

Consumers must generate the corresponding Tailwind utilities from Core's
component sources; removing inline attributes does not itself supply those CSS
rules. The CSP proof includes that utility generation, so this note does not
claim that the existing getting-started instructions alone provide it.

Bound styles remain unchanged and require separate policy qualification.
Whole-library strict-CSP SSR compatibility is unproven; this correction covers
the static inline-style sites only.
