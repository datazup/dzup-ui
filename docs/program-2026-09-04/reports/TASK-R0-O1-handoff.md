# TASK-R0-O1 — Publication decision packet and the consolidated owner-decision register

**Status:** `[!]` — **the packet is done; the decision is the owner's.** A4-D1 is `open`.
**Date:** 2026-09-22 · **Commit observed:** `527dbd1` (`git rev-parse HEAD`), **278 uncommitted paths**
**Conventions:** `docs/program-2026-09-04/README.md` §4, §5 `<repo_conventions>`

---

## 1. `<done_check>` versus reality

Run first, as the protocol requires. **All three checks failed; the task ran in full.**

| Check | Expected | Measured 2026-09-22 | Outcome |
|---|---|---|---|
| `ls …/owner-decision-register-2026-09.md` and `grep -c '^\| '` ≥ 100 | file exists, ≥ 100 rows | **file did not exist** | ❌ ran |
| `ls …/reports/ \| grep -i 'publication-decision'` | packet exists | **no match** | ❌ ran |
| `grep -n 'A4-D1' …register…` shows `decided`/`open` | either | **no file** | ❌ ran |

**The check is weak in the way the brief predicted.** `grep -c '^| '` counts
table rows of any kind — 100 empty rows, or the header separators of twenty
tables, would satisfy it. It is now satisfiable honestly (**348 rows**), but
completeness was judged by **source coverage**, not row count: every decisions
section of all **21** `program-2026-09` handoffs and all **28**
`program-2026-09-04` reports was read and is represented.

**A fourth, latent weakness:** the check's third clause treats `A4-D1` = `open`
as *"the packet is done, the decision is not"*. That is correct **only because
this task also wrote the packet**. The same clause would pass over a register
that merely *mentions* `A4-D1` with no packet behind it. The state and the
packet are separate facts and the check conflates them.

---

## 2. Files written — the only three things this task changed

**This task was read-only on the repository except for its own documents.** No
source, no generated artifact, no changeset, no config, no package version.

| Path | What | Lines |
|---|---|---|
| `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` | **New.** 298 decisions consolidated, 217 open, grouped by what they gate; 348 table rows | 649 |
| `docs/program-2026-09-04/reports/publication-decision-packet-2026-09.md` | **New.** A4-D1 packet: three costed options, the 36-changeset level audit, the withheld-package cost, the D1 proof, the `generate:exports` drift, the re-levelling proposal, an 11-step sequenced checklist | — |
| `docs/program-2026-09-04/reports/TASK-R0-O1-handoff.md` | **New.** This document | — |
| `docs/program-2026-09-04/EXECUTION-STATUS.md` | **Modified.** One `TASK-R0-O1` row appended to the status table | +1 |
| 5 predecessor ledgers | **Modified.** One pointer line appended to each owner-decision section (append-only; no history rewritten) | +5 |

**API effect: none.** Nothing importable changed.

---

## 3. Focused validation — what was run, read directly

Per the lane rule, **no gate result was read through a pipe**; every command
wrote to a log file and the exit code was read from `echo "exit $?"`.

| Command | Exit | Result |
|---|---|---|
| `git rev-parse HEAD` | 0 | `527dbd150036b5f07bd69e672825ff14ec3a592d` |
| `git status --porcelain \| wc -l` | 0 | **278** uncommitted paths — R1 work preserved, nothing cleaned |
| `yarn validate:release-policy` | **0** | *"`changeset status` assembles; 6 published, 2 withheld, 5 private of 13 workspace packages; **36 pending changeset(s)**, 0 major, 0 mixed; changelog-format collisions at the ceiling of 1"* |
| `ls .changeset/*.md \| grep -v README \| wc -l` | 0 | **36** |
| `git ls-tree --name-only 527dbd1 .changeset/` | 0 | **36** — committed and working tree agree; `.changeset/` is clean |
| `node -e "…scripts['validate:all'].split('&&').length"` | 0 | **50** links |
| table-integrity check over both new documents | 0 | **0** column mismatches |

**Not run, deliberately:** `yarn validate:all`, `yarn test`, `yarn build`. This
task changes no code, so an aggregate run would measure the six R1 packets'
uncommitted work, not this one — and would have taken the tree's only worktree
for ~20 minutes to produce a number already recorded at this commit by R1-O1.
**This packet therefore makes no aggregate-qualified claim.** The three lanes'
states are cited from their owners: `validate:all` 50 links, `yarn test` green
(10,478 passed), `validate:peers` **exit 1 by design** — R1-O6's icon-duplicates
gate is red because the defect is real and unwaived.

