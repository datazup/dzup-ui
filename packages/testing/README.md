# `@dzup-ui/testing`

Test-side support for dzup-ui consumers: a DOM environment installer, the
contract-conformance helpers for anatomy, keyboard, RTL and composition, the
shared **security fixture corpus**, and the **security conformance runner**.

Everything here is runner-independent. No module imports `vitest`, `jest` or
`expect`: the rules live in a `check*` function that returns problems, and an
`expect*` wrapper throws. Use it from Vitest, Jest, or anything that can run
JavaScript.

```ts
import { expectAnatomy, installDzupUiDomTestEnvironment } from '@dzup-ui/testing'
```

| Import path | What it is |
|---|---|
| `@dzup-ui/testing` | Types, the conformance helpers, `installDzupUiDomTestEnvironment()` |
| `@dzup-ui/testing/vitest` | A setup module imported for its effect: put it in `setupFiles` |
| `@dzup-ui/testing/security-corpus` | The fixture data loader — reads JSON with `node:fs` |
| `@dzup-ui/testing/security-conformance` | The conformance runner (below) |

> The two security subpaths are **not** re-exported as runtime from the barrel.
> They read files, and the barrel is imported from setup files a consumer may
> bundle for a browser runner. Types come from the barrel; runtime comes from the
> subpath.

---

## Security conformance: `import`, `run`, `report`

`@dzup-ui/testing/security-corpus` publishes the fixture *format*: one hostile
input, and per sink kind the outcome that sink owes. A format is a description —
any implementation of `DzSanitizerAdapter` can claim to honour it. The runner
turns that into a measurement.

```ts
import { expectSecurityConformance, runSecurityConformance } from '@dzup-ui/testing/security-conformance'
import { myAdapter } from './my-sanitizer.ts'

const report = runSecurityConformance(myAdapter, {
  adapterName: 'acme-app:dompurify',
  sourceCommit: process.env.GIT_SHA,
})

expectSecurityConformance(report) // throws with every failing cell in one message
console.warn(report.cells, report.nonConforming, report.lossy)
```

The adapter is accepted **structurally** — `{ policyName, limits, sanitize }`.
A real `DzSanitizerAdapter` from `@dzup-ui/contracts` satisfies it, and so does
anything a host installs on `DzProvider`. The runner never imports the adapter's
package.

### The report

```json
{
  "runner": "@dzup-ui/testing/security-conformance",
  "runnerVersion": "1.0.0",
  "corpusVersion": "1.1.0",
  "corpusSchemaVersion": "1.1.0",
  "corpusFingerprint": "5c0f0b50ff53c648eb056848ecf9b3a2",
  "adapter": "acme-app:dompurify",
  "cells": 10,
  "counts": { "blocked": 1, "escaped": 0, "stripped": 9, "passed-through": 0, "unchanged": 0 },
  "lossy": 0,
  "nonConforming": 0,
  "unasserted": [],
  "failClosed": {
    "absentAdapter": "refused",
    "throwingAdapter": "blocked",
    "identityAdapter": "non-conforming",
    "emptyApplicableSet": "refused"
  },
  "verdicts": { "markup-injection.img.onerror:html": "stripped" }
}
```

Record it. `verdicts` is the part to diff on every run: it is keyed
`"<fixtureId>:<sink>"`, so a policy change surfaces as a named cell that moved
rather than as a count that drifted. `corpusVersion` and `corpusFingerprint` are
what make a stale recording *visible* — pin them, and a corpus update shows up as
a version bump rather than a silent difference.

### Verdict classes, not output strings

Two conforming sanitizers legitimately differ in whitespace, attribute order and
entity spelling. The runner asserts the **class** of what happened:

| Verdict | Meaning |
|---|---|
| `blocked` | `sanitize()` threw. The value never reached the sink |
| `escaped` | Every tag came back as text; the output builds no markup |
| `stripped` | Markup survived, carrying no dangerous element, attribute or scheme |
| `passed-through` | A dangerous construct survived. **Never conforming** |
| `unchanged` | The adapter returned its input byte for byte — the one thing `sanitize` promises not to do |

