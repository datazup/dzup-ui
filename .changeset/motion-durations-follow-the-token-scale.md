---
"@dzup-ui/core": patch
---

**Every Core transition duration now comes from `--dz-duration-*`.**

25 sites in 18 components (Accordion, Tree, Tour, MeterGroup, BlockUI, Progress,
TokenProgressBar, ScrollProgress, Notification, Resizable, Sidebar, SidebarSection,
Carousel, Lightbox, ImageComparison, Knob, the table cell's resize affordance) used raw
Tailwind `duration-150/200/300`. They now use `--dz-duration-fast` / `-normal` / `-slow`
(the same 150/200/300ms by default), so a theme or a reduced-motion override that retimes
the scale now retimes these too.
