# Security fixture corpus (schema v1.1.0)

**The corpus is shared on purpose between `ui/dzup-ui` (TASK-N1-O5, TASK-R3-O4) and
`ui/dzup-ui-pro` (QUAL-04, TASK-N1-P1, TASK-R2-P9).** Both repositories use one
fixture format and one outcome vocabulary. This directory holds the data and the
JSON Schemas. [`../src/security-corpus.ts`](../src/security-corpus.ts) holds the
types, the checker and the loader.

```ts
import type { PeerCompatibilityFixture, SecurityFixture, SecuritySink } from '@dzup-ui/testing'
import { fixturesForSink, payloadOf } from '@dzup-ui/testing/security-corpus'
```

> Import types from the barrel and the loader from the subpath. The loader reads
> JSON with `node:fs`, and a consumer may bundle the barrel's setup files for a
> browser runner.

The format is published in three forms, and `yarn validate:security-corpus`
fails if they ever disagree:

| Form | File | Who reads it |
|---|---|---|
| TypeScript types | `src/security-corpus.ts` | Code that loads fixtures |
| Checker (**the authority**) | `checkCorpusFile()` · `checkPeerCompatibilityFile()` | The loader, specs, and the gate. It also enforces the rules JSON Schema cannot express, such as unique ids |
| JSON Schema (draft-07) | [`security-corpus.schema.json`](./security-corpus.schema.json) · [`peer-compatibility.schema.json`](./peer-compatibility.schema.json) | Editors (through `$schema`), other repositories, and the gate |

---

## 1. Why a fixture has more than one expected outcome

This corpus answers one requirement: *every fixture states the expected safe
outcome, not merely "does not crash"*. A fixture states that outcome **once per
sink kind**. That is not a loophole. It is the only way the statement can be true:

> `javascript:alert(1)` in an `<a href>` **must be `rejected`**: it runs in the
> host's origin when the link is clicked.
> The same string in an `<img src>` is **`inert`**: no shipping browser has
> fetched a `javascript:` subresource in over a decade.

With one global outcome, a corpus either raises false alarms on every image
component or says nothing about anchors. So `fixture.outcomes` is a map keyed by
sink. Every entry is a **required** outcome, and a spec asks for the sink it
actually tests. A sink missing from the map means the fixture says nothing about
it. Never read that as "anything goes". `fixturesForSink` leaves such a fixture
out instead of filling in a default.

## 2. The record

```jsonc
{
  "$schema": "./security-corpus.schema.json", // optional; lets an editor validate
  "schemaVersion": "1.1.0", // the major must match the module's
  "category": "url-scheme", // one category per file
  "description": "…",
  "fixtures": [
    {
      "id": "url-scheme.javascript.plain", // {category}.{family}.{case}, lowercase kebab, never reused
      "category": "url-scheme",
      "title": "javascript: URL, unobfuscated",
      "payload": "javascript:alert(1)",
      "repeat": 4096, // optional; ALWAYS resolve through payloadOf()
      "outcomes": { // required; an empty map is a violation
        "navigation": "rejected",
        "subresource": "inert"
      },
      "rationale": "…", // required; > 80 chars wherever `inert` or `admitted` appears
      "provenance": "…", // required; where the case comes from
      "extensions": { // optional; consumer data, namespaced
        "com.dzup.pro": { "mustNotSurvive": ["javascript:"] }
      }
    }
  ],
  "extensions": { "com.dzup.pro": { "policy": "…" } } // optional, file level
}
```

**Unknown keys are rejected.** Data that only one consumer understands goes under
`extensions["<reverse-dns namespace>"]`. That is the same convention as
`$extensions["com.dzup"]` in the DTCG token export. A reader skips a namespace it
does not know. An extension never changes the meaning of a shared field. The
rule exists because otherwise a `why` would sit next to `rationale`, a
`mustNotSurvive` next to `outcomes`, and each would be readable by only one
repository. That is a second vocabulary growing inside the first.

The **family** segment of the id holds a consumer's finer taxonomy. Pro's
`event-handler` payloads become `markup-injection.event-handler.*`, so nobody has
to add a category for a distinction that only one repository draws.

### Vocabulary

