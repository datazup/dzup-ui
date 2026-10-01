# AT session record format — what a tester submits, and what the lane refuses

> **Owner:** TASK-S1-O1 (programme [2026-09-22 architecture](../program-2026-09-22-architecture/README.md)).
> **Written at** `4e4e46f`. **Status at that commit: 534 cells, 0 executed** — no
> record described here has ever been submitted, which is the honest state and
> the reason this document exists before the first one is.
>
> Companions: the pairing vocabulary and the 1.0-claim options are in
> [`at-pairing-decision-packet.md`](../program-2026-09-04/reports/at-pairing-decision-packet.md);
> the wave-1 order, the per-component hours and the owner decisions are in
> [`TASK-S1-O1-wave-1-schedule.md`](../program-2026-09-22-architecture/reports/TASK-S1-O1-wave-1-schedule.md).
> **Do not read either while testing.** During a session you read one file:
> `e2e/at-matrix/scripts/{Component}.at-script.md`.

---

## 1. The two ways to record a run, and when to use which

| | Hand-edit the markdown | `yarn at:ingest` |
|---|---|---|
| What you do | Append eight-column rows to `e2e/at-matrix/{Component}.md` yourself | Write one JSON per `{component, pair}` and run one command |
| Checked by | `validate:at-matrix` (shape and substance) | `at:ingest`'s refusals **and then** `validate:at-matrix` **and** `validate:at-runs` |
| Keeps | The row | The row **and** the full record, including `os`, each step's `expected`, and the defect ids |
| Use it when | You are recording one correction and you know the column order | **Always, for a session.** |

Both are legitimate; the second is strongly preferred, and the reason is
narrow. The markdown table has eight columns and a session has more than eight
facts in it. `os` has no column. What the script told you to listen for has no
column. Which defect id a failure became has no column. Hand-editing forces you
to drop them, or to cram them into `notes`, and six months later the row says
`fail — announces count only` and nobody can reproduce it because nobody knows
which Windows build or which step of the script it was.

`at:ingest` keeps both: it appends the row **and** archives the whole record
under `e2e/at-matrix/runs/`, then `validate:at-runs` holds the two to each
other for as long as the repository exists.

---

## 2. The format

One file per `{component, pair}`. Any path you like while you work; the lane
archives it under `e2e/at-matrix/runs/{Component}-{pair}-{date}-{tester}.json`.

```json
{
  "component": "DzFileUpload",
  "tier": "D",
  "pair": "nvda-firefox",
  "at": "NVDA 2026.2",
  "browser": "Firefox 141.0",
  "os": "Windows 11 26200",
  "tester": "e.isic",
  "date": "2026-10-01",
  "sourceCommit": "4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a",
  "steps": [
    {
      "id": "reach",
      "expected": "Name, role and state announced together",
      "result": "pass",
      "observed": "\"Choose files, button, collapsed\""
    },
    {
      "id": "error",
      "expected": "Error text announced and associated with the control",
      "result": "fail",
      "observed": "silent on blur; the text is visible but never announced"
    }
  ],
  "verdict": "fail",
  "defects": ["D-AT-001"]
}
```

| Field | Required | Rule |
|---|---|---|
| `component` | yes | Must have a cell — i.e. be Tier B or above. Tier A is excluded from the scaffold by design. |
| `tier` | no | Recorded for the archive; the lane reads the tier from the quality matrix, not from you. |
| `pair` | yes | One of `nvda-firefox` · `nvda-chrome` · `jaws-chrome` · `voiceover-safari` · `voiceover-ios` · `talkback-android`. |
| `at` | yes | **Name and version.** `NVDA 2026.2`, not `NVDA`, and never `latest`. |
| `browser` | yes | **Name and version.** `Firefox 141.0`. |
| `os` | yes | Name and build. `Windows 11 26200`. |
| `tester` | yes | A real name or handle. |
| `date` | yes | ISO `YYYY-MM-DD`, a real calendar day, **not in the future**. |
| `sourceCommit` | yes | `git rev-parse HEAD` **as it was when you ran the session**, not when you submit. |
| `steps` | yes | One entry per scripted step you drove. Non-empty. |
| `steps[].id` | yes | A task id from the component's Tasks table. Never `*`. |
| `steps[].expected` | yes | What the script said to listen for. |
| `steps[].result` | yes | `pass` · `fail` · `partial` · `blocked`. **Not `unrun`** — see §3. |
| `steps[].observed` | on `fail`/`partial` | What you actually heard. |
| `verdict` | yes | Your conclusion for the pairing. May not be `pass` over a failing or blocked step. |
| `defects` | no | Defect ids the session produced, carried into the row's `notes`. |
| `fixture` | no | `true` marks a synthetic record. **Refused against `e2e/at-matrix/` always.** |

No field may contain a `|` or a newline: both would split the markdown row into
the wrong columns. Rephrase rather than escape.

