---
"@dzup-ui/core": patch
---

**Navigation and data components declare their styling surface, and a sidebar no longer opens on the wrong edge in Arabic.**

The ADR-19 styling contract — declared parts, declared states, a typed per-part
`ui` override — reached two more families this release. **Every** public
component in `navigation` now declares one, and eleven more in `data` join
`DzTable`, so restyling a menu, a pager, a tab set, a calendar or a grid no
longer means writing a descendant selector against a class name
`tailwind-variants` is free to change.

**New `data-part` and `ui` surfaces**

| Family | Components | Parts you can now address |
|---|---|---|
| `navigation` | `DzAnchor`, `DzBackTop`, `DzBreadcrumb` (family), `DzColorModeToggle`, `DzMegaMenu`, `DzMenu` (family), `DzPagination`, `DzSegmented`, `DzSidebar` (family), `DzStepper`, `DzStepperItem`, `DzTabs` (family) | `root`, `list`, `item`, `item-label`, `separator`, `trigger`, `indicator`, `panel`, `group`, `group-label`, `action`, `content`, `close`, `header`, `footer`, `body`, `overlay`, `icon`, `suffix`, `title`, `description` |
| `data` | `DzAccordion` (family), `DzCalendar`, `DzChip`, `DzDataGrid` (family), `DzDataView`, `DzInfiniteScroll`, `DzListItem`, `DzOrderList`, `DzTag`, `DzTree`, `DzTreeItem` | `root`, `item`, `trigger`, `indicator`, `content`, `header`, `title`, `group`, `action`, `row`, `cell`, `body`, `panel`, `list`, `item-label`, `control`, `loader`, `error`, `hint`, `empty`, `footer`, `close` |

```vue
<DzPagination :total="500" :ui="{ action: 'rounded-full', separator: 'opacity-40' }" />
<DzSidebar :ui="{ overlay: 'backdrop-blur-sm', body: 'gap-1' }" />
<DzTabTrigger value="one" closable :ui="{ close: 'opacity-100' }">One</DzTabTrigger>
<DzCalendar v-model="date" :ui="{ item: 'rounded-lg', 'title': 'font-semibold' }" />
<DzTreeItem :node="node" :ui="{ indicator: 'text-[var(--dz-primary)]' }" />
```

**Two real fixes, not just declarations.**

`validate:rtl` reads a component's declared `rtl.mirrors` and then checks its
source for physical utilities. Declaring these two turned up geometry that
promised to follow the reading direction and did not:

- **`DzSidebar`** pinned the rail and the mobile drawer with `left-0`, and the
  drawer slid out with `-translate-x-full`. In a right-to-left document that put
  the navigation on the edge the content reads away from, and would have slid
  the drawer *into* the page instead of off it. Now `inset-s-0` plus an
  `rtl:translate-x-full` companion.
- **`DzBackTop`** pinned the scroll-to-top control with
  `right-[var(--dz-back-top-offset)]`. Unlike `DzFab`, it takes no `position`
  prop — the corner is "out of the way of the text", which is a statement about
  the reading direction. Now `inset-e-`.

Two inline physical margins went with them: the sidebar item's badge
(`ml-auto` → `ms-auto`) and the data view's paginator (`ml-auto` → `ms-auto`).

**In a left-to-right document nothing moves by a pixel.** `inset-s-`, `inset-e-`
and `ms-` compile to the same edge that `left-`, `right-` and `ml-` did.

**Nothing is removed and every existing override keeps working.** `ui` is a new
optional prop on 22 components; `class` lands exactly where it always did; no
part was renamed and no `data-state` value changed.