| `SecurityCategory` | What arrives |
|---|---|
| `url-scheme` | a bare URL whose scheme decides whether it is a reference or runs as code |
| `markup-injection` | a string that is markup, including URLs *inside* markup |
| `css-injection` | a string reaching a CSS value or a `style` attribute |
| `degenerate-input` | input that is too long, invisible, or read differently by a human and a machine |
| `file-metadata` | a name, MIME type or size attached to a file the user chose |
| `encoded-payload` | a value encoded for another system to decode and act on |

| `SecuritySink` | Where it lands |
|---|---|
| `navigation` | the URL is **followed** (`<a href>`, form action). The only sink where `javascript:` runs |
| `subresource` | the URL is **fetched** (`<img src>`, `background-image`) |
| `html` | the value reaches an HTML parser (`v-html`, `innerHTML`) |
| `markdown` | the value is **Markdown source**: a parser builds the HTML, then the HTML reaches an HTML parser. *(1.1.0)* |
| `mermaid-svg` | the value is **Mermaid source**: a renderer builds SVG, then the SVG reaches an HTML parser. *(1.1.0)* |
| `text` | the value becomes a text node. An escaping guard in front of an HTML sink turns it into this sink |
| `attribute` | the value becomes an attribute value |
| `style` | the value becomes a CSS declaration |
| `encoded-payload` | the value is encoded for another system |
| `file` | a `File` the user chose reaches the model |

`markdown` and `mermaid-svg` use the same spelling as the `DzSanitizeSink` contexts
in `@dzup-ui/contracts` (the sanitizer seam, TASK-R3-O2). So when a sink-registry
row's context is one of them, that context is also the corpus key. Neither
`markdown` nor `mermaid-svg` is folded into `html`: in a raw-HTML sink, Markdown
source is inert text that proves nothing.

| `NeutralizationOutcome` (strongest first) | What must be observably true afterwards |
|---|---|
| `rejected` | the value never reached the sink: no attribute rendered, or an error emitted or thrown |
| `stripped` | the dangerous part was removed and the rest kept |
| `escaped` | the value is present **verbatim, as data**: readable, and it built no element, attribute or handler |
| `inert` | the value is present verbatim and the sink cannot act on it. **Needs a rationale longer than 80 characters** |
| `admitted` | the value reaches the sink **live and unchanged because a named policy deliberately admits it**. Examples: an IDN hostname a URL allowlist accepts, a document under a size ceiling. Not a neutralization. **Needs a rationale longer than 80 characters that names the policy.** *(1.1.0)* |

The sanitizer seam maps onto these outcomes as follows. A real
`DzSanitizerAdapter.sanitize()` gives `stripped`. Core's default escaping adapter
gives `escaped`. A `DzSanitizeLimitError` gives `rejected`. When an outcome
depends on a size ceiling, state it at the seam's default limits
(`maxLength 131072`, `maxDepth 64`).

There is deliberately **no value for "unsafe"**. A measurement needs one, and
it belongs to the measuring code, not to the schema. OSS calls it
`passed-through` in `packages/core/security/boundary-suites.ts`. A runner has to
**classify** what it observed into one of the values above. Checking only that
nothing forbidden survived is weaker than every value except `admitted`.

## 3. Peer compatibility: absent, installed, incompatible

[`peer-compatibility.fixtures.json`](./peer-compatibility.fixtures.json) records
what a consumer must be told when a peer that a package declares is **absent**,
**installed** (in range) or **incompatible** (installed outside the range). The
incompatible case is the one neither repository's consumer matrix covered. A
fixture sits beside a consumer-matrix lane and does not replace it. The lane is
*how* the install state is produced. The fixture is *what* must then be true.

```jsonc
{
  "id": "peer.vue.wrong-major", // peer.{peer slug}.{case}; the slug is peerSlug(peer)
  "title": "…",
  "dependent": "@dzup-ui/core", // the package that declares the peer
  "peer": "vue",
  "declaredRange": "^3.5.0", // verbatim from peerDependencies
  "optional": false, // peerDependenciesMeta[peer].optional
  "state": "incompatible", // absent · installed · incompatible
  "installedVersion": "2.7.16", // exact; null exactly when absent
  "diagnostics": [ // required for absent and incompatible
    { "stage": "validate", "severity": "error", "mustContain": ["vue", "^3.5.0", "2.7.16 does NOT satisfy"] }
  ],
  "rationale": "…",
  "provenance": "…"
}
```

