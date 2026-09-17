---
"@dzup-ui/core": patch
---

**Twenty-five more components declare their styling surface, and the dialog's close button stops sitting on the wrong side in Arabic.**

The ADR-19 styling contract — declared parts, declared states, a typed per-part
`ui` override — reached five families this release. Every Tier B and above
component in `cards`, `feedback`, `layout`, `media` and `overlays` now says what
a consumer may address, so restyling those components no longer means writing a
descendant selector against a class name `tailwind-variants` is free to change.

**New `data-part` and `ui` surfaces**

| Family | Components | Parts you can now address |
|---|---|---|
| `cards` | `DzCard` (family), `DzImageCard`, `DzStatCard` | `root`, `header`, `body`, `footer`, `action`, `overlay`, `title`, `icon`, `description` |
| `feedback` | `DzBlockUI`, `DzNotification`, `DzToast`, `DzSpinner` | `root`, `content`, `overlay`, `icon`, `title`, `description`, `action`, `close`, `indicator` |
| `layout` | `DzPanel`, `DzToolbar`, `DzScrollArea`, `DzSplitter`/`DzResizable` (families), `DzCollapse` | `root`, `header`, `trigger`, `title`, `indicator`, `action`, `content`, `group`, `viewport`, `panel`, `separator` |
| `media` | `DzCarousel` (family), `DzImageComparison`, `DzLightbox` | `root`, `viewport`, `content`, `item`, `list`, `item-indicator`, `action`, `panel`, `label`, `separator`, `control`, `overlay`, `close`, `description` |
| `overlays` | `DzDropdownMenu`, `DzContextMenu`, `DzPopover`, `DzTooltip`, `DzSheet` (families), `DzConfirmDialog`, `DzPopconfirm`, `DzCommandPalette`, `DzTour` | `content`, `item`, `prefix`, `suffix`, `separator`, `indicator`, `overlay`, `title`, `description`, `close`, `icon`, `action`, `panel`, `header`, `body`, `footer`, `input`, `control`, `list`, `group`, `group-label`, `item-label`, `empty` |

```vue
<DzToast :toast="toast" :ui="{ indicator: 'w-2', close: 'opacity-100' }" />
<DzPanel collapsible header="Filters" :ui="{ indicator: 'text-[var(--dz-primary)]' }" />
<DzCarousel :ui="{ viewport: 'rounded-xl' }" />
<DzDropdownMenuItem :ui="{ suffix: 'opacity-60' }">Rename</DzDropdownMenuItem>
```

**One real fix, not just a declaration: RTL insets.**

`validate:rtl` could not see a physical `left-…` or `right-…` inset at all — the
one clause meant to catch them named `inset-l-` / `inset-r-`, which Tailwind 4
does not generate. With the gate widened, five components turned out to pin a
control to a physical edge while declaring that they mirror with the document:

- `DzDialog`'s close button and `DzToast`'s close button and tone stripe,
- `DzNotification`'s dismiss button,
- `DzLightbox`'s previous / next buttons, close button and counter.

All are now logical (`inset-s-` / `inset-e-`). **In a left-to-right document
nothing moves by a pixel.** In a right-to-left one, the close control is finally
on the edge the reader finishes at.

Where a physical side is the point — `DzFab`'s and `DzSpeedDial`'s
`position="bottom-right"`, `DzToast`'s viewport corners, `DzSheet`'s `side` —
the geometry is unchanged and now carries the `rtl-physical-ok` marker with the
reason written at the line.

**Nothing is removed and every existing override keeps working.** `ui` is a new
optional prop; `class` lands exactly where it always did; no part was renamed.