### 2a. Choosing a result

Unchanged from the wave-1 runbook §3a, repeated here because it is the part
that decides whether the matrix tells the truth.

- **`pass`** — every expectation in that step's checklist was met.
- **`fail`** — an expectation was not met. **This publishes as `fail`.** Use it.
- **`partial`** — the step half-worked and the distinction is worth recording.
  It resolves to `fail` at the cell, because `pass` requires every step passed;
  the distinction survives in your row, which is where it is useful.
- **`blocked`** — you started and could not finish (the story would not load,
  the AT crashed). Resolves to `present` — not `pass`, not `fail`.

---

## 3. What the lane refuses, and why each refusal is there

`at:ingest` refuses a record **whole**. There is no partial ingest: a run in
which some rows land and some do not leaves a pairing looking driven that is
not, which is the same falsehood as an invented row arriving by a slower route.

| Rule | Refused when | Why |
|---|---|---|
| `record/shape` | the file is not a JSON object | — |
| `record/component` | no component, or it has no cell | A result for a cell that does not exist cannot be attributed to anything. |
| `record/pair` | not one of the six ids | A cell id is a join key. |
| `record/tester` | missing, `-`, `n/a`, `tbd`, `anonymous` | A result with no named human behind it is worse than `unrun`, because `unrun` is true. |
| `record/at`, `record/browser` | missing, or no version digit, or `latest` | An AT bug is version-specific. A row that does not say which version heard what can be neither reproduced nor retired. `latest` is a different program every month. |
| `record/os` | missing | The pairing does not identify the platform and a reproduction needs it. |
| `record/date` | missing, not ISO, not a real day, **or in the future** | A session that has not happened has no result, and a future date is the cheapest way for a fabricated record to look plausible. `2026-02-30` is refused too — JavaScript would silently read it as 2 March. |
| `record/source-commit` | missing, or not a sha | Without it the row can never go stale and reads as current forever. |
| `record/steps` | absent, empty, or every step `unrun` | **An empty record that ingests successfully is the failure this lane exists to prevent.** An all-`unrun` record is an empty record wearing a result. |
| `record/step-task` | an id the component does not owe, `*`, or repeated | `*` is reserved for the generated "nobody ran this pairing" rows; a `pass` over every task at once is the aggregate the matrix exists to refuse. |
| `record/step-result` | outside the vocabulary, or `unrun` | Inside a submitted session, `unrun` is indistinguishable from an omission. Use `blocked` if you started and could not finish; omit the step if you never drove it. |
| `record/observed` | a `fail`/`partial` with nothing observed | A defect that lives only in a result column is a defect nobody can fix. |
| `record/verdict` | `pass` over a failing or blocked step | A verdict may not be stronger than the steps beneath it. That inversion is the resolver defect TASK-R2-O2 fixed, arriving through the front door. |
| `record/duplicate` | `{pair, task, tester, date}` already recorded | Double-counting one session. A **re-test** is a new record with a later date, which supersedes by date. |
| `record/delimiter` | a `\|` or newline in any field | Would shift every later column. |
| `record/fixture` | `"fixture": true` against the real matrix | A synthetic record may only be ingested into a scratch directory, with `--matrix-dir` and `--allow-fixture`. |

Every one of these is covered by a test in
`packages/tooling/src/quality/at-ingest.spec.ts` (53 tests, all of them
assertions that something is refused), because the only interesting property of
this lane is what it will not accept.

---

## 4. Using it

```bash
# 1. Check the scripts resolve before you spend an hour on a dead story id.
yarn validate:at-scripts

# 2. Dry run — see the exact rows, write nothing.
yarn at:ingest my-session.json --dry-run

# 3. Ingest. Appends the row(s), archives the record, rebuilds index.json.
yarn at:ingest my-session.json

# 4. Gates.
yarn validate:at-matrix
yarn validate:at-runs

# 5. After a batch: re-resolve the at-manual cells.
yarn generate:capability-matrix
yarn validate:capability-matrix
yarn generate:docs-pages
```

Then **file every `fail` and `partial` as a task**, with component · task ·
pairing · AT · severity. A defect that is only in a `notes` column is a defect
nobody is going to fix.

---

## 5. The standing refusal

**No agent may write into `e2e/at-matrix/` any result cell, ever** — not a
placeholder, not an example, not "to demonstrate the format". This is
`<evidence_rules>` in the programme README §5 and a standing refusal in §8. The
record in §2 is an *illustration in a document*, deliberately outside the
matrix. The end-to-end proof of this lane was run against a **scratch copy** of
the matrix in a temporary directory and destroyed; the real matrix is untouched
and reads 534 `unrun`, 0 executed, verified at `4e4e46f`.

`at:ingest` is not exempt from that rule. It is a transcription tool. The
authority for a row is the human named in `tester`, and the tool's only job is
to refuse everything that is not one.
