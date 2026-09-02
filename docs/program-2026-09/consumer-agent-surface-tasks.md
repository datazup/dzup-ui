# dzup-ui — Consumer & agent surface tasks (roadmap N2)

> Part of the [System Program 2026-09](./README.md). Every prompt assumes the
> `<repo_conventions>` block in [README.md §3](./README.md#3-how-these-tasks-are-written).
>
> **Sources:** reassessment `01-plan-challenge.md` §A5 (the three strategic
> blind spots), `04-competitive-benchmark.md` §1/§3/§4, roadmap §N2. These
> tasks run **in parallel with N1** — they build the consumer-facing and
> agent-facing surface on top of artifacts that already exist. The exit test
> for the whole lane (roadmap): *an agent (or human) can discover, install,
> style, and verify a component from published machine-readable surfaces
> alone.*
>
> **Ordering:** N2-A2 (metadata pipeline) is the load-bearing middle — MCP
> tools (A1 hardening), llms.txt (A3), and docs prop tables (D1) all consume
> it. T1 (DTCG) and S1 (styling rollout) are independent. D2/D3 need D1.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## Tokens

### [x] TASK-N2-T1 — DTCG 2025.10 token export with round-trip gate 🔴

_Gap: named P3-00 by ADR-19's stop condition, never scheduled. The DTCG spec
reached first stable (2025.10); Style Dictionary v5 defaults to it; **no major
Vue library verifiably ships a first-party export** — an open first-mover
window that closes when a competitor ships._

```xml
<role>You are a design-token engineer in ui/dzup-ui working in packages/tokens. Follow <repo_conventions> in docs/program-2026-09/README.md §3.</role>

<task>Emit a DTCG 2025.10-format token export generated from the existing TypeScript token maps (primitives → semantic → component tiers), add a round-trip validation gate proving the export and the shipped CSS variables agree, and document the contract: `--dz-*` custom properties are the stable runtime ABI, DTCG JSON is the interchange format.</task>

<motivation>Tokens Studio, Style Dictionary v5, Terrazzo, and Figma-adjacent tooling all speak DTCG now. Consumers who design in those tools currently re-type dzup-ui tokens by hand. The TS token maps are already tiered and typed — the export is a projection, not a redesign. Shipping first among Vue libraries is a durable positioning claim (04 §7 marks it ⭐ if shipped).</motivation>

<discovery>
  1. Read packages/tokens/src/ — the primitive/semantic/component map shapes, the existing tokens.css/.d.ts/tailwind-theme generators, and theme-recipe.ts (themes must be expressible in the export or explicitly out of scope v1 — decide and document).
  2. Read the DTCG 2025.10 Format module spec (design-tokens.github.io): $type/$value/$description, group nesting, aliases ({token.path} references), and the Color module's color space handling. Record which dzup-ui token kinds map to which DTCG $type (color, dimension, fontWeight, shadow, duration, cubicBezier) and which have no DTCG type (document those as $extensions under a `com.dzup` namespace, never as fake types).
  3. Evaluate: generate directly from the TS maps (own emitter) vs adopting Style Dictionary v5/Terrazzo as a build dependency. Prefer the smallest tool that produces spec-valid output; write the choice + reason in the handoff.
</discovery>

<requirements>
  <emit>New generator (root script `generate:tokens:dtcg`) writing packages/tokens/dist (and a committed copy if other generated artifacts are committed — follow the repo's existing convention). Tier structure preserved as DTCG groups; semantic→primitive references emitted as DTCG aliases, not resolved values; deterministic, timestamp-free output.</emit>
  <round_trip>New validator `validate:tokens:dtcg`: parse the emitted file with an independent DTCG parser (or a minimal spec-conformant reader), resolve every alias, and assert each resolved value equals the value in the shipped tokens.css for the same token. Any token present in one side and absent in the other is a failure with a named symbol.</round_trip>
  <docs>A short TOKENS.md (or section in the tokens package README, following where such docs live) stating: --dz-* is the runtime ABI and semver-governed; DTCG is interchange; how to consume the export in Style Dictionary v5 and Tokens Studio (untested claims marked as such).</docs>
  <non_goals>No Figma/Tokens Studio sync automation (follow-on, [!owner]); no renaming of any existing token to fit DTCG conventions; no second runtime token system.</non_goals>
</requirements>

<steps>
  1. Complete <discovery>; freeze the $type mapping table in the handoff before writing the emitter.
  2. Implement emitter + validator; wire scripts; append validate:tokens:dtcg to validate:all.
  3. Run the emitter twice, diff for determinism; validate the output against a third-party DTCG validator if one is installable, else document the self-check scope honestly.
  4. Write the docs; full validation ladder.
</steps>

<validation>
  yarn generate:tokens:dtcg && yarn generate:tokens:dtcg   # byte-identical
  yarn validate:tokens:dtcg
  yarn validate:tokens && yarn typecheck && yarn lint && yarn test packages/tokens
</validation>

<success_criteria>Spec-valid DTCG 2025.10 output covering every public token (or a documented exclusion list with reasons); aliases preserved; round-trip gate green and failing correctly under a seeded mismatch; ABI statement published; zero changes to existing token names or CSS output.</success_criteria>

<stop_conditions>Stop and report when a token kind cannot be expressed in DTCG without semantic loss and $extensions won't carry it; when theme-recipe axes cannot be represented and the v1 scope decision needs an owner; when adopting a build tool would add a runtime dependency to @dzup-ui/tokens.</stop_conditions>
```

---

## Agent surface

### [x] TASK-N2-A1 — Govern `@dzup-ui/mcp` as a public surface 🟠

_Gap: A5-1. `@dzup-ui/mcp` v0.2.0 is a published-shape, AI-facing package with
4 source files, **1 test**, no contract spec, no ownership-manifest entry, no
capability-matrix row, and zero mentions in any task file — a public surface
shipping outside every governance mechanism the program built._

```xml
<role>You are a design-system tooling engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09/README.md §3 — the bar is: the MCP package is governed exactly like any public component.</role>

<task>Bring @dzup-ui/mcp under the standard governance: write its contract spec (tools, inputs, outputs, error shapes), add it to the ownership manifest and the capability matrix, and build a real test suite covering every exposed MCP tool including malformed-input behavior.</task>

<motivation>Agents consuming this package get whatever the 4 files happen to do — ungoverned drift in an AI-facing surface propagates into generated consumer code. The reassessment's rule is symmetrical: if it is published, it is governed; if it is not worth governing, it is not worth publishing (that too would be a finding — report it rather than assuming).</motivation>

<discovery>
  1. Read packages/mcp entirely (it is small): which tools exist, what data they read (manifests? hardcoded?), what the one test covers.
  2. Check how the package is built/exported and whether its declared exports match reality (the same class of defect P1 found in nuxt/tokens).
  3. Read one component contract spec + the ownership-manifest kinds to decide how a non-component public surface is classified (likely needs a manifest `kind` discussion — if schema 1.1.0 cannot express it, record that for the schema-1.2.0 owner decision rather than inventing a kind).
</discovery>

<requirements>
  <contract>A spec file per exposed tool asserting: input schema validation (rejects malformed), output shape stability, data-source binding (answers derive from generated manifests, never hardcoded lists — if the current implementation hardcodes, that is a defect to fix here), and error behavior for unknown components.</contract>
  <governance>Ownership-manifest entries for the package's public symbols; a capability-matrix row (or documented equivalent) so its evidence state is visible like every component's; version/README facts generated, not hand-typed, if the README states counts.</governance>
  <scope>Do NOT add new MCP tools in this task — tool-surface expansion is TASK-N2-A2's concern once the metadata pipeline exists. Governance of what ships today only.</scope>
</requirements>

<steps>
  1. Complete <discovery>; list every gap between "governed component bar" and current state.
  2. Fix data-source binding defects; write contract + unit specs per tool.
  3. Wire manifest + matrix entries; regenerate; confirm validators pass.
  4. Validation ladder; hand off with the tool inventory table (tool · input · output · data source · spec file).
</steps>

<validation>
  yarn test packages/mcp
  yarn validate:ownership && yarn validate:exports
  yarn typecheck && yarn lint
</validation>

<success_criteria>Every exposed tool has contract + behavior specs; the package appears in the ownership manifest and capability matrix; no tool answers from a handwritten list; package exports verified against reality; no new tools added.</success_criteria>

<stop_conditions>Stop and report when a tool's current behavior is wrong enough that fixing it breaks published consumers (version/deprecation is an owner decision); when manifest schema 1.1.0 cannot classify the package's symbols.</stop_conditions>
```

---

### [x] TASK-N2-A2 — One `vue-component-meta` metadata pipeline feeding MCP, docs, and llms.txt 🟠

_Gap: A5-1/A5-2. Nuxt UI's hosted MCP (search-components, get-component-metadata,
examples, templates) is the Vue benchmark; `vue-component-meta` is the accepted
extraction tool and is unused here. Docs prop tables (D1), MCP tool expansion,
and llms.txt (A3) must all come from **one** pipeline, or they will drift
apart._