**`changeset version` was not run**, on the tree or in a scratch copy. R1-O1's
`<d1_proof>` is complete, current at this exact commit, and reproducing it would
have been work for its own sake. See packet §5.

---

## 4. Aggregate qualification

**None claimed.** No new red, no new green. Nothing this task did can move a
gate, because nothing it wrote is read by one.

Pre-existing state, cited not measured:

- `validate:peers` — **exit 1, by design** (R1-O6's icon-duplicates gate; **D174** is the decision).
- `ci.yml` — **not green since 2026-07-03** (R1-O4); three jobs load a test config with nothing built (**D161**).
- The tree — **278 uncommitted paths**; every metric in both documents is bound to `527dbd1` and none is release evidence.

---

## 5. Ratchet movements

| Ratchet | Old | New | Note |
|---|---|---|---|
| Owner decisions consolidated in one place | **0** (scattered over 3 ledgers + 49 reports) | **298** | the register |
| Open owner decisions, **counted** rather than estimated | *"~125"* (README §7, an estimate) | **217** | §6 below |
| Decision-id namespaces documented | 0 | **3** (defect · 09-04 global · per-report local) | register §7.1 |
| Changesets audited against `VERSIONING.md` | **16** of 36 | **36** of 36 (20 at first-pass depth) | packet §3.2 |
| Known changeset level errors running in the *unsafe* direction | *"0 under-declared"* (N5-01) | **1 candidate** (`the-six-cascade-layers-…`) | packet §3.2 #33 |
| Contradictions between ledgers, recorded | 0 | **7** | register §7 |

**No existing ratchet moved**, because no measured artifact changed.

---

## 6. The two false premises, and the real numbers

**The `_Gap:_` preamble is a hypothesis, and both of its numbers are wrong.**

### 6.1 "~125 open `[!owner]` items" → **298 raised, 217 open**

| Source | Raised | Open |
|---|---|---|
| `program-2026-09` — N0/N1/N2/N5 ledgers + 21 handoffs | **158** | 113 |
| `program-2026-09-04` — global `D1`–`D178` (`D43`/`D44` never issued ⇒ **176** exist) | **176** | 140 |
| Less N-items an 09-04 id supersedes (one row, two ids) | −36 | −36 |
| **Distinct** | **298** | **217** |

README §7's estimate **understates the N-programme alone by 33** and the whole
backlog by a factor of two — it predates the 176-decision 09-04 programme.

### 6.2 "the 20 pending changesets" → **36**

Three independent measurements agree (§3). **Three different counts are quoted
across the programme and all three are wrong today:** N5-01's **16** (right on
2026-09-03), `release-exit-tasks.md`'s **20**, and R1-O1 §7's **37** (it counts
`.changeset/README.md`).

**The consequence is not cosmetic: 20 changesets have never been audited against
`VERSIONING.md`**, and auditing them (packet §3.2) found 2 further
over-declarations and — more seriously — **1 candidate under-declaration**, the
first error in 36 running in the unsafe direction.

---

## 7. Contradictions found — recorded, none resolved

Full detail in register §7. Seven, of which four matter:

1. **🔴 The `D<n>` id collision.** `D8`, `D9`, `D10`, `D11` each name **both** a
   defect and an owner decision **inside the same programme**, unqualified.
   105 definition sites across eleven ids. README §6's *"D8 controlled/uncontrolled"*
   is the defect; `EXECUTION-STATUS.md`'s decision row `D8` is the
   `validate:exports` gap. It is already causing mis-citation: decision rows
   `D98`/`D99` open with `**D4 --` and `**D10 --`, meaning the *defects*.
   **Recommendation: namespace (`DEF-8` / `OD-8`) or qualify every citation.
   Do not renumber** — 178 decisions cite these ids.
2. **🔴 The Node floor.** `N5-04 D3` says `>=22.13.0`; **`D160`** says keep
   `^20.19.0 || >=22.13.0`; **`D176`** says `>=22.13.0` and **explicitly differs
   from D160**. R1-O4 and R1-O6 landed the same day at the same commit; neither
   is stale. **And whichever is chosen, `getTextInfo()` needs Node 24, which
   makes ADR-20 §4 wrong as written** — an amendment currently in nobody's scope
   (see **D181**).
