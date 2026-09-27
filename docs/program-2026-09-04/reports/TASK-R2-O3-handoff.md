# TASK-R2-O3 — Close the N1-O1 defect register (D8 controlled/uncontrolled first)

> Baseline **`main` @ `2d51eec`**, worktree **clean at start** (0 paths, 0 ahead
> / 0 behind `origin/main`). Every number below is bound to that commit plus
> this packet's uncommitted work. The README §2 baseline is `99b963a`; where a
> figure differs from the one it records, the difference is stated and
> attributed.
>
> **Nothing committed.** **203 paths**: 41 hand-written source/spec/story files
> plus the changeset, **160** the regenerated artifact chain
> `<generated_authority>` required (§3.10), and 2 program ledger files
> (`EXECUTION-STATUS.md`, `evidence-completion-tasks.md`). The owner commits.
>
> **State: `[x]` for nine of eleven defects + E6 + the three storybook
> failures; D4 and D10 are `[!]` — routed with recorded-defect gates and owner
> decisions D98/D99, because each needs a rendered-output or ARIA-pattern
> decision that `<no_api_change>` sends through VERSIONING.md.**

## 0. Done-check result

Run first, per README §4. **0 of 4 passed** — the task ran in full.

| Check | At start (`2d51eec`) | At end |
|---|---|---|
| `grep -rln 'D8\|external write after' packages/core/src --include='*.spec.ts' \| wc -l` → ≥ 7 | **1** — only `composition/controlledModel.contract.spec.ts`, the R5-O6 pin | **9** |
| `grep -rn 'D7' packages/core/src/composables/*focus*.spec.ts` | **no match** — and the glob cannot match: composables live one directory deep (`composables/useFocusTrap/useFocusTrap.spec.ts`), so this check could never have passed. Answered against the real path | **5 D7 specs** + 2 in `DzTour.spec.ts` |
| `yarn storybook:test` → exit 0 | **exit 1** | **exit 1** — the three N1-O1 failures are fixed; two *different*, pre-existing ones are now visible (§5.3) |
| `grep -n 'D8\|D7\|D4\|E6' …EXECUTION-STATUS.md \| grep -ci fixed` → ≥ 4 | printed **5**, and **every hit is incidental** — `R4a fixed`, `D4`/`D8` inside unrelated prose. **Zero defects were recorded as fixed.** A count of substrings is not a count of defects | **10 recorded** |

## 1. The register, as closed

Severity order is N1-O1's own (`../program-2026-09/reports/N1-O1-story-dod-handoff.md` §3b).
Every fix carries a regression spec whose title names the defect id, and every
one was **proved red before the fix and green after** (§4.1).

| id | Component(s) | State | Fix | Regression spec |
|---|---|---|---|---|
| **D8** | `useDualModel` → 7 controls | **fixed** | last-written sentinel (§2) | `composition/controlledModel.contract.spec.ts` (3) + one per control in `components/forms/Dz{Cascader,Inplace,Knob,Mention,Rating,TagsInput,TreeSelect}.spec.ts` |
| **D7** | `useFocusTrap` → `DzTour` | **fixed** | restore on release + `restoreFocus` opt-out | `composables/useFocusTrap/useFocusTrap.spec.ts` (5), `overlays/DzTour.spec.ts` (2) |
| **D4** | `DzCascader`, `DzTreeSelect` | **recorded + gated, not fixed** | needs DOM restructuring that moves a published `data-part` → **D98** | `DzCascader.contract.spec.ts`, `DzTreeSelect.contract.spec.ts` — recorded-defect assertions that fail when the count changes in *either* direction |
| **D1** | `DzTree` | **fixed** | `disabled` added to `DzTreeContext`; a row is inert when its own or the tree's is set | `data/DzTree.spec.ts` (6) |
| **D2** | `DzResizable` **and `DzSplitter`** | **fixed** | `disabled` added to `DzResizableContext`; both handles read it | `layout/DzResizable.spec.ts` (4) |
| **D3** | `DzMention` | **fixed** | the public `loading` prop is ORed into the busy state | `forms/DzMention.spec.ts` (2) |
| **D5** | `DzOrderList` | **already fixed at HEAD; now gated** | source was corrected before `2d51eec`; the defect *class* had no gate | `tests/ssr/aria-attribute-casing-ssr.spec.ts` |
| **D6** | `validate:story-dod` | **fixed** | the state-prop scan reads `*Props` interface bodies, not the whole file | `tooling/src/validators/story-dod.spec.ts` (5) |
| **D9** | `DzCombobox` | **fixed** | the clear control binds `:disabled` like its sibling trigger | `forms/DzCombobox.spec.ts` (2) |
| **D10** | `DzTreeSelect` | **recorded + gated, not fixed** | two focus mechanisms; picking one is an APG decision → **D99** | `DzTreeSelect.contract.spec.ts` |
| **D11** | 5 overlay content components | **fixed** | `:id` is bound only when there is one | `overlays/DzDropdownMenu.spec.ts` (2) |
| **E6** | SSR-wide | **fixed** | two-armed SSR gate, seeded | `tests/ssr/aria-attribute-casing-ssr.spec.ts` (8) |
| storybook × 3 | `DzFormField`, `DzFormParts`, `Localisation` | **fixed** | story drift, not component defects (§3.9) | the stories themselves |