```xml
<role>You are a design-system tooling engineer in ui/dzup-ui. Follow <repo_conventions>. One extraction pipeline, many renderers — never a second extractor per consumer.</role>

<task>Build a vue-component-meta-based extraction pipeline producing one machine-readable metadata artifact per public component (props with types/defaults/descriptions, slots, emits, exposed), merge it with what the program already generates (ownership, tiers, anatomy, capability state), and extend @dzup-ui/mcp's tools to answer from it at Nuxt-UI parity (search, metadata, usage example).</task>

<motivation>Every consumer surface — docs site prop tables, MCP answers, llms-full.txt, a future registry — needs the same facts about each component. vue-component-meta reads the actual .types.ts/.vue sources, so the pipeline inherits the "generated truth" property: it cannot drift from the code. Building it once, before D1 and A3 consume it, is the difference between one truth and three.</motivation>

<discovery>
  1. Spike vue-component-meta against 3 representative components (simple: DzButton; compound: DzCard family; generic-typed: a data component) and record fidelity: are descriptions picked up from JSDoc? do Base*Props inherited props resolve? are slot types usable? Known limitation classes go into the design.
  2. Read the existing generators (ownership, capability matrix) for the established output conventions (determinism, sorting, sourceCommit binding).
  3. Read packages/mcp post-TASK-N2-A1 for the tool surface to extend, and ui.nuxt.com/docs/getting-started/ai/mcp for the benchmark tool list (metadata/examples/migration guides — implement what the pipeline can back honestly; skip what it cannot).
</discovery>

<requirements>
  <artifact>One generated file (or per-component files under one index — follow the AT-matrix precedent for shape) with schemaVersion, sourceCommit, per-component: props/slots/emits/exposed from vue-component-meta, plus joined fields: family, tier, anatomy parts (where declared), capability summary, story ids. Deterministic and diffable.</artifact>
  <freshness>validate:component-meta fails when the artifact is stale relative to source — same pattern as the ownership validator.</freshness>
  <mcp_tools>Extend MCP: search_components (name/family/tier/keyword over the artifact), get_component_metadata (full record), get_component_example (derived from the component's stories — real story source, not synthesized code). Each tool contract-specced per TASK-N2-A1's bar.</mcp_tools>
  <performance>Extraction may be slow; it runs at generate-time, never at MCP-serve-time. The MCP package reads the artifact only.</performance>
</requirements>

<steps>
  1. Spike (discovery 1); write the fidelity report; design the artifact schema.
  2. Implement generator + freshness validator; run twice, diff.
  3. Extend MCP tools + specs.
  4. Validation ladder; hand off with per-component extraction-quality stats (how many props carry descriptions, unresolved types count) so docs work (D1) knows the raw-material quality.
</steps>

<validation>
  yarn generate:component-meta && yarn generate:component-meta   # byte-identical
  yarn validate:component-meta
  yarn test packages/mcp packages/tooling
  yarn typecheck && yarn lint
</validation>

<success_criteria>All 144 public components have metadata records; extraction limitations are quantified, not hidden; MCP answers search/metadata/example from the artifact; freshness gate red under a seeded source change; single extractor — no consumer parses .vue/.types.ts on its own.</success_criteria>

<stop_conditions>Stop and report when vue-component-meta cannot process a component class at all (record it as unclassifiable with the error, continue with the rest); when extraction fidelity is so poor for a field that publishing it would misinform (omit the field, report); when MCP parity would require inventing content the pipeline cannot verify.</stop_conditions>
```