`stage` is where the consumer is told: `install` (the package manager's
`ERESOLVE`), `validate` (a repository's peer gate), `build` (the bundler) or
`runtime` (the component, for example a missing-dependency panel). At least one
`mustContain` string must name the peer. Not crashing is not the promise. Telling
the consumer **which** package to install or change is.

OSS **executes** every `validate`-stage diagnostic against the same check
`yarn validate:peers` runs (`packages/tooling/src/validators/peer-ranges.ts`). It
also binds `declaredRange` and `optional` to the dependent's real `package.json`,
so a record cannot outlive the declaration it describes. OSS declares no optional
peer today, so its records use required peers. A repository with an optional
peer, such as Pro's `pdfjs-dist`, adds records with `install` and `runtime`
diagnostics and asserts them in its own consumer matrix.

## 4. How to consume it

A sink-registry row names a sink kind. That kind is the key into `outcomes`:

```ts
for (const entry of sinkRegistry) {
  for (const fixture of fixturesForSink(entry.sink, categoriesFor(entry))) {
    const measured = classify(render(entry, payloadOf(fixture))) // one of the outcomes above
    expect(measured).toBe(fixture.required)
  }
}
```

A repository that keeps its own fixture files outside this directory validates
them with `assertCorpusFile(JSON.parse(text), name)` or
`assertPeerCompatibilityFile(…)`, and points each file's `$schema` at
`node_modules/@dzup-ui/testing/security-corpus/<schema>.json`.

When a component does **not** meet a required outcome, do not weaken the
fixture. Record the measurement in a deviation register and assert the recorded
value. Then a regression fails, and so does a fix whose entry nobody removed.
OSS's register is
[`packages/core/security/security-deviations.json`](../../core/security/security-deviations.json).

## 5. Contributing a fixture

1. **Choose the file by category.** Add a fixture to the matching
   `{category}.corpus.json`. Do not create a new category for a finer
   distinction: put it in the id's family segment. A new category, sink or
   outcome is a schema change (see §7), not a fixture change.
2. **Write the record.** Use a new id that has never been used, and a minimal,
   well-known payload with its provenance. Write one outcome for each sink the
   payload is meaningful in, never for sinks it is not. Write a rationale that
   explains every `inert` and names the policy behind every `admitted`.
   Consumer-only data goes under `extensions`. With `$schema` set, your editor
   flags most mistakes as you type.
3. **Run the gate:** `yarn validate:security-corpus`. It checks every file against
   the JSON Schema and the checker, and rejects a JSON file in this directory
   that is not a category file, the peer file or a schema.
4. **Run the consumers:**
   `yarn vitest run packages/testing/src/security-corpus.spec.ts packages/core/security`.
   A new fixture reaches every OSS component bound to its sinks. If a component
   does not meet the outcome, record a deviation (§4). Do not change the fixture.
5. **Add a changeset** for `@dzup-ui/testing` (§7).

## 6. Scope: defensive only

Use minimal, inert, well-known representatives from public suites: cure53's
DOMPurify cases, the OWASP filter-evasion list, the WHATWG URL parsing rules.
**No generator, no mutation engine, no encoder.** A corpus exists to prove that
inputs are neutralized. A tool that *produces* payloads is a different kind of
tool with a different reason to exist, and it does not belong here.

## 7. Changing the format

- A new category, sink or outcome value, or a new optional field → **minor**
  schema bump. Update the exported constant, both JSON Schemas and this README
  together. The gate fails on a mismatch. Migrate every data file's
  `schemaVersion` in the same change.
- A field that changes meaning, or an id reused for a different payload →
  **major** schema bump. A file whose major does not match the module's is
  rejected, not parsed on a best-effort basis, because deviation registers in
  both repositories pin their expectations to ids.
- The package version follows `packages/contracts/VERSIONING.md`. Anything that
  makes the checker refuse a file it used to accept is breaking, which in `0.x`
  means a `minor` changeset.
