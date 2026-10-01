---
"@dzup-ui/core": patch
---

A server-rendered `DzStepper` no longer reports every step as completed

`DzStepperItem` claimed its own position from the parent's counter inside
`onMounted`, and `onMounted` never runs during server-side rendering. `stepIndex`
therefore stayed at its initial `-1` on the server, `-1 < activeStep` is true for
every step of a stepper on step 0, and so **every** step server-rendered
`data-state="completed"` with the completed check mark while **no** step carried
`aria-current="step"`. Measured on a three-step stepper: the same 2,706 bytes of
HTML for `modelValue` 0, 1 and 2 — the server output did not depend on the model
at all, so the first paint of any wizard said the whole wizard was finished.

Nothing warned about it. The client's *first* render agreed with the server (both
had `-1`), so Vue reported no hydration mismatch; the correction arrived
afterwards in the mount hook as an ordinary reactive patch that silently rewrote
2,706 bytes of DOM into 2,317, turned three `completed` states into
`completed`/`active`/`upcoming`, removed two check marks and added an
`aria-current` from nowhere.

The index is now claimed during `setup`, which runs on the server and on the
client, once per instance, in the order the children are created. The server HTML
is now the client's first paint, byte for byte.

**What this changes for you.** The rendered `data-state` on each step, the
presence of `aria-current="step"`, and which indicator shows a check mark rather
than a number are all now correct in server-rendered output. If you snapshot a
server-rendered stepper, the snapshot changes — and what it used to record was
wrong. No prop, emit, slot, `data-part`, `data-state` value, injection key or
message key changed: `DzStepperItem`'s declared states are still
`upcoming · active · completed`, and the `DZ_STEPPER_KEY` context still exposes
`registerStep: () => number`. Only the moment it is called moved.
