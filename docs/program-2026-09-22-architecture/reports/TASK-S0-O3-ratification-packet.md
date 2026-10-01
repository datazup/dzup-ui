# TASK-S0-O3 — ADR-18/19/20 ratification packet

> **Accepting an ADR is the owner's act and only the owner's.** Flipping a
> `Status:` line from `Proposed` to `Accepted` is a signature; no agent may
> write one, and none was written by this task. The three documents in
> `docs/adr/` are **byte-identical** to their state at the start of this task —
> `sha256sum -c` 3/3 `OK`, `git status --short docs/adr` = 0 paths (§8.1).
> `maxProposedCitedFromCode` is **unchanged at 3**, because it may only fall in
> the same change as an acceptance.

**Bound to `main` @ `4e4e46f` (`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`).**
Worktree **not clean — 255 dirty paths**, all produced by the ten prior tasks of
this programme and uncommitted by design. Every number below was measured at
that commit with the command printed beside it; nothing is quoted from a
predecessor report. Where a predecessor's figure did not reproduce, the packet
says so.

**This packet cites and does not rebuild** the two 2026-09-03 acceptance packets
(`../program-2026-09/reports/N5-05-adr-19-acceptance-packet.md`,
`…-adr-20-acceptance-packet.md`) and the 2026-09-22 precondition tables in
`../program-2026-09-04/reports/TASK-R0-O2-handoff.md` §2. Their divergence
analysis stands. What is new here is a re-verification at HEAD, the reverse
cost, and the gate in §8.

---

## 0. The three verdicts, and what the owner signs

| ADR | Verdict | Why, in one line |
|---|---|---|
| **ADR-19** public styling contract | ✅ **Ready to sign** | Every code and text precondition met and re-verified at `4e4e46f`; every figure in its own amendment A1 reproduces exactly |
| **ADR-20** provider contract | ✅ **Ready to sign, with one correction to make in the same change** | No clause the code contradicts; five open questions, all non-blocking — but amendment **A8.3's adoption counts do not reproduce** at HEAD and should stop being transcribed (§3.4) |
| **ADR-18** runtime floor and validator runner | ⛔ **Not ready.** Do not sign today | Its Decision 1 is under active dispute with three conflicting recommendations; its Decision 3 is **measurably false on the tree**, and the exposure is **twice as wide** as the report that measured it said (§1.3) |

**The order matters, and it is short:**

1. **Decide nothing about ADR-18 yet.** Answer the Node-floor question first
   (owner-decision register row 19). ADR-18's acceptance is downstream of it and
   nothing in this packet shortens that path.
2. **Sign ADR-19.** Edit one line in
   `docs/adr/ADR-19-public-styling-contract.md`:
   `- **Status:** Accepted (<owner>, 2026-09-24)`.
3. **Sign ADR-20** the same way in `docs/adr/ADR-20-provider-contract.md`, and in
   the same commit apply the A8.3 correction in §3.4 (delete the transcribed
   adoption table, cite the commands instead).
4. **In the same commit as steps 2–3**, lower two ratchets together — they now
   fail in opposite directions if you move only one:
   - `packages/tooling/scripts/adr-registry.json` →
     `maxProposedCitedFromCode`: **3 → 1**
   - `packages/tooling/src/validators/adr-status-grandfather.json` → delete the
     `ADR-19` and `ADR-20` entries, `maxGrandfathered`: **3 → 1**
5. **Run `yarn validate:adr-references` and `yarn validate:adr-status`.** Both
   must exit 0. If either is red, the arithmetic and the document disagree and
   the message names which.

> **The register's "3 → 0" is right for one option only.** Row 18 of
> `owner-decision-register-2026-09-22.md` records the ratchet movement as
> `maxProposedCitedFromCode` **3 → 0**, which is correct for its option *"sign
> all three"*. Under its own **recommended** option — sign 19 and 20, hold 18 —
> the target is **1**, not 0, because ADR-18 remains `Proposed` and is still
> cited from shipped source (`packages/tooling/src/validators/stop-conditions.ts:438`).
> Setting it to 0 while ADR-18 is unsigned makes `validate:adr-references` red on
> rule `proposed-ceiling`. This packet records that as a precision correction to
> row 18, not a falsification of it. **Sign all three → 0. Sign 19 and 20 → 1.**

---

## 1. ADR-18 — Runtime floor and validator runner

**Document:** `docs/adr/ADR-18-runtime-floor-and-validator-runner.md` (189 lines)
**Status today:** `Proposed (TASK-OSS-P2-01, 2026-08-20)`, amended A1–A5 by
TASK-R0-O2 on 2026-09-22.

### 1.1 What it decided

Four decisions: (1) the Node floor is `^20.19.0 || >=22.13.0`, the exact
intersection of the gate dependencies' own `engines`, declared in three places
that must agree; (2) TypeScript in scripts always runs through `tsx`, never
native `.ts` execution; (3) a `validate-min-runtime` CI job runs every documented
gate **at the floor**, which is what turns the floor from a claim into evidence;
(4) no threshold, validator or test is weakened to make that job green.