---

### [x] TASK-N2-A3 — llms.txt freshness gate and per-page Markdown endpoints 🟢

_Gap: A5-1. `llms.txt`/`llms-full.txt` ship from two apps with **no freshness
gate** — the same drift class as the hand-typed README versions P2-02 fixed.
llms.txt is genuinely consumed by coding agents (not by search)._

```xml
<role>You are a tooling engineer in ui/dzup-ui. Follow <repo_conventions>. Depends on TASK-N2-A2's metadata artifact.</role>

<task>Make llms.txt and llms-full.txt generated outputs of the metadata pipeline, add a `validate:llms` freshness gate, and (if the docs-site skeleton D1 has landed) emit per-page .md endpoints; evaluate and document a Context7 opt-in (context7.json) without publishing anything.</task>

<requirements>
  <generate>Both files derive from the metadata artifact + curated intro sections (curation lives in a source file, generation assembles). llms-full.txt carries per-component sections: props/slots/emits summary, install line, minimal usage from the story-derived example.</generate>
  <gate>validate:llms fails when committed output differs from regenerated — identical pattern to README facts. Both shipping apps consume the same generated files; delete any second handwritten copy.</gate>
  <context7>Write the evaluation (what indexing implies, what the opt-in file contains) as a short report; creating the opt-in is an [!owner] line in the handoff.</context7>
</requirements>

<steps>
  1. Locate the two shipping copies and their current drift; record it.
  2. Implement generation + gate; unify the source of both apps' copies.
  3. Regenerate; validation ladder; hand off with the Context7 evaluation.
</steps>

<success_criteria>Zero handwritten llms content outside the curated intro source; gate red under seeded drift; both apps serve the generated files; Context7 evaluated, not enacted.</success_criteria>

<stop_conditions>Stop when the two shipped copies disagree in a way that implies an intentional per-app difference — surface it instead of unifying silently.</stop_conditions>
```