**D2 found a twin the register did not name.** `DzSplitter` provides the *same*
`DzResizableContext` and `DzSplitterHandle` reads only its own `disabled`, so
`<DzSplitter disabled>` was presentational in exactly the same way. It was not
found by reading the register — `yarn typecheck` found it, because adding a
required member to the shared context made the second provider fail to compile.
That is the argument for making the field required rather than optional.

## 2. D8 — the fix, and why it is shaped this way

`useDualModel(primary, legacy)` read `isEmpty(primary) ? legacy : primary` and
**wrote to both**. A consumer binding only `v-model:value` leaves `primary` as
component-local state; the first user edit latches a value into it, `isEmpty`
goes false, and from then on every read prefers the latched copy and every
external write to `value` is discarded. **Seven public controls.**

The fix is four lines of state: remember the value the last `set` wrote.

```ts
if (hasWritten) {
  if (!Object.is(q, written)) return q        // the parent moved `legacy`
  if (!Object.is(p, written)) return p as T   // the parent moved `primary`
}
return isEmpty(p) ? q : (p as T)              // unchanged fresh-mount behaviour
```

Three properties were wanted and all three hold:

1. **No watcher, no flag, no knowledge of what the consumer bound.** The rule —
   *a model that has moved away from what I wrote was moved by somebody else* —
   is symmetric, so it is correct for legacy-only, default-only, both-bound and
   neither-bound consumers without branching on which.
2. **Not a one-way latch the other way.** A second external write is honoured,
   and a *later* user edit still wins; asserted explicitly, because the obvious
   wrong fix (pin to the parent once it writes) passes the first test.
3. **Both refs are read unconditionally in the getter**, so the computed tracks
   both models whichever branch it returns from. Reading only the winner would
   have left the computed un-invalidated when the *other* model moved — the same
   class of bug, one layer up.

`written` is a closure variable rather than a ref on purpose: it only ever
changes inside `set`, which writes both models and therefore invalidates the
computed by itself.

### 2.1 The R5-O6 pin, discharged as designed

`controlledModel.contract.spec.ts` was written to go **red** on this fix, and it
did. Per the R5-O6 handoff §9.3 the expected-failure test was **deleted, not
worked around**, and `it.skip('the contract, once D8 is fixed')` is now the live
assertion. `checkExternalWrite` was **not** weakened — its refusal of a trace
without an `afterUserEdit` reading is untouched, and every new spec is written
as a trace (edit, *then* write) because of it.

`D8_CONTROLS` was **not dropped**; it was renamed `DUAL_MODEL_CONTROLS` and its
meaning inverted. It no longer records who carries the defect — it records who
owes a regression spec, and a new assertion fails if a `useDualModel` consumer's
own `.spec.ts` contains no `D8` test. An eighth control cannot join silently.

## 3. Implemented files + API effect

### 3.1 `useDualModel` — behaviour change, no signature change

`packages/core/src/composables/useDualModel/useDualModel.ts`. A consumer binding
the default `v-model` sees no change; a consumer binding `v-model:value` regains
control of the value. Seven controls, no props or emits touched.

### 3.2 `useFocusTrap` — one new optional argument

`packages/core/src/composables/useFocusTrap/useFocusTrap.ts` gains
`options?: { restoreFocus?: boolean }` (default `true`) and a new exported type
`UseFocusTrapOptions`. `activate()` records `document.activeElement` **before**
it focuses anything; `deactivate()` restores it, and skips when:

