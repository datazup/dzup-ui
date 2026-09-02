<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzSidebar — AT test script

**Tier C · APG pattern `treeview` · source `packages/core/src/components/navigation/DzSidebar.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzSidebar.md`](../DzSidebar.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- READ THIS FIRST. The quality matrix declares this component APG `treeview`. The component ships `role="navigation"` with links, which is what APG actually recommends for site navigation — APG says explicitly not to use the menu or tree patterns for a set of page links.
- The steps below are therefore written against the navigation-landmark contract the component declares, NOT against the Tree View pattern. The mismatch is an open owner decision (is the declared pattern wrong, or the component?); it is recorded in the TASK-N1-O4 handoff. Do not file it again.
- Four entries under a "Workspace" section: Dashboard (current), Sessions, Billing (disabled), Settings.

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

The scaffold says this component owes 5 task(s):
`reach`, `navigate`, `select`, `typeahead`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-navigation-dzsidebar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzsidebar--accessibility&viewMode=story)

**Do:**

1. Tab until focus enters the sidebar, and separately find it with your AT landmark command (NVDA/JAWS: `d`; VoiceOver: rotor → Landmarks).

**The AT must:**

- [ ] It is announced as a navigation landmark named "Workspace navigation".
- [ ] It is findable by that name from the landmark list — a tester should not have to Tab through the page to reach it.
- [ ] The section heading "Workspace" is announced as a group name.

**Read from:** Landmark Regions — `navigation` with an accessible name; APG explicitly recommends this over the menu/tree patterns for site navigation.

### Step 2 — task `navigate`

**Open:** [`core-navigation-dzsidebar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzsidebar--accessibility&viewMode=story)

**Do:**

1. Tab through every entry, then Shift+Tab back.

**The AT must:**

- [ ] The order is Dashboard, Sessions, Settings.
- [ ] The disabled "Billing" entry is SKIPPED by Tab.
- [ ] Exactly one entry is announced as the current page.
- [ ] Each entry is announced with its visible label.

**Read from:** Landmark Regions and the link contract; `aria-current="page"` on exactly one entry; `aria-disabled` + removal from the tab order.

### Step 3 — task `select`

**Open:** [`core-navigation-dzsidebar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzsidebar--accessibility&viewMode=story)

**Do:**

1. Tab to "Sessions" and press Enter.

**The AT must:**

- [ ] The entry activates exactly once.
- [ ] "Sessions" is now announced as the current page and "Dashboard" is not.
- [ ] Still exactly one entry claims the current page.

**Read from:** The `aria-current` contract: exactly one element in a set carries it.

### Step 4 — task `typeahead`

**Open:** [`core-navigation-dzsidebar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzsidebar--accessibility&viewMode=story)

**Do:**

1. In browse mode, use your AT next-link command (NVDA/JAWS: `k`; VoiceOver: rotor → Links).

**The AT must:**

- [ ] Every sidebar entry appears in the links list with its visible label.
- [ ] The disabled "Billing" entry is announced as unavailable, or is absent — it is not offered as a working link.
- [ ] No entry appears in the list twice.

**Read from:** The listbox typeahead obligation the scaffold derives from `treeview`, met here through the AT own element-navigation commands, which is the equivalent affordance for a landmark of links.

### Step 5 — task `live`

**Open:** [`core-navigation-dzsidebar--collapsed`](http://127.0.0.1:6006/iframe.html?id=core-navigation-dzsidebar--collapsed&viewMode=story)

**Do:**

1. Tab through the collapsed rail.
1. On `core-navigation-dzsidebar--real-world-app-shell`, activate the collapse control and Tab through the rail again.

**The AT must:**

- [ ] The collapsed rail keeps every accessible name — the visible label may be gone, the announced name may not be.
- [ ] The collapse control announces its own expanded/collapsed state and the change is announced once.
- [ ] The current-page entry is still announced as current after collapsing.
- [ ] Focus is not stranded on a control the collapse removed.

**Read from:** The `aria-expanded` contract on a disclosure control; and the ARIA rule that a name may not depend on visible text alone.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

