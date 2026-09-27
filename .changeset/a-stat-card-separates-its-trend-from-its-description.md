---
"@dzup-ui/core": patch
---

**A stat card separates its trend from its description.** `DzStatCard` rendered the trend value and the description with no space between them ("+6 this weekAcross four intake queues"): the template's literal leading space was condensed away when the component was compiled. The space is now emitted only when both are present, so a card with a description alone gains no leading space.
