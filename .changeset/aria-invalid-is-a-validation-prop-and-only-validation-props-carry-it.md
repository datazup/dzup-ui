---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

**`ariaInvalid` has left `BaseAccessibilityProps`. Sixty-six components stop declaring a validity claim they never rendered, and the prop now lives only where validity lives.**

`TASK-R0-O2`, closing `N5-02 D1` and the removal half recorded as `D10` in
`docs/program-2026-09-04/reports/TASK-R5-O1-handoff.md`.

**What changed in `@dzup-ui/contracts`.** `BaseAccessibilityProps` — the
*labelling* base, the one a component extends when all it wants is an
accessible name — no longer declares `ariaInvalid`. `BaseValidationProps`
declares it, beside `invalid`, `error` and `required`, which is the same claim.
`TASK-R5-O1` added it there on 2026-09-04 and deliberately left the old
declaration in place so that step was additive; this is the other half.

**Why.** Validity is a form-control concern. Declaring it on the labelling base
handed a validity claim to every component that wanted a name, and the library
measured the result: **98 components declared `ariaInvalid` and 32 forwarded
it.** The other 66 accepted the binding, type-checked it in your source, and
rendered nothing — the same defect class as
`.changeset/nine-aria-props-that-did-nothing-are-gone.md`, at eleven times the
size. Six points of use had already written
`Omit<BaseAccessibilityProps, 'ariaInvalid'>` to take the prop back by hand.

**The 66 components that lose `ariaInvalid`:**

`DzAccordion`, `DzAffix`, `DzAlert`, `DzAnchor`, `DzAnimatedNumber`,
`DzAvatar`, `DzBackTop`, `DzBlockUI`, `DzBreadcrumb`, `DzButton`, `DzCalendar`,
`DzCarousel`, `DzChip`, `DzCollapse`, `DzColorModeToggle`, `DzCommandPalette`,
`DzContainer`, `DzContextMenuContent`, `DzCountdown`, `DzDataGrid`,
`DzDataView`, `DzDeferredContent`, `DzDescriptions`, `DzDialogContent`,
`DzDivider`, `DzDropdownMenuContent`, `DzFab`, `DzFlex`, `DzImage`,
`DzImageComparison`, `DzInfiniteScroll`, `DzLightbox`, `DzList`, `DzListItem`,
`DzMasonry`, `DzMegaMenu`, `DzMenu`, `DzMeterGroup`, `DzNotification`,
`DzOrderList`, `DzPagination`, `DzPanel`, `DzPopconfirm`, `DzProgress`,
`DzQRCode`, `DzRelativeTime`, `DzResizable`, `DzScrollArea`, `DzScrollProgress`,
`DzSegmented`, `DzSheetContent`, `DzSidebar`, `DzSidebarItem`, `DzSpeedDial`,
`DzSplitButton`, `DzSplitter`, `DzTable`, `DzTag`, `DzTimeline`,
`DzTimelineItem`, `DzToast`, `DzToggleButton`, `DzToolbar`, `DzTour`, `DzTree`,
`DzWatermark`.

**No component gains a prop**, and the 32 that forward `aria-invalid` keep it
unchanged. Twenty-five of those reach it through `BaseValidationProps` or
`BaseFormControlProps`. Seven forward the attribute without being validation
components and now declare the single prop on their own interface — `DzCard`,
`DzCheckbox`, `DzCheckboxGroup`, `DzInputGroup`, `DzRadio`, `DzRadioGroup`,
`DzSwitch`. They did **not** gain `BaseValidationProps`, because that base also
carries `invalid`, `error` and `required`, and those seven read none of the
three: they resolve invalidity from the enclosing `DzFormField`. Adding three
props nothing reads would have recreated the defect this change removes.

**Why this is a `minor` and not a `patch`.** `packages/contracts/VERSIONING.md`
§3: removing a declared prop is a type removal, and a prop that did nothing at
runtime still type-checked in consumer source, so deleting it stops that source
compiling. Under the 0.x mapping in §1 a break goes in the minor position,
where `^0.x` does not carry it into an unattended install.

**What you will see if you were passing one.** The binding no longer resolves
to a prop, so Vue routes it into `$attrs`, and these components spread `$attrs`
onto their root — so `aria-invalid` now *renders*, on an element with no role to
carry it. That is a different wrong answer from the old silent swallow. **The
six components in the N5-02 removal emit a one-time dev-mode warning for this;
these 66 do not** — adding 66 warnings was judged out of proportion to the
change and is recorded as an open decision (`TASK-R0-O2` D190). Nothing warns
you; the migration table below is the whole story.

**Migration.** Delete the binding, or move it to the element that owns the
validity:

| Was | Now |
| --- | --- |
| `<DzButton :aria-invalid="hasError">` | the field is invalid, not the button that submits it |
| `<DzPanel>` / `<DzContainer>` / `<DzFlex>` and the other layout boxes | put `aria-invalid` on the field inside |
| `<DzTable>` / `<DzDataGrid>` / `<DzDataView>` | the editable cell's control carries it |
| `<DzToast>` / `<DzAlert>` / `<DzNotification>` | a status message is not an invalid input; use `role="alert"`, which these already set |
| any of the 66 | bind `invalid` on the control, or wrap it in `DzFormField` |

If you genuinely need the attribute on one of these roots, it still reaches the
DOM through `$attrs` — that is now an explicit escape hatch rather than an
accident, and it is the only behaviour in this change that did not exist before.

**`@dzup-ui/codemods` has no delivery path** for a `rename-props` transform
covering this removal, for the reason
`.changeset/nine-aria-props-that-did-nothing-are-gone.md` already records: the
package is public and publishable but sits on the changesets `ignore` list
(owner decision `N5-01 D2`, `packages/tooling/scripts/release-policy.json`).
The table above is the migration.

**Regenerated with this change**, all four bound to the same sources:
`packages/core/docs/component-meta.json`, `llms.txt`, `llms-full.txt` and the
144 generated docs pages under `apps/docs/components/`.
`yarn validate:form-readiness` stays green at 0 gaps.
