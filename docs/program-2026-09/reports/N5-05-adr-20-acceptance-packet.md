# TASK-N5-05 — ADR-20 acceptance packet (provider contract)

- **Prepared by:** TASK-N5-05, 2026-09-03, on `main` @ `6f1f653` (dirty worktree,
  ~85 entries, none of them this packet's).
- **Subject:** `docs/adr/ADR-20-provider-contract.md`
- **Status of the subject at the time of writing:** **Proposed**
  (TASK-OSS-P4-01, 2026-08-21; amended by P4-02 and P4-03).
  **This packet does not change it.**
- **Decision requested:** Accept, Accept-with-amendments, or Reject. The
  unsigned line is §8.

> **The headline.** ADR-20 is in materially better shape than ADR-19. Its
> **structure** is implemented essentially as specified — nine keys, ten
> composables, the defaults object byte-for-byte, the merge rules, the
> precedence, the formatter cache, the SSR contract — and **88 tests across six
> named spec files pass** (§6). Its divergences are almost all of one kind, and
> it is not the kind ADR-19 has: **the contract is built and correct and largely
> unconsumed.** Four of the nine concerns are read by **one component or none**.

---

## 0. Custody

`main` @ `6f1f653`, 0 ahead / 0 behind `origin/main`. ~85 uncommitted entries
from TASK-N5-01, N5-02 and N5-03; **N5-03 ran concurrently in this worktree.**
Nothing reverted, stashed, cleaned or committed; no N5-03-owned file touched.
`yarn validate:all` **not run** (N5-03 owns the aggregate ladder this round).
No ADR status flipped; no ADR file edited — see the ADR-19 packet §9 for the
reasoning, which applies identically here.

---

## 1. Measured-vs-claimed

| # | Claimed | Measured on `6f1f653` | Verdict |
|---|---|---|---|
| 1 | "ten context composables" | **10.** `useDzLocale`, `useDzDirection` (`useDzLocale.ts`), `useDzMessages` (`useDzMessages.ts`), `useDzFormats` (`useDzFormats.ts`), `useDzDefaults`, `useDzMotion`, `useDzNonce`, `useDzPortalTarget`, `useDzTestIds` (`useDzEnvironment.ts`) — nine — plus `useDzTheme`, re-exported at `packages/core/src/composables/provider/index.ts:34` as `useTheme`. | **Correct.** The one brief figure in this program that survived re-measurement. |
| 2 | ADR §1 "nine injection keys" | **9**, at `packages/contracts/src/provider.types.ts:215-223`, all `InjectionKey<…>`, exactly the nine names §1 lists. | **Correct.** |
| 3 | ADR §1 "plus theme's existing `DZ_THEME_KEY`" | Present — but at **`packages/core/src/providers/DzThemeProvider.types.ts:72`**, i.e. **in Core, not in contracts.** | **Correct as stated; see D20-5** — the rationale §1 gives for putting keys in contracts does not hold for theme. |
| 4 | ADR §2 `DZ_PROVIDER_DEFAULTS` | `provider.types.ts:236-243` — `locale: 'en-US'`, `direction: 'auto'`, `motion: 'system'`, `portalTarget: undefined`, `nonce: undefined`, `testIds: { enabled: false, attribute: 'data-testid' }`. **Byte-for-byte the ADR's block.** | **Correct.** |
| 5 | ADR §"15 components extend `BasePortalProps`" | **15** `.types.ts` files extend `BasePortalProps`. | **Correct.** |
| 6 | ADR Rollout §4 "P4-04 migrates the 15 portal props" (listed as **open**) | **18 `.vue` files call `useDzPortalTarget()`.** | **Done, and past 15** — see D20-6. |
| 7 | ADR §"5 `Intl` construction sites across 4 files" | **0 outside the cache.** All 4 surviving `new Intl.` constructions are inside `packages/core/src/i18n/intl-cache.ts` (`:74`, `:81`, `:92`, `:100`). `DzAnimatedNumber.tween.ts` no longer constructs one per frame. | **Fully delivered** — the ADR still describes it as a migration that *"can be"* done. |
| 8 | ADR A5 "Core's ~38 components" contributed to `DzMessageCatalog` | **40** top-level component entries in `packages/core/src/i18n/messages.ts`, augmenting `DzMessageCatalog` at `:46` via `declare module '@dzup-ui/contracts'`. | **Stale by 2**; mechanism correct. |

### Adoption — the measurement that decides this packet

Consumers **in the component catalogue** (`.vue` under `packages/core/src`),
excluding the composables' own definitions, the barrel and specs:

| Concern | Composable | `.vue` consumers | Which |
|---|---|---|---|
| Portal target | `useDzPortalTarget` | **18** | `DzBlockUI`, `DzCascader`, `DzColorPicker`, `DzCombobox`, `DzMultiSelect`, `DzSelect`, `DzTimePicker`, `DzLightbox`, `DzSidebar`, `DzCommandPalette`, `DzContextMenuContent`, `DzDialogContent`, `DzDropdownMenuContent`, `DzPopconfirm`, `DzPopoverContent`, `DzSheetContent`, `DzTooltipContent`, `DzTour` |
| Messages | `useComponentMessages` | **40** catalog entries | `packages/core/src/i18n/messages.ts` |
| Formats | `useDzFormats` / `intl-cache` | all `Intl` use | 4 constructions, all in `intl-cache.ts` |
| Defaults | `useDzDefaults` | **2** | `DzButton.vue`, `DzProvider.vue` |
| Direction | `useDzDirection` | **1** | `DzProvider.vue` **(the provider itself)** |
| Test ids | `useDzTestIds` | **1** | `DzProvider.vue` **(the provider itself)** |
| **Motion** | **`useDzMotion`** | **0** | **nothing outside `provider.spec.ts`, `DzProvider.spec.ts`, `DzProvider.contract.spec.ts`** |

**Read the last three rows together.** `useDzDirection` and `useDzTestIds` are
consumed only by `DzProvider.vue` — which is the component that *writes* them.
So of the nine non-theme concerns, **three (direction, test ids, motion) have
zero consumers in the 144-component catalogue**, and a fourth (defaults) has one.

---

## 2. What ADR-20 decided

| § | Decision |
|---|---|
| **1** | One symbol per concern, **declared in `@dzup-ui/contracts`** — nine keys plus theme's existing one. Separate keys, not one context object, so a provider can override locale without restating portal target and a direction consumer does not re-render on a catalog change. |
| **2** | **Every concern has a typed default, and only theme requires a provider.** "The load-bearing decision." Nine of ten composables resolve to a default and never throw; `useDzTheme` stays the ADR-09 exception. |
| **3** | Nested providers override **per key — except messages, which deep-merge**, so a host changing one string does not restate 71. |
| **4** | **Direction resolves from the locale** unless the host overrides; `useDzDirection()` returns `'ltr' \| 'rtl'`, **never `'auto'`**. A checked-in RTL subtag list, because `Intl.Locale.getTextInfo()` is above the ADR-18 Node floor. |
| **5** | **Formatters cached application-wide**, keyed by locale + normalised options, module-level. `useDzFormats()` returns plain functions, not refs. |
| **6** | **Precedence: prop → compound context → provider → component default.** Fixed in one place so no component invents its own. |
| **7** | **Motion follows the OS** unless the app already asked the user. `'system'` \| `'reduced'` \| `'full'`. **Under SSR the honest answer is `reduced: false`.** |
| **8** | **Test ids off until a host names the attribute**; `testId()` returns `undefined`, which `v-bind` drops. |
| **9** | **Pro extends by declaration merging, never a second provider.** A parallel Pro provider is forbidden. |

Plus **five amendments** (A1–A5) from P4-02/P4-03, a *What did not change*
section, a downstream-document correction, and a nine-row **Validation hooks**
table.

---

## 3. What shipped against it — file evidence

### 3.1 Delivered and matching

| ADR clause | Evidence |
|---|---|
| §1 nine keys in contracts | `packages/contracts/src/provider.types.ts:215-223` |
| §1 contracts stays runtime-dep-free | package rule holds; keys are `Symbol()` calls, side-effect-free |
| §2 defaults object | `provider.types.ts:236-243`, identical to the ADR block |
| §2 nine of ten never throw | `packages/core/src/composables/provider/provider.spec.ts` — **31 tests, pass** |
| §3 per-key override + message deep-merge | `provider.spec.ts`, `DzProvider.spec.ts` — pass |
| §4 direction resolution | `packages/core/src/composables/provider/useDzLocale.ts` |
| §5 formatter cache | `packages/core/src/i18n/intl-cache.ts` — **the only place `new Intl.` appears in `packages/core/src`** |
| §6 precedence | `useDzDefaults().resolve()`; verified in template at `DzSelect.vue:84` — `props.portalTo ?? dzPortalTarget.value`, **prop wins**, matching §6 step 1 |
| §7 SSR `reduced: false` | `packages/core/tests/ssr/provider-ssr.spec.ts` — 4 tests, pass |
| §8 test ids off by default | `provider.types.ts:236-243`; `DzTestIds.prefix` optional per A4 |
| §9 / A5 declaration merging | `provider.types.ts:80` `export interface DzMessageCatalog {}` (empty, in contracts, on purpose); Core augments at `packages/core/src/i18n/messages.ts:46` with **40** components |
| A1 provider provides only keys its props set | `DzProvider.spec.ts` — "the negative case (an unset prop provides nothing)" |
| A2 root-only `<html>` reflection | `dz-provider-ssr.spec.ts:275` *"writes the same dir the server rendered"*, `:287` *"says nothing about direction when the host declared no locale"* |
| A4 two accepted shapes | `DzProvider.spec.ts` — "both accepted shapes" |
| **P4-04 portal migration** | **18 components** consume `useDzPortalTarget()` (§1 table) — Rollout §4 is **done** |

### 3.2 The SSR / hydration evidence — ADR-20's strongest suit

`packages/core/tests/ssr/dz-provider-ssr.spec.ts` (10 tests) asserts, by name:

- `resolves every concern with no window, no document, no matchMedia` (`:160`)
  — the globals are **deleted**, not merely absent, exactly as the hook table says
- `touches no DOM when it is the root provider` (`:177`)
- `renders DzThemeProvider through its DzProvider delegate` (`:185`)
- **`hydrates a configured provider with zero mismatch warnings`** (`:198`)
- **`hydrates a nested provider with zero mismatch warnings`** (`:202`)
- **`hydrates DzThemeProvider with zero mismatch warnings`** (`:224`)
- `resolves a portal target without touching the DOM` (`:238`)
- `server-renders a component whose portal target came from the provider` (`:260`)
- `writes the same dir the server rendered` (`:275`)
- `says nothing about direction when the host declared no locale` (`:287`)

The mismatch assertions filter console output on `/hydration|mismatch/i` (`:123`)
— they check for **absence of warnings**, which is the correct shape.

**All three trees the ADR's hook table names — configured, nested, themed — are
present and pass.** This is the cleanest ADR-to-evidence mapping in either
packet: the hook table row was written as a specification and the spec file
satisfies it row for row.

---

## 4. Divergence table

Nine. 🔴 blocking · 🟠 resolve at acceptance · 🟢 record.

| # | Divergence | ADR text vs code behaviour | Amend / fix | Recommendation |
|---|---|---|---|---|
| **D20-1** 🔴 | **The motion policy has no consumers at all.** | ADR §7 decides the full policy — `'system'` consults `prefers-reduced-motion`, `'reduced'` never animates, `'full'` animates regardless as *"an explicit override of a stated accessibility preference, admitted only because a host that has already asked the user is better placed to decide than this library is"*, plus the SSR rule. Measured: **`useDzMotion` is referenced by zero `.vue` files.** Its only non-definition references are `provider.spec.ts`, `DzProvider.spec.ts`, `DzProvider.contract.spec.ts`. The ADR's own Context table says *"No policy. Components animate or do not, per component."* — **that is still exactly true of the catalogue.** | **amend-ADR**, then fix-code | **Amend §7 and Consequences to state the policy is specified and unadopted**, then file adoption as its own packet. This is the most consequential divergence in ADR-20 and it is an **accessibility** one: §7 admits `'full'` as an override of a stated accessibility preference, which is a real cost, and the library currently pays that cost while banking none of the benefit — a host setting `motion="reduced"` today changes nothing anywhere. Accepting §7 as written would record that the library honours a reduced-motion preference through the provider. **It does not.** |
| **D20-2** 🟠 | **Direction is resolved centrally and read by nothing.** | ADR §4's rationale: *"Resolving it centrally means **no component has to know** the script direction of every language the application ships."* Measured: `useDzDirection` is consumed by exactly one `.vue` — `DzProvider.vue`, the writer. Rollout §5 (*"P4-05 uses `useDzDirection` for the RTL matrices"*) is still open, and N2-S1 **S1-F4** found `validate:rtl` reading the wrong file with a regex naming Tailwind-3 utilities that do not exist in Tailwind 4 (14 measured sites, `DzDialog`'s pinned close control a real defect in an ADR-19 pilot). | **amend-ADR**, then fix-code | **Amend Rollout §5 to record P4-05 as open and blocked on S1-D3**, and say plainly in Consequences that direction resolution ships as a **host-facing** API (`<html dir>` reflection works, per `dz-provider-ssr.spec.ts:275`) and not yet as a component-facing one. The reflection half is real and tested; the "no component has to know" half has no component exercising it. |
| **D20-3** 🟠 | **`testId()` is called by no component.** | ADR §8 decides the mechanism and its rationale (*"An attribute nobody asked for is payload on every rendered node"*). Measured: `useDzTestIds` is consumed by one `.vue` — `DzProvider.vue`. So a host that enables test ids and names the attribute gets **the attribute on nothing**. | **amend-ADR**, then fix-code | **Amend §8's Consequences** to state the mechanism ships with no emitters. The decision itself is sound and cheap to keep — off-by-default means zero cost today — but "test ids are available" is not a claim acceptance should let the ADR make. |
| **D20-4** 🟠 | **The precedence chain is used by one component.** | ADR §6: *"Fixed here, in one place, **so no component invents its own order**."* Measured: `useDzDefaults` is consumed by `DzButton.vue` and `DzProvider.vue` — **1 of 144 public components** resolves through the shared resolver. The other 143 still take a prop or a hard default, i.e. they still each carry their own order. | **amend-ADR**, then fix-code | **Amend §6's Consequences with the adoption count.** The precedence *rule* is right and `DzButton` proves it works end to end; the claim that no component invents its own order is aspirational. Note the contrast with portals: **the same rollout shape reached 18 components for `portalTo` and 1 for defaults** — worth the owner asking why, since defaults is the concern with the widest surface. |
| **D20-5** 🟠 | **§1's dependency-direction argument does not hold for theme.** | ADR §1: keys live in contracts because *"that lets `@dzup-ui-pro/*` read an application's locale **without importing Core's runtime** — the dependency direction the whole package graph is built on."* Measured: nine keys are in `packages/contracts/src/provider.types.ts`. **`DZ_THEME_KEY` is at `packages/core/src/providers/DzThemeProvider.types.ts:72`** — in Core. So Pro can read locale, messages, formats, direction, portal target, motion, defaults, nonce and test ids without importing Core's runtime, **and cannot read theme that way at all.** §1 names theme in the same breath as the nine and never flags the asymmetry. | **amend-ADR** (fix-code is an ADR-09 change) | **Amend §1 to state the exception explicitly.** Moving `DZ_THEME_KEY` to contracts would make the graph uniform, but it changes a shipped ADR-09 contract and is an owner decision — the *same* owner decision already open as Rollout §6. **Fold the two together**: whether `useDzTheme` should stop throwing, and whether `DZ_THEME_KEY` should move, are one question about whether theme stops being special. |
| **D20-6** 🟢 | **Rollout §4 is done and still listed open.** | ADR Rollout: *"4. **P4-04** migrates the 15 portal props to the provider default."* — no strikethrough, unlike §2 and §3 which are marked **Done**. Measured: **18** `.vue` consume `useDzPortalTarget()`, exceeding the 15 `BasePortalProps` components; resolution is `props.portalTo ?? dzPortalTarget.value` (verified `DzSelect.vue:84`), matching §6 step 1; the props were **retained**, matching the Consequences line *"The props stay — P4-04 decides their deprecation"*. | **amend-ADR** | **Strike Rollout §4 as Done**, in the same form §2 and §3 use, recording 18/15 and that the props were kept rather than deprecated. Then note the deprecation decision §4 was supposed to take is **still untaken** — it is now the only open half. |
| **D20-7** 🟢 | **§5's migration is complete; the ADR describes it as pending.** | Consequences: *"The formatter cache is shared, so the five independent `Intl` construction sites **can be** migrated one at a time to the same cache."* Measured: **zero `new Intl.` outside `packages/core/src/i18n/intl-cache.ts`** (4 constructions, all inside it). The `DzAnimatedNumber.tween.ts:150` per-frame construction the Context table calls out is gone. | **amend-ADR** | **Restate in the past tense with the measurement.** This is a clean win the ADR is under-claiming, and A5's note that the locale default *"now has teeth"* (server/client hydration divergence for `DzAnimatedNumber`, `DzTimePicker`, `useRelativeTime`) is the reason it mattered. |
| **D20-8** 🟢 | **A5's Core-component count is stale.** | A5: *"Core's ~38 components are contributed by exactly the augmentation above."* Measured: **40** top-level entries in `packages/core/src/i18n/messages.ts`. | **amend-ADR** | Update to 40, or better, drop the literal and cite the file — this is the hand-typed-facts class N2-S1 §11.3 records five prior sightings of. |
| **D20-9** 🟢 | **Rollout §6's open question is still open, narrowed but not closed.** | Rollout §6: whether `useDzTheme` should gain a default and stop throwing *"so all ten concerns behave alike"*. A3 narrowed it (*"'no provider' is now a rarer state"*) and explicitly declined to close it. Measured: unchanged — `useDzTheme` is `useTheme` re-exported at `provider/index.ts:34`, and `useTheme` throws without a provider unless called `{ optional: true }`. | carry forward | **Take it at acceptance, together with D20-5.** Both are "should theme stop being special", and answering one without the other leaves the graph half-uniform. |

