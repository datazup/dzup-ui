---
"@dzup-ui/core": patch
---

**A grid child can now say how many columns it spans, and `DzStack` accepts `row` and `column`.**

`TASK-R3-O3`, decision D67. Both changes are additive; nothing existing changes
behaviour.

**`DzGridItem`** is a new compound part of `DzGrid` with a typed `span` — a
count from 1 to 12, `'full'`, or one per breakpoint:

```vue
<DzGrid :cols="{ sm: 1, md: 12 }">
  <DzGridItem :span="{ md: 6 }"><DzInput /></DzGridItem>
  <DzGridItem :span="{ md: 6 }"><DzInput /></DzGridItem>
  <DzGridItem span="full"><DzTextarea /></DzGridItem>
</DzGrid>
```

Until now a spanning field was a raw `class="col-span-2"` on the child — not an
API, not typed, and easy to get wrong: a class assembled at runtime
(`` `md:col-span-${n}` ``) is invisible to Tailwind's scanner and silently
compiles to nothing. The span classes come from a literal table, so every one is
emitted. A span is writing-mode relative, so it mirrors under `dir="rtl"`; the
item renders one element with no DOM reads, so server and client markup match.
A numeric span outside 1–12 is clamped. New types: `DzGridItemProps`,
`DzGridItemSlots`, `GridSpan`, `ResponsiveSpan`.

**`DzStack` `direction`** now also accepts `row` (same as `horizontal`) and
`column` (same as `vertical`) — the vocabulary a form renderer's layout node and
CSS use. Before, `direction="row"` silently fell back to vertical. Neither
spelling is deprecated.
