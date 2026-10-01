---
"@dzup-ui/core": minor
---

DzDataGrid navigates its cells, DzCalendar pages by year, DzTransfer has listbox type-ahead

Four published keyboard promises that nothing implemented are now implemented, and
one that nothing could implement is withdrawn. These are the rows an audit of all
404 declared keyboard rows found to be **claims with no code behind them** — not
mis-cited rows, but false ones.

**`DzDataGrid` now navigates its cells (six rows, plus two new ones).** It has
declared the APG `grid` cell-navigation contract since it shipped — `ArrowLeft` /
`ArrowRight` along the inline axis, `ArrowUp` / `ArrowDown` between rows, `Home` /
`End` to the ends of a row — and navigated no cells at all: no arrow handling, no
roving `tabindex`, nothing. It is now real:

- **Arrows move between cells on both axes**, and the inline pair mirrors in a RTL
  document, which is what the two `rtl: 'mirrored'` rows and
  `rtl: { keyboard: 'swap-horizontal' }` have always declared. `ArrowRight` moves to
  the inline **end**.
- **`Home` and `End`** move to the first and last cell of the focused row.
- **`PageUp` and `PageDown` are new rows**: they move focus ten rows, clamping at
  the header row and the last row. Ten is the page size the grid's own pagination
  defaults to.
- **The header row participates.** `ArrowUp` from the first body row reaches the
  column header above it, so a non-sortable `<th>` now carries `tabindex="-1"`,
  which makes it reachable by arrow and adds **no** tab stop.
- **Movement stops at the edges** rather than wrapping — the APG `grid` behaviour —
  and all eight keys are consumed so they do not scroll the page instead.

**One thing to know about the tab order.** The body's cells now share a **single
roving tab stop** that follows the user, so tabbing into the grid reaches the cells
at all, which it could not before. Everything already in the tab order stays there:
every sortable column header keeps its own tab stop, and the selection checkbox, the
filter button, the filter popover's fields and anything you render in the `#cell`
slot keep theirs. A control inside a cell also keeps its own keys — the grid acts
only when the cell itself has focus, so `ArrowRight` in a cell's text field still
moves the caret. The strict single-tab-stop grid, where Enter or F2 enters a cell's
widget, was considered and rejected: it would have taken the header tab stops and
your `#cell` controls out of the tab order.

**`DzCalendar`: `Shift`+`PageUp` / `Shift`+`PageDown` now move a year.** Both rows
were published and `shiftKey` was read nowhere in the component, so both page keys
moved a month whether or not Shift was held. Unmodified `PageUp` / `PageDown` are
unchanged.

**`DzTransfer`: typing a character moves focus to the next matching option.** The
APG `listbox` type-ahead row was published and the only thing answering a character
was the pane's search field, which *filters* rather than moving focus. Type-ahead
reads each **rendered** option's own text, so it matches what a screen reader
announces and keeps working when you fill the `#item` slot; it starts after the
focused option and wraps, so repeating a character cycles through options with the
same initial. Disabled options are skipped, a modifier combination is left alone,
and a character typed into a field inside an option is still text entry. The search
field is unaffected — it is a sibling of the list, not inside it.

**`DzSplitButton` loses two menu rows, because the menu is yours.**
`ArrowDown` *(trigger)* — *"open the menu and focus its first item"* — and
`Escape` *(menu open)* — *"close the menu and return focus to the trigger"* — are
withdrawn. `DzSplitButtonMenu` renders a disclosure `<button aria-haspopup="true">`
and a `<slot>`; the menu itself is whatever you compose into it, as both of the
family's own examples show. **`DzDropdownMenu` publishes and implements both rows**,
including the identical `Escape` sentence, so if you compose one you have them
already. `Enter` *(trigger)* stays and is re-described: it activates the disclosure,
and the menu in its slot is what opens. **No markup changed** — two rows left a
published table and one sentence became true.
