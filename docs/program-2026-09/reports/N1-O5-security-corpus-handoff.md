# TASK-N1-O5 — Security corpus: un-except `DzFileUpload`, cover the `SecurityBoundary` declarers

> **Handoff.** Run 2026-09-01 against `ui/dzup-ui` `main` @ `51dec93`,
> **worktree dirty** (~90+ files from N0-05 / N1-O1 / N1-O2 / N1-O3 / N1-O6, plus
> this task's). Every number below is **locally qualified, worktree-dirty** —
> not CI, not release, not production evidence. Nothing was committed, pushed,
> dispatched or published.
>
> `test-results/matrix-report.json` verified intact at MD5
> `15b4139314e12569cc160609fa0692a3` before and after. No Playwright command was
> run; no `e2e/visual/` baseline was touched.

---

## 0. Headline

| | |
|---|---|
| **DzFileUpload security exceptions** | **2 → 0.** Both are now real specs. One of the two exception texts was **factually false** and the falsehood was load-bearing. |
| **Corpus** | Schema v1.0.0 in `@dzup-ui/testing`, **34 fixtures across 6 categories**, shared by design with Pro's TASK-N1-P1. |
| **Declarers covered** | **15**, not the 13 the task file says — 13 `url` + 1 `file` + 1 `payload`. **263 fixture assertions bound**, all measured. |
| **Capability-matrix security cells** | `2 present · 2 excepted · 41 unrun` → **45 present, 0 unrun, 0 excepted**. |
| **False declared boundary** | **None.** Every component crosses the boundary it declares. But the URL boundary is crossed with **no policy at all** — 6 components, 54 measurements, **high severity**, reported not fixed. |
| **Validation** | `yarn validate:all` **exit 0, 28 links**. `yarn test` red with the **2 pre-existing** failures and no others. |

---

## 1. Discovery

### 1.1 What `DzFileUpload`'s two exceptions actually said

From `packages/tooling/src/quality/component-tiers.ts`, both on the only Tier D
component in the catalog:

| Row | Exception text (verbatim, abridged) | Verdict |
|---|---|---|
| `url-policy` | *"The component accepts no URL of any kind: no `href`, no `src`, no `createObjectURL`, no download link. There is no URL for a policy to be about."* | **True, and the wrong shape.** |
| `csp-fixture` | *"No inline style, no inline script, no `blob:` or `data:` URL, no HTML sink and no worker — so there is no CSP directive whose absence changes its behaviour."* | **False in its first clause.** |

**`url-policy`.** The claim held. The problem was its shape: *"there is no URL
here"* is not the absence of a policy, it **is** a policy — an allowlist of zero
schemes, the strictest one available. A policy can be asserted; an exception can
only be believed. The practical difference is the day somebody adds an image
preview: under the exception, `createObjectURL` appears in a diff and the matrix
cell stays `excepted` until a human re-reads the threat model. Under the spec,
that diff turns a line red.

**`csp-fixture`.** Four of five clauses were true. **"No inline style" was
not.** `DzFileUpload.vue`'s template root carried
`style="contain: layout style"`. A `style` **attribute** is governed by
`style-src-attr`, which falls back to `style-src`, so a strict CSP without
`'unsafe-inline'` **blocks it**. The one CSP directive the exception said did
not exist was the one that silently removed the component's CSS containment —
and containment is exactly what the hostile corpus beside it relies on to keep a
4 096-character file name inside the component box. *The hosts that configured
CSP most carefully got the least contained control, and nothing in a repository
with 29 validators could see it.*

This is the same class as N1-O3's `DzLightbox` finding (G1) and G2's
`--dz-spacing-N-N`: a declared property that was never an implemented one.

### 1.2 The declarers — 15, not 13

The task file and the ledger say **13**. Measured from
`packages/core/docs/quality-matrix.json`: **15 components declare a non-`none`
boundary.** The 13 is the count of `url` declarers only.

| Boundary | Count | Components |
|---|---|---|
| `url` | 13 | DzAnchor, DzAvatar, DzAvatarGroup, DzBreadcrumb, DzButton, DzImage, DzImageCard, DzImageComparison, DzLightbox, DzMegaMenu, DzMenu, DzPersonaSelector, DzSidebar |
| `file` | 1 | DzFileUpload (the Tier D component) |
| `payload` | 1 | DzQRCode |

`BOUNDARY_EVIDENCE` in `@dzup-ui/contracts` makes `url` owe
`threat-model + malicious-corpus + url-policy`, `payload` owe
`threat-model + malicious-corpus`, and `file` owe
`threat-model + malicious-corpus`. `DzFileUpload`'s `url-policy` and
`csp-fixture` rows come from **tier D**, not from its boundary. **No component
declares `html`**, so no `csp-fixture` row exists anywhere except on the Tier D
component — which is precisely why excepting it emptied the rule.

### 1.3 What each declarer actually does — measured, not read

A throwaway probe mounted all 15 with a hostile URL and dumped every URL-bearing
attribute in the rendered DOM (deleted before handoff). Three structural facts
came out of it that no reading of the matrix would have given:

1. **Three declarers have no sink of their own.** `DzMenu`, `DzSidebar` and
   `DzBreadcrumb` are containers; the `href` lives on `DzMenuItem`,
   `DzSidebarItem` and `DzBreadcrumbItem` — **compound sub-parts that are not
   rows in the quality matrix** (144 rows; none of the three appear). The parent
   declares a boundary its child crosses. `DzAvatarGroup` is the same shape for
   `src`. The bindings therefore mount the parent with the child inside it,
   which is both how the boundary is crossed and how a consumer writes it.
2. **`DzQRCode` has an undeclared URL sink.** Its `icon` prop becomes
   `<img src>` — word for word the property `DzImage`'s boundary justification
   uses. `SecurityBoundary` holds **one value per component**, so declaring
   `payload` means the URL rows are never asked for. Bound and asserted anyway.
3. **`DzImage` has a second, quieter URL sink**: `fallback`, reached only after
   the first `src` errors.

And the finding that shaped the whole task: **`grep` over `packages/core/src`
for `javascript:`, `sanitizeUrl`, `allowedSchemes`, `protocol` returns nothing.
There is no URL policy anywhere in Core.**

### 1.4 Pro's TASK-N1-P1, for schema coordination only

Read `ui/dzup-ui-pro/docs/program-2026-09/evidence-repayment-tasks.md`
§TASK-N1-P1. **No Pro code was read for implementation and none was written.**

Pro plans a **generated HTML-sink registry** (`packages/pro/manifests/` or
`tools/`), gated by `validate:sinks`, one row per sink with: *component · file ·
sink kind · content source (consumer prop / persisted document / LLM output /
remote) · sanitizer profile · Trusted-Types status*. Its `<corpus>` requirement
reads *"Shared schema with OSS; fixtures as data files; every registry entry has
corpus specs asserting the REQUIRED neutralization outcome per fixture
category."*

Two consequences drove the schema below:

- **"sink kind" is a first-class column in Pro's registry.** So it is the key of
  the outcomes map here, and a Pro registry row needs **no translation table**:
  `fixturesForSink(entry.sink, …)` and read `.required`.
- **Pro's sinks include classes OSS has none of** (`v-html`, markdown/mermaid,
  dynamic `iframe src`). `SecuritySink` therefore enumerates `html` and the
  `markup-injection` file carries `html: 'stripped'` outcomes and an mXSS
  comment case, even though **nothing in OSS has an `html` sink today**. Those
  rows are unused here on purpose — they are the interface.

