# Admission — DZUP-UI-D152-EMITS-LABELS-20260928-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-D152-EMITS-LABELS-20260928-R1 (register **D152** option (a), routed to TASK-R2-O3; register reconciliation of **D159**) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `9a7148fe8a7a16d15c59e74e8185b608c24f1ea6` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-d152-emits-labels-20260928` |
| Branch | `fix/d152-emits-labels-20260928` |
| Plan reference | `workspace-docs/repos/dzup-ui/docs/planning/dzup-ui-next-steps-2026-09-26.md` §2 item 5 (D152); `docs/program-2026-09-04/reports/TASK-R1-O2-handoff.md` F1 / D152 |
| Authorisation | Operator, 2026-09-28: "do proceed with the improvements you say should be done", which answers the proposal to take D152 option (a) (recommended) and D159 option (a) |

## Authority classes

| Class | Granted |
|---|---|
| Candidate commit | yes, on the branch above |
| Local integration | yes, fast-forward of canonical `main` under the integration lane |
| Push | yes, `refs/heads/main` only, after `ls-remote` still equals the base (or a rebase re-gated on the new base) |
| Cleanup | yes, this packet's own worktree and branch only |
| Production, publish, tag, secrets, branch protection | **no** |

## Outcome

The published declarations contain no duplicate-identifier signature, so a
consumer on TypeScript's default `skipLibCheck: false` no longer gets the 18
`TS2300` errors, and the docs, `llms.txt` and MCP metadata stop printing the
same invalid signature.

## Measured before any edit

- Canonical `packages/core/dist` (built 2026-09-26):
  `dist/components/overlays/DzPopconfirm.vue.d.ts:67,188` and
  `dist/components/buttons/DzSpeedDial.vue.d.ts:65` read
  `$emit: ((event: "click", event: MouseEvent) => void) & …`.
- Root cause is not in those two components. `DzPopconfirm.vue:95` types a ref
  `InstanceType<typeof DzButton>` and `DzSpeedDial.vue:110`
  `InstanceType<typeof DzFab>`, so vue-tsc inlines **`DzButton`'s** and
  **`DzFab`'s** emits. Vue names the event-name parameter `event`; an emits
  tuple whose payload label is also `event` prints two parameters with one name.
- The same printer feeds `packages/core/docs/component-meta.json`: **104**
  event `signature`s there begin `(event: "…", event: …)` and are rendered into
  `apps/docs/components/*.md`. Sources: **60** tuple labels `[event: …]` in the
  **27** published `.types.ts` files below.

## Scope

1. Relabel every emits tuple payload `event` → `e` in the 27 files below. Tuple
   labels do not affect assignability; no consumer code changes.
2. `validate:component-meta` gains a `schema` error for any event signature
   that repeats a parameter name, so the collision cannot come back unnoticed.
3. `patch` changeset for `@dzup-ui/core` and `@dzup-ui/contracts`; then
   `build:releases`.
4. Regenerate in order: capability-matrix → component-meta → docs-pages → llms
   → landing generators that read component-meta.
5. Register: D152 → decided (a), executed; D159 → decided (a), already met by
   `179ab2b` (`docs/release/rollback.md`, quoted by `release:report` §8) plus
   `SECURITY.md` "Supported Versions". The register still asked for a file
   named `rollback-and-support.md`; the name the report generator reads is
   `rollback.md`.

Source files (27):

- `packages/contracts/src/events.types.ts`
- `packages/core/src/components/{buttons,cards,data,forms,inputs,media,navigation,overlays}/*.types.ts`
  containing `[event: ` at the base (26 files: DzButton, DzFab, DzIconButton,
  DzSplitButton, DzToggleButton, DzCard, DzChip, DzList, DzOrderList, DzTag,
  DzFileUpload, DzTagsInput, DzTransfer, DzTreeSelect, DzOtpInput, DzAvatar,
  DzImage, DzAnchor, DzBackTop, DzMenu, DzSidebar, DzContextMenu, DzDialog,
  DzDropdownMenu, DzPopover, DzSheet)

## Allowed paths

- `docs/qa/d152-emits-labels-2026-09-28/**`
- `.changeset/d152-emits-payload-labels.md`
- `packages/contracts/src/events.types.ts`
- `packages/core/src/components/**` (the 26 `.types.ts` files above only)
- `packages/tooling/src/validators/component-meta.ts`, `component-meta.spec.ts`
- `packages/core/docs/**` (component-meta, capability-matrix, llms outputs)
- `apps/storybook/stories/_data/capability.generated.ts`
- `apps/docs/**` (generated pages only)
- `apps/landing/src/generated/**`, `apps/landing/public/**` (generated only)
- `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`

## Acceptance

1. `grep -rn '\[event: ' packages/*/src --include=*.types.ts` → 0.
2. After `yarn workspace @dzup-ui/core build`: `grep -rlE '\(event: "[^"]+", event:' packages/core/dist` → 0.
3. The types probe of a consumer with `skipLibCheck: false` over the packed
   declarations reports 0 `TS2300`; any remaining own-package error is named.
4. component-meta: 0 signatures matching `^\(event: [^,]*, event:`; the new
   validator rule fails on the base artifact and passes on the regenerated one.
5. `yarn typecheck`, `yarn lint`, `validate:component-meta`, the tooling and
   affected core unit tests pass; every generator leaves no diff after the commit.
6. The pushed commit's CI run is green.

## Deferred

- `@dzup-ui/compat` adapters (withheld package) keep their inline `[event: …]`
  labels.
- D152 option (b), a `--strict-lib-check` lane in `validate:published-imports`.
- The 3 `TS2344 GlobalComponents` errors: attributed in the evidence only; a
  fix, if ours, is a separate packet.
- `packages/mcp/src/__fixtures__/catalog.ts` is a frozen fixture and keeps its
  old signature text.

## Amendment 1 (before the implementation commit)

The repository's own agent guide taught the defect: `CLAUDE.md` §"Type
Definitions Pattern" shows `click: [event: MouseEvent]`, which every agent
copies. Added to the allowed paths:

- `CLAUDE.md` — the example relabelled, plus quick rule 4b.
- `packages/tooling/src/meta/component-meta.ts` — one JSDoc example
  (`[event: MouseEvent]` → `[e: MouseEvent]`); no code change.

Lease amended to generation 3 with the same two paths.
