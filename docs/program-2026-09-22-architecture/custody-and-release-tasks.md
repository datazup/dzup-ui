# dzup-ui — Custody, truth and release tasks (S0, S2)

> Part of the [Architecture Review Program 2026-09-22](./README.md). Every
> prompt assumes the `<repo_conventions>` block in [README §5](./README.md#5-how-these-tasks-are-written)
> and the check-first protocol in [README §4](./README.md#4-how-to-run-a-task--the-check-first-protocol).
>
> **Sources:** 08-11 reassessment doc 06 (§"API compatibility and deprecation",
> §"Supply chain") and doc 08 (the maturity ladder L0–L7, the per-change
> validation matrix, the **package qualification matrix**, the eleven **release
> stop conditions**, the eight-section **required release report**); 08-28
> roadmap N0 (custody), N5-R1/R2/R3 (0.x statement, 1.0 exit, REL execution)
> and doc 01 §A2 ("any document that quotes a metric must bind it to a commit");
> the 2026-09-04 R0/R1 handoffs and the owner-decision register. Every number
> below is bound to `main` @ `589be13` — re-measure before you quote it.
>
> **The rule that governs this file:** a number that is not bound to the commit
> it was measured at is not evidence. S0-O1 exists so that every other task in
> this programme can cite something. Nothing in S2 may raise a threshold, widen
> an exception or relabel a maturity level to make a gate pass.
>
> **Ordering:** S0-O1 first, always. S0-O3 after S0-O1 (an ADR cannot be
> accepted against an unbound tree). S2-O1 and S2-O2 after S0-O1 and may run in
> parallel under separate agents. S0-O2, S2-O3 and S2-O4 end in owner decisions.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## 🔴 Make the tree citable

### [ ] TASK-S0-O1 — Re-bind the generated authority to HEAD and prove the committed tree green 🔴

_Gap: every generated artifact in the repository stamps `sourceCommit 527dbd1`
— **HEAD's parent**. `589be13` changed tracked source and documentation after
that stamp, so the ownership manifest, the quality matrix, the capability
matrix, `component-meta.json`, the RTL matrix, `llms{,-full}.txt` and every
generated docs page describe a tree that is no longer checked out. The 08-11
release stop conditions list "evidence bound to a different commit /
configuration" as a hard stop, and 08-28 doc 01 §A2 makes commit-binding the
programme's standing rule after the 08-11 findings were invalidated wholesale
by exactly this. Separately, the 2026-09-04 R1-O1 handoff proved the tree green
**on a dirty worktree** — the owner has since committed it, so the "green from
a clean committed tree" claim has never actually been made. Sources: 08-11
doc 08 §"Release stop conditions"; 08-28 doc 01 §A2, doc 06 N0-05;
`../program-2026-09-04/reports/TASK-R1-O1-handoff.md`,
`TASK-R2-O1-handoff.md` (residual: "re-run from the clean committed tree" was
structurally impossible at the time)._

```xml
<role>You are a build-and-evidence engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You regenerate artifacts and run gates; you do not change component behaviour, and you do not commit.</role>

<task>Make every generated artifact and every gate result in this repository bind to HEAD. (1) Regenerate the generated authority in the declared order (ownership → quality → capability → component-meta → llms → docs-pages → playground seeds) and confirm each output's `sourceCommit` equals HEAD. (2) Run `yarn validate:all` end to end from the clean committed tree, read the exit code directly, and record every link that fails with its link number, the command, and whether the failure is pre-existing or newly introduced by the regeneration. (3) Run `yarn typecheck`, `yarn lint`, `yarn test` and `yarn build` the same way. (4) Produce a one-page **tree-truth record** that states, for `589be13` (or whatever HEAD is when you run): the artifact stamps, the aggregate result, the per-link failures, the ratchet values, and the exact commands with their exit codes. (5) Run `yarn changeset version --snapshot` in a throwaway worktree copy to prove or disprove the recorded `validate:changelog` ⇄ `validate:mcp` conflict, and record the result for TASK-S0-O2.</task>

<motivation>Every other task in this programme quotes a number. Until the artifacts and the aggregate agree with the checked-out tree, every one of those numbers is a claim about a tree that no longer exists — which is precisely the failure the 08-11 reassessment suffered and 08-28 doc 01 §A2 forbids. This task is cheap, it is mechanical, and nothing downstream is admissible without it.</motivation>

<done_check>
  Run from ui/dzup-ui. If all four pass, record `[x] found-done <date>` in EXECUTION-STATUS.md and move to TASK-S1-O2.
  - `H=$(git rev-parse HEAD); node -e "const m=require('./packages/core/manifests/component-ownership.manifest.json');process.exit(m.sourceCommit==='$H'?0:1)"; echo "ownership bound: $?"` → 0.
  - The same check for `packages/core/docs/quality-matrix.json`, `packages/core/docs/capability-matrix.json` and `packages/core/docs/component-meta.json` → 0 each.
  - `git status --porcelain | wc -l` → 0 **before** you start (if not, the dirty work belongs to someone else — preserve it and say so in the handoff).
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S0-O1-tree-truth-*.md` → a record exists whose filename carries the current HEAD's short sha.
</done_check>

<discovery>
  1. `git log -1 --format='%h %s'` and `git status --porcelain` — capture the exact commit and dirty state before touching anything. If the tree is dirty, the work is someone else's: preserve it, note the path count, and state in the handoff that the "clean committed tree" clause could not be honoured.
  2. Read `../program-2026-09-04/reports/TASK-R1-O1-handoff.md` for the list of links that were red at `527dbd1` and why. A link that was red then and is red now is **pre-existing**; a link that was green then and is red now is **caused by this regeneration** and must be fixed or explained before the task ends.
  3. Read the generator entry points under `packages/tooling/src/` to confirm the regeneration order and which generators read which artifact. A generator that consumes a stale input produces a stale output that *looks* fresh.
  4. Note the harness hazards recorded for this repository: `yarn` binaries resolve here but browser lanes write nothing until they finish — never conclude "hung" from an empty log; and never read a gate result through a pipe, because the pipe returns the last stage's status.
</discovery>

<requirements>
  <scope>Regeneration and measurement only. No component source changes. If a regeneration reveals a component defect, file it in the handoff with a proposed task id and leave the code alone.</scope>
  <binding>Every artifact you touch ends with `sourceCommit` equal to HEAD and a generation timestamp. If an artifact has no `sourceCommit` field (for example `packages/core/perf/baselines.json`), add one through its generator — do not hand-edit the JSON.</binding>
  <honesty>Report tooling failures and component failures separately. Do not call the aggregate green over a red link. Do not raise a ratchet, widen an exception file or relabel a maturity level to get a pass — that is a recorded release stop condition.</honesty>
  <snapshot_probe>The `changeset version --snapshot` probe runs in a copy (`git worktree add` into the scratch directory, or a plain file copy outside the repo), never in the working tree, and its artifacts are discarded. Record only the observed conflict, not the versioned files.</snapshot_probe>
  <example>
    Tree-truth record shape (docs/program-2026-09-22-architecture/reports/TASK-S0-O1-tree-truth-&lt;sha&gt;.md):

    | Artifact | sourceCommit | equals HEAD | regenerated |
    |---|---|---|---|
    | component-ownership.manifest.json | 589be13 | yes | 2026-09-22 |

    | Gate | Command | Exit | Verdict |
    |---|---|---|---|
    | validate:all | `yarn validate:all` | 0 | green end-to-end, 50 links |
    | link 16 capability-matrix | `npx tsx packages/tooling/src/validators/capability-matrix.ts` | 0 | was red at 527dbd1 (12 stale cells) — now green |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;. Record HEAD, dirty state and the predecessor's red-link list.
  2. Regenerate in the declared order. After each generator, assert its output's `sourceCommit`; stop at the first one that will not bind and report why.
  3. Run `yarn typecheck`, `yarn lint`, `yarn test`, `yarn build`, then `yarn validate:all` end to end. Capture each to a file and read the exit code directly.
  4. Classify every failure as pre-existing or new. Fix only the new ones that your own regeneration caused.
  5. Run the snapshot probe in a copy; record the changelog/mcp result.
  6. Write the tree-truth record and the handoff; update EXECUTION-STATUS.md with the ratchet values you measured.
</steps>

<validation>
  yarn typecheck > /tmp/s0o1-typecheck.log 2>&1; echo "exit $?"
  yarn lint > /tmp/s0o1-lint.log 2>&1; echo "exit $?"
  yarn test > /tmp/s0o1-test.log 2>&1; echo "exit $?"
  yarn build > /tmp/s0o1-build.log 2>&1; echo "exit $?"
  yarn validate:all > /tmp/s0o1-validate-all.log 2>&1; echo "exit $?"   # read THIS code, never a pipe's
  node -e "const h=require('child_process').execSync('git rev-parse HEAD').toString().trim();for(const p of ['packages/core/manifests/component-ownership.manifest.json','packages/core/docs/quality-matrix.json','packages/core/docs/capability-matrix.json','packages/core/docs/component-meta.json'])console.log(p, require('./'+p).sourceCommit===h?'BOUND':'STALE')"
</validation>

<success_criteria>All four named artifacts bind to HEAD; the aggregate has been run end to end from a clean committed tree and its exit code is recorded with every failing link classified; the tree-truth record exists and carries HEAD's sha in its filename; the changeset-snapshot probe has a recorded yes/no answer for the changelog⇄mcp conflict; ratchets recorded old → new; no ratchet raised, no exception widened.</success_criteria>

<stop_conditions>Stop and report when the worktree is dirty with work you did not create (preserve it, state the path count, and run the measurement half only); when a regeneration would rewrite an artifact the owner has flagged as authority-held (`public-api.manifest.json`); when a newly red link needs a component change (file it, do not fix it here); when the snapshot probe would require a network publish.</stop_conditions>
```

---

## 🔴 Take the decisions that gate everything downstream

### [ ] TASK-S0-O2 — Refresh the owner-decision register and drive the publication decision 🔴 `[!owner]`

_Gap: the 2026-09-04 register recorded ~125 open `[!owner]` items and the
publication packet was delivered, but **A4-D1 (publish or freeze) was never
taken**, and eleven decisions are sequenced behind it. Meanwhile the facts the
packet rests on have moved: HEAD advanced by one commit, the changeset count
rose to 38, and the docs build moved. A decision packet whose numbers are
stale is not a decision packet. The 08-28 roadmap makes this N0-class work:
custody and standing decisions come before everything, and "nothing releases
while admission debt is open". Sources: 08-28 doc 06 N0, doc 01 §D (the
ten-item register); `../program-2026-09-04/reports/publication-decision-packet-2026-09.md`,
`owner-decision-register-2026-09.md`, `TASK-R0-O1-handoff.md`._

```xml
<role>You are a release-governance analyst in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You prepare decisions with evidence and options; you never take one, and you never publish.</role>

<task>Produce a decision-ready refresh of the owner register at the current HEAD. (1) Re-measure every fact the 2026-09-04 publication packet quotes (npm status of each published package, DNS state of the docs domain, changeset count, artifact binding, aggregate result) and mark each as confirmed, changed or unverifiable. (2) Rebuild the register as one table with a stable numeric id per decision, its status (open / taken / superseded / expired), what it blocks, the evidence link, the options with a recommendation, and the decision's *cost of delay*. (3) Collapse decisions that the last three weeks have already answered — a decision whose premise no longer exists is closed, not carried. (4) For A4-D1 specifically, state the three executable paths (publish now under the 0.x policy · publish a `0.x` prerelease tag only · freeze and keep qualifying) with, for each, the exact commands the owner would run, what becomes irreversible, and the rollback. (5) Record the `validate:changelog` ⇄ `validate:mcp` conflict result that TASK-S0-O1 measured, and recommend which validator yields.</task>

<motivation>Twelve tasks in this programme end in an owner decision. When the register is stale, the owner is asked to decide against numbers that have moved, so they reasonably decline — and the whole queue stalls. A register that re-measures cheaply and states cost of delay is the only artifact that converts a backlog of `[!]` rows into scheduled work.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `ls docs/program-2026-09-22-architecture/reports/owner-decision-register-*.md` → a register dated within the current programme exists.
  - `grep -c '^| [0-9]' docs/program-2026-09-22-architecture/reports/owner-decision-register-*.md` → the row count is ≥ the number of `[!]` rows in this programme's EXECUTION-STATUS.md.
  - `grep -n 'A4-D1' docs/program-2026-09-22-architecture/reports/*.md` → A4-D1 appears with a status that is **not** `open`, or with a dated re-measurement of its evidence.
  - Each fact in the register that is a number carries a commit or a date and a command that reproduces it.
</done_check>

<discovery>
  1. Read `../program-2026-09-04/reports/owner-decision-register-2026-09.md` and `publication-decision-packet-2026-09.md` in full. Note which facts were measured and how — you are re-running those measurements, not re-deriving the analysis.
  2. Read this programme's EXECUTION-STATUS.md and the ledgers of this repository's other programmes (`../program-2026-09-04/`, `../program-2026-09/`, `../program-2026-09-22-planning/`), and extract every `[!]` row and every "owner decision raised" line. The register must be a superset of this repository's open decisions and must contain nothing that belongs to another repository.
  3. Re-measure: `npm view <pkg> version` for each published package (expect 404 — record the exact response), the docs domain's DNS answer, `ls .changeset/*.md | wc -l`, and artifact `sourceCommit` values.
  4. Read `packages/contracts/VERSIONING.md` and `packages/tooling/scripts/release-policy.json` so the A4-D1 paths use the policy's own vocabulary.
</discovery>

<requirements>
  <authority>Read-only on everything but this task's own documents. No publish, no `npm` mutation, no DNS change, no commit, no changeset consumption. Network calls limited to read-only registry and DNS lookups.</authority>
  <register_shape>One table, one row per decision, stable ids that survive into the next programme. Columns: id · decision · status · blocks · evidence · options · recommendation · cost of delay · opened · last re-measured.</register_shape>
  <closure>A decision whose premise is gone is marked `superseded` with the reason and the commit that removed the premise. Do not carry dead rows forward; carrying them is how the list reached 125.</closure>
  <no_decision>You recommend. You never write "decided". If the owner has recorded a decision elsewhere, cite the artifact where they recorded it.</no_decision>
  <example>
    | 1 | A4-D1 publish or freeze | open | S2-O3, S2-O4, S5-O2 | npm 404 ×6 (2026-09-22), 38 changesets | (a) publish 0.x · (b) prerelease tag only · (c) freeze | (b) — proves the pipeline without a supported surface | high: 38 changesets accrue drift per week | 2026-09-04 | 2026-09-22 |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; re-measure every quoted fact and tabulate confirmed / changed / unverifiable.
  2. Rebuild the register; mark superseded rows and state why.
  3. Write the A4-D1 three-path section with commands, irreversibility and rollback per path.
  4. Fold in the changelog⇄mcp result from TASK-S0-O1 with a recommendation.
  5. Hand off with the register path, the count of rows opened/closed/superseded, and the three decisions whose cost of delay is highest.
</steps>

<validation>
  ls docs/program-2026-09-22-architecture/reports/owner-decision-register-*.md; echo "exit $?"
  grep -c '^| [0-9]' docs/program-2026-09-22-architecture/reports/owner-decision-register-*.md
  git status --porcelain | wc -l     # only this task's documents may appear
</validation>

<success_criteria>Register exists at the current HEAD with stable ids; every numeric fact carries a reproducing command and a date; superseded rows are closed with reasons; A4-D1 has three executable paths with rollback; the changelog⇄mcp recommendation is recorded; the handoff names the three highest cost-of-delay decisions.</success_criteria>

<stop_conditions>Stop and report when a re-measurement needs credentials or a private registry token; when a decision would be irreversible and the owner has not recorded an instruction; when a decision turns out to belong to another repository (record it as out of scope and drop it, do not carry it); when the register would exceed what one owner can read in one sitting (then split it into "blocking now" and "scheduled").</stop_conditions>
```

---

### [ ] TASK-S0-O3 — Execute ADR-18/19/20 acceptance 🟠 `[!owner signs]` (after S0-O1)

_Gap: ADR-18 (runtime floor and validator runner), ADR-19 (public styling
contract) and ADR-20 (provider contract) are all still `Proposed`, verified in
their own front matter at `589be13` — while 104 anatomy files, all six cascade
layers, ten provider composables, the `ui` override prop on 90 types and the
entire Nuxt/resolver runtime build on them. The 08-28 roadmap makes this N0-03
("code is building on `Proposed` decisions"), and the 08-11 quality spec makes
an accepted decision a precondition for calling a contract public. The
engineering half is complete — acceptance packets exist and the 2026-09-04
R0-O2 handoff closed every divergence — so what remains is the ratification
act, plus the one open input ADR-18 still needs (the Node floor decision).
Sources: 08-28 doc 06 N0-03, doc 01 §D2; `docs/adr/ADR-{18,19,20}-*.md`;
`../program-2026-09/reports/N5-05-adr-{19,20}-acceptance-packet.md`;
`../program-2026-09-04/reports/TASK-R0-O2-handoff.md`._

```xml
<role>You are an architecture-governance engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You prepare a ratification act that an owner can execute in one sitting; you do not change an ADR's status yourself.</role>

<task>Produce a single ratification packet for ADR-18, ADR-19 and ADR-20 that an owner can act on without reading the programme history. For each ADR: (1) re-verify at HEAD that the code matches the decision as written, listing every divergence with file and line (expect zero for ADR-19/20 after R0-O2 — prove it, do not assume it); (2) state the consequences section as it will read once accepted, including the ratchets the acceptance freezes; (3) list what acceptance makes binding that is not binding today (which validators would start refusing what); (4) name the open inputs — for ADR-18 the Node floor decision, for ADR-19 the `data-scope` equivalent, for ADR-20 the sanitizer-seam amendment — with a recommendation each. Then add a gate: a validator that fails when a `Proposed` ADR is cited by shipped source, so the next ADR cannot silently become load-bearing.</task>

<motivation>An ADR that is `Proposed` while 104 files implement it is not a decision record — it is a rumour with a number. The cost is real and already measured: a consumer reading ADR-19 cannot tell whether `data-part` is a contract or a draft, and the 08-11 spec's "stable public semantics" promise cannot be made over a proposal. The gate matters more than the three signatures: it prevents this exact state recurring with ADR-21.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `grep -h -m1 -i 'status' docs/adr/ADR-18-*.md docs/adr/ADR-19-*.md docs/adr/ADR-20-*.md` → if all three read `Accepted`, the ratification happened; record `[x] found-done` and run only the gate half.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S0-O3-ratification-packet.md` → the packet exists.
  - `node -e "console.log(Object.keys(require('./package.json').scripts).filter(k=>k.includes('adr')).join(','))"` → an `validate:adr-status`-shaped script exists and is chained into `validate:all`.
  - `npx tsx packages/tooling/src/validators/<adr validator>.ts; echo "exit $?"` → runs and reports which ADRs are cited by shipped source while `Proposed`.
</done_check>

<discovery>
  1. Read all three ADRs in full plus the two acceptance packets and the R0-O2 handoff. The packets did the divergence analysis; your job is to re-verify it at HEAD, not to repeat it.
  2. Count the citations: `grep -rn 'ADR-19' packages/ --include='*.ts' --include='*.vue' | wc -l` and the same for 18 and 20. That count is the blast radius and belongs in the packet.
  3. Read `packages/tooling/scripts/adr-registry.json` and the existing `validate:adr-references` (if present) — the new status gate extends that machinery rather than adding a second registry.
  4. Check whether ADR-18's Node floor input has since been answered anywhere (the Nuxt Node-20 drop is on the watch list); if it has, the ADR-18 blocker may be gone.
</discovery>

<requirements>
  <scope>Documentation, verification and one validator. No ADR status edits — changing `Proposed` to `Accepted` is the owner's act, and the packet must say so on its first line.</scope>
  <gate>The new validator reads the ADR registry and the source citations. It fails when an ADR with status `Proposed` is cited from `packages/*/src/`. It must be chained into `validate:all` and must ship with a spec that proves it fires (seed a `Proposed` ADR citation in a fixture).</gate>
  <grandfather>ADR-18/19/20 themselves will fail the new gate on the day it lands. Ship the gate with an explicit, dated, three-entry grandfather list and a note that accepting the three ADRs empties it — do not ship a permanently expandable allowance.</grandfather>
  <example>
    Packet section shape, per ADR:

    ### ADR-19 — public styling contract
    - Status today: `Proposed` (2026-08-20) · citations in shipped source: 214 across 96 files
    - Divergences at 589be13: **0** (verified: six layers present in packages/tokens/src/layers.css:1; `data-part` spelling in 104 anatomy files; `ui?:` on 90 types)
    - Acceptance makes binding: validate:anatomy-parts ratchet freeze at N; `data-part` rename becomes a 0.x minor
    - Open input: `data-scope` equivalent — recommendation: defer, record as ADR-19 amendment slot
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; re-verify divergences at HEAD for all three ADRs.
  2. Write the ratification packet: one section per ADR in the shape above, plus a combined "what the owner does" checklist.
  3. Implement the ADR-status gate + spec; chain it into `validate:all`; prove it fires with a seeded fixture.
  4. Run the narrow validation, then the aggregate; report the new link count by counting it.
  5. Hand off with citation counts, divergence counts, and the grandfather list's expiry condition.
</steps>

<validation>
  npx tsx packages/tooling/src/validators/&lt;adr-status validator&gt;.ts; echo "exit $?"
  yarn test packages/tooling/src/validators; echo "exit $?"
  yarn validate:all > /tmp/s0o3-validate-all.log 2>&1; echo "exit $?"
  node -e "console.log('validate:all links',require('./package.json').scripts['validate:all'].split('&&').length)"
</validation>

<success_criteria>Packet exists and states on line 1 that acceptance is the owner's act; zero unexplained divergences for all three ADRs at HEAD, each with file:line evidence; ADR-status gate implemented, spec-proven, chained, with a three-entry dated grandfather list; aggregate link count recounted and reported; no ADR status edited by the agent.</success_criteria>

<stop_conditions>Stop and report when a divergence is found that needs a component change (file it as a task, do not fix it inside the packet); when ADR-18's Node floor input is still genuinely open (mark ADR-18 blocked and deliver 19/20); when the grandfather list would need a fourth entry (that means a fourth ADR is already load-bearing while `Proposed` — raise it as a decision).</stop_conditions>
```

---

## 🟠 Build the consumer-truth and release contracts the specs require

### [ ] TASK-S2-O1 — Complete the package-qualification matrix 🟠 (after S0-O1)

_Gap: 08-11 doc 08 §"Package qualification matrix" specifies twelve fixture
rows that must run **against packed artifacts in a temporary consumer
workspace, never only workspace links**. The 2026-08 P1-03 packet built the
tarball fixtures and the 2026-09-04 R1-O2 packet added the Node `import()`
gate over every published entry, so five rows are covered (ESM import and
declarations · Vite production build · Nuxt SSR + auto-import · resolver
ownership · CSS/token import order). **Seven rows have no fixture at all:**
individual-component tree-shaking with the optional engine separated; minimum
*and* current Vue/Reka peer versions; optional peer absent / incompatible /
installed; CSP + Trusted-Types consumer fixture; licence-or-entitlement failure
behaviour; tarball file/export/API diff; SBOM + vulnerability/licence report +
provenance/hash. Doc 06 §"Supply chain" repeats the last of these as a release
requirement. The peer-hygiene decisions (`lucide-vue-next` swap contract,
`reka-ui` optional-peer posture, Node 20 drop) are the same row's owner half and
were prepared but never taken. Sources: 08-11 doc 08 §"Package qualification
matrix", doc 06 §"Supply chain"; 08-28 doc 06 N5-R3;
`../program-2026-09-04/reports/TASK-R1-O2-handoff.md`, `peer-hygiene-decisions-2026-09.md`._

```xml
<role>You are a packaging engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You prove what a consumer actually receives; you never publish and you never install from a registry as a substitute for a local pack.</role>

<task>Close the seven uncovered rows of the package-qualification matrix, each as a runnable fixture that consumes a **packed tarball** in a temporary workspace. (1) Tree-shaking: a fixture that imports one component and asserts the built bundle excludes the rest, with the optional engine measured separately. (2) Peer matrix: build the fixture at the declared minimum Vue and Reka versions and at current, and fail on a mismatch. (3) Optional peer: three lanes — absent, incompatible version, installed — each asserting the documented degradation, not a crash. (4) CSP + Trusted Types: a consumer fixture that loads the built CSS and JS under a strict policy with a nonce and asserts no violation. (5) Entitlement/licence failure behaviour: assert the OSS packages carry correct licence metadata and that a missing Pro package produces the documented build-time diagnostic. (6) Tarball diff: generate the file/export/API diff between the packed artifact and the reviewed build, and gate on undeclared files or entry points. (7) Supply chain: generate an SBOM plus a vulnerability/licence report per release candidate, with exceptions requiring owner, expiry and reachability. Wire all seven into one `yarn qualify:package` lane and record which rows are green, which are red, and which cannot run without owner authority.</task>

<motivation>The 08-11 release stop conditions include "tarball differs from the reviewed build or has undeclared files or entry points" and "optional-peer path fails open". Neither can currently be detected: P1-03 already found a shipping defect (`tokens.css` unexported specifier) that no local test could see, which is exactly the class of bug these rows exist to catch. Without them, the first publication is an unmeasured act.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `node -e "console.log(Object.keys(require('./package.json').scripts).filter(k=>k.startsWith('qualify')).join(','))"` → a `qualify:package`-shaped lane exists.
  - `ls e2e/package-qualification/ 2>/dev/null | head` → fixtures exist for tree-shake, peers, optional-peer, csp, tarball-diff, sbom.
  - `yarn qualify:package > /tmp/qp.log 2>&1; echo "exit $?"` → runs to completion and its report names all twelve doc-08 rows with a per-row verdict (green / red / blocked).
  - `ls docs/qa/release/*/sbom*.json 2>/dev/null | head -1` → an SBOM artifact exists for the latest release-candidate directory.
</done_check>

<discovery>
  1. Read 08-11 doc 08 §"Package qualification matrix" and map each of the twelve rows to the fixture that covers it today (start from `../program-2026-09-04/reports/TASK-R1-O2-handoff.md` and the existing tarball fixtures from P1-03). Publish that mapping first — it is the task's scope contract.
  2. Read `packages/*/package.json` `peerDependencies` and `peerDependenciesMeta` to find the declared minimum Vue and Reka versions. If a package declares no minimum, that is a finding, not a blocker.
  3. Read `peer-hygiene-decisions-2026-09.md` — three of its four items are inputs to row 2 and row 3. Where a decision is still open, build the lane so it *measures* both options rather than presupposing one.
  4. Check whether `apps/landing` or `apps/docs` already run under a CSP; reuse that policy rather than inventing a second one.
</discovery>

<requirements>
  <tarball_only>Every fixture installs from `npm pack` output into a temp workspace. A fixture that resolves through the workspace symlink proves nothing and must be rejected in review.</tarball_only>
  <no_publish>No registry mutation, no `npm publish`, no `--dry-run` against a real registry that mutates state. Network use is limited to installing third-party deps into the temp workspace.</no_publish>
  <degradation>The optional-peer lanes assert the *documented* behaviour. If the documented behaviour does not exist, write the documentation line first, in the package README, then assert it.</degradation>
  <exceptions>A supply-chain exception (vulnerability or licence) requires owner, expiry date, reachability analysis and a fix path — a bare allowlist entry is refused.</exceptions>
  <example>
    Report row shape (docs/qa/release/&lt;date&gt;-&lt;sha&gt;/package-qualification.md):

    | # | doc-08 row | Core only | Core + second tier | Evidence |
    |---|---|---|---|---|
    | 6 | Individual-component tree-shaking | pass (bundle 12.4 kB, 1 of 144 components) | blocked — no second-tier tarball installed | e2e/package-qualification/tree-shake/ |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; publish the twelve-row coverage mapping.
  2. Implement rows 6, 7, 8 (tree-shake, peer matrix, optional peer) — these need no owner input.
  3. Implement rows 9, 10 (CSP/Trusted Types, licence/entitlement behaviour).
  4. Implement rows 11, 12 (tarball diff gate, SBOM + vulnerability/licence + provenance placeholders).
  5. Wire `qualify:package`; run it; write the per-row report into the release-candidate directory.
  6. Hand off with the row verdicts, the findings each new lane produced, and the peer-hygiene decisions the owner must now take with measurements attached.
</steps>

<validation>
  yarn qualify:package > /tmp/s2o1-qualify.log 2>&1; echo "exit $?"
  yarn test:nuxt-fixtures > /tmp/s2o1-nuxt.log 2>&1; echo "exit $?"
  yarn validate:all > /tmp/s2o1-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>All twelve doc-08 rows have a stated verdict; the seven previously uncovered rows have runnable fixtures that consume tarballs; `qualify:package` exists and produces the per-row report into the release-candidate directory; SBOM and vulnerability/licence report generated with any exception carrying owner + expiry + reachability; every finding filed with a task id; no registry mutation.</success_criteria>

<stop_conditions>Stop and report when a row cannot run without a second-tier tarball (record `blocked — no second-tier tarball installed`, and move on; obtaining one is not this repository's work); when the minimum peer version is undeclared (file it as a decision, build the lane against current only); when provenance would need CI or registry authority (build the artifact-hash half, mark provenance `[!owner]`).</stop_conditions>
```

---

### [ ] TASK-S2-O2 — Release report, stop-condition gate and deprecation machinery 🟠

_Gap: 08-11 doc 08 ends with two normative artifacts that no packet has built.
The first is the **required release report**: eight sections that must be
stated *independently* (implemented scope + commit · focused validation ·
aggregate qualification · browser/AT/security/performance · packed artifact ·
downstream canary · publication authority and actual operation status · known
gaps with expiry, rollback and ranked next work). The 2026-09-04 R1-O3 packet
assembled a release-evidence bundle, which is the raw material, not the report.
The second is the **eleven release stop conditions**, which exist only as prose
— nothing in the repository refuses a release when, say, a threshold has been
raised or evidence is bound to a different commit. Doc 06 §"API compatibility
and deprecation" adds a third unbuilt contract: every deprecation owes a runtime
development warning, a typed annotation, docs, a replacement example, a
codemod or adapter, the first deprecated version, the earliest removal version
and a rollback path — the repository has codemods and JSDoc `@deprecated` tags
but no schema that requires the set. Sources: 08-11 doc 08 §"Release stop
conditions" and §"Required release report", doc 06 §"API compatibility and
deprecation"; 08-28 doc 06 N5-R1/R3;
`../program-2026-09-04/reports/TASK-R1-O3-handoff.md`._

```xml
<role>You are a release engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You build the gate that says no; you do not decide whether to release.</role>

<task>Build the three missing release contracts. (1) A **release-report generator** that emits the eight doc-08 sections from the generated artifacts, leaving a section empty-and-labelled rather than inferring it — a canary section with no canary reads "no downstream adoption evidence", never "n/a". (2) A **stop-condition gate** that encodes all eleven doc-08 stop conditions as machine checks where the repository can see them (dirty/unidentified source · generated drift · evidence bound to a different commit · unresolved Core/Pro ownership · unexplained API diff or manifest omission · validator cannot start on the declared runtime · threshold raised without recorded justification · sanitizer/decoder/optional-peer fails open · missing browser/AT/RTL/SSR evidence for a changed high-risk component · tarball differs from the reviewed build · action lacking authority) and reports the rest as human-attested rows the report must carry. (3) A **deprecation schema + validator**: a machine-readable record per deprecated symbol carrying replacement, first-deprecated version, earliest-removal version, codemod id and rollback, with a validator that fails when a symbol is annotated `@deprecated` without a record, or a record's earliest-removal version has passed.</task>

<motivation>Doc 08's stop conditions are the difference between a release process and a hope. Today the repository can be green, be publishable, and still be shipping evidence bound to a commit that no longer exists — which is the exact state TASK-S0-O1 is fixing by hand. Encoding the stop conditions turns a recurring manual audit into a gate. The report is the other half: the 08-11 spec is explicit that local, aggregate, browser, package, adoption and authority evidence are reported *separately and never collapsed*, and an eight-section generator makes collapsing them impossible.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `node -e "console.log(Object.keys(require('./package.json').scripts).filter(k=>/release-report|stop-conditions|deprecations/.test(k)).join(','))"` → all three lanes exist.
  - `yarn generate:release-report > /tmp/rr.log 2>&1; echo "exit $?"` → 0, and the output document contains exactly eight top-level sections, each present even when empty.
  - `npx tsx packages/tooling/src/validators/stop-conditions.ts; echo "exit $?"` → runs; with a seeded stale artifact it exits non-zero and names the condition.
  - `npx tsx packages/tooling/src/validators/deprecations.ts; echo "exit $?"` → runs and reports the count of `@deprecated` symbols with and without records.
</done_check>

<discovery>
  1. Read 08-11 doc 08 §"Required release report" and §"Release stop conditions" verbatim and transcribe both lists into the task's own checklist before writing code. The section names and the condition wording are the contract.
  2. Read `../program-2026-09-04/reports/TASK-R1-O3-handoff.md` and the release-evidence bundle it produced under `docs/qa/release/` — the generator consumes that bundle, it does not replace it.
  3. Inventory the current deprecations: `grep -rn '@deprecated' packages/*/src --include='*.ts' --include='*.vue' | wc -l` and list the distinct symbols. That number is the validator's starting ratchet.
  4. Decide which of the eleven conditions are machine-checkable here and which need a human attestation row. Be honest: "action lacking authority" is not machine-checkable and belongs in the attested set.
</discovery>

<requirements>
  <no_inference>The report never infers a level from a lower one. A section with no evidence prints the absence in words. "n/a" is only written where the spec says a row is not applicable, with the reason.</no_inference>
  <stop_gate>The gate is advisory-free: it exits non-zero. Each firing names the condition number, the doc-08 wording, and the artifact or command that revealed it. Each machine check ships with a spec that seeds the violation and proves the exit code.</stop_gate>
  <threshold_check>The "threshold raised without recorded justification" check compares the current ratchet values against the values recorded in the previous release-candidate directory. A raise requires a justification line with an owner; without one, the gate fires.</threshold_check>
  <deprecation_record>One JSON record per deprecated symbol under `packages/contracts/` (types stay with contracts). Validator failure modes: annotated without a record · record without an annotation · earliest-removal version in the past · codemod id that no codemod provides.</deprecation_record>
  <example>
    Deprecation record shape:
    { "symbol": "DzThemeProvider", "package": "@dzup-ui/core", "replacement": "DzProvider",
      "firstDeprecated": "0.2.0", "earliestRemoval": "0.4.0", "codemod": "rename-theme-provider",
      "rollback": "re-export from ./compat", "owner": "core", "docs": "apps/docs/guide/provider.md" }
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; transcribe both doc-08 lists and publish the machine-checkable vs attested split.
  2. Build the deprecation schema + records for the symbols the inventory found + validator + spec.
  3. Build the stop-condition gate with one spec per machine check.
  4. Build the release-report generator over the existing evidence bundle; run it at HEAD and commit nothing.
  5. Chain the two validators into `validate:all`; recount the links; hand off with the attested-row list the owner must sign per release.
</steps>

<validation>
  yarn generate:release-report > /tmp/s2o2-report.log 2>&1; echo "exit $?"
  npx tsx packages/tooling/src/validators/stop-conditions.ts; echo "exit $?"
  npx tsx packages/tooling/src/validators/deprecations.ts; echo "exit $?"
  yarn test packages/tooling; echo "exit $?"
  yarn validate:all > /tmp/s2o2-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Release report generated with all eight sections present and none inferred; stop-condition gate encodes every machine-checkable doc-08 condition with a seeded-violation spec each, and lists the attested remainder; deprecation schema + records + validator exist, chained, with the annotated-symbol ratchet recorded old → new; aggregate link count recounted.</success_criteria>

<stop_conditions>Stop and report when a stop condition would require CI or registry state the repo cannot read (move it to the attested set with the reason); when a deprecation record has no possible replacement (that is an API decision — file it); when encoding a condition would need a threshold the owner has not set.</stop_conditions>
```

---

### [ ] TASK-S2-O3 — Docs-site deployment, size gate and registry gate 🟢 `[!owner deploys]`

_Gap: `apps/docs` is built (VitePress, `.vitepress/dist` present at HEAD) and
its generated pages, evidence pages and playground are in place, but **nothing
is deployed** — the 08-28 roadmap's N2 exit ("an agent or human can discover,
install, style and verify a component from published machine-readable surfaces
alone") cannot be met from a local build, and the 08-11 doc 03 documentation
contract's closing rule — "the published site, manifests and package
declarations must agree in CI" — has no published site to agree with. The
2026-09-04 R1-O5 packet delivered the engineering and five deployment decisions
(D165–D169) that were never taken. Two gates are also still missing: a build
**size gate** (the Storybook build has one; the docs build does not) and a
`validate:registry` that proves the three registry descriptors resolve to
artifacts that exist. Sources: 08-11 doc 03 §"Documentation contract"; 08-28
doc 06 N2-D1/D2/D3 and N2-A4; `../program-2026-09-04/reports/docs-deployment-packet-2026-09.md`,
`TASK-R1-O5-handoff.md`._

```xml
<role>You are a docs-platform engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You make the site deployable and provable; the deploy itself is the owner's act.</role>

<task>Make the docs site publishable without ambiguity. (1) Add a build-size gate for `apps/docs` in the same shape as the Storybook budget: measured total, per-route largest-asset list, a declared budget, and a failing exit when exceeded. (2) Implement `validate:registry`: every entry in the registry descriptors resolves to a file that exists in a packed artifact, every dependency named resolves, and the descriptor's component list matches the ownership manifest — fail with the first mismatch named. (3) Re-measure the five deployment decisions at HEAD and reduce them to one page with a recommendation each: hosting target, custom domain vs subpath, preview deployments per PR, versioned docs (single vs `/v0.2/`), and search provider. (4) Produce the deploy runbook the owner executes: exact commands, expected artifacts, the rollback, and what becomes publicly visible. (5) Add the CI-agnostic `docs:verify` lane that a deploy pipeline would call — build, size gate, registry gate, link check, generated-page freshness — so the pipeline configuration is the only thing the owner has to write.</task>

<motivation>The 08-28 benchmark is blunt about the exposure: every Vue competitor ships a docs site with live examples, and dzup-ui's differentiators (the generated capability matrix, per-component evidence pages, the ThemeRecipe theme builder) are precisely the things nobody can see. The site is built. The distance between "built" and "published" is five decisions and two gates, and this task removes everything except the decisions.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `node -e "console.log(Object.keys(require('./package.json').scripts).filter(k=>/docs:(verify|size)|validate:registry/.test(k)).join(','))"` → the three lanes exist.
  - `yarn docs:verify > /tmp/dv.log 2>&1; echo "exit $?"` → 0, and the log reports the build size against a declared budget.
  - `npx tsx packages/tooling/src/validators/registry.ts; echo "exit $?"` → 0, and it names how many descriptor entries it resolved.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S2-O3-deploy-runbook.md` → exists and names the target the owner picked, or states that the target is still decision D165.
</done_check>

<discovery>
  1. Read `docs-deployment-packet-2026-09.md` and the R1-O5 handoff — the five decisions are already framed; you are re-measuring their inputs, not re-deriving the options.
  2. Measure the current docs build: `yarn --cwd apps/docs build` then total the dist size and list the ten largest assets. That measurement sets the budget (current + documented headroom), not an aspiration.
  3. Read the registry descriptors (the three shipped in the 2026-09 N2-A4 work) and the ownership manifest; the gate compares them.
  4. Check what link checking already exists in the docs build; do not add a second link checker.
</discovery>

<requirements>
  <budget>The size budget is set from the measured value plus stated headroom, and recorded in a data file the gate reads — never hard-coded in the script.</budget>
  <registry_gate>An entry that resolves only through the workspace is a failure, not a pass: the gate resolves against packed artifacts, consistent with TASK-S2-O1.</registry_gate>
  <no_deploy>No deployment, no DNS change, no hosting-account mutation, no secrets. The runbook describes; the owner executes.</no_deploy>
  <freshness>The `docs:verify` lane fails when a generated page is older than the artifact it was generated from — the docs equivalent of the artifact binding in TASK-S0-O1.</freshness>
  <example>
    Runbook step shape:
    | # | Command | Expected artifact | Publicly visible? | Rollback |
    |---|---|---|---|---|
    | 3 | `yarn docs:verify` | `/tmp/docs-verify.log` exit 0 | no | n/a |
    | 5 | &lt;owner deploy command&gt; | live URL | **yes — irreversible index** | redeploy previous build id |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; measure and record the current build size and the registry entry count.
  2. Implement the size gate with its data file; implement `validate:registry` with a spec that seeds a broken entry.
  3. Add `docs:verify` chaining build → size → registry → links → freshness.
  4. Re-measure the five decisions; write the one-page decision sheet with recommendations.
  5. Write the deploy runbook; hand off with the measured size, the entry count, and the five decisions as owner rows.
</steps>

<validation>
  yarn --cwd apps/docs build > /tmp/s2o3-build.log 2>&1; echo "exit $?"
  yarn docs:verify > /tmp/s2o3-verify.log 2>&1; echo "exit $?"
  npx tsx packages/tooling/src/validators/registry.ts; echo "exit $?"
  yarn validate:all > /tmp/s2o3-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Size gate implemented with a data-file budget set from a measurement; `validate:registry` implemented, spec-proven, resolving against packed artifacts; `docs:verify` chains all five checks and exits 0 at HEAD; decision sheet re-measured with a recommendation per decision; runbook exists and marks every irreversible step; nothing deployed.</success_criteria>

<stop_conditions>Stop and report when the measured build exceeds any sane budget (report the ten largest assets and propose a reduction task rather than setting a permissive budget); when a registry entry cannot resolve because the package is unpublished (that is decision A4-D1 — mark blocked); when deployment would need credentials.</stop_conditions>
```

---

### [ ] TASK-S2-O4 — Dispatch the four written-but-never-dispatched CI lanes 🟢 `[!owner dispatches]`

_Gap: four CI jobs exist as configuration and have **never been dispatched**:
`validate-min-runtime` (written in 2026-08 P2-01 and named unrun in the 08-28
gap analysis), the Nuxt-majors lane, the `vue-next` (Vue 3.6 RC) lane, and the
minimum-peer lane. The 08-11 doc 08 per-change matrix requires each of them for
their change classes, and 08-28 doc 01 §A6 makes the Vue 3.6 lane explicitly
urgent ("cheap, high signal — exactly the class of change that breaks
libraries"). A job that has never run is not a gate; it is an untested script
that will fail on its first real dispatch, at the worst possible time. The
2026-09-04 R1-O4 packet prepared the dispatch request; the dispatch is the
owner's act. Sources: 08-11 doc 08 §"Per-change validation matrix"; 08-28
doc 01 §A6, doc 05 §A4.5, doc 06 N5-T1;
`../program-2026-09-04/reports/ci-dispatch-request-2026-09.md`, `TASK-R1-O4-handoff.md`._

```xml
<role>You are a CI engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You make each lane provably runnable locally before anyone spends a CI minute on it; dispatch is the owner's act.</role>

<task>Make the four lanes dispatch-ready and prove it without CI. For each of `validate-min-runtime`, `nuxt-majors`, `vue-next` and the min-peer lane: (1) run the lane's exact command sequence locally under the runtime and dependency set the job declares, using a version manager or a temp workspace — record the result; (2) fix whatever prevents it starting (the class of defect H4 in the 08-11 findings: a validator that cannot start under the declared floor); (3) state the lane's expected duration, its failure modes, and whether a failure should block merge or report; (4) reduce the job to the minimum matrix that answers its question — a Vue 3.6 lane that runs the whole suite on every push buys nothing over one that runs the reactivity-sensitive subset. Then update the dispatch request with the measured evidence and the four go/no-go recommendations.</task>

<motivation>The 08-11 finding H4 was exactly this failure: a documented gate that could not start under the repository's own declared runtime. It was fixed for the local case, but the same risk lives in four undispatched jobs, and the Vue 3.6 lane is the one the 08-28 research singles out as the highest-signal cheap check available — alien-signals reactivity plus Vapor interop is the change class that silently breaks vDOM libraries. Proving each lane locally converts a dispatch from a gamble into a scheduled cost.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `ls .github/workflows/*.yml 2>/dev/null | xargs grep -l 'min-runtime\|nuxt-majors\|vue-next\|min-peer' | wc -l` → the four jobs exist as configuration.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S2-O4-lane-evidence.md` → exists and carries a local run record per lane with a command, a runtime version and an exit code.
  - For each lane, the evidence document shows a local run under the **declared** runtime/dependency set, not the developer default.
  - `grep -n 'go\|no-go' docs/program-2026-09-22-architecture/reports/TASK-S2-O4-lane-evidence.md` → each lane carries a recommendation.
</done_check>

<discovery>
  1. Read `ci-dispatch-request-2026-09.md` and the R1-O4 handoff; the request already frames the dispatch — you are adding the local evidence it lacks.
  2. Read each workflow file and extract: the runtime version, the dependency overrides, the command sequence, and the trigger. Anything ambiguous is a defect to fix before dispatch.
  3. Read `packages/*/package.json` `engines` and the ADR-18 floor. The min-runtime lane must run under the floor, not under whatever node is installed.
  4. Check whether a Vue 3.6 RC resolution is even installable today; if the RC has moved, the lane's pinned version is already stale and that is finding one.
</discovery>

<requirements>
  <local_first>Each lane is run locally under its declared versions before any recommendation is written. "Should work" is not evidence.</local_first>
  <no_dispatch>No CI dispatch, no workflow enablement, no secret creation. If a lane needs a secret, name it and stop.</no_dispatch>
  <minimality>Recommend the smallest matrix that answers the lane's question and state what the reduction gives up.</minimality>
  <failure_policy>Each lane gets an explicit blocking vs reporting recommendation with the reason. A lane that reports forever is a lane nobody reads — say so if that is the risk.</failure_policy>
  <example>
    | Lane | Declared runtime | Local run | Exit | Duration | Recommendation |
    |---|---|---|---|---|---|
    | validate-min-runtime | node 20.19.0 | `yarn validate:all` under nvm 20.19.0 | 0 | 6m12s | **go** — blocking on PR |
    | vue-next | vue 3.6.0-rc.x | `yarn test --project unit` with resolution override | 1 (3 failures, all in useTabs) | 2m40s | go — **reporting only** until the 3 failures are triaged |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; extract the four declared configurations.
  2. Run each lane locally under its declared versions; capture logs; fix start-up defects only.
  3. Triage each failure as a genuine incompatibility or a lane defect; file genuine incompatibilities as tasks.
  4. Write the lane-evidence document with the table above and four go/no-go recommendations.
  5. Update the dispatch request in place with the measured evidence; hand off.
</steps>

<validation>
  # per lane, under the lane's declared runtime — example for min-runtime:
  node --version                                  # must equal the declared floor
  yarn validate:all > /tmp/s2o4-min-runtime.log 2>&1; echo "exit $?"
  yarn test > /tmp/s2o4-vue-next.log 2>&1; echo "exit $?"     # with the vue-next resolution applied in a temp workspace
  yarn test:nuxt-fixtures > /tmp/s2o4-nuxt.log 2>&1; echo "exit $?"
</validation>

<success_criteria>All four lanes have a local run record with command, declared runtime/dependency versions, exit code and duration; every start-up defect fixed; every genuine incompatibility filed as a task; the lane-evidence document carries four go/no-go recommendations with blocking-vs-reporting reasons; the dispatch request updated; nothing dispatched.</success_criteria>

<stop_conditions>Stop and report when a lane needs a secret or a runner the repo does not have; when the declared pinned version no longer resolves (report the drift, propose the new pin, do not silently repin); when a local run reveals a component incompatibility that would take more than a triage to fix.</stop_conditions>
```
