<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzDataView — AT test script

**Tier C · APG pattern `custom` · source `packages/core/src/components/data/DzDataView.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzDataView.md`](../DzDataView.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Eight products under a visible heading, "Product catalog". A layout toggle group switches between list and grid renderings of the same collection.
- APG models neither the layout switch nor the list/grid pair, so the expectations below come from the component contract plus the ARIA Toolbar and Live Region contracts.

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

The scaffold says this component owes 3 task(s):
`reach`, `activate`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-data-dzdataview--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzdataview--accessibility&viewMode=story)

**Do:**

1. Tab until focus enters the data view.

**The AT must:**

- [ ] The region takes its accessible name from the visible heading "Product catalog".
- [ ] The collection is announced as a list with eight items.
- [ ] The layout toggle group is announced with the name "View layout"; the sort control, where present, is announced with the name "Sort by".

**Read from:** Toolbar — a group of controls announces its own name; and the ARIA list contract (`role="list"` with `listitem` children).

### Step 2 — task `activate`

**Open:** [`core-data-dzdataview--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzdataview--accessibility&viewMode=story)

**Do:**

1. Tab into the layout toggle group.
1. ArrowRight to move to the other option.
1. Enter.

**The AT must:**

- [ ] The toggle group is one tab stop; Arrow keys move within it (roving tabindex).
- [ ] Each option is announced with its name and its pressed state.
- [ ] Activating announces the newly pressed option AND that the previous one is no longer pressed.
- [ ] The layout change happens once. List semantics survive it — after the switch the collection is still announced as a list of eight items, not as a bare set of divs.

**Read from:** Toolbar — Keyboard Interaction (one tab stop, Arrow keys within); `aria-pressed` on a toggle button.

### Step 3 — task `live`

**Open:** [`core-data-dzdataview--loading`](http://127.0.0.1:6006/iframe.html?id=core-data-dzdataview--loading&viewMode=story)

**Do:**

1. Park focus outside the component, then load the loading story.
1. Then load `core-data-dzdataview--empty` the same way.
1. Finally, on `core-data-dzdataview--paginated`, move to the next page with focus on the pager control.

**The AT must:**

- [ ] "Loading items" is announced politely, once, without moving focus.
- [ ] The empty-state text is announced politely, once.
- [ ] Paging announces the rendered window ("Showing 5 to 8 of 8 items") politely, once, with focus left on the pager.
- [ ] The skeleton placeholders are not announced as content.

**Read from:** ARIA live regions; and the rule that decorative placeholders are hidden from the accessibility tree.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

