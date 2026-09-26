---
"@dzup-ui/core": patch
---

**The two credential inputs stop failing WCAG 2.2 SC 3.3.8 Accessible Authentication.**

SC 3.3.8 (AA) forbids a cognitive-function test in an authentication step unless
the step offers an alternative or a *mechanism* that removes it. Both of the
library's credential inputs shipped the mechanism switched off. Neither was a
missing feature — each was a flag that was never passed.

**`DzOtpInput` now advertises platform autofill.** Reka's `PinInput` emits
`autocomplete="one-time-code"` on every cell only when its `otp` flag is set, and
`DzOtpInput` never set it, so every cell rendered `autocomplete="false"`. iOS,
macOS and Android therefore did not offer the code that had just arrived by SMS,
and the user was left transcribing a code from another device — which is the
cognitive-function test the criterion exists to remove. The new `otp` prop
defaults to `true`, which is what the component is named for; focus also lands on
the first empty cell rather than the cell that was tapped, which is Reka's own
behaviour behind the same flag.

```vue
<DzOtpInput v-model="code" />                 <!-- autofillable one-time code -->
<DzOtpInput v-model="pin" :otp="false" />     <!-- a local PIN; do not offer to fill it -->
```

Pasting a code already worked and is unchanged: a paste into any cell is split
across the cells, on every engine.

**`DzPasswordInput` can finally say which password step it is.** The field
hard-coded `autocomplete="current-password"`, and because the component sets
`inheritAttrs: false` and spreads `$attrs` onto its wrapper `<div>`, writing
`autocomplete="new-password"` on the component put the token on an element no
browser reads. A registration or change-password form could not steer a password
manager at all — silently. `autocomplete` is now a prop, still defaulting to
`current-password`, and it lands on the `<input>`.

```vue
<DzPasswordInput v-model="pw" autocomplete="new-password" />
```

**The reveal control is reachable by keyboard.** The show/hide toggle carried
`tabindex="-1"`, so the only way to check what you had typed was a mouse. Reading
back a password you cannot see is the other technique SC 3.3.8 recognises, and a
control with a function of its own that no key can reach is a plain SC 2.1.1
failure besides. The attribute is gone; the toggle is now an ordinary tab stop
after the field.

Its label is also translatable for the first time — `DzPasswordInput.showPassword`
and `DzPasswordInput.hidePassword` join the message catalog, replacing two English
literals that no application could change.