### 1.2 What shipped against it — decisions 1 and 2 are implemented

| Claim | Measured at `4e4e46f` | Command |
|---|---|---|
| root `engines.node` | `^20.19.0 \|\| >=22.13.0` | `node -e "console.log(require('./package.json').engines.node)"` |
| `packages/mcp` `engines.node` | `^20.19.0 \|\| >=22.13.0` | `node -e "console.log(require('./packages/mcp/package.json').engines.node)"` |
| `.nvmrc` | `20.19.0` — the floor itself, as decided | `cat .nvmrc` |
| the three agree, and every gate dependency satisfies them | **exit 0** | `yarn validate:engines` |
| `tsx` rather than native `.ts` | every `validate:*`/`generate:*` script is `tsx …` | `node -e "const s=require('./package.json').scripts; console.log(Object.entries(s).filter(([k,v])=>/^(validate\|generate):/.test(k) && /\.ts(\s\|$)/.test(v) && !/^tsx /.test(v)).length)"` → 0 |

### 1.3 Why it is not signable — two unmet preconditions, one of them worse than reported

**(a) Decision 1 is under active dispute.** Its own amendment **A1** records
three reports recommending three different floors, two written on the same day
with the later explicitly differing from the earlier
(`N5-04 D3` → `>=22.13.0`; `D160` → keep the range and fix one import;
`D176` → `>=22.13.0` with D160 as interim). The ADR's Decision section keeps its
current text "until an owner answers". Register row 19 is that question.

**(b) Decision 3 is false on the tree, and the exposure is *two* sites, not one.**
`fs.globSync` is `@since v22.0.0`, so any `node:fs` `globSync` import breaks on
the floor's whole `^20.19.0` branch. R1-O4 (**D160**) named **one** site and
proposed fixing it. At `4e4e46f` there are **two**:

```
packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49   # D160's site — still unfixed; IN the `yarn test` lane
packages/codemods/scripts/run-story-color-tokens.ts:15                 # never reported; landed 2026-07-13 in 6c5f522
```

Reproduce:
`grep -rn "globSync" packages/ --include='*.ts' --include='*.mts' | grep "node:fs"`
→ 2 hits. (`packages/codemods/src/runner.ts` imports `globSync` from the `glob`
npm package, not from `node:fs`, and is not a floor break.)

**The consequence for the decision.** D160's option — *"fix the one offending
import"* — rests on an undercount. The second site predates D160 by two months
and was simply never swept, which is exactly what ADR-18 **A2** warned was owed:
*"one `@since v22` API reached the tree unnoticed because nothing runs on the
floor. A sweep is owed whichever way A1 goes."* 1.0 criterion **C10** — *"a floor
nothing has run on is not a floor"* — remains **not met**, and there has still
never been a green run on the 20.x branch.

**Signing ADR-18 today would ratify a floor whose own Decision 3 the tree
falsifies.** That is precisely what **D181** rejected in a different costume, and
what makes an acceptance uncitable.

### 1.4 Blast radius — the smallest of the three, by two orders of magnitude

| Definition | Count |
|---|---|
| shipped source (`validate:adr-status`) | **1** citation in **1** file — `packages/tooling/src/validators/stop-conditions.ts:438` |
| all code citations (`isCodeCitation`) | 13 across 6 files |
| everything, including prose | 209 across 43 files |

The single shipped citation is inside `packages/tooling`, a **private** package.
So ADR-18 is the one ADR here whose *published* blast radius is **zero**: holding
it costs no consumer anything, which is the practical reason option (a) is
cheap.

### 1.5 Open input and recommendation

| Input | State | Recommendation |
|---|---|---|
| **The Node floor** (register row 19; A1) | **Open — three answers, none binding** | **Answer it before signing.** Take `>=22.13.0` at 1.0 and, as the interim, fix **both** `globSync` sites rather than the one D160 named. Node 20 left maintenance in April 2026; `>=24.0.0` was considered and rejected (**D176**) because Node 22 LTS runs to April 2027 |
| **The C10 sweep** (A2) | **Owed, and wider than reported** | Sweep for every `@since v22`/`@since v23` Node API before the floor is restated either way; two sites found by one grep is not a sweep |
| RTL coupling removed from the floor argument (A3) | **MET** — verified: ADR-20 A8.1 corrects §4 | none |
| Nuxt 4.4.6+ consequence recorded (A4) | **MET** | none |

---

## 2. ADR-19 — Public styling contract: layers, parts, states, typed `ui` overrides

**Document:** `docs/adr/ADR-19-public-styling-contract.md` (585 lines)
**Status today:** `Proposed (TASK-OSS-P3-01, 2026-08-20)`, amended
2026-09-04 (TASK-R5-O1, 13 divergences closed) and 2026-09-22 (TASK-R0-O2,
A1–A4).

### 2.1 What it decided

