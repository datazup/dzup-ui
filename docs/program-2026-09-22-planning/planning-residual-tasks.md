# dzup-ui — Planning-ledger residual tasks (PL)

> Part of the [Planning-Ledger Program 2026-09-22](./README.md). Every prompt
> assumes the `<repo_conventions>` block in
> [`../program-2026-09-04/README.md` §5](../program-2026-09-04/README.md#5-how-these-tasks-are-written)
> plus the `<program_conventions>` delta in [README §5](./README.md#5-how-these-tasks-are-written),
> and the check-first protocol in [README §4](./README.md#4-how-to-run-a-task--the-check-first-protocol).
>
> **Sources:** `DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md`
> (§"Update 2026-08-25" — the duplicates table and owner decisions 1–4),
> `NEXT_SESSION_PROMPT_2026-08-25-dzup-ui-oss-recovery-freeze.md` §7 (what
> the freeze did not establish), `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-oss-coverage-and-sk1.md`
> (the accepted Lighthouse samples), `docs/resolution-external-consumers.md`
> (TASK-SK-1's proposal for external owners), and — as a pointer only — the
> Pro programme's recorded request for the same tooling seam (its ledger's
> "Tooling seam" row). Every fact in a `_Gap:_` line was measured on 2026-09-22 at
> `589be13`; treat it as a hypothesis and re-measure first.
>
> **Check first.** If a task's `<done_check>` passes and a second route
> confirms it, record `[x] found-done` and move to the next task. If the work
> is already recorded in a `program-2026-09-04` handoff, cite it and move on.

---

### [ ] TASK-PL-O1 — Workspace dependency-graph hygiene: Vite 7 / plugin-vue 6 for the apps, one Vue copy, and a guard 🟠

_Gap: the 08-08 plan's 2026-08-25 update recorded "the Vite 6 / Vite 7 split
inside `ui/dzup-ui`" as owner decision 3 and left it. On 2026-09-22 at
`589be13` it is unchanged: `apps/landing`, `apps/sandbox` and
`apps/storybook` declare `vite ^6.1.0` + `@vitejs/plugin-vue ^5.2.0` and
resolve `6.4.1` / `5.2.4`; the root and every package declare `^7` / `^6` and
resolve `7.3.5` / `6.0.7`. `vue` resolves to **three** versions — `3.5.31`
for every workspace, `3.5.39` through `@floating-ui/vue@1.1.11` (a direct
dependency of `@dzup-ui/core`) and `@nuxt/devtools`, `3.5.42` through
`@nuxt/nitro-server`. SK-1's `dedupe` did its job for `reka-ui` (one copy,
`2.9.2`) and the overlay-portals specs guard the symptom, but nothing guards
the graph: a second Vue major in the app lanes would pass every gate until an
overlay broke. TASK-R1-O6 (D174–D178) covers `lucide`, the Node floor and
`apps/sandbox`, not Vite. Storybook is `^10.5.1`, which supports Vite 7, so
the app pins look like inertia rather than a constraint — verify._

```xml
<role>You are a build-tooling engineer in ui/dzup-ui. Follow the repo_conventions of docs/program-2026-09-04/README.md §5 and the program_conventions of docs/program-2026-09-22-planning/README.md §5. You change dependency graphs only with evidence from `yarn why`, never from a README.</role>

<task>Bring the three apps onto the workspace's Vite 7 / @vitejs/plugin-vue 6 majors (or record the exact blocker per app), collapse the Vue copies the library graph controls to one, and add a guard spec in packages/tooling that fails when any workspace app resolves a different `vite`, `@vitejs/plugin-vue` or `vue` major than the root. Nuxt's own copies (`@nuxt/devtools`, `@nuxt/nitro-server`) are recorded, not deduped.</task>

<motivation>Two Vite majors in one workspace mean two plugin-vue compilers, two SSR transforms and two sets of Vite-6-only APIs that must keep working in the apps while every package targets 7; the 08-08 plan found a second Vue copy is exactly what produces the `renderSlot … 'ce'` overlay failure that forced fourteen apps to stub dialogs. The guard is the part that outlives the fix: without it the next `yarn add` in an app re-opens the split silently.</motivation>

<done_check>
  Run from ui/dzup-ui. Capture to a file and read exit codes directly.
  - node -e "const fs=require('fs');const r=require('./package.json');const maj=s=>String(s).replace(/^[^\d]*/,'').split('.')[0];const rv=maj((r.devDependencies||{}).vite);let bad=0;for(const a of fs.readdirSync('apps')){const p='apps/'+a+'/package.json';if(!fs.existsSync(p))continue;const j=require('./'+p);const d={...j.dependencies,...j.devDependencies};if(d.vite&&maj(d.vite)!==rv){bad++;console.log('split',p,d.vite)}}console.log('splits',bad);process.exit(bad?1:0)"  → exit 0
  - yarn why vite > "$TEMP/why-vite.log" 2>&1; echo "exit $?"; grep -c "vite@npm:6" "$TEMP/why-vite.log"  → 0 (read the count, then the file, not a pipe)
  - yarn why vue > "$TEMP/why-vue.log" 2>&1; grep -c "@floating-ui/vue" "$TEMP/why-vue.log" → the floating-ui line resolves the same version as the workspaces, or the handoff records the owner decision that keeps it
  - ls packages/tooling/src/dependency-graph.spec.ts (or the path the handoff names) → a guard exists and `yarn test packages/tooling` passes it
  If all four hold, record `[x] found-done` and move on.
</done_check>

<discovery>
  1. `yarn why vite`, `yarn why @vitejs/plugin-vue`, `yarn why vue`, `yarn why reka-ui` — save all four logs; they are the "before" table in the handoff.
  2. Read apps/storybook/.storybook/main.ts, apps/storybook/vitest.config.ts, apps/landing/vite.config.ts, apps/sandbox/vite.config.ts and the root vitest.config.ts for Vite-6-only options (`server.deps`, `ssr.noExternal` shapes, `css.preprocessorOptions`, plugin APIs). List each with the Vite 7 equivalent.
  3. Check Storybook 10.5's declared Vite peer range (node_modules/@storybook/builder-vite/package.json, node_modules/@storybook/vue3-vite/package.json) and @storybook/addon-vitest's Vitest range against the root Vitest.
  4. `yarn why @floating-ui/vue` and its package.json: does it declare `vue` as a peer (then the duplicate is a hoisting accident a `resolutions` entry or `dedupe` fixes) or as a dependency (then only a bump or an override fixes it)?
  5. Read TASK-R1-O6's handoff so your `apps/sandbox` handling matches its D-item (if sandbox is slated for removal, migrate it anyway — it is still a workspace today — and say so).
</discovery>

<requirements>
  <scope>Three app package.json files, their Vite configs where an API changed, one guard spec, one changeset only if `packages/core/package.json` changes. No Storybook major bump, no Vitest major bump, no change to the `resolve.dedupe` semantics SK-1 established (`dedupe` stays derived from core's peers).</scope>
  <vue_copies>Collapse only the copies the library graph controls (`@floating-ui/vue`). If that needs a root `resolutions` entry, prepare it in the handoff as an owner decision with the exact line and its consumer-visible consequence; do not land it. If a `@floating-ui/vue` bump resolves it, that is a `patch` changeset on `@dzup-ui/core` with the peer effect stated.</vue_copies>
  <guard>packages/tooling/src/dependency-graph.spec.ts (Vitest): runs `yarn why --json <pkg>` for `vite`, `@vitejs/plugin-vue`, `vue`, `reka-ui`; asserts every `@dzup-ui/*` workspace resolves one major for each and it equals the root's; allowlists third-party owners by exact package name with a comment naming why (`@nuxt/devtools`, `@nuxt/nitro-server`). A general assertion, not one that knows today's numbers — the guide's "avoid hardcoding" rule applies.</guard>
  <no_regression>Each app's own suite; `yarn storybook:build`; `yarn storybook:test`; `yarn test:e2e -- --grep overlay-portals` (18/18 across the three engines); `yarn test:e2e:landing`; `yarn build`.</no_regression>
</requirements>

<steps>
  1. Complete <discovery>; write the before-table and the API-delta list into the handoff skeleton.
  2. Bump the three apps to `^7` / `^6`; run `yarn install`; fix each Vite-6-only option in place.
  3. Run the <no_regression> ladder per app; fix only what the bump broke.
  4. Resolve the Vue duplicate per <vue_copies>; re-run `yarn why vue`.
  5. Write the guard spec; run it; confirm it fails when you temporarily pin one app back to `^6` (then restore) — a guard that never failed has proved nothing.
  6. `yarn validate:all` end to end, exit read directly; compare the known-red set to TASK-R1-O1's — new reds are yours, old ones are cited.
  7. Handoff + ledger.
</steps>

<validation>
  yarn install > "$TEMP/install.log" 2>&1; echo "exit $?"
  yarn why vite > "$TEMP/why-vite.log" 2>&1; echo "exit $?"          # then read the file
  yarn test packages/tooling > "$TEMP/tooling.log" 2>&1; echo "exit $?"
  yarn workspace @dzup-ui/landing test > "$TEMP/landing.log" 2>&1; echo "exit $?"
  yarn storybook:build > "$TEMP/sb-build.log" 2>&1; echo "exit $?"
  yarn storybook:test > "$TEMP/sb-test.log" 2>&1; echo "exit $?"
  yarn test:e2e -- --grep overlay-portals > "$TEMP/e2e-overlay.log" 2>&1; echo "exit $?"
  yarn test:e2e:landing > "$TEMP/e2e-landing.log" 2>&1; echo "exit $?"
  yarn build > "$TEMP/build.log" 2>&1; echo "exit $?"
  yarn validate:all > "$TEMP/validate-all.log" 2>&1; echo "exit $?"
</validation>

<success_criteria>`yarn why vite` and `yarn why @vitejs/plugin-vue` show one major each across `@dzup-ui/*`; `yarn why vue` shows one version for every `@dzup-ui/*` workspace and `@floating-ui/vue` (or the owner decision is written with the exact override); the guard spec is green and was seen red under a deliberate regression; overlay-portals 18/18; `validate:all` exit read directly with no new red versus TASK-R1-O1's set; changeset present iff `packages/core` changed.</success_criteria>

<stop_conditions>Stop and report when Storybook 10.5's Vite-7 path breaks `storybook:test` (record the addon-vitest / Vitest range that conflicts — that is a toolchain decision for TASK-R5-O9's owner, not a reason to bump Vitest here); when `@floating-ui/vue` cannot be deduped without a root override (prepare it, do not land it); when an app needs a Vite-6-only option with no Vite-7 equivalent (name the option and the consumer).</stop_conditions>
```

---

### [ ] TASK-PL-O2 — Make the consumer-resolution helper reachable outside the workspace, and decide the tooling seam 🔴 `[!owner]`

_Gap: TASK-SK-1 delivered `createDzupResolution` into `@dzup-ui/tooling`,
which is `private: true`, version `0.0.1`, has no build, and whose
`exports["./resolution"]` points at `./src/resolution/dzup-resolution.ts`.
`docs/resolution-external-consumers.md` — written for applications **outside**
this repository — instructs `import { createDzupResolution } from
'@dzup-ui/tooling/resolution'`, an import no external app can make. The 08-08
plan's owner decisions 1 and 2 (`@datazup/dzup-theme` adopting the helper;
`website-app` choosing a mode) are therefore unexecutable as written, and
`website-app` remains the one consumer still exposed to the duplicate-copy
defect. Independently, the Pro repository has recorded the same seam request
in its own programme ledger (it vendors tooling validators because the package
cannot be imported; the numbers are its to state).
`packages/tooling/scripts/release-policy.json` lists tooling under `private`
with the note that npm can never see it. No programme has a task for this._

```xml
<role>You are a package-boundary engineer in ui/dzup-ui. Follow the repo_conventions of docs/program-2026-09-04/README.md §5 and the program_conventions of docs/program-2026-09-22-planning/README.md §5. A published package is a promise; you add to one only through its exports map, its dts gate and a changeset.</role>

<task>Make the resolution helper importable by an application that installs published @dzup-ui packages, without publishing @dzup-ui/tooling yourself. Step 0: write the decision sheet (three options, a recommendation). Then implement the reversible option B — expose `createDzupResolution` and its types as a built subpath of an already-published package (recommended: `@dzup-ui/testing/resolution`, because consumers already install @dzup-ui/testing for the Vitest side-effect entry and the helper's job is test/build configuration), keep `@dzup-ui/tooling/resolution` as a re-export so no in-repo consumer changes, prove an external install can import it through a consumer fixture built with `yarn pack`, and update docs/resolution-external-consumers.md. Finally prepare the `[!owner]` packet for the validator seam Pro asked for (option A: publish tooling; or "no").</task>

<motivation>Every consumer outside this workspace that mounts a reka-backed overlay under Vitest hits the duplicate-copy failure until it sets `dedupe` the way this helper does — and the only page that tells them how names an import that cannot resolve. The Pro repository's programme records the same need for its own reasons. One decision closes both.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - node -e "const t=require('./packages/testing/package.json');const o=require('./packages/tooling/package.json');console.log('testing/resolution', !!(t.exports&&t.exports['./resolution']), 'tooling.private', o.private)"  → `testing/resolution true` (option B) OR `tooling.private false` with a dist (option A executed by the owner)
  - ls packages/testing/dist/resolution* 2>/dev/null → built entry exists after `yarn build`
  - grep -n "tooling/resolution" docs/resolution-external-consumers.md → 0 lines instruct an external app to import from tooling (a "previously" note is fine)
  - ls scripts/ | grep -i fixture → a consumer-fixture lane exists and its log shows an *external* import of createDzupResolution succeeding
  If all hold, record `[x] found-done` and move on; if only the decision sheet exists, run steps 2–6.
</done_check>

<discovery>
  1. Read packages/tooling/src/resolution/{dzup-resolution.ts,dzup-resolution.types.ts,dzup-resolution.spec.ts} and packages/tooling/README.md §resolution: list every import the helper makes (node:path, fs, the exports-map reader). Anything Node-only must stay out of @dzup-ui/testing's browser-safe root entry.
  2. Read packages/testing/package.json (exports, files, build script, `sideEffects`), its tsconfig (`rootDir: "src"` — the 08-25 §5.1 lesson: a package that emits declarations cannot import another package's source), and packages/contracts/VERSIONING.md.
  3. Read scripts/consumer-fixture.sh (or the equivalent TASK-R1-O2 built — check its handoff) and how it installs tarballs; note that `yarn pack`, not `npm pack`, resolves `workspace:*`.
  4. For the option-A surface, read — read-only — the Pro programme's ledger entry for the seam request (ui/dzup-ui-pro/docs/program-2026-09-22-planning/EXECUTION-STATUS.md, "Tooling seam" row, and the handoffs it cites) and cite it by path in the packet. Do not copy its facts into this repository's documents and do not edit Pro.
  5. Read packages/tooling/scripts/release-policy.json and validate-release-policy.ts: what exactly refuses a private→published flip, and what a policy edit needs.
</discovery>

<requirements>
  <decision_sheet>Three options with cost, consumer effect and reversibility: A publish @dzup-ui/tooling (policy edit + build + versioning + changeset; answers the Pro repository's request); B relocate the resolution helper into @dzup-ui/testing as `./resolution` (minor changeset; tooling re-exports; validators stay private); C a new package. Recommend B now for the helper and put A to the owner for the validator seam. Write it before touching code.</decision_sheet>
  <option_b>packages/testing/src/resolution/ (moved, not copied — one implementation; tooling's file becomes `export * from '@dzup-ui/testing/resolution'` only if tooling may depend on testing without a cycle; otherwise tooling keeps a thin local re-export of the built entry). Exports map entry with `types` + `import` conditions to dist; `files` includes it; `yarn validate:exports` and `yarn validate:dts` green; no Node-only import reachable from the root entry (add a fixture spec that imports the root in a jsdom environment).</option_b>
  <fixture>A consumer fixture that packs @dzup-ui/testing with `yarn pack`, installs it into a scratch app outside the workspace (`$TEMP`), and runs a one-file Vitest config that calls `createDzupResolution({ mode: 'externalized', root })` and asserts `dedupe` contains `vue` and `reka-ui`. Log kept in the handoff.</fixture>
  <docs>docs/resolution-external-consumers.md: import path updated; "Which mode" section unchanged; a one-line note that tooling remains private. packages/tooling/README.md §resolution points at the new home.</docs>
  <changeset>`minor` on @dzup-ui/testing (new public subpath). None on tooling (private).</changeset>
  <scope>No validator moves in this task; no policy edit; no Pro edits. The option-A packet is a document.</scope>
</requirements>

<steps>
  1. <discovery> 1–5; write the decision sheet into the handoff skeleton.
  2. Move the helper; wire exports/files/build; keep tooling's path working.
  3. `yarn build` then `yarn validate:exports && yarn validate:dts && yarn validate:release-policy`, exits read directly.
  4. Consumer fixture; keep the log.
  5. Docs + changeset; `yarn validate:changelog` (or whatever validate:all link owns changesets — count the links, do not assume).
  6. Option-A packet: the surface list cited from the Pro ledger by path, the policy diff it would need, versioning consequence, and a recommendation. Mark `[!owner]`.
  7. `yarn validate:all` end to end; handoff; ledger.
</steps>

<validation>
  yarn test packages/testing packages/tooling > "$TEMP/pl-o2-unit.log" 2>&1; echo "exit $?"
  yarn build > "$TEMP/pl-o2-build.log" 2>&1; echo "exit $?"
  yarn validate:exports > "$TEMP/pl-o2-exports.log" 2>&1; echo "exit $?"
  yarn validate:dts > "$TEMP/pl-o2-dts.log" 2>&1; echo "exit $?"
  yarn validate:release-policy > "$TEMP/pl-o2-policy.log" 2>&1; echo "exit $?"
  bash scripts/consumer-fixture.sh > "$TEMP/pl-o2-fixture.log" 2>&1; echo "exit $?"   # or the lane the handoff names
  yarn validate:all > "$TEMP/pl-o2-validate-all.log" 2>&1; echo "exit $?"
</validation>

<success_criteria>An application outside the workspace imports `createDzupResolution` from a published package's subpath and gets a `dedupe` list containing `vue` and `reka-ui` (fixture log attached); every in-repo consumer still resolves through `@dzup-ui/tooling/resolution`; `validate:exports`, `validate:dts`, `validate:release-policy` green; docs updated; `minor` changeset on @dzup-ui/testing; the option-A packet exists with a recommendation; no change to tooling's `private` flag.</success_criteria>

<stop_conditions>Stop and report when the helper's Node-only imports cannot be isolated from @dzup-ui/testing's root entry (then option B is wrong and C is the recommendation — write it, do not force B); when validate:release-policy would need editing to let the change through (that is the owner's policy, not yours); when moving the file creates a tooling → testing → tooling cycle (`yarn validate:boundaries` says so — keep the thin re-export instead).</stop_conditions>
```

---

### [ ] TASK-PL-O3 — Landing Lighthouse re-measure and CLS baseline promotion packet 🟢 `[!owner baseline]`

_Gap: the 08-10 handoff accepted hero-split CLS `0.000005` desktop 3/3 and
`0` mobile 3/3 on `fce7eef` and refused to promote its contention-distorted
LCP; the 08-25 freeze (§7) records the Lighthouse baseline as "not re-run,
not replaced", with the e2e CLS budget assertion in
`apps/landing/e2e/block-detail.spec.ts` as the only current evidence. Since
`e986952` the landing gained the URL policy (TASK-R2-O4), provider adoption
(TASK-R5-O3), RTL routing (TASK-R5-O4), the ADR-19 cascade layers
(TASK-R5-O1) and the docs app — every one touches first paint — and **no
`program-2026-09-04` handoff mentions Lighthouse**: TASK-R2-O7's lanes are
leak / long-task / memory / hydration. `apps/landing/lighthouserc.json`,
`lighthouserc.mobile.json` and `src/lighthouserc.spec.ts` exist and
`ci.yml:688–699` runs them through `treosh/lighthouse-ci-action@v12`, so the
configs are live but the last human-read distribution is six weeks and ~30
commits old._

```xml
<role>You are a performance engineer in ui/dzup-ui. Follow the repo_conventions of docs/program-2026-09-04/README.md §5 and the program_conventions of docs/program-2026-09-22-planning/README.md §5. A performance number is a distribution with an environment or it is not evidence; you never promote a baseline — you prepare the packet.</role>

<task>Re-measure the landing app with both committed Lighthouse configs on the current source: at least three sequential samples per route on a quiet machine, desktop and mobile, with the same pinned Lighthouse the CI action uses; report min / median / p90 per metric per route; separate hard failures (CLS, accessibility) from warning-only drift; confirm whether the hero-split CLS budget assertion still binds; then write the promotion packet the owner decides on. Do not change thresholds, do not replace any baseline, do not raise a budget.</task>

<motivation>The landing is the published proof that the library composes; its accepted performance numbers are bound to a commit thirty-odd commits behind HEAD and the ledger has already rejected one promotion of timings from a contended machine. Until a fresh distribution exists, nobody can say whether the four first-paint-touching lanes that landed since regressed the page — and the CI action, which does run, asserts against thresholds nobody has re-derived.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - ls docs/program-2026-09-22-planning/reports/TASK-PL-O3-handoff.md → exists and contains a per-route distribution table with ≥3 samples per config dated after 2026-09-22
  - grep -n "baseline" docs/program-2026-09-22-planning/EXECUTION-STATUS.md | grep -i "PL-O3" → the owner's decision (promote / hold) is recorded
  - Second route: `git log --since=2026-09-22 --format=%h -- apps/landing/lighthouserc.json apps/landing/lighthouserc.mobile.json` — if thresholds changed without a packet, that is a finding, not a pass.
  If the handoff and the decision exist, record `[x] found-done` and move on.
</done_check>

<discovery>
  1. Read both lighthouserc files and src/lighthouserc.spec.ts (the drift check between them): the route set, the assertion levels (error vs warn), the number of runs, the port.
  2. Read ci.yml:680–705 for the exact action version and any `LHCI_*` inputs — the local run must match the CI one or the two distributions are incomparable. Find the pinned `@lhci/cli` version (package.json devDependencies, or the action's bundled version); do not install an unpinned global.
  3. Read the 08-10 accepted samples (`NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-oss-coverage-and-sk1.md` §"Accepted local evidence") and the 08-25 §7 note; they are the "before" column.
  4. Read apps/landing/e2e/block-detail.spec.ts for the CLS budget assertion (≤60 px section movement, CLS < 0.1) — it stays the binding gate unless the packet says otherwise.
  5. Confirm a free port (`netstat -ano | findstr :<port>` on this Windows box); never stop a process you did not start.
</discovery>

<requirements>
  <environment>`yarn landing:build` first; serve the built output (the config's `startServerCommand`); nothing else heavy on the machine; record CPU/RAM/other-process state in the handoff. If the machine's own variance (coefficient of variation across the three samples) exceeds 10 % on FCP for the home route, the environment is unstable — record it and stop after diagnosis rather than reporting numbers as a baseline candidate.</environment>
  <samples>≥3 sequential full runs of each config (each config already does 2 runs per route; report the individual run values, not the action's aggregate). Keep artifacts under output/playwright/dzup-ui-landing-lighthouse-2026-09-22/ (outside the repo tree, as the earlier sessions did); do not commit `.lighthouseci/`.</samples>
  <report>Per route × config × metric: values, min, median, p90; hard-gate status (CLS, accessibility); warning-only drift called warning-only. Hero-split CLS on its own line. A "what changed since fce7eef" column citing the four lanes.</report>
  <packet>One page: accepted numbers (08-10) vs measured (now); the recommendation (promote these medians as the recorded baseline / hold / regression found — name the route and lane); whether the e2e CLS assertion stays the binding gate; the exact file the owner would edit (`apps/landing/lighthouserc*.json` assertions or a `docs/qa/perf` record if TASK-R2-O7 created one — check) and the diff. Marked `[!owner]`.</packet>
  <scope>No source change to the landing. No threshold change. No baseline replacement.</scope>
</requirements>

<steps>
  1. <discovery>; handoff skeleton with the "before" column filled.
  2. Build; serve; run desktop config ×3; run mobile config ×3; save artifacts.
  3. Compute the distribution table; classify hard vs warning.
  4. Run `yarn test:e2e:landing -- --grep "hero split"` to confirm the CLS assertion still passes on the same build (exit read directly).
  5. Write the packet; ledger row `[!]` with the decision fields empty for the owner.
</steps>

<validation>
  yarn landing:build > "$TEMP/pl-o3-build.log" 2>&1; echo "exit $?"
  npx --no-install @lhci/cli --version   # must resolve locally; if it does not, use the pinned version the CI action bundles — never an unpinned global
  npx --no-install @lhci/cli autorun --config=apps/landing/lighthouserc.json > "$TEMP/pl-o3-desktop-1.log" 2>&1; echo "exit $?"   # ×3, then the mobile config ×3
  yarn test:e2e:landing -- --grep "hero split" > "$TEMP/pl-o3-e2e.log" 2>&1; echo "exit $?"
</validation>

<success_criteria>Six complete runs (3 × 2 configs) on a quiet machine with variance recorded; a per-route distribution table; hard gates reported separately from warnings; the hero-split CLS assertion re-run green on the same build; a promotion packet with a single recommendation and the exact diff the owner would apply; nothing promoted, no threshold touched.</success_criteria>

<stop_conditions>Stop after the diagnosis (no packet) when environment variance exceeds the 10 % rule — a baseline from a noisy machine is the mistake the 08-10 ledger already refused once; when the pinned Lighthouse cannot be resolved locally without a global install (report the version gap as an owner decision); when a hard gate fails (CLS ≥ 0.1 or accessibility < 0.9 on any route) — that is a regression to hand to the owning lane (TASK-R2-O5 for accessibility, a new defect for CLS), not something to fix inside this measurement task.</stop_conditions>
```

---

### [ ] TASK-PL-O4 — Disposition stamps on the 39 planning documents and the planning section of the workspace README 🟢

_Gap: `workspace-docs/repos/ui/docs/planning/` holds 39 files (606 KB). Three
carry a status line ("consumed", "completed and superseded", "Status: … SK-1
and SK-2 closed"); the other 36 read as live instructions, including 25
per-component prompts whose packets landed in August and an 08-11 handoff
that `workspace-docs/repos/ui/docs/README.md` still lists as "Future
implementation handoff" though P0/P1 executed as TASK-OSS-P0/P1. The README
calls the neutral-model plan and the ThemeRecipe ledger "completed" but says
nothing about where their residuals went. Anyone landing on the directory
re-derives the whole state — this programme did exactly that, at the cost of a
full read. The two repository-scoped `planning-docs-disposition.md` tables now
hold the answer for every file; the files themselves do not._

```xml
<role>You are a documentation engineer working in workspace-docs (a separate nested repository with its own dirty, concurrent work). Follow the program_conventions of ui/dzup-ui/docs/program-2026-09-22-planning/README.md §5. You add facts bound to commits; you never delete, move or rewrite a historical document's body.</role>

<task>Prepend a disposition blockquote to each of the 39 planning files from the matching row of the repository-scoped disposition tables (ui/dzup-ui/docs/program-2026-09-22-planning/planning-docs-disposition.md for OSS-owned files; ui/dzup-ui-pro/docs/program-2026-09-22-planning/planning-docs-disposition.md for Pro-owned files — each lists the other's files by name, so ownership is unambiguous), rewrite the planning bullets in workspace-docs/repos/ui/docs/README.md so they state the disposition and point at the two 2026-09-22 programs, and add a "Planning archive" index table to that README. Touch nothing else in workspace-docs.</task>

<motivation>The planning directory is the entry point people and agents actually land on, and a document that reads as an instruction is followed — the August prompts were each executed once and would be executed again by a reader who does not know about three later programmes. A five-line stamp per file turns 606 KB of history into history.</motivation>

<done_check>
  Run from the workspace root.
  - grep -L "Disposition (2026-09-22)" workspace-docs/repos/ui/docs/planning/*.md > "$TEMP/unstamped.txt"; wc -l < "$TEMP/unstamped.txt"  → 0 (read the count from the file)
  - grep -c "program-2026-09-22" workspace-docs/repos/ui/docs/README.md → ≥ 2 (both repos' programs linked)
  - grep -n "Planning archive" workspace-docs/repos/ui/docs/README.md → the index table exists
  If all hold, record `[x] found-done` and move on.
</done_check>

<discovery>
  1. `git -C workspace-docs status --short --branch` — list every dirty path; you must leave each byte-identical. Record the branch state (it was ahead 1 / behind 2176 on 2026-09-22 — do not fetch, pull or rebase).
  2. Read both disposition tables end to end; together they are the source of every stamp — the OSS table for rows 1, 2, 29, 37 and the OSS halves of 36 and 39, the Pro table for the rest (rows 36 and 39 get one stamp naming both halves).
  3. Read workspace-docs/repos/ui/docs/README.md; note the status vocabulary section and keep its terms.
  4. Check whether `yarn docs:migration:references:check` and `yarn docs:test` exist at the workspace root or inside workspace-docs (the 08-11 handoff names them; the root package.json showed no `docs:` scripts on 2026-09-22 — verify before citing them).
  5. Check the three files that already carry a status line so your stamp sits above theirs without contradicting them.
</discovery>

<requirements>
  <stamp>Exactly one blockquote inserted after the H1 line (or as the first line when the file has no H1), of this shape — the row number, the disposition word, the proof, the residual, nothing else:
    <example>
> **Disposition (2026-09-22):** Executed in-repo — portal contract, `createDzupResolution` and the
> overlay-portals specs landed (`ui/dzup-ui/packages/tooling/src/resolution/`, `e2e/components/overlay-portals.spec.ts`).
> Residual: TASK-PL-O1, TASK-PL-O2; the consumer-app half belongs to other repositories.
> Review: `ui/dzup-ui/docs/program-2026-09-22-planning/planning-docs-disposition.md` row 2.
> This file is history; do not execute it.
    </example>
  </stamp>
  <readme>Each planning bullet under "Current system direction" gains its disposition in the same sentence; the "Future implementation handoff" bullet says "executed as TASK-OSS-P0/P1 (2026-08)"; a new "Planning archive" H2 with a table: file · theme · disposition · residual → task · review row. Link both programs (`ui/dzup-ui/docs/program-2026-09-22-planning/README.md`, `ui/dzup-ui-pro/docs/program-2026-09-22-planning/README.md`) by workspace-relative path.</readme>
  <invariants>No file renamed, moved or deleted; no body text changed below the stamp; no edit to `indexes/document-catalog.jsonl`; the 36 previously-unstamped files gain a stamp, the 3 stamped ones gain the same stamp above their own; line endings LF (check `git diff --stat` for a "CRLF will be replaced" warning and normalise).</invariants>
  <scope>workspace-docs/repos/ui/docs/planning/*.md and workspace-docs/repos/ui/docs/README.md only.</scope>
</requirements>

<steps>
  1. <discovery>; record the dirty-path list in the handoff skeleton.
  2. Generate the 39 stamps from the disposition table with a script kept in your scratchpad (not in the repo); apply them; diff-check line endings.
  3. Rewrite the README bullets; add the archive table.
  4. Run whatever docs checks exist (step 4 of discovery); if none exist, say so and run `git -C workspace-docs diff --check`.
  5. Confirm every previously dirty path is byte-identical (`git -C workspace-docs diff --stat -- <path>` unchanged from step 1).
  6. Handoff + ledger (in ui/dzup-ui/docs/program-2026-09-22-planning/, not in workspace-docs).
</steps>

<validation>
  git -C workspace-docs diff --check; echo "exit $?"
  git -C workspace-docs diff --stat -- repos/ui/docs/planning repos/ui/docs/README.md   # 40 files, insertions only
  grep -L "Disposition (2026-09-22)" workspace-docs/repos/ui/docs/planning/*.md > "$TEMP/unstamped.txt"; wc -l < "$TEMP/unstamped.txt"
</validation>

<success_criteria>40 files changed, insertions only (39 stamps + README); zero unstamped planning files; README planning bullets carry dispositions and both program links; the archive table lists all 39; every pre-existing dirty path in workspace-docs untouched; no CRLF introduced; no catalog rebuild.</success_criteria>

<stop_conditions>Stop and report when a planning file is itself dirty in workspace-docs (someone else's in-progress edit — stamp the others, list it); when the README has moved or been restructured since 2026-09-22 (re-read, do not overwrite); when a docs check exists and fails for a reason outside these 40 files (report as pre-existing).</stop_conditions>
```