**Split: 8 amend-ADR · 1 fix-code-only · 0 blocking-on-a-contradiction.**
(D20-1 through D20-4 are amend-then-fix and are counted at their first action;
D20-5's fix-code half is an ADR-09 change and is routed to D20-9.)

**The shape of this table, stated plainly:** ADR-20 has **no clause whose code
contradicts it**. Every divergence is either *the ADR under-claiming what shipped*
(D20-6, D20-7, D20-8) or *the ADR over-claiming adoption of something correctly
built* (D20-1 to D20-4). That is a materially safer acceptance than ADR-19's,
where two decisions were never performed.

---

## 5. Open questions folded in from this program

### 5.1 Portal chain evidence — asked for by name

**Resolution chain, verified in source:** `props.portalTo ?? dzPortalTarget.value`
(`DzSelect.vue:84`, and the same shape at the other 17 sites). That is §6's
precedence applied correctly — an explicit prop wins, then the provider, then the
portal's own `document.body` default (`DZ_PROVIDER_DEFAULTS.portalTarget` is
`undefined`, with the comment at `provider.types.ts:240-241` recording that
`undefined` means `document.body`, *"resolved by the portal at render time"*).

**SSR behaviour is separately proven**, and this is the part that would otherwise
be a hydration hazard: `dz-provider-ssr.spec.ts:238` *"resolves a portal target
without touching the DOM"* and `:260` *"server-renders a component whose portal
target came from the provider"*.

