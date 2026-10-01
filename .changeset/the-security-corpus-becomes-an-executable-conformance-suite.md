---
"@dzup-ui/testing": patch
---

Publish a security-conformance runner, and extend the corpus for the Form System
and Graph & Flow specs (TASK-S3-O3).

The corpus has been a published **format** since TASK-R3-O4: one hostile input,
and per sink kind the outcome that sink owes. A format is a description — any
implementation of `DzSanitizerAdapter` can claim to honour it, and nothing
checked. This makes it executable.

**New subpath `@dzup-ui/testing/security-conformance`.** `runSecurityConformance(adapter, options)`
takes any `DzSanitizerAdapter`-shaped object plus the versioned corpus and returns
a per fixture × sink verdict report; `expectSecurityConformance(report)` throws
with every failing cell in one message. Verdicts are **classes** (`blocked`,
`escaped`, `stripped`, `passed-through`, `unchanged`), never output strings, so a
DOMPurify patch release that changes whitespace does not turn the suite red.
Which verdict satisfies which required outcome is a documented matrix rather than
an ordering: escaping where stripping was required conforms and is reported
`lossy`; stripping where escaping was required does not conform.

**It fails closed.** A run with no adapter throws rather than reporting a clean
result, and so does a run with no assertable cell — including the case where every
fixture names only sinks a sanitizer does not guard. Every report carries a
`failClosed` block whose four values are measured by actually doing the thing, so
a suite cannot go green because it found nothing to test.

**Five fixtures added** (34 → 39), from Form System spec doc 06 §10 and Graph &
Flow spec doc 06 §"Security and trust boundary": a document-provided option label
that is a template expression, renderer options spread onto an element as event
attributes, a Markdown reference-link definition pointing at `javascript:`, an SVG
label carrying `xlink:href="javascript:"`, and a 200-deep element nesting bomb.
The last two are the first fixtures for the `mermaid-svg` and `markdown` sinks the
format has carried since schema 1.1.0, and the nesting bomb is the first fixture
for the `DzSanitizeLimits` depth ceiling.

**A corpus *content* version, separate from the schema version.**
`SECURITY_CORPUS_VERSION` (1.1.0) versions what the fixtures say, with a content
fingerprint recorded per release, so a fixture edit that forgets the bump fails
locally instead of making a downstream recorded conformance result quietly wrong.
`SECURITY_CORPUS_SCHEMA_VERSION` is unchanged at 1.1.0 — no field changed meaning
and no vocabulary value was added.

Additive: no existing fixture's id, payload or outcomes changed, no existing
export changed, and nothing that used to be accepted is now refused. A `patch`
per `required-export-subpaths.json`'s rule for adding a subpath, and per
`packages/contracts/VERSIONING.md`, where `0.x` reserves `minor` for breaking
changes.