- the caller opted out;
- the target has left the document (a trigger inside a `v-if`'d panel);
- focus is **not** inside the trap and not on `<body>` — something outside took
  it deliberately as the trap closed, and pulling it back is worse than not
  restoring.

`DzBlockUI` and `DzPopconfirm` pass `restoreFocus: false`: both already own the
restore and know a better target than "whatever was focused when `activate()`
ran" (`DzBlockUI` captures it *before* moving focus into the overlay; the trap's
target would be the overlay itself). **Their behaviour is byte-for-byte
unchanged.** `DzTour` takes the default and is fixed.

### 3.3 `DzTreeContext` / `DzResizableContext` — one required member each

`disabled: Ref<boolean>` on both (`DzTree.types.ts`, `DzResizable.types.ts`),
provided by `DzTree`, `DzResizable` and `DzSplitter`, consumed by `DzTreeItem`,
`DzResizableHandle` and `DzSplitterHandle` as `own || group`. Required, not
optional — that is what made `typecheck` find the `DzSplitter` twin. Both types
are exported from `@dzup-ui/core`, so this is a type-level breaking change for
anyone constructing one by hand (nothing in either repository does); it is a
`minor` under 0.x and the changeset says so.

### 3.4 `DzMention.loading`

`optionsLoading` is now `props.loading === true || (menuOpen && row === 'loading')`.
The host's answer is **ORed**, not overriding: a host cannot un-say the
resolver's real pending state. → **D101**.

### 3.5 `DzCombobox` clear control

One binding: `:disabled="resolvedDisabled"`. `DzCombobox` has no `readonly`
prop, so the condition is `disabled` alone.

### 3.6 Five overlay content components — the real shape of D11

`:id="id"` handed an **explicit `undefined`** to the Reka component, and a
fallthrough attribute beats the component's own binding — so Reka's generated
content id was **erased**. Measured before the fix: the menu element carried no
`id` at all. After: `id="reka-dropdown-menu-content-v-1"`, and the trigger's
`aria-controls` resolves.

Fixed in `DzDropdownMenuContent`, `DzContextMenuContent`, `DzDialogContent`,
`DzSheetContent`, `DzCommandPalette` by folding the id into the existing attrs
spread — `v-bind="{ ...(id === undefined ? {} : { id }), ...$attrs, class: undefined }"` —
which keeps the original precedence (an explicit `id` still wins) and, unlike a
second `v-bind`, is not a duplicate-attribute compile error. `DzConfirmDialog`
needed no change: it forwards to `DzDialogContent`, which declares `id` as a
prop.

**A second, separate Reka defect was measured and is NOT fixed here.**
`rootContext.contentId` is a plain string on a non-reactive context, assigned in
`DropdownMenuContent`'s setup. A menu that is open from first render
(`defaultOpen`) leaves the trigger's `aria-controls` empty forever, because
nothing re-renders it after the assignment; the click-to-open path re-renders on
`open` and is correct. Out of scope — it is upstream (`reka-ui@2.9.2`) — but the
regression spec uses the click path deliberately, and this is why.

### 3.7 `validate:story-dod` — D6

`propsInterfaceBodies()` extracts every `export interface …Props` body with a
brace-balanced reader (a non-greedy `{[^}]*}` stops at the first inline object
type) and the state scan runs over those only. **`states` moves 57/62 → 53/56**
and reported items 314 → 312; every enforced check stays green and
`validate:story-dod-tiers` is unchanged.

### 3.8 The SSR ARIA-casing gate — D5 + E6

`packages/core/tests/ssr/aria-attribute-casing-ssr.spec.ts`, two arms:

- **the cause** — a scan of all 210 component templates for a camelCase ARIA
  *attribute name*. Values, `{{ }}` interpolations and comments are stripped
  first, so the correct and ubiquitous `:aria-label="ariaLabel"` is not flagged;
  four assertions pin that discrimination in both directions.
- **the symptom** — `lowercasedAriaAttributesIn()` over real server output, with
  a **seeded** component that binds `ariaLabel` and must be caught, plus ten
  components rendered with ARIA props and `DzOrderList` asserted by name.

### 3.9 The three `storybook:test` failures — stories, not components

