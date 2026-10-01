---
"@dzup-ui/contracts": patch
---

Record the repository-wide deprecation ledger in `VERSIONING.md`.

§4 stated, in its own words, that *"There is no repository-wide ledger of
deprecated symbols"* and that *"Nothing records a deprecated prop, part or
state"*, and closed with *"That gap is recorded, not closed here."* The first
half of that is no longer true: `packages/contracts/deprecations.json` is the
ledger, and `yarn validate:deprecations` keeps it honest in both directions —
it fails on an annotation with no record **and** on a record whose annotation
has disappeared.

Measured at `4e4e46f`: 16 annotated symbols, 16 with a record, 0 without
(`compat` 11 · `core` 2 · `tokens` 2 · `nuxt` 1).

The two narrower registers it names — `retired-package-names.json` for package
names and `DEPRECATED_TOKENS` for design tokens — are explicitly **not**
superseded, because they govern things a symbol ledger cannot.

The second half of the gap is left open and now says so precisely: a deprecated
**prop, part or state** still has no record and no gate.

Documentation only. `VERSIONING.md` ships in this package's `files`, so the
published content changes; no code, type or export is affected. The ledger file
itself is not shipped (`files` is `LICENSE`, `VERSIONING.md`, `dist`).