Which verdict satisfies which required outcome is a **matrix, not an ordering**:

| Fixture requires | Satisfied by | Why not the rest |
|---|---|---|
| `rejected` | `blocked` | The fixture says the value must not reach the sink; a sanitised string is a different thing, however safe |
| `stripped` | `blocked`, `stripped`, `escaped` | Escaping removes strictly more attack surface than stripping. It is counted as `lossy`: safe, but the host asked for rich content and got text |
| `escaped` | `blocked`, `escaped` | **Not** `stripped` — a value that must render as text and instead renders as sanitised markup has had its meaning changed |
| `inert`, `admitted` | *nothing — reported unasserted* | Both are claims about a sink's nature, not obligations a sanitizer can discharge |

### It fails closed, and an empty run is a failure

A security suite that passes because it found nothing to test is
indistinguishable from one that ran, so the runner refuses instead:

- `runSecurityConformance(null)` **throws** `SecurityConformanceRefusal`. There is
  no "no adapter installed, so everything is fine" result.
- A run with no assertable cell **throws** the same way — including the case where
  every fixture names only sinks a sanitizer does not guard.
- Every report carries `failClosed`, and each of its four values is **measured by
  actually doing the thing**, not asserted. If any reads `NOT FAIL-CLOSED`,
  `expectSecurityConformance` reports that before any cell, because it means the
  runner itself could bless an adapter that is absent, throwing or a stub.

### Sinks the runner asserts

Only the corpus sinks whose guard *is* `sanitize()`: `html`, `markdown`,
`mermaid-svg`. A `navigation` sink is guarded by the URL policy, a `file` sink by
the upload policy, a `text` sink by the framework's own escaping — asking a
sanitizer about those would produce a number that looks like evidence and is not.

Of the three, only `html` hands the adapter the fixture payload. For `markdown`
and `mermaid-svg` the payload is *renderer source*, and the adapter sees whatever
HTML the renderer produced. Those cells are reported **unasserted with a named
reason** until you supply the renderer:

```ts
const report = runSecurityConformance(myAdapter, {
  adapterName: 'acme-app:dompurify',
  renderers: { markdown: source => myMarkdownRenderer.render(source) },
})
```

That is the seam by which a tier that owns a renderer proves conformance against
this corpus without dzup-ui importing a line of its source.

### Bringing your own fixtures

`options.fixtures` replaces the corpus. Anything satisfying `SecurityFixture`
works, so a consumer can extend the shared corpus with its own cases and still
run one runner:

```ts
import { loadAllSecurityFixtures } from '@dzup-ui/testing/security-corpus'

runSecurityConformance(myAdapter, {
  adapterName: 'acme-app:dompurify',
  fixtures: [...loadAllSecurityFixtures(), ...myOwnFixtures],
})
```

Validate your own files with `assertCorpusFile()` first, and point their
`$schema` at `node_modules/@dzup-ui/testing/security-corpus/security-corpus.schema.json`.
A fixture that does not validate is not a fixture; it is a comment.

### Versioning

Three versions move independently, and conflating them is how a recorded result
becomes quietly wrong:

| Version | Versions what | Bumped |
|---|---|---|
| `SECURITY_CORPUS_SCHEMA_VERSION` | the record *shape* | minor for a new category/sink/outcome or optional field; major when a field changes meaning |
| `SECURITY_CORPUS_VERSION` | what the fixtures *say* | minor when a fixture is added; **major when an outcome changes**, a fixture is removed, or an id is repurposed |
| `SECURITY_CONFORMANCE_RUNNER_VERSION` | *how* a verdict is decided | major when a classification or the satisfaction matrix changes meaning |

`CORPUS_VERSION_FINGERPRINTS` records the expected content digest for each
released `SECURITY_CORPUS_VERSION`, so a fixture edit that forgets the bump fails
here rather than in a consumer's stale result.

---

## The corpus itself

Data, schemas, the outcome vocabulary and how to contribute a fixture:
[`security-corpus/README.md`](./security-corpus/README.md).

## Licence

MIT.
