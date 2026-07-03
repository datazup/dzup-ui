import { defineConfig } from 'vitest/config'

// Local config so this package's tests don't inherit the repo root's Vue/jsdom
// setup: the MCP server is a plain Node package, and its specs are `*.test.ts`
// (the root config only picks up `*.spec.ts`).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