**Coverage:** 18 consumers against 15 `BasePortalProps` components — the extra
three are components that portal without extending that base
(`DzContextMenuContent`, `DzDropdownMenuContent`, `DzSheetContent` and peers are
compound content parts). **The migration over-delivered**, which is the opposite
of this program's usual finding and is worth recording as such.

**What is still open:** §4's second half — *"The props stay — P4-04 decides their
deprecation"*. P4-04 shipped the default source and **did not take the
deprecation decision**. 15 `portalTo` props remain public with no recorded
intent. → **`[!owner]` D-M.**

### 5.2 SSR / hydration spec results — asked for by name

**Run, this packet, exit 0.** Six files, 88 tests, all passing (§6). The two SSR
files are `provider-ssr.spec.ts` (4) and `dz-provider-ssr.spec.ts` (10).

The evidence is unusually strong for three reasons worth naming:

1. **Globals are deleted, not stubbed.** `resolves every concern with no window,
   no document, no matchMedia` — the hook table's phrase *"not merely absent from
   a render"* is honoured by the spec.
2. **Hydration is tested for all three tree shapes** the ADR names — configured,
   nested, themed — and by **absence of mismatch warnings**, filtered on
   `/hydration|mismatch/i`, which is the assertion that actually catches the class
   of bug §7's `reduced: false` rule exists to prevent.