---

### [x] TASK-N2-A4 — Registry distribution evaluation (shadcn-compatible OSS, private Pro) `[!owner]` 🟢

_Gap: A5-1 / 04 §3. shadcn's `registry.json`/`registry-item.json` schema is the
de facto format AI builders (v0, Bolt, Lovable) consume; CLI 3.0 supports
private authenticated registries — a natural **Pro delivery mechanism**
(pairs with Pro N4-L1 licensing). This task is an evaluation ending in an
owner decision, not an implementation._

```xml
<role>You are a design-system architect in ui/dzup-ui writing a decision study. Read-only toward the codebase except for a possible throwaway spike under the scratch conventions of apps/.</role>

<task>Produce a registry-distribution study: (1) whether dzup-ui's compiled-library model can meaningfully map onto the shadcn registry schema (which assumes source-file distribution), (2) what an OSS registry.json would expose (blocks? templates? theme presets? full component source?), (3) how a private authenticated registry would deliver Pro (auth model, relation to GitHub Packages, licensing hook), (4) costs/risks including support-surface expansion of distributing source. End with a recommendation and explicit options for the owner.</task>

<requirements>
  <ground_truth>Read the actual registry schema docs (ui.shadcn.com/docs/registry) and at least one real third-party registry.json. Verify claims about private-registry auth against current CLI docs — mark anything unverifiable.</ground_truth>
  <honesty>dzup-ui is NOT copy-source-styled like shadcn; the study must confront that head-on rather than assuming the mapping works. "Do not build a registry" is an acceptable recommendation if the evidence points there.</honesty>
  <deliverable>docs/program-2026-09/reports/registry-evaluation-2026-09.md, cross-linked from the Pro program's N4-L1 task.</deliverable>
</requirements>

<success_criteria>The owner can decide from the document alone: options, costs, risks, recommendation, and what the first implementation packet would be per option. No registry artifact published or committed beyond the report and an optional clearly-labeled spike.</success_criteria>

<stop_conditions>This task never publishes, registers, or exposes anything externally. Stop and mark [!owner] at the recommendation — implementation is a future packet.</stop_conditions>
```

