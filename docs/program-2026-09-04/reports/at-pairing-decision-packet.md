# AT pairing decision packet — one table for doc 06, OSS and Pro

> **TASK-R2-O2, phase 1.** Prepared 2026-09-18 against `main` @ `2d51eec`
> (dirty tree — TASK-R2-O3/O4's uncommitted work, preserved). Every number below
> is bound to that commit.
>
> This packet **proposes**; the owner decides. It also carries the **criterion
> C9 options memo** (§5), because the pairing set and what 1.0 can honestly
> claim are the same decision asked twice.

---

## 1. The disagreement, measured

Three documents name the AT/browser pairings this programme tests against, and
no two of them agree. This is not a cosmetic inconsistency: a cell id is a
join key. `jaws-chrome` in OSS and `jaws-chrome` in Pro are the same string and
are meant to be the same evidence; `talkback-android` and `talkback-chrome` are
the same pairing under two names, and nothing can join them.

| Pairing | doc 06 (2026-08-11 spec) | OSS (`AT_PAIRS`) | Pro (`validate-at-runs.mjs`) |
|---|---|---|---|
| NVDA + Firefox (Windows) | ✅ `nvda-firefox` | ✅ `nvda-firefox` | ✅ `nvda-firefox` |
| NVDA + Chrome (Windows) | ✅ `nvda-chrome` | ✅ `nvda-chrome` | ❌ **absent** |
| JAWS + Chrome (Windows) | ❌ **absent** | ✅ `jaws-chrome` | ✅ `jaws-chrome` |
| VoiceOver + Safari (macOS) | ✅ `voiceover-safari` | ✅ `voiceover-safari` | ✅ `voiceover-safari` |
| VoiceOver + Safari (iOS) | — (folded into macOS row) | ✅ `voiceover-ios` | ❌ **absent** |
| TalkBack + Chrome (Android) | ✅ (unnamed) | ✅ `talkback-android` | ✅ `talkback-chrome` |
| Forced colors (Edge/Chromium) | ✅ (unnamed) | ❌ **absent** | ✅ `forced-colors` |
| **Total** | **5** | **6** | **5** |

Sources, verbatim:

- **doc 06** — `workspace-docs/repos/ui/docs/architecture/dzup-ui-system-reassessment-2026-08-11/06-quality-accessibility-i18n-security-spec.md`, §"Automation versus manual evidence". Four rows, five pairings, because the Windows row names two. It includes a **Windows high contrast** row and **no JAWS**.
- **OSS** — `packages/tooling/src/quality/at-matrix.ts`, `AT_PAIRS`. Its docstring says the six come "from the reassessment's 06-…-spec.md". They do not: OSS **added** JAWS, **split** VoiceOver into desktop and iOS, and **dropped** forced-colors.
- **Pro** — `ui/dzup-ui-pro/scripts/validate-at-runs.mjs:51-52`. Its comment says *"The five cells doc 06 names"*. They are not: Pro **substituted** `jaws-chrome` for doc 06's `nvda-chrome`.

**Both downstream comments claim fidelity to doc 06 and neither has it.** That
is the finding worth acting on — the drift happened silently, twice, because
nothing compares the three.

### 1a. Pro already tier-differentiates; OSS did not

`ui/dzup-ui-pro/docs/qa/at/README.md` §3 declares a ladder (D: 5 pairs · C: 2 ·
B: 1 · A: none). OSS declared none at all — TASK-N1-O4 §1c measured that
`AT_PAIRS` was consumed unconditionally, so `DzFileUpload`, the single Tier D
component in the catalog and the one whose primary job is a data boundary,
owed exactly what a Tier B `DzBadge` owed. The capability matrix stamped
`origin: "tier B"` on every Tier C and D row to say so.

**TASK-R2-O2 closed the OSS half** (see §3). Pro's ladder and OSS's ladder are
now both real and still differ; reconciling them is decision **D109**.

---

## 2. Recommendation — adopt the OSS six as the shared vocabulary

**Recommended: one table of six ids, adopted verbatim by doc 06 and Pro.**

| id | AT + browser | Platform | Why it is in the set |
|---|---|---|---|
| `nvda-firefox` | NVDA + Firefox | Windows | Browse/forms mode switching and the Gecko accessibility tree. The single highest-value pairing: the largest share of screen-reader users run NVDA, and Gecko's tree diverges most from Blink's. |
| `nvda-chrome` | NVDA + Chrome | Windows | The same AT over Blink. Isolates *engine* differences from *AT* differences — without it, a failure under JAWS+Chrome cannot be attributed to either. |
| `jaws-chrome` | JAWS + Chrome | Windows | JAWS applies heuristics over ARIA and overrides author intent more often than NVDA. It is the pairing most likely to expose an over-clever ARIA construction, and it is the one enterprise procurement asks about. |
| `voiceover-safari` | VoiceOver + Safari | macOS | WebKit's tree and rotor navigation. |
| `voiceover-ios` | VoiceOver + Safari | iOS | **Kept separate from macOS deliberately.** A control is reached by gesture, not by Tab, so a control removed from the tab order is still reachable here — which is exactly the defect class N1-O4 recorded against `DzPersonaSelector`'s clear button. Folding it into the macOS row, as doc 06 does, makes that defect unrecordable. |
| `talkback-android` | TalkBack + Chrome | Android | Touch exploration, gestures, drag alternatives. |

Three consequences, stated plainly:

1. **doc 06 gains JAWS and the iOS split.** Both are additions the two
   implementations independently decided they needed; the spec is the document
   that is behind, not the code.
2. **Pro renames `talkback-chrome` → `talkback-android`.** Purely an id change.
   Pro has **0 of 34** required cells recorded, so no run record is invalidated
   — this is the cheapest it will ever be. (Pro-side execution is Pro's
   programme; this packet only states what OSS proposes.)
3. **`forced-colors` does not become an AT pairing.** See §2a.

### 2a. Why `forced-colors` is not in the table

Pro's own comment concedes it: *"`forced-colors` is a mode, not a screen
reader, and is tracked here anyway."* Two reasons to stop tracking it here:

- **It is already measured, automatically, three times over.** `forced-colors`
  is one of the six conditions in the 18-project Playwright matrix (3 engines ×
  6 conditions). It has a `browser-matrix` cell. Carrying it as an AT cell as
  well double-counts one piece of evidence under two kinds — and the whole
  point of the capability matrix is that a cell means one thing.
- **It answers a different question.** Every other cell in this table answers
  "does a screen-reader user know what happened". Forced colors answers "is
  state still visible without color", which is a *visual* claim a sighted
  tester or an automated check verifies.

**Recommendation: Pro drops `forced-colors` from `AT_PAIRS` and relies on the
browser lane**, or — if Pro's browser lane genuinely cannot emulate the system
palette, which its README §6 asserts — keeps it as a **separate
`manual-visual` cell kind** rather than an AT pairing. Either is defensible;
silently calling a display mode a screen reader is not.

---

## 3. The tier ladder OSS now ships

Landed by TASK-R2-O2 in `packages/contracts/src/quality-tiers.ts` as
`TIER_AT_PAIR_INCREMENT` + `requiredAtPairs(tier)` — a published contract,
beside `TIER_EVIDENCE_INCREMENT`, accumulating from A upward so that
**D ⊇ C ⊇ B is a property of the data structure**, not a rule to remember.

| Tier | Increment | Cumulative requirement | Components | Required cells |
|---|---|---|---|---|
| A | — | none (excluded from the scaffold) | 55 | 0 |
| B | `nvda-firefox` | 1 pairing | 67 | 67 |
| C | `+ jaws-chrome`, `+ voiceover-safari` | 3 pairings | 21 | 63 |
| D | `+ nvda-chrome`, `+ voiceover-ios`, `+ talkback-android` | all 6 | 1 | 6 |
| | | | **89** | **136** |

**The denominator did not move.** The scaffold still generates a row for all
six pairings on all 89 components — **534 cells, unchanged** — because
`<evidence_rules>` requires unrun cells to stay visible. What the ladder
changes is only which cells a component must have *passed* to be called
qualified. `validate:at-matrix` prints **both** numbers, always:

```
cells                  534
executed               0
required cells         136  (tier-differentiated, TASK-R2-O2)
required executed      0
```

Reporting only the smaller number would move a ratchet by redefinition rather
than by work. It is written down here so that a later reader can check that it
was not done.

### 3a. Divergence from Pro's ladder — decision D109

| Tier | OSS (now) | Pro (`docs/qa/at/README.md` §3) |
|---|---|---|
| B | `nvda-firefox` | NVDA+Firefox |
| C | `nvda-firefox` · `jaws-chrome` · `voiceover-safari` | NVDA+Firefox · VoiceOver+Safari |
| D | all six | NVDA+Firefox · JAWS+Chrome · VoiceOver+Safari · TalkBack · Forced colors |

They agree at B and disagree at C and D. OSS puts `jaws-chrome` at Tier C;
Pro puts it at D. **OSS's placement is deliberate and is the one this packet
recommends**: JAWS is where an over-clever ARIA construction surfaces, Tier C is
where the catalog's composite widgets live, and wave 1 —
`nvda-firefox` + `jaws-chrome`, the wave both repositories' plans name — is
only coherent if `jaws-chrome` is an obligation of the tier being tested.

---

## 4. What each repository changes if the recommendation is adopted

| Repository | Change | Cost |
|---|---|---|
| **OSS** | None. `AT_PAIRS` already holds the six; the ladder landed with TASK-R2-O2. | 0 |
| **doc 06** | Add `jaws-chrome`; split the VoiceOver row into macOS and iOS; move the forced-colors row out of the AT table into the browser-matrix section. | One table edit, in `workspace-docs`. |
| **Pro** | Rename `talkback-chrome` → `talkback-android`; drop or re-kind `forced-colors`; move `jaws-chrome` from D to C. **0 run records invalidated (Pro has 0 of 34).** | One constant + one README table. **Pro's programme, not this one.** |

---

## 5. Criterion C9 — the options memo

**C9:** *"Every Tier C/D AT cell executed with recorded versions/tester/date/commit."*
**Today: 0 of 132** (22 Tier C/D components × 6 pairings). Across all tiers,
**0 of 534**.

C9 is the only 1.0 exit criterion that no engineering shortens. `validate:at-scripts`
is green, 22 of 22 components have executable scripts, 124 steps and ~397
expectations are written — **what is missing is a person with a screen reader.**
Full Tier C/D coverage is ~75 h ≈ 9.5 tester-days (N1-O4 §5.2).

The 1.0 exit memo names three honest options. All three remain defensible; the
tier ladder from §3 adds a fourth that did not previously exist.

| # | Option | What 1.0 then claims | Cost to reach it | Consequence |
|---|---|---|---|---|
| **1** | **Narrow the claim** | 1.0 covers Tier A/B. Tier C/D stay `experimental` in the component-status ladder until their cells run. | Tier B is 67 components × 1 required pairing = **67 cells ≈ 25 h**. | 22 of the most-used components ship marked experimental. Honest, and commercially awkward. |
| **2** | **Narrow the pair set** | 1.0 claims the pairings actually executed; the rest are recorded `unrun`, not claimed. | Wave 1 = **44 cells ≈ 21 h**. | The claim is true and small. Needs the matrix to publish per-pairing state — which it now does. |
| **3** | **Move C9 post-1.0** | 1.0 makes no manual-AT claim, and the release notes say so. | 0 h. | Only honest if the README's WCAG AA claim is qualified at the same time. Shipping "WCAG AA" over 534 unrun cells is the specific outcome C9 exists to prevent. |
| **4** | **Satisfy the tier ladder** *(new)* | 1.0 claims every component has passed the pairings **its risk tier requires** — a claim the contract defines rather than the release notes. | **136 cells ≈ 55–60 h**, of which wave 1 covers 44. | The strongest claim reachable without the full 534, and the only one whose meaning is checkable from the repository rather than from prose. |

**Recommendation: option 4, reached through option 2.**

Run wave 1 (44 cells, ~21 h) first, because it is the same work under every
option — it is a strict subset of options 1, 2 and 4 — and because it converts
the first non-zero value this ratchet has ever had. Decide between 2 and 4 when
wave 1's defect count is known: if wave 1 comes back clean, 4 is ~35 h further
and worth it; if wave 1 finds a dozen defects, those defects are the 1.0 blocker
and the pairing count stops being the interesting question.

**What is not an option:** shipping 1.0 with 534 unrun cells and an unqualified
WCAG AA claim on the README. That is stated here rather than left implied,
because it is the default that happens if nobody decides.

---

## 6. Decisions this packet asks for

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **D109** | **One pairing vocabulary across doc 06, OSS and Pro.** Three tables, no two alike; two comments each claim fidelity to doc 06 and neither has it. | (a) adopt the OSS six everywhere; (b) adopt doc 06's five and delete JAWS from both implementations; (c) leave them divergent and stop pretending they join. | **(a).** The two implementations independently added JAWS and split iOS; the spec is what is behind. Costs Pro one constant and zero run records. |
| **D110** | **Is `forced-colors` an AT pairing?** Pro tracks it as one and its own comment says it is not one. | (a) drop it — the browser matrix already measures it in 3 engines; (b) keep it as a distinct `manual-visual` cell kind; (c) keep it as an AT pairing. | **(a)**, falling back to **(b)** if Pro's claim that its browser lane cannot emulate the system palette holds. Not **(c)**: a display mode is not a screen reader. |
| **D111** | **Which tier owes `jaws-chrome`?** OSS now says C; Pro says D. | (a) C, as OSS ships; (b) D, as Pro ships; (c) each repository keeps its own. | **(a).** Wave 1 is `nvda-firefox` + `jaws-chrome` in both programmes' plans, and that wave only means something if the pairing is an obligation of the tier being tested. |

Decisions **D112–D114** (tester, cadence, C9 option) are in the wave-1 runbook,
[`TASK-R2-O2-wave-1-runbook.md`](./TASK-R2-O2-wave-1-runbook.md), because they
are the owner's execution decisions rather than vocabulary ones.