3. **The A2 root-only reflection rule is pinned in both directions** — `writes the
   same dir the server rendered` and `says nothing about direction when the host
   declared no locale`.

**The one caveat, and it is this packet's own limit:** these are
**locally qualified** results on a dirty worktree carrying three other packets'
uncommitted work. They are not CI evidence and not release evidence. Per repo
convention that distinction is not collapsible.

### 5.3 Contracts base-prop shape — N5-02 **D1**, noted where it bears

N5-02 **F2**: `ariaInvalid` sits in `BaseAccessibilityProps` (labelling) rather
than `BaseValidationProps` (validity), so every component wanting an accessible
name inherits a validity claim it usually cannot keep. Nine `Omit<Base, 'k'>`
narrowings now stand in at the points of use. Not fixed — the move is a `minor`
on `@dzup-ui/contracts` removing the prop from every `BaseInteractiveProps`
component.

**Bearing on ADR-20: adjacent, on the same package, and it sharpens D20-5.**
ADR-20 §1 makes `@dzup-ui/contracts` the home of cross-tier identity and argues
from *what belongs in a types package*. N5-02 D1 is the same question about base
prop interfaces, currently answered wrongly for one prop; D20-5 is the same
question about injection keys, currently answered inconsistently for one key.
**Three open questions about what contracts should hold — N5-02 D1, D20-5 and
D20-9 — are cheapest taken in one sitting**, because each is a `minor` on the
package every other package depends on, and batching them costs one blast radius
instead of three. → **`[!owner]` D-N.**