---

## Docs site

### [x] TASK-N2-D1 — Docs-site skeleton with generated prop tables 🟠

_Gap: A5-2. The 08-11 program demoted Storybook as the public face without
funding a replacement. Norm: VitePress/Nuxt Content site, generated prop
tables, search. Storybook remains the internal workbench; `apps/landing`
remains marketing. Depends on TASK-N2-A2 (metadata artifact)._

```xml
<role>You are a docs engineer in ui/dzup-ui. Follow <repo_conventions>. The site is a new app (suggest apps/docs) — it renders generated artifacts; it never hand-maintains API facts.</role>

<task>Stand up the public docs-site skeleton: framework decision (VitePress 1.6 vs Nuxt Content — decide by written comparison against this repo's constraints), information architecture (getting started / components by family / styling contract / tokens / agents), one generated page per public component with prop/slot/emit/expose tables rendered from the TASK-N2-A2 artifact, and working search.</task>

<motivation>Every consumer-facing weakness in the positioning matrix (docs ❌, playground ❌, published evidence ❌) lands on this missing site. The raw material is unusually good — generated metadata, capability matrix, anatomy files — so the site is mostly a renderer, which is also what keeps it honest.</motivation>

<requirements>
  <decision>A short framework memo first (SSG output, Vue-component-in-page support for future playgrounds, versioning story, search options). VitePress 1.6 is the default presumption; overturn it only with reasons.</decision>
  <generated_pages>Component pages are built from the metadata artifact at build time. A page states the component's status/tier honestly. Hand-written content is limited to per-component usage prose in clearly separated files that the generator merges — never hand-typed tables.</generated_pages>
  <freshness>The site build fails when the metadata artifact is stale (reuse validate:component-meta) — a stale site cannot build, which is the whole point.</freshness>
  <scope>No deployment/hosting in this task (owner authority); no playground (D3); no evidence pages (D2). Local build + preview only.</scope>
</requirements>

<steps>
  1. Framework memo; scaffold the app; wire it into the workspace (respect existing Vite-version contexts noted in the debt register).
  2. Implement the component-page generator + family navigation + search.
  3. Author the non-generated skeleton pages (getting started from the fixture-backed install docs — reuse P1-04's validated snippets, do not write new install prose).
  4. Build; verify every public component has a page; validation ladder; hand off with build stats and the D2/D3 seams identified.
</steps>

<success_criteria>Site builds locally with 144 component pages carrying generated tables; search returns components by name and family; install docs reuse validated snippets; site build red under stale metadata; Storybook and landing untouched.</success_criteria>

<stop_conditions>Stop and report when the metadata artifact's fidelity (from A2's stats) is too poor to render a usable table for a component class — route back to A2 rather than hand-fixing pages; when workspace wiring would force a Vite version change on existing apps.</stop_conditions>
```

---

### [x] TASK-N2-D2 — Evidence pages: per-component a11y sections, the styling-posture statement, browser-support statement 🟠

_Gap: A5-2 / 04 §2. The credible 2026 bar: per-component APG link + keyboard
table + AT-matrix state (honest cells including "unrun"), a published
browser-support statement, and the "restyleable by contract, not unstyled"
posture statement. Depends on D1; consumes N1 outputs as they land._