Six decisions: (1) `--dz-*` is the public token interchange surface and the
TypeScript token maps stay the single source of truth; (2) six cascade layers
keeping the shipped hyphenated names, `@layer dz-reset, dz-tokens, dz-base,
dz-components, dz-utilities, dz-overrides`; (3) parts are `data-part`,
kebab-case, from a shared vocabulary, with `root` always present and Reka
internals never addressable; (4) `data-state` is a per-component enum, the global
`DataState` union becomes a named vocabulary rather than the attribute's type,
boolean states are presence-only, and the five recipe attributes are public;
(5) the typed per-instance override prop is `ui`; (6) dual-emit lasts one release
series and removing or renaming a part is breaking.

### 2.2 Divergences at `4e4e46f`: **0**

Every one of the packet's 13 divergences is closed — 8 amended into the document
by TASK-R5-O1, 4 fixed in code, and the 13th (`data-scope`) is explicitly **not
a divergence** because ADR-19 never claimed to solve it
(`N5-05-adr-19-acceptance-packet.md` §5.1; ADR-19 **A3**). Re-verified here, not
assumed:

| Decision | Evidence at `4e4e46f` | Command |
|---|---|---|
| §2 all six layers, in **both** published stylesheets | `packages/core/src/styles/base.css:51` · `packages/tokens/src/generate.ts:116` and `:262` | `grep -rn '@layer dz-reset, dz-tokens' packages/core/src/styles/base.css packages/tokens/src/generate.ts` |
| §2 layer order asserted on the **packed tarballs**, 3 engines | `e2e/styling/layer-order.spec.ts` present (7,299 B) | `ls -l e2e/styling/layer-order.spec.ts` |
| §3 `data-part` spelling, declared anatomies | **104** `*.anatomy.ts` files | `find packages/core/src -name '*.anatomy.ts' \| wc -l` |
| §3 emissions all declared | **622** emissions across **142** components, **47** distinct names; **0/0** undeclared; **0/0** declared-but-unemitted | `yarn validate:anatomy-parts` |
| §3 vocabulary reviewed, nothing held | **0** unreviewed · **0/0** held | same run |
| §4 `DataState` widened | `packages/contracts/src/data-attributes.types.ts:65` → `'data-state'?: string`, with the union retained as a named vocabulary | `grep -n "'data-state'?:" packages/contracts/src/data-attributes.types.ts` |
| §4 per-component enums enforced | 25 distinct values across 74 components; **0/0** undeclared by a declaring component; **17/17** from components with no anatomy | `yarn validate:anatomy-parts` |
| §5 the prop is `ui` | **90** `.types.ts` declare `ui?:` | `grep -rl 'ui?:' packages/core/src --include='*.types.ts' \| wc -l` |
| Rollout ratchet | `maxWithoutAnatomy` **41**, all Tier A; Tier B+ coverage **89/89** | `node -e "console.log(require('./packages/tooling/src/ownership/unclassified-ceiling.json').maxWithoutAnatomy)"` |

**Every figure in ADR-19's own amendment A1 reproduces exactly at `4e4e46f`** —
104 anatomy files, 622 emissions, 142 components, 47 names, `maxWithoutAnatomy`
41, undeclared emissions 0/0. A1 was measured at `527dbd1`; the tree has not
moved on any of them. This is the only one of the three documents whose numbers
survived re-measurement unchanged.

### 2.3 Blast radius

| Definition | Count |
|---|---|
| shipped source (`validate:adr-status`) | **369** citations across **251** files |
| register row 18's grep (`packages/*/src`, `.ts`+`.vue`, specs included) | **273** files — reproduces exactly |
| all code citations (`isCodeCitation`) | 538 across 278 files |
| everything, including prose | 1,145 across 439 files |

### 2.4 What acceptance commits the project to

- **`data-part` names become a promise about identity.** Removing or renaming one
  is breaking — a **minor** while `0.x`, a major from 1.0 (§6, as amended). 47
  distinct names across 142 components come under that promise on signature.
- **The six layer names are frozen**, including the rejection of the dotted
  `dz.*` spelling. A consumer may write `@layer dz-overrides { … }` with no
  `!important` and no library change.
- **One documented limit is accepted with it**, and it is asserted in three
  engines rather than hidden: a consumer sheet that registers `dz-overrides`
  *before* the dzup stylesheets load loses to `dz-components`, and nothing the
  library ships can fix it. The documented arrangement is *dzup stylesheets
  first*; the unlayered route is order-independent.
- **`ui` is the override prop name**, and `class` keeps meaning "root only".
- **Two clauses ship declared-but-unenforced and acceptance makes that explicit
  debt, not a hidden gap**: the five recipe attributes (`data-size`,
  `data-variant`, `data-tone`, `data-density`, `data-orientation`) are public by
  §4 with **no gate measuring them**, and `.dz-field-input-reset` /
  `.dz-tab-close-btn:hover` remain `!important` debt with an owner
  (`.dz-native-input:-webkit-autofill` is a permanent recorded exception).

### 2.5 Open input and recommendation

