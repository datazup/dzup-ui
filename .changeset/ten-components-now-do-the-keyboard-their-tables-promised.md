---
"@dzup-ui/core": patch
---

Ten components now do the keyboard their published tables already promised

`yarn validate:anatomy-keyboard` (added in the previous release) measured **28
declared keyboard bindings that nothing implemented** across ten components. None
of them was a documentation error: each was a published contract stating what its
APG pattern requires, against code that did not do it. All 28 are closed — 22 by
implementing the key, 6 by withdrawing a row that described a component this one
is not.

**Two were keyboard-inoperable controls, and they are the headline.**

- **`DzToolbar`** is `role="toolbar"`, which the APG defines as a single tab stop
  whose controls are reached with the arrow keys, and it contained no key handling
  at all. It now has the roving focus it declared: ArrowRight / ArrowLeft move
  between controls and wrap, mirrored in a RTL document; Home and End reach the
  ends; a text field inside the bar keeps its own arrows; and exactly one control
  carries `tabindex="0"`, so the bar is entered and left once.
  **This changes the tab order of an existing toolbar** — previously every control
  in it was its own tab stop. A control you deliberately gave `tabindex="-1"` stays
  out of the order. `orientation="vertical"` now also answers ArrowDown / ArrowUp,
  which it has always announced through `aria-orientation` and never implemented.
- **`DzListItem`** took `tabindex="0"` when its list is `interactive` and answered
  only the mouse — an SC 2.1.1 failure. Enter and Space now activate the row. The
  emitted `click` is still a `MouseEvent`: the row dispatches a real click, which
  is how the platform activates a `<button>`, so the declared emit signature stays
  true and a keyboard activation and a pointer activation are the same event for
  every listener, including an `onClick` passed through `$attrs`.

**The other eight.**

- **`DzCascader`** — Home and End move within the focused column. They were the
  only keys missing from a `switch` that already had the arrows.
- **`DzCarousel`** — ArrowRight and ArrowLeft show the next and previous slide,
  direction-aware, and honour `loop` and `disabled`. The region is still not a tab
  stop: the keys arrive from one of its own controls, which is what the APG
  carousel pattern intends.
- **`DzTour`** — ArrowRight and ArrowLeft move between steps. Not direction-aware,
  which is what the anatomy declares (`rtl.keyboard: 'none'`): a step sequence has
  no inline axis. ArrowRight on the last step does nothing rather than finishing
  the tour.
- **`DzTransfer`** — ArrowDown / ArrowUp / Home / End move between the options of
  the focused pane, skipping disabled rows and stopping at the ends. The arrows
  previously resolved to the async-error retry handler, which is a real behaviour
  and not the one the rows describe.
- **`DzTimePicker`** — ArrowDown and ArrowUp on the trigger open the list (the
  first clause of both rows), and inside the list all four keys move the highlight
  within a unit column. Per column, because hours, minutes, seconds and meridiem
  are four independent listboxes.
- **`DzDatePicker`** and **`DzDateRangePicker`** — Home and End move to the first
  and last day of the focused week. Their rows used to say `when: 'list open'` and
  *"Move to the first option."*, which is combobox wording in a calendar grid with
  no option list; they now say what the APG date-picker-dialog pattern says.
- **`DzOrderList`** — typing a character moves focus to the next option whose
  label starts with it, wrapping, and reading the label from the rendered row so it
  matches what a screen reader announces and works with a filled `#item` slot. It
  is inert while a row is grabbed for reordering.

**`DzColorPicker`'s six rows were withdrawn, not implemented, and the evidence is
in its anatomy.** The table declared APG `slider` navigation over a *"colour
pointer"*, a *"saturation axis"* and a *"value axis"*. None of those exists: the
panel is a native `<input type="color">`, a hex text field and a grid of preset
buttons. Nothing is hidden by removing them — a keyboard user can set any colour
today, by typing into the hex field or through the native input, which the platform
operates fully. Six rows describing what the panel does have replaced them
(Enter/Space on the trigger, Escape, Tab, Enter on a preset, character entry in the
hex field). Building a real two-dimensional HSV slider is the change that would
make the old rows true and is a redesign of a published panel; it is filed rather
than half-done.

**Also corrected.** `DzCarousel`'s Enter and Space rows were scoped
`when: 'control'`, a word that is neither a declared part nor a prop; they now name
the declared `action` part, which is the previous/next button they were always
about.

**What this changes for you.** New keyboard behaviour on ten components, and no
prop, emit, slot, `data-part`, `data-state` value, token or class was removed or
renamed. The visible changes are the arrow keys doing something where they used to
do nothing, `DzToolbar`'s tab order becoming one stop, `DzListItem` emitting
`click` from a key, and the `keyboard` array these components publish through their
anatomy, the ownership manifest and their documentation page.