```xml
<role>You are a docs engineer in ui/dzup-ui. Follow <repo_conventions> — especially <evidence_rules>: unrun cells render as unrun; nothing is collapsed into a green badge.</role>

<task>Add the evidence layer to the docs site: (1) a per-component accessibility section generated from the quality matrix (APG pattern link, WCAG SC list, keyboard interaction table) and the AT matrix (executed cells with date/AT/browser; unexecuted shown as such), (2) the rendered capability matrix as a site page, (3) a browser-support statement page (Baseline Widely Available + the actual engine-lane evidence state), (4) the published styling-posture statement ("restyleable by contract, not unstyled" — the corrected rationale from reassessment 01 §A6).</task>

<motivation>dzup-ui measures more than almost any Vue library and publishes none of it. Honest evidence pages — including visible "unrun" — are more credible than competitors' unbacked "accessible" claims, and they create the public pressure that keeps N1 execution funded.</motivation>

<requirements>
  <generated>A11y sections and the capability matrix page render from the generated artifacts with sourceCommit shown. Keyboard tables come from contract-spec/APG metadata where machine-readable; where only prose exists, the section links the APG pattern and marks the table "not yet derived" rather than hand-typing one.</generated>
  <statements>The styling-posture statement and browser statement are authored prose (they are policy, not data) — but every factual claim in them (engine versions, layer names, pilot counts) is generated or omitted.</statements>
</requirements>

<steps>
  1. Map artifact fields → page sections; identify any missing machine-readable field and record it (do not invent data).
  2. Implement the generators/renderers; render honest states for the current (partially-run) evidence.
  3. Author the two statements; review factual claims against generated sources.
  4. Build; validation ladder; hand off with screenshots of one Tier C component's evidence section.
</steps>

<success_criteria>Every component page shows APG/WCAG/keyboard/AT state from generated data; unrun cells visibly unrun; capability matrix browsable on the site; both statements published in the site source with zero hand-typed metrics; site build remains freshness-gated.</success_criteria>

<stop_conditions>Stop when rendering would require inventing evidence (e.g. a keyboard table nothing machine-readable backs); when the statement contradicts a repo fact — resolve the fact first or mark the sentence [!owner].</stop_conditions>
```

---

### [x] TASK-N2-D3 — Inline playgrounds and the ThemeRecipe theme builder 🟢

_Gap: 04 §4. Live editable examples are table stakes; a theme builder is the
credible bar. ThemeRecipe already ships URL serialization
(`themeRecipeTo/FromUrl`) and apply/validate/normalize — "the hard part is
already built." Depends on D1._

```xml
<role>You are a docs engineer in ui/dzup-ui. Follow <repo_conventions>. Depends on the docs-site skeleton (TASK-N2-D1).</role>

<task>Add (1) inline editable playgrounds to component pages via @vue/repl, seeded from the story-derived examples in the metadata artifact, and (2) a theme-builder page over the existing ThemeRecipe API: axis controls → live preview across representative components → shareable URL via themeRecipeTo/FromUrl → copy-paste consumer snippet (CSS variables / recipe object).</task>

<requirements>
  <repl>Playground imports resolve @dzup-ui/* from built dist (document the mechanism — import maps or bundled artifacts). One playground per component page minimum, seeded from a real story; do not synthesize example code.</repl>
  <theme_builder>Controls for the 5 ThemeRecipe axes + presets; validation errors surfaced through the existing validate/normalize functions (never a second validator); URL round-trip proven with a spec.</theme_builder>
  <performance>Playgrounds lazy-load; the site's non-playground pages must not pay the REPL bundle cost.</performance>
</requirements>

<steps>
  1. Spike @vue/repl with built dzup-ui dist; record the resolution mechanism.
  2. Implement per-page playground embedding; verify on 5 components across families.
  3. Build the theme-builder page; round-trip spec.
  4. Validation ladder; hand off with bundle-size effect on the site.
</steps>

<success_criteria>Playgrounds run real story code with editable source on component pages; theme builder produces URLs that reproduce the theme on reload and snippets that apply in a plain consumer; REPL cost isolated to pages that use it; no new theming logic outside ThemeRecipe.</success_criteria>

<stop_conditions>Stop when @vue/repl cannot resolve the built packages without publishing (document the blocker and the smallest unblocking change for owner review); when the theme builder would need a token mutation API ThemeRecipe does not expose — that is a tokens-package feature request, not a docs hack.</stop_conditions>
```

