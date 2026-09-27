# Recorded API surfaces

Baselines for `yarn release:api-diff` (TASK-R1-O3). One file per recorded
commit, named `<short-sha>.json`, holding the public surface of **every**
package `release-policy.json` classifies as `published`, read through the
TypeScript compiler from the **packed** declarations.

## Why this exists

Nothing has ever been published (`npm` 404 for every `@dzup-ui/*` name) and no
release tag exists, so there is no "previous version" to diff a candidate
against. Without a recorded surface the diff degrades to `manifest-only`
fidelity: additions and removals are still real, but **signature changes are
undetectable** and a rename cannot be told from a removal plus an addition.

Running `yarn release:api-surface:record` once on a **clean** commit is the only
thing that moves the tool to full fidelity. It refuses on a dirty tree, because
a baseline taken from a tree nobody can check out is a number with no referent —
the next release would report changes against content that exists in no commit,
which is 08-11 doc 08's first release stop condition.

## `-INADMISSIBLE`

A file whose name ends `-INADMISSIBLE` was written with `--force` from a dirty
worktree. It carries `provenance.admissible: false` and it is **skipped by
default baseline selection** — `release:api-diff` falls back to `manifest-only`
rather than silently diffing against content nobody can reproduce. It can still
be selected explicitly with `--against <prefix>`, which is how the tool's own
seeded-removal proof is run.

`527dbd1-INADMISSIBLE.json` is the first surface this repository ever recorded,
at `527dbd1` + 220 uncommitted paths. It is kept as the machinery's proof, not
as a baseline. **Owner decision:** delete it once a clean `527dbd1` (or its
successor) has been recorded properly, or keep it as a reference — either is
fine, but it must never become the baseline a release is measured against.

## Reproducibility

Two consecutive `--record` runs over the same tree produce **byte-identical**
`surfaces` blocks (only the `provenance.generatedAt` timestamp differs). That is
load-bearing and was not free: the first implementation embedded the scratch
directory's absolute path inside every cross-package type string, so a surface
differed from itself on the next run and a diff invented 185 signature changes.
`normaliseSignature` in `src/release/api-surface.ts` is what fixes it, and
`release.spec.ts` pins the two rewrites.

## Size

A recorded surface is ~1.7 MB, dominated by `@dzup-ui/core`'s 1,325 symbols with
their full prop/emit/slot lists. That is the point — a name-level baseline is
what the manifest already was, and it could not see a prop's type change.
