# Security corpus — OSS schema 1.1.0 vs Pro's corpus (input to Pro TASK-R2-P9)

> **Bound to:** OSS `ui/dzup-ui` `main` @ `569d887` + dirty tree (TASK-R3-O4) ·
> Pro `ui/dzup-ui-pro` `esmir` @ `1c55355`. Pro's corpus files were last changed
> at `90b8917` and were read, not edited.
> **Pro inputs:** `packages/pro/tests/security/corpus/html.json` (33 payloads) ·
> `corpus/markdown.json` (13) · `corpus.security.spec.ts` (the runner, 96 tests) ·
> `packages/pro/manifests/html-sinks.manifest.json` (13 sinks) ·
> `fixtures/consumers/{README.md,optional-peer/}`. The paths TASK-R3-O4 named are
> still right.
> **OSS format:** `packages/testing/src/security-corpus.ts` (types, checker, loader) ·
> `packages/testing/security-corpus/security-corpus.schema.json` and
> `peer-compatibility.schema.json` (JSON Schema draft-07) ·
> `packages/testing/security-corpus/README.md` (vocabulary, how to contribute) ·
> gate `yarn validate:security-corpus`.

**The main difference is not a field name.** An OSS fixture *states* the
outcome each sink owes, and the OSS runner *measures* which outcome it got.
A Pro payload states no outcome. Its runner checks one property for every guard:
no forbidden token and no forbidden shape left in the live output. So "neutralised"
in Pro is weaker than any one OSS outcome: a guard that wiped the whole output
passes, and so does one that escaped it. When Pro moves to the shared format,
its runner has to **classify** the output
(`rejected`/`stripped`/`escaped`/`admitted`), not just check it. Otherwise the
shared labels claim more than Pro has proven. `measure()` in OSS
`packages/core/security/boundary-suites.ts` shows the pattern to follow.

## 1. File level

| OSS field | Pro field | Disposition | Migration note |
|---|---|---|---|
| `$schema` (optional) | — | missing in Pro | Point it at `node_modules/@dzup-ui/testing/security-corpus/security-corpus.schema.json` so an editor validates while you type |
| `schemaVersion` (required, semver; the major must match) | — | missing in Pro | `"1.1.0"` |
| `category` (required; one per file) | — (Pro files mix 10 and 3 categories) | missing | Split per OSS category (§4): e.g. `pro-markup-injection.corpus.json`. The file name is up to Pro. Only OSS's own directory is checked for orphan files |
| `description` | `description` | same | none |
| `fixtures` | `payloads` | renamed | Rename the key |
| `extensions["<namespace>"]` (optional, new in 1.1.0) | `policy` (html.json only) | **moved** | `extensions["com.dzup.pro"].policy`. The shared format has no `policy` field. Unknown top-level keys are now rejected |

## 2. Fixture level