---

## 2. The corpus schema (v1.0.0)

**Schema:** `packages/testing/src/security-corpus.ts` (types, validator, loader)
**Data:** `packages/testing/security-corpus/*.corpus.json` (6 files, 34 fixtures)
**Docs:** [`packages/testing/security-corpus/README.md`](../../../packages/testing/security-corpus/README.md) ← **the pointer for the Pro program**
**Conformance gate:** `packages/testing/src/security-corpus.spec.ts` (14 tests)

```ts
import type { SecurityFixture, SecuritySink } from '@dzup-ui/testing'          // types
import { fixturesForSink, payloadOf } from '@dzup-ui/testing/security-corpus'  // loader
```

### 2.1 The one decision worth arguing about

**A fixture does not carry a single expected outcome. It carries one per sink
kind.**

> `javascript:alert(1)` in an `<a href>` **must be `rejected`** — it executes in
> the host's own origin on click.
> The identical string in an `<img src>` is **`inert`** — no shipping engine has
> fetched a `javascript:` subresource this decade; the element fires `error`.

A single global outcome forces a choice between a corpus that cries wolf on
every image component and one that says nothing about anchors. Neither is
usable, and the second is how a matrix stops being read. So:

```jsonc
{
  "id": "url-scheme.javascript.plain",   // {category}.{family}.{case}, never reused
  "category": "url-scheme",
  "title": "javascript: URL, unobfuscated",
  "payload": "javascript:alert(1)",
  "repeat": 4096,                        // optional; ALWAYS resolve through payloadOf()
  "outcomes": {                          // required; an empty map is a schema violation
    "navigation": "rejected",
    "subresource": "inert"
  },
  "rationale": "…",                      // required; > 80 chars wherever `inert` appears
  "provenance": "…"                      // required
}
```

