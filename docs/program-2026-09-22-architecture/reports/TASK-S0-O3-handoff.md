# TASK-S0-O3 — ADR-18/19/20 ratification packet + the Proposed-ADR gate

> Baseline: `main` @ **`4e4e46f`** (`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`),
> worktree **NOT clean — 255 dirty paths at start**, all produced by the ten
> prior tasks of this programme and uncommitted by design (**the owner commits**).
> Every one preserved: nothing reverted, stashed, checked out or cleaned.
>
> **No ADR status was edited by this task.** Flipping `Proposed` → `Accepted` is
> the owner's act. The three documents in `docs/adr/` are byte-identical to their
> state at the start of this task: `sha256sum -c` **3/3 OK**,
> `git status --short docs/adr` = **0 paths**. `maxProposedCitedFromCode` is
> **unchanged at 3** — it may only fall in the same change as an acceptance,
> which an agent cannot perform.
>
> Deliverable: [`TASK-S0-O3-ratification-packet.md`](./TASK-S0-O3-ratification-packet.md).

## 0. Progress log (append-only, written as the task ran)

- **Step 0** — baseline re-measured at `4e4e46f`: 255 dirty paths;
  `validate:all` = **55 links** (counted, not quoted); all three ADRs
  `Proposed`, verified in their own front matter.
- **Step 1** — machinery read: `packages/tooling/scripts/validate-adr-references.ts`
  (already status-aware: `readStatus`, `isCodeCitation`, `maxProposedCitedFromCode`),
  `packages/tooling/scripts/adr-registry.json` (`maxUndocumented` 14,
  `maxProposedCitedFromCode` 3, `documented` 3 entries, `undocumented` 14).
- **Step 2** — blast radius measured at `4e4e46f` under three definitions,
  because the register and this task use different ones:

  | ADR | Register row 18's grep (`packages/*/src`, `.ts`+`.vue`, specs included) | `validate:adr-status`' shipped-source definition | All code citations (`isCodeCitation`) | Total incl. prose |
  |---|---|---|---|---|
  | ADR-18 | 1 file | **1** citation / 1 file | 13 / 6 files | 209 / 43 files |
  | ADR-19 | 273 files | **369** citations / 251 files | 538 / 278 files | 1,145 / 439 files |
  | ADR-20 | 169 files | **304** citations / 163 files | 342 / 179 files | 1,065 / 379 files |

  The register's **273 / 169 / 1 reproduce exactly** — row 18 is confirmed, not
  falsified.
- **Step 3** — ADRs cited **from code with no document at all**: re-measured
  **14**, equal to `maxUndocumented`. Restricted to *shipped source* it is
  **13** (ADR-11, ESM-only distribution, is cited from configs and prose but not
  from `packages/*/src/`). **0 registry entries are uncited**, so there is no
  dead weight. S0-O1's undocumented-id leak is closed — the id was **ADR-21**, <!-- adr-example-ok -->
  and it is now carried under the `adr-example-ok:` marker on the S0-O3 prompt's
  own `<motivation>` line (`custody-and-release-tasks.md:205`).
