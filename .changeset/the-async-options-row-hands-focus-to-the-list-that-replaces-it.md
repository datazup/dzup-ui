---
"@dzup-ui/core": patch
---

The async-options row hands focus to the list that replaces it

On a selection control whose async-options panel is **in the canvas** rather than
portalled, the status row can be the whole of the control's tab order while a load has
failed. A keyboard user therefore reaches `Try again` by a `Tab` that has wrapped past
the end of the document, so the row is offered `document.body` as the place focus came
from and refuses it — focusing the body is indistinguishable from losing focus. Focus
was parked on the row instead, and when the retry **succeeded** the row unmounted with
focus on it: `document.activeElement` became `document.body` at the exact moment the
options the user had asked for appeared, so the fresh list could only be reached by
restarting from the top of the document.

Measured in real chromium on `DzListbox` (start on the viewport, three host buttons,
the body, then the retry control) and on `DzTransfer` (nothing tabbable outside the row
at all, so the very first `Tab` arrives from the body).

The row now hands focus on when it unmounts, to a destination the **host** supplies —
the list it has just rendered in the row's place. `DzListbox` names its listbox
viewport, which Reka forwards to the first option; `DzTransfer` names the first enabled
option of its source list. The destination is resolved after the row has gone and the
replacement has rendered, because on `DzTransfer` the element focus should go to is
created by the very answer that removes the row.

Unchanged where nothing was broken: a portalled panel's route always arrives from the
control's own input or trigger, which outlives the row, and `DzMention` returns focus
to the text control the mention is being composed in. No prop, emit, slot,
`data-part`, `data-state`, message key or variant changed — hence `patch`.