The task's requirement — *every fixture states the expected safe outcome, not
merely "does not crash"* — is met **per sink**, which is the only way it can be
met truthfully. A sink absent from the map is one the fixture says nothing
about; `fixturesForSink` **omits** it rather than defaulting it, and a spec
asserts that (`css-injection.expression.legacy` must not appear in a navigation
query).

### 2.2 Vocabulary

- **`SecurityCategory`** — `url-scheme` · `markup-injection` · `css-injection` ·
  `degenerate-input` · `file-metadata` · `encoded-payload`. The first four are
  the reassessment's; the last two are what this catalog actually needs (Tier D
  is a file control; a QR code hands a string to a camera).
- **`SecuritySink`** — `navigation` · `subresource` · `html` · `text` ·
  `attribute` · `style` · `encoded-payload` · `file`.
- **`NeutralizationOutcome`** — `rejected` (never reached the sink) · `stripped`
  (dangerous part removed) · `escaped` (verbatim **as data**: readable, built no
  element/attribute/handler) · `inert` (verbatim, and the sink cannot act —
  **requires a stated reason**; the schema spec enforces > 80 characters of
  rationale wherever `inert` appears, because `inert` is the outcome you can
  claim without proving anything).

**There is deliberately no schema value for "unsafe."** A measurement needs one
and it belongs to the measuring code: OSS calls it `passed-through` in
`boundary-suites.ts`.

### 2.3 Why it is shaped for both repositories

| Decision | For OSS | For Pro |
|---|---|---|
| Outcomes keyed by sink | 13 url declarers split cleanly into 6 navigation (strict) and 7 subresource (inert) without two corpora | a registry row names its sink kind; that string is the lookup key |
| `html` sink + mXSS cases present but unused in OSS | costs nothing | the 14 DOMPurify sites and the markdown/mermaid/chat paths land on cases that already exist |
| `repeat` + mandatory `payloadOf()` | a 4 096-char run stays reviewable in JSON | same, and a form-payload corpus needs oversized cases badly |
| `provenance` required | no case can be somebody's invention | an auditor can check representativeness without trusting either repo |
| Data outside `src/`, resolved from `import.meta.url` | `../security-corpus` is the same directory from `src/…ts` and `dist/…js` — no build-time copy, source and built consumers read one copy | Pro consumes the published package and gets the identical files |
| Major-version rejection, ids never reused | a deviation register pins fixture ids | ditto, in a second repository |

### 2.4 The deviation register — the part that makes it a gate

`packages/core/security/security-deviations.json`. When a component does **not**
meet a required outcome, the fixture is **not** weakened. The measurement is
recorded, and the suite then asserts the **recorded** value. Both directions
fail:

- a component that regresses further → the pin no longer matches → red;
- a component that gets **fixed** → the pin no longer matches → red, until
  somebody deletes the entry and lowers the ceiling.

**A recorded deviation is a defect that cannot rot.** Every entry carries
`severity`, `publicBehaviourChange` and a reason ( > 80 chars, asserted). The
ratchet counts **(component, sink, fixture) triples**, not entries, so widening
an existing entry's `fixtures` array cannot hide new failures inside a row that
already existed.

---

## 3. `DzFileUpload` — obligations implemented, exceptions removed

**Ratchet: security exceptions 2 → 0.** `component-tiers.ts` now carries no
`exceptions` key for `DzFileUpload`; the block is replaced by a comment saying
what the exceptions were and where they went.

### 3.1 `url-policy` → `packages/core/security/DzFileUpload.url-policy.spec.ts`

The deny-all policy the exception was really describing, asserted:

- **No URL-bearing attribute** anywhere in the render — `href`, `src`, `srcset`,
  `action`, `formaction`, `poster`, `data`, `cite`, `background`, `ping`,
  `xlink:href` — at rest, with files listed, and in the error / disabled /
  invalid / `accept`+`maxSize` states.