---

## 6. What was run

Narrow, exit codes observed directly. **The first attempt at the spec run was
piped through `tail`, which swallows the exit code; it was re-run unpiped and
only the unpiped run is reported here.**

| Command | Exit | Result |
|---|---|---|
| `npx vitest run packages/core/tests/ssr/provider-ssr.spec.ts packages/core/tests/ssr/dz-provider-ssr.spec.ts packages/core/src/composables/provider/provider.spec.ts packages/core/src/providers/DzProvider.spec.ts packages/core/src/providers/DzProvider.contract.spec.ts packages/core/src/providers/DzThemeProvider.contract.spec.ts` | **0** | **6 files passed, 88 tests passed**, 14.35s — `provider-ssr` 4 · `provider.spec` 31 · `dz-provider-ssr` 10 · `DzProvider.contract` 6 · `DzThemeProvider.contract` 9 · `DzProvider.spec` 28 |
| `npx tsx packages/tooling/scripts/validate-adr-references.ts` | **0** | `✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)` |

**`vitest` was invoked directly rather than through `yarn test`** — deliberately.
`yarn test` runs `test:prepare`, which runs `tokens:generate`, which rewrites
`DESIGN.md` and regenerates token artifacts. Running it would have corrupted
N5-03's concurrent aggregate reading. Direct invocation skips `test:prepare` and
writes nothing.