Checked against the renderer contract before touching either side, as
`<discovery>` 4 requires.

- `DzFormField` / `DzFormParts` asserted `role="alert"`. **The component is
  right**: `DzFormMessage.vue`'s own header and
  `packages/tooling/src/forms/assessments.ts:361` both record that the pair
  `role="alert"` + `aria-live="polite"` was contradictory — `alert` implies
  *assertive* and takes precedence, so a standing field error interrupted
  whatever the user was being told. Renderer contract **C4** says polite. The
  stories now assert the polite live region and that no `alert` exists.
- `Localisation.stories.ts` bound `:options` on a `DzSelect`, which takes
  `items`; `props.items.find(…)` threw while `SelectTrigger` rendered.
  (`DzCascader` genuinely takes `options` — its stories are correct.)

### 3.10 Regenerated artifacts — required, and it moved a fact R1-O1 owns

Exporting `UseFocusTrapOptions` adds a public symbol, so
`ownership-manifest.spec.ts` went red — **a freshness failure, correctly**. The
prescribed chain was run in order: ownership → quality → capability →
component-meta → llms → docs-pages. Manifest **1336 → 1337** entries, and its
`sourceCommit` **`569d887` → `2d51eec`**, which incidentally discharges the
one-commit staleness the README attributes to TASK-R1-O1. **R1-O1 should
re-measure rather than assume its starting condition.** → **D102**.

## 4. Focused validation — exact commands and exit codes

Read directly (`cmd > log 2>&1; echo "exit $?"`), never through a pipe.

| Command | Exit | Result |
|---|---|---|
| `npx vitest run packages/core/src/composition/controlledModel.contract.spec.ts packages/core/src/composables/useDualModel` | **0** | 19 passed |
| `npx vitest run` the 7 dual-model controls | **0** | 159 passed (7 files) |
| `npx vitest run packages/core/src/composables/useFocusTrap` | **0** | 17 passed |
| `npx vitest run` DzTour + DzPopconfirm + DzBlockUI (all 3 trap consumers) | **0** | 77 passed (6 files) |
| `npx vitest run packages/core/src/components/data/DzTree` | **0** | 50 passed (3 files) |
| `npx vitest run packages/core/src/components/layout/DzResizable` | **0** | 18 passed |
| `npx vitest run packages/core/src/components/forms/DzCombobox` | **0** | 32 passed |
| `npx vitest run packages/core/src/components/overlays/DzDropdownMenu` | **0** | 12 passed |
| `npx vitest run packages/tooling/src/validators/story-dod.spec.ts` | **0** | 33 passed |
| `yarn test:ssr` | **0** | **137 passed, 1 skipped (6 files)** |
| `yarn typecheck` | **0** | after the `DzSplitter` twin was fixed — it was found *by* this run |
| `yarn lint` (`--max-warnings 0`) | **0** | — |
| `npx tsx …/validators/story-dod.ts` | **0** | `states` 53/56, 312 reported |
| `npx tsx …/validators/capability-matrix.ts` | **1** | **1** violation, down from 2 — §5.1 |

### 4.1 Seed-and-prove — three live seeds, all confirmed red, all restored

No green was believed before a matching red.

| Seed | Result |
|---|---|
| Revert `useDualModel.ts` to `2d51eec` | **10 failures** — all 3 composable-level D8 specs **and all 7 control-level specs**. The component arm firing is what proves the specs test the controls, not the composable twice. |
| Revert `useFocusTrap.ts` to `2d51eec` | **4 failures** — `deactivate()` restore, unmount restore, and both `DzTour` dismissals. The opt-out and focus-taken-elsewhere specs correctly stayed green. |
| Re-introduce `:ariaLabel` in `DzOrderList.vue` | **2 failures** — the source arm *and* the SSR-output arm, independently. |

All three restored and verified **byte-identical to their pre-seed backups**
(`Buffer.equals`), and each lane re-run green afterwards. The D11 fix was proved
by direct DOM measurement before and after (no `id` on the menu → the generated
id present and `aria-controls` resolving). **Twenty-nine further seeded
assertions ship permanently** inside the new specs, including the two
recorded-defect gates for D4/D10 that fail in *either* direction.

## 5. Aggregate qualification