- **`URL.createObjectURL` never called.** jsdom leaves it undefined, so a
  component that started calling it would *throw* — a fine failure mode but not
  an observable one. The spec **installs a working spy** so the call would
  succeed and be counted: the assertion is about the component, not about
  jsdom's gaps. Checked on **both doors** (picker `change` and `drop`) in
  **both** model modes (`file`, `ref`).
- **No `blob:` / `data:` / `javascript:` / `vbscript:` / `filesystem:` value**
  in any attribute.
- **The whole corpus run through the only channel a URL can arrive on** — the
  file name: all 9 `url-scheme` cases plus all 7 `file-metadata` and all 7
  `markup-injection` cases, each asserting no URL attribute appears **and that
  the name is still readable** (a policy that neutralized by dropping the value
  would be a different, worse component).

### 3.2 `csp-fixture` → `packages/core/security/DzFileUpload.csp-fixture.spec.ts`

Policy asserted against:

```
default-src 'self'; script-src 'self'; style-src 'self';
img-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none';
```

`cspViolations(root)` returns every blocked construct **with the directive it
broke**: inline `<script>`, `<style>` element, `style` attribute
(`style-src-attr`), any `on*` attribute (`script-src-attr`), `javascript:` /
`vbscript:` in any attribute, `data:`/`blob:` in `src`/`href`, `<object>`,
`<embed>`, `<iframe>`, `<base>`. Asserted empty at rest, in all six declared
states, mid-drag, under all 7 `file-metadata` fixtures, and — because *"functions
under a strict CSP"* is a **behaviour** claim — after every step of a real
sequence: accepted drop → rejected drop → removal, re-checked each time.

Plus **nonce propagation** (ADR-20): mounted under `DzProvider nonce="…"`, the
component injects **no** `<style>` and therefore needs no nonce, and no
un-nonced library style is left in `document.head`.

**The fix this forced.** `contain: layout style` moved from the template's
`style` attribute into the `tv()` recipe as `[contain:layout_style]` —
`DzFileUpload.variants.ts` root slot. This is:

- **the established in-repo form** — `DzCard.variants.ts` and
  `DzPanel.variants.ts` already use exactly that string;
- **the styling contract** (ADR-04 / ADR-19, CLAUDE.md rule 2: `tv()` in
  `.variants.ts`, never a style attribute) — the component had been outside it;
- **not an API change and not a widening.** The CSS is unchanged; only its
  carrier is. Two existing assertions that read the `style` attribute were
  updated to read the class (`DzFileUpload.spec.ts`,
  `DzFileUpload.malicious-corpus.spec.ts`), with the reason recorded at the
  assertion.

> **Repo-wide consequence, deliberately not acted on: after this change, 78
> `.vue` files in `packages/core/src` still carry `style="contain: …"`** (79
> occurrences), and **38 files bind a dynamic `:style`**. Every one of those is
> blocked by a strict `style-src` without `'unsafe-inline'`. Fixing 78
> components mid-task would mix this packet's result with a repo-wide change
> nobody reviewed — see §7, F-C1.

**What is still owed:** jsdom does not enforce CSP. These specs prove the
component **emits nothing a strict policy blocks**; they do not prove a browser
served a real `Content-Security-Policy` header accepted the page. That is a
Playwright lane, recorded as a gap, not as done. (It is also the half that does
not regress — the emitted-construct half is.)

---

## 4. Per-component results

**263 fixture assertions bound across 15 declarers. 209 met their required
outcome; 54 did not and are recorded with severity.**

| Component | Family | Tier | Boundary | Primary sink | Fixtures | Result |
|---|---|---|---|---|---|---|
| DzButton | buttons | B | url | navigation | 16 | **9 deviations** — S1 high, S2 low |
| DzAnchor | navigation | B | url | navigation | 20 | **9 deviations** — S3 high, S4 low |
| DzBreadcrumb | navigation | B | url | navigation | 16 | **9 deviations** — S5 high, S6 low |
| DzMenu | navigation | B | url | navigation | 16 | **9 deviations** — S7 high, S8 low |
| DzSidebar | navigation | C | url | navigation | 20 | **9 deviations** — S9 high, S10 low |
| DzMegaMenu | navigation | C | url | navigation | 20 | **9 deviations** — S11 high, S12 low |
| DzAvatar | media | A | url | subresource | 20 | all met |
| DzAvatarGroup | media | A | url | subresource | 20 | all met |
| DzImage | media | A | url | subresource | 16 | all met |
| DzImageCard | cards | A | url | subresource | 16 | all met |
| DzImageComparison | media | B | url | subresource | 20 | all met |
| DzLightbox | media | B | url | subresource | 20 | all met |
| DzPersonaSelector | forms | C | url | subresource | 20 | all met |
| DzQRCode | media | A | payload | encoded-payload | 23 | all met (incl. the undeclared `icon` subresource sink and CSS-injection on `color`) |
| **DzFileUpload** | forms | **D** | file | file | **23** + 42 CSP/URL-policy assertions | **all met; 0 exceptions** |

