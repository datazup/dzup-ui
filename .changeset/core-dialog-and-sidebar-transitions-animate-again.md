---
'@dzup-ui/core': patch
---

DzDialog's overlay and content, and DzSidebar's mobile backdrop, now fade as designed. Since they were introduced, their default transition rules have written `opacity var(--dz-transition-fast) ease`, but `--dz-transition-*` already carries a timing function, so the item named two. That is invalid at computed-value time: browsers dropped the transition and the dialog has always snapped open and shut. The rules now use the token alone, which is 150ms (200ms for the sidebar backdrop) on the token's easing curve.
