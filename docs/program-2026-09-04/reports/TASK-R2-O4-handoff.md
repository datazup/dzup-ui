# TASK-R2-O4 — URL policy for the six navigation sinks, and the CSP posture

> Handoff for [`../evidence-completion-tasks.md`](../evidence-completion-tasks.md)
> §TASK-R2-O4. Program [`../README.md`](../README.md); protocol §4; conventions §5.
>
> **Repo / commit observed:** `ui/dzup-ui` `main` @ **`2d51eec`**, worktree
> **dirty** with TASK-R2-O3's ~203 uncommitted paths, which were preserved
> untouched. Every number below is bound to `2d51eec` + that dirty tree and is
> **locally qualified** — not CI, not release, not production evidence.
> **Started / ended:** 2026-09-18. Nothing committed, pushed, dispatched or
> published.
>
> **Baseline corrections carried forward** (README §2 is stale in three places
> R2-O3 already documented and this run re-measured): `yarn test` carries **3**
> inherited failures, not 2; `validate:capability-matrix` has **1** violation,
> not 12 stale cells; `packages/tooling` `tsc` has **12** errors, not 7.

---

## 0. `<done_check>` result — 0 of 4 passed, task run in full

| # | Check | Result at `2d51eec` |
|---|---|---|
| 1 | `grep -rln 'urlPolicy\|isSafeUrl\|allowedSchemes' packages/core/src/providers packages/contracts/src \| head -1` | **empty** — no provider-level policy |
| 2 | `node -e "…coverage.json.deviations ?? 'inspect'"` | **`inspect`** — `coverage.json` has no `deviations` key at all; the register is `security-deviations.json` and read **54** |
| 3 | `grep -n 'securityBoundary' packages/contracts/src/*.ts \| grep -c '\[\]'` | **0** — single-valued |
| 4 | `ls e2e/ \| grep -i csp` | **empty** — no lane |

Protocol §4.2 "none pass" → run the task.

**Check 2 is written against a key that does not exist.** `coverage.json` is the
class-level *artifact manifest* (which document covers which component); the
deviation count lives in `security-deviations.json` as `ceiling` plus the
`(component, sink, fixture)` triples the suite counts. The fallback text in the
check (`'inspect'`) is what it prints, so the check is not *wrong*, but a fresh
agent reading it as a number would look in the wrong file. Recorded as **D108**.

---

## 1. Discovery (recorded before any edit)

### 1.1 The finding, re-read rather than assumed

`../program-2026-09/reports/N1-O5-security-corpus-handoff.md` §5 F-U1 and
`packages/core/security/url-boundary.threat-model.md` §2a. Both say the same
thing and both were confirmed by grep at `2d51eec`: **nothing in
`packages/core/src` inspected a URL scheme.** All nine `url-scheme` fixtures
reached the rendered `href` verbatim on all six navigation-sink components —
**54 measurements**, `S1`–`S12`, 42 high / 12 low, every entry
`publicBehaviourChange: true`.

