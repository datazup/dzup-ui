---
'@dzup-ui/contracts': patch
---

The WCAG and evidence tables in `@dzup-ui/contracts` now tree-shake. Previously they shipped in every bundle that imported a runtime value from contracts, about 680 bytes gzip per component, although only tooling reads them. `WCAG_CRITERION_IDS` keeps the same value and type.
