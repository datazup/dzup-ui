---
"@dzup-ui/core": patch
---

The async-options retry control can be reached by keyboard

`Try again` is the only way to recover a failed option load, and on every selection
control whose panel is portalled it could not be reached by keyboard at all. It is a
focusable button and the only tabbable element in the panel, but `Tab` follows
*document* order out of the portal into the host page — and the popup closes behind
it — while the arrow, `Home`, `End` and `PageDown` family never left the input,
because an error state has no options to navigate. Seven routes were driven in real
chromium and none arrived. That is a **WCAG 2.1.1 (Keyboard), Level A** failure on a
documented affordance.

A bare `ArrowDown` or `ArrowUp` from the element that owns the control's focus now
moves focus to the retry control, `Enter` and `Space` activate it as they always did,
and `ArrowUp` hands focus back so a user can return to typing without dismissing the
panel. `Tab` keeps its ARIA APG meaning of leaving the combobox, and focus never
leaves the widget, so the popup is not dismissed at any point. Where the panel is in
the canvas rather than portalled, `Tab` already reached the control and still does.

Focus after a successful retry also changes: it returns to the control's own input or
trigger instead of resting on the status row, because the row unmounts when the
options arrive and was dropping focus on `document.body` at the moment the user got
what they asked for.

Affects `DzCascader`, `DzCombobox`, `DzListbox`, `DzMention`, `DzMultiSelect`,
`DzSelect`, `DzTransfer` and `DzTreeSelect`. No prop, emit, slot, `data-part`,
`data-state`, message key or variant changed, and the keys the route consumes were
measured to do nothing in the state where it consumes them — hence `patch`. A reader
who counts a new keyboard affordance as an addition rather than a repair would call
it `minor`; the bump is the release owner's to raise if they prefer that reading.
