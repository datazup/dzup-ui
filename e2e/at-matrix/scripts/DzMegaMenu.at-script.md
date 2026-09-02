<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzMegaMenu — AT test script

**Tier C · APG pattern `menubar` · source `packages/core/src/components/navigation/DzMegaMenu.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzMegaMenu.md`](../DzMegaMenu.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- A horizontal menubar. Opening on hover is switched off in this story on purpose, so every step is keyboard-driven.
- The first entry, "Products", owns a panel with three columns: Analytics (Dashboards, Reports, Funnels), Data (Pipelines, Warehouse, Connectors) and AI (Models, Agents).

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

The scaffold says this component owes 6 task(s):
`reach`, `navigate`, `open`, `activate`, `dismiss`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-navigation-dzmegamenu--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzmegamenu--accessibility&viewMode=story)

**Do:**

1. Tab until focus enters the menubar.

**The AT must:**

- [ ] It is announced as a menu bar named "Keyboard navigation".
- [ ] It is one tab stop — Tab reaches it once and one more Tab leaves it.
- [ ] The entry that takes focus is announced as a menu item with its position in the set.

**Read from:** Menubar — Keyboard Interaction: "the menubar contains one tab stop"; `aria-orientation="horizontal"`.

### Step 2 — task `navigate`

**Open:** [`core-navigation-dzmegamenu--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzmegamenu--accessibility&viewMode=story)

**Do:**

1. ArrowRight, ArrowRight, ArrowLeft, Home, End.

**The AT must:**

- [ ] Each entry is announced with its label and its position in the set.
- [ ] An entry that owns a panel is announced as having a submenu and as collapsed.
- [ ] An entry that is a plain link is NOT announced as having a submenu.
- [ ] Home announces the first entry and End the last. Nothing is skipped.

**Read from:** Menubar — Keyboard Interaction Right/Left/Home/End; `aria-haspopup` and `aria-expanded` only on entries that own a submenu.

### Step 3 — task `open`

**Open:** [`core-navigation-dzmegamenu--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzmegamenu--accessibility&viewMode=story)

**Do:**

1. Move to "Products" and press ArrowDown.

**The AT must:**

- [ ] "Products" is announced as expanded.
- [ ] The AT moves into the panel and announces its first link without a further keystroke.
- [ ] The column headings inside the panel are announced as group names as the tester crosses into each column.

**Read from:** Menubar — Down Arrow on a menubar item opens its submenu and moves focus to the first item.

### Step 4 — task `activate`

**Open:** [`core-navigation-dzmegamenu--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzmegamenu--accessibility&viewMode=story)

**Do:**

1. ArrowDown twice inside the panel, then Enter on a link.

**The AT must:**

- [ ] Each link is announced with its label and its description.
- [ ] Enter follows the link exactly once.
- [ ] Opening a second menubar entry closes the first, and only the newly opened panel is announced — the closing of the first is not announced as a second focus move.

**Read from:** Menubar — Enter activates the focused item; only one submenu is open at a time.

### Step 5 — task `dismiss`

**Open:** [`core-navigation-dzmegamenu--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzmegamenu--accessibility&viewMode=story)

**Do:**

1. Open the "Products" panel again, then Escape.

**The AT must:**

- [ ] The panel closes and "Products" is announced as collapsed.
- [ ] Focus returns to "Products" and the AT announces it — the tester can tell where they are without looking.

**Read from:** Menubar — Escape closes the submenu and returns focus to the menubar item that opened it.

### Step 6 — task `live`

**Open:** [`core-navigation-dzmegamenu--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzmegamenu--accessibility&viewMode=story)

**Do:**

1. Open "Products".
1. Without closing it, press ArrowRight to move to the next menubar entry that owns a panel, and ArrowDown to open it.

**The AT must:**

- [ ] The newly opened panel is announced exactly once.
- [ ] The first panel closing is not announced as a separate event that the tester has to interpret.
- [ ] At no point are two panels announced as open.

**Read from:** Menubar — one submenu open at a time; ARIA live regions must not double-report a state the focus move already carries.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