**Not run:** `yarn validate:all` (N5-03 owns it this round);
`yarn validate:hardcoded-strings` — deliberately skipped even though it is
read-only, because `packages/tooling/src/validators/hardcoded-strings.ts` is
**modified in this worktree by another packet**, so any number it printed would
be a measurement of N5-03's in-flight edit, not of `main`. No claim is made
about the 79-literal count beyond the file evidence in §3.1.

Of ADR-20's nine **Validation hooks** rows, **six were executed** (the six spec
files). The remaining three (`validate:contract-parity`, `validate:hardcoded-strings`,
`validate:exports`/`validate:ownership`), the Storybook pseudo-locale toolbar and
`i18n.spec.ts` were **not run** and no claim is made about them.

---

## 7. The ratchet

Identical to the ADR-19 packet §7, and the conclusion is the same:
**accepting ADR-20 moves `maxUndocumented` by exactly 0.**

`validate-adr-references.ts` prints `17 cited · 3 documented · 14 registry-only`.
The three documented are **18, 19 and 20** — ADR-20 has been out of the debt
ledger since its file was written on 2026-08-21. The validator contains **no
reading of `Proposed`, `Accepted` or `Rejected`**; no gate in the repository
measures ADR status.

**The ADR-20-specific version of the finding:** ADR-20 declares itself as
*"Extends: ADR-09 (theme context), ADR-08 (compound context by provide/inject)"*.
**Both ADR-08 and ADR-09 are in the debt ledger.** ADR-09's entry records it as
*"recordedIn: packages/core/src/providers/*, packages/core/src/composables/useTheme.ts"*
— i.e. the decision exists only as code.

That matters more here than it does for ADR-19, because **ADR-20's single largest
open question (D20-9 / Rollout §6, whether `useDzTheme` should stop throwing) is
a proposal to change ADR-09 — an ADR that has no document to change.** The owner
is being asked to amend a decision that exists only as a row in `CLAUDE.md` and a
throw statement in `useTheme.ts`. **Writing ADR-09 is arguably a prerequisite to
answering D20-9 properly**, and doing so would take the ceiling 14 → 13.

→ **`[!owner]` D-P.**

---

## 8. The decision line

> **`[!owner]`  ADR-20 — Provider contract: locale, direction, messages, formats, portals, motion, defaults, nonce, test ids**
>
> ☐ **Accepted**  ☐ **Accepted with amendments** (list) ☐ **Rejected**
>
> Signed: ______________________  Date: ____________
>
> *Unsigned. TASK-N5-05 does not set an ADR status, and did not edit
> `docs/adr/ADR-20-provider-contract.md`.*