| Lane | Exit | Reading |
|---|---|---|
| `yarn validate:all` | **1** | Stops at **`validate:capability-matrix`**, the same link as at `99b963a`, now with **1** violation instead of 2 |
| every link **after** capability-matrix, run individually (**24**) | **0** each | visual-baselines · tokens · tokens:refs · tokens:dtcg · tokens:schema · exports · ownership · mcp · component-meta · provider-defaults · llms · docs-pages · playground-parity · package-names · doc-snippets · engines · adr-references · readme-facts · externals · dts · changelog · release-policy · peers · licenses |
| `yarn test` | **1** | **10,062 passed / 3 skipped / 1 todo of 10,069; 537 files. 3 failures, all inherited (§5.2).** |
| `yarn storybook:test` | **1** | **1,451 passed of 1,453; 167 of 169 files.** The three N1-O1 failures are **gone**; two different pre-existing ones are now visible (§5.3). |
| `yarn test:ssr` | **0** | 137 passed |

**This packet introduced no new failure in any lane.**

### 5.1 `validate:capability-matrix` — 2 violations → 1

At `2d51eec` without this packet it reports **two**: the `DzFileUpload` Tier-D
`browser-matrix` gap **and** a freshness violation (`capability-matrix.json` is
stale). Regenerating the chain (§3.10) removes the freshness one. The Tier-D gap
remains and is **TASK-R2-O1's** — it needs a browser sweep, and
`test-results/matrix-report.json` is absent, which is exactly the gap R2-O1
exists to close. **22 stale cells, unchanged.** (The README's "12 stale cells"
is bound to `99b963a`; at `2d51eec` it is 22, measured both with and without
this packet.)

### 5.2 `yarn test` carries **three** inherited failures at `2d51eec`, not two

Measured at `2d51eec` with this packet **stashed**, so the attribution is a
reading and not an inference:

| Failure | Status |
|---|---|
| `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts` | documented inherited (README §2) |
| `packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver` | documented inherited. **The README names the test `countOpen`; the failing assertion is specifically `subtracts a waiver`, and it fails identically with and without this packet** |
| `packages/tooling/src/resolution/dzup-resolution.spec.ts > covers exactly the specifiers the packages declare` | **undocumented** — a snapshot missing `@dzup-ui/tokens/css/high-contrast`, an export added between `99b963a` and `2d51eec` without updating the snapshot. **Not this packet's**, and the "2 inherited failures" figure in README §2 is stale. |

### 5.3 `storybook:test` — the three are fixed; two others were always there

`1,437/1,440` (README, `99b963a`) → **`1,451/1,453`** here. The three failures
N1-O1 recorded are fixed and gone. Two failures now appear that N1-O1 never saw:
`DzCombobox.stories.ts` and `DzMultiSelect.stories.ts`, both
`Async Options: loading → ready → error → retry`, both failing on the same
`[data-options-state]` row lookup inside the shared
`stories/_shared/asyncOptionsHost.ts`.

**They are not this packet's, and the attribution is structural rather than a
re-run**: `DzMultiSelect.vue` is untouched by this diff and imports nothing it
touches (`useAsyncOptions`, `useFormFieldContext`, `useComponentMessages`, `cn`,
`DzOptionsState` — none changed), and `asyncOptionsHost.ts`, `DzOptionsState.vue`
and `useAsyncOptions` are untouched. The single change to `DzCombobox.vue` is
one `:disabled` on the clear control, which the async story never exercises.
These stories arrived with TASK-R3-O3 in `2d51eec`, after the last recorded
`storybook:test` run at `99b963a`, so this is the first sweep that could see
them. **A confirming HEAD-only re-run was attempted and abandoned**: the
filtered browser run stalled in Vite dependency re-optimisation for >10 min with
this packet stashed, and leaving 201 paths stashed behind a hung process was the
larger risk. It was stopped, the stash restored and verified (201 paths at that moment, 0 lost).
**Owner: treat the storybook baseline at `2d51eec` as 2 failures, not 0** →
routed as the first item of §9.

Not run (unchanged by this work, and browser lanes are not locally qualifying):
`test:e2e`, `test:e2e:visual`, `storybook:build`, `test:nuxt-fixtures`, perf lanes.

## 6. Ratchet movements (old → new)