---

## Styling contract rollout

### [x] TASK-N2-S1 — Anatomy + `ui`-prop adoption beyond the pilots, by family slices 🟠

_Gap: capability matrix rows "anatomy" (9/144 declared, ratchet 137;
`data-part` emitted by 22 files — attribute outruns declaration 2.4×) and
"`ui` prop" (5/144 pilots). Roadmap N2-S1: continue adoption by family slices;
align emitters with declarations; take the `data-scope` question to the ADR-19
review._

```xml
<role>You are a component engineer in ui/dzup-ui. Follow <repo_conventions> — ADR-19 (Proposed) defines the contract; the pilots (DzButton, DzTable, DzSelect, DzInput, DzDialog) define the implementation pattern. Copy the pattern; do not redesign it.</role>

<task>Extend anatomy declarations and the typed `ui` per-part override prop to the next family slices, starting by reconciling the 13 components that emit data-part WITHOUT an anatomy declaration (attribute/declaration alignment), then completing whole families in priority order (suggest: forms and inputs first — they feed the Pro form renderer; then overlays). Additionally: write the data-scope evaluation (should components mark identity à la Ark's data-scope?) as an input to the ADR-19 acceptance packet.</task>

<motivation>The five-layer contract is only a contract where it is declared: 9 declarations vs 22 emitters means consumers style against attributes with no governing document, which is exactly the ABI-by-accident failure ADR-19 exists to prevent. Family-complete slices (not scattered components) let the docs site say "family X is fully restyleable."</motivation>

<discovery>
  1. Diff the 22 data-part-emitting files against the 9 anatomy declarations; list the 13 undeclared emitters with their emitted part names.
  2. Read one pilot end-to-end (anatomy file, variants dual-emit, ui-prop typing, Playwright coverage) to extract the exact mechanical pattern and its per-component cost.
  3. Read the anatomy generator/ratchet to confirm how a new declaration lowers the 137 ceiling.
</discovery>

<requirements>
  <alignment_first>The 13 undeclared emitters get declarations matching what they already emit (or a recorded correction where the emitted names violate ADR-19 naming — flag renames as breaking, do not perform them).</alignment_first>
  <family_slices>A slice is complete when every component in the family declares anatomy, emits data-part/data-state per declaration, and exposes the typed ui prop; the ratchet drops by the family's size; Playwright coverage extends the pilots' 3-engine pattern to at least the family's Tier B+ components.</family_slices>
  <data_scope>A one-page evaluation: what data-scope adds over data-part alone, migration cost, competitor practice (Ark/Zag vs Base UI) — filed into the ADR-19 acceptance packet inputs (TASK-N5-05), not decided here.</data_scope>
</requirements>

<steps>
  1. Alignment pass (13 components); ratchet 137 → 124.
  2. Forms family slice; then inputs; then overlays as session budget allows — complete families only, report the ratchet after each.
  3. Extend Playwright part/state coverage per slice.
  4. Write the data-scope evaluation; validation ladder; hand off with ratchet trajectory and remaining-family ranking.
</steps>

<validation>
  yarn validate:all      # anatomy ratchet must fall, never rise
  yarn test <touched families>
  yarn test:e2e -- --grep <ui-prop/parts specs>
  yarn typecheck && yarn lint
</validation>

<success_criteria>Zero components emit data-part without a declaration; at least the forms family slice complete with 3-engine part/state evidence; ratchet strictly lower; no part renamed, no public prop broken; data-scope evaluation filed.</success_criteria>

<stop_conditions>Stop and report when an existing emitted part name violates ADR-19 naming (rename = breaking, owner lane); when a component's structure cannot express per-part overrides without refactoring its template beyond styling scope; when dual-emit would regress the perf baselines.</stop_conditions>
```
