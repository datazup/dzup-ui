---
"@dzup-ui/mcp": patch
---

**The installed MCP server starts when a client runs it.** `npx -y @dzup-ui/mcp` — the config the README gives for Cursor, Claude Code, Windsurf and VS Code — exited 0 without serving anything, and every client reported the server as unavailable.

The guard that decides whether to start the stdio server compared the invoked file's **name** against `index.js`. `node_modules/.bin/dzup-ui-mcp` is a symlink, Node reports the path it was invoked through in `process.argv[1]`, and that path ends in `dzup-ui-mcp`, so the test was false for every invocation npm actually creates. `main()` never ran and the process exited in silence.

The entry check now resolves the invoked path with `realpathSync` and compares it against this module's own directory, so it is true for the installed bin, for `yarn dev`'s `tsx src/index.ts`, and for `dist/index.js` spawned directly, while remaining false for imports and for the test runner. `packages/mcp/src/direct-invocation.spec.ts` reproduces the `node_modules/.bin/<name>` layout on disk and fails against the old rule.

Nothing in the repo could see this: the package's own specs import the module, `scripts/e2e-smoke.mjs` spawned `dist/index.js` directly, and `yarn validate:mcp` only compared the `bin` entry against the `files` list. Both gaps are closed — the smoke lane now spawns the declared `bin` through the symlink npm installs, and `validate:mcp` gains an entry-point clause that runs that same invocation and requires an `initialize` answer.