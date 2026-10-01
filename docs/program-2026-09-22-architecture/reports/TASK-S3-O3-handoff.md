# TASK-S3-O3 — Security-corpus conformance runner in `@dzup-ui/testing` — handoff

> **Commit bound:** every number below is measured at HEAD
> `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` (`4e4e46f`) with a dirty worktree
> (**234 paths at start, 250 at end** — a net **+16**: 9 new files and 7 tracked files
> this task is the first to touch, plus 3 already dirty from prior tasks (`package.json`
> and the two programme ledgers). Everything inherited is
> preserved, nothing reverted, stashed, checked out or cleaned). The programme
> README §2 still says `589be13`; that is **stale** and this report does not
> quote it. Every gate result here is **locally qualified only** — never CI,
> release or production evidence.

## Progress log (written as the task ran)

- **Start.** HEAD `4e4e46f`; `git status --porcelain` = 234 paths. Status row set `[~]`.
- **`<done_check>` run as written — 1 of 4 exits 0, and that one is a false pass.** §0.
- **Discovery.** Read the sanitizer seam (`packages/contracts/src/provider.types.ts`
  §`DzSanitize*`, `packages/core/src/security/sanitize.ts`,
  `packages/core/src/composables/provider/useDzSanitizer.ts`), the corpus format
  (`packages/testing/src/security-corpus.ts`, schema 1.1.0, six category files,
  34 fixtures), the existing gate (`packages/tooling/src/validators/security-corpus.ts`),
  the measuring vocabulary (`packages/core/security/boundary-suites.ts`
  `MeasuredOutcome`), the established conformance pattern (`packages/testing/src/anatomy.ts`),
  and the two specs
  (`workspace-docs/repos/ui/docs/architecture/dzup-form-system-2026-08-08/06-security-and-remote-execution.md`
  §10, `…/dzup-graph-flow-system-2026-08-08/06-quality-accessibility-performance-and-security.md`
  §"Security and trust boundary"). Cited, not rebuilt:
  `../program-2026-09-04/reports/TASK-R3-O4-handoff.md` (the format),
  `TASK-R3-O4-corpus-compatibility.md`, `TASK-R3-O2-handoff.md` (the seam),
  `TASK-R2-O4-handoff.md` (URL policy).