### The decisions that line depends on

| # | `[!owner]` decision | Blocking? | This packet's reading |
|---|---|---|---|
| **D-H** | **Motion: adopt · amend-and-defer · drop §7** (D20-1) | **Yes** | **Amend and defer, then adopt as its own packet.** Accepting §7 unamended would record that the library honours reduced-motion through the provider, which is false in all 144 components. It is the one divergence here with an accessibility consequence, and §7 admits an override of a stated accessibility preference to buy a benefit nothing yet collects. |
| **D-I** | **Record the adoption counts for direction, test ids and defaults in Consequences** (D20-2/3/4) | **Yes** | **Amend.** These are cheap, factual sentences. Without them ADR-20's Consequences read as a description of a system in use; the measurement says three of nine concerns are unread by any component and a fourth is read by one. |
| **D-J** | **Strike Rollout §4 (P4-04) as Done** and record 18/15 (D20-6) | No | **Strike it.** §2 and §3 already use the strikethrough form; §4 is the same shape and has been finished longer than the document admits. |
| **D-K** | **Restate §5's formatter migration as complete** (D20-7) | No | **Restate.** Zero `new Intl.` outside `intl-cache.ts`; the per-frame construction is gone. A clean win the ADR under-claims. |
| **D-L** | **Should `DZ_THEME_KEY` move to contracts, and should `useDzTheme` stop throwing?** (D20-5 + D20-9, Rollout §6) | No, but do not split them | **Take both or neither.** They are one question — whether theme stops being special. Answering only the second leaves Pro unable to read theme without importing Core's runtime, which is the exact inversion §1 exists to prevent. **See D-P: this is hard to answer well while ADR-09 has no document.** |
| **D-M** | **Deprecate the 15 `portalTo` props, or keep them permanently?** (§5.1) | No | **Keep them, and say so.** They are the §6 step-1 escape hatch and the ADR already argues an explicit prop should win. But P4-04 was chartered to decide and did not; leaving it undecided is how a "temporary" surface becomes permanent by default. |
| **D-N** | **Batch the three contracts-shape questions** — N5-02 D1 (`ariaInvalid`), D20-5 (`DZ_THEME_KEY`), D20-9 (`useDzTheme`) (§5.3) | No | **Batch them.** Each is a `minor` on the package every other package depends on. One blast radius instead of three. |
| **D-P** | **Write ADR-09 before answering D-L**, taking the ceiling 14 → 13 (§7) | No | **Recommended.** D20-9 proposes amending ADR-09, which has no document. This is the ADR-20 analogue of the ADR-19 packet's D-E (copy ADR-17 in) and the two together would take the ceiling 14 → 12 — the only ceiling movement available anywhere in TASK-N5-05's scope. |

---

## 9. The consequence-section text acceptance would require

Paste-ready, **conditional on §8**. Not written into the ADR — see the ADR-19
packet §9 for the reasoning.

### 9.1 Replacing the current *Consequences* section

```markdown
## Consequences

- Ten composables ship with typed defaults; nine resolve without a provider and
  never throw, and `useDzTheme` keeps its ADR-09 behaviour. Verified by
  `packages/core/src/composables/provider/provider.spec.ts` (31 tests).
- **Adoption is uneven, and the contract should not be described as in use
  across the catalogue.** Measured 2026-09-03 over `packages/core/src/**/*.vue`:
  - **portal target — 18 components.** P4-04 is complete and exceeded its
    15-component target; resolution is `props.portalTo ?? provider`, matching §6.
  - **messages — 40 components** contribute to `DzMessageCatalog` from
    `packages/core/src/i18n/messages.ts`.
  - **formats — every `Intl` use.** All four surviving `new Intl.` constructions
    are inside `packages/core/src/i18n/intl-cache.ts`; the five scattered sites
    and the per-frame construction in `DzAnimatedNumber.tween.ts` are gone.
  - **defaults — 1 component** (`DzButton`). §6 fixes the precedence so no
    component invents its own order; 143 still do.
  - **direction — 0 components.** `useDzDirection` is read only by `DzProvider`
    itself. The `<html dir>` reflection half works and is tested; the
    component-facing half has no consumer. P4-05 is open and blocked on the
    `validate:rtl` defects recorded as N2-S1 S1-D3.
  - **test ids — 0 components.** `testId()` is called nowhere, so a host that
    enables test ids and names the attribute gets it on no node.
  - **motion — 0 components.** §7's policy is specified and unadopted. The
    Context table's "No policy. Components animate or do not, per component."
    remains an accurate description of the catalogue. **A host setting
    `motion="reduced"` changes nothing today.** Adoption is a named follow-up.
- The 79 hard-coded literals became mechanically replaceable and were replaced
  by P4-03 as one change, each value proved byte-identical to the literal it
  replaced.
- The SSR and hydration contract is proven, not asserted:
  `packages/core/tests/ssr/provider-ssr.spec.ts` (4 tests) and
  `dz-provider-ssr.spec.ts` (10 tests) resolve every concern with `window`,
  `document` and `matchMedia` **deleted**, and hydrate a configured, a nested
  and a themed tree with zero mismatch warnings.
- `@dzup-ui/contracts` carries nine runtime injection symbols and remains
  dependency-free and tree-shakeable. **`DZ_THEME_KEY` is the exception and
  lives in `@dzup-ui/core`** (`providers/DzThemeProvider.types.ts`), so §1's
  dependency-direction argument holds for nine concerns and not for theme: Pro
  can read an application's locale without importing Core's runtime and cannot
  read its theme that way. Recorded rather than engineered around; see Rollout.
```

