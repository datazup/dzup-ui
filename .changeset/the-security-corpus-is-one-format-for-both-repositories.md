---
"@dzup-ui/testing": minor
---

**The security fixture corpus is now a published format, not just TypeScript to read: JSON Schema, a stricter checker, and a fixture for peers installed at the wrong version.**

`@dzup-ui/testing/security-corpus` moves to **schema 1.1.0**. Until now the only
way to learn the format was to read the source. A second repository had no schema
to validate its fixture files against, so "shared format" was a promise nothing
checked.

**New: JSON Schemas shipped beside the data.** `security-corpus/security-corpus.schema.json`
and `security-corpus/peer-compatibility.schema.json` (draft-07) are in the tarball.
Their paths are exported as `SECURITY_CORPUS_SCHEMA_FILE` and
`PEER_COMPATIBILITY_SCHEMA_FILE`. Point a fixture file's `$schema` at one and your
editor validates it as you type.

**Vocabulary additions:**

- sinks `markdown` and `mermaid-svg`. They use the same spelling as the sanitizer
  seam's `DzSanitizeSink` contexts, so Markdown or Mermaid source is never sent to
  a raw-HTML sink, where it would prove nothing.
- outcome `admitted`: the value reaches the sink live because a named policy
  deliberately allows it (an internationalized hostname, a document under the size
  ceiling). It is not a neutralization, and like `inert` it requires a rationale
  longer than 80 characters.
- `extensions["<reverse-dns namespace>"]` on files and fixtures, for data that
  only one consumer understands.

**New: peer-compatibility fixtures.** `PeerCompatibilityFixture` describes a
declared peer that is `absent`, `installed` or **`incompatible`**, and the
diagnostic a consumer must then see (`install` · `validate` · `build` · `runtime`,
naming the peer). Load them with `loadPeerCompatibilityFixtures()`; validate your
own with `checkPeerCompatibilityFile()`. The first incompatible record is Vue 2.7
installed against `vue ^3.5.0`.

**Breaking (minor, under `packages/contracts/VERSIONING.md`):** `checkCorpusFile()`
now refuses some files it used to accept:

- **Keys the format does not define.** Move consumer-specific data under
  `extensions`.
- **Ids that are not `{category}.{family}.{case}` in lowercase kebab segments.**
- **An `inert` claim with a rationale of 80 characters or fewer.** The README
  already stated this rule, but only this package's own spec enforced it.

`SecuritySink` and `NeutralizationOutcome` also gain values, so an exhaustive
`switch` over `fixture.required` needs the new cases. No existing fixture id,
payload or required outcome changed. The 34 fixtures only gained `$schema` and
the new `schemaVersion`.