| Ratchet | Old | New | Direction |
|---|---|---|---|
| N1-O1 defects closed | **0 / 11** | **9 / 11** (+ E6) | ↑ |
| N1-O1 defects *recorded and gated* rather than listed | 0 | **2** (D4, D10) | new, both-direction gates |
| Controls honouring an external write after a user edit | **0 / 7** | **7 / 7** | complete |
| `useDualModel` consumers with a regression spec | **0 / 7** | **7 / 7** | gated — an eighth cannot join silently |
| Focus traps that restore focus on release | **2 / 3** (both by hand, in the consumer) | **3 / 3** (by contract, opt-out recorded) | ↑ |
| Overlay content components whose `aria-controls` resolves | **0 / 5** | **5 / 5** | ↑ |
| Group-level `disabled` that is more than presentational | **0 / 3** (`DzTree`, `DzResizable`, `DzSplitter`) | **3 / 3** | ↑ |
| `storybook:test` | 1,437 / 1,440 @ `99b963a` | **1,451 / 1,453** @ `2d51eec` | ↑ (§5.3) |
| `yarn test` | 9,722 @ `99b963a` | **10,069** (537 files) | ↑ |
| `validate:story-dod` `states` | 57 / 62 | **53 / 56** | denominator corrected downward (D6) |
| `validate:story-dod` reported items | 314 | **312** | ↓ |
| `validate:capability-matrix` violations | **2** | **1** | ↓ (freshness closed; Tier-D gap is R2-O1's) |
| `component-ownership.manifest.json` | 1,336 entries, `sourceCommit 569d887` | **1,337**, **`2d51eec`** | fresh (§3.10) |
| Documented inherited `yarn test` failures | "2" (README, `99b963a`) | **3 measured** at `2d51eec` | correction, not a regression |
| SSR gates over the ARIA-casing defect class | **0** | **2 arms, 8 tests, seeded** | new |

**No ceiling was raised and no gate was weakened.** `checkExternalWrite` kept
its refusal of a snapshot-only trace; the D6 change *narrows* what
`validate:story-dod` claims applicability over rather than waiving anything.

## 7. Owner decisions raised (numbered from D98 — D1–D97 taken)

**D98 🟠 — D4: interactive content nested inside a `role="combobox"` button.**
`DzCascader`'s clear control and `DzTreeSelect`'s multi-select chip removers are
`role="button"` spans rendered **inside** the `<button role="combobox">` trigger
— axe's `nested-interactive` and the HTML "no interactive content in a button"
content model. Invisible today only because `forms` has not opted into
`a11yError`, so its axe sweep is report-only.
- (a) **Move the control out of the button**, positioned over the field — the
  correct fix. It moves the published `data-part="clear"` out of
  `[data-part="trigger"]`, changes the rendered layout, and breaks any consumer
  selecting `[data-part="trigger"] [data-part="clear"]`. `minor` under 0.x.
- (b) Strip `role="button"`/`tabindex` and keep the click handler — satisfies
  the linter and **removes the affordance from AT users entirely**. Strictly
  worse than the defect.
- (c) **Leave it recorded and gated — taken here**, because `<no_api_change>`
  routes a public change through VERSIONING.md rather than letting an agent take
  it. The count is pinned in both components' contract specs and fails if it
  moves either way.
- **rec. (a)**, sequenced into the next `minor`. The changeset draft already
  names the defect as recorded, so only the note needs extending.

**D99 🟠 — D10: `DzTreeSelect` declares one focus mechanism and operates
another.** The trigger is a `role="combobox"` that publishes the active node via
`aria-activedescendant` (its own source comment at `DzTreeSelect.vue:504` says
"without moving DOM focus off the trigger"), and the popover then moves DOM
focus onto the tree's roving `tabindex="0"` row. Advertising an
`aria-activedescendant` you do not own is forbidden by APG. Both APG variants
are individually legal; shipping both is not.
- (a) **Keep focus on the trigger** — prevent the popover's `open-auto-focus` so
  the declaration becomes true. But with `filter` enabled the panel's searchbox
  then needs an extra Tab, which changes the typing flow for every filtering
  consumer.
- (b) **Move focus into the popup and drop `aria-activedescendant`** — this is
  what the component *already does*, so nothing observable changes for users;
  the cost is rewriting 6 spec assertions, the `Keyboard` story's play function
  and the component's own doc comments, all of which currently describe (a).
- (c) Leave it recorded — taken here.
- **rec. (b).** The declaration is the lie, not the behaviour, and (a) degrades
  a shipped interaction to make a comment true.

**D100 🟢 — `useFocusTrap` now restores focus by default.** A behaviour change
to a published composable, taken because a trap that strands focus on `<body>`
is the defect.
- (a) **`restoreFocus: true` by default, opt-out at the two call sites that own
  their restore — taken.**
- (b) Default `false`, opt-in — safer for an unknown consumer, but it leaves D7
  unfixed for everyone who does not know the option exists.
- (c) Always restore, no option — would regress `DzBlockUI`, which captures a
  better target before it moves focus.
- **rec. (a).** Confirm; it is in the changeset as a `minor`.

**D101 🟢 — `DzMention.loading` semantics.** The host's `loading` is **ORed**
with the resolver's own pending state.
- (a) **OR — taken**: a host cannot un-say a request that is genuinely in
  flight. · (b) The prop overrides, so a host can force the indicator off.
- **rec. (a).**

**D102 🟠 — the regenerated artifact chain overlaps TASK-R1-O1.** Exporting one
type made `validate:ownership` red, so the chain had to be regenerated
(§3.10), which moved `component-ownership.manifest.json` from `569d887` to
`2d51eec` and rewrote 144 docs pages, 6 evidence pages, the capability and
quality matrices, `component-meta.json`, the nav and the playground seeds — 160
of this packet's 203 paths.
- (a) **Keep the regeneration in this packet's diff — taken.** The rule is that
  generated artifacts are the truth; leaving them stale to keep a diff small is
  the failure mode `<generated_authority>` exists to prevent.
- (b) Revert the artifacts and let R1-O1 own them — leaves `validate:ownership`
  red on a tree that would otherwise pass it.
- **rec. (a)**, with R1-O1 **re-measuring its starting condition** rather than
  taking README §2's figures: manifest freshness and the capability-matrix
  freshness violation are already closed here, and the inherited-failure count
  is 3, not 2 (§5.2).

**D103 🟢 — 11 docs pages now cite the ARIA-casing spec as their SSR evidence.**
`capability-matrix.json` records *both* SSR specs for those components; the docs
renderer prints only the first, and the new filename sorts ahead of
`ssr-smoke.spec.ts`. The citation is truthful but less representative.
- (a) Accept — taken. · (b) **Have the renderer list every artifact in the
  cell** — the JSON already carries them. · (c) Rename the file to sort last,
  which encodes a display rule in a filename.
- **rec. (b)**, with whoever next owns `contract-sections.ts`.

## 8. Scope not taken, and why

- **No manual AT result cell was written** (`<no_fill>`, program §8).
- **No commit, push, CI dispatch, publication or baseline replacement.**
- **The Pro repository was not touched or read for writing.**
- **`DzFileUpload`'s Tier-D browser gap was not closed** — it needs a browser
  sweep and a tracked `matrix-report.json`, which is TASK-R2-O1's deliverable,
  not a defect in the register.
- **The upstream Reka `contentId` reactivity defect (§3.6) was not patched**
  — it is in `reka-ui@2.9.2`, and working around it in five components would
  hide it.

## 9. Ranked next packet

1. **🔴 TASK-R2-O1** — it now owns two of this packet's loose ends: the
   `DzFileUpload` Tier-D `browser-matrix` gap (the last `validate:all`
   violation) and the **two async-options `storybook:test` failures** whose
   pre-existence §5.3 establishes structurally rather than by re-run. Both need
   a browser lane.
2. **🔴 TASK-R1-O1** — re-measure first (D102). Three inherited `yarn test`
   failures, not two; the `dzup-resolution` snapshot is a one-line fix; manifest
   and capability-matrix freshness are already closed here.
3. **🟠 D98 — move D4's controls out of the combobox button** in the next
   `minor`. The gate is in place and the count is 1 per component.
4. **🟠 D99 — pick `DzTreeSelect`'s focus mechanism.** Recommended (b) is a
   documentation-and-assertion change, not a behaviour change.
5. **🟢 D103 — let a capability cell publish all its artifacts**, with the docs
   renderer's next owner.
6. **🟢 Upstream**: report the Reka `DropdownMenuRoot.contentId` reactivity
   defect (§3.6) — `defaultOpen` menus ship an empty `aria-controls` in every
   consumer of `reka-ui@2.9.2`, not only here.
