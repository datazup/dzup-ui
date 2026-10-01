---
"@dzup-ui/core": patch
---

Five published keyboard tables now match what the components actually do

Every component with an anatomy publishes a `keyboard` table. It is copied into
`component-ownership.manifest.json`, joined into `component-meta.json` and
rendered as the keyboard section of the component's documentation page — so it is
the first thing anyone assessing accessibility reads. Nothing had ever compared
one of those tables to a line of code. Five of them were wrong in both directions.

**Rows removed, because nothing implemented them.**

- `DzChip` and `DzTag` each declared `Enter` and `' '` as *"Activate the
  chip/tag."* with `apg: 'button'`. Neither component has ever implemented it:
  their `handleKeyDown` tests only `Delete` and `Backspace`, their roots carry no
  click handler, and the only events they emit are `close`, `focus` and `blur`.
  There was no pointer activation for a key to mirror, so the rows promised an
  interaction that does not exist. Implementing activation instead was considered
  and rejected — it is a new behaviour on a published component, and `role="button"`
  on these roots was already rejected on the same evidence.
- In both, `when: 'removable'` is corrected to `when: 'closable'`, after the prop
  that actually gates the two removal keys.

**Rows added, because the components implement them and did not say so.**

- `DzSpeedDial` moves the roving focus along its action fan with `ArrowDown` /
  `ArrowUp` (vertical) and `ArrowRight` / `ArrowLeft` (horizontal), and declared
  only `Home`, `End` and `Escape`. The horizontal pair is declared `rtl: 'fixed'`:
  the fan runs from a physical corner and the handler never reads the document
  direction.
- `DzRating` handles `ArrowRight` / `ArrowLeft` and handles them
  direction-aware, while declaring only `ArrowUp` / `ArrowDown` — which left the
  table claiming `rtl.keyboard: 'swap-horizontal'`, a statement that can only be
  about the horizontal pair, and listing neither. They are declared
  `rtl: 'mirrored'`.
- `DzTabs` declares the family's contract, and `DzTabTrigger` has always closed a
  `closable` tab on `Delete` or `Backspace` — the only keyboard route to the tab's
  remove control. Neither key was published. They carry no `apg`, because the APG
  `tabs` pattern has no dismiss key and this is a component-specific affordance.

**What this changes for you.** No runtime behaviour changes in any of the five
components — no prop, emit, slot, `data-part`, `data-state` value, token or class
moved. What changes is the published keyboard table on each component's
documentation page, and the `keyboard` array these components expose through their
anatomy and the ownership manifest. If you generate documentation or an
accessibility conformance report from those arrays, four keys appear that were
missing, two false ones disappear, and two context labels are corrected.

`DzTag`'s unit spec now asserts the two removal keys it has always handled; it
asserted neither before.
