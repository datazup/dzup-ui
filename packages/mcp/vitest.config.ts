import { defineConfig } from 'vitest/config'

// Local config so this package's tests don't inherit the repo root's Vue/jsdom
// setup: the MCP server is a plain Node package.
//
// `*.spec.ts`, NOT `*.test.ts` (TASK-N2-A1). The suite used to be
// `src/registry.test.ts`, and the root `vitest.config.ts` includes
// `packages/*/src/**/*.spec.ts` — so the ONLY test this published package had
// matched nothing in `yarn test`, was invisible to `yarn test:coverage`, and
// `.github/workflows/` contains no occurrence of the string `mcp`. The suite
// had therefore never run in any gate. Naming it the way the rest of the repo
// names specs is what puts it in one; this config keeps the narrow
// `yarn workspace @dzup-ui/mcp test` lane working in a plain Node environment.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
})
