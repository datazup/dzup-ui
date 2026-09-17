# `data-scope` — decision sheet

- **Prepared by:** TASK-R5-O1, 2026-09-04, on `main` @ `99b963a` (dirty
  worktree; three sessions, none of them this decision's — see the handoff).
- **Decision owner:** the ADR-19 acceptance owner (TASK-R0-O2).
- **Status of the question:** open. **This sheet does not decide it.**
- **Upstream:** N2-S1 §11 (the evaluation) → **S1-D2 / S1-D6**; ADR-19
  acceptance packet **§5.1 / D19-13 / D-A**.
- **This sheet exists because** ADR-19 §3 promises *"parts are a promise about
  identity"* and `data-part` alone cannot keep that promise. That is not a
  defect in the rollout; it is a gap in the attribute vocabulary, and it is the
  last ADR-19 divergence that is neither code work nor a wording fix.

---

## 1. The question, in one sentence

Should every anatomy node carry `data-scope="<component>"` beside its
`data-part`, so a selector reads `[data-scope=select][data-part=trigger]` rather
than `[data-part=trigger]`?

## 2. What is true today, measured on `99b963a`

| Quantity | Value | Source |
|---|---|---|
| Static `data-part` sites | **118**, across 37 components, 36 distinct names | `validate:anatomy-parts`, exit 0 |
| Anatomy declarations | **32** (31 public + 1 compound part) | same run |
| Public components with **no** anatomy | **113 of 144** | `unclassified-ceiling.json:maxWithoutAnatomy` |
| Distinct `data-state` values emitted | **24**, across 72 components | `validate:anatomy-parts` (state rules added by this task) |
| `data-state` values from components with no anatomy | **88** | same run |
| Components that would emit `data-scope` at full rollout | ~500+ nodes | N2-S1 §11.3 estimate, not re-measured |

**The arithmetic that dominates this decision:** 113 of 144 components have not
declared a *first* per-node attribute. `data-scope` is a **second** public
attribute whose only job is to disambiguate the first.

## 3. The case for

1. **One case cannot be fixed any other way.** `DzTooltipTrigger` merges its
   attributes onto its child, so `DzRelativeTime`'s `<time data-part="root">`
   also carries the tooltip's `data-state="closed"`. One element, two
   components' state. No boundary rule can separate them, because there is no
   nested element to stop at. Declaring `open`/`closed` in `DzRelativeTime`
   would document another component's lifecycle as its own; silencing the check
   would delete the rule that found it. A scope marker separates them; nothing
   else does.
2. **Two measured collisions have already been paid for with structural
   anchors.** `[data-part="content"]` once matched a `<table>` two components
   down (fixed with `:has([data-part="item"])`), and `expectAnatomy` reported
   `part "root" appears 5 times` on `DzSpeedDial` (fixed with a boundary rule).
   Both fixes are inferences a *consumer* has to make correctly, in CSS, with no
   test to catch the mistake.
3. **The docs site cannot publish a copy-pasteable selector.** It prints part
   names; it cannot print a selector that is correct in isolation.
4. **Migration is additive** — a new attribute, no rename, no removal. Every
   existing `[data-part=…]` selector keeps working. Under `VERSIONING.md` §2.1
   that is a **patch**.

## 4. The case against

1. **It doubles the per-node contract before the per-node contract is
   finished.** See §2.
2. **DOM weight is not uniform.** `DzTable`'s `row` and `cell` repeat per
   record, so a large SSR table pays per cell. ~20 bytes × ~500 nodes is
   irrelevant for one page and non-trivial for a thousand-row payload. **This
   has not been measured on a real payload; it is the one number this sheet
   cannot supply.**
3. **A new public attribute is a new promise.** Its value has to be stable, so
   naming it is itself a decision (`select` vs `dz-select` vs `DzSelect`) and
   changing it later is breaking.
4. **It does not fix what it looks like it fixes.** `expectAnatomy` would still
   need to know which scope it is checking; it does not resolve the part-name
   vocabulary; and it does not help a consumer who wants to style *all* triggers
   across the library.

## 5. Competitor position (2026 catalogue, from N2-S1 §11.4)

| Library | Marks identity? | How |
|---|---|---|
| Ark UI / Zag | **Yes** | `data-scope` + `data-part` on every node, emitted by the anatomy helper — never typed |
| Base UI | No | parts are *components* (`<Select.Trigger>`); identity rides the component boundary |
| Radix / Reka | No | same model as Base UI |
| Nuxt UI | No | a `ui` prop keyed by slot; no part attributes at all |

**The pattern:** the three libraries that do *not* mark scope expose parts as
separate components, so identity rides the component boundary. **dzup-ui exposes
parts as attributes on one component's DOM and is the only library in that group
that does not mark scope.** That is the strongest single argument for adopting
it, and it is why "everyone else does without it" is not available as a reason to
decline.

## 6. The options

### Option A — **Adopt now**

Emit `data-scope` on every node that carries a `data-part`.

- **Consequences for anatomy declarations:** none to the *declarations* — the
  value is one per component and must be **generated, never typed** (a
  hand-written scope per node is the hand-typed-facts failure this program has
  recorded five times: P2-02 READMEs, T1-K4, A1-F3, A2-F-3, A2's version
  literals). The shape is a `useAnatomy(anatomy)` composable returning an
  attribute bag. Every one of the 37 emitting components has to route its
  attributes through it, and the 113 that have not declared an anatomy get it for
  free as the rollout reaches them.
- **Cost:** one composable, 37 component edits, a validator rule, a DOM-weight
  measurement on `DzTable`, and a docs change. Additive; a `patch`.
- **Risk:** it lands a second attribute on components whose first attribute is
  still being rolled out, and doubles the surface TASK-R5-O2 has to get right.

### Option B — **Defer, with a named trigger** *(recommended)*

Do not emit it now. Record the `DzRelativeTime` case in ADR-19 §3 as a **known
limit** (done, 2026-09-04), and revisit when the trigger fires.

- **Trigger:** `maxWithoutAnatomy` reaches **0** — i.e. the anatomy rollout
  (TASK-R5-O2) is complete — **or** a third identity collision is measured,
  whichever comes first.
- **Consequences for anatomy declarations:** none. Declarations stay as they are;
  `expectAnatomy`'s boundary rule and structural anchors keep carrying identity
  by convention, which is what they do today.
- **Build it with the recipe-attribute emitter.** ADR-19 §4 declares
  `data-size/variant/tone/density/orientation` public and **nothing measures
  them** (packet D19-6). Both gaps want the same `useAnatomy()` attribute bag.
  They are one packet, not two, and doing `data-scope` alone would build the bag
  and then not use it for the other half.

### Option C — **Middle: scope only where a component composes another declaring component**

~5 % of nodes.

- **Recorded so it can be rejected explicitly.** N2-S1 judges it *probably worse
  than either extreme*: it buys a small DOM at the cost of a rule a consumer must
  learn — "scope is present when you need it" — which is the kind of conditional
  contract that reads as a bug the first time someone hits the other branch.

### Option D — **Refuse**

Decide that identity is carried by convention and structural anchors, permanently.

- **Consequences:** the `DzRelativeTime` case stays unfixable and must be
  documented as permanent rather than pending; a consumer writing
  `[data-part=root]` in CSS keeps carrying the ambiguity; and the library stays
  the only attribute-based parts library in its comparison group without scope.
  Choosing this means striking the "revisit" language from ADR-19 §3, not leaving
  it.

## 7. Recommendation

**Option B — defer with a named trigger, and build it with the recipe-attribute
emitter as one `useAnatomy()` packet.**

The argument is arithmetic, not taste: 113 of 144 components have no first
per-node attribute, and adding a second one now means the rollout has to land two
contracts correctly instead of one. Nothing in the deferral is lost — the
migration is additive whenever it happens, so waiting costs no more than acting.
The one case that genuinely cannot be fixed otherwise (`DzRelativeTime`) is a
single, named, documented limit, not a class of failure.

**What would change this recommendation:** a third measured identity collision,
or evidence that consumers are writing `[data-part=…]` selectors that break. Both
are observable; neither has been observed twice since N2-S1.

## 8. What this sheet cannot supply

- **A Pro adoption estimate.** How many `@dzup-ui-pro/pro` components would have
  to emit `data-scope`, and what that costs their SSR payloads, is not measurable
  from this repository, and no Pro checkout was read for this task. If the owner
  wants that number before deciding, it is a Pro-side measurement — but note that
  it only sharpens Option A's cost, and Option B is recommended on the OSS
  arithmetic alone.
- **A real DOM-weight measurement.** The ~10 KB figure is N2-S1's estimate at
  ~20 bytes × ~500 nodes. `DzTable` with a thousand rows is the case that would
  make it real, and nobody has rendered it.

## 9. The decision line

> **`[!owner]`  `data-scope` — adopt · defer with trigger · middle · refuse**
>
> ☐ **A — Adopt now**  ☐ **B — Defer (recommended)**  ☐ **C — Middle**  ☐ **D — Refuse**
>
> Trigger, if B: ______________________
>
> Signed: ______________________  Date: ____________
>
> *Unsigned. TASK-R5-O1 prepared this sheet and did not decide it.*