3. **🟠 `D175` re-levels `N5-04 D2`.** The icon swap was recommended as a
   no-public-API-change (`patch`); D175 re-levels it to `minor` on three measured
   consumer-visible changes. Both records stand.
4. **🟠 `A4-D2` and `D166` are the same decision raised twice**, both open — a
   duplicate, not a conflict. Recorded as one row with two ids.

---

## 8. Owner decisions raised — numbered from **D178**

Eight new. **None is taken.**

| # | Decision | Options | Recommendation | Gates |
|---|---|---|---|---|
| **D179** 🔴 | **Namespace the `D<n>` ids.** `D8`–`D11` each name a defect *and* a decision in the same programme; 105 definition sites across 11 ids; the ledger already mis-cites itself (§7.1) | (a) prefix the namespaces (`DEF-8` / `OD-8`) going forward, leave existing ids alone · (b) qualify every cross-report citation as the 09 programme already does (`N5-01 D1`, `A4-D3`, `S1-D4`) · (c) renumber one namespace · (d) leave it | **(a) + (b).** **(c) rejected** — 178 decisions and 49 reports cite these ids; renumbering breaks every citation to buy tidiness. Leave the `D43`/`D44` gap as a gap for the same reason | every cross-report citation; the register's own usability |
| **D180** 🔴 | **Who audits the 20 never-audited changesets, and is `the-six-cascade-layers-…` under-declared?** N5-01 audited 16 of 36. This task's first pass found 2 over-declarations and **1 candidate under-declaration** | (a) accept this packet's first pass and re-level 13 · (b) commission a full audit of all 36 to N5-01's depth before any release · (c) re-level only N5-01's 11 and ship | **(b) for #33 specifically, (a) for the rest.** #33 is the only error in 36 that may run in the **unsafe** direction: if declaring the three cascade layers changes precedence for existing consumer overrides, a `patch` pushes a break into every consumer's next `yarn install` unannounced — the exact failure `VERSIONING.md` §1 exists to prevent. **(c) is worse than doing nothing** | **N5-01 D3**; the first `changeset version`; every consumer on `^0.2.0` |
| **D181** 🔴 | **The ADR-20 §4 amendment has no owner.** Both `N5-04 D3` and `D176` record that `getTextInfo()` needs Node 24, not 22.13 — so ADR-20 §4 and its "Alternatives considered" are wrong **whichever Node floor is chosen**. TASK-R0-O2's scope as written covers ADR-18/19/20 *acceptance*, not this correction | (a) widen TASK-R0-O2 to carry the §4 correction · (b) a separate amendment packet · (c) accept the ADRs with a known-wrong §4 and correct later | **(a)** — accepting an ADR whose §4 is known wrong makes the acceptance itself unciteable, and the correction is two sentences. **(c) rejected outright** | ADR-20 acceptance (**R0-O2**); criterion **C10**; the Node-floor decision (**D160**/**D176**) |
| **D182** 🟠 | **`VERSIONING.md` §3 requires artifacts the release policy forbids shipping.** §3 clause 2 names `warnDeprecated` in **`@dzup-ui/compat`** and clause 3 names a codemod in **`@dzup-ui/codemods`** — both permanently unreleasable (**N5-01 D2**). `.changeset/nine-aria-props-that-did-nothing-are-gone.md` already ships a prop removal whose migration codemod no consumer can install | (a) release both withheld packages · (b) keep withholding and **amend §3** to name obtainable artifacts · (c) keep both as they are | **(b) at minimum, in the same change as whichever way N5-01 D2 goes.** A policy that mandates an artifact the policy forbids distributing is unsatisfiable by construction, and it is currently unsatisfied in a shipped changeset | **N5-01 D2**; `VERSIONING.md` §3; every future prop removal |
| **D183** 🟠 | **Is this register the system of record, and do the ledgers stop restating decisions?** Five ledgers now point at it. Without a rule, the next programme re-derives 298 decisions — which is the failure this task exists to end | (a) register is authoritative; ledgers link, never restate; new decisions are appended here at the packet that raises them · (b) ledgers stay authoritative and the register is a snapshot that goes stale · (c) fold the register into `EXECUTION-STATUS.md` | **(a)**, with the rule written into README §5's `<handoff>` block so every future packet appends here. **(b) makes this document a liability within one programme** — a stale consolidated register is worse than none | the next programme's cost of entry |
| **D184** 🟠 | **Correct README §7 and `release-exit-tasks.md`'s stale numbers?** README §7 says *"~125"* (real: **298 raised / 217 open**); TASK-R0-O1's `_Gap:_` and `<validation>` say *"20 changesets"* (real: **36**); R1-O1 §7 says *"37 changesets"* (it counted the README) | (a) correct all three in place, citing this register · (b) leave them and rely on the register · (c) correct only the task files a future agent executes | **(a)** — a `<validation>` block that says `20 expected` will make the next agent think the gate is broken. This task did **not** edit them: amending another packet's prompt is outside its scope | future agents' first five minutes |
| **D185** 🟢 | **Retire Option C (private registry) from the publication options?** It is dominated: its rehearsal value is largely available from **D150** (an `--install` variant of R1-O2's existing import gate) and it leaves all four consumer surfaces untrue | (a) record it as a standing refusal with this reasoning · (b) keep it on the table · (c) build it | **(a)**, folded into README §8's standing refusals — but **A4-D1 explicitly names three options, so this is the owner's to close, not this packet's** | A4-D1's option set; README §8 |
| **D186** 🟢 | **Three MCP changesets are still unwritten on an expired reason.** `N2-A1 D3`, `N2-A2 D5` and `N2-A3 D1` each describe a behaviour change to the published `@dzup-ui/mcp` and each deferred its changeset *"because N5-01 owns changelog reconciliation and 17 changesets are already unreleased"* | (a) write the three changesets now · (b) fold them into one `@dzup-ui/mcp: minor` · (c) accept the changes ship unannounced | **(b)** — one changeset naming all three behaviour changes. **The stated reason has expired**: N5-01 closed on 2026-09-03, and there are now 36 changesets, none of which covers these | `@dzup-ui/mcp`'s changelog; **N5-01 D7**; criterion C15 |

---

## 9. Ranked next packet

1. **🔴 Commit the tree.** 278 paths. It is step 2 of the packet's checklist and
   it blocks `release:api-surface:record` (**D157**), the browser/AT evidence
   (**N1-O2 D8**, **N1-O3 D9**, **N1-O4 #2**) and any claim that a published
   artifact is reproducible. **Owner action; no prompt authorises it.**
2. **🔴 Take A4-D1 from the packet.** It is decidable in one sitting and eleven
   other decisions are sequenced behind it.
3. **🔴 Take D158** (`generate:exports`). **All three options are cheap today and
   only one is cheap after publication.** Three independent measurements agree on
   the drift; what is missing is the intent, which no tool can read.
4. **🟠 Apply the N5-01 D1 fix — (a)+(b), ~20 lines.** Worth taking even under
   Option B: it is the difference between a release path never run and one known
   to work.
5. **🟠 Resolve the Node floor (D160 vs D176) and carry the ADR-20 §4 correction
   with it (D181).** Two decisions, one amendment, or the ADRs cannot honestly
   be accepted by R0-O2.
6. **🟠 Audit-then-re-level the changesets (D180 → N5-01 D3)**, before
   `changeset version`, never after.
7. **🟢 Namespace the ids (D179)** and write the register's maintenance rule
   (**D183**) into README §5. Cheap, and it is what stops the next programme
   re-deriving 298 decisions.

---

## 10. What this task deliberately did not do

- **Took no decision** — not A4-D1, not N5-01 D1/D2/D3, not D158, not the Node
  floor. `<stop_conditions>`: *stop at the packet.*
- **Resolved no contradiction.** All seven are recorded with both sides.
- **Edited no changeset**, ran **no `changeset version`** (on the tree or in a
  scratch copy — R1-O1's proof is current at this commit), **published nothing**,
  **mutated no registry**, **queried and changed no DNS**.
- **Did not run `build:registry`** — it `rm -rf`s 282 tracked files (**D171**).
- **Did not build or configure a private registry** — described only, per
  `<stop_conditions>`.
- **Did not edit `README.md` §7 or `release-exit-tasks.md`** despite proving
  their numbers stale — amending another packet's prompt is outside scope, so it
  is raised as **D184** instead.
- **Did not rewrite any predecessor ledger's history** — five pointer lines were
  **appended**, nothing else.
- **Did not run the aggregate gates.** This packet makes **no
  aggregate-qualified claim**; every cited lane state names its owning report.