Suite totals actually executed:

| Suite | Tests |
|---|---|
| `url-boundary.url-policy.spec.ts` | **144 passed** |
| `url-boundary.malicious-corpus.spec.ts` | **151 passed** |
| `DzFileUpload.url-policy.spec.ts` + `.csp-fixture.spec.ts` + `.malicious-corpus.spec.ts` | **42 passed** |
| `packages/testing/src/security-corpus.spec.ts` | **14 passed** |
| **Total in this task's lane** | **372 passed, 0 failed** |

**The positive result is worth stating plainly: 151/151 hostile-content
assertions pass.** Every declarer escapes markup injection, attribute
break-out, mXSS-shaped comments, bidi overrides, embedded NULs, stacked
combining marks and 4 096-character runs — in text nodes **and** in attribute
values, which are different escaping contexts and were asserted separately.
**No component in this catalog has a markup-escaping defect.** All assertions
read the DOM: `expect(wrapper.html()).not.toContain('onerror')` is the obvious
check and it is wrong in the direction that matters — a correctly escaped text
node re-serializes with the substring in it, so that assertion fails the
component that got it right.

---

## 5. Declared boundaries that turned out to be false

**None. Every one of the 15 declares a boundary it genuinely crosses, and the 13
`url` declarers really do put a host-supplied URL into a live attribute.** The
stop condition about a false declaration did not fire.

What fired instead is worse in one respect and better in another: **the boundary
is declared and there is no policy behind it anywhere.**

### F-U1 — No URL policy exists in `packages/core/src`. **Severity: HIGH.**

Measured, not inferred. All **9** `url-scheme` fixtures reach the rendered
`href` **verbatim** on all **6** navigation-sink components — 54 measurements,
`S1`–`S12` in `security-deviations.json`.

| | |
|---|---|
| **Impact** | A `javascript:` URL from whatever populates a menu, breadcrumb, sidebar or anchor list — a CMS row, an API navigation tree, a user profile, a model response — **executes in the host's own origin** on an ordinary click, with the host's cookies and DOM. |
| **Evasions confirmed live too** | mixed case, a leading C0 control, and an embedded tab all reach the attribute. A future policy built on `startsWith('javascript:')` closes one of the four. |
| **Also passed through** | `vbscript:`, `data:text/html`, `data:image/svg+xml` with `onload` (7 fixtures, high) and `file:` / foreign-origin `blob:` (2 fixtures, low — recorded **separately** so closing the high half does not appear to close the low half). |

**Why it is reported, not fixed.** Refusing these schemes is a **breaking
change**: `javascript:void(0)` is a widespread legacy idiom in exactly these
item-list props; today it renders and works, and after a policy it would not.
That is a public-behaviour change, which this task's stop condition routes to a
defect report. **Routes to the release lane, TASK-N5-02, alongside the ARIA-prop
gaps.**

**What the fix should look like** (written down so the decision is a decision,
not a design exercise — §2a of `url-boundary.threat-model.md`): an **allowlist**
(`http`, `https`, `mailto`, `tel`, `sms`, relative, fragment), applied **after**
WHATWG normalization — `effectiveScheme()` in `boundary-suites.ts` is already
exactly that function and already handles all three evasions. Rejection should
render the anchor with **no `href`**, not a rewritten one: silently rewriting to
`#` produces a control that looks operable and is not. An opt-out **prop** would
re-open the hole for the consumers most likely to need it, so the escape hatch
belongs at the provider (ADR-20), once, with a name that says what it costs.

### F-U2 — The subresource half is fine, and the residual is not XSS. **Severity: LOW (documentation).**

All 8 subresource bindings meet `inert`: the value stays on an `<img>`, builds
no element and no handler. Zero deviations. `javascript:`/`vbscript:` in an
`<img src>` have not executed in any shipping engine this decade;
`data:image/svg+xml` in an `<img>` is script-**disabled** by specification;
`data:text/html` is refused by the decoder.

