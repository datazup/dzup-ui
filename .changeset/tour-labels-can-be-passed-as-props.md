---
"@dzup-ui/core": minor
---

**`DzTour` accepts label props for its controls and step counter.**

New optional props `skipLabel`, `backLabel`, `nextLabel`, `finishLabel` and `stepOfLabel`
(a string, or `(current, total) => string`). Each wins over the `DzTour` catalog entry, which
still follows `DzProvider` message overrides and falls back to English — so an application
can localise a single tour without a provider-wide catalog.
