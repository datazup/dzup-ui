---
"@dzup-ui/core": patch
---

**A grid child can now span rows, and takes the form document's own field names.**

`TASK-S3-O2`, decision `D-S3O2-1`. Additive: every existing prop keeps its
meaning and no rendering changes for markup that does not use the new props.

**`DzGridItem` gains `rowSpan`.** `colSpan` covered one of the two spans a form
document carries; the other had no API at all, so `layout.rowSpan: 2` could only
be rendered as a raw `class="row-span-2"` — the persisted CSS a portable document
format cannot contain, relocated onto the child rather than removed. Values are
the same as the column axis: a count from 1 to 12, `'full'`, or one per
breakpoint, clamped, from a literal class table the Tailwind scanner can read.
`grid-row: span N` is block-axis and writing-mode relative, so it needs no RTL
handling either.

**`DzGridItem` gains `colSpan` as an alias of `span`.** `colSpan` and `rowSpan`
are the names the layout node uses, so a renderer forwards `node.layout` verbatim
with no lookup table of its own — and once a row span exists, a bare `span` no
longer says which axis it means. `span` is **not deprecated** and behaves exactly
as before; when both are passed `colSpan` wins and dev mode says so once per
session rather than resolving it silently.

```vue
<DzGrid :cols="6" :rows="2" gap="md">
  <DzGridItem :col-span="3">…</DzGridItem>
  <DzGridItem :col-span="3">…</DzGridItem>
  <DzGridItem :col-span="6" :row-span="2">…</DzGridItem>
  <DzGridItem col-span="full">…</DzGridItem>
</DzGrid>
```

**Stories.** A new `Core/Forms/Async Options` page walks all six states of the
shared async-options seam — loading, empty result, error with retry,
dependency-change clearing, stale-response discard, and the accessible
announcement of each. The last three had no story evidence anywhere: in
particular nothing had ever put two requests in flight, so the `AbortSignal`
fence `useAsyncOptions` exists for was unit-tested and undemonstrated. No seam
behaviour changed. `DzGrid` also gains a `Form Layout Node` story rendering a
document's layout nodes with no class name from the document.

`patch` per `packages/contracts/VERSIONING.md`, where `0.x` reserves `minor` for
breaking changes.