**The residual is a request.** An arbitrary `src` is an unconditional GET to an
origin the page's author did not choose — a tracking pixel, an internal-network
probe from the user's browser, a very large response. No component can decide
which origins a consumer trusts, and one that tried would be useless (avatars
come from CDNs). **This is the host's `img-src` directive and the documentation
has to say so.** Recorded so the empty deviation list is not read as "nothing
left".

### F-U3 — `DzQRCode` has an undeclared URL sink. **Severity: MEDIUM.**

`icon` is a host-supplied URL rendered as `<img src>` over the code — verbatim
the property `DzImage`'s boundary justification uses. `SecurityBoundary` is a
**single value per component**, so declaring `payload` means the `url-policy`
row is never asked for. The sink is bound and asserted anyway (it measures
`inert`), but **the matrix cannot express it**. Making `securityBoundary` a set
is an owner decision; until then the threat model §2c is the record.

### F-U4 — Three declarers' sinks live in components the matrix does not know. **Severity: MEDIUM (governance).**

`DzMenu`, `DzSidebar` and `DzBreadcrumb` declare `url` and have **no sink of
their own**; `DzMenuItem`, `DzSidebarItem` and `DzBreadcrumbItem` carry the
`href` and are **not among the 144 rows**. The boundary is declared on the
parent and crossed by the child. It works — the bindings mount parent-with-child
— but it means *"which components own a URL sink"* cannot be answered from the
matrix alone.

### F-U5 — `DzImage.fallback` is a second URL sink. **Severity: LOW.**

Reached only after the first `src` errors, so a hostile `src` that fails is what
puts the fallback URL into the DOM. Same required outcome, same measured result.
Noted because a reviewer looking for "the URL prop" finds one and there are two.

### F-C1 — 78 components carry a `style` attribute a strict CSP blocks. **Severity: MEDIUM.**

The generalisation of §3.2, measured after `DzFileUpload` was fixed:

| Measurement over `packages/core/src/**/*.vue` | Count |
|---|---|
| files with a static `style="contain: …"` | **78** (79 occurrences) |
| files binding a dynamic `:style="…"` | **38** |

