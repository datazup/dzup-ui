/**
 * @dzup-ui/tooling
 *
 * Internal validators and quality enforcement tools for dzup-ui.
 *
 * Tools are designed to be run as CLI scripts via tsx:
 *   - import-boundary.ts  — validates cross-package import rules
 *   - interaction-contract.ts — validates semantic focus/disabled contract usage
 *   - color-lint.ts       — validates token compliance (no raw color literals)
 *   - manifest-generator.ts — generates barrel exports from manifest files
 *
 * Usage:
 *   tsx packages/tooling/src/validators/import-boundary.ts
 *   tsx packages/tooling/src/validators/interaction-contract.ts
 *   tsx packages/tooling/src/token-checks/color-lint.ts
 *   tsx packages/tooling/src/manifest-generator.ts <package-dir>
 */

export {}