- **Step 4** — code re-verified at `4e4e46f` (not taken from R0-O2's table):
  104 `*.anatomy.ts`; 90 `.types.ts` with `ui?:`; six-layer statement in
  `base.css:51` **and** `tokens/src/generate.ts:116,262`; root and
  `packages/mcp` `engines.node` both `^20.19.0 || >=22.13.0`, `.nvmrc` =
  `20.19.0`; the nine ADR-20 §1 injection keys at
  `contracts/src/provider.types.ts:629–637` plus `DZ_SANITIZER_KEY:650` and
  `DZ_URL_POLICY_KEY:664`; 0 `new Intl.` outside `i18n/intl-cache.ts`.
- **Step 5** — gate built, spec'd, chained. `validate:all` **55 → 56 links**,
  appended at the END so every existing link number is preserved.
- **Step 6** — seeded-change proof run against a scratch copy of `docs/adr/` in
  the session scratchpad; four seeds, four correct reds; real documents never
  edited; restore proven byte-identical both sides.
- **Step 7** — the new machinery **caught a defect in this handoff**: the first
  draft of step 3 cited the undocumented id without a marker and turned
  `validate:adr-references` red (`unresolved-citation`, exit 1). Fixed by marking
  it, exactly as S0-O1 had to. Recorded rather than quietly patched: the same
  trap caught two consecutive tasks, which is evidence the marker convention is
  load-bearing rather than cosmetic.

---

## 1. Implemented files and API effect

| File | Status | What it is |
|---|---|---|
| `packages/tooling/src/validators/adr-status.ts` | **new** | The gate. Reads each ADR document's **own `Status:` line** and fails when a `Proposed` ADR is cited from **shipped source**, unless a dated entry covers it. Exports `isShippedSource`, `collectShippedCitations`, `readGrandfatherList`, `checkAdrStatus` (pure), `validateAdrStatus` (filesystem) |
| `packages/tooling/src/validators/adr-status.spec.ts` | **new** | 25 tests. Every rule seeded; includes the fixture that proves the gate catches what the numeric ceiling cannot |
| `packages/tooling/src/validators/adr-status-grandfather.json` | **new** | The dated, finite, self-emptying grandfather list — 3 entries, `maxGrandfathered` 3 |
| `package.json` | **modified** | `validate:adr-status` script + its `//` doc entry; appended to `validate:all` at the END |
| `docs/program-2026-09-22-architecture/reports/TASK-S0-O3-ratification-packet.md` | **new** | The deliverable |
| `docs/program-2026-09-22-architecture/EXECUTION-STATUS.md` | **modified** | TASK-S0-O3 row |

**API effect: none on any published package.** `@dzup-ui/tooling` is private
(`release-policy.json`), the new module is not re-exported from its barrel, and no
contract, component, type or token changed. This task adds one gate and two
documents.

### 1.1 What the gate does, and why it is not a second copy of an existing one

`validate:adr-references` (chain link **45**) already reads each `Status:` line
and ratchets `maxProposedCitedFromCode`. The new gate is not redundant, and the
difference is demonstrable:

- **That ceiling is a NUMBER; this list is a set of NAMES.** With the ceiling at
  3, accepting one ADR while one *new* unsigned decision becomes load-bearing in
  the same release leaves the arithmetic at **3 — equal to the ceiling, silently
  green**. The next decision would become load-bearing exactly the way these
  three did, which is the recurrence the task exists to prevent. The named list
  refuses it. Asserted as a fixture:
  `adr-status.spec.ts` → *"a swap that keeps the arithmetic ceiling intact still
  fails"*, which first asserts the arithmetic is still 3 and then asserts the
  gate fires anyway.
- **Narrower scope.** `isCodeCitation` counts any non-Markdown file under
  `packages/` or `apps/` — configs, JSON, generated release blobs.
  `isShippedSource` counts only non-spec, non-story, non-fixture code under
  `packages/<pkg>/src/`, which is the set that reaches a consumer and therefore
  the set that makes a decision load-bearing.
- **An exit condition instead of a ceiling.** Each entry carries `recorded`
  (ISO date), `reason` and `exit`. `maxGrandfathered` must **equal**
  `entries.length`, so a fourth entry is a visible edit a reviewer can refuse.

### 1.2 It fails closed — the defect class this programme keeps catching

Nine rules, each with a named reason, none of which can pass by omission:

| Rule | Fires when |
|---|---|
| `no-documents` | **the scan found no ADRs at all.** An empty scan is a lost input, never a clean bill of health |
| `unreadable-status` | a document has no `Status:` line, **or** a status word outside `Proposed\|Accepted\|Rejected\|Superseded\|Deprecated` — so `Draft` or `Ratified` fails rather than quietly meaning "not Proposed" |
| `proposed-cited` | a `Proposed` ADR is cited from shipped source and is not on the list |
| `grandfather-discharged` | a listed ADR's status has changed — the allowance is spent |
| `grandfather-uncited` | nothing under `packages/*/src/` cites a listed ADR any more |
| `grandfather-unknown` | the list names an ADR with no document |
| `grandfather-date` | `recorded` is not ISO `YYYY-MM-DD` — an undated allowance is a permanent one |
| `grandfather-entry` | `reason` or `exit` is empty |
| `grandfather-ceiling` | `maxGrandfathered` ≠ `entries.length`, in either direction |

The scope test is **re-applied inside `checkAdrStatus`** rather than trusted from
the collector, so a caller cannot widen the gate silently.

### 1.3 The gate found a defect in itself on first run

Its first run reported ADR-18 at **2** shipped citations — one of which was a
sentence in its own doc comment *describing* ADR-18. The validator was inflating
its own meter. Fixed with the existing `adr-example-ok:` marker, the same
mechanism `validate:adr-references` already uses, and recorded in the source so
the next reader does not remove the markers as noise. Post-fix the figure is the
true **1** (`packages/tooling/src/validators/stop-conditions.ts:438`).

---

## 2. Focused validation output — commands and exit codes, read directly

```
node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/adr-status.ts   exit 0
  ✓ adr-status: 3 ADR document(s) · 0 Accepted · 3 Proposed (ADR-18, ADR-19, ADR-20)
    · 3 cited from shipped source while Proposed, all 3 grandfathered (ceiling 3)
    ADR-19: 369 citation(s) in 251 shipped file(s) — grandfathered 2026-09-24,
            first at packages/contracts/src/anatomy.types.ts:3
    ADR-20: 304 citation(s) in 163 shipped file(s) — grandfathered 2026-09-24,
            first at packages/contracts/src/index.ts:165
    ADR-18:   1 citation(s) in   1 shipped file(s) — grandfathered 2026-09-24,
            first at packages/tooling/src/validators/stop-conditions.ts:438

yarn validate:adr-status                                                          exit 0
yarn validate:adr-references                                                      exit 0
  ✓ 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)
    status: 0/3 Accepted · 3 Proposed cited from code (ceiling 3) — ADR-18, ADR-19, ADR-20
yarn validate:engines                                                             exit 0
yarn validate:anatomy-parts                                                       exit 0
  ✓ 622 data-part emissions across 142 components (47 distinct names,
    104 anatomy declarations); 0/0 undeclared, 0/0 declared-but-unemitted
    data-state: 25 values / 74 components; 0/0 undeclared; 17/17 without anatomy
    0 unreviewed part names, 0/0 held
yarn typecheck:tooling                                                            exit 0
node node_modules/eslint/bin/eslint.js <the 3 new files> --max-warnings 0          exit 0
node node_modules/vitest/vitest.mjs run .../adr-status.spec.ts                    exit 0   25/25
node node_modules/vitest/vitest.mjs run packages/tooling/src/validators           exit 0   34 files / 747 tests
```

`npx` was **not** used. It fetches dependency-confusion placeholders in this
repository that exit 0 without running — a silent false green. Every binary was
invoked by module path or through `yarn` (yarn 4.16.0 works here). No gate result
was read through a pipe.

### 2.1 The seeded-change proof

Run against a **scratch copy** of `docs/adr/` in the session scratchpad, driven by
a throwaway `.s0o3-seed-driver.mts` that called `checkAdrStatus` with
`collectDocuments(<scratch dir>)`. **No real ADR's status was flipped, even
temporarily.** The driver and a temporary measurement script were deleted
afterwards (0 dotfiles remain under `packages/tooling/src/validators/` or
`packages/tooling/scripts/`).

| Seed | Change, in the copy only | Count | Exit |
|---|---|---|---|
| baseline | none | `proposed=[ADR-18,ADR-19,ADR-20] accepted=[] inUse=3` | **0** |
| **A** | ADR-19 `Proposed` → `Accepted` | `proposed=[ADR-18,ADR-20] accepted=[ADR-19] inUse=2` | **1** `[grandfather-discharged]` — *"delete the entry … and lower maxGrandfathered to 2 … Also lower maxProposedCitedFromCode"* |
| **B** | ADR-20 status word → `Ratified by acclamation` | `proposed=[ADR-18,ADR-19] inUse=2` | **1** `[unreadable-status]` |
| **C** | ADR-18 `Status:` line deleted | `proposed=[ADR-19,ADR-20] inUse=2` | **1** `[unreadable-status]` |
| **D** | empty ADR directory | `documents=0 inUse=0` | **1** `[no-documents]` + 3 × `[grandfather-unknown]` |

Seed **D** is the one that matters most: a naive gate would have exited **0** on
an empty scan. Seed **A** is the interlock that makes acceptance atomic.

**Restore, byte-identical on both sides:**

```
sha256sum docs/adr/*.md > before.sha256        # taken BEFORE any seeding
545e6be4…  docs/adr/ADR-18-runtime-floor-and-validator-runner.md
c4a7b828…  docs/adr/ADR-19-public-styling-contract.md
1197ef2d…  docs/adr/ADR-20-provider-contract.md

sha256sum -c before.sha256   → ADR-18…: OK · ADR-19…: OK · ADR-20…: OK    exit 0
diff before.sha256 <(sha256sum <scratch>/adr-seed/*.md | sed 's#…/adr-seed/#docs/adr/#')  → no output
git status --short docs/adr | wc -l       → 0
git diff --stat HEAD -- docs/adr | wc -l  → 0
```

---

## 3. Aggregate qualification

**`yarn validate:all` = 56 links, counted not quoted**
(`node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"`).
`validate:adr-status` is link **56**; `validate:adr-references` remains link
**45**. Appended at the END, so links 1–55 keep their numbers — the convention
S0-O1 established, and the count has now changed **six** times in four days
(50 → 51 → … → 55 → 56).

**Result of the FINAL end-to-end run: exit 1 at link 51 — pre-existing, unrelated
to this task, and unchanged from what S0-O2 measured.** The exact failing
output, quoted from that run:

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0" by @dzup-ui/landing, @dzup-ui/sandbox
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core
1 icon-library violation(s).
```

> **Two aggregate runs were made and only the second is quoted.** The first
> stopped early, at link **45** (`validate:adr-references`), because this handoff
> was still being written while the chain ran and a draft paragraph cited an
> undocumented ADR id without its `adr-example-ok:` marker. That is a real
> property worth recording rather than hiding: **`validate:all` scans `docs/`,
> so editing a report while the aggregate runs can fail it**, and the failure
> looks like a code defect. Fixed, re-run end to end, and only the final run is
> reported — links 1–50 green, including `validate:adr-references` at link 45
> (`✓ 17 ADR(s) cited · 3 documented · 14 registry-only`) and
> `validate:release-policy` at link 50.

- Links **1–50 green**. Link **51 `yarn validate:peers`** exits 1, and the failing
  half is its **second** command: `validate:peers` is
  `tsx packages/tooling/scripts/validate-peers.ts && yarn validate:icon-duplicates`
  — the first half passes and **`validate:icon-duplicates` fails**. S0-O2's
  correction is confirmed verbatim; the earlier reports that blamed
  `validate:peers` itself were naming the link, not the sub-command.
- Links **52–56 are UNREACHED in the aggregate** — `validate:licenses`,
  `validate:tree-shake`, `validate:evidence-binding`, `validate:deprecations` and
  the new `validate:adr-status`. **Each is exit 0 individually.** So the new gate
  has **never run inside a completed `validate:all`** and cannot until link 51 is
  fixed. Stated rather than smoothed over: `validate:adr-status` is **locally
  qualified**, by its own invocation and 25 unit tests — **not**
  aggregate-qualified.
- **Nothing new is red.** The three added files are lint-clean, typecheck-clean
  and test-clean; link 51's failure predates them.

No artifact was regenerated, so the ownership → quality → capability →
component-meta → llms → docs-pages order did not need to be walked, and no
stale-docs-page red was introduced.

---

## 4. Ratchet movements (old → new)

| Ratchet | Old | New | Note |
|---|---|---|---|
| `validate:all` links | 55 | **56** | appended at the END; existing numbers preserved |
| Gates keyed on a **named** set of unsigned decisions | 0 | **1** | `validate:adr-status` |
| `maxGrandfathered` (new ratchet) | — | **3** | seeded at the measured truth: ADR-18, ADR-19, ADR-20. Falls only on an acceptance, and `grandfather-ceiling` makes the seed falsifiable |
| `maxProposedCitedFromCode` | 3 | **3 — deliberately unmoved** | It may only fall in the same change as an acceptance, which is the owner's act. **Not lowered.** |
| `maxUndocumented` | 14 | **14** | re-measured and equal to the measured count; no entry added, none removed |
| `maxWithoutAnatomy` | 41 | **41** | re-measured only |
| `maxUnreviewedPartNames` / `maxHeldPartNames` / `maxUndeclaredEmissions` / `maxUndeclaredStates` | 0 / 0 / 0 / 0 | **0 / 0 / 0 / 0** | re-measured only |
| `maxStatesWithoutAnatomy` | 17 | **17** | re-measured only |
| ADRs `Accepted` (1.0 criterion **C1**) | 0 of 3 | **0 of 3** | only an owner moves this |
| Tests in the `packages/tooling/src/validators` lane | 722 | **747** | +25, one new file |

**No ceiling was raised and no allowlist widened.**

---

## 5. Owner decisions raised

Numbered for this handoff. **D1–D3 restate register rows with a correction each;
D4 and D5 are new.**

### D1 — Sign ADR-19 and ADR-20 now; hold ADR-18. *(register row 18, refined)*

- **Options:** (a) sign all three · (b) **sign 19 and 20, hold 18 behind the Node
  floor** · (c) leave all three `Proposed`.
- **Recommendation: (b).** ADR-19 has **zero** divergences at `4e4e46f` and every
  figure in its own amendment A1 reproduces exactly. ADR-20 has no clause the code
  contradicts. ADR-18's Decision 1 is under active dispute **and** its Decision 3
  is measurably false on the tree. C1 can honestly go 0/3 → 2/3 today.
- **Correction to register row 18:** its ratchet column reads
  `maxProposedCitedFromCode` **3 → 0**, which is right for option (a) only. Under
  the row's own **recommended** option (b) the target is **1**, because ADR-18
  stays `Proposed` and is still cited from shipped source
  (`packages/tooling/src/validators/stop-conditions.ts:438`). Setting it to 0 with
  ADR-18 unsigned turns `validate:adr-references` red on `proposed-ceiling`.
  A precision correction, not a falsification.

### D2 — The Node floor. *(register row 19 — and the exposure is wider than reported)*

- **New evidence at `4e4e46f`:** `fs.globSync` is `@since v22.0.0` and there are
  **two** `node:fs` `globSync` sites, not the one **D160** named:
  `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49` (D160's,
  still unfixed, inside the `yarn test` lane) and
  `packages/codemods/scripts/run-story-color-tokens.ts:15` — **never reported**,
  landed **2026-07-13** in `6c5f522`, so it predates D160 by two months.
  (`packages/codemods/src/runner.ts` imports `globSync` from the `glob` npm
  package and is **not** a floor break.)
- **So D160's option — "fix the one offending import" — rests on an undercount**,
  and ADR-18 **A2**'s owed sweep is demonstrably wider than one import. 1.0
  criterion **C10** remains not met.
- **Recommendation:** take **`>=22.13.0` at 1.0**; as the interim fix **both**
  sites, not one; and run the `@since v22`/`v23` sweep A2 asks for before
  restating the floor either way. `>=24.0.0` stays rejected (**D176** — Node 22
  LTS runs to April 2027).

### D3 — ADR-20 amendment A8.3 should stop transcribing adoption counts.

- **Evidence:** four of A8.3's nine figures do not reproduce at `4e4e46f` with
  the method A8.3 itself states (`useDzTestIds(` etc. over
  `packages/core/src/components`): test ids 89 → **88**, defaults 23 → **22**,
  direction 19 → **18**, messages-reading components 45 → **42**. Portal (18),
  motion (3 + 15), formats (3), locale (1) and catalog entries (44) reproduce.
  `git diff --stat 527dbd1 HEAD -- packages/core/src/components` = 19 files, 0
  dirty — a **measurement-method drift, not a code regression**.
- **Options:** (a) re-transcribe today's numbers · (b) **replace the number
  column with the commands and keep only the direction claims** · (c) leave it.
- **Recommendation: (b)**, in the acceptance commit. A8.6 already took exactly
  this rule three paragraphs later — *"the count is whatever that file declares,
  and this document should cite the file rather than transcribe a number out of
  it"* — and A8.3 breaks it. A fourth transcription would go stale a fourth time.

### D4 — NEW. Accept ADR-19's three declared-but-unenforced clauses as named debt, or gate them first?

- ADR-19 §4 declares the five recipe attributes (`data-size`, `data-variant`,
  `data-tone`, `data-density`, `data-orientation`) **public**, and **no gate
  measures them** — `core.css` already selects on them, so the surface is public
  whether enforced or not. `.dz-field-input-reset` and `.dz-tab-close-btn:hover`
  remain `!important` debt with an owner (`.dz-native-input:-webkit-autofill` is
  a permanent recorded exception).
- **Options:** (a) **accept ADR-19 with these recorded as named debt with owners
  and a target** · (b) build the recipe-attribute gate first, accept after ·
  (c) amend §4 to drop the public claim.
- **Recommendation: (a).** This is the one genuinely open choice ADR-19's
  acceptance still contains. (b) delays a signature 251 shipped files already
  need, behind a gate whose right design is bundled with `data-scope` — build it
  once as a `useAnatomy()` attribute bag, because a second hand-written per-node
  attribute is the failure mode this programme has recorded five times. (c) would
  make the document *less* true than the CSS.

### D5 — NEW. Nothing watches for a second cross-tier ADR-number collision (**D187**, register row 62).

- Row 62's own recommendation is *(b) keep sharing with the naming rule until a
  second collision occurs, then split*, and it notes the trigger is cheap to watch
  for and nothing watches. **The gate this task built does not close it:** it reads
  this repository's `docs/adr/` only, by the repository-boundary rule.
- **Options:** (a) split the number space now (this repository takes a reserved
  range) · (b) **keep sharing, and make the trigger observable** · (c) a joint
  cross-tier registry.
- **Recommendation: (b)**, and the cheap form is a **published ADR index** from
  the commercial tier that this repository can diff — the *same* missing
  published-manifest precondition **TASK-S3-O1** is already blocked on. Bundle it
  there rather than opening a second cross-tier negotiation. Until then the naming
  rule holds: a bare `ADR-13` here always means the date-math decision, verified
  against both `CLAUDE.md` and `adr-registry.json` at `4e4e46f`.

---

## 6. done_check outcome — **4 of 4 at `4e4e46f`, with clause 4 DEFECTIVE**

| # | Clause | Result |
|---|---|---|
| 1 | `grep -h -m1 -i 'status' docs/adr/ADR-18-*.md ADR-19-*.md ADR-20-*.md` → if all three read `Accepted`, record found-done | **Ran. All three read `Proposed`.** Not found-done; the task ran in full |
| 2 | the ratification packet exists | **Now true** — created by this task |
| 3 | a `validate:adr-status`-shaped script exists and is chained into `validate:all` | **Now true** — `validate:adr-status`, chain link 56 of 56 |
| 4 | `npx tsx packages/tooling/src/validators/<adr validator>.ts; echo "exit $?"` | **DEFECTIVE — two ways.** Corrected, then run |

**Clause 4's two defects, either of which would have produced a wrong answer:**

1. **`npx` is unsafe in this repository.** It fetches dependency-confusion
   placeholders that exit **0 without running** — a clause that "passes" while
   executing nothing, which is the exact false-green this task's own gate exists
   to prevent. Corrected to
   `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/adr-status.ts`.
2. **The path is a guess with no referent at check time.** `<adr validator>` did
   not exist when the check runs, and the *existing* ADR machinery lives in
   `packages/tooling/scripts/`, not `src/validators/`. A wrong path exits 1 with
   `ERR_MODULE_NOT_FOUND`, which reads exactly like a failing gate. Resolved by
   **choosing** `packages/tooling/src/validators/adr-status.ts` — the dominant
   house layout for validators (`<name>.ts` + `<name>.spec.ts` + `<name>-*.json`,
   40+ siblings) — so the clause's own guess is now correct, while the shared
   primitives are imported from `../../scripts/validate-adr-references.ts` rather
   than duplicated. One notion of "a citation", two gates.

That makes **16 of 16 prompts in this programme defective**, per S0-O2's audit;
this is the sixteenth.

**Two further prompt-body claims were checked, and one is stale:** the
`<validation>` block writes to `/tmp/s0o3-validate-all.log` and **`/tmp` is not
writable here** — the log went to the session scratchpad instead. And
`<discovery>` clause 4 asks whether ADR-18's Node-floor input has since been
answered: **it has not** — three recommendations, none binding, register row 19
still `open` — and §5 D2 shows the question got *harder*, not easier.

**One `<stop_conditions>` clause fired and was obeyed:** *"stop and report when
ADR-18's Node floor input is still genuinely open — mark ADR-18 blocked and
deliver 19/20."* That is what the packet does. The fourth-grandfather-entry stop
condition did **not** fire: three entries, `maxGrandfathered` 3, measured count
of `Proposed` ADRs cited from shipped source 3. No divergence needing a component
change was found, so the third stop condition did not fire either.

---

## 7. Ranked next packet

1. **The owner's five minutes** — sign ADR-19 and ADR-20, lower
   `maxProposedCitedFromCode` 3 → 1 and `maxGrandfathered` 3 → 1 in the same
   change, run the two ADR gates. Nothing else in this programme is as cheap or
   unblocks as much: it is the only way C1 moves, and both interlocks now make the
   change atomic or red.
2. **Fix link 51 (`validate:icon-duplicates` on `[single-version]`)** — five
   gates, including this one, have never run inside a completed `validate:all`.
   Every "the aggregate is green" claim about links 51–56 is unverifiable until it
   is fixed. Highest-leverage engineering item left in S0.
3. **Answer the Node floor (D2)** and run the `@since v22`/`v23` sweep — two sites
   found by one grep, so the sweep is owed and ADR-18 stays blocked without it.
4. **Write ADR-09 and ADR-17 as one packet** — the two decisions ADR-19 and
   ADR-20 declare they *extend*, both undocumented. Takes `maxUndocumented`
   14 → 12, the cheapest ceiling movement available, and it unblocks **D-P** and
   therefore **D-L**.
5. **Build the recipe-attribute gate with `data-scope` as one `useAnatomy()`
   attribute bag** (D4 option (a)'s follow-through) — the last unenforced clause
   of an accepted ADR-19.

---

## 8. Addendum — a third transcribed number found while verifying

While re-checking §6 of the packet, `adr-registry.json`'s ADR-13 entry was found
to carry the same defect class as ADR-20's A8.3 (**D3** above): it says the OSS
ADR-13 is *"cited from **10** sites here"*, and **that figure reproduces under no
definition measured at `4e4e46f`** — 8 shipped-source files, 9 code files, 16
code citations, 18 files / 67 citations by the validator's own scanner, 20 files
/ 79 by raw grep.

**Not corrected here, deliberately.** The sentence sits inside a
*rejected-alternative* rationale (why renumbering was refused) whose argument
holds at 8, 10 or 79, so editing it would be a cosmetic change to a file whose
`$comment` is itself the authority on transcribed facts. **Recommendation:**
replace it with the command the next time that entry is edited — the rule A8.6
already states for ADR-20, applied one file over. Raised as part of **D3**.

This is the **third** transcribed-number drift this task found (A8.3's adoption
counts, D160's one-site `globSync` undercount, and now the registry's "10
sites"), and all three are the defect class the registry's own `$comment` says
the repository has recorded six times. The pattern is the finding: **every
number a document transcribes instead of citing a command for has gone stale.**