- **Baseline before touching anything:** focused lane `packages/core/security packages/testing`
  → 9 files / **403 tests** / exit 0 (matches `coverage.json`'s recorded run).
- **Implemented, in dependency order.** Runner + spec → five fixtures → subpath
  declared → gate + reference + spec → Core-side spec → chain link → README →
  changeset.
- **Seeded-verdict-change proof run and restored byte-identically** — §5.
- **Closed** after the full ladder: build 0 · typecheck 0 · typecheck:tooling 0 ·
  lint 0 · test 0 (563 files, 10,876 passed) · `test:e2e:csp` 0 (6/6, three
  engines) · `validate:all` 1 at the pre-existing link 50.

---

## 0. `<done_check>` outcome — **1 of 4 at `4e4e46f`, and clause 1 is a FALSE PASS**

Run from `ui/dzup-ui`, exactly as written, exit codes read directly from logs in
the session scratchpad — never through a pipe.

| # | Clause as written | Exit | Verdict |
|---|---|---|---|
| 1 | `grep -rn 'conformance' packages/testing/src` (piped to `head -3`) | **0** | **FALSE PASS — the worst kind.** It exits 0 today and printed three hits from `anatomy.ts` / `anatomy.spec.ts` (`"Anatomy conformance for rendered DOM"`), with **no security-conformance runner in existence**. A bare-word grep cannot tell "the runner is exported" from "the word appears in a neighbouring module's prose", and the `head` pipe would have masked a non-zero grep exit anyway — the same defect TASK-R3-O4 recorded as **D77**. Decidable form: `grep -n 'runSecurityConformance' packages/testing/src/index.ts packages/testing/src/security-conformance.ts` |
| 2 | `node -e "…require('./packages/core/security/corpus.json').version…"` | **1** | **Fails, and the path does not exist** — the clause hedges this itself (*"or the corpus's actual path"*). The corpus is `packages/testing/security-corpus/*.corpus.json` (data, six files) + `packages/testing/src/security-corpus.ts` (types, checker, loader). **A second defect inside the same clause:** those files carry `schemaVersion`, never `version`, so it would print `no version` even against the real path. **Third recurrence of this wrong path** — R3-O4's done_check named `packages/testing/src/security-corpus/` and also missed |
| 3 | `yarn test packages/core/security packages/testing; echo "exit $?"` | **0** | **Passes as an exit code and fails as a check.** Baseline: 9 files / **403 tests** / exit 0 — with **no per-fixture verdict count printed anywhere**, which is the half of the clause that decides anything. A clause whose informative half is unobservable cannot be failed. That half is now delivered (§4) |
| 4 | `npx tsx packages/tooling/src/validators/security-conformance.ts` | **2** (file absent) | **Fails, and is unsafe as written.** `npx` here fetches dependency-confusion placeholders that **exit 0 without running**, so the same line can produce a false *pass* for a validator that never executed (S3-O1, S2-O2; 13th recurrence). Run as `node node_modules/tsx/dist/cli.mjs …` |

**Verdict: 1 of 4 pass as exit codes; 0 of 4 decide the question they claim to
decide.** Task ran in full. All four now pass in corrected form.

---

## 1. Discovery: what already existed, cited rather than rebuilt

The packet's premise held in one half and was already satisfied in the other.

| Asked for | State at `4e4e46f` | Action |
|---|---|---|
| A versioned corpus | **Exists.** `packages/testing/security-corpus/` — six `*.corpus.json`, 34 fixtures, `schemaVersion 1.1.0`, two published JSON Schemas, a checker that is the authority, and `validate:security-corpus` reading all three together. `../program-2026-09-04/reports/TASK-R3-O4-handoff.md` | **Cited.** Extended by five fixtures; the schema version was **not** touched |
| The sanitizer seam | **Exists.** `DZ_SANITIZER_KEY`, `DzSanitizerAdapter`/`DzSanitizeContext`/`DzSanitizeLimits`/`DzSanitizeLimitError` in `@dzup-ui/contracts`; `resolveSanitizer` + `DZ_ESCAPING_SANITIZER` + `measureHtmlDepth` in `packages/core/src/security/sanitize.ts`; `useDzSanitizer`. `TASK-R3-O2-handoff.md` | **Cited.** Measured, never modified |
| A conformance runner | **Absent.** Nothing executed the format against any adapter | **Built** |
| The measuring vocabulary | **Exists.** `MeasuredOutcome` in `packages/core/security/boundary-suites.ts`, including the `passed-through` value the corpus schema deliberately omits | **Reused as the model**, rather than inventing a third vocabulary |
| The conformance *pattern* | **Exists.** `packages/testing/src/anatomy.ts`: pure `check*` returning problems + `expect*` that throws, target accepted **structurally** so the package needs no dependency on `@dzup-ui/contracts` | **Followed exactly.** `classifyVerdict` / `runSecurityConformance` / `expectSecurityConformance` is the same shape |
| URL-policy fixtures | **Exist.** `url-scheme.corpus.json`, 9 fixtures against 6 navigation sinks. `TASK-R2-O4-handoff.md` | **Cited; deliberately not extended** (§3) |
| "file names as untrusted text" (Form §10) | **Already covered** — `file-metadata.name.markup`, `file-metadata.name.attribute-break-out`, `file-metadata.path.traversal`, `file-metadata.name.four-kilobyte` | **Cited, nothing added** |

`@dzup-ui/testing` had **no package README at all**, although it is a published
package and every other package in `packages/` has one. Closed here, because the
task's deliverable 5 is a README section and there was no README to put it in.

---

## 2. Implemented files and the API effect

| File | New/changed | API effect |
|---|---|---|
| `packages/testing/src/security-conformance.ts` | **new** | **New public module.** 12 runtime exports (`runSecurityConformance`, `expectSecurityConformance`, `classifyVerdict`, `corpusFingerprint`, `applicableCells`, `formatConformanceReport`, `SecurityConformanceRefusal`, `SANITIZER_SINKS`, `DIRECT_SANITIZER_SINKS`, `SATISFIED_BY`, `ASSERTABLE_OUTCOMES`, `CONFORMANCE_VERDICTS`) + 3 version constants + `CORPUS_VERSION_FINGERPRINTS` + 9 exported types |
| `packages/testing/src/security-conformance.spec.ts` | **new** | **51 tests**, organised around one question: *can this runner report a pass it did not earn?* |
| `packages/testing/package.json` | changed | **New published subpath `./security-conformance`**; `README.md` added to `files` |
| `packages/testing/src/index.ts` | changed | **9 types re-exported** from the barrel. Runtime stays subpath-only, same reason as the corpus: the module reads files |
| `packages/testing/README.md` | **new** | The package's first README. `import` → `run` → `report`, the verdict table, the satisfaction matrix, the fail-closed contract, the renderer seam, bring-your-own-fixtures, and the three versions |
| `packages/testing/security-corpus/markup-injection.corpus.json` | changed | **+4 fixtures** (7 → 11) |
| `packages/testing/security-corpus/degenerate-input.corpus.json` | changed | **+1 fixture** (4 → 5) |
| `packages/testing/security-corpus/README.md` | changed | §4 points at the runner and the gate; §5 gains the content-version step; the title records `content v1.1.0` beside `schema v1.1.0` |
| `packages/tooling/src/validators/security-conformance.ts` | **new** | The gate. `--reference <path>` for seeded proofs; `--write` records a reference and prints that doing so replaces recorded evidence and is an owner action |
| `packages/tooling/src/validators/security-conformance.spec.ts` | **new** | **27 tests**, each a single seeded mutation of a real reference |
| `packages/core/security/sanitizer-conformance.reference.json` | **new** | The recorded reference, stamped `4e4e46f`, `recordedBy: TASK-S3-O3` |
| `packages/core/security/sanitizer-conformance.spec.ts` | **new** | **11 tests.** Runs the runner against Core's real adapter, prints the per-fixture verdict table, and asserts the **bare** default is non-conforming |
| `package.json` | changed | `validate:security-conformance` script; chained as **link 11** of **54** |
| `packages/tooling/scripts/required-export-subpaths.json` | changed | The new subpath declared with its reason, as that file's own rule requires |
| `packages/tooling/src/validators/security-corpus.spec.ts` | changed | Measured fixture count **34 → 39**, with the reason in a comment |
| `packages/tooling/src/resolution/dzup-resolution.spec.ts` | changed | Inline snapshot gains `"@dzup-ui/testing/security-conformance"` |
| `.changeset/the-security-corpus-becomes-an-executable-conformance-suite.md` | **new** | `@dzup-ui/testing: patch` |

Nothing under `packages/contracts/`, `packages/core/src/`, `apps/` or `e2e/` was
modified. The seam was measured, not changed.

### The design decisions worth arguing with

1. **The verdict vocabulary is a measurement vocabulary, not the corpus's.**
   `blocked · escaped · stripped · passed-through · unchanged`. `passed-through` is
   the value the corpus schema deliberately refuses to carry; `unchanged` is named
   separately from it because it is the one thing `DzSanitizerAdapter.sanitize`
   explicitly promises not to do, so a reader can tell a policy that is too
   permissive from a stub nobody wired up.
2. **Satisfaction is a matrix, not an ordering.** `NEUTRALIZATION_OUTCOMES` is
   documented "strongest first" by *how little of the value survives*, which is not
   safety: `escaped` sits after `stripped` and removes strictly more attack surface.
   Read as a safety ordering it would report a correctly escaping adapter as a
   regression. So `rejected ← blocked` only; `stripped ← blocked|stripped|escaped`
   with `escaped` counted **lossy**; `escaped ← blocked|escaped` and **not**
   `stripped` — a value that must render as text and instead renders as sanitised
   markup has had its meaning changed, which is how an option label becomes a link.
   `inert` and `admitted` are **not assertable at all**: both are claims about a
   sink's nature, which no adapter can discharge, so those cells are reported
   unasserted with that reason rather than counted either way.
3. **Three sinks, only one of them direct.** The runner asserts `html`, `markdown`,
   `mermaid-svg` — the sinks whose guard *is* `sanitize()`. A `navigation` sink is
   the URL policy's, a `file` sink the upload policy's, a `text` sink the
   framework's. Of the three only `html` hands the adapter the payload: for the
   other two the payload is **renderer source**, and this repository publishes no
   renderer, so those cells are **unasserted with a named reason** and
   `options.renderers` is the seam by which a tier that owns a renderer makes them
   live — no source import in either direction.
4. **The empty case cannot pass.** `runSecurityConformance(null)` throws
   `SecurityConformanceRefusal`; a run with no assertable cell throws; a corpus of
   only non-sanitizer sinks throws; a corpus whose only sanitizer cell needs a
   renderer nobody supplied throws. Four specs, one per shape.
5. **`failClosed` is measured, not asserted.** Four properties, each computed by
   running the probe: absent adapter → `refused`, throwing adapter → `blocked`,
   identity adapter → `non-conforming`, empty set → `refused`. Any
   `NOT FAIL-CLOSED` is reported **before any cell**, by both
   `expectSecurityConformance` and the gate, because it means the runner itself
   could bless a stub.
6. **A corpus *content* version, separate from the schema version.** The task text
   asks for "a semantic version … a fixture addition is a minor; a verdict change
   is a major". `SECURITY_CORPUS_SCHEMA_VERSION` cannot be that version: it is
   documented as versioning the *record shape* and moves on a new sink or a field
   changing meaning, neither of which happened. So `SECURITY_CORPUS_VERSION`
   (1.1.0) is new, and `CORPUS_VERSION_FINGERPRINTS` gives it teeth — a fixture
   edit changes the digest, and an unbumped version goes red; a bumped version
   with no recorded digest goes red the other way. **Neither is satisfiable by
   editing data alone.** The digest ignores prose (a rationale typo is not a
   verdict change), is order-independent and is `repeat`-sensitive; all three are
   asserted. `SECURITY_CORPUS_SCHEMA_VERSION` stays **1.1.0**, so **no data file
   was migrated** and the existing gate's strict version equality still holds.
7. **The reference lives in `packages/core/security/`.** The runner is
   contract-level and adapter-agnostic; the reference is a measurement of *Core's*
   adapter and belongs beside `coverage.json` and `security-deviations.json`. It
   also could not live in the corpus directory: `validate:security-corpus` rule 2
   rejects any JSON there that is not a category file, the peer file or a schema —
   correctly.
8. **The reference names the seam, not the bare default.** `CORE_ADAPTER_NAME`
   says `seam-resolved`, because `DZ_ESCAPING_SANITIZER` escapes and nothing else
   while `resolveSanitizer()` wrapping it also enforces the ceilings. A reference
   saying only "escaping default" would describe an adapter no component receives.
9. **`sourceCommit` is provenance, never an assertion.** A gate spelled
   `sourceCommit === HEAD` is red on the commit that lands the regeneration — see
   `evidence-binding.json`'s own `$whyNotEqualsHead`. The reference is deliberately
   **not** registered in `evidence-binding.json`: its declared inputs would be the
   corpus files, which the landing commit touches, so registering it would make
   that gate red on exactly the commit where the artifact is most correct. Raised
   as **D-S3O3-4**.
10. **One classifier bug, recorded because it is the failure mode that gets
    security gates switched off.** The first draft scanned for danger *before*
    asking whether any tag survived. An escaping adapter returns
    `&lt;img src=x onerror=&quot;alert(1)&quot;&gt;`, in which the literal text
    ` onerror=` is still present — so the scan reported **every correctly escaping
    adapter as `passed-through`**. Four specs went red on the first run. The order
    is now `threw → unchanged → surviving comment → no tag ⇒ escaped → danger
    scan`, with its own regression test and a comment saying why the gate is
    load-bearing. The comment check stays *ungated*, because
    `<!--<img onerror=1>-->` is dangerous while carrying no live tag of its own —
    which is the whole point of `markup-injection.comment.hidden-element`.
11. **Two regexes were rewritten for `regexp/no-super-linear-backtracking`, and
    one got stricter rather than looser.** `ANY_TAG` became `/<\/?[a-z][a-z0-9-]*/i`
    — no whitespace after `<` or `/` — which is not a simplification but the rule:
    the HTML tokenizer treats `< div` as text and `</ div>` as a bogus comment, so
    neither opens an element.

---

## 3. The five fixtures, and which spec clause each traces to

Corpus content **34 → 39** across **6** files.
`SECURITY_CORPUS_SCHEMA_VERSION` unchanged at 1.1.0.
Content fingerprint `fce4570ca849fadf19b082968379836b` → `5c0f0b50ff53c648eb056848ecf9b3a2`.

| Fixture | Outcomes | Traces to |
|---|---|---|
| `markup-injection.option-label.template-interpolation`<br>`{{constructor.constructor('alert(1)')()}}` | `text: escaped` | **Form doc 06 §10** — "Render labels, descriptions, errors, option labels, and operation messages as text"; "Control IDs are … never used as raw HTML". **Every other fixture in the file contains a `<`**, so a renderer that escapes markup and then hands the same string to a template compiler passes all of them. This one carries no markup at all |
| `markup-injection.renderer-options.spread-event-attribute`<br>`<div data-label="x" onclick=… onfocus=…>label</div>` | `text: escaped`, `html: stripped` | **Form doc 06 §10** — "Renderer `options` pass an allowlist schema; never spread unknown options onto a DOM element." Two handlers, plus a benign `data-label`, so a pass cannot come from dropping the first `on*` nor from dropping every unrecognised attribute |
| `markup-injection.markdown-reference-link.javascript-scheme`<br>`[label]: javascript:alert(1)` + `[label]` | `markdown: stripped` | **Form doc 06 §10** — "A future Markdown renderer must sanitize with a maintained library, disallow active content, and define link/image policies." **The first `markdown`-sink fixture the format has carried since schema 1.1.0.** The URL and the link that uses it sit in different places in the source, so a check on visible link text sees nothing. It states no `text`/`html` outcome on purpose: in those sinks the string builds nothing, so a claim there would be a tautology |
| `markup-injection.foreign-content.xlink-href-javascript`<br>`<svg …><a xlink:href="javascript:alert(1)">…` | `text: escaped`, `html: stripped`, `mermaid-svg: stripped` | **Graph doc 06 §"Security and trust boundary"** — labels are untrusted data, "text rendering by default, never `v-html` for labels", "URL protocols … controlled by trusted renderers". Graph and diagram labels land **inside SVG**, where `xlink:href` navigates and an allowlist written against HTML's `href` misses it: a sanitizer can strip every other vector in the file and still ship a live `javascript:` link. **The first `mermaid-svg`-sink fixture** |
| `degenerate-input.depth.element-nesting-bomb`<br>`<div>` × 200 (`repeat: 200`) | `text: escaped`, **`html: rejected`** | **Graph doc 06** — "size ceilings for JSON bytes, node/edge count, **data depth**, string length"; **Form doc 06 §8** ceilings. The corpus had a length case and three encoding cases and **nothing that nests**, so `DzSanitizeLimits.maxDepth` (64) and `measureHtmlDepth` had no fixture at all. The **only** `rejected` html cell, and therefore the only one that exercises the seam's fail-closed ceiling rather than a string transformation. 200 is over 3× the default so a host that *tightens* `maxDepth` cannot make it inert |

### Two classes the format cannot carry, recorded rather than faked

- **Form §10, the *option-key* half of "never spread unknown options".** An
  untrusted value becoming an attribute **name** cannot be escaped; `rejected` is
  the only safe outcome, and the corpus has no sink for it. Giving the fixture
  `attribute: rejected` would have been **false about every existing binding** —
  they measure `escaped` for an attribute *value* and would have gone red
  correctly. Expressed at the element level instead (fixture 2); raised as
  **D-S3O3-1**.
- **Graph, "document-provided URLs are never fetched".** This is a **provenance**
  rule, not a payload rule: `https://example.test/a.png` is fine from a trusted
  prop and forbidden from a document, and the corpus is keyed by payload. As
  `subresource: rejected` it would have failed every legitimate image component in
  `BINDINGS.content`. **Not added**; raised as **D-S3O3-2**.

**Why every new outcome sits on `text`, `html`, `markdown` or `mermaid-svg` and
nothing else:** `fixturesForSink` drives `runBoundarySuite`, which asserts
`expect(measured).toBe(required)` against **real components**. An outcome on
`attribute`, `style`, `navigation`, `subresource`, `file` or `encoded-payload`
becomes a live assertion against every bound component the moment it is written,
and getting it wrong means either a false red or weakening the fixture later.
Core renders **zero** html sinks, so `html`/`markdown`/`mermaid-svg` outcomes
reach only the new runner; `text: escaped` is the one safe addition, and it added
**32 real assertions** to the existing boundary suites (§4).

---

## 4. Focused validation

Narrowest first. Every exit code read from a log file in the session scratchpad,
never through a pipe. `/tmp` is **not writable on this machine** — the
`<validation>` block's `/tmp/s3o3-*.log` redirects were replaced accordingly, and
the first attempt reproduced the failure (`Permission denied`).

| Command | Exit | Result |
|---|---|---|
| `vitest run packages/testing/src/security-conformance.spec.ts` | **0** | **51** tests |
| `vitest run packages/core/security/sanitizer-conformance.spec.ts` | **0** | **11** tests |
| `vitest run packages/tooling/src/validators/security-conformance.spec.ts` | **0** | **27** tests |
| `vitest run packages/testing/src packages/core/security packages/tooling/src/validators/security-conformance.spec.ts` | **0** | 12 files / **524** tests |
| `yarn test packages/core/security packages/testing` (the done_check lane) | **0** | 11 files / **497** tests, **up from 403** at baseline: +51 runner, +11 Core conformance, **+32 from the five new fixtures reaching existing boundary suites** |
| `node node_modules/tsx/dist/cli.mjs …/security-corpus.ts` | **0** | schema 1.1.0 — 6 category files, **39** fixtures valid against JSON Schema **and** checker (rejected 14 · stripped 11 · escaped 39 · inert 11 · admitted 0); 2 peer fixtures, 2 validate-stage diagnostics executed |
| `node node_modules/tsx/dist/cli.mjs …/security-conformance.ts` | **0** | see the report line below |
| `tsc -p packages/testing --noEmit` | **0** | |
| `tsc -p packages/tooling --noEmit` | **0** | **first run exit 2 with 1 error, in my own file** — `FailClosedRecord` is an *interface*, so it has no implicit index signature and does not satisfy `Record<string, string>`; fixed at the defect with the reason in a comment |
| `eslint` over the 6 touched `.ts` files | **0** | **first run 1 with 9 errors + 2 warnings, all mine** (2 super-linear-backtracking regexes, 2 `prefer-template`, export sort order, 2 describe titles, quote-props, chaining, 2 jsdoc). Fixed at the defect. `eslint --fix` then **broke two string literals** by lowercasing `'Core\'s …'` into `'core's …'` — repaired by hand; worth knowing before anyone runs `--fix` on a title containing an apostrophe |
| `yarn typecheck` (vue-tsc, core) | **0** | |
| `yarn lint` (whole repo) | **0** | **first run 1 with 1 error** — a quoted property in a `README.md` fenced block; the docs are linted here |
| `yarn build` | **0** | 8 of 8 workspaces |
| `yarn validate:{exports,published-imports,release-policy,changelog,dts,boundaries,package-names,externals,tree-shake,docs-size,doc-snippets,readme-facts}` | **0** × 12 | the packaging and docs gates most at risk from a new subpath and a new README |
| `yarn test:e2e:csp` | **0** | **6 passed** (2 specs × chromium/firefox/webkit). Unchanged by this task; run because the `<validation>` block asks for it, and it is the one lane that can see CSP at all |

The conformance report, printed by both the gate and the Core spec:

```text
@dzup-ui/core:dzup-ui (seam-resolved escaping default, ADR-20 A6) vs corpus 1.1.0
(schema 1.1.0, fingerprint 5c0f0b50ff53c648eb056848ecf9b3a2): 10 cell(s) over 10
fixture(s) — blocked 1 · escaped 9 · stripped 0 · passed-through 0 · unchanged 0;
lossy 9; non-conforming 0; unasserted 2; fail-closed absent=refused
throwing=blocked identity=non-conforming empty=refused
```

Per fixture (the half of done_check clause 3 that was missing):

| cell | requires | verdict |
|---|---|---|
| `markup-injection.img.onerror:html` | stripped | escaped *(lossy)* |
| `markup-injection.script.close-and-reopen:html` | stripped | escaped *(lossy)* |
| `markup-injection.svg.onload:html` | stripped | escaped *(lossy)* |
| `markup-injection.anchor.javascript-href:html` | stripped | escaped *(lossy)* |
| `markup-injection.entity.encoded-colon:html` | stripped | escaped *(lossy)* |
| `markup-injection.comment.hidden-element:html` | stripped | escaped *(lossy)* |
| `markup-injection.renderer-options.spread-event-attribute:html` | stripped | escaped *(lossy)* |
| `markup-injection.foreign-content.xlink-href-javascript:html` | stripped | escaped *(lossy)* |
| `css-injection.style.close-tag:html` | stripped | escaped *(lossy)* |
| `degenerate-input.depth.element-nesting-bomb:html` | **rejected** | **blocked** |
| `markup-injection.markdown-reference-link.javascript-scheme:markdown` | stripped | **UNASSERTED** — renderer source, no `markdown` renderer supplied |
| `markup-injection.foreign-content.xlink-href-javascript:mermaid-svg` | stripped | **UNASSERTED** — renderer source, no `mermaid-svg` renderer supplied |

**Read this correctly.** `lossy 9` is the honest headline: Core ships **no HTML
sink** and bundles **no sanitizer**, so its default escapes where a
DOMPurify-backed adapter would strip. That is conformance by over-delivery and the
report says so, so nobody can read it as "Core sanitizes rich content". The one
cell that is *not* a string transformation is the depth bomb: the seam throws
`DzSanitizeLimitError` before anything parses, which is the fail-closed ceiling
being measured for the first time.

**The fail-closed path asked about in `<discovery>` step 4 was confirmed and does
not fail open.** With nothing installed anywhere, `useDzSanitizer` returns
`resolveSanitizer(() => instance, DZ_ESCAPING_SANITIZER)` — markup in, text out,
ceilings enforced. With a provider that set `:sanitizer="null"` it throws in DEV
(a host that promised an adapter and did not supply one) and falls back to the
same escaping default in production. **No defect to file**, and the Core spec now
pins it: `DZ_ESCAPING_SANITIZER` **on its own** is non-conforming (1 cell, the
depth fixture), which is the executable proof that the ceilings belong to the
seam and that this runner can distinguish an adapter that fails from one that
passes. If that test ever goes green by itself, either the bare default started
enforcing ceilings or the runner stopped telling `blocked` from `escaped` — and
the second would make every verdict here worthless.

---

## 5. The seeded verdict change — proof, restore, and byte-identity

The task asks for a seeded **verdict** change, so the seed is in the **adapter**,
not in the reference: that is the drift the gate exists for.

1. Byte copy + `md5sum` of `packages/core/src/security/sanitize.ts` →
   `061f079a0900dd790e3ffe0e37c6dce1`.
2. Seeded one character class: `escapeHtml`'s `/[&<>"']/g` → `/[&"']/g`, so the
   escaping default stops neutralising tags.
3. `node node_modules/tsx/dist/cli.mjs …/security-conformance.ts` → **exit 1**,
   **17 violations**, each naming what changed:
   - 8 non-conforming cells, each naming the fixture, the sink, the required
     outcome, the measured verdict **and the construct that survived** — e.g.
     `markup-injection.foreign-content.xlink-href-javascript … measured "passed-through" (an executable scheme survived beside live markup: "<svg …><a xlink:href=&quot;javascript:alert(1)&quot;>…")`.
   - 9 `VERDICT CHANGED` lines, each with both verdicts — including
     `markup-injection.entity.encoded-colon:html: VERDICT CHANGED — reference "escaped", measured "stripped"`, a cell that is **still conforming** and still reported. That is the value of a per-cell reference over a count: a policy that changed but stayed safe is visible instead of invisible.
   - Summary: `blocked 1 · escaped 0 · stripped 1 · passed-through 6 · unchanged 2; lossy 0; non-conforming 8`.
4. Restored from the byte copy → `md5sum -c` **OK** (same digest,
   `061f079a0900dd790e3ffe0e37c6dce1`), `grep -c 'SEEDED DEFECT'` → **0**.
5. Re-ran the gate on the identical tree → **exit 0**, the reference line unchanged.

`packages/tooling/src/validators/security-conformance.spec.ts` turns the same
proof into 27 permanent tests, one seeded mutation each: a changed verdict, a
verdict missing from the reference, a recorded cell the run no longer produces, a
changed fingerprint (with the fix named in the message), each of six changed
scalar fields, a changed ceiling, a `failClosed` property recorded differently, a
`failClosed` property the runner no longer measures, an unasserted cell that
vanished, a newly unasserted cell, a `NOT FAIL-CLOSED` measurement ordered first,
and — the one that matters most — **a non-conforming cell still failing against a
reference recorded from the broken run**. The reference is not a licence: it
cannot be re-recorded to bless a defect.

---

## 6. Aggregate qualification — pre-existing vs new

| Lane | Exit | Reading |
|---|---|---|
| `yarn test` (full) | **0** | **563 files / 10,876 passed / 3 skipped / 1 todo / 0 failed.** Baseline at `4e4e46f` was 560 / 10,755, so **+3 files, +121 tests**. No reporter flake this time; the `[vitest-worker] Timeout calling "onTaskUpdate"` failure mode D-S2O2-7 warns about did not appear |
| `yarn test` (first run) | **1** | **2 failures, both mine, and both the right kind.** `dzup-resolution.spec.ts`'s inline snapshot of every resolvable specifier lacked the new subpath; `security-corpus.spec.ts` asserted `fixtures === 34`. Both are *measured-count* assertions doing exactly their job: a new published subpath and a larger corpus must be stated, not inferred. Updated with the reason recorded in each |
| `yarn validate:all` | **1** | **54 links** (was 53). **Links 1–49 green; the sole red is link 50 `validate:peers`** — `lucide-vue-next` resolving at both 0.475.0 and 0.477.0 (`@dzup-ui/landing`/`@dzup-ui/sandbox` vs `@dzup-ui/core`). **Pre-existing, open decision D174/D175 (icon swap, TASK-R1-O6), not this task's and deliberately untouched.** The new link ran green **inside** the aggregate, at position **11** |
| links 51–54, unreached in the aggregate | **0** × 4 | `licenses`, `tree-shake`, `evidence-binding`, `deprecations`, each run individually on the final tree |
| `yarn build` | **0** | 8 of 8 workspaces; S2-O1's win held |
| `yarn typecheck` · `typecheck:tooling` · `lint` | **0** · **0** · **0** | |
| `yarn test:e2e:csp` | **0** | 6/6, three engines. **Browser-qualified only for the CSP lane**; this task adds no component and moves no visual baseline |

**Link count, stated because it changed again.** The programme README's header
table says `validate:all` = 53 (S0-O1 → 51, S2-O2 → 52, S1-O4 → 53). **It is 54
since this task**, `validate:security-conformance` inserted as **link 11**, right
after `validate:security-corpus` so the format is proven well-formed before
anything is measured against it. The pre-existing red therefore sits at **link
50**, not 49 and not 48. Any report quoting an earlier position is stale — count
from `package.json`.

**Not run, with reasons:** `yarn test:e2e` (24 Playwright projects) and
`test:e2e:visual` — no component, story, token or stylesheet changed, so there is
nothing a visual or interaction lane could newly see; the CSP lane was run because
it is the security-relevant one. `storybook:build` — no story changed. The perf
lanes are behind `DZUP_PERF_GATE` and own no baseline here. **No generated
artifact was regenerated**, so the sanctioned regeneration order did not apply:
`component-ownership.manifest.json`, `quality-matrix.json`,
`capability-matrix.json`, `component-meta.json`, `llms{,-full}.txt` and the docs
pages are untouched, and `validate:{ownership,capability-matrix,component-meta,llms,docs-pages}`
all ran green inside the aggregate on the final tree.

---

## 7. Ratchet movements (old → new)

| Ratchet | Old | New | Note |
|---|---|---|---|
| **Executable conformance runners published from this repo** | 4 (anatomy, keyboard, rtl, composition) | **5** | the security corpus stops being only readable |
| **Corpus fixtures asserted against a sanitizer adapter** | **0 of 34** | **10 of 39** | the other 29 are asserted by Core's boundary suites against real components, and 2 are unasserted **with a named reason** |
| Security corpus fixtures | 34 | **39** | additive; no existing id, payload or outcome changed |
| Fixtures for the `markdown` sink | **0** | **1** | first since schema 1.1.0 declared it |
| Fixtures for the `mermaid-svg` sink | **0** | **1** | first since schema 1.1.0 declared it |
| Fixtures for the `DzSanitizeLimits` depth ceiling | **0** | **1** | `maxDepth` and `measureHtmlDepth` had no corpus case at all |
| Corpus content version | *did not exist* | **1.1.0**, fingerprinted | a fixture edit without a bump now fails locally instead of silently invalidating a downstream result |
| `@dzup-ui/testing` published subpaths | 3 | **4** | declared in `required-export-subpaths.json` with its reason |
| Packages in `packages/` with a README | 8 of 9 | **9 of 9** | `@dzup-ui/testing` was the gap |
| `validate:all` links | 53 | **54** | new link at position 11 |
| `validate:all` links green | 49 of 53 | **49 of 54** | the same single pre-existing red, now at link 50 |
| Test files / tests | 560 / 10,755 | **563 / 10,876** | |
| Corpus outcome census (all sinks) | rejected 13 · stripped 7 · escaped 35 · inert 11 · admitted 0 | **rejected 14 · stripped 11 · escaped 39 · inert 11 · admitted 0** | |
| Pending changesets | 41 | **42** | `@dzup-ui/testing: patch` |
| `maxProposedCitedFromCode` | 3 | **3** | untouched |
| capability stale / unrun / excepted / fail | 22 / 400 / 47 / 0 | **22 / 400 / 47 / 0** | untouched — the 22 are all `perf-baseline`, owned by S1-O4 |
| AT matrix executed | 0 / 534 | **0 / 534** | untouched; no manual cell filled |
| unclassified / `maxWithoutAnatomy` | 29 / 41 | **29 / 41** | untouched |

**No ratchet raised. No ceiling lifted. No allowlist widened. No exception file
touched. No deviation recorded to excuse a failure — `security-deviations.json`
is byte-unchanged. Nothing committed.**

The one number that could have been made to look better by weakening something is
`lossy 9`. It is reported as-is: Core's default escapes where a real sanitizer
would strip, and the alternative — relaxing the `stripped` fixtures to `escaped` —
would have been weakening nine fixtures to flatter one adapter.

---

## 8. Owner decisions raised

**D-S3O3-1 🟠 — should the corpus gain an `attribute-name` sink?**
Form doc 06 §10 forbids spreading unknown renderer-option **keys** onto a DOM
element. A value that becomes an attribute *name* cannot be escaped, so `rejected`
is the only safe outcome, and today the format has no sink that says so.
*Options:* (a) add sink `attribute-name` — a **minor** schema bump: the union, the
`SECURITY_SINKS` constant, `definitions.sink.enum` and the outcomes-map property
order in the JSON Schema (the gate compares key order), plus every data file's
`schemaVersion`; (b) leave it to a source-level gate that forbids `v-bind` of an
untrusted object; (c) leave it unexpressed.
*Recommendation:* **(a), but not before (b) exists.** A sink no suite consumes
produces a fixture nothing runs — the exact silent-pass this task spent its budget
preventing. Add the sink in the same packet as the gate that reads it.

**D-S3O3-2 🟠 — where does a provenance rule live?**
Graph doc 06 requires that a **document-provided** URL is never fetched. The same
string is legitimate from a trusted prop, so the rule is a property of the
*binding*, not of the payload, and a payload-keyed corpus cannot state it — as
`subresource: rejected` it would fail every legitimate image component.
*Options:* (a) add a `provenance` field to `BoundaryBinding` and assert per
binding, in Core; (b) a second fixture kind (`provenance-fixtures.json`) beside
the peer-compatibility file; (c) leave it to the tier that renders documents.
*Recommendation:* **(a).** The corpus is for payloads; provenance belongs to the
binding registry, which already knows which prop it is feeding.

**D-S3O3-3 🟢 — one `lossy` count, or a second reference for a real sanitizer?**
Core's reference is 9 lossy of 10 because Core bundles no sanitizer, and it always
will be. A consumer reading it might conclude the corpus cannot be passed
cleanly.
*Options:* (a) keep one reference and rely on the `lossy` field; (b) add a
DOMPurify dev-dependency to `@dzup-ui/testing` and record a second reference;
(c) publish an example reference in the README from a DOMPurify run without adding
the dependency.
*Recommendation:* **(a) now, (c) when someone asks.** (b) puts a parser in a test
package for a library that renders no HTML, which is the same argument
`sanitize.ts` already settled for the runtime default.

**D-S3O3-4 🟢 — should the reference join `evidence-binding.json`?**
It carries a `sourceCommit` and is a generated artifact, which is the shape that
gate governs. But its declared inputs would be the corpus files, and the commit
that lands a regeneration touches them, so registering it makes the gate red on
the one commit where the artifact is most correct — the failure
`$whyNotEqualsHead` documents.
*Options:* (a) leave it unregistered and rely on `validate:security-conformance`,
which re-measures rather than trusting a stamp; (b) register it and add the corpus
directory to `generatedOutputs` (**wrong** — it is a source); (c) register it with
an empty `generatedFrom`.
*Recommendation:* **(a).** A gate that re-derives the number beats a gate that
checks a timestamp on it.

**D-S3O3-5 🔴 — Trusted Types is still unimplemented, and the runner can now see
where it would be measured.** S2-O1 row 9 records one governed sink shipping with
no Trusted Types policy. `DzSanitizeContext.trustedTypes` exists as an *advisory*
flag and **no adapter in this repository honours it**; the runner therefore never
sets it, because asserting a flag nothing reads would be a fabricated verdict.
*Options:* (a) add a `trustedTypes: true` arm to the runner and a corpus
`extensions["com.dzup"]` field recording the policy name, so an adapter that
claims Trusted Types is measured; (b) implement a Trusted Types policy in Core
first; (c) leave both.
*Recommendation:* **(b) then (a)**, and keep them in that order — a conformance
arm for an unimplemented feature is exactly the assertion-without-measurement this
task exists to remove. **Decision recorded, deliberately not acted on:** Trusted
Types is out of this packet's scope and adding a measurable-looking arm would have
made the gate less honest, not more.

**D-S3O3-6 🟠 — the Nuxt module's nonce-less `innerHTML` (S2-O1 D-S2O1-3) is not
a corpus matter, and that is worth stating.** The ADR-15 FOUC script is
**first-party code the module itself writes**, not untrusted input, so no fixture
can express it and none was added: a sanitizer corpus that grew a fixture for the
library's own script tag would be measuring the wrong thing. The defect is real
and remains D-S2O1-3's; the fix is reading `DZ_NONCE_KEY` in
`packages/nuxt/src/module.ts`, and the lane that could see it is a Nuxt-module CSP
fixture, which `e2e/csp` is not (it tests a Vite app).
*Recommendation:* fix under D-S2O1-3; do **not** route it through the corpus.

---

## 9. Ranked next packet

1. **TASK-S5-O1** — nothing in this task blocks it. The runner is published, the
   corpus is versioned and fingerprinted, and the reference is recorded, so any
   packet that needs to cite "the security contract is executable" can cite
   `packages/core/security/sanitizer-conformance.reference.json` at `4e4e46f`
   and `validate:security-conformance` as link 11 of 54. **The one thing S5-O1
   must not assume** is that the two unasserted cells are passing — they are
   unasserted, the report says so in words, and the number to quote is
   *10 asserted, 2 unasserted, 0 non-conforming*, never "12 green".
2. **D174/D175 (icon swap)** — still the single red link in `validate:all`, now at
   position 50, and it has blocked links 51–54 from ever running in the aggregate
   for four consecutive tasks. One owner decision; every task since S1-O2 has had
   to verify four links by hand because of it.
3. **D-S3O3-2 → a `provenance` field on `BoundaryBinding`** — the cheapest way to
   make the Graph spec's "never fetch a document-provided URL" rule executable,
   and it needs no schema change.
4. **D-S3O3-5(b) — a Trusted Types policy in Core**, which is also S2-O1 row 9's
   red. The conformance arm that measures it (D-S3O3-5(a)) is then a small
   follow-on rather than a speculative feature.
5. **D-S3O3-1 — the `attribute-name` sink plus the source-level gate that reads
   it**, as one packet, never as two.