### 9.2 Replacing Rollout §4, §5 and §6

```markdown
4. ~~**P4-04** migrates the 15 portal props to the provider default.~~ **Done.**
   **18** components resolve through `useDzPortalTarget()` — three more than the
   15 that extend `BasePortalProps` — as `props.portalTo ?? provider`, which is
   §6 step 1. The `portalTo` props were **retained**. P4-04 was also chartered to
   decide their deprecation and **did not**; that decision is open.
5. **P4-05** uses `useDzDirection` for the RTL matrices. **Open, and blocked**:
   N2-S1 S1-F4 found `validate:rtl` reading the wrong file with a regex naming
   Tailwind-3 utilities absent from Tailwind 4 (14 measured sites; `DzDialog`'s
   pinned close control is a real defect in an ADR-19 pilot). See S1-D3.
6. **Open:** whether `useDzTheme` should gain a default and stop throwing, and —
   the same question — whether `DZ_THEME_KEY` should move to `@dzup-ui/contracts`
   beside the other nine. Answering only the first leaves the package-graph
   inversion §1 exists to prevent. Both amend ADR-09, **which has no document in
   `docs/adr/`** — it is one of the 14 entries in
   `packages/tooling/scripts/adr-registry.json`. Writing ADR-09 is the natural
   prerequisite.
```

### 9.3 One line to add to *Amendments → What did not change*

```markdown
**Measured 2026-09-03 (TASK-N5-05):** every default in §2 is unchanged and
matches `DZ_PROVIDER_DEFAULTS` at `packages/contracts/src/provider.types.ts:236`
byte for byte; the nine keys are at `:215-223`; `DzMessageCatalog` is the empty
interface at `:80`. A5's "~38 components" is now **40**.
```

---

## 10. What this packet refuses to imply

- **That ADR-20 is accepted.** No status was set and no ADR file was edited.
- **That the 88 passing tests are anything but locally qualified.** They are not
  CI, release or production evidence, and they ran on a dirty worktree carrying
  three other packets' uncommitted work. The maturity ladder is
  specified → implemented → focused-validated → aggregate-qualified →
  browser/AT-qualified → packaged → released; **this run reaches
  focused-validated and no further.**
- **That `validate:all` is green, or that ADR-20's nine validation hooks all
  pass.** Six of nine rows were executed. Three were not, and neither was the
  Storybook pseudo-locale toolbar nor `i18n.spec.ts`.
- **That the hard-coded-string count is 0, or 79, or any number.** The gate was
  deliberately not run because its source file is modified by another packet in
  this worktree.
- **That "the provider contract ships" means components use it.** The central
  measurement of this packet is that three of nine concerns have **zero**
  component consumers. Structure is not adoption, and the maturity ladder does
  not let the two collapse.
- **That the adoption counts will hold.** Measured at `6f1f653` on a tree three
  packets are actively editing.
- **That D20-1 is a small finding.** It is filed 🔴 because §7 trades an
  accessibility-preference override for a benefit the catalogue does not yet
  collect, and because accepting §7 unamended would put a false capability claim
  into an approved decision record.

---

*Companion: `N5-05-adr-19-acceptance-packet.md`. Combined findings and the full
`[!owner]` list: `N5-05-adr-acceptance-handoff.md`.*