| OSS field | Pro field | Disposition | Migration note |
|---|---|---|---|
| `id` — `{category}.{family}.{case}`, kebab segments, never reused | `id` — `^[a-z0-9-]+$` | renamed (format) | Prefix it: `script-inline` → `markup-injection.script.inline`. Pro's category becomes the **family** segment, so Pro's finer taxonomy survives as data (§4). Rename any Pro test titles or deviation records keyed by the old ids in the same change |
| `category` (6 values, closed) | `category` (13 values) | renamed (value set) | Mapping in §4. **No new OSS categories**, so nothing is lost: the family segment keeps Pro's category |
| `title` (required) | — | missing in Pro | One line per payload |
| `payload` + `repeat?` | `input`, with `REPEAT:<fragment>:<n>` inside the string | renamed + restructured | `"REPEAT:<div>:2000"` → `"payload": "<div>", "repeat": 2000`. Read it through `payloadOf()`, never `.payload` |
| `outcomes` (required map, sink → outcome) | — (implied by which guard the runner uses) | **missing: the main difference** | Write one entry for each guard Pro runs the payload through (§3, §5). Most HTML payloads get `{ "html": "stripped", "text": "escaped" }` |
| `rationale` (required; > 80 chars wherever `inert` or `admitted` appears) | `why` (optional; on 23 of 46) | renamed; now required | 23 payloads need a rationale written. Pro's rule "a payload that strips nothing must say why" is stricter than the old OSS rule, and it survives as the > 80-char rule on `admitted` |
| `provenance` (required) | — | missing in Pro | The html.json `description` names the OWASP filter-evasion families and doc 06. Cite those per payload |
| `extensions["<namespace>"]` (optional) | `mustNotSurvive` | **moved** | `extensions["com.dzup.pro"].mustNotSurvive`. It is still useful: extra live-surface tokens checked on top of the outcome. It stays Pro-only because OSS measures structure, not tokens (decision D75) |
| — | *(runner)* `RENDER_CEILING_MS = 750` | not a fixture field | Stays in the runner. The shared format has no time budget, and a budget per payload would be a new mechanism |
| — | *(registry)* `context`, `guard`, Trusted Types policy name | not in the corpus | They belong to the sink registry row. If a fixture ever needs them, use `extensions["com.dzup.pro"]` (the namespace Pro's R2-P9 asks OSS to agree) |

## 3. Outcome vocabulary — the words each side uses

Pro's data has no outcome words. They live in the runner's `describe`/`it` titles and in the registry's `guard` column:

| Pro word (where) | What Pro asserts | OSS outcome | Lossless? |
|---|---|---|---|
| "neutralises" (sanitizer guard, `guard: sanitizer-adapter`) | No forbidden token or shape in the live surface | **`stripped`**, or **`rejected`** when `SanitizeLimitError` is thrown | Yes, once the runner classifies (see the note at the top) |
| "renders … inert as text" (escape guard, `guard: escape`) | The output parses to **zero elements** and is not empty | **`escaped`**, keyed on the **`text`** sink | Yes. This is the OSS definition word for word |
| "rejects" (URL policy guard, `guard: allowlist`) | `isAllowedUrl(x) === false` | **`rejected`** on `navigation` | Yes. 8 of Pro's 10 hard-coded dangerous URLs (`corpus.security.spec.ts:218–229`) already have an OSS `url-scheme` fixture of the same class — javascript plain/mixed-case/tab, `data:text/html`, `data:image/svg+xml`, vbscript, file, blob; same class, not always byte-identical (Pro's svg is base64, OSS's carries `onload`). The two without one are the leading-space and embedded-newline `javascript:` variants (OSS has a leading *control character* instead). The guard can run `fixturesForSink('navigation', ['url-scheme'])` |
| "refuses or absorbs" (resource block) | Either outcome, under 750 ms | A **single** outcome per payload at the default limits (`maxLength 131072`, `maxDepth 64`, the same in Pro's `DEFAULT_SANITIZE_LIMITS` and Core's `DZ_PROVIDER_DEFAULTS.sanitizer`): nesting → `rejected`, 5 000 spans → `admitted`, 8 000 spans → `rejected` | **Gains** information: an either/or becomes a pinned value |
| "fails closed" (sanitizer unavailable) | Throws | Not a fixture outcome. It is guard behaviour and stays a runner test | n/a |
| `mustNotSurvive: []` + `why` (spoofing) | Nothing may be stripped; a human reviews the result | `unicode-rtl-override` → `escaped`. `unicode-homoglyph-url` → **`admitted`** | `admitted` is new in 1.1.0 **for this case** (D73). Without it the only choices were `stripped` (false: nothing is removed) or dropping the payload |

**Agreement with the R3-O2 sanitizer seam** (`DZ_SANITIZER_KEY`, `useDzSanitizer`, decisions D6–D8). A real `DzSanitizerAdapter.sanitize()` produces `stripped`. The Core default `DZ_ESCAPING_SANITIZER` produces `escaped`. `DzSanitizeLimitError` is `rejected`. The corpus's two new sink names are the seam's `DzSanitizeSink` names (`markdown`, `mermaid-svg`), so for those two contexts the registry row's `context` **is** the corpus key.

## 4. Pro categories → OSS category / family / outcomes

| Pro category (count) | OSS `category` · family | Outcomes | Exceptions |
|---|---|---|---|
| `script-injection` (4) | `markup-injection` · `script` | `html: stripped`, `text: escaped` | none |
| `event-handler` (4) | `markup-injection` · `event-handler` | same | none |
| `url-scheme` (5; the URL arrives **inside markup**) | `markup-injection` · `url-scheme` | same | OSS `url-scheme` means a bare URL in a URL prop (`navigation`/`subresource`). The OSS precedent for URLs inside markup is `markup-injection.anchor.javascript-href` |
| `svg` (3) | `markup-injection` · `svg` | same | none |
| `css` (3) | `css-injection` · `style-markup` | same | The OSS precedent is `css-injection.style.close-tag` (`html: stripped`) |
| `mutation` (2) | `markup-injection` · `mutation` | same | none |
| `embedded-frame` (4) | `markup-injection` · `embedded-frame` | same | none |
| `entity` (2) | `markup-injection` · `entity` | `html: escaped`, `text: escaped` | After one decode pass nothing is live, so nothing is stripped |
| `spoofing` (3) | `degenerate-input` · `bidi` / `homoglyph`; `url-scheme` · `javascript` | rtl-override `html: escaped`; homoglyph-url `html: admitted`; zero-width `html: escaped`, `text: escaped` | Pro's escape suite skips `spoofing`. `text: escaped` still holds, but Pro would be claiming it for the first time |
| `resource` (3) | `degenerate-input` · `nesting` / `length` | see §3 | `repeat` replaces `REPEAT:` |
| `markdown-url` (5) | `url-scheme` · `markdown` (image-title break-out: `markup-injection` · `markdown`) | **`markdown: stripped`** | Markdown source means nothing to an `html` sink. `markdown` is a new sink in 1.1.0 so these payloads never reach a raw-HTML sink (D74) |
| `markdown-html` (4) | `markup-injection` · `markdown` | `markdown: stripped`; code fence → `markdown: escaped` | none |
| `mermaid` (4) | `markup-injection` · `mermaid` (directive: `degenerate-input` is wrong, so use `markup-injection`) | **`mermaid-svg: stripped`** | **Finding: none of the 4 runs today.** The runner filters on `category.startsWith('markdown')`. Only the category-presence test mentions them (33 + 13 = 46 payloads, 96 tests, 0 mermaid cases) |

## 5. Pro sink registry → corpus sink key

| `html-sinks.manifest.json` `kind` · `guard` · `context` | Corpus sink | Note |
|---|---|---|
| `html-sink` · `sanitizer-adapter` · `markdown` / `notebook-output` (markdown cells) | `markdown` | Same name as the seam context |
| `html-sink` · `sanitizer-adapter` · `mermaid-svg` | `mermaid-svg` | Same name. Input is **not** bounded (registry finding S4), so no size payload applies |
| `html-sink` · `sanitizer-adapter` · `notebook-output` (html output) / `rich-text-paste` | `html` | none |
| `html-sink` · `escape` · `diff-highlight` | `text` | Escaping turns the HTML sink into a text sink. `escaped` is the outcome |
| `escape-hatch` (any) | same key as the sink it opens | The hatch is registry data, not a corpus field |
| `object-url` · `construction` (3 contexts) | none: `corpusRequired: false` | none |

## 6. Incompatible-peer fixture shape → Pro consumer matrix

OSS publishes `PeerCompatibilityFixture` (`peer-compatibility.schema.json`) as a
sibling of what `optional-peer/fixture.json` already does, not a replacement.
It describes **what** must be true. Pro's `fixture.json` lanes stay the **how**.

Pro inputs: `fixtures/consumers/optional-peer/fixture.json` (read at `1c55355`),
`fixtures/consumers/optional-peer/run-case.mjs`, `fixtures/consumers/README.md`.

| OSS field | Pro today (`fixtures/consumers/optional-peer`) | Disposition |
|---|---|---|
| `id` `peer.{peer}.{case}` | `fixture.json` `id` (`optional-peer`) + lane `id` (`absent`, `present`) | New. One fixture per lane that makes a peer claim: `peer.pdfjs-dist.absent`, `peer.pdfjs-dist.installed`, and the new `peer.pdfjs-dist.wrong-major` |
| `title` | `fixture.json` `title` · lane `title` | same — copy the lane title |
| `dependent` · `peer` · `declaredRange` · `optional` | Implied: `@dzup-ui-pro/pro`'s `peerDependencies` / `peerDependenciesMeta` (`packages/pro/package.json`) | New. The OSS executor checks them against the real `package.json` when the dependent is a workspace package |
| `state`: `absent` · `installed` · `incompatible` | lanes `absent` · `present` · (none) | `present` = `installed`. **`incompatible` is the missing lane** (R-058d, R2-P9 step 4) |
| `installedVersion` (exact version, or `null` iff `absent`) | lane `run`: `npm install … pdfjs-dist@4.10.38` | Copy the exact version the lane installs |
| `diagnostics[]` `{ stage: install·validate·build·runtime, severity: error·warning, mustContain[] }`; `mustContain` must name the peer | `run-case.mjs:40–41` `check('the missing-dependency panel names the package')` + `/npm install pdfjs-dist/`; the runner's strict-peer `ERESOLVE` record (`fixtures/consumers/README.md` `install.strictPeers`) | Same promise, now as data. A `runtime` diagnostic lists the substrings `run-case.mjs` checks for; an `install` diagnostic lists what the `ERESOLVE` record names |
| `rationale` · `provenance` | `fixture.json` `why` | renamed (`why` → `rationale`; `provenance` is new — cite the README's published compatibility statement) |
| — | `fixture.json` `packages` · `components` · `install.strictPeers` · lane `column` · lane `run` | **stay in the lane** — they are *how* the state is produced, which the shared record deliberately does not describe. If a record needs to point back at its lane, use `extensions["com.dzup.pro"].lane` |
| — | lane `not-bundled` (`assert-lazy.mjs`) + its `note` | **no record** — it makes a bundling claim, not a peer-state claim; it stays a lane |

**Executable OSS example:** `peer.vue.wrong-major` in
`packages/testing/security-corpus/peer-compatibility.fixtures.json`. `@dzup-ui/core`
declares `vue ^3.5.0`, `2.7.16` (the final Vue 2 release) is installed, and the
expected diagnostic is a `validate`-stage error containing `vue`, `^3.5.0` and
`2.7.16 does NOT satisfy`. Its sibling `peer.reka-ui.absent` covers the absent
state (`reka-ui ^2.0.0`, required, so `not installed but required` is an error).
The executor is `validate:peers`' own check, extracted to
`packages/tooling/src/validators/peer-ranges.ts` and run by
`packages/tooling/src/validators/security-corpus.ts`, which also binds
`declaredRange`/`optional` to `packages/core/package.json`. OSS declares **no
optional peers** (see `packages/nuxt/test/fixtures/optional-peer/README.md`), so
both OSS records use required peers. The `optional` flag is exercised by the
synthetic `pdfjs-dist` cases in `packages/tooling/src/validators/security-corpus.spec.ts`,
and Pro instantiates the optional case with a real optional peer (D76).

> _Corrected 2026-09-17 (closing session): an earlier draft of this section named
> a `peer.reka-ui.wrong-major` / `1.9.0` example. That record was never written;
> the data file on disk has `peer.vue.wrong-major` and `peer.reka-ui.absent`, and
> the changeset, README, specs and gate all agree with the data._
