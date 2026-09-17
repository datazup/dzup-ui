# dzup-ui — Contract conformance and cross-repo tasks (R3 + R5)

> Part of the [Architecture Review Program 2026-09-04](./README.md). Every
> prompt assumes the `<repo_conventions>` block in
> [README §5](./README.md#5-how-these-tasks-are-written) and the check-first
> protocol in [README §4](./README.md#4-how-to-run-a-task--the-check-first-protocol).
>
> **Sources:** 2026-08-11 reassessment docs **03** (developer experience,
> theming, styling), **06** (quality, accessibility, i18n, security) and **08**
> (validation and release matrix); the ADR-19 / ADR-20 acceptance packets
> (`../program-2026-09/reports/N5-05-adr-{19,20}-acceptance-packet.md`); the
> N2-S1, N5-02, N5-04 and N2-A2/A3/D2 handoffs; the Form spec register
> (`dzup-form-system-2026-08-08`, OSS half); Pro REL-01 findings R4a/R4b and
> QUAL-04 §6 for the two cross-repo seams.
>
> **The rule that governs this file:** the 08-11 specification documents
> promised these contracts; no packet built them. **Build them on the existing
> generators, validators and manifests — never a second mechanism.** A task
> that finds itself writing a new scanner, a new matrix, or a new catalog has
> drifted; stop and re-read the artifact that already owns the concern.
>
> **Ordering:** R3-O1 is 🔴 but blocked on Pro TASK-R1-P4 — prepare, then wait
> for the manifest. R3-O2 unblocks Pro TASK-R5-P2 and should go early. R5-O1
> must land before TASK-R0-O2 (ADR acceptance). R5-O2 precedes R5-O5 (the docs
> sections render from anatomy). R5-O4 waits for TASK-R1-O2 (the catalog
> export). Everything else is independent and can run in parallel by separate
> owners.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## R3 — Cross-repo seams and form residuals

### [ ] TASK-R3-O1 — Consume the Pro ownership manifest: resolver Pro tier and the `core-pro` fixture 🔴

_Gap: 1.0 exit criterion **C7** ("Pro ownership manifest feeding the resolver")
is measured "Core half done" in `../program-2026-09/reports/1-0-exit-criteria-2026-09.md`.
At `99b963a` the ownership manifest has two tiers (`@dzup-ui/core` 1,314,
`@dzup-ui/compat` 13) and **no Pro tier**; `packages/core/src/generated/component-ownership.ts`
publishes `OWNERSHIP_TIERS = ['core']`, so a Nuxt consumer with `includePro: true`
registers **0 of 208** Pro entries (Pro REL-01 finding **R4b**). Finding **R4a**:
`canResolvePro()` uses CJS `require.resolve` on a package whose `exports` map is
ESM-only, so it cannot see Pro even when installed. The P1-03 `core-pro` tarball
fixture has never run (no Pro tarball existed). Pro TASK-R1-P4 emits the manifest;
this task consumes it._

```xml
<role>You are an integration engineer in ui/dzup-ui working on the resolver, the Nuxt module and the ownership generators. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Generators report; they never decide ownership — a collision between tiers is surfaced, not resolved here.</role>

<task>Make the resolver's Pro tier real: merge the Pro component-ownership manifest (emitted by Pro TASK-R1-P4 at packages/pro/manifests/component-ownership.manifest.json, schema 1.1.0, tier "pro") into the OSS cross-tier ownership map, regenerate OWNERSHIP_TIERS so it includes "pro", fix canResolvePro() to resolve "@dzup-ui-pro/pro/package.json" instead of the bare package name, and prove it end-to-end by running the core-pro Nuxt fixture from freshly packed tarballs of both repos.</task>

<motivation>Criterion C7 cannot be measured until a Pro tier exists in the map the resolver reads. Today "Core + Pro" installs succeed but register nothing from Pro, which is worse than failing: the consumer sees a silent Dz* import that resolves to nothing. The P1 acceptance row ("tarball fixtures resolve Pro by direct import, resolver, Nuxt; missing Pro → diagnostic") has been unverifiable since 2026-08-20 for exactly this reason.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `ls ../dzup-ui-pro/packages/pro/manifests/component-ownership.manifest.json` → exists (else stop: Pro TASK-R1-P4 has not run; prepare steps 1–2 only).
  - `node -e "const m=require('./packages/core/manifests/component-ownership.manifest.json');console.log(Object.keys(m.tiers||{}))"` → includes a Pro tier.
  - `grep -n "OWNERSHIP_TIERS" packages/core/src/generated/component-ownership.ts` → the array includes `'pro'`.
  - `grep -n "package.json" packages/nuxt/src/*.ts packages/core/src/resolver/*.ts 2>/dev/null | grep -i canResolvePro` → resolves `@dzup-ui-pro/pro/package.json`.
  - `yarn test:nuxt-fixtures > /tmp/nuxt-fixtures.log 2>&1; echo "exit $?"` → exit 0, and `grep -c "core-pro" /tmp/nuxt-fixtures.log` ≥ 1 with the fixture's own log showing ≥ 1 Pro component registered (read the exit code directly, never through a pipe).
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read packages/tooling (generate:ownership, generate:ownership:map, build-ownership-map.ts) to see how the compat tier was merged — the Pro tier follows the same path; note where tier order and collision policy are declared.
  2. Read the Pro manifest's header: schema version, sourceCommit, entry count, any `unclassified` entries. Record them; they go in the handoff verbatim.
  3. Read the resolver and Nuxt module (`PRO_PACKAGE = '@dzup-ui-pro/pro'`, the "OWNERSHIP_TIERS lacks pro" warning path, canResolvePro) and the 46 Nuxt unit specs from P2-03 to find the fixtures that assert Pro-absent behaviour — they must keep passing.
  4. Read ../program-2026-09/reports/N5-04-peer-hygiene-handoff.md F10: `test:nuxt-fixtures:pack` packs without building. Build both repos' packages before packing, or the fixture proves a stale dist.
</discovery>

<requirements>
  <merge>The cross-tier map is regenerated, not hand-edited. Collisions between Core and Pro names are reported as a list in the handoff and left in the map as explicit `unresolved` entries — never dropped, never silently preferred. Determinism: two consecutive generations produce byte-identical output.</merge>
  <resolver>`canResolvePro()` resolves `@dzup-ui-pro/pro/package.json` (the `./package.json` export Pro REL-01 added). Pro-absent behaviour is unchanged: the `proAvailability` diagnostic still fires with the same message; the 46 Nuxt unit specs stay green.</resolver>
  <fixture>The `core-pro` case installs Core and Pro from tarballs packed in this session (both repos built first), enables `includePro: true`, imports one Pro component by exact name and asserts it is registered and server-renders. Strict peer resolution may fail on Pro's peer ranges (D6, Pro TASK-R1-P3) — if it does, run once with `--legacy-peer-deps`, record that fact as a caveat in the handoff, and do not widen anything in Pro from this task.</fixture>
  <scope>No change to the ownership schema (1.1.0). No classification of Pro `unclassified` entries. No edits inside ui/dzup-ui-pro.</scope>
</requirements>

<steps>
  1. Complete <discovery>; write the Pro manifest header facts and the collision list (may be empty) into the handoff before changing anything.
  2. Extend the ownership-map generator to read the Pro manifest by path; regenerate the map and OWNERSHIP_TIERS; run the generator twice and diff.
  3. Fix canResolvePro(); add a unit spec that a Pro package with an ESM-only exports map resolves, and one that a missing Pro package yields the diagnostic.
  4. Build both repos, pack, run test:nuxt-fixtures with the core-pro case; capture the registration list and the SSR output.
  5. Run the validation ladder; record C7 as measurable in the handoff (with the command that measures it).
</steps>

<validation>
  yarn generate:ownership:map && git diff --stat packages/core/manifests packages/core/src/generated
  yarn validate:ownership
  yarn test packages/nuxt packages/core/src/resolver
  yarn build && yarn test:nuxt-fixtures        # read the exit code directly, never through a pipe
  yarn validate:all                            # end-to-end; report link 16 as pre-existing if still red
</validation>

<success_criteria>OWNERSHIP_TIERS includes "pro"; the map carries every Pro entry with tier "pro" and zero silent collisions; canResolvePro() resolves an ESM-only Pro; the core-pro fixture registers ≥ 1 Pro component from tarballs and server-renders it; Pro-absent diagnostic unchanged; generator deterministic (byte-identical second run); handoff names the Pro manifest's sourceCommit and the exact command that now measures criterion C7.</success_criteria>

<stop_conditions>Stop and report when the Pro manifest does not validate under schema 1.1.0 (file it against Pro TASK-R1-P4, do not patch the schema); when a Core/Pro name collision is real (an owner decides which tier owns the name); when the fixture fails only because of Pro's peer ranges (record, caveat, continue with --legacy-peer-deps); when a Pro entry lacks the fields the resolver needs (report the field, do not invent it).</stop_conditions>
```

---

### [ ] TASK-R3-O2 — Sanitizer provider seam in Core (ADR-20 amendment) 🟠

_Gap: 08-11 doc 06 §HTML sinks requires a **central sanitizer adapter**
configurable once per application. Pro QUAL-04 built the sink registry (13
sinks), the malicious corpus and the Trusted-Types lane, but its closeout
(`../../../dzup-ui-pro/docs/security.md` §10) records the shared
`DzSanitizerAdapter` provider as **blocked on Core having no provider seam** —
the task forbade a Pro-only provider, correctly. At `99b963a` `DzProvider`
carries eleven contexts (theme · locale · direction · messages · formats ·
portal · motion · defaults · nonce · testIds · testIdPrefix) and no
`sanitizer`. OSS's own 15 `SecurityBoundary` declarers sanitise per component.
This is the seam Pro TASK-R5-P2 consumes._

```xml
<role>You are a security-minded component engineer in ui/dzup-ui working on the provider contract (ADR-20) and @dzup-ui/contracts. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. The provider is one contract, not a bag of options: a new context gets the same typing, nesting, SSR and documentation obligations the other ten have.</role>

<task>Add a `sanitizer` context to DzProvider: a typed adapter interface in @dzup-ui/contracts (sanitize(html, context) → string, a policyName for Trusted Types, and limits), a useDzSanitizer() composable that resolves instance → nearest provider → Core default, an SSR-safe default that is the Core sanitizer path (never a pass-through), nested-provider merge semantics matching the other contexts, and the ADR-20 amendment text as an input to the acceptance packet. Wire OSS's own HTML-bearing SecurityBoundary declarers to resolve through it so the seam is exercised in Core before Pro adopts it.</task>

<motivation>Pro has fourteen rich-content components sanitising through ad-hoc DOMPurify sites governed by a registry that cannot be configured by the host application. An organisation-wide policy (allowed schemes, Trusted Types policy name, size ceilings) must be set once at the root, or every consumer re-solves it per component and the corpus proves nothing about production. Doing it in Core keeps the dependency direction (Pro depends inward) and makes the OSS sinks the first consumers, so the seam is tested before it is exported.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `grep -rn "DZ_SANITIZER_KEY\|useDzSanitizer" packages/core/src/providers packages/core/src/composables/provider | head` → non-empty.
  - `grep -n "sanitizer" packages/core/src/providers/DzProvider.types.ts` → a typed prop exists.
  - `grep -rn "DzSanitizerAdapter" packages/contracts/src | head` → the interface is exported from contracts.
  - `grep -n -i "sanitizer" docs/adr/ADR-20-provider-contract.md` → an amendment section exists.
  - `ls docs/program-2026-09-04/reports/TASK-R3-O2-handoff.md` → exists.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read ../dzup-ui-pro/docs/security.md §6 and §10 and ../dzup-ui-pro/packages/pro/manifests/html-sinks.manifest.json: the per-sink context vocabulary (markdown, mermaid, notebook, chat, …), the limits (DEFAULT_SANITIZE_LIMITS 128 KiB, depth 64), and the Trusted Types policy naming already recorded there. The Core interface must be able to express every field Pro already uses — do not invent a vocabulary.
  2. Read packages/core/src/providers/DzProvider.vue, DzProvider.types.ts and one existing context composable (useDzFormats) end-to-end: injection key pattern, nested merge, SSR default, the P4-02 spec shapes (28 unit + 9 contract + 8 SSR/hydration).
  3. Read packages/core/security/coverage.json and the N1-O5 handoff: which of the 15 declarers own an HTML sink today and how each sanitises.
  4. Read ../program-2026-09/reports/N5-05-adr-20-acceptance-packet.md: the nine divergences; your amendment is the tenth item and must be written in the packet's format.
</discovery>

<requirements>
  <interface>
    <example>
      // packages/contracts/src/provider/sanitizer.ts (shape, not final code)
      export interface DzSanitizeContext { sink: 'html' | 'markdown' | 'svg' | 'notebook' | 'chat' | (string & {}); component: string; inputCeiling?: number; trustedTypes?: boolean }
      export interface DzSanitizerAdapter {
        readonly policyName: string;                       // Trusted Types policy name, one per app
        readonly limits: { maxBytes: number; maxDepth: number };
        sanitize(html: string, context: DzSanitizeContext): string;
      }
    </example>
    Types only in @dzup-ui/contracts (zero runtime deps); the Core default implementation lives in packages/core. Vocabulary values are those Pro already records — add none.
  </interface>
  <default>The default adapter is the Core sanitizer already used by the OSS declarers, applied with the same limits Pro records. A pass-through default is rejected. If a host passes `null`, the composable throws in dev and the behaviour is documented as a consumer obligation.</default>
  <nesting>Nested providers override per field (adapter, policyName, limits) exactly as `formats` does; SSR: no window/document read at import or setup; hydration-stable (add to the P4-02 SSR spec set).</nesting>
  <adoption>Every OSS SecurityBoundary declarer that renders HTML resolves its sanitizer through useDzSanitizer(); the N1-O5 corpus (34 fixtures, 372 tests) re-runs green through the provider path.</adoption>
  <scope>No change to Pro. No new sanitiser library. No URL-policy work (TASK-R2-O4 owns it). The ADR-20 amendment is text for the packet; acceptance itself is TASK-R0-O2 [!owner].</scope>
</requirements>

<steps>
  1. Complete <discovery>; write the interface proposal and the list of Core consumers into the handoff before editing.
  2. Add the contracts types; add the context key, prop, merge rule and composable in Core; write unit + contract + SSR specs mirroring the P4-02 shapes.
  3. Wire the OSS HTML-bearing declarers; re-run the security corpus through the provider path.
  4. Write the ADR-20 amendment section (Decision, Consequences, Divergence closed) and reference it from the N5-05 packet as item 10.
  5. Regenerate component-meta (a new provider hook is documentation); run the ladder.
</steps>

<validation>
  yarn test packages/contracts packages/core/src/providers packages/core/src/composables/provider
  yarn test --project security 2>/dev/null || yarn test packages/testing packages/core/security   # whichever owns the corpus lane
  yarn test:ssr && yarn validate:exports && yarn validate:component-meta
  yarn typecheck && yarn lint
  yarn validate:all                            # read the exit code directly
</validation>

<success_criteria>DzSanitizerAdapter exported from contracts; useDzSanitizer() resolves instance → provider → Core default; nested merge and SSR specs green; the 15-declarer corpus green through the provider path with no per-component sanitiser left for HTML sinks; ADR-20 amendment written in packet format; component-meta regenerated; Pro TASK-R5-P2 can consume the seam without further Core changes (state the import path in the handoff).</success_criteria>

<stop_conditions>Stop and report when Pro's recorded sink vocabulary cannot be expressed without a Pro-specific field (design question for both owners); when a declarer's current sanitiser differs from the Core default in a way the corpus detects (report the diff, do not weaken the default); when the seam needs a Trusted Types policy created at module scope (CSP consequence — [!owner]).</stop_conditions>
```

---

### [ ] TASK-R3-O3 — Form-layout and seam residuals `[!owner: DzGrid span · utility kind · time profile]` 🟢

_Gap: the FORM-OSS lane is green at `99b963a` (`validate:form-readiness`: 44
controls — 251 pass · 0 gap · **5 future** · 47 unrun · 93 n/a), but
`../program-2026-08/EXECUTION-STATUS-FORM.md` "Not done" and the Form spec
register (F-162…F-168) leave six residuals: `DzGrid` has no span API
(`DzGrid.formLayout.spec.ts:66` — "a spanning field is a raw class on the
child", so Pro's `DzFormGridLayout.vue` spans by class); `DzStack.types.ts:18`
still spells `'vertical' | 'horizontal'` while the renderer contract uses
`row/column`; the async-options `play()` stories for the seven selection
controls were never authored (grep of `packages/core/stories` = 0);
`DzMention` is not on the shared `useAsyncOptions` seam (matrix C9 `future`);
and two owner questions from FORM-OSS-03 are still open — a `utility` kind in
ownership schema (codecs are parked in contracts) and the `time` profile offset
(`DzTimePicker` is wall-clock, `format: time` is not)._

```xml
<role>You are a forms-focused component engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. The readiness matrix is generated from the renderer contract — you change controls and regenerate; you never edit a matrix cell.</role>

<task>Close the five `future` cells and the "Not done" list of the FORM-OSS lane: (1) prepare the DzGrid span decision (a `span` prop on grid children vs a `DzGridItem` component) with a recommendation, and implement whichever the owner picks; (2) add `row`/`column` as additive aliases on DzStack's direction vocabulary; (3) author the async-options `play()` stories (loading → ready → error → retry) for the seven selection controls on the useAsyncOptions seam; (4) move DzMention onto that seam; (5) write the two owner decision sheets (`utility` ownership kind; `time` profile offset) with options and a recommendation.</task>

<motivation>Pro's form renderer consumes these primitives through the C1–C9 renderer contract. Every `future` cell is a place where Pro carries a workaround (a raw class for spans, a vocabulary codec for stack direction, a private options seam for mentions) that will calcify into an API the moment Forms v2 publishes. Closing them now costs additive changes; closing them later costs a migration.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `grep -n "span" packages/core/src/components/layout/DzGrid.types.ts` → a span prop or DzGridItem type exists.
  - `grep -n "row\|column" packages/core/src/components/layout/DzStack.types.ts` → aliases present.
  - `grep -rl "useAsyncOptions" packages/core/stories | wc -l` → ≥ 7.
  - `grep -n "useAsyncOptions" packages/core/src/components/**/DzMention.vue` → non-empty.
  - `npx tsx packages/tooling/src/validators/form-readiness.ts` → `future` = 0 (read the summary line, not a pipe).
  - `ls docs/program-2026-09-04/reports/TASK-R3-O3-decisions.md` → the two decision sheets exist.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read ../program-2026-08/form-control-renderer-contract.md (C1–C9) and form-controls-readiness-matrix.md; list the exact rows that read `future` and which control/contract pair owns each.
  2. Read DzGrid.vue, DzGrid.types.ts, DzGrid.formLayout.spec.ts and Pro's ../dzup-ui-pro/packages/pro/src/forms/components/layouts/DzFormGridLayout.vue to see what a span API must express (column count 1/2/3/4/6/12 per the Form spec, start/end vs span-only).
  3. Read the P4-05 RTL work on DzStack (55 physical-direction lines fixed) so the alias does not reintroduce a physical spelling.
  4. Read one existing `play()` story with async states (search stories for `play:` + `waitFor`) and useAsyncOptions/DzOptionsState to reuse the state vocabulary.
</discovery>

<requirements>
  <grid_span>Decision sheet first: two options with API sketch, RTL behaviour, SSR neutrality, and what Pro's DzFormGridLayout would delete. Recommend one. Implement only after the owner picks; the implementation ships an anatomy update if it introduces a part.</grid_span>
  <stack_alias>Additive: `row`/`column` accepted alongside the existing values; the existing values stay; type + runtime normalisation + one contract spec; no deprecation without an owner decision.</stack_alias>
  <stories>One `play()` story per control exercising loading → ready → error → retry against a mocked options provider; the story satisfies validate:story-dod for its tier and is selectable by the browser matrix (no shared *Parts.stories.ts).</stories>
  <mention>DzMention consumes useAsyncOptions/DzOptionsState like the other seven; its private loader is deleted; matrix row C9 for DzMention moves `future` → `pass`.</mention>
  <decision_sheets>
    <example>
      ## Decision: `utility` ownership kind
      Raised by: FORM-OSS-03 owner Q1 · Today: schema 1.1.0 has no `utility` kind; 10 value codecs live in @dzup-ui/contracts and count against the unclassified ratchet (29).
      Options: (a) add `utility` to schema 1.2.0 (touches 29 unclassified + the generator) · (b) classify codecs as `contract` · (c) leave.
      Recommendation: (a), because … · Cost: … · Reversibility: …
    </example>
  </decision_sheets>
  <scope>No renderer-contract change (C1–C9 stay); no Pro edits; no new control.</scope>
</requirements>

<steps>
  1. Complete <discovery>; write the `future` cell inventory into the handoff.
  2. Write both decision sheets and the DzGrid span sheet; mark the task `[!]` on those three while continuing with steps 3–5.
  3. DzStack aliases + spec; DzMention onto the seam + specs; regenerate the readiness matrix.
  4. Author the seven play() stories; run story-dod and the chromium matrix targets for the touched components.
  5. If the owner has picked a span option, implement it (types, anatomy, spec, story); regenerate; run the ladder.
</steps>

<validation>
  yarn test packages/core/src/components/layout packages/core/src/components/forms packages/core/src/composables
  yarn generate:form-readiness && yarn validate:form-readiness
  yarn validate:story-dod && yarn storybook:test
  yarn validate:rtl && yarn validate:anatomy-parts
  yarn typecheck && yarn lint
</validation>

<success_criteria>form-readiness `future` 5 → 0 (matrix regenerated, never hand-edited); 7 play() stories selectable by the matrix; DzMention on the shared seam with its private loader deleted; DzStack accepts `row`/`column` additively with RTL specs green; three decision sheets written with a recommendation each; span API implemented only on an owner pick and then reflected in Pro as a follow-up note (not a Pro edit).</success_criteria>

<stop_conditions>Stop and report when a `future` cell turns out to need a renderer-contract change (C1–C9 are frozen — file it); when the span API cannot be expressed without a physical-direction property (RTL rule); when the owner has not picked a span option — deliver everything else and leave that row `[!]`.</stop_conditions>
```

---

### [ ] TASK-R3-O4 — Shared security-corpus format (OSS half; pairs with Pro TASK-R2-P9) 🟢

_Gap: roadmap N1-P1 said "share the corpus format with OSS N1-O5". OSS shipped
`@dzup-ui/testing/security-corpus` v1.0.0 (34 fixtures, 15 declarers bound, 372
tests) and Pro built its own corpus under `packages/pro/tests/security/corpus/`
(96 tests). Whether the two share a schema or an outcome vocabulary was never
verified (register-0811 contradiction 14). 08-11 doc 06 §Files/engines also
asks for an optional-peer fixture that covers **incompatible** versions, which
neither repo has (R-058d)._

```xml
<role>You are a test-infrastructure engineer in ui/dzup-ui owning @dzup-ui/testing. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. The corpus is a published contract: versioned, schema-checked, documented — the same bar as a component.</role>

<task>Make the OSS security corpus the shared format: publish its fixture schema and outcome vocabulary from @dzup-ui/testing (JSON Schema + TypeScript types), version it, document the contribution path, and add a fixture shape for "optional peer installed at an incompatible version" that Pro's consumer matrix can reuse. Then produce a one-page compatibility table against Pro's corpus files so Pro TASK-R2-P9 can adopt the format without guessing.</task>

<motivation>Two corpora with two vocabularies mean two definitions of "sanitised". A Pro sink that passes Pro's corpus and an OSS sink that passes OSS's corpus cannot be compared, and the capability matrix cannot render one column for both. Publishing the schema from the package that already ships to consumers also lets a host application run the same fixtures against its own registries.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `ls packages/testing/src/security-corpus/*.schema.json packages/testing/src/security-corpus/schema.ts 2>/dev/null` → schema and types exist.
  - `grep -n "version" packages/testing/src/security-corpus/index.ts` → the corpus declares a version ≥ 1.1.0.
  - `grep -rn "incompatible" packages/testing/src/security-corpus | head` → an incompatible-peer fixture shape exists.
  - `ls docs/program-2026-09-04/reports/TASK-R3-O4-corpus-compatibility.md` → the table against Pro's files exists.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read packages/testing/src/security-corpus (fixtures, loader, outcome enum, how the 15 declarers bind) and ../program-2026-09/reports/N1-O5-security-corpus-handoff.md (format decisions, S1–S6 findings).
  2. Read ../dzup-ui-pro/packages/pro/tests/security/corpus/{html,markdown}.json and the Pro runner; tabulate field-by-field differences and the outcome words each uses.
  3. Read ../dzup-ui-pro/fixtures/consumers/README.md to see how "peer absent" is modelled today, so the incompatible-version fixture shape is a sibling, not a new mechanism.
</discovery>

<requirements>
  <schema>JSON Schema for a fixture (id, category, sink context, payload, expected outcome, rationale, provenance); TypeScript types generated or hand-written with a spec that they agree; a `validate:security-corpus` check that every fixture validates.</schema>
  <vocabulary>One outcome vocabulary (e.g. rejected · sanitised · escaped · passed-through-by-policy) with definitions; existing fixtures migrated; a changeset (`minor` under VERSIONING.md if any exported name changes).</vocabulary>
  <incompatible_peer>A fixture shape describing an optional peer name + installed version + expected diagnostic, and one executable OSS example (e.g. a wrong-major of a declared optional peer), so Pro can instantiate it in its consumer matrix.</incompatible_peer>
  <compatibility_table>Field-by-field: OSS field · Pro field · same/renamed/missing · migration note. No Pro edits — the table is Pro TASK-R2-P9's input.</compatibility_table>
  <scope>No new payload categories; no change to which components declare SecurityBoundary; the 372 tests stay green or the diff is explained.</scope>
</requirements>

<steps>
  1. Complete <discovery>; write the compatibility table draft first.
  2. Add schema + types + validator; migrate fixtures; bump the corpus version; changeset.
  3. Add the incompatible-peer fixture shape and one OSS example; wire it into the existing peer-surface report if it has a natural home.
  4. Document the contribution path in packages/testing/README (generated facts only where a generator exists).
  5. Run the ladder; finalise the table with exact paths.
</steps>

<validation>
  yarn test packages/testing
  yarn validate:security-corpus 2>/dev/null || npx tsx packages/tooling/src/validators/security-corpus.ts
  yarn validate:exports && yarn validate:release-policy
  yarn typecheck && yarn lint
</validation>

<success_criteria>Schema + types + validator published from @dzup-ui/testing; fixtures validate; one outcome vocabulary with definitions; corpus version bumped with a changeset; an incompatible-peer fixture shape with one executable example; the compatibility table lists every Pro field with a disposition; 372 tests green.</success_criteria>

<stop_conditions>Stop and report when a Pro outcome cannot be mapped onto the OSS vocabulary without losing information (a joint decision); when the schema would force a fixture category the OSS declarers cannot exercise (keep it optional, note it); when exporting the schema changes a public name (changeset level is `minor` — do not pick `major`).</stop_conditions>
```

---

## R5 — Contract and spec conformance

### [ ] TASK-R5-O1 — ADR-19 pre-acceptance code work: cascade layers, `DataState`, layer-order fixture `[!owner: data-scope]` 🟠

_Gap: the ADR-19 acceptance packet
(`../program-2026-09/reports/N5-05-adr-19-acceptance-packet.md`) records **13
divergences** between the ADR and the code at `99b963a`. The ones that are code
work, not prose: only `@layer dz-tokens, dz-base, dz-components` ship
(`packages/core/src/styles/base.css`) — `dz-reset`, `dz-utilities`,
`dz-overrides` exist nowhere, so consumer overrides work by append-order
accident; the `DataState` union in `data-attributes.types.ts` is still the
closed 8-value set ADR-19 §4 said to widen, and `DzButton` violates it; there
is no vendor sublayer registry (owner, selector, exit condition); no CSS
layer/import-order fixture exists (08-11 doc 08 package matrix row); 13 part
names sit outside the ADR-19 vocabulary (S1-D1); the `data-scope` evaluation
(N2-S1 §11) is an open owner input; `packages/contracts/VERSIONING.md` §7
names three reconciliations (ADR-19 §6, TOKENS.md, `Versioning.mdx`) — 1.0
criterion **C2**; and N5-02 D1 found `ariaInvalid` misplaced in
`BaseAccessibilityProps`. TASK-R0-O2 cannot accept the ADR over these._

```xml
<role>You are a styling-contract engineer in ui/dzup-ui working on ADR-19's five-layer contract, @dzup-ui/contracts and the anatomy generators. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. You make the code match the ADR or make the ADR say what the code does — never leave the two disagreeing silently.</role>

<task>Close the code-side divergences in the ADR-19 packet so TASK-R0-O2 can put an honest acceptance in front of the owner: ship the three missing cascade layers (or amend the ADR with the stated consequence and a test that proves override order), widen DataState per ADR-19 §4 and fix DzButton, add a vendor-sublayer registry with owner/selector/exit fields and a validator, write the CSS layer/import-order fixture (consumer CSS after Dzup layers overrides without !important, on a packed tarball), resolve the 13 vocabulary names (S1-D1) into the ADR vocabulary or an explicit extension, move ariaInvalid to BaseValidationProps under a `minor` changeset, apply the three VERSIONING.md §7 reconciliations in their source documents, and prepare the data-scope decision sheet.</task>

<motivation>Code is building on a Proposed decision that the packet shows is not what shipped. Accepting the ADR as written would sign off a six-layer cascade that has three layers, and a closed DataState that a Tier B component already violates. The override guarantee is the one styling promise consumers act on; today it holds by import order, which a bundler can change.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `grep -c "dz-reset\|dz-utilities\|dz-overrides" packages/core/src/styles/base.css` → ≥ 3, or ADR-19 §cascade carries a dated amendment naming three layers.
  - `grep -n "loading\|idle" packages/contracts/src/**/data-attributes.types.ts` → DataState widened; `yarn validate:anatomy-parts` reports no DzButton state violation.
  - `ls packages/core/styles/vendor-sublayers.json 2>/dev/null || ls packages/core/src/styles/vendor-registry.*` → registry exists and a validator reads it.
  - `ls e2e/styling/layer-order.spec.ts 2>/dev/null || grep -rl "import-order\|layer-order" e2e packages/core/src/styles | head -1` → fixture exists.
  - `grep -n "ariaInvalid" packages/contracts/src/**/BaseValidationProps* 2>/dev/null | head -1` → moved.
  - `grep -n "§7\|reconcil" packages/contracts/VERSIONING.md` → the three items are marked resolved with paths.
  - `ls docs/program-2026-09-04/reports/TASK-R5-O1-data-scope-decision.md` → exists.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read the ADR-19 packet in full; copy its 13-divergence table into the handoff and mark each as code-work / ADR-amendment / owner.
  2. Read packages/core/src/styles/base.css and the pilots' override stories (P3-03: 21/21 ×3 engines) to see what the override guarantee currently rests on; read validate:tokens and validate:anatomy-parts to find where a layer or state rule would be enforced.
  3. Read data-attributes.types.ts, DzButton.anatomy.ts and DzButton.variants.ts to see the exact violating state; enumerate every component emitting a data-state outside the union (grep data-state= in packages/core/src).
  4. Read N2-S1 handoff §11 (data-scope evaluation) and §4 S1-D1 (the 13 names); read packages/contracts/VERSIONING.md §7.
</discovery>

<requirements>
  <layers>Either ship `dz-reset`, `dz-utilities`, `dz-overrides` with a documented purpose each and behaviour-critical CSS retained in its layer, or amend ADR-19 to three layers with the consequence stated ("consumer overrides rely on layer precedence, not import order") — in both cases the layer-order fixture must pass on a packed tarball, not source.</layers>
  <data_state>Widen the union exactly as §4 describes; every emitter conforms; validate:anatomy-parts fails on an out-of-union state (seed one failure, prove the gate, remove it).</data_state>
  <vendor_registry>JSON registry: selector · owner · reason · exit condition (date or event); validator fails on an entry missing any field; today's entries are only what the packet names (Reka-derived selectors, if any) — do not invent entries.</vendor_registry>
  <layer_order_fixture>A Playwright or SSR fixture that installs the packed core tarball, appends consumer CSS after the Dzup stylesheet and asserts the consumer wins without !important, and that reversing import order does NOT flip the result. Runs in the 18-project matrix or as its own project.</layer_order_fixture>
  <contracts_change>`ariaInvalid` → BaseValidationProps; changeset `minor` under VERSIONING.md (0.x: minor = breaking); codemod entry if any consumer type would move.</contracts_change>
  <vocabulary_and_versioning>Each of the 13 names: mapped to an ADR vocabulary word, or added to the vocabulary with a one-line definition; the three §7 reconciliations applied in ADR-19 §6, TOKENS.md and Versioning.mdx with a dated note.</vocabulary_and_versioning>
  <decision_sheet>`data-scope` equivalent: options (adopt / decline / defer with trigger), consequences for anatomy declarations, a recommendation — owner input for TASK-R0-O2.</decision_sheet>
  <scope>No new anatomy declarations beyond fixing emitters (rollout is TASK-R5-O2); no ADR status change (TASK-R0-O2); no token renames.</scope>
</requirements>

<steps>
  1. Complete <discovery>; publish the classified divergence table in the handoff before editing.
  2. Layers (ship or amend) + the layer-order fixture; prove it on a packed tarball.
  3. DataState widening + emitters + gate proof; vendor registry + validator.
  4. Contracts move with changeset; vocabulary resolution; VERSIONING §7 reconciliations.
  5. data-scope decision sheet; re-issue the packet's divergence table with each row's new state; run the ladder end-to-end.
</steps>

<validation>
  yarn test packages/contracts packages/core/src/styles packages/core/src/components/buttons
  yarn validate:anatomy-parts && yarn validate:tokens && yarn validate:tv-slots
  yarn build && yarn test:e2e -- --project=<layer-order project>
  yarn validate:release-policy && yarn validate:changelog
  yarn typecheck && yarn lint && yarn validate:all      # read the exit code directly, never through a pipe
</validation>

<success_criteria>ADR-19 divergences 13 → 0 (each row: fixed in code or amended in the ADR with a dated note); layer-order fixture green on a tarball in both import orders; DataState widened with the gate proven; vendor registry + validator exist (entries only from the packet); ariaInvalid moved under a `minor` changeset; VERSIONING §7 marked resolved with paths; data-scope sheet written; packet re-issued and referenced from TASK-R0-O2.</success_criteria>

<stop_conditions>Stop and report when shipping a layer changes a pilot's rendered geometry (visual lane evidence — [!owner]); when a DataState value cannot be widened without a public prop change beyond the changeset's scope; when a §7 reconciliation needs a token rename (TASK-R5-O7's territory); when the data-scope options cannot be costed without a Pro adoption estimate (note it, still recommend).</stop_conditions>
```

---

### [ ] TASK-R5-O2 — Anatomy + `ui` + `rtl` rollout to Tier B complete 🟠

_Gap: 1.0 criteria **C3/C4**: at `99b963a` **20 of 89** Tier B+ components
declare an anatomy (B 18/67, C 1/21, D 1/1); the ownership ratchet
`maxWithoutAnatomy` reads **113** of 144; the typed `ui` prop is on **27**. Three
families are complete (inputs, buttons, typography) by N2-S1; nine remain. The
N2-S1 handoff (`../program-2026-09/reports/N2-S1-anatomy-rollout-handoff.md`)
gives the method, the ranked family order (§10, forms next), and the blockers:
**S1-D4** `DzOptionsState` injects three undeclared parts into seven form
components (blocks the forms family until decided), **S1-D3** a `DzDialog` RTL
defect, **S1-F3** the contract does not compose across a parent/child pair, and
**S1-F10** — the aggregate gate reported green over a stale artifact for three
packets, so `validate:all` runs end-to-end after every slice._

```xml
<role>You are a styling-contract engineer in ui/dzup-ui continuing the N2-S1 rollout. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. You declare what a component already renders; you do not redesign it. A part name outside the ADR-19 vocabulary is a stop, not an invention.</role>

<task>Roll the ADR-19 contract (anatomy declaration with parts/states/tokens/rtl axis, stable data-part/data-state emission, typed `ui` override) across the remaining nine families in the N2-S1 §10 order — forms first after the S1-D4 decision — until every Tier B+ component declares an anatomy (ratchet 113 → ≤ 55) and every component that declares more than `root` carries the typed `ui` prop. Fix S1-D3 and record S1-F3's composition rule as you meet it. Run the four regenerations in order and validate:all end-to-end after each family.</task>

<motivation>The docs site publishes a "Parts / States / Tokens" section only for components that declare one; the theme builder and the `ui` override are the two things the competitive benchmark says a 2026 library must offer, and both are per-component contracts. 20 of 89 Tier B+ is the distance between "restyleable by contract" as a claim and as a fact.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `node -e "const r=require('./packages/core/manifests/unclassified-ceiling.json');console.log(r.maxWithoutAnatomy ?? r)"` (or the ownership validator's ratchet file) → ≤ 55.
  - `ls packages/core/src/components/**/*.anatomy.ts | wc -l` → ≥ 89 (all Tier B+) — compare against quality-matrix.json tiers, not against 144.
  - `grep -l "ui?:" packages/core/src/components/**/*.types.ts | wc -l` → equals the count of components declaring more than `root`.
  - `grep -n "S1-D4" docs/program-2026-09-04/reports/TASK-R5-O2-handoff.md` → the DzOptionsState decision is recorded.
  - `yarn validate:anatomy-parts && yarn validate:rtl && yarn validate:story-dod` → all exit 0 (read directly).
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read the N2-S1 handoff §1 (corrected baseline table — do not quote the task file's numbers), §3 (the G1 guard and its four false-positive classes), §4 (S1-F3, S1-F4), §10 (ranked family order with the blocker on each), §14 (the four regenerations in order).
  2. Read quality-matrix.json to list Tier B+ components without an anatomy, grouped by family; that list is the plan.
  3. Read DzOptionsState and the seven form consumers; decide (or prepare for the owner) whether the injected parts are declared by DzOptionsState, by each consumer, or by a shared fragment — this is S1-D4 and it gates the forms family.
  4. Read the DzDialog RTL defect (S1-D3) and the validate:rtl template rules so the fix is a contract fix, not a one-off.
</discovery>

<requirements>
  <per_family_slice>For each family: anatomy files for every Tier B+ component (parts/states/tokens/rtl axis), data-part/data-state emitters aligned with declarations, typed `ui` on components with >1 part, override story per component (the pilot pattern, 3 engines), then the four regenerations (ownership → quality → capability → component-meta) and validate:all end-to-end. Ratchet moves once per slice.</per_family_slice>
  <vocabulary>Part names only from the ADR-19 vocabulary (plus the TASK-R5-O1 additions once landed). A component needing a new name stops the slice; record it and continue with the next component.</vocabulary>
  <composition>Where a parent/child pair shares parts (S1-F3), declare the rule once (child parts namespaced or parent-covers) and apply it consistently; write it into the handoff as the composition rule TASK-R5-O6 will gate.</composition>
  <no_pixel_moves>Declaring must not move a pixel in LTR (N2-S1 §8 shows the three classes that changed and why); every touched component re-runs its chromium lane targets and the visual pilot where covered.</no_pixel_moves>
  <handoff_table>
    <example>
      | Family | Components | Anatomy before → after | `ui` before → after | rtl axis | Ratchet (maxWithoutAnatomy) | Regenerations | validate:all |
      | forms | 12 Tier B+ | 3 → 12 | 2 → 11 | 12/12 | 113 → 101 | 4/4 | 37/37 exit 0 @ <sha> |
    </example>
  </handoff_table>
  <scope>No visual redesign, no new tokens (declare existing ones), no ADR text change (TASK-R5-O1), no Tier A work unless it unblocks a Tier B parent.</scope>
</requirements>

<steps>
  1. Complete <discovery>; publish the Tier B+ gap list and the S1-D4 disposition in the handoff before editing.
  2. Forms family (after S1-D4), then data, then the rest in §10 order — one slice at a time, each ending with the four regenerations and an end-to-end validate:all.
  3. Fix S1-D3 in the DzDialog slice with a validate:rtl assertion that would have caught it.
  4. After the last slice: recompute Tier B+ coverage from quality-matrix.json; write the handoff table; list every component stopped by vocabulary.
</steps>

<validation>
  yarn test <family paths>
  yarn validate:anatomy-parts && yarn validate:tv-slots && yarn validate:rtl && yarn validate:tokens
  yarn generate:ownership && yarn generate:quality-matrix && yarn generate:capability-matrix && yarn generate:component-meta
  yarn validate:story-dod && yarn test:e2e -- --project=<chromium targets for the slice>
  yarn validate:all     # end-to-end after EVERY slice; read the exit code directly, never through a pipe
</validation>

<success_criteria>Every Tier B+ component declares an anatomy (20/89 → 89/89); `maxWithoutAnatomy` 113 → ≤ 55; `ui` on every component declaring more than root; S1-D3 fixed with a gate; S1-D4 recorded; composition rule written; zero pixel moves in LTR (evidence per slice); validate:all 37/37 exit 0 at the final commit; components stopped by vocabulary listed by name with the missing word.</success_criteria>

<stop_conditions>Stop the slice (not the task) when a part needs a name outside the vocabulary; stop the task when declaring a component reveals it renders different parts per variant in a way the anatomy schema cannot express (schema question — [!owner]); when the S1-D4 decision is not taken — skip forms, continue with data, and mark forms `[!]`.</stop_conditions>
```

---

### [ ] TASK-R5-O3 — Provider adoption rollout: motion, direction, formats, testIds, defaults 🟠

_Gap: ADR-20's provider exists with every prop 08-11 doc 03 lists, but adoption
measured at `99b963a` is thin: `useComponentMessages` 40 files ·
`useDzPortalTarget` 18 · `useDzDefaults` 2 · `useDzLocale` 2 · **`useDzMotion`
0 · `useDzDirection` 0 · `useDzFormats` 0 · `useDzTestIds` 0**. The ADR-20
acceptance packet (`../program-2026-09/reports/N5-05-adr-20-acceptance-packet.md`)
records **9 divergences**, the headline being §7's motion policy with zero
consumers — a reduced-motion promise no component honours through the
provider. Doc 03 §Provider also asks that component defaults be typed and
tree-shakeable; two components honour one today._

```xml
<role>You are a component engineer in ui/dzup-ui rolling out the ADR-20 provider contract. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A provider context is honoured when the component reads it through the published composable with instance props as overrides — not when a story sets a prop.</role>

<task>Adopt the four zero-consumer contexts and widen the two thin ones by family slice: motion (overlays, feedback, every animated component — with a deterministic test mode), direction (tabs, sliders, carousels, splitters — every direction-dependent keyboard pattern), formats (data and forms — every date/number/relative-time display), testIds (all families), defaults (every component whose story demonstrates a global default). Regenerate component-meta so provider hooks become documentation, and re-issue the ADR-20 packet's divergence table with each row's new state.</task>

<motivation>The provider is the one place a host configures the library. A context nobody reads is a promise the docs site publishes and the code breaks; reduced-motion in particular is a WCAG 2.2 obligation the library claims through ADR-20 §7. TASK-R0-O2 cannot accept ADR-20 while its motion policy has no consumer.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `for h in useDzMotion useDzDirection useDzFormats useDzTestIds; do printf "%s " $h; grep -rl $h packages/core/src/components | wc -l; done` → every count > 0, and motion ≥ the number of animated components in quality-matrix.json.
  - `grep -rl useDzDefaults packages/core/src/components | wc -l` → > 2.
  - `grep -n "motion" packages/core/src/composables/provider/useDzMotion.ts` → exposes a deterministic test mode (e.g. `'none'` forced under test).
  - `node -e "const m=require('./packages/core/docs/component-meta.json');console.log(m.records.filter(r=>r.providerHooks?.length).length)"` (adjust to the actual field) → > 60.
  - `grep -c "divergence" docs/program-2026-09-04/reports/TASK-R5-O3-handoff.md` → the ADR-20 table is re-issued.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read the ADR-20 packet's nine divergences and §7; read the four composables and DzProvider.types.ts to confirm the resolution order (instance → provider → default) and the SSR rules (P4-02).
  2. From quality-matrix.json and the stories, enumerate: animated components (transitions, `prefers-reduced-motion` usages, motion tokens); direction-dependent keyboard patterns (arrow-key handlers — P4-05 fixed 55 physical-direction lines, the useTabs bug is the pattern); date/number/relative-time formatters (Intl usages; P4-03 fixed 3 ambient-locale readers); components with test ids; stories that set a "global default".
  3. Read how useComponentMessages was adopted across 40 files (the reference rollout) and copy its shape.
</discovery>

<requirements>
  <resolution>Every adopted component resolves context → instance override, never the reverse; SSR: no window/matchMedia read at setup (motion reads the provider's declared policy, with the media query as a client-side refinement only when the policy is `system`).</resolution>
  <motion_test_mode>A deterministic mode the unit and browser lanes can force (no animation, immediate end states); the 18-project matrix's reduced-motion condition asserts through it, not through CSS sniffing.</motion_test_mode>
  <direction>Keyboard handlers read direction from the context; RTL specs per pattern (arrow semantics recorded per component, per doc 06 §Direction); validate:rtl stays green.</direction>
  <formats>Every displayed date/number/relative time goes through useDzFormats; ambient Intl reads are removed; pseudo-locale run shows the change.</formats>
  <defaults_and_testids>Defaults typed per component in the provider's `defaults` map (tree-shakeable — no runtime registry of all components); testIds prefixed through useDzTestIds with a spec that the prefix propagates.</defaults_and_testids>
  <scope>No new provider props; no change to resolution order; no Pro edits (Pro consumption is Pro TASK-R5-P1).</scope>
</requirements>

<steps>
  1. Complete <discovery>; publish the per-context adoption lists in the handoff before editing.
  2. Motion slice (overlays, feedback, animated) + test mode + matrix condition rewiring.
  3. Direction slice; formats slice; testIds sweep; defaults where stories show one.
  4. Regenerate component-meta and docs pages; re-issue the ADR-20 divergence table (9 → n) with paths.
  5. Full ladder including the reduced-motion and rtl matrix conditions for touched components.
</steps>

<validation>
  yarn test packages/core/src/composables/provider packages/core/src/components/<family>
  yarn test:ssr && yarn validate:rtl && yarn validate:hardcoded-strings
  yarn generate:component-meta && yarn validate:component-meta && yarn validate:docs-pages
  yarn test:e2e -- --project=<reduced-motion and rtl conditions for touched components>
  yarn typecheck && yarn lint && yarn validate:all     # read the exit code directly
</validation>

<success_criteria>motion / direction / formats / testIds consumers 0/0/0/0 → every applicable component (counts stated with the enumeration that defines "applicable"); defaults 2 → every story-demonstrated default; deterministic motion mode used by the matrix; ambient Intl reads 0; component-meta lists provider hooks per component; ADR-20 divergences 9 → ≤ 1 (the sanitizer seam, TASK-R3-O2) with the table re-issued for TASK-R0-O2.</success_criteria>

<stop_conditions>Stop and report when honouring a context changes a component's default behaviour for existing consumers (a `minor` under VERSIONING.md — state it, do not hide it); when a direction-dependent pattern has no APG precedent for RTL arrow semantics (design decision); when motion policy and a component's own animation prop conflict in a way the ADR does not resolve (ADR question for the packet).</stop_conditions>
```

---

### [ ] TASK-R5-O4 — i18n completeness: plural/select formatter, first locale pack, RTL closure `[!owner: locale · Arabic typeface]` 🟠

_Gap: 08-11 doc 06 §Locale and messages asks for a typed catalog with
plural/select formatting, escaped interpolation, cached `Intl`, and
instant-vs-plain date semantics; 08-28 doc 02 recorded "one locale, no packs".
At `99b963a` the catalog exists (54 `aria-label`s + 39 defaults,
`packages/core/src/i18n/{messages,intl-cache,pseudo,useComponentMessages}.ts`,
`validate:hardcoded-strings` green) but **no plural/select formatter** is used
anywhere, the catalog is **unreachable from the published package** (N5-04 D4 —
TASK-R1-O2 fixes the export), instant-vs-plain semantics are undocumented,
and there is still a single locale. RTL residue: the rtl matrix reads 10 pass /
34 unrun (C6); AR-2 found zero fonts vendored (no licence obligation, **no
Arabic typeface** — owner decision D-10, untasked anywhere); APP-1 found no
landing route can render RTL._

```xml
<role>You are an internationalisation engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Messages are typed and catalogued; formatting goes through the cached Intl layer; a locale pack is a consumer-facing artifact with a contribution path, not a JSON file dropped in a folder.</role>

<task>After TASK-R1-O2 has made the catalog reachable from the package: add a plural/select formatter on Intl.PluralRules with escaped, typed interpolation and convert the count-bearing messages to it; document instant-vs-plain date semantics per date-bearing component and encode it in the formats context; add CJK / long-label / pseudo-expansion visual fixtures to the visual lane; ship the first non-`en` locale pack (owner picks the locale) with a contribution guide and a gate that every catalog key has a translation or an explicit fallback; prepare the Arabic-typeface decision sheet (D-10); and make one landing route render RTL end-to-end (APP-1).</task>

<motivation>A single-locale library with an unexported catalog cannot be localised by anyone but its authors, and a plural rendered by string concatenation is wrong in most languages the moment a second pack exists. The RTL matrix has 34 unrun cells and no typeface to render Arabic with — the RTL contract is a claim until one route proves it.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `grep -rn "PluralRules" packages/core/src/i18n | head -1` → non-empty, and the count-bearing messages use it (grep the catalog for `{count, plural` or the chosen syntax).
  - `ls packages/core/src/i18n/locales/ | grep -v "^en" | head -1` → at least one non-`en` pack.
  - `yarn validate:i18n-packs 2>/dev/null || npx tsx packages/tooling/src/validators/i18n-packs.ts` → exit 0 (every key translated or explicitly fallback).
  - `grep -rn -i "instant\|plain date" packages/core/docs/i18n*.md packages/core/src/i18n/*.md 2>/dev/null | head -1` → semantics documented.
  - `ls docs/program-2026-09-04/reports/TASK-R5-O4-typeface-decision.md` → exists.
  - `yarn test:e2e:landing -- --grep rtl` → one landing route renders RTL green.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Confirm TASK-R1-O2 landed: `node -e "import('@dzup-ui/core/i18n')"` from a packed-tarball consumer resolves — if not, stop; this task cannot ship a pack nobody can import.
  2. Read the catalog and useComponentMessages; enumerate count-bearing strings (the 1.0 memo counts 4) and every interpolation site; note the escaping rule in force.
  3. Read useDzFormats and the date-bearing components (DzDatePicker, DzCalendar, DzTimePicker, relative-time displays) to classify each as instant or plain-date per doc 06.
  4. Read ../program-2026-08/EXECUTION-STATUS-REC.md AR-2 and APP-1 findings (typeface, landing RTL arrow-key defect) and rtl-matrix.md for the 34 unrun cells.
</discovery>

<requirements>
  <formatter>Intl.PluralRules-based plural and a select formatter; messages authored in a small typed syntax (document it); interpolation escapes by default with a spec proving `<`/`&` in values cannot become markup; cached per locale through intl-cache.</formatter>
  <semantics>A table (component · value kind · instant/plain · time zone handling) published in the i18n docs and enforced by the formats context's types where possible.</semantics>
  <locale_pack>Structure, loader, tree-shaking (a consumer importing only `en` ships only `en`), a `validate:i18n-packs` gate, a CONTRIBUTING section; the first pack's locale is an owner decision — prepare `de` or `fr` as the default recommendation and state why (contributor availability, script coverage).</locale_pack>
  <visual_fixtures>CJK, combining marks, 4,096-char runs and pseudo-expansion (+40 %) fixtures for text-bearing components in the visual lane (TASK-R2-O6 owns the lane's rollout; add fixtures to the pilot family now).</visual_fixtures>
  <rtl_closure>Fix the landing RTL arrow-key defect (APP-1) in the shared kit, not the landing copy; one landing route under `dir="rtl"` in test:e2e:landing; typeface decision sheet: options (vendor an OFL Arabic face · system stack · consumer obligation), licence and size cost, recommendation.</rtl_closure>
  <scope>No translation of Pro strings (Pro TASK-R5-P1); no change to message keys; no new locale beyond the first.</scope>
</requirements>

<steps>
  1. Complete <discovery>; write the count-bearing and date-semantics inventories into the handoff.
  2. Formatter + escaping + conversion of the count-bearing messages; specs; pseudo-locale run.
  3. Semantics table + formats-context typing; visual fixtures in the pilot family.
  4. Locale pack mechanism + gate + guide; first pack once the owner names the locale (prepare `de`/`fr` scaffolds as unfilled templates if undecided — never ship machine translations as a pack).
  5. Landing RTL route + kit fix; typeface decision sheet; ladder.
</steps>

<validation>
  yarn test packages/core/src/i18n packages/core/src/composables/provider
  yarn validate:hardcoded-strings && yarn validate:i18n-packs
  yarn validate:tree-shake && yarn validate:exports
  yarn test:e2e:landing && yarn test:e2e -- --project=<rtl condition for touched components>
  yarn typecheck && yarn lint
</validation>

<success_criteria>Plural/select formatter in use for every count-bearing message with an escaping spec; instant/plain table published and typed; locale-pack mechanism + gate + guide shipped and one pack present (or scaffolded pending the owner's locale, stated as such); CJK/long-label/pseudo fixtures in the visual lane; one landing route renders RTL in CI-runnable form; typeface decision sheet written; rtl matrix unrun 34 → lower with the exact cells named.</success_criteria>

<stop_conditions>Stop and report when the catalog is still unreachable from the package (TASK-R1-O2 first); when a message needs grammatical gender or case the chosen syntax cannot express (syntax decision, not a workaround); when the owner has not named a locale — ship the mechanism, leave the pack `[!]`; when the typeface would add a runtime font download to every consumer (owner cost decision).</stop_conditions>
```

---

### [ ] TASK-R5-O5 — Docs-page contract completion: keyboard tables, parts/states/tokens, provider hooks 🟠

_Gap: 08-11 doc 03 §Documentation contract names ten generated sections per
public component page. At `99b963a` `apps/docs` (VitePress 1.6.4, 144 pages,
`validate:docs-pages` green) renders **three**: props/emits/slots/exposed with
install snippets, a playground (129/144), and the a11y/evidence section with
the WCAG list. Absent: (1) intent and selection guidance, (4) variants with
controlled/uncontrolled examples, (5) parts/states/tokens, (6) provider hooks,
(7) **keyboard tables — "not yet derived" on 144/144 pages** because only a
regex boolean exists (N2-D2 F-1), (8) locale/RTL/format behaviour, (9)
SSR/portal/perf/peer/security notes, (10) state examples and migration notes.
The site's size gate and deployment are TASK-R1-O5; this task is the content
contract._

```xml
<role>You are a documentation-tooling engineer in ui/dzup-ui working on apps/docs and the generators that feed it. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A docs page is a generated view over artifacts; if a section cannot be generated, the artifact is missing — build the artifact, never hand-type the page.</role>

<task>Complete the ten-section page contract from existing artifacts, adding exactly one new artifact: a machine-readable keyboard contract declared per component (anatomy-style, in Contract Spec v1) from which 144 keyboard tables render. Render parts/states/tokens from the anatomy files (TASK-R5-O2 supplies coverage), provider hooks from component-meta (TASK-R5-O3 supplies adoption), variants and controlled/uncontrolled examples from story ids and `v-model` metadata, locale/RTL/format from the rtl matrix and formats typing, SSR/portal/perf/peer/security notes from the capability matrix, security coverage and peer-surface report, and states/migration from the state union and changesets. Every section is gated by validate:docs-pages with a seeded failure proven.</task>

<motivation>The docs norm the competitive benchmark set is generated prop tables plus inline playgrounds plus per-component a11y evidence; the keyboard table is the part an accessibility buyer reads first, and today all 144 say "not yet derived". A page that hand-types a keyboard table will be wrong within a release; a page that renders it from the contract the tests assert cannot be.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `grep -c "not yet derived" apps/docs/components/*.md` → 0.
  - `for s in "## Intent" "## Variants" "## Parts" "## Provider" "## Keyboard" "## Locale" "## SSR" "## States"; do printf "%s " "$s"; grep -l "$s" apps/docs/components/*.md | wc -l; done` (adjust headings to the shipped ones) → each ≥ 140.
  - `ls packages/core/src/components/**/*.keyboard.ts | wc -l` (or the chosen declaration file) → ≥ the number of keyboard-bearing components in quality-matrix.json.
  - `yarn validate:docs-pages` → exit 0, and its source lists a check per section.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read ../program-2026-09/reports/N2-D1-docs-site-handoff.md §4 (page body is A3's renderComponentSection), §14 (D2 seam: renderEvidence()), §15 (D3 seam); N2-D2 handoff §1 (artifact-field → page-section map, including fields that do not exist) and F-1; N2-A2 §13 (what D1/D2/A3 can and cannot render). Do not redesign what those seams already give you.
  2. Read the keyboard-related assertions in the contract specs and the AT scripts (e2e/at-matrix, 126 steps / 397 expectations) — the keyboard contract must be the single source both the specs and the tables read.
  3. Inventory the artifacts for sections 5, 6, 8, 9, 10: anatomy files, component-meta providerHooks, rtl matrix, capability matrix rows, security/coverage.json, report:peer-surface, data-attributes state union, changesets.
</discovery>

<requirements>
  <keyboard_contract>A per-component declaration (key · modifier · context/part · action · WCAG/APG reference · rtl-mirrored?) in the Contract Spec v1 shape; the contract specs assert against it (replace the regex boolean); the AT scripts cite it; the docs render it. A component with no keyboard interaction declares `none` explicitly.</keyboard_contract>
  <sections_from_artifacts>Each of the seven missing sections names its source artifact in a comment in the generator; a section with no artifact renders an honest "not declared" cell and fails validate:docs-pages once the ratchet for that section is set — never silently omitted.</sections_from_artifacts>
  <gate>validate:docs-pages gains one check per section with a downward ratchet ("pages missing section X"); seed one failure per check, prove it, remove it.</gate>
  <no_hand_text>Intent/selection guidance (section 1) is authored in source (a JSDoc `@intent` block or the component's contract spec), extracted by component-meta, never typed into apps/docs.</no_hand_text>
  <scope>No site deployment, no size gate (TASK-R1-O5); no new Storybook stories except where a variant section needs a story id that does not exist (record it for story-dod instead).</scope>
</requirements>

<steps>
  1. Complete <discovery>; publish the section → artifact map with gaps in the handoff.
  2. Keyboard contract: schema, declarations for every keyboard-bearing component, contract-spec migration, AT-script citation, renderer; 144 tables.
  3. Render sections 5, 6, 8, 9 from their artifacts; sections 4 and 10 from stories/state union/changesets; section 1 from source JSDoc via component-meta.
  4. Gate each section; seed-and-prove; set the ratchets to today's values.
  5. Regenerate the site and llms outputs; ladder.
</steps>

<validation>
  yarn test packages/tooling/src/docs packages/core/src/components/<touched>   # contract specs now read the keyboard contract
  yarn generate:component-meta && yarn generate:docs-pages && yarn generate:llms
  yarn validate:docs-pages && yarn validate:llms && yarn validate:playground-parity && yarn validate:at-scripts
  yarn docs:build
  yarn typecheck && yarn lint && yarn validate:all      # read the exit code directly
</validation>

<success_criteria>10/10 sections generated for every page, none hand-typed; keyboard tables 0/144 → 144/144 derived from a contract the specs and AT scripts also read; validate:docs-pages has a check and a ratchet per section with seeded failures proven; llms.txt regenerated without drift; docs:build succeeds (size measured and reported for TASK-R1-O5).</success_criteria>

<stop_conditions>Stop and report when a keyboard behaviour is asserted differently by a contract spec and an AT script (the contract decides which is right — surface it); when a section's artifact does not exist for a class of components and cannot be derived (name the artifact for a follow-up); when rendering a section would require Pro data (Pro pages are Pro TASK-R5-P4).</stop_conditions>
```

---

### [ ] TASK-R5-O6 — Composition contract: `asChild` allowlist, multi-root fallthrough, `ui` merge order 🟢

_Gap: 08-11 doc 03 §Composition/DOM requires an `asChild` allowlist with tests
(semantics, attrs, ref, disabled, keyboard), declared multi-root fallthrough
targets, explicit controlled/uncontrolled behaviour, and typed slot props. At
`99b963a` `asChild` is implemented on **5** components with no published
allowlist and no test matrix (R-024, R-063); multi-root components do not
declare their fallthrough target; and the `ui` override's merge order and
handler-composition rules exist only as ADR-19 prose — nothing gates them
(R-021). The controlled/uncontrolled rule itself is violated by defect D8
(TASK-R2-O3 fixes the defect; this task writes the contract that would have
caught it)._

```xml
<role>You are a contracts engineer in ui/dzup-ui working on Contract Spec v1. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A composition rule that lives only in an ADR is documentation; a rule the contract spec asserts is a contract.</role>

<task>Turn the three composition rules into gated contracts: (1) an asChild allowlist (which components, which element types, what is guaranteed) with a shared test matrix — semantics preserved, attrs forwarded, ref exposed, disabled propagated, keyboard intact — run against all five implementers; (2) a declared fallthrough target for every multi-root component, asserted by a contract spec and rendered by component-meta; (3) a `ui` merge-order and handler-composition contract (class merge order, style precedence, event handler composition order, safe attrs) asserted by a shared spec run against every component declaring `ui`. Add a controlled/uncontrolled contract assertion (external write after user edit is honoured) to the shared suite so D8's class of defect is caught by contract, not by a story.</task>

<motivation>These are the rules consumers rely on when they compose Dzup components with their own — and the rules a `ui` override silently breaks when merge order is undefined. D8 showed that a rule stated in prose can be violated by seven controls for months without a red gate. The docs site publishes composition guidance only from what the contract declares.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `ls packages/contracts/src/**/as-child* packages/core/src/composition/asChild.allowlist.* 2>/dev/null | head -1` → allowlist exists and lists the 5 components.
  - `grep -rl "fallthrough" packages/core/src/components/**/*.contract.spec.ts | wc -l` → equals the number of multi-root components.
  - `ls packages/core/src/composition/uiMergeOrder.contract.spec.ts 2>/dev/null || grep -rl "merge order" packages/core/src/**/*.contract.spec.ts | head -1` → shared spec exists.
  - `grep -rn "external write" packages/core/src/**/*.contract.spec.ts | head -1` → controlled/uncontrolled assertion exists.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Grep asChild across packages/core/src to list the 5 implementers and how each forwards attrs/refs; grep multi-root templates (`<template>` roots > 1) to list fallthrough candidates; grep `ui?:` types (27) for the merge implementation they share.
  2. Read ADR-19's prose on merge order and handler composition; read the pilots' override stories (P3-03) for the behaviour already proven in browsers.
  3. Read ../program-2026-09/reports/N1-O1-story-dod-handoff.md D8 (useDualModel) to write the contract assertion in the shape that would have failed.
</discovery>

<requirements>
  <allowlist>A data file (component · allowed element kinds · guarantees) consumed by a shared spec; adding a component to asChild without an allowlist entry fails the contract lane.</allowlist>
  <fallthrough>Each multi-root component declares its fallthrough target in its contract spec (and anatomy where the target is a part); component-meta records it; the docs render it (TASK-R5-O5 section 9).</fallthrough>
  <ui_contract>One shared spec parameterised over every `ui`-declaring component: class merge order deterministic and documented, style precedence, handler composition order, the safe-attrs list — plus the controlled/uncontrolled assertion for every component with a v-model.</ui_contract>
  <scope>No new asChild implementers; no fixing D8 here (TASK-R2-O3) — but the new assertion must fail on the unfixed controls and say so in the handoff.</scope>
</requirements>

<steps>
  1. Complete <discovery>; publish the three inventories in the handoff.
  2. Allowlist + shared asChild matrix; run on the 5 implementers; fix forwarding gaps that are contract violations (record any behaviour change as `minor`).
  3. Fallthrough declarations + spec + component-meta field.
  4. `ui` merge-order/handler contract + controlled/uncontrolled assertion; run across the 27; report failures by component (expected: the D8 controls until TASK-R2-O3 lands).
  5. Ladder; docs regeneration if component-meta gained a field.
</steps>

<validation>
  yarn test:contracts
  yarn test packages/core/src/composition packages/core/src/components/<implementers>
  yarn generate:component-meta && yarn validate:component-meta
  yarn typecheck && yarn lint
</validation>

<success_criteria>Allowlist file + shared matrix green on 5/5 implementers; every multi-root component declares its fallthrough target (count stated) with the field in component-meta; the `ui` contract spec runs against 27/27 declarers; the controlled/uncontrolled assertion exists for every v-model component and its current failures are listed by name (matching D8's seven, or fewer if TASK-R2-O3 landed).</success_criteria>

<stop_conditions>Stop and report when an asChild implementer cannot satisfy a guarantee without a public API change (state the change as a `minor` and let the owner sequence it); when two `ui`-declaring components merge classes in different orders today (pick the order that the pilots' browser evidence proves and record the other as a defect); when a fallthrough target is ambiguous by design (surface, do not guess).</stop_conditions>
```

---

### [ ] TASK-R5-O7 — Token gates and DTCG follow-ons `[!owner: Tokens Studio / Figma sync]` 🟢

_Gap: N2-T1 shipped `dist/tokens.dtcg.json` (800 tokens; 674/674 round-trip
on both cascades; `validate:tokens:dtcg`; `./dtcg` subpath) but its handoff
records: validation against the official DTCG 2025.10 JSON Schema is
out-of-band, **not a gate**; cross-tier shadowing 3 (T1-D1) undecided; **no
high-contrast token output** (doc 03 §L1 lists light/dark/high-contrast); no
unused-token or cycle report. N1-O3 G2 found 31 `--dz-spacing-N-N` references
invisible to `validate:tokens` — fixed at the sites, but **no gate extracts
`var(--dz-*)` from component source** against the emitted maps (08 package
matrix row "reference integrity"). Tokens Studio / Figma sync is an owner
decision, deferred until the docs site is live._

```xml
<role>You are a design-tokens engineer in ui/dzup-ui working on @dzup-ui/tokens and its validators. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. The TS token maps are the source; DTCG is interchange; `--dz-*` is the runtime ABI — a gate protects each boundary.</role>

<task>Close the token-gate gaps: make official-schema validation of tokens.dtcg.json an in-gate check (vendored 2025.10 schema, version-pinned); add a source-level reference-integrity gate that extracts every `var(--dz-…)` in packages/core/src and checks it against the emitted maps (first verify validate:tokens does not already do this); emit a high-contrast token output (forced-colors-aware) with the same round-trip guarantee; add unused-token and alias-cycle reports to validate:tokens; decide or prepare T1-D1 (cross-tier shadowing ×3); and write the Tokens Studio / Figma sync decision sheet for the owner.</task>

<motivation>DTCG was the first-mover window the benchmark identified; a file that validates only when someone remembers to run an out-of-band check is not a shipped interchange format. The G2 finding proved component source can reference a token no map emits without any gate noticing — the exact drift the five-layer contract exists to prevent.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `grep -n "schema" packages/tooling/src/validators/tokens-dtcg.ts | head` → validates against a vendored DTCG 2025.10 schema in-gate.
  - `grep -rn "var(--dz" packages/tooling/src/validators/tokens*.ts | head -1` → a source-reference extraction exists (or validate:tokens' own source proves it already did — record which).
  - `ls packages/tokens/dist/tokens.high-contrast.* 2>/dev/null | head -1` → high-contrast output exists.
  - `yarn validate:tokens 2>&1 | grep -i -c "unused\|cycle"` → the report sections exist (then read the exit code directly).
  - `ls docs/program-2026-09-04/reports/TASK-R5-O7-sync-decision.md` → exists.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read ../program-2026-09/reports/N2-T1-dtcg-export-handoff.md (pipeline choice, round-trip method, T1-D1, the out-of-band schema check and why it was not gated).
  2. Read validate:tokens end-to-end to confirm what it extracts today (contrast, references inside token files) and whether component-source `var(--dz-*)` extraction exists — decide build-vs-extend before writing code.
  3. Read the forced-colors matrix condition and the P5-01 high-contrast expectations to define what a high-contrast token set must express (system colour keywords vs oklch values).
  4. Read ../program-2026-09/reports/N1-O3-wcag-fixes-handoff.md G2 for the 31-reference case as the seed test.
</discovery>

<requirements>
  <schema_gate>Vendored official schema with its version in the file name; failure lists the offending token path; the gate is a validate:all link.</schema_gate>
  <reference_gate>Extraction from .vue/.ts/.css in packages/core/src; unknown token → fail with file:line; seeded with the G2 case; allowlist only for consumer-facing custom-property hooks documented in the styling cookbook.</reference_gate>
  <high_contrast>Output with the same token ids as light/dark, values chosen for forced-colors (system keywords where the ABI allows), round-trip gate extended to three cascades; no component change in this task.</high_contrast>
  <reports>Unused (emitted, never referenced by source or docs) and alias cycles, as ratchets: unused ceiling set to today's count, cycles 0.</reports>
  <decision_sheets>T1-D1 (3 shadowed cross-tier tokens: rename / document / suppress) and Tokens Studio / Figma sync (options, cost, trigger = docs site live) — recommendations, owner decides.</decision_sheets>
  <scope>No token renames without an owner pick; no changes to `--dz-*` names; no Figma work.</scope>
</requirements>

<steps>
  1. Complete <discovery>; state in the handoff whether the reference gate is new or an extension.
  2. Schema gate + reference gate (seeded failures proven); add both to validate:all.
  3. High-contrast output + round-trip extension.
  4. Unused/cycle reports with ratchets; decision sheets.
  5. Ladder; regenerate docs where token sections read the maps.
</steps>

<validation>
  yarn tokens:generate && yarn generate:tokens:dtcg
  yarn validate:tokens && yarn validate:tokens:dtcg
  yarn test packages/tokens packages/tooling/src/validators
  yarn validate:all      # read the exit code directly, never through a pipe
</validation>

<success_criteria>Official-schema validation in-gate; source reference gate exists (or proven pre-existing) with the G2 seed; high-contrast output round-trips; unused and cycle ratchets initialised; T1-D1 and sync decision sheets written; validate:all link count increased by the number of new gates and green (or red only at pre-existing links).</success_criteria>

<stop_conditions>Stop and report when the official schema rejects a construct the export needs (compatibility note, not a schema fork); when a high-contrast value cannot be expressed in the token ABI (record the ceiling); when the reference gate finds real drift beyond the G2 case (list it — fixing component sources is TASK-R5-O2's slice work unless trivial).</stop_conditions>
```

---

### [ ] TASK-R5-O8 — Metadata description debt 🟢

_Gap: the `vue-component-meta` pipeline (N2-A2, 208 records) initialised
nine downward ratchets and recorded the debt at `99b963a`: props without a
description **63 / 1,712**, slots **21 / 326**, events **106 / 359** (71 of them
`defineModel`-synthesised — decision A2-D2 pending), exposed **26 / 26**,
components without a paste-ready template **80**. N2-A3 found three components
with no description at all (`DzAsyncBoundary`, `DzErrorBoundary`,
`DzFieldArray`) and that `DzAccordion`'s union props extract nothing (A3-D3).
Every one of these is a blank cell on a docs page and in llms.txt._

```xml
<role>You are a component-API documentation engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Descriptions are authored in source (JSDoc on props, emits, slots, exposed) and extracted by the pipeline — a description typed into a generated file is drift.</role>

<task>Drive the component-meta ratchets down: author the missing prop, slot, event and exposed descriptions in source; decide A2-D2 (synthesise a standard description for defineModel-generated events vs author each) and implement it; add paste-ready templates for the 80 components lacking one (from their primary story); write the three missing component descriptions; fix the DzAccordion union-props extraction (A3-D3). Regenerate component-meta, llms.txt and the docs pages after each family and keep every ratchet monotonic.</task>

<motivation>The MCP tools, the docs site and llms.txt all read one pipeline; a prop with no description is a tool answer with no content and a docs cell an agent cannot use. The pipeline exists so this debt is measurable — pay it down where it is cheapest to be right: next to the code.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `node -e "const r=require('./packages/core/docs/component-meta.ratchets.json');console.log(r)"` (or the ratchet file N2-A2 created) → props 0, slots 0, events 0 authored-gap (after A2-D2), exposed 0, templates 0.
  - `node -e "const m=require('./packages/core/docs/component-meta.json');console.log(m.records.filter(r=>!r.description).map(r=>r.name))"` → [].
  - `node -e "const m=require('./packages/core/docs/component-meta.json');console.log(m.records.find(r=>r.name==='DzAccordion').props.length)"` → > 0.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read ../program-2026-09/reports/N2-A2-component-meta-handoff.md §12 (per-component extraction-quality stats) and §13 (what renders where), and N2-A3 §2/§3 (drift measurement, A3-D3).
  2. Produce the per-family debt table from component-meta.json before writing a word; the family with the most Tier C/D components goes first.
  3. Read how a paste-ready template is derived (N2-A2) and which 80 lack one and why (no runnable story, tag not exported, …) — 15 of those are N2-D3's typed refusals; respect them.
</discovery>

<requirements>
  <source_only>JSDoc on the declaring symbol; no edits to component-meta.json, docs pages or llms outputs by hand.</source_only>
  <a2_d2>Decision recorded in the handoff with the rule chosen; synthesised descriptions carry a marker the pipeline can count separately from authored ones.</a2_d2>
  <templates>Derived from the primary story's args; a component whose story cannot run stays a typed refusal (N2-D3 list) and is not faked.</templates>
  <quality_bar>A description says what the prop does and its default effect, one sentence; no restating the type. Sample 10 % per family in the handoff for review.</quality_bar>
  <scope>No API changes; no new stories; no prose in generated files.</scope>
</requirements>

<steps>
  1. Complete <discovery>; publish the per-family debt table.
  2. A2-D2 decision + pipeline marker; DzAccordion extraction fix (A3-D3).
  3. Family by family: descriptions → regenerate → validate → ratchet down.
  4. Templates for the 80 (minus typed refusals); three component descriptions.
  5. Regenerate llms and docs; ladder.
</steps>

<validation>
  yarn generate:component-meta && yarn validate:component-meta
  yarn generate:llms && yarn validate:llms
  yarn generate:docs-pages && yarn validate:docs-pages && yarn validate:mcp
  yarn typecheck && yarn lint
</validation>

<success_criteria>props 63 → 0, slots 21 → 0, events authored-gap → 0 under the A2-D2 rule (synthesised counted separately), exposed 26 → 0, templates 80 → the typed-refusal count only; 3 component descriptions authored; DzAccordion props extracted; llms.txt drift 0; every ratchet monotonic across the task's regenerations.</success_criteria>

<stop_conditions>Stop and report when a description cannot be written without reading behaviour the code does not implement (that is a defect — file it, do not describe the intent); when the extraction fix for DzAccordion needs a vue-component-meta upgrade (toolchain change — TASK-R5-O9's lane); when a template would need a story that does not exist (story-dod follow-up).</stop_conditions>
```

---

### [ ] TASK-R5-O9 — Toolchain migrations execution and watch-list probes 🟢

_Gap: roadmap N5-T1 asked for a Vue 3.6-RC lane, Nuxt 4 retarget, Vitest 4
browser-mode and tsdown/Vite 8 migrations, and a Vapor statement. N5-03
delivered the lane (`vue-next.yml`), `@nuxt/kit` 4.5.2 and the statement, and
wrote a **migration memo** for the rest
(`../program-2026-09/reports/N5-03-toolchain-migration-memo.md`) — Vitest 4
browser mode and tsdown/Vite 8 were **not executed** (register-0811
contradiction 17). Two watch-list probes from the 08-28 benchmark were never
run: Storybook `addon-mcp` Vue parity (P-612) and Context7 opt-in /
`context7.json` (P-613, unverified)._

```xml
<role>You are a build-and-test toolchain engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A migration is a change that leaves every gate as green as it found it; when it cannot, you refuse and record why — you never force a lane.</role>

<task>Execute the N5-03 migration memo one item at a time behind a green validate:all: Vitest 4 browser mode for the lanes the memo scopes, and tsdown (or Vite 8 library mode) for package builds — each as its own changeset, each proven by the full ladder including the 18-project Playwright matrix and the Nuxt tarball fixtures. Then run two bounded probes and record the result: Storybook addon-mcp Vue parity, and whether the docs site's per-page `.md` endpoints are Context7-indexable (context7.json present and valid).</task>

<motivation>The memo exists because N5-03 measured the cost and stopped short of paying it; unexecuted migrations age into forced ones. Both probes are watch items the benchmark marked as table stakes for agent-facing docs; a fifteen-minute probe settles whether they are a task or a refusal.</motivation>

<done_check>
  Run from ui/dzup-ui:
  - `grep -n "browser" vitest.config.* packages/core/vitest.config.* 2>/dev/null | head -1` → Vitest 4 browser mode configured for the memo's lanes, or the memo item is marked "refused" with a dated reason in docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md.
  - `grep -rn "tsdown\|\"vite\": \"^8" package.json packages/*/package.json | head -1` → migrated, or refused with reason.
  - `ls .changeset/*toolchain* .changeset/*vitest* .changeset/*tsdown* 2>/dev/null | head -1` → a changeset per executed migration.
  - `grep -n "addon-mcp\|context7" docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md` → both probes recorded with a verdict.
  If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
</done_check>

<discovery>
  1. Read the migration memo in full: scope per item, measured risks, the order it recommends, and what it says must stay unchanged (e.g. the perf harness config hash, the matrix project names).
  2. Read the current vitest configs (projects, environments, the security and SSR lanes) and the build pipeline (validate:dts, validate:externals, validate:bundle, validate:tree-shake) — these are the gates a build migration must keep byte-comparable.
  3. Record the baseline: yarn validate:all exit and first failing link, yarn test counts, test:e2e matrix totals, bundle sizes from report:component-sizes — before any migration.
</discovery>

<requirements>
  <one_at_a_time>One migration per changeset; the full ladder between them; the baseline numbers re-measured and compared after each; a regression in any gate reverts the migration and records a refusal.</one_at_a_time>
  <byte_comparability>Bundle outputs compared (validate:bundle, report:component-sizes) before/after; declaration output compared (validate:dts); tree-shake report identical.</byte_comparability>
  <probes>addon-mcp: install in apps/storybook on a branch of the config only, run the MCP surface against three components, compare to @dzup-ui/mcp's answers, record parity/gaps, uninstall. Context7: check for context7.json, validate it against Context7's documented shape, record whether the .md endpoints are discoverable; do not submit anything to any index.</probes>
  <scope>No Node floor change (ADR-18 — TASK-R0-O2); no Nuxt version change; no CI workflow dispatch.</scope>
</requirements>

<steps>
  1. Complete <discovery>; publish the baseline table.
  2. Vitest 4 browser mode for the memo's lanes; ladder; changeset or refusal.
  3. tsdown / Vite 8 for package builds; byte comparison; ladder; changeset or refusal.
  4. Both probes; verdicts in the handoff.
  5. Final baseline table (before/after per gate).
</steps>

<validation>
  yarn typecheck && yarn lint && yarn test
  yarn build && yarn validate:dts && yarn validate:externals && yarn validate:bundle && yarn validate:tree-shake && yarn report:component-sizes
  yarn test:e2e && yarn test:nuxt-fixtures && yarn test:ssr
  yarn validate:all      # read the exit code directly, never through a pipe
</validation>

<success_criteria>Each memo item executed (changeset, ladder green, byte-comparable outputs) or refused with a dated, measured reason; no gate less green than the baseline; both probes recorded with a verdict and a recommendation (task / refusal / watch); the memo updated with a status column.</success_criteria>

<stop_conditions>Stop the migration (and record a refusal) when it breaks any of the 18 matrix projects, changes bundle bytes without a benign explanation, or alters the perf harness's config hash; stop the task when a probe would require publishing or submitting anything externally.</stop_conditions>
```
