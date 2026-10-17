---
"@dzup-ui/core": patch
---

**The date pickers open from their trigger with ArrowDown / ArrowUp, and the multiline `DzMention` no longer carries a role a `<textarea>` may not have.**

- `DzDatePicker` and `DzDateRangePicker` declared (APG combobox) that ArrowDown / ArrowUp on
  the closed trigger opens the calendar, but the trigger only reacted to a click. Both keys now
  open it and emit `open`.
- The default multiline `DzMention` rendered `<textarea role="combobox" aria-haspopup aria-expanded>`,
  which ARIA in HTML does not allow (axe `aria-allowed-role`). The textarea keeps its native
  textbox role with `aria-autocomplete="list"`, `aria-controls` and `aria-activedescendant`; the
  single-line input is still a combobox.