| Input | State | Recommendation |
|---|---|---|
| **`data-scope`** (`D19-13` / `D-A`) — part identity is carried by convention; one residual collision (`DzTooltipTrigger` merging `data-state` onto `DzRelativeTime`'s root) cannot be fixed structurally | **Open, and explicitly NOT a precondition** | **Defer**, and build it with the recipe-attribute emitter as one generated `useAnatomy()` attribute bag — one attribute source, not a second hand-written per-node one. Costed sheet: `../program-2026-09-04/reports/TASK-R5-O1-data-scope-decision.md` |
| Copy ADR-17 into `docs/adr/` (`D-E`) | **Unmet, optional** | **Do it separately**, not as a condition of this signature. ADR-19 declares *"Extends: ADR-04, ADR-17"* and both are undocumented debt; writing ADR-17 would take `maxUndocumented` 14 → 13, the only ceiling movement available. It does not block the signature and should not delay it |

---

## 3. ADR-20 — Provider contract

**Document:** `docs/adr/ADR-20-provider-contract.md` (693 lines)
**Status today:** `Proposed (TASK-OSS-P4-01, 2026-08-21)`, amended five times —
P4-02, P4-03 (2026-08-21), R3-O2 (2026-09-04), R2-O4 (2026-09-18), R0-O2
(2026-09-22, A8.1–A8.7).

### 3.1 What it decided

Nine concerns, one injection key each, declared in `@dzup-ui/contracts` so the
commercial tier can read an application's locale without importing Core's
runtime; a typed default for every concern so **nine of the ten composables
never throw uninjected** (theme is the deliberate exception, inherited from
ADR-09); per-key override on nesting **except messages, which deep-merge**;
direction resolved from the locale and never returned as `'auto'`;
application-wide formatter caching keyed by locale plus normalised options.

### 3.2 Divergences at `4e4e46f`: **0 that contradict the document**

The packet's own conclusion — *ADR-20 has no clause whose code contradicts it* —
holds. Every divergence it raised was the document **under-claiming** what
shipped or **over-claiming** adoption, and A8 corrects both directions.
Re-verified:

| Decision | Evidence at `4e4e46f` | Command |
|---|---|---|
| §1 the nine keys, in contracts | **all nine present** and exported at `packages/contracts/src/provider.types.ts:629–637` (`DZ_LOCALE_KEY`, `DZ_MESSAGES_KEY`, `DZ_FORMATS_KEY`, `DZ_DIRECTION_KEY`, `DZ_PORTAL_TARGET_KEY`, `DZ_MOTION_KEY`, `DZ_DEFAULTS_KEY`, `DZ_NONCE_KEY`, `DZ_TEST_IDS_KEY`), plus two the amendments added — `DZ_SANITIZER_KEY:650` (A6 / R3-O2) and `DZ_URL_POLICY_KEY:664` (R2-O4) — **11** exported keys in all. `DZ_THEME_KEY` is theme's pre-existing key and is not in this file, which is what `D-L` is about | `grep -n '^export const DZ_[A-Z_]*_KEY' packages/contracts/src/provider.types.ts` |
| §2 typed defaults published | `DZ_PROVIDER_DEFAULTS` exported from `packages/contracts/src/index.ts:178` | `grep -n 'DZ_PROVIDER_DEFAULTS' packages/contracts/src/index.ts` |
| §5 formatters cached, migration complete | **0** `new Intl.` anywhere in `packages/core/src` outside `i18n/intl-cache.ts` | `grep -rn 'new Intl\.' packages/core/src --include='*.ts' --include='*.vue' \| grep -v intl-cache \| wc -l` |
| A6 sanitizer seam (R3-O2) | `DZ_SANITIZER_KEY` at `packages/contracts/src/provider.types.ts:650` | `grep -n 'DZ_SANITIZER_KEY' packages/contracts/src/provider.types.ts` |
| A8.1 the `getTextInfo()` correction (D181) | applied — §4's "one-line delegation when the floor moves" is corrected to *needs Node ≥ 24.0.0, above every floor under discussion* | read A8.1 |
| i18n subpath promises gated | `validate:published-imports` is chain link **32** of 56 (was 29 — the chain grew) | `node -e "const l=require('./package.json').scripts['validate:all'].split('&&').map(x=>x.trim());console.log(l.indexOf('yarn validate:published-imports')+1)"` |

### 3.3 Blast radius

| Definition | Count |
|---|---|
| shipped source (`validate:adr-status`) | **304** citations across **163** files |
| register row 18's grep | **169** files — reproduces exactly |
| all code citations (`isCodeCitation`) | 342 across 179 files |
| everything, including prose | 1,065 across 379 files |

### 3.4 The one correction to make in the same change as the signature

**Amendment A8.3's adoption table does not reproduce at `4e4e46f`.** A8.3 gives
2026-09-22 figures measured at `527dbd1` "over `packages/core/src/components`".
Measured today with exactly that scope:

| Concern | A8.3 says | Measured at `4e4e46f` over `packages/core/src/components` | Over all of `packages/core/src` |
|---|---|---|---|
| portal target (`useDzPortalTarget(`) | 18 | **18** ✅ | 22 |
| test ids (`useDzTestIds(`) | 89 | **88** ❌ | 93 |
| defaults (`useDzDefaults(`) | 23 | **22** ❌ | 27 |
| direction (`useDzDirection(`) | 19 | **18** ❌ | 26 |
| motion (`useDzMotion(` + `useDzMotionAttribute(`) | 18 (3 + 15) | **18** (3 + 15) ✅ | — |
| messages — components reading via `useComponentMessages` | 45 | **42** ❌ | 44 |
| messages — catalog entries in `i18n/messages.ts` | 44 | **44** ✅ | — |
| formats (`useDzFormats(`) | 3 | **3** ✅ | — |
| locale (`useDzLocale(`) | 1 | **1** ✅ | — |

Four of nine drift by 1–3, and `git diff --stat 527dbd1 HEAD -- packages/core/src/components`
shows only 19 files changed with 0 dirty paths there — so the drift is a
**measurement-method difference, not a code regression**. That is the point: the
figures cannot be reproduced from the method the amendment states.

**This is a record drift, not a code divergence, and it changes nothing about
the decision.** But A8.6 already took the right rule for exactly this problem —
*"the count is whatever that file declares, and this document should cite the
file rather than transcribe a number out of it"* — and A8.3 breaks it three
paragraphs earlier. **Recommendation:** in the acceptance commit, replace A8.3's
number column with the commands that produce them, keeping only the
`packet → today` *direction* claims that matter (motion 0 → adopted, test ids
0 → adopted, direction 0 → adopted, defaults 1 → ~22). Those are unaffected by
±3 and are the whole substance of the amendment. Do not re-transcribe a fourth
set of numbers.

### 3.5 Open inputs and recommendations — five, none blocking

| Id | Question | Recommendation |
|---|---|---|
| **N5-05 D-L** | Should `DZ_THEME_KEY` move to contracts, **and** should `useDzTheme` stop throwing? One question, not two: whether theme stops being special | **Defer to a named ADR-09 packet.** Both halves are unchanged in the tree, and changing the throw would change the semantics of a contract components already depend on (ADR-09). Not a condition of this signature |
| **N5-05 D-M** | Deprecate the 15 `portalTo` props, or keep them permanently? | **Keep them permanently, and say so in the document.** They are §6 step 1's escape hatch; resolution is `props.portalTo ?? dzPortalTarget.value`. This is the packet's own recommendation and it is cheap to record now |
| **N5-05 D-P** | Write ADR-09 before answering D-L | **Yes, and schedule it with D-E** (ADR-17) as one "write the two ADRs ADR-19/20 declare they extend" packet. Would take `maxUndocumented` 14 → 12 |
| **D6** | `DZ_PROVIDER_DEFAULTS` grew a `sanitizer` key (A6) — accept the growth under a minor, or hold it in a second constant? | **Accept the growth.** One published defaults object is the readable contract §2 exists to provide; a second constant splits the thing Pro must resolve against. Under `VERSIONING.md` §1 an additive key at `0.x` is a patch |
| **A8.3** | The transcribed adoption counts (§3.4 above) | **Replace with commands in the acceptance commit** |

---

## 4. What acceptance changes mechanically

Exactly five things move, and nothing else in the repository changes:

| # | What | From | To |
|---|---|---|---|
| 1 | The `Status:` line in each accepted document | `Proposed (TASK-…, 2026-08-2x)` | `Accepted (<owner>, <date>)` |
| 2 | `packages/tooling/scripts/adr-registry.json` → `maxProposedCitedFromCode` | **3** | **1** (signing 19+20) or **0** (signing all three) |
| 3 | `packages/tooling/src/validators/adr-status-grandfather.json` → entries / `maxGrandfathered` | 3 / **3** | 1 / **1** (signing 19+20) or 0 / **0** (all three) |
| 4 | `validate:adr-references`' own report line | `0/3 Accepted · 3 Proposed cited from code (ceiling 3)` | `2/3 Accepted · 1 Proposed cited from code (ceiling 1)` |
| 5 | 1.0 criterion **C1** — *"ADR-18/19/20 carry `Accepted` in the ADR file itself"* | **0 of 3** | **2 of 3** |

The `documented` half of `adr-registry.json` does **not** change: it deliberately
carries no `status` field, because the document's own line is the single source
of that fact.

### 4.1 Which gates become enforceable that are not today

Honest answer: **no validator changes behaviour on acceptance, and two gates
change behaviour on *failure* to complete the acceptance.** That asymmetry is the
mechanism, and it is worth stating plainly rather than overselling:

- **`validate:adr-references`** (chain link 45) already reads each `Status:` line.
  It goes **red** if a status is flipped without lowering
  `maxProposedCitedFromCode` (rule `proposed-ratchet`), and red if the ceiling is
  lowered without the flip (rule `proposed-ceiling`). Acceptance is therefore one
  atomic change or a broken build — which is the property that was missing before
  TASK-R0-O2, when *"accepting an ADR moved the ceiling by exactly 0, under any
  condition"*.
- **`validate:adr-status`** (new; chain link **56**, §8) goes **red** on the
  `grandfather-discharged` rule the moment a grandfathered ADR's status changes,
  until its entry is deleted and `maxGrandfathered` lowered. It is the second
  half of the same interlock, keyed on **names** rather than a count.

What acceptance changes is not a validator's behaviour but the **claims the
project is allowed to make**: the 08-11 quality spec's *"stable public
semantics"* promise, and the maturity-ladder step from *specified* to a public
contract. A `Proposed` decision cannot carry either. That is the whole cost of
the current state and the whole benefit of ending it.

---

## 5. The reverse cost — is rejection or amendment actually available?

A choice with only one option is a formality. Here is the honest reverse cost of
each.

### 5.1 ADR-19 — rejection is **not practically available**

State it plainly: **rejecting ADR-19 is not a live option, and amending it in any
way that changes a decided name is barely one.** The cost, measured:

| Rejecting or renaming would touch | Count at `4e4e46f` |
|---|---|
| `*.anatomy.ts` files that exist only to declare this contract | **104** |
| `data-part` emissions under the promise | **622**, across **142** components |
| distinct part names that become public on signature | **47** |
| `.types.ts` declaring the `ui` override prop | **90** |
| shipped-source files citing the decision | **251** |
| cascade-layer statements in **published** stylesheets | 2 (`base.css`, `tokens.css`) |
| e2e assertions against the **packed tarballs**, in 3 engines | `e2e/styling/layer-order.spec.ts` |

Renaming a part or a layer is **breaking by the ADR's own §6** — a minor at
`0.x`, a major from 1.0 — and the layer names are already emitted into two
shipped stylesheets that a consumer's cascade depends on. So the available
options are, honestly: **accept**, or **accept with a named amendment slot** for
a specific open question (`data-scope`), which is what §2.5 recommends.
"Reject" would mean deleting 104 files and re-breaking 142 components to buy a
different spelling, and both reassessments already rejected the only alternative
spellings on the merits.

**This is not an argument that the decision is good because it is expensive to
undo.** It is a statement of where the project is: ADR-19 was implemented before
it was signed, and the signature's job now is to make the record honest about
that, not to pretend a choice remains open that the code closed in August.
The **useful** decision left is not whether to accept but whether to accept the
two declared-but-unenforced clauses in §2.4 as explicit debt with owners — and
that is a real choice.

### 5.2 ADR-20 — amendment is available; rejection is not

Rejection would mean unwinding nine injection keys in a **types** package that
the commercial tier reads to avoid importing Core's runtime — the dependency
direction the whole package graph is built on — plus ~88 test-id, ~22 defaults,
18 direction, 18 portal and 18 motion consumers. Not available.

**Amendment genuinely is**, and two of the five open questions are amendments
waiting to be written rather than research: **D-M** (say the 15 `portalTo` props
are permanent) and **A8.3** (stop transcribing counts). Both are one paragraph
each and both can land in the acceptance commit. **D-L** is a real open question
with two defensible answers and it is correctly deferred.

### 5.3 ADR-18 — rejection, amendment **and** deferral are all available, and deferral is right

This is the one of the three where the reverse cost is genuinely low:

- **1** shipped-source citation, in a **private** package → published blast
  radius **zero**.
- Its decisions 1 and 2 are already implemented, so deferring changes nothing
  about how the repository runs today.
- Amending Decision 1 to `>=22.13.0` costs: one `engines.node` edit in two
  package manifests, one `.nvmrc`, one `CONTRIBUTING.md` sentence, lifting the
  Nuxt 4.4.5 pin (A4), and the C10 sweep that is owed either way.

**So the choice is real here, and the recommendation is to use it: hold ADR-18,
decide the floor, then sign.** Holding costs nothing and signing costs the
credibility of the other two signatures.

---

## 6. ADR-13 — the number collision, re-verified

Verified against `CLAUDE.md` §"ADR-13 is two different decisions — a number
collision, not a mistake" and against `adr-registry.json`'s ADR-13 entry before
restating it. Both say the same thing, and nothing has changed at `4e4e46f`:

| Tier | `ADR-13` means | Where |
|---|---|---|
| **dzup-ui** (this repository) | Calendar and date-picker **date math** delegated to `@internationalized/date` through the `useCalendar` composable | **No document.** Recorded in `adr-registry.json` (one of the 14) and in the `DzCalendar` / `DzDatePicker` / `DzDateRangePicker` headers |
| **dzup-ui-pro** | A different, unrelated decision — composite component dependencies require exact source/target admission — **Accepted 2026-08-10** | That tier's own `docs/adr/`; out of scope for this repository and not inspected by this task |

- **Resolution taken: naming, not renumbering.** Inside this repository a bare
  `ADR-13` always means the date-math decision; a cross-tier citation must be
  written `dzup-ui ADR-13` or `dzup-ui-pro ADR-13`.
- **Renumbering was rejected on the merits** and the reasoning still holds: the
  commercial tier's ADR-13 is Accepted and cited from its own source, this one is
  cited from **10** sites here, and a renumber breaks every existing citation to
  buy tidiness.
- **Measured here — and the method matters, because three definitions give three
  answers.** Every figure below is at `4e4e46f`:

  | Definition | Citations | Files | Command |
  |---|---:|---:|---|
  | `validate:adr-references`' own scanner (skips specs, `docs/adr/`, honours `adr-example-ok:`) | **67** | **18** | the scanner's `collectCitations()` |
  | raw grep over `packages/ apps/ docs/` + the four root docs | **79** | **20** | `grep -rho 'ADR-13' packages/ apps/ docs/ CLAUDE.md README.md DESIGN.md CONTRIBUTING.md \| wc -l` |
  | code (`isCodeCitation`) | 16 | 9 | — |
  | shipped source (`isShippedSource`) | **8** | **8** | `grep -rl 'ADR-13' packages/*/src --include='*.ts' --include='*.vue' \| grep -v '\.spec\.'` |

  **The registry's "cited from 10 sites here" does not reproduce under any of
  them.** The closest readings are 8 shipped-source files, 9 code files and 16
  code citations. This is the same transcribed-number defect §3.4 raises against
  ADR-20's A8.3, one file over — and it is recorded here rather than corrected,
  because the sentence sits in a *rejected-alternative* rationale whose argument
  (a renumber breaks every existing citation) holds at 8, 10 or 79.
  **Recommendation:** when the registry entry is next edited, replace "10 sites"
  with the command, exactly as A8.6 already rules for ADR-20.
- **Whether the two tiers keep sharing one number space is open as `D187`** —
  register row 62, recommendation *(b) keep sharing with the naming rule until a
  second collision occurs, then split*. **Nothing watches for a second
  collision**, which is the part row 62 itself calls cheap to fix. The gate in
  §8 does not fix it either: it reads this repository's `docs/adr/` only, by the
  repository-boundary rule. Detecting a cross-tier collision would need a
  published index from the other tier, and that is the same missing-manifest
  precondition TASK-S3-O1 is blocked on.

**Nothing in this packet's signatures touches ADR-13 or D187.** It is included
because acceptance is the moment the ADR index becomes a public artifact, and a
reader who arrives at `ADR-13` by number must not be silently sent to the wrong
decision.

---

## 7. ADRs cited from code with **no document at all** — re-measured

`adr-registry.json` tracks these as debt with a ceiling. Re-measured at
`4e4e46f`, not quoted:

| Measure | Count | Which |
|---|---|---|
| distinct ADRs cited anywhere | **17** | 3 documented + 14 registry-only |
| documented | **3** | ADR-18, ADR-19, ADR-20 |
| **cited from code with no document** | **14** | ADR-01, 02, 04, 06, 07, 08, 09, 10, 11, 12, 13, 15, 16, 17 |
| cited from **shipped source** with no document | **13** | the same list minus **ADR-11** (ESM-only distribution — cited from configs and prose, not from `packages/*/src/`) |
| `maxUndocumented` ceiling | **14** | equals the measured count — the ratchet is honest |
| registry entries nothing cites any more | **0** | no dead weight to remove |

<!-- adr-example-ok: every id in this paragraph is one REPORTED as having no document, or the next free number named as an example — not a citation of a decision. Same marker the S0-O3 prompt carries. -->
**S0-O1's leak is closed.** S0-O1 found a ledger line that was itself a citation
of **ADR-21** with no document; at `4e4e46f` nothing cites that number as a <!-- adr-example-ok -->
decision. What closes it is the `adr-example-ok:` marker on the S0-O3 prompt's
own `<motivation>` line in `custody-and-release-tasks.md:205` — verified by
`yarn validate:adr-references` exiting 0 with no `unresolved-citation`.

The heaviest undocumented decisions are the ones worth knowing about before
promising a public contract: **ADR-04** (231 shipped citations / 224 files),
**ADR-08** (123 / 76), **ADR-16** (113 / 96), **ADR-07** (71 / 71) and **ADR-17**
(29 / 29) — the last of which ADR-19 declares it *extends*. Writing ADR-09 and
ADR-17 would take `maxUndocumented` 14 → 12 and is the cheapest available
movement; it is **not** a condition of these signatures (§2.5, §3.5).

---

## 8. The gate that ships with this packet — `validate:adr-status`

Files: `packages/tooling/src/validators/adr-status.ts` ·
`adr-status.spec.ts` (25 tests) · `adr-status-grandfather.json` (3 dated
entries). Script `validate:adr-status`, **appended at the END** of
`validate:all`, which is now **56 links** (was 55; every existing link keeps its
number).

**What it does.** It reads **each ADR document's own `Status:` line** — never a
hand-maintained list — and fails when an ADR whose document says `Proposed` is
cited from **shipped source** (a non-Markdown, non-spec, non-fixture file under
`packages/<pkg>/src/`), unless a dated entry covers it.

**Why it is not a second copy of `maxProposedCitedFromCode`.** That ceiling is a
**number**; this list is a set of **names**. With the ceiling at 3, accepting one
ADR while one *new* unsigned decision becomes load-bearing in the same release
leaves the arithmetic at 3 — equal to the ceiling, **silently green**. The next
decision would become load-bearing exactly the way these three did. The named
list refuses it. Proven by fixture:
`adr-status.spec.ts` → *"a swap that keeps the arithmetic ceiling intact still
fails"*, which asserts the arithmetic is still 3 and the gate fires anyway.

**It fails closed.** Six rules, each with a named reason: `no-documents` (an
empty scan is a lost input, never a clean bill of health), `unreadable-status`
(a missing `Status:` line, or a word outside
`Proposed|Accepted|Rejected|Superseded|Deprecated`, fails rather than quietly
meaning "not Proposed"), `proposed-cited`, `grandfather-discharged`,
`grandfather-uncited`, `grandfather-unknown`, plus `grandfather-date`,
`grandfather-entry` and `grandfather-ceiling` on the list's own shape.

**The grandfather list empties itself.** `maxGrandfathered` must **equal**
`entries.length`, so a fourth entry is a visible, reviewable edit — and a fourth
entry means a fourth decision has become load-bearing while unsigned, which is a
decision to raise, not a line to add. `grandfather-discharged` fires the moment a
listed ADR's status changes, so the day an owner signs, the gate is red until the
entry is deleted and the ceiling lowered in the same change.

### 8.1 The seeded-change proof

Run against a **scratch copy** of `docs/adr/` in the session scratchpad. The real
documents were never edited, even temporarily.

| Seed | What was changed, in the copy | Result |
|---|---|---|
| — (baseline) | nothing | `documents=3 proposed=[ADR-18,ADR-19,ADR-20] accepted=[] proposedCitedFromShippedSource=3` · **exit 0** |
| **A** | ADR-19 `Proposed` → `Accepted` | `proposed=[ADR-18,ADR-20] accepted=[ADR-19] proposedCitedFromShippedSource=2` · **exit 1**, `[grandfather-discharged]` naming *"lower maxGrandfathered to 2"* and *"also lower maxProposedCitedFromCode"* |
| **B** | ADR-20's status word → `Ratified by acclamation` | **exit 1**, `[unreadable-status]` — an unknown word is a red, not a silent "not Proposed" |
| **C** | ADR-18's `Status:` line deleted | **exit 1**, `[unreadable-status]` |
| **D** | an **empty** ADR directory | **exit 1**, `[no-documents]` + 3 × `[grandfather-unknown]` — the false-green failure mode is closed |

**Restore, byte-identical, both sides:**

```
sha256sum docs/adr/*.md > before.sha256      # taken BEFORE any seeding
… seeds A–D run against the scratch copy only …
sha256sum -c before.sha256                    # docs/adr/ADR-18…: OK · ADR-19…: OK · ADR-20…: OK  → exit 0
diff before.sha256 <(sha256sum scratch/adr-seed/*.md | sed 's#scratch/adr-seed/#docs/adr/#')   # no output
git status --short docs/adr | wc -l           # 0
```

### 8.2 Reproduce everything in this packet

```bash
cd ui/dzup-ui
git log -1 --format='%H %s'                                     # 4e4e46f… — every number above is bound to this
node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"   # COUNT it: 56
grep -h -m1 -i 'status' docs/adr/ADR-18-*.md docs/adr/ADR-19-*.md docs/adr/ADR-20-*.md
node -e "console.log(require('./packages/tooling/scripts/adr-registry.json').maxProposedCitedFromCode)"   # 3
node -e "console.log(require('./packages/tooling/src/validators/adr-status-grandfather.json').maxGrandfathered)" # 3
yarn validate:adr-references; echo "exit $?"                    # 0 — prints 17 cited / 3 documented / 14 registry-only
yarn validate:adr-status;     echo "exit $?"                    # 0 — prints per-ADR shipped-source counts
node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/adr-status.spec.ts; echo "exit $?"   # 0 — 25/25
yarn validate:engines;        echo "exit $?"                    # 0
yarn validate:anatomy-parts;  echo "exit $?"                    # 0 — 622 / 142 / 47 / 104
find packages/core/src -name '*.anatomy.ts' | wc -l             # 104
grep -rl 'ui?:' packages/core/src --include='*.types.ts' | wc -l # 90
grep -rn "globSync" packages/ --include='*.ts' --include='*.mts' | grep "node:fs"   # 2 — ADR-18's C10, wider than reported
```

> `npx` is **not** used anywhere above. In this repository `npx` fetches
> dependency-confusion placeholders that exit 0 without running — a silent false
> green. Invoke binaries by module path (`node node_modules/tsx/dist/cli.mjs …`)
> or through `yarn`, which works here.
