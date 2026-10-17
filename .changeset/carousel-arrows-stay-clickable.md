---
"@dzup-ui/core": patch
---

**`DzCarousel`'s arrows and dots stay put while the slides move.**

`DzCarouselPrevious`, `DzCarouselNext` and `DzCarouselDots` composed into the default slot were
rendered inside the sliding track. The track's `transform` made it their containing block, so the
arrows slid out of view with it and were clipped — after the first slide change a real pointer
could not reach "Next slide", and the dots scrolled away with the slides. They now render outside
the track, inside the carousel root; slides (wrapped or not) stay in the track. No API change.
