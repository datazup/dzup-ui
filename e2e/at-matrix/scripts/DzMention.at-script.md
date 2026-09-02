<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzMention — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzMention.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzMention.md`](../DzMention.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- A comment textarea. Typing `@` opens a suggestion list of five people: Alice Johnson, Bob Smith, Carol Williams, David Brown, Eve Davis.
- This is the hardest focus contract in the set: focus never leaves the textarea, and the active suggestion is published through `aria-activedescendant`.
- A line below shows the raw value. Use it to confirm what was inserted.

## Pairs this component owes

Drive the whole script once per pair. A pair you did not run is `unrun`, which
is a fact; it is never `fail`.

| id | Pairing | What it exposes |
|---|---|---|
| `nvda-firefox` | NVDA + Firefox (Windows) | Browse/forms mode switching and the Gecko accessibility tree. |
| `nvda-chrome` | NVDA + Chrome (Windows) | The same AT over Blink, where virtualized and composite widgets differ. |
| `jaws-chrome` | JAWS + Chrome (Windows) | JAWS heuristics over ARIA, which override author intent more often. |
| `voiceover-safari` | VoiceOver + Safari (macOS) | WebKit behaviour and rotor navigation. |
| `voiceover-ios` | VoiceOver + Safari (iOS) | Touch exploration; a control reached by gesture, not by Tab. |
| `talkback-android` | TalkBack + Chrome (Android) | Touch exploration, gestures and drag alternatives. |

## Steps

The scaffold says this component owes 8 task(s):
`reach`, `open`, `navigate`, `typeahead`, `select`, `dismiss`, `error`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-forms-dzmention--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the textarea.

**The AT must:**

- [ ] It is announced as a combobox named "Keyboard comment".
- [ ] It is announced as collapsed and as a multi-line editable field.
- [ ] The placeholder is announced as its description or its value hint, not as its name.

**Read from:** Combobox (editable) — `role="combobox"` on the editable element, `aria-expanded="false"`, `aria-autocomplete`.

### Step 2 — task `open`

**Open:** [`core-forms-dzmention--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--accessibility&viewMode=story)

**Do:**

1. Type `@`.

**The AT must:**

- [ ] The combobox is announced as expanded.
- [ ] The popup is announced as a listbox.
- [ ] The first suggestion becomes the active option and is announced — WITHOUT the AT reporting that focus moved. Focus is still in the textarea.

**Read from:** Combobox — `aria-activedescendant` focus management; `aria-controls` wired to the popup only while it is open.

### Step 3 — task `navigate`

**Open:** [`core-forms-dzmention--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--accessibility&viewMode=story)

**Do:**

1. ArrowDown twice, then ArrowUp once.

**The AT must:**

- [ ] Each suggestion is announced with its label and its position — "Bob Smith, 2 of 5".
- [ ] The active option is also announced as selected.
- [ ] The caret does not move inside the textarea while the list is being navigated.

**Read from:** Combobox — Down/Up move the active option; `aria-selected` on the active option.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dzmention--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--accessibility&viewMode=story)

**Do:**

1. Escape to dismiss, then type `@Ca`.

**The AT must:**

- [ ] The list narrows to "Carol Williams".
- [ ] The number of matches is announced politely, once.
- [ ] The single match becomes active and is announced.

**Read from:** Combobox with list autocomplete.

### Step 5 — task `select`

**Open:** [`core-forms-dzmention--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--accessibility&viewMode=story)

**Do:**

1. Enter.

**The AT must:**

- [ ] The mention is inserted and the inserted text is announced.
- [ ] The list is announced as collapsed.
- [ ] The value line reads the inserted mention.

**Read from:** Combobox — Enter accepts the active option and closes the popup.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dzmention--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--accessibility&viewMode=story)

**Do:**

1. Type `@` again to re-open the list, then Escape.

**The AT must:**

- [ ] The combobox is announced as collapsed.
- [ ] Nothing was inserted.
- [ ] Focus is still in the textarea and the caret is where it was.

**Read from:** Combobox — Escape closes the popup without changing the value.

### Step 7 — task `error`

**Open:** [`core-forms-dzmention--invalid-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--invalid-state&viewMode=story)

**Do:**

1. Tab onto the control, Tab away, then Shift+Tab back.

**The AT must:**

- [ ] The control is announced as invalid.
- [ ] The error text is announced as part of the control and is re-announced on re-focus.

**Read from:** WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.

### Step 8 — task `live`

**Open:** [`core-forms-dzmention--async-search`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmention--async-search&viewMode=story)

**Do:**

1. Type the trigger character and wait without moving focus.
1. Then type a query that matches nothing.

**The AT must:**

- [ ] The pending state is announced politely, once, with focus unmoved.
- [ ] While it is pending, no listbox is announced as available.
- [ ] The no-match copy is announced politely, once.

**Read from:** ARIA live regions and `aria-busy`; a busy popup is a status, not a focus event.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **D3** — affects `live`. The `loading` prop is dead — shadowed by an internal ref of the same name. The pending state is only reachable through an async resolver, which is why the `live` step uses the async story.
- **D8** — affects `select`. `useDualModel` ignores external writes to `v-model:value` after the first user edit. Resetting the composer from outside will not take.

