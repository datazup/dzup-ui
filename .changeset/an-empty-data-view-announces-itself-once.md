---
"@dzup-ui/core": patch
---

An empty `DzDataView` announces itself once, not twice

The root renders an `sr-only` `aria-live="polite" aria-atomic="true"` region that
reports the rendered window, and an empty collection renders a `DzEmpty` whose own
root is `role="status"` — itself a live region. Both carried `emptyTitle`, so an
empty data view put the same string into two live regions in one render and an
assistive technology announced it twice.

The two regions exist for different messages, so they now carry different messages
rather than one of them being removed: the window region reports the **count**
(`showingAll` at `count: 0` — "Showing 0 items"), and `DzEmpty` reports the empty
**state** (its title, and optionally a description and an action). `showingAll` is
an existing count-bearing message key, so no locale file changed and no new key
needs translating.

**What this changes for you.** The text inside the root's `sr-only` live region
when `items` is empty: it was `emptyTitle` (by default "No items") and is now
"Showing 0 items", resolved through the message catalog and pluralised by
`Intl.PluralRules` like the non-empty case already was. `emptyTitle` still renders,
unchanged, in the empty state itself — which is the node a sighted user reads and
the one an AT should announce for it. No prop, emit, slot, `data-part`,
`data-state` or message key changed, and both live regions are still present.
