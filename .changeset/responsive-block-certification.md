---
"@dzup-ui/landing": patch
---

Earn a CI-backed Responsive trust mark for the complete Blocks catalog.

Every standalone block preview now runs through a Chromium mobile, tablet, and
desktop matrix that verifies meaningful rendering, viewport containment, and no
page or frame horizontal overflow. Blocks declaring mobile behavior also carry
computed-layout reflow probes. The new gate found and fixed the compact tooltip
toolbar's mobile overflow before the mark was enabled.
