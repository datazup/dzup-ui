# Integration assessment — the uncommitted tree against `origin/main`, 2026-09-30

**Repository** `ui/dzup-ui` · **local HEAD** `4e4e46f` (unchanged since 2026-09-22) · **dirty paths** 459
· **`origin/main`** `f9c66e6a` — **92 commits ahead, 0 behind**, 884 files, all by the second developer
(2026-09-22 … 2026-09-29).

Every RESIDUAL-01 … RESIDUAL-18 report in this directory is bound to `4e4e46f`. None of them looked at
the remote. This note measures what integrating will cost, so the owner sees it before committing.

## 1. How it was measured — nothing in the checkout was changed

A snapshot commit of the working tree was built through a **temporary index file**
(`GIT_INDEX_FILE`, `git add -A`, `git write-tree`, `git commit-tree -p HEAD`) and merged in memory with
`git merge-tree --write-tree <snapshot> origin/main`. No branch, ref, index or working file moved:
`git status --porcelain` is byte-identical before and after. The snapshot (`464e200b`) is an
unreferenced object and will be garbage-collected. The only state change is `git fetch origin`.

## 2. Result — 171 conflicted files, of which about 14 need a person

| Class | Files | How it resolves |
|---|---:|---|
| Generated docs pages — `apps/docs/components/*.md`, `apps/docs/evidence/*.md`, `nav.json` | 152 | take either side, then `yarn regenerate:all` |
| Generated artifacts — `capability-matrix.json`, `component-meta.json`, `component-ownership.manifest.json`, `capability.generated.ts`, `playground/seeds.json` | 5 | same |
| **Manifests** — root `package.json`, `apps/landing/package.json`, `apps/landing/playground-template/package.json`, `packages/codemods/tsconfig.json`, `yarn.lock` | 5 | by hand, then one `yarn install` (owner's) |
| **`apps/sandbox/package.json`** — modify/delete | 1 | upstream **deleted `apps/sandbox`** (D177); drop the local edit |
| **Source** — `AutoAnimateListDemo.vue`, `packages/tooling/src/release/report.ts`, `validators/peer-icon-duplicates.spec.ts` | 3 | by hand (§3) |
| **Programme docs** — `program-2026-09-04/EXECUTION-STATUS.md`, `…/TASK-R2-O1-handoff.md`, `program-2026-09-22-architecture/custody-and-release-tasks.md`, `program-2026-09-22-planning/README.md`, `e2e/visual/README.md` | 5 | by hand; both sides appended |

A further **20 hand-authored files merge without a textual conflict and still need reading**, because
both sides edited them: 14 components (`DzCalendar`, `DzDataGridHeader`, `DzOrderList`, `DzCascader`,
`DzCombobox`, `DzDatePicker`, `DzDateRangePicker`, `DzListbox`, `DzMultiSelect`, `DzSelect`,
`DzTimePicker`, `DzTransfer`, `DzTreeSelect`, `DzMegaMenu` — upstream's side is the icon-package swap),
`CLAUDE.md`, `README.md`, `packages/contracts/VERSIONING.md`, `planning-docs-disposition.md`,
`release.spec.ts`, `registry.spec.ts`.

## 3. Where upstream and this programme did the same thing twice

| Topic | Upstream | Local | After the merge |
|---|---|---|---|
| auto-animate timers | `2a1d6f28` — a **test-side** guard, `apps/landing/src/test-support/autoAnimateTimers.ts`, wired into `pages.a11y.spec.ts` and `pages.interactions.spec.ts` | RESIDUAL-18 — the **source** fix, `motion/autoAnimate.ts`, and the test-local workaround deleted | the upstream guard becomes redundant; keep the source fix, then decide whether to delete the guard |
| `AutoAnimateListDemo.vue` | icon import → `@lucide/vue` | `autoAnimate` import → the motion barrel | take both lines |
| icon duplicates | `63c1325d` swapped `lucide-vue-next` for `@lucide/vue` (D174/D175) | register row #3 proposed aligning two ranges | local row is obsolete |

## 4. Local ledger claims that `origin/main` has already overtaken

These are true at `4e4e46f` and false at `f9c66e6a`. They are not corrected in place here, because the
reports are bound to a commit; they must not be quoted after a merge without re-measuring.

- **ADR-18, ADR-19, ADR-20 are Accepted** upstream (`4885d0e5`, owner, 2026-09-26). `CLAUDE.md` and the
  ratchet board still say `Proposed` and `maxProposedCitedFromCode` **3**.
- **The Node floor is decided** (`dd8efad1`) — the register calls it one of the two highest-leverage open
  decisions.
- **The visual lane runs in a pinned Linux container with Linux baselines** (`7f340779`, `f0239753`), and
  TASK-R2-O6's capture blocker is recorded as discharged (`bce1312a`).
- **Size budgets**: D135 raised 12 breached budgets, D140 added a blocking per-export size gate, and
  O7-D1's size half is recorded (`a6150b6f`). The "22 stale `perf-baseline` cells, ceiling 22" figure
  will move.
- **`apps/sandbox` no longer exists.**
- **Release path**: publishing goes through `yarn npm publish` to `registry.npmjs.org` (`ac0370a1`,
  `873984db`), and a changeset audit re-levelled entries (D180).
- `validate:all`'s link count (62 here) and the capability totals (558 / 611 / 397) are both certain to
  differ after regeneration on the merged tree.

## 5. What this means for the order of work

1. **Commit first, merge second.** The 459 paths have no git safety net, and the merge cannot even be
   attempted on an uncommitted tree. This has been the owner's first act since 2026-09-25; it is now
   also the precondition for picking up eight days of upstream work.
2. After the merge: resolve the ~14 files in §2, run `yarn install` once, `yarn regenerate:all`, then
   `yarn validate:all` and `yarn test`, and re-seed gate 8's `evidenceCells` record from the merged tree
   in one declared move.
3. Further residual batches should stay out of the files in §2 and §3 where they can. Upstream did not
   touch `packages/tooling/src/quality/` or `validators/capability-matrix*`, so evidence-audit work
   there does not add to the conflict set beyond the generated artifacts that already conflict.
