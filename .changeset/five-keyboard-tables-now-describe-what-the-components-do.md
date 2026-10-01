---
"@dzup-ui/core": patch
---

Five published keyboard tables now describe what the components actually do

An audit read **all 404 declared keyboard rows against the code each one cites** —
not a sample; every citation site was opened. 352 held. 52 named a real file for a
claim it does not support, and **twelve of those were rows that are themselves
false**. Nine of those twelve are filed rather than papered over (they need a
decision about whether to build the behaviour or withdraw the promise); three
tables are corrected here, and two more rows are re-scoped so they point at the
node they were always about.

**`DzTable` loses three rows, because it has never had a sortable header.** It
declared `Enter`, `Space` and `Shift`+`Enter` scoped to a sortable header, each
*"cycle the focused column sort"*. `DzTable.types.ts` says of this component that
column sorting belongs to `DzDataGrid`, `sortable` appears nowhere in the `DzTable`
family, and `useDataGridHeader` — which its own comment credited — is imported only
by `DzDataGridHeader`. `DzDataGrid` carries the same three rows, correctly, against
real code. If you sort a column with the keyboard today you are using `DzDataGrid`;
nothing you can do stops working.

**`DzOrderList` reordering is a grab, not a modifier.** It declared
`Alt`+`ArrowUp` / `Alt`+`ArrowDown` *"move the selected item"* and `Space`
*"select the focused option"*. Measured: `Space` **grabs and drops** the focused
item, the plain arrows move it while it is grabbed, and `Alt` is read in exactly one
place in the component — inside type-ahead, where it *rejects* the key. So
`Alt`+`ArrowUp` has never done anything `ArrowUp` does not. The three rows now say
that, with `when: 'grabbed'` distinguishing the reorder arrows from the two
focus-navigation rows carrying the same keys. **Behaviour is unchanged**: this is a
documentation correction to a keyboard table that misdescribed a working control,
and `Enter` was already the row that said "select".

**Three rows are re-scoped to the node they describe**, which changes the published
`when` column and nothing else:

- **`DzTimePicker`** `Enter` — *"select the highlighted option and close the time
  list"* — now names the `item` part. Unscoped, it read as a claim about the popover
  trigger, whose `Enter` *opens* the list.
- **`DzSplitButton`** `Enter` and `Space` — *"activate the primary action"* — now
  name the `action` part instead of `root`. `root` is the `role="group"` wrapper and
  activates on nothing; the primary action is the `DzSplitButtonAction` button.
- **`DzTransfer`** `Enter` — *"move the selected items to the other list"* — now
  names the declared `action` part instead of the free text `transfer action`. Free
  text left the row unscoped, so it read as a claim about an option in a pane.

**No prop, emit, slot, part name, state value, token or class changed, and no
keyboard behaviour changed.** What changed is the `keyboard` array these five
components publish through their anatomy, the ownership manifest and their
documentation page — and it changed in the direction of being true.