Every one is dropped by `style-src 'self'` without `'unsafe-inline'`. Only
`DzFileUpload` was fixed here, because it is the component whose obligation this
task owns. **This is not a one-line sweep:** the 38 dynamic bindings (DzLightbox
`pointer-events`, DzImageCard `aspect-ratio`, DzQRCode `width/height`,
DzImageComparison `clip-path`, DzAnchor's per-level `padding-inline-start`)
**cannot become classes** and need a different answer — CSS custom properties
set from a stylesheet, or an explicitly accepted `'unsafe-hashes'`/`'unsafe-inline'`
position for the library. §7 ranks it.

---

## 6. Validation

### Tooling failures — **none introduced.**

```
yarn validate:all                                    exit 0   (28 links, all green)
  ├─ yarn typecheck (vue-tsc, packages/core)         exit 0
  ├─ yarn lint (eslint packages/ apps/, --max-warnings 0)  exit 0
  ├─ validate:quality-tiers   144/144 tiered (A55 B67 C21 D1); matrix fresh
  ├─ validate:capability-matrix  fresh, "no Tier D cell is unexplained"
  ├─ validate:tokens · validate:story-dod · validate:story-dod-tiers  green
  └─ validate:visual-baselines (link 15)             green  — no baseline touched
```

Focused lane:

```
vitest run packages/core/security packages/testing/src/security-corpus.spec.ts
           packages/core/src/components/forms/DzFileUpload.spec.ts
                                                     7 files, 372 passed, 0 failed
```

Generators re-run (both deterministic, both re-validated):

```
tsx packages/tooling/src/quality/generate-quality-matrix.ts     144 components
tsx packages/tooling/src/quality/generate-capability-matrix.ts  144 rows, 1 661 cells
```

Capability-matrix security cells (`threat-model`, `malicious-corpus`,
`url-policy`, `csp-fixture`), before → after:

| State | Before | After |
|---|---|---|
| `present` | 2 | **45** |
| `excepted` | 2 | **0** |
| `unrun` | 41 | **0** |

Tier D row: `7 pass · 12 present · 1 stale · 1 unrun · **0 excepted**` (was 2
excepted). Cell count unchanged at **1 661** — no cell was added or removed;
41 moved state.

### Component failures — **none introduced.**

`yarn test` → **2 failed | 8 542 passed | 2 skipped | 1 todo (8 547)**.
Both failures are the **pre-existing** ones named in the ledger (G6), in files
this task never touched:

1. `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts` — six
   hard-coded colour fallbacks in the landing themes page disagree with their
   tokens. Belongs to the landing app.
2. `packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen >
   subtracts a waiver` — its fixture asks the live repo for an open
   tier-required item and **N1-O1 drove that count to 0**, so `find` returns
   `undefined`. N1-O1's success breaking its own unit test.

**One failure was mine and is fixed:**
`packages/tooling/src/resolution/dzup-resolution.spec.ts > covers exactly the
specifiers the packages declare` — an inline snapshot of every `@dzup-ui/*`
specifier, which correctly caught the new `@dzup-ui/testing/security-corpus`
export subpath. Snapshot updated by hand (one line, in sorted position), not by
`-u`. **This is the resolution gate working exactly as designed** and is worth
noting for anyone adding an export subpath.

### Run-record protection

`test-results/matrix-report.json` MD5 verified `15b4139314e12569cc160609fa0692a3`
at task start and at task end. **No Playwright command was run in this task at
all**, so the `--output` precaution from N1-O3's appendix was never needed.
`e2e/visual/` untouched.

---

## 7. Owner decisions, and the ranked next packet

### Unresolved `[!owner]`

| # | Decision | Raised by |
|---|---|---|
| **O5-1** | **Six components put an unfiltered host URL into a live `<a href>`.** Closing it is a breaking change (`javascript:void(0)` renders today and would stop). The allowlist, the rejection shape (no `href` vs rewritten `#`) and the escape-hatch location (provider, not prop) are written up in `url-boundary.threat-model.md` §2a. **Needs a release-lane decision, not an agent's.** | F-U1 |
| **O5-2** | **`securityBoundary` is one value per component**, so `DzQRCode` cannot declare both `payload` and `url` and its `icon` sink is invisible to the matrix. Making it a set changes what an unknown number of components owe. | F-U3 |
| **O5-3** | **Compound sub-parts are sinks but not matrix rows.** Either they become rows (144 → more, and they owe evidence), or the matrix documents that a parent's boundary covers its parts. | F-U4 |
| **O5-4** | **78 components emit a static `style` attribute a strict CSP blocks, and 38 bind a dynamic `:style` that cannot become a class.** Needs a repo-wide answer (custom properties from a stylesheet, or an accepted `'unsafe-hashes'`/`'unsafe-inline'` position) before a CSP claim can be made for the library. | F-C1 |
| **O5-5** | **No browser has verified any CSP claim.** jsdom does not enforce CSP; these specs prove emitted constructs, not acceptance. A Playwright lane serving a real header is owed. Same shape as E5 (WebKit-on-Windows is not Safari). | §3.2 |
| **O5-6** | **The capability-matrix generator learned a new input in this task** — `packages/core/security/coverage.json`, declaring which components a class-level artifact covers, with the generator failing if the named file is absent. This is the same kind of extension N1-O6 made for visual evidence. It should be confirmed as intended, or the alternative (13 stub threat-model documents whose only content is a pointer) chosen instead. **Rejected here as box-ticking, but it is not an agent's call.** | §8 |

### Ratchet board delta

| Ratchet | Before | After |
|---|---|---|
| **DzFileUpload security exceptions** | 2 | **0** ✅ closed |
| security-corpus deviations (triples) | *(uninitialised)* | **54** — ceiling 54, 42 high / 12 low, all `publicBehaviourChange: true` |
| capability-matrix security cells `unrun` | 41 | **0** |
| capability-matrix security cells `excepted` | 2 | **0** |

### Ranked next packet

1. **O5-1 → TASK-N5-02.** The one high-severity finding. 54 measurements, one
   function (`effectiveScheme`) already written and tested, six call sites. The
   work is small; the *decision* is not, which is why it is ranked first.
2. **A strict-CSP browser lane (O5-5)**, built on the existing `e2e/matrix`
   harness — not a second harness. Would also settle F-C1's real severity.
3. **F-C1's repo-wide `style`-attribute sweep**, after 2 tells us whether the
   dynamic-`:style` components need a different mechanism.
4. **An SSR pass over the same corpus.** E6 already proved a defect class *no
   browser matrix can see* (`<ul arialabel="…">`); these specs are all
   client-side, so the same blind spot applies to every assertion in §4.
5. **O5-2 / O5-3** — matrix expressiveness. Cheap, and they stop the next audit
   re-deriving F-U3 and F-U4.
6. **Pro TASK-N1-P1** can start immediately: the schema is stable, versioned and
   documented. §8.

---

## 8. For the Pro program (TASK-N1-P1 / QUAL-04)

**Schema pointer:**

- Contract + loader — `packages/testing/src/security-corpus.ts`
- Fixture data — `packages/testing/security-corpus/*.corpus.json`
- **Consumption guide — `packages/testing/security-corpus/README.md`**
- Worked reference implementation — `packages/core/security/boundary-suites.ts`
  (measurement + deviation pinning) and `boundary-bindings.ts` (one file, one
  entry per component, "which prop reaches which element")
- Deviation-register shape — `packages/core/security/security-deviations.json`

```ts
import type { SecurityFixture, SecuritySink } from '@dzup-ui/testing'
import { fixturesForSink, payloadOf } from '@dzup-ui/testing/security-corpus'
```

**Four things to carry over, and one not to.**

1. **Your registry's `sink kind` column is the key into `outcomes`.** No
   translation table. `fixturesForSink(entry.sink, categoriesFor(entry))`, then
   assert `.required`.
2. **`html` is already in the vocabulary and unused in OSS.** Nothing in Core
   has an HTML sink, so `markup-injection`'s `html: 'stripped'` outcomes and the
   mXSS comment case exist purely as the interface for your 14 DOMPurify sites
   and the markdown/mermaid/chat paths. Extend the file; do not fork it.
3. **When a sink fails, record and pin — never weaken the fixture.** The
   deviation register is what turns a defect into a gate that fails in *both*
   directions. Count triples, not entries.
4. **`payloadOf()`, always.** Reading `fixture.payload` is correct for every
   fixture without `repeat` and silently wrong for every one with it — the worst
   failure mode available: the oversized case still runs, still passes, and
   stopped being oversized.
5. **Do not add a generator.** The corpus proves neutralization. Anything that
   *produces* payloads is a different tool with a different reason to exist, and
   the `<no_offense>` scope in both task files forbids it.

**Version discipline.** `SECURITY_CORPUS_SCHEMA_VERSION = '1.0.0'`. New category
or sink value, or a new optional field → **minor**. A field changing meaning, or
an id reused for a different payload → **major**, and a file whose major does not
match is *rejected*, not best-effort parsed — because deviation registers in
both repositories pin expectations to fixture ids. If Pro needs a sink OSS does
not have, that is a minor bump here, not a fork there.

---

## 9. Files

**New**

```
packages/testing/src/security-corpus.ts            schema, validator, loader
packages/testing/src/security-corpus.spec.ts       14 conformance tests
packages/testing/security-corpus/README.md         the Pro pointer
packages/testing/security-corpus/*.corpus.json     6 files, 34 fixtures
packages/core/security/boundary-suites.ts          measurement + deviation pinning
packages/core/security/boundary-bindings.ts        15 components → their sinks
packages/core/security/security-deviations.json    12 entries / 54 triples, ceiling 54
packages/core/security/coverage.json               class-level artifact manifest
packages/core/security/url-boundary.threat-model.md
packages/core/security/url-boundary.url-policy.spec.ts
packages/core/security/url-boundary.malicious-corpus.spec.ts
packages/core/security/DzFileUpload.url-policy.spec.ts
packages/core/security/DzFileUpload.csp-fixture.spec.ts
```

**Modified**

```
packages/testing/package.json                      + "./security-corpus" export, + files entry
packages/testing/src/index.ts                      + type-only re-export (no node:fs in the barrel)
packages/tooling/src/quality/component-tiers.ts    − both DzFileUpload exceptions
packages/tooling/src/quality/generate-capability-matrix.ts  + class-level artifact input
packages/tooling/src/resolution/dzup-resolution.spec.ts     + the new specifier (snapshot)
packages/core/src/components/forms/DzFileUpload.variants.ts + [contain:layout_style]
packages/core/src/components/forms/DzFileUpload.vue         − style="contain: layout style"
packages/core/src/components/forms/DzFileUpload.spec.ts     assertion: attribute → class
packages/core/security/DzFileUpload.malicious-corpus.spec.ts   assertion: attribute → class
packages/core/security/DzFileUpload.threat-model.md         exceptions section rewritten
packages/core/docs/quality-matrix.json                      regenerated
packages/core/docs/capability-matrix.json                   regenerated
```

**Component source touched: one file's template line and one variants entry, on
one component (`DzFileUpload`).** No other `packages/core/src` component was
modified. No public prop, emit, slot or variant taxonomy changed. **No
component's accepted input surface was widened** — the only behavioural change
in the repository is where one CSS declaration is written.
