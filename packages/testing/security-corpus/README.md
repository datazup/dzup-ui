# The security-fixture corpus — schema v1.0.0

**Shared by design between `ui/dzup-ui` (TASK-N1-O5) and `ui/dzup-ui-pro`
(QUAL-04 / TASK-N1-P1).** Pro's task says to *adopt the corpus SCHEMA from OSS
TASK-N1-O5 so fixtures are shared-format*; this directory and
[`../src/security-corpus.ts`](../src/security-corpus.ts) are that schema.

```ts
import type { SecurityFixture, SecuritySink } from '@dzup-ui/testing'
import { fixturesForSink, payloadOf } from '@dzup-ui/testing/security-corpus'
```

> Types come from the barrel; the loader comes from the subpath, because the
> loader reads JSON with `node:fs` and the barrel is imported from setup files
> a consumer may bundle for a browser runner.

---

## 1. Why a fixture has more than one expected outcome

The requirement this corpus answers is *"every fixture states the expected safe
outcome (stripped / escaped / rejected), not merely `does not crash`"*. It does
— **once per sink kind**, and that is not a loophole, it is the only way the
statement can be true:

> `javascript:alert(1)` in an `<a href>` **must be `rejected`** — it executes in
> the host's origin on click.
> The identical string in an `<img src>` is **`inert`** — no shipping engine has
> fetched a `javascript:` subresource this decade.

A single global outcome forces a choice between a corpus that cries wolf on
every image component and one that says nothing about anchors. So
`fixture.outcomes` is a map keyed by {@link SecuritySink}, every entry is a
**required safe outcome**, and a spec asks for the sink it is actually testing.
A sink absent from the map is one the fixture says nothing about — which must
never be read as "anything goes"; `fixturesForSink` omits it rather than
defaulting it.

## 2. The record

```jsonc
{
  "schemaVersion": "1.0.0",
  "category": "url-scheme",
  "description": "…",
  "fixtures": [
    {
      "id": "url-scheme.javascript.plain", // {category}.{family}.{case}, never reused
      "category": "url-scheme",
      "title": "javascript: URL, unobfuscated",
      "payload": "javascript:alert(1)",
      "repeat": 4096, // optional; ALWAYS resolve via payloadOf()
      "outcomes": { // required; empty is a schema violation
        "navigation": "rejected",
        "subresource": "inert"
      },
      "rationale": "…", // required; > 80 chars wherever `inert` appears
      "provenance": "…" // required; where the case comes from
    }
  ]
}
```

### Vocabulary

| `SecurityCategory` | What arrives |
|---|---|
| `url-scheme` | a URL whose scheme decides whether it is a reference or an execution |
| `markup-injection` | a string that is markup, arriving as a label/alt/caption/name |
| `css-injection` | a string reaching a CSS value or a `style` attribute |
| `degenerate-input` | too long, invisible, or read differently by human and machine |
| `file-metadata` | a name, MIME type or size attached to a user-chosen file |
| `encoded-payload` | a value encoded for another system to decode and act on |

| `SecuritySink` | Where it lands |
|---|---|
| `navigation` | the URL is **followed** (`<a href>`, form action) — the only sink where `javascript:` runs |
| `subresource` | the URL is **fetched** (`<img src>`, `background-image`) |
| `html` | the value reaches an HTML parser (`v-html`, `innerHTML`, markdown/mermaid render) |
| `text` | the value becomes a text node |
| `attribute` | the value becomes an attribute value |
| `style` | the value becomes a CSS declaration |
| `encoded-payload` | the value is encoded for another system |
| `file` | a `File` the user chose reaches the model |

| `NeutralizationOutcome` | Observably true afterwards |
|---|---|
| `rejected` | the value never reached the sink — no attribute rendered, or an error emitted |
| `stripped` | the dangerous part removed, the remainder kept |
| `escaped` | present **verbatim, as data**: readable, and it built no element, attribute or handler |
| `inert` | present verbatim and the sink cannot act on it — **requires a stated reason** |

There is deliberately **no value for "unsafe"**. A measurement needs one, and it
belongs to the measuring code, not to the schema: OSS calls it `passed-through`
in `packages/core/security/boundary-suites.ts`.

## 3. How to consume it (the shape Pro's sink registry wants)

Each registry entry names its component, its file, its **sink kind**, and its
content source. That sink kind is the key into `outcomes`, so no translation
table is needed:

```ts
for (const entry of sinkRegistry) {
  for (const fixture of fixturesForSink(entry.sink, categoriesFor(entry))) {
    const measured = render(entry, payloadOf(fixture))
    expect(measured).toBe(fixture.required) // `required` is the outcome for THIS sink
  }
}
```

When a component does **not** meet a required outcome, do not weaken the
fixture. Record the measurement in a deviation register and assert the recorded
value, so both directions fail — a regression, and a fix that nobody removed the
entry for. OSS's is
[`packages/core/security/security-deviations.json`](../../core/security/security-deviations.json);
each entry carries `severity`, `publicBehaviourChange` and a reason, and the
triple count is a ratchet that only falls.

## 4. Scope — defensive only

Minimal, inert, well-worn representatives from public suites (cure53's DOMPurify
cases, the OWASP filter-evasion list, WHATWG URL parsing rules). **No generator,
no mutation engine, no encoder.** A corpus exists to prove neutralization;
anything that *produces* payloads is a different kind of tool with a different
reason to exist, and it does not belong here.

## 5. Changing it

- New category or sink value, new optional field → **minor** bump.
- A field changing meaning, or an id reused for a different payload → **major**
  bump. A file whose major does not match the module's is rejected, not
  best-effort parsed, because deviation registers in both repositories pin
  expectations to ids.
- `packages/testing/src/security-corpus.spec.ts` validates every file on disk,
  fails on an orphan file or a missing category, and refuses an `outcomes` map
  that is empty.
