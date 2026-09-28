# Evidence — DZUP-UI-D152-EMITS-LABELS-20260928-R1

Measured 2026-09-28 in the packet worktree, source at `667b0b1`, generated
artifacts at `54bf69c`, after `yarn install --immutable` and `yarn build`.

| # | Acceptance | Result |
|---|---|---|
| 1 | `grep -rn '\[event: ' packages/*/src --include=*.types.ts` | **0** (60 at the base) |
| 2 | `grep -rlE '\(event: "[^"]+", event:' packages/*/dist` after `yarn build` | **0** files (base: `DzPopconfirm.vue.d.ts`, `DzSpeedDial.vue.d.ts`) |
| 3 | Types probe, `skipLibCheck: false` (below) | `TS2300` **18 → 0** |
| 4 | component-meta signatures matching `^\(event: [^,]*, event:` | **104 → 0**; the new rule reported them on the base artifact (`validate:component-meta` rc=1, first 40 of 104 printed) and passes after regeneration |
| 5 | Unit, lint, typecheck | `yarn typecheck` rc=0 · `yarn lint` rc=0 · vitest buttons+overlays+contracts **627/627** · tooling validators+meta+llms+docs **192/192** |

## The `skipLibCheck: false` probe

`tsx packages/tooling/src/validators/published-imports.ts --built --keep`
passed (32 entries). Its kept consumer's `tsconfig.types-probe.json` was copied
with only `skipLibCheck` flipped to `false` and run with the repository's `tsc`:

| Code | Count | Owner |
|---|---|---|
| TS2307 / TS2304 / TS2451 / TS7016 / others | 86 | third-party declarations reached through the probe's junction to the repository's `node_modules` (`nitropack`, `h3`, `@floating-ui/vue`'s nested `@vue/runtime-core`, …) |
| TS2344 `GlobalComponents` | 3 | `DzRangeSlider`, `DzSlider`, `DzPopconfirm` `.vue.d.ts` — see below |
| TS2300 | **0** | (18 at `527dbd1`) |

**The 3 `TS2344` are not a defect in our declarations.** The repository's
`node_modules` holds four `@vue/runtime-core` copies — 3.5.31 at the top level,
3.5.42 under `@vue/runtime-dom`, 3.5.39 under `nuxt` and under
`@floating-ui/vue`. The emitted text is `import('vue').GlobalComponents`
checked against a constraint that `reka-ui` resolves from a different copy, so
the two `GlobalComponents` are different interfaces. A consumer with one Vue
copy does not have two. Deduplicating the repository's Vue graph is a separate
item.
