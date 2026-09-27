# dzup-ui — Published-contract seams and spec conformance (S3, S5)

> Part of the [Architecture Review Program 2026-09-22](./README.md). Every
> prompt assumes the `<repo_conventions>` block in [README §5](./README.md#5-how-these-tasks-are-written)
> and the check-first protocol in [README §4](./README.md#4-how-to-run-a-task--the-check-first-protocol).
>
> **Sources:** 08-11 reassessment finding H1 (the resolver's Pro tier), doc 03
> (§"Installation and integration contract", the five-layer contract, the
> documentation contract), doc 06 (§"Internationalization contract",
> §"Security and privacy contract"); the Form System spec doc 04 §4 (the
> built-in control-renderer table and the value-codec contract) and doc 06
> §10 (UI/XSS safety); the Graph spec doc 12 (dependency directions) and doc 05
> (the message catalog seam); 08-28 roadmap N1-P6 (the Pro ownership manifest
> the OSS resolver has been blocked on since P1-02), N2-S1, N5-T1/T2. Every
> number below is bound to `main` @ `589be13` — re-measure before quoting.
>
> **The rule that governs this file:** every task is `ui/dzup-ui` work, and a
> seam is finished when **this repository** has published the contract, gated
> it, and proved it with a fixture of its own. Core imports no commercial-tier
> runtime source and never guesses on a consumer's behalf. Whether a downstream
> tier has adopted a published contract is that tier's business — it is neither
> a blocker here nor a reason to weaken the contract, and no prompt in this file
> writes into, reports on, or waits for another repository's ledger.
>
> **Ordering:** all three S3 tasks run now. S3-O1's live-integration half is the
> only step in this file that needs an artifact this repository does not
> produce; when that artifact is absent the step is **skipped with a named
> reason** and the task still completes. S3-O2, S5-O1 and S5-O2 each end in an
> owner decision.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## 🔴 The seam that has been open since P1-02

### [ ] TASK-S3-O1 — Publish the second-tier ownership schema and wire the resolver's second tier 🔴

_Gap: `@dzup-ui/core`'s resolver and `@dzup-ui/nuxt`'s `includePro` both
advertise a second tier that resolves nothing, because **this repository has
never published the schema an ownership manifest for that tier would conform
to**. 08-11 finding H1 was closed for Core in P1-01/02/03 (exact-name generated
lookup over 207 names, unknown → `undefined`, `validate:package-names`, tarball
fixtures), and the 2026-09-04 R3-O1 packet drafted the consumption path and
stopped — it waited for a manifest instead of publishing the contract that
would make one producible. That inversion is the defect this task fixes: the
schema, the consumption path, the diagnostic and the fixture are all
`ui/dzup-ui` work and all buildable today. Consequences while it stays open:
`includePro` resolves nothing, the `core-pro` tarball fixture is the one of
seven that has never run, and 1.0 exit criterion 7 is unmeetable. Sources:
08-11 doc 01 finding H1 ("generate resolver and Nuxt metadata from a versioned
public component manifest") and doc 07 §P1; 08-28 doc 05 §A1, doc 06 N1-P6;
`../program-2026-09-04/reports/TASK-R3-O1-handoff.md`._

```xml
<role>You are an integration engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5, including its &lt;repository_boundary&gt;. Core never imports second-tier runtime source; you publish a contract, consume a conforming manifest as data when one is installed, and fail closed when it is not.</role>

<task>Publish the contract and wire the consumer, entirely within this repository. (1) Publish the **ownership-manifest schema** for the second tier, versioned, in `@dzup-ui/contracts`, with the exact fields the resolver needs (component name, package, subpath, kind, since, deprecated) and a field-by-field rationale — this is the artifact that has been missing, and shipping it is what lets any second-tier package produce a conforming manifest. (2) Implement consumption: the resolver and `@dzup-ui/nuxt` read a conforming manifest from the installed second-tier package by exact name when `includePro` is on, return `undefined` for unknown names in both tiers, and emit an actionable build-time diagnostic when `includePro` is on and no conforming manifest is resolvable. (3) Add a **synthetic fixture manifest** under this repository's test fixtures (clearly fake, schema-valid) so the whole path — resolve, prefix, collision, unknown, second-tier-absent — is unit-tested today, with no external artifact. (4) Un-block the `core-pro` tarball fixture: make it **skip with a named reason** when no second-tier tarball is available and run when one is, so it stops being silently unrun. (5) Extend `validate:ownership` to check an installed manifest's schema version against the contract when present, and to state its absence explicitly rather than passing quietly.</task>

<motivation>08-11 finding H1 was the most severe integration defect recorded: the advertised two-tier auto-import path resolved a package that does not exist, over handwritten stale lists. The Core half was fixed properly with generated exact-name lookup; the second-tier half has sat "blocked" for two programmes on an artifact this repository never specified. The finding's own required correction was to generate resolver metadata **from a versioned manifest** — publishing that schema is this repository's obligation, and it is what converts an open-ended wait into a contract. The synthetic fixture matters just as much: it makes the path testable here, today, with nothing installed.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `grep -rn 'ownershipManifest\|OwnershipManifestSchema' packages/contracts/src | head -3` → the schema is published from contracts.
  - `yarn test packages/core/src/resolver packages/nuxt; echo "exit $?"` → 0, and the suite covers Core, second-tier-via-fixture, prefix collision, unknown symbol and second-tier-absent.
  - `yarn test:nuxt-fixtures > /tmp/nf.log 2>&1; echo "exit $?"` → the `core-pro` fixture either runs or **skips with a named reason**, never silently.
  - `npx tsx packages/tooling/src/validators/ownership.ts; echo "exit $?"` → 0, and it states second-tier-manifest presence or absence explicitly.
</done_check>

<discovery>
  1. Read `../program-2026-09-04/reports/TASK-R3-O1-handoff.md` — it records exactly where the consumption path stopped and why. Do not re-derive it.
  2. Read `packages/core/src/resolver.ts` and `packages/nuxt/src/module.ts` at HEAD; confirm the Core path is exact-name generated lookup (it is, since P1-02) and find the precise seam where a second tier plugs in.
  3. Read this repository's own `component-ownership.manifest.json` schema (1.1.0). The second-tier schema should be the same shape wherever it can be, so one reader serves both; justify any divergence per field.
  4. Constrain the schema to what a component library can actually generate about itself — component name, package, subpath, kind, family, tier, since, deprecated. Do **not** specify a field that would require knowledge only a specific downstream package has; a schema that cannot be satisfied is the same failure as no schema.
</discovery>

<requirements>
  <no_second_tier_import>Core imports no second-tier runtime source, ever. A manifest is read as data at build time; its absence is a diagnostic, never a crash and never a silent Core fallback.</no_second_tier_import>
  <self_contained>Every deliverable is testable inside this repository using the synthetic fixture. No step requires an artifact this repository does not produce, and no step inspects another checkout.</self_contained>
  <fail_closed>An unknown `Dz*` name resolves to `undefined` in both tiers. A name present in both manifests is a collision diagnostic naming both packages, not a silent precedence rule.</fail_closed>
  <synthetic_fixture>The fixture manifest is unmistakably synthetic (a `fixture: true` field and obviously fake component names) and lives under test fixtures, never under `manifests/`.</synthetic_fixture>
  <skip_loudly>A fixture that cannot run prints one line naming what is missing and what would unblock it. "Skipped" with no reason is the state this task exists to end.</skip_loudly>
  <example>
    Diagnostic shape:
    `[@dzup-ui/nuxt] includePro is enabled but no conforming ownership manifest was resolvable from "@dzup-ui-pro/pro". Those components will not auto-import. Install a version that ships manifests/component-ownership.manifest.json at schema >= 1.1.0, or set includePro: false.`
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; publish the versioned schema in `@dzup-ui/contracts` with a field-by-field rationale.
  2. Implement resolver + Nuxt consumption behind the schema, with the absent-manifest diagnostic.
  3. Add the synthetic fixture manifest and the five-case unit suite.
  4. Make the `core-pro` tarball fixture skip loudly or run; wire the skip reason into the fixture report.
  5. Extend `validate:ownership` to report manifest presence, schema version and absence explicitly.
  6. Hand off, recording the published schema path and version in this repository's handoff and in the package's own documentation — that is how a downstream consumer discovers it.
</steps>

<validation>
  yarn test packages/core/src/resolver packages/nuxt; echo "exit $?"
  yarn test:nuxt-fixtures > /tmp/s3o1-nuxt.log 2>&1; echo "exit $?"
  npx tsx packages/tooling/src/validators/ownership.ts; echo "exit $?"
  yarn typecheck; echo "exit $?"
  yarn validate:all > /tmp/s3o1-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Versioned ownership-manifest schema published from `@dzup-ui/contracts`, constrained to what a component library can generate about itself; resolver and Nuxt consume a conforming manifest by exact name with unknown → `undefined`; absent-manifest diagnostic is actionable and tested; synthetic fixture drives a five-case suite with nothing installed; `core-pro` fixture runs or skips with a named reason; `validate:ownership` states presence/absence explicitly; zero second-tier runtime imports in Core; every deliverable verified inside this repository.</success_criteria>

<stop_conditions>Stop and report when the schema would need a field only a specific downstream package could know (redesign it or mark it optional with the reason); when an installed manifest's schema version is unknown to contracts (fail closed with the version named — never best-effort parse); when honouring a collision would require choosing a precedence rule (that is an owner decision).</stop_conditions>
```

---

## 🟢 Finish the form-control primitive layer

### [ ] TASK-S3-O2 — Form-control primitives: `DzGrid` spans, `DzStack` gaps, async-options stories 🟢 `[!owner]`

_Gap: the Form System spec's doc 04 §4 names the sixteen built-in control
renderers and the core components each one composes, and its doc 03 §3 defines
the layout node vocabulary (`Stack` with semantic gaps, `Grid` with `columns`
of 1|2|3|4|6|12 and integer `colSpan`/`rowSpan`). The OSS readiness gate is
green, but four residuals remain in this repository and were routed here by the
2026-09-04 R3-O3 packet, whose engineering landed while its decisions did not:
**`DzGrid` has no span API**, so any schema-driven grid layout must reach for a
raw class — which is precisely what the spec forbids a document to carry, so
the absence of the API relocates the violation into the component boundary
rather than removing it; **`DzStack` has no gap vocabulary** matching the spec's
`none|xs|sm|md|lg`; the **async-options stories** for the seven seam controls
were never authored, so the one behaviour a schema-driven form depends on most
(cascading option loads) has no story evidence; and the **`DzMention` seam** is
unresolved. Two owner decisions ride along: the `utility` ownership kind (part
of the 29 unclassified) and the `time` format profile. Sources: Form spec doc 03
§3 ("Grid spans are semantic integers… documents must not contain CSS grid
syntax, Tailwind class names, colours, spacing values or token names") and
doc 04 §4; `../program-2026-09-04/reports/TASK-R3-O3-handoff.md`,
`TASK-R3-O3-decisions.md`._

```xml
<role>You are a component API engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5, including its &lt;repository_boundary&gt;. You add the smallest API that removes a consumer's need to reach around the styling contract, and you change no visual default.</role>

<task>Close the four OSS-side form residuals. (1) Add a semantic span API to `DzGrid` — `columns` restricted to the spec's set and integer `colSpan`/`rowSpan` on the item, mapped to tokens internally — so no consumer needs a raw class to place a field; ship it additively, with the existing API unchanged, plus anatomy, variants, contract spec and a story. (2) Add the `DzStack` gap vocabulary (`none|xs|sm|md|lg`) mapped to spacing tokens, same discipline. (3) Author the async-options stories for the seven seam controls: loading, empty result, error with retry, dependency-change clearing, stale-response discard, and the accessible announcement of each — these are stories, not new behaviour, and they must use the existing seam. (4) Resolve `DzMention`: either declare it out of the form-control contract with a reason in the readiness gate, or give it the seam the other seven have. (5) Prepare the two owner decisions as a one-page sheet: the `utility` ownership kind (what it would reclassify, of the 29 unclassified) and the `time` format profile (which `Intl` options, which codec, what a form document round-trips).</task>

<motivation>The Form spec forbids persisted CSS and class names for a reason the 08-11 reassessment restates as a product principle: one form document must render correctly across apps and themes. When a consumer has to reach for a raw class because the primitive has no span API, the violation does not disappear — it moves outside the reach of the gate written to catch it. Adding twelve lines of semantic API to `DzGrid` removes the temptation permanently, and it is a better primitive regardless of who composes it. The async-options stories matter for the same structural reason: cascading loads are where schema-driven forms actually fail, and no story currently shows one.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `grep -n 'colSpan\|rowSpan' packages/core/src/components/layout/DzGrid.types.ts` → the span API exists.
  - `grep -n "'none' | 'xs' | 'sm' | 'md' | 'lg'" packages/core/src/components/layout/DzStack.types.ts` → the gap vocabulary exists.
  - `ls packages/core/stories/forms/ | grep -i async | wc -l` → ≥ 1 story file covering async options; open it and confirm it covers all six states.
  - `npx tsx packages/tooling/src/validators/form-readiness.ts; echo "exit $?"` → 0, and its report shows `DzMention` with an explicit disposition rather than a blank.
</done_check>

<discovery>
  1. Read `TASK-R3-O3-handoff.md` and `TASK-R3-O3-decisions.md` — the analysis is done and the decisions are framed; you are implementing the engineering half and re-presenting the two open decisions with current numbers.
  2. Read `DzGrid.vue` / `.types.ts` / `.variants.ts` and the spacing token scale. The span API must map onto tokens that already exist; if a needed step is missing from the scale, that is a token decision, not a silent addition.
  3. Read the async-options seam as implemented on the seven controls (FORM-OSS-03) and pick the one with the richest states as the story template.
  4. Read the readiness gate's report format so `DzMention`'s disposition lands in the gate output, not only in prose.
</discovery>

<requirements>
  <additive>Every API addition is additive under the 0.x policy, with defaults that leave current rendering byte-identical. Prove it: the visual lane must not move.</additive>
  <token_only>Spans and gaps map to `--dz-*` tokens. No raw values, no arbitrary class pass-through, no new scoped style.</token_only>
  <stories_not_behaviour>The async-options stories exercise the existing seam. If a story cannot be written without new behaviour, that is a finding — file it, do not extend the seam here.</stories_not_behaviour>
  <disposition>`DzMention` ends with a recorded disposition either way. A blank cell in the readiness gate is the state this task removes.</disposition>
  <example>
    Grid usage after the change (no raw classes anywhere):
    &lt;DzGrid :columns="12" gap="md"&gt;
      &lt;DzGridItem :col-span="8"&gt;…&lt;/DzGridItem&gt;
      &lt;DzGridItem :col-span="4"&gt;…&lt;/DzGridItem&gt;
    &lt;/DzGrid&gt;
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; confirm the token scale supports the spec's column set and gap vocabulary.
  2. Implement the `DzGrid` span API with anatomy, variants, types, contract spec and story.
  3. Implement the `DzStack` gap vocabulary the same way.
  4. Author the async-options stories over the existing seam; run the story tests.
  5. Record `DzMention`'s disposition in the readiness gate.
  6. Write the two-decision sheet; hand off with the readiness-gate numbers before and after.
</steps>

<validation>
  yarn test packages/core/src/components/layout; echo "exit $?"
  yarn storybook:test > /tmp/s3o2-sb.log 2>&1; echo "exit $?"
  npx tsx packages/tooling/src/validators/form-readiness.ts; echo "exit $?"
  npx tsx packages/tooling/src/validators/anatomy-parts.ts; echo "exit $?"
  yarn test:e2e:visual > /tmp/s3o2-visual.log 2>&1; echo "exit $?"    # must not move
  yarn validate:all > /tmp/s3o2-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>`DzGrid` span API and `DzStack` gap vocabulary shipped additively, token-mapped, with anatomy + contract spec + story each; visual baselines unchanged; async-options stories cover all six states across the seam controls; `DzMention` disposition recorded in the readiness gate output; the two-decision sheet delivered with current numbers; form-readiness gate green.</success_criteria>

<stop_conditions>Stop and report when the token scale lacks a step the spec's vocabulary needs (raise it as a token decision); when an async-options story cannot be written without new seam behaviour; when the visual lane moves (that means the addition was not default-identical — revert and re-approach).</stop_conditions>
```

---

### [ ] TASK-S3-O3 — Security-corpus conformance runner in `@dzup-ui/testing` 🟢

_Gap: 08-11 finding M4 — "rich-content security is strong locally but lacks a
system contract" — was the most severe item the reassessment left fully open,
and this repository has since shipped two of the three pieces: the sanitizer
provider seam (`DZ_SANITIZER_KEY`, adapter/limits/error contracts in
`@dzup-ui/contracts`, `useDzSanitizer`) in R3-O2, and the shared corpus
**format** in R3-O4. The third piece is missing: a **runnable conformance
suite**. A format is a description; any implementation of `DzSanitizerAdapter`
— this repository's own, or any adapter a consumer supplies through the
provider seam — can claim to honour it, and nothing checks. Doc 06's security
contract is explicit that a central adapter exists so "DOMPurify configuration,
SVG profiles, hooks and Trusted Types policy names do not drift"; a published
adapter interface with no executable conformance check is exactly the drift it
was written to prevent. The Form spec's doc 06 §10 and the Graph spec's §15 add
fixture classes this repository's corpus does not yet carry, for the untrusted
text and URL paths those documents produce. Sources: 08-11 doc 01 M4 and doc 06
§"HTML and DOM sinks"; 08-28 doc 05 §C gap 9;
`../program-2026-09-04/reports/TASK-R3-O2-handoff.md`,
`TASK-R3-O4-handoff.md`, `TASK-R3-O4-corpus-compatibility.md`._

```xml
<role>You are a security-evidence engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5, including its &lt;repository_boundary&gt;. You ship an executable conformance contract from this repository's published packages; whether any consumer runs it is that consumer's business.</role>

<task>Turn the shared corpus format into an executable conformance suite, published from this repository. (1) Publish a **conformance runner** in `@dzup-ui/testing` that takes any `DzSanitizerAdapter` implementation plus the versioned corpus and asserts, per fixture, the expected verdict class (blocked / sanitized-to / passed-through), plus the fail-closed rule when the adapter throws or is absent. (2) Run it against this repository's own adapter and record the result as the **reference**, stamped with the commit. (3) Extend the corpus with the classes the two document specs demand and it lacks: Form doc 06 §10 (option labels, operation messages and file names as untrusted text; renderer options never spread onto a DOM element) and Graph §15 (`v-html` never on labels; document-provided URLs never fetched). (4) Add a `validate:security-conformance` gate that fails when this repository's adapter drifts from the recorded reference, proved by a seeded verdict change. (5) Document the runner's usage in the `@dzup-ui/testing` README so adopting it is `import`, `run`, `report` — with the corpus version pinned, so a divergence surfaces as a version bump rather than a silent difference.</task>

<motivation>M4's danger was never that sanitization was absent — this repository fails closed today. It was that ad-hoc call sites drift apart, and nobody knows until one of them is the one an attacker found. Publishing an adapter interface without an executable conformance check recreates that risk at the contract level: anything can implement the interface, and correctness is asserted rather than measured. A runner shipped from `@dzup-ui/testing` makes conformance a single command for this repository's adapter and for any adapter a consumer plugs into the provider seam — which is the only form in which agreement stays true over time.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `grep -rn 'conformance' packages/testing/src | head -3` → the runner is exported from `@dzup-ui/testing`.
  - `node -e "console.log(require('./packages/core/security/corpus.json').version || 'no version')"` (or the corpus's actual path) → the corpus carries a version.
  - `yarn test packages/core/security packages/testing; echo "exit $?"` → 0, with a per-fixture verdict count printed.
  - `npx tsx packages/tooling/src/validators/security-conformance.ts; echo "exit $?"` → 0, and a seeded verdict change makes it exit non-zero.
</done_check>

<discovery>
  1. Read `TASK-R3-O2-handoff.md` (the seam), `TASK-R3-O4-handoff.md` and `TASK-R3-O4-corpus-compatibility.md` (the format and the compatibility analysis). The format exists; the runner does not.
  2. Read the `DzSanitizerAdapter` contract in `@dzup-ui/contracts` and design the verdict vocabulary against **the interface**, not against any one implementation — an adapter this repository has never seen must be able to report every verdict the runner asserts, or the runner is an implementation test wearing a contract's name.
  3. Read Form spec doc 06 §10 and Graph spec §15 and list the fixture classes they require that the corpus lacks — that list is the extension scope, and it should be short.
  4. Confirm the fail-closed path: what happens today when the sanitizer adapter is absent from the provider chain, and when it throws. If either path renders unsanitized content, that is a defect and it outranks the rest of this task.
</discovery>

<requirements>
  <runner_shape>The runner takes (adapter, corpus) and returns per-fixture verdicts. It asserts classes, not exact output strings — sanitizer versions legitimately differ in whitespace and attribute order, and an exact-string assertion would make the suite unusable within a month.</runner_shape>
  <fail_closed>Absent adapter and throwing adapter are both fixtures, and both must block. This is the highest-value assertion in the suite.</fail_closed>
  <versioned_corpus>The corpus carries a semantic version. A fixture addition is a minor; a verdict change is a major, so any consumer's recorded conformance result becomes visibly out of date rather than silently wrong.</versioned_corpus>
  <contract_not_implementation>The runner is published from `@dzup-ui/testing` against the `DzSanitizerAdapter` interface and is verified here against this repository's own adapter. It is not this task's business whether any downstream package adopts it.</contract_not_implementation>
  <example>
    Runner result shape:
    { "corpusVersion": "1.1.0", "adapter": "@dzup-ui/core:dompurify", "sourceCommit": "589be13",
      "fixtures": 41, "blocked": 33, "sanitized": 6, "passed": 2, "unexpected": 0,
      "failClosed": { "absentAdapter": "blocked", "throwingAdapter": "blocked" } }
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; confirm the fail-closed paths before anything else, and file a defect immediately if either fails open.
  2. Implement the conformance runner in `@dzup-ui/testing` with the verdict-class model and the two fail-closed fixtures.
  3. Extend the corpus for the Form §10 and Graph §15 classes; bump the corpus version.
  4. Run against this repository's adapter; record the reference result stamped with the commit.
  5. Add `validate:security-conformance` with a seeded-drift spec; chain it.
  6. Document the runner's usage in the `@dzup-ui/testing` README; hand off with the fixture counts and the corpus version.
</steps>

<validation>
  yarn test packages/core/security packages/testing; echo "exit $?"
  npx tsx packages/tooling/src/validators/security-conformance.ts; echo "exit $?"
  yarn test:e2e e2e/csp > /tmp/s3o3-csp.log 2>&1; echo "exit $?"
  yarn validate:all > /tmp/s3o3-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Conformance runner exported from `@dzup-ui/testing`, taking any `DzSanitizerAdapter` plus the versioned corpus and asserting verdict classes; absent-adapter and throwing-adapter fixtures both block; corpus extended for the Form §10 and Graph §15 classes with a version bump; this repository's reference result recorded and stamped with the commit; `validate:security-conformance` chained and proved by seeded drift; usage documented in the package README.</success_criteria>

<stop_conditions>Stop everything and report immediately when a fail-closed path fails open — that is a shipping security defect and outranks the task. Stop and report when the verdict vocabulary cannot be expressed against the published adapter interface without implementation-specific knowledge (redesign the vocabulary); when a corpus extension would require a fixture the repository should not hold (describe it instead of committing it).</stop_conditions>
```

---

## 🟠 Spec conformance residue

### [ ] TASK-S5-O1 — i18n completeness: the second locale, the contribution path, the Arabic typeface 🟠 `[!owner]`

_Gap: 08-11 doc 06 §"Internationalization contract" requires BCP 47 resolution,
a typed catalog with predictable fallback, escaped and type-checked
interpolation, a documented plural/select formatter, cached `Intl` instances,
and explicit instant-versus-plain date semantics. The mechanism is built and
good: `packages/core/src/i18n/` has the catalog, the `Intl` cache, the message
format, direction handling, pseudo-locale and count-bearing specs. What is
missing is the product: `locales/` holds **`en.json` and a `de.json` scaffold
awaiting a translator**, there is no contribution path for a third locale, and
AR-2 found **zero Arabic typefaces vendored** — which means, as the 08-28
analysis put it, no licence obligation and no Arabic typeface, while
`validate:rtl` passes and no landing route renders RTL. The 2026-09-04 R5-O4
packet did the engineering and stopped on two owner inputs it cannot supply:
a named translator and a typeface procurement decision. Sources: 08-11 doc 06
§"Internationalization contract"; 08-28 doc 02 (i18n `implemented-gap`: "one
locale ships"), doc 05 §C gap 6, doc 01 §D10;
`../program-2026-09-04/reports/TASK-R5-O4-handoff.md`, `TASK-R5-O4-typeface-decision.md`._

```xml
<role>You are an internationalization engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You make a second locale mechanically provable and a third locale cheap to contribute; you do not invent translations.</role>

<task>Make the locale layer a product rather than a mechanism. (1) Build the **locale-completeness gate**: every locale file is checked against `en.json` for missing keys, extra keys, placeholder arity mismatches and untranslated-identical values, with a per-locale completeness percentage reported — and `de` reported honestly as a scaffold until a translator fills it. (2) Write the **contribution path**: a documented procedure for adding a locale (which file, which gate, what review, what a plural rule needs, how a contributor tests with the pseudo-locale) plus the `yarn i18n:new <tag>` scaffold command. (3) Prove the plural/select formatter against a locale with non-trivial plural rules — add the test cases for a Slavic or Arabic plural category set even before a translation exists, since the formatter must be right independent of content. (4) Verify the RTL path end to end on a real route: pick one docs or landing route, render it RTL, and record what breaks — AR-2's "no landing route renders RTL" must end with either a route that does or a recorded reason. (5) Prepare the two owner decisions: the named translator for `de` (with the exact key count and an effort estimate), and the Arabic typeface (licence class, vendoring versus system-font stack, the obligations each incurs).</task>

<motivation>08-28 marks i18n `implemented-gap` for one reason: the mechanism is complete and one locale ships, so every claim about internationalization is currently untested by a second data point. A completeness gate plus a contribution path converts the problem from "we must translate everything" into "a contributor can add a locale in an afternoon and the gate tells them when it is done" — and the plural-rule tests must be right before any translator's time is spent, not after.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `ls packages/core/src/i18n/locales/` → the locale set; `de.json` present.
  - `npx tsx packages/tooling/src/validators/i18n-completeness.ts; echo "exit $?"` → the gate exists, runs, and prints a per-locale completeness percentage.
  - `node -e "console.log(Object.keys(require('./package.json').scripts).filter(k=>k.startsWith('i18n')).join(','))"` → an `i18n:new` scaffold lane exists.
  - `grep -rn 'plural' packages/core/src/i18n/*.spec.ts | head -3` → plural-category tests exist for a non-English rule set.
</done_check>

<discovery>
  1. Read `TASK-R5-O4-handoff.md` and `TASK-R5-O4-typeface-decision.md`; the engineering and the typeface options are done. Re-measure the key count in `en.json` and the fill state of `de.json` — those two numbers drive the translator estimate.
  2. Read `message-format.ts` and `count-bearing.spec.ts` to see which plural categories the formatter already handles; the gap is usually `few`/`many`, which English never exercises.
  3. Read `validate:rtl` and `rtl-matrix.md`, then check the docs and landing routes for one that could render RTL today. AR-2's finding is about routes, not about components.
  4. Check the pseudo-locale toolbar: a contributor's first test should be the pseudo-locale, and the contribution path should say so.
</discovery>

<requirements>
  <no_invented_translations>You never write a translation. An untranslated value stays identical to English and the gate reports it as untranslated — silently shipping English under a `de` key is worse than an obvious gap.</no_invented_translations>
  <arity>Placeholder arity and names are checked, not just key presence. A translated string that drops an interpolation is a failure, not a warning.</arity>
  <formatter_first>Plural/select correctness is proved with test cases for categories English lacks, before any translator is engaged.</formatter_first>
  <rtl_route>One route renders RTL end to end, or the reason is recorded with what it would take. "Components support RTL" is not the claim AR-2 tested.</rtl_route>
  <example>
    Gate output shape:
    | Locale | Keys | Translated | Identical-to-en | Missing | Arity errors | Completeness |
    |---|---:|---:|---:|---:|---:|---:|
    | en | 312 | — | — | 0 | 0 | source |
    | de | 312 | 0 | 312 | 0 | 0 | 0 % (scaffold — awaiting translator, decision D&lt;n&gt;) |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; re-measure key counts and the `de` fill state.
  2. Implement the completeness gate with arity and identical-value checks; chain it; report per-locale percentages.
  3. Add plural-category tests for a non-English rule set; fix the formatter if they fail.
  4. Write the contribution path and the `i18n:new` scaffold.
  5. Render one route RTL; record what breaks or what it would take.
  6. Write the two decision sheets (translator, typeface); hand off with the completeness table.
</steps>

<validation>
  npx tsx packages/tooling/src/validators/i18n-completeness.ts; echo "exit $?"
  yarn test packages/core/src/i18n; echo "exit $?"
  npx tsx packages/tooling/src/validators/rtl.ts; echo "exit $?"
  npx tsx packages/tooling/src/validators/hardcoded-strings.ts; echo "exit $?"
  yarn validate:all > /tmp/s5o1-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Completeness gate chained and reporting per-locale percentages including arity errors; `de` reported honestly at its real completeness; contribution path documented with a working `i18n:new` scaffold; plural-category tests present and passing for a non-English rule set; one route proved RTL or the blocker recorded; translator and typeface decision sheets delivered with counts and effort.</success_criteria>

<stop_conditions>Stop and report when the formatter fails a non-English plural category (fix it — that is in scope and it is the reason this runs before translation); when no route can render RTL without a layout change (record the change as a proposed task); when the typeface decision would require a purchase.</stop_conditions>
```

---

### [ ] TASK-S5-O2 — Toolchain migration execution 🟢 `[!owner windows`]

_Gap: 08-28 doc 01 §A6 and doc 06 N5-T1 list four toolchain moves as hygiene
with dated rationale: a **Vue 3.6-RC CI lane** ("now — cheap, high signal";
alien-signals reactivity plus Vapor interop is the change class that breaks
vDOM libraries), the **Nuxt module retargeted to `@nuxt/kit` v4** (Nuxt 3
reached EOL 2026-07-31, which makes the `>=3.0.0` floor debate moot), the
**Vitest 4 browser-mode migration** (Browser Mode stabilised in Vitest 4 and is
the recommended component-testing path, with jsdom retained for logic only),
and **tsdown / Vite 8** for library builds (Vite 8 made Rolldown the only
bundler). The 2026-09-04 R5-O9 packet ran three phases of preparation and
delivered a toolchain memo; the cutovers themselves are owner-scheduled because
each one changes how every other lane in the repository runs. Sources: 08-28
doc 01 §A6, doc 04 §6 ("Vue ecosystem pulse"), doc 06 N5-T1;
`../program-2026-09-04/reports/TASK-R5-O9-handoff.md`, Pro
`TASK-R5-P5-toolchain-memo.md`._

```xml
<role>You are a build-toolchain engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You cut over one tool at a time behind a proof, and you keep the old path runnable until the new one is green.</role>

<task>Execute the four toolchain moves as four independently revertible slices, each landing with its own evidence. (1) **Vue 3.6 lane**: pin the current RC in a resolution-overridden temp workspace, run the reactivity-sensitive subset, triage every failure as a library defect or an upstream change, and publish the Vapor-interop compatibility statement the 08-28 analysis asks for (a statement, not a Vapor build). (2) **Nuxt 4**: retarget `@dzup-ui/nuxt` to `@nuxt/kit` v4, run the tarball fixtures against a Nuxt 4 consumer, and state the supported Nuxt range in the package README and the generated README facts. (3) **Vitest 4 browser mode**: migrate one representative family's component tests first, measure runtime and flake against the jsdom equivalent, and only then propose the boundary (which suites move, which stay jsdom). (4) **tsdown / Vite 8**: build one package with the new toolchain, diff the emitted files and declarations against the current output byte-for-byte where possible, and report the delta. Each slice ends with a go/no-go and a revert command; none of them lands as a big-bang.</task>

<motivation>The 08-28 research is unusually specific about why this is not busywork: Nuxt 3 is EOL, so the module's declared floor is fiction; Vue 3.6's reactivity rewrite is the historical shape of the bug that breaks component libraries silently; and Vitest 4 browser mode is the difference between testing components in a DOM approximation and testing them in a browser. Doing them as four proofs rather than one migration means a failure costs one slice, and each slice's evidence is what makes the owner's scheduling decision cheap.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S5-O2-slice-*.md` → one evidence document per landed slice.
  - `node -e "const p=require('./packages/nuxt/package.json');console.log(JSON.stringify(p.dependencies),JSON.stringify(p.peerDependencies))"` → shows whether the `@nuxt/kit` retarget landed and what Nuxt range is declared.
  - `grep -rn 'browser' vitest.config.* packages/*/vitest.config.* 2>/dev/null | head -3` → shows whether a browser-mode project exists.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S5-O2-vapor-statement.md` → the Vapor-interop compatibility statement exists.
</done_check>

<discovery>
  1. Read `TASK-R5-O9-handoff.md` and the Pro toolchain memo. Three phases of preparation are done; identify precisely which slice each phase prepared and what it left.
  2. Re-verify the upstream facts before acting on any of them — RC versions move. Check the current Vue 3.6 release state, the current `@nuxt/kit` major, the Vitest major, and whether Vite 8 / tsdown recommendations still hold. A 2026-08 fact is not a 2026-09 fact.
  3. For the Vitest slice, pick the family with the most interaction-sensitive tests (overlays or forms), not the easiest one — the migration's value is exactly in the tests jsdom approximates badly.
  4. For the tsdown slice, pick the package with the simplest surface (`contracts` or `tokens`) so the output diff is readable.
</discovery>

<requirements>
  <one_at_a_time>Four slices, four evidence documents, four go/no-go recommendations. A slice that lands must leave the previous path runnable by one documented command until its successor has been green for a full validation cycle.</one_at_a_time>
  <no_silent_repin>If an upstream pin has moved since the memo, report the drift and propose the new pin explicitly. Never silently repin and then report a result measured against a different version than the memo names.</no_silent_repin>
  <statement_not_build>The Vapor work is a verified compatibility *statement* under `vaporInteropPlugin` — dzup-ui stays a vDOM library. Do not start a Vapor build.</statement_not_build>
  <measured_boundary>The Vitest browser-mode boundary is proposed from measured runtime and flake on a real family, not from principle.</measured_boundary>
  <example>
    Slice evidence shape:
    | Slice | Upstream pin | Command | Result | Duration | Delta | Go/no-go | Revert |
    |---|---|---|---|---|---|---|---|
    | Vue 3.6 | vue@3.6.0-rc.x (re-verified 2026-09-22) | `yarn test --project unit` in temp ws | 3 failures | 2m40s | all 3 in useTabs arrow-key path | go, reporting-only lane | drop the resolution override |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; re-verify all four upstream pins and report any drift from the memo.
  2. Run the Vue 3.6 slice; triage failures; write the Vapor statement.
  3. Run the Nuxt 4 slice; retarget, re-run tarball fixtures, update the declared range through the generated README facts.
  4. Run the Vitest browser-mode slice on one family; measure; propose the boundary.
  5. Run the tsdown/Vite 8 slice on one package; diff the output; report.
  6. Hand off with four go/no-go recommendations and the scheduling windows each would need.
</steps>

<validation>
  yarn test > /tmp/s5o2-baseline.log 2>&1; echo "exit $?"        # baseline before each slice
  yarn test:nuxt-fixtures > /tmp/s5o2-nuxt.log 2>&1; echo "exit $?"
  yarn build > /tmp/s5o2-build.log 2>&1; echo "exit $?"
  yarn validate:all > /tmp/s5o2-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Four slice-evidence documents with re-verified upstream pins, measured results, deltas, go/no-go recommendations and revert commands; the Vapor-interop compatibility statement published; the Nuxt supported range stated through the generated README facts; the Vitest browser-mode boundary proposed from measurement on a real family; the tsdown output diff reported; nothing landed big-bang and every previous path still runnable.</success_criteria>

<stop_conditions>Stop and report when an upstream pin no longer resolves (report the drift, propose the new pin); when a slice would require changing component source to pass (that is a library defect — file it and mark the slice no-go pending the fix); when a cutover would make another lane unrunnable before its replacement is green.</stop_conditions>
```