The four adjacent findings the prompt names were read in the same pass: **U3**
(`securityBoundary` single-valued, so `DzQRCode`'s `icon` sink is invisible),
**U4** (three declarers' sinks live in compound sub-parts that are not matrix
rows), **F-C1** (78 static `style=` files, 38 `:style` files), **O5-5** (no
browser has verified any CSP claim).

### 1.2 The two seams this had to plug into, not duplicate

- **`TASK-R3-O2`** landed the provider seam pattern (`DZ_SANITIZER_KEY`, a
  framework-free `packages/core/src/security/*.ts` module, a reader on the
  barrel, writers off it, a per-field fold in `DzProvider`). The URL policy is
  built to the same shape, file for file, so there is one way to add a provider
  concern and not two.
- **`TASK-R3-O4`** owns the corpus format (schema now 1.1.0, 34 fixtures, 15
  declarers, `fixturesForSink` / `payloadOf`). **No fixture, category, sink or
  outcome was added or changed.** The 54 measurements that found the gap are the
  regression suite: the same assertions, with the deviation register emptied so
  they assert the *required* outcome instead of a pinned defect.

### 1.3 The sinks, inventoried from source

| Component | The sink | Where the `href` actually is |
|---|---|---|
| `DzButton` | `href` prop (and the `to`-as-string fallback) | `DzButton.vue` template, `:href="isAnchor && …"` |
| `DzAnchor` | `items[].href` | `h('a', { href: item.href })` in the recursive renderer |
| `DzBreadcrumb` | **`DzBreadcrumbItem`**'s `href` | sub-part, `:href="href"` |
| `DzMenu` | **`DzMenuItem`**'s `href` | sub-part, `v-if="href"` / `:href="href"` |
| `DzSidebar` | **`DzSidebarItem`**'s `href` | sub-part, `linkAttrs.href = props.href` |
| `DzMegaMenu` | `items[].href` and `groups[].items[].href` | **four** template sites (collapsed stack ×2, menubar ×2) |

N1-O5 bound only `DzMegaMenu`'s top-level site and asserted the other three "by
inspection". All four go through one pair of helpers now.

### 1.4 Decision inputs, with recommendations (`<steps>` 1)

The prompt allows proceeding on the recommendation if no answer arrives. **No
owner answer arrived, so all three were taken as recommended**, with one
deliberate divergence, stated here rather than buried:

| # | Decision | Options | Taken |
|---|---|---|---|
| 1 | **Scheme allowlist** | (a) `http`, `https`, `mailto`, `tel`, relative, fragment — the prompt's list · (b) the same **plus `sms`** — the list `url-boundary.threat-model.md` §2a and N1-O5 F-U1 both recommend | **(b)**. The prompt's Step 0 omits `sms`; both prior *design* documents include it. `sms:` cannot execute in a document, is an ordinary contents of a mobile navigation menu, and **is not in any corpus fixture**, so the choice moves no measurement either way. Divergence flagged as **D104** with (a) as the one-line reversal. |
| 2 | **Rejection shape** | (a) omit `href`, render as non-link · (b) rewrite to `javascript:void(0)` | **(a)**, as recommended by the prompt and by the threat model. A rewritten URL produces a control that looks operable and is not — a worse failure than refusing to draw a link, and one nothing except a click can see. |
| 3 | **Escape hatch** | (a) provider-level `urlPolicy` with an explicit allow function · (b) a per-instance boolean | **(a)**, as recommended. (b) re-opens the hole for exactly the consumers most likely to reach for it, one call site at a time, with no central record of where. |

---

## 2. Implemented files and API effect

### 2.1 `@dzup-ui/contracts` (minor)

| File | Change |
|---|---|
| `src/provider.types.ts` | **+ URL-policy section**: `DzUrlSink` (`navigation` \| `subresource`), `DzUrlPolicyContext`, `DzUrlPolicy`, `DzUrlPolicyOptions`, `DZ_ALLOWED_URL_SCHEMES` (runtime). **+ `DZ_URL_POLICY_KEY`**, typed `InjectionKey<DzUrlPolicy>` with **no `null` arm** — unlike `DZ_SANITIZER_KEY`, and §4.2 says why. **+ `DZ_PROVIDER_DEFAULTS.urlPolicy`**. |
| `src/quality-tiers.ts` | `ComponentQuality.securityBoundary` becomes **`SecurityBoundarySet`** (`readonly SecurityBoundary[]`). **+ `normaliseBoundaries`, `formatBoundaries`, `crossesBoundary`, `BOUNDARY_COVERS_COMPOUND_PARTS`.** `evidenceFor` and `evidenceOrigin` take a value *or* a set; `evidenceFor` takes the **union** across the set and `evidenceOrigin` names **every** boundary that asks for a kind. |
| `src/index.ts` | Exports the six URL-policy names and the four quality-tier ones. |

**API effect:** eleven new public names; one published type changes shape
(`ComponentQuality.securityBoundary`). Called out in the changeset rather than
buried.

### 2.2 `@dzup-ui/core` (minor)

| File | Change |
|---|---|
| `src/security/url-policy.ts` **(new)** | Framework-free, no `vue`, no `window`/`document` on any path — the same rule `sanitize.ts` follows. `effectiveUrlScheme` (WHATWG §4.4, all three steps), `isAllowedUrl`, `DZ_DEFAULT_URL_POLICY` (frozen), `resolveUrlPolicy`, `applyUrlPolicy`, `DzUrlDecision`, `DzResolvedUrlPolicy`, `resetUrlPolicyWarnings` (test hook). |
| `src/composables/provider/useDzUrlPolicy.ts` **(new)** | `useDzUrlPolicy` (barrel) · `useDzUrlGuard` (component-facing, **off** the barrel, on the `useDzMotionAttribute` precedent) · `createDzUrlPolicy` / `provideDzUrlPolicy` (writers, off the barrel). |
| `src/composables/provider/index.ts` | + `useDzUrlPolicy`. Eleven concerns → twelve. |
| `src/providers/DzProvider.types.ts` · `DzProvider.vue` | `urlPolicy?: DzUrlPolicyOptions`; folded over the ancestor, provided **only when the prop is defined** (A1 preserved). |
| `components/buttons/DzButton.vue` | `useDzUrlGuard('DzButton')`; `computedTag` returns `'button'` for a refused `href`; `:href` reads the decision; `data-state` gains `url-rejected` at highest precedence. |
| `components/navigation/DzAnchor.vue` | Guard applied in the recursive renderer; refused items render the same `<a>` **with no `href`** and a `preventDefault`-only click handler. |
| `components/navigation/DzBreadcrumbItem.vue` · `DzMenuItem.vue` · `DzSidebarItem.vue` | Guard applied; a refused URL takes the component's own existing non-link branch. |
| `components/navigation/DzMegaMenu.vue` | `safeHref` / `urlRejected` helpers applied at **all four** sites; `onTriggerClick` no longer treats a refused item as a link that will navigate by itself. |
| six `*.anatomy.ts` | `url-rejected` added to `states` (ADR-19 §4; `validate:anatomy-parts` has an `undeclared-state` rule). |
| `security/boundary-bindings.ts` | `encodedIcon` re-documented as a **declared** sink; `URL_BOUNDARY_COMPONENTS` gains `DzQRCode`. |
| `security/security-deviations.json` | **12 entries / 54 triples → 0 entries / ceiling 0**, with a `history` block recording what was closed, by what, and how. |
| `security/coverage.json` | `url-policy` covers 13 → **14** (+ `DzQRCode`). |
| `security/url-boundary.threat-model.md` | U1 and U3 marked **CLOSED** with what shipped; §4 and §5 rewritten. |
| `security/inline-style-inventory.json` **(new)** | Generated. 81 static sites / 78 files · 52 bound sites / 38 files, each with a disposition. |

**API effect:** one new public composable; one new provider prop; **no component
prop, emit, slot or variant taxonomy changed**. The behaviour change is the
point of the packet and is described in the changeset.

### 2.3 `@dzup-ui/tooling` (private)

`src/security/inline-style-inventory.ts` **(new)** — the scanner behind the
artifact. `quality/component-tiers.ts` (`boundary` accepts a set; `DzQRCode` →
`['url', 'payload']`), `quality/generate-quality-matrix.ts`,
`quality/capability-matrix.ts`, `quality/generate-capability-matrix.ts`,
`quality/emit-capability-data.ts`, `validators/quality-tiers.ts` (four new set
invariants), `meta/component-meta.ts`, `meta/generate-component-meta.ts`,
`docs/evidence.ts` (+ `boundaryLabel`), `docs/evidence-pages.ts`,
`docs/contract-sections.ts`, `packages/mcp/src/registry.ts`,
`apps/storybook/stories/_blocks/CapabilityMatrix.ts` — all follow the set shape.

### 2.4 Specs added

| File | Added |
|---|---|
| `packages/core/src/security/url-policy.spec.ts` **(new)** | **59** — normalization on all three WHATWG steps · all four `javascript:` evasions (with the `startsWith` check asserted to catch only one of them) · the allowlist refusing a scheme nobody has invented · the provider fold, including a nested list keeping an ancestor's `allow` · rejection is omission with neither `#` nor `javascript:void(0)` substituted · the dev warning firing **once** across 500 hostile rows · **agreement with the corpus oracle on every `url-scheme` fixture** |
| `packages/core/security/inline-style-inventory.spec.ts` **(new)** | **7** — freshness site-for-site, F-C1's two counts re-derived, per-disposition ceilings, and the classifier's refusal to claim a disposition it cannot see |
| `packages/core/src/composables/provider/provider.spec.ts` | **+5** (45 → 50) |
| `packages/core/src/providers/DzProvider.spec.ts` | **+6** (35 → 41) |
| `packages/core/src/components/buttons/DzButton.contract.spec.ts` | the `data-state` enumeration gains the `url-rejected` case |
| `e2e/csp/csp.spec.ts` **(new)** | **2 × 3 engines** — see §4 |

### 2.5 The CSP lane (new)

`e2e/csp/` — `fixture/index.html` · `fixture/src/main.ts` · `build-fixture.ts` ·
`serve-csp.ts` · `playwright.csp.config.ts` · `csp.spec.ts`. Scripts:
`yarn test:e2e:csp`, `yarn csp:inline-style-inventory`.

Its own Playwright config on the `e2e/styling` precedent: the shared config's
`webServer` builds Storybook before any project runs, and this lane needs a
server of its own that sends a real header. One Vite build is served **twice**
from one Node server — `/open/` with no policy, `/strict/` under
`default-src 'self'; script-src 'self' 'nonce-…'; style-src 'self' 'nonce-…';
style-src-attr 'none'; object-src 'none'; base-uri 'none'` and **no
`'unsafe-inline'` anywhere**. The nonce is per request and written into both the
header and `<html data-dz-nonce>`, so the value the provider forwards and the
value the browser accepts cannot drift.

### 2.6 Documents

`docs/adr/ADR-20-provider-contract.md` — **amendment A7** (the concern, the four
properties, the asymmetry with A6, what it does *not* claim), plus four rows in
the validation-hooks table. **Status untouched — still `Proposed`.**
`.changeset/six-navigation-components-no-longer-render-a-javascript-url.md` —
`@dzup-ui/contracts` minor + `@dzup-ui/core` minor, with the migration note.

---

## 3. Focused validation output

Every command invoked **by module path**, never through `npx` (memory: `npx` in
this workspace fetches dependency-confusion placeholders), and every exit code
read directly, never through a pipe.

| Command | Result |
|---|---|
| `vitest run packages/core/security` | **5 files · 337 passed · 0 failed** — the corpus, now asserting `rejected` with an **empty** deviation register |
| `vitest run packages/core/src/security/url-policy.spec.ts` | **59 passed** |
| `vitest run packages/core/security/inline-style-inventory.spec.ts` | **7 passed** |
| `vitest run` over `core/security`, `core/src/security`, `core/src/components/{navigation,buttons}`, `core/src/providers`, `core/src/composables/provider`, `core/tests`, `contracts`, `testing` | **83 files · 1 769 passed · 0 failed · 2 skipped** |
| `vitest run packages/tooling packages/mcp` | **71 files · 1 319 passed · 3 failed** — the three inherited failures, no others |
| `tsx …/quality/generate-quality-matrix.ts` | 144 components — A55 B67 C21 D1 |
| `tsx …/quality/generate-capability-matrix.ts` | 144 rows, **1 662** cells (was 1 661; `DzQRCode/url-policy` is the new one) |
| `tsx …/validators/quality-tiers.ts` | **exit 0** — matrix fresh |
| `tsx …/validators/capability-matrix.ts` | **exit 1** — **1** violation, the pre-existing `DzFileUpload` Tier-D `browser-matrix` gap (R2-O1's) |
| `vue-tsc --noEmit -p packages/core/tsconfig.json` | **exit 0** |
| `tsc --noEmit -p packages/contracts/tsconfig.json` | **exit 0** |
| `eslint packages/ apps/ --max-warnings 0` | **exit 0** |
| `eslint e2e/csp` | **exit 0** |
| `yarn validate:release-policy` | **exit 0** |
| `playwright test --config=e2e/csp/playwright.csp.config.ts` | **exit 0 — 6 passed** (chromium · firefox · webkit) |

Regeneration ran in the order `<generated_authority>` fixes — ownership →
quality → capability → component-meta → llms → docs-pages → playground seeds —
and each downstream validator was re-run green.

---

## 4. The CSP lane found something, and it narrows F-C1

The lane was written expecting to *confirm* finding F-C1 in a browser:
`DzButton` still carries `style="contain: layout style"`, so under
`style-src-attr 'none'` its containment should disappear. **It did not.** The
first run failed on that expectation, which is the lane doing its job.

The cause, and it is a real correction to the finding:

- A `style` **attribute in served markup** is applied by the HTML parser, which
  is the path `style-src-attr` governs. The fixture now carries a control
  element that does exactly that, and it **is** dropped in all three engines.
- Vue compiles a static template `style` into a render-time `patchStyle`, which
  writes through **CSSOM** (`el.style.setProperty`). **CSP does not govern
  CSSOM.** So a client-rendered dzup-ui page is unaffected.

**Therefore F-C1's 78 + 38 are not 116 client-side CSP failures.** They are an
**SSR** exposure: the same components emit a literal `style=` in server-rendered
markup, the parser applies it, and a strict policy drops it — losing exactly the
containment the oversized corpus fixtures rely on, on the first paint, before
hydration. The lane pins this in both directions: the control proves the
directive is enforced, and the component measurement fails if the exposure ever
changes shape.

The lane's other three results:

1. `DzThemeProvider` + `DzFileUpload` render **identically** strict vs open
   across 18 computed properties. This is the assertion `<csp_lane>` asked for.
2. No un-nonced `<style>` element exists under the policy, and `--dz-primary`
   resolves to the same value in both runs.
3. The URL policy holds in a real engine: `href="javascript:alert(1)"` renders a
   `<button>` with `data-state="url-rejected"`, no `href`, and **no attribute
   anywhere in the document carries the scheme**.

**Style inventory, dispositioned** (`packages/core/security/inline-style-inventory.json`,
gated by a both-direction spec):

| Disposition | Sites | Remedy |
|---|---|---|
| `recipe-movable` | **78** | move into `.variants.ts` as `[contain:layout_style]`, exactly as N1-O5 did for `DzFileUpload` |
| `layout-static` | **3** | same remedy; separated because they are not containment |
| `required-dynamic` | **19** | a real CSS value from runtime state (`clip-path` percentage, measured offsets) — cannot become a class at any number of variants |
| `unclassified-binding` | **33** | `:style="someComputed"` — the scanner cannot see the properties, and saying `required-dynamic` would claim more than was measured |
| `custom-property` | **0** | — |

Totals re-derive F-C1's own numbers independently: **78 static files, 38 bound
files**, which is what makes this a classification *of that finding* rather than
a second, differently-scoped count.

---

## 5. Aggregate qualification

### 5.1 `yarn validate:all` — **exit 1**, at the same link as at `2d51eec`

Stops at **`validate:capability-matrix`** (link 19 of 43) with **1** violation:
`DzFileUpload` is Tier D and its `browser-matrix` cell is unrun. That is
**exactly** the pre-existing red R2-O3 left, unchanged in kind and in number, and
it belongs to **TASK-R2-O1**. Links 1–18 — including `typecheck`, `lint`,
`validate:security-corpus`, `validate:anatomy-parts`, `validate:quality-tiers`
and `validate:story-dod` — passed over the whole tree.

**All 24 links after it were run individually and every one exited 0:**
visual-baselines · tokens · tokens:refs · tokens:dtcg · tokens:schema · exports ·
ownership · mcp · component-meta · provider-defaults · llms · docs-pages ·
playground-parity · package-names · doc-snippets · engines · adr-references ·
readme-facts · externals · dts · changelog · release-policy · peers · licenses.

### 5.2 `yarn test` — **exit 1**, 3 failures, **all inherited**

`3 failed | 10 139 passed | 3 skipped | 1 todo (10 146)` across **539** files.
The three are the ones R2-O3 measured and documented at `2d51eec`:

1. `packages/tooling/src/resolution/dzup-resolution.spec.ts` — inline snapshot
   missing `@dzup-ui/tokens/css/high-contrast`, an export added between
   `99b963a` and `2d51eec`. **Not mine**: my diff adds no export subpath, and the
   snapshot diff is that one line.
2. `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts` — six
   landing colour fallbacks. Belongs to the landing app.
3. `packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen` —
   N1-O1's success breaking its own unit test's fixture.

**Movement: 10 069 → 10 146 tests (+77), 537 → 539 files (+2)** — which is
exactly this packet's 59 + 7 + 5 + 6.

### 5.3 `yarn storybook:test` — **1 451 / 1 453**, identical to R2-O3's

`2 failed | 1 451 passed (1 453)` across 169 files. The two are
`DzCombobox.stories.ts` and `DzMultiSelect.stories.ts`,
*Async Options: loading → ready → error → retry* — **the same two, by name**,
that R2-O3 measured at `2d51eec` and attributed to R3-O3. Run deliberately
rather than reasoned about: a policy that changes what six navigation components
render is exactly the change a 1 453-assertion story lane exists to catch, and
"no story uses a hostile URL" is an argument, not evidence.

### 5.4 Still red, and whose it is

| Lane | State | Whose |
|---|---|---|
| `validate:capability-matrix` | 1 violation (`DzFileUpload` Tier-D `browser-matrix`) | **TASK-R2-O1** — pre-existing |
| `yarn test` | 3 failures | **pre-existing**, §5.2 |
| `yarn storybook:test` | 2 failures | **pre-existing**, R3-O3 |
| `packages/tooling` `tsc` | **12** errors | **pre-existing.** Measured 17 mid-run; **5 were mine**, all the same `securityBoundary` string→array shape in three test fixtures, and all five are fixed. None of the remaining 12 is in a file this diff touches. |
| `eslint e2e/` | **147** errors | **pre-existing.** README §2's "9" counted `.ts` only; 138 come from the generated `e2e/at-matrix/*.md`. My five new files' five errors were fixed — `eslint e2e/csp` is **exit 0**. |
| `test-results/matrix-report.json` | **absent** | pre-existing at `2d51eec` — the capability matrix already recorded `browser-matrix` as an unavailable input at `99b963a`. Every browser-matrix cell is `unrun` for that reason, **not** because evidence failed. |

**The aggregate is not green and is not claimed to be.** The highest rung this
run reaches is *aggregate-qualified with one pre-existing red*, plus a genuine
**browser-qualified** rung for the CSP lane and the URL policy in three engines
— which is one rung further than any previous security packet in this repo.

---

## 6. Ratchet movements (old → new)

| Ratchet | At `2d51eec` (R2-O3 dirty) | Now | Direction |
|---|---|---|---|
| **security-corpus deviations (triples)** | **54** (ceiling 54) | **0** (ceiling **0**) | ✅ **closed — the headline** |
| security deviations, high severity | 42 | **0** | ✅ |
| security deviations, low severity | 12 | **0** | ✅ |
| Navigation sinks with a URL policy | **0 / 6** | **6 / 6** | ✅ |
| `DzMegaMenu` `href` sites under the policy | 0 / 4 (1 bound, 3 by inspection) | **4 / 4, all bound** | ✅ |
| `securityBoundary` expressible as a set | no | **yes** | ✅ (U3 closed) |
| Components with an undeclarable sink | 1 (`DzQRCode.icon`) | **0** | ✅ |
| capability-matrix cells | 1 661 | **1 662** | +1, `DzQRCode/url-policy` |
| capability-matrix `url-policy` cells `present` | 13 | **14** | ✅ |
| `validate:capability-matrix` violations | 1 | **1** | unchanged (pre-existing) |
| capability-matrix stale cells | 22 | **22** | unchanged |
| ownership manifest entries | 1 337 | **1 338** | +1, `useDzUrlPolicy` |
| ownership `composable` | 40 | **41** | +1, intended |
| ownership `unclassified` | **29** | **29** | **held** — the new constants live in contracts, which the manifest does not cover |
| component-meta `propsWithoutDescription` | 0 | **0** | held |
| provider concerns with a contract | 11 | **12** | +1 |
| anatomy declared states (six components) | — | **+1 each** (`url-rejected`) | declared, not implicit |
| `yarn test` | 10 069 (537 files) | **10 146** (539 files) | ↑ +77 |
| `storybook:test` | 1 451 / 1 453 | **1 451 / 1 453** | unchanged — no story regressed |
| Browser-verified CSP claims | **0** | **6** (2 × 3 engines) | ✅ O5-5 closed |
| Inline-style sites with a disposition | 0 of 133 | **133 of 133** | ✅ F-C1 measured and classified |
| ADRs Accepted (18/19/20) | 0 / 3 | **0 / 3** | untouched — acceptance is TASK-R0-O2 |
| pending changesets | 21 | **22** | +1 |

**No ceiling was raised and no gate was weakened.** The deviation register's
ceiling went **down**, the corpus fixtures were not touched, and every
disposition in the new inventory is a ceiling that fails when it rises.

---

## 7. Owner decisions raised (numbered from D104 — D1–D103 taken)

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **D104** 🟠 | **`sms:` is in the default allowlist, and the prompt's Step 0 list does not name it.** The threat model §2a and N1-O5 F-U1 both recommend it; the task prompt's summary line omits it. No corpus fixture covers `sms:`, so the choice moves no measurement. | (a) **keep `sms` — taken**: it cannot execute in a document, it is ordinary contents of a mobile navigation menu, and refusing it makes the policy the thing consumers route around · (b) drop it — a one-line change to `DZ_ALLOWED_URL_SCHEMES` plus one spec row | **(a)**, as shipped. Raised because it is a divergence from the prompt's literal text, not because it is close. |
| **D105** 🔴 | **Finding F-C1 is an SSR defect, not a client-side one** (§4). A strict `style-src-attr` drops a `style` attribute in server-rendered markup and does **not** touch the identical declaration written by a client render, because Vue writes through CSSOM. So 78 components ship a first paint, pre-hydration, with their containment removed for any host running a strict CSP — and every existing measurement of this finding was client-side. | (a) sweep the 78 `recipe-movable` sites into `tv()` recipes, which closes it for both paths — mechanical, one component at a time, and the inventory is the worklist · (b) publish `'unsafe-hashes'` in the consumer CSP recipe, which re-opens what the policy was for · (c) accept the SSR degradation and document it | **(a)**, as a task of its own with the inventory as its ledger. **Not done here**: 78 components is a repo-wide change nobody reviewed, which is the reason N1-O5 left it, and the reason has not changed. The 19 `required-dynamic` sites need a different answer and should not be bundled with it. |
| **D106** 🟠 | **`ComponentQuality.securityBoundary` changed shape** — `string` → `string[]` in `quality-matrix.json`, `capability-matrix.json`, `component-meta.json` and the MCP registry type. It is a published type and a generated-artifact schema. | (a) **ship under the same `minor` — taken**; it is inseparable from the fix it enables · (b) add a parallel `securityBoundaries` field and deprecate the old one — two names for one fact, and a generated artifact is the worst place to keep them in step | **(a)**. The shape change caught a live bug in the process: `url-boundary.malicious-corpus.spec.ts` filtered `securityBoundary !== 'none'`, which became true for **all 144** rows the moment the field was an array, and the gate passed by matching everything. Fixed and commented at the assertion. |
| **D107** 🟠 | **The parent-covers rule is written but not enforced by a validator.** `BOUNDARY_COVERS_COMPOUND_PARTS` in `packages/contracts/src/quality-tiers.ts` records the rule (a parent's declared boundary covers sinks carried by its own compound sub-parts, and `boundary-bindings.ts` names which part carries which). Nothing fails if a new sub-part grows an `href` and no binding is added. | (a) extend `validate:quality-tiers` to cross-check `boundary-bindings.ts` against the `compound-part` entries in the ownership manifest · (b) leave it as a documented rule · (c) make the 65 sub-parts matrix rows after all | **(a)**, in R1-O1 or R5-O7. **(c) is refused with a reason**: a row owes its tier's whole evidence set, `DzMenuItem` has no story of its own by design, and 65 rows would arrive owing ~400 cells that are `unrun` because the evidence is *unwritable* rather than unwritten — which is precisely the distinction this matrix exists to keep legible. |
| **D108** 🟢 | **This task's `<done_check>` 2 reads a key that does not exist** (`coverage.json.deviations`). The deviation count lives in `security-deviations.json`. The check prints its fallback rather than failing, so it is not wrong, but it points a fresh agent at the wrong file. | (a) correct the prompt to `node -e "console.log(require('./packages/core/security/security-deviations.json').ceiling)"` · (b) leave it | **(a)**. Same class as D2's "two checks that can never pass". |
| — | **O5-6 is still open and is not mine to take.** N1-O5 asked the owner to confirm `packages/core/security/coverage.json` as a capability-matrix generator input (versus 13 stub threat-model documents whose only content is a pointer). This packet **added a component to it** (`DzQRCode` under `url-policy`), so it now depends on the answer in one more place. | (a) confirm the manifest, as N1-O5 recommends · (b) the stub documents | **(a)**, and it wants an explicit answer now rather than another packet's worth of accumulation. |

---

## 8. Ranked next packet

1. **TASK-R2-O1** — the one red link left in `validate:all` is its
   (`DzFileUpload` Tier-D `browser-matrix`), and `test-results/matrix-report.json`
   is absent, so the browser evidence this packet could *not* supply is exactly
   what it owns. Note R2-O3's D102: re-measure, do not take README §2's figures.
2. **D105's `recipe-movable` sweep** — 78 sites, one mechanical remedy, a
   generated worklist, a both-direction ceiling, and now a browser lane that
   proves when it is done. It is the largest remaining security-shaped item in
   Core and it is no longer a judgement call.
3. **TASK-R0-O2** — ADR-20 now carries **two** amendments with shipped code and
   validated hooks behind them (A6, A7). Acceptance has one more item and one
   fewer excuse.
4. **An SSR pass over the URL corpus.** Every assertion in
   `packages/core/security/` is client-side. E6 proved a defect class only SSR
   emits, §4 proves another, and the policy's *decision* is framework-free
   precisely so an SSR pass is cheap.
5. **D107's binding-table gate** — small, and it stops the next audit
   re-deriving U4.
6. **Pro:** the seam is exported and stable. Pro can inject `DZ_URL_POLICY_KEY`
   for a read-only verdict, or install one through the host's `DzProvider`
   without importing Core's runtime. Pro's own navigation sinks are outside this
   repo's authority and were not read.

---

## 9. What this handoff refuses to imply

- **That the tree is green.** `validate:all` exits 1 at the same link it did
  before this packet, `yarn test` carries 3 inherited failures and
  `storybook:test` 2. All are named, attributed and unchanged.
- **That the subresource half is now guarded.** It is not, deliberately. Eight
  `<img src>` sinks still pass their URL through and still measure `inert`;
  filtering the origins an avatar may load from is the host's `img-src`
  directive, and a component that tried would be useless (finding U2).
- **That F-C1 is closed.** It is *measured, classified and browser-confirmed* —
  and narrowed to an SSR exposure. 78 components still ship the attribute.
- **That the numbers are release evidence.** One dirty worktree, one machine,
  one afternoon. The CSP lane is browser-qualified; everything else is
  locally qualified. D5 still applies.
- **That ADR-20 is accepted.** No status was flipped. A7 is text an owner can
  accept or reject.
