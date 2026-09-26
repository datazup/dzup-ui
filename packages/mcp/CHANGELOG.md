# @dzup-ui/mcp

## 0.3.0

### Minor Changes

- 788f5ba: **The MCP server checks its input, answers component questions from generated metadata, and lists the whole catalog.** Three behaviour changes, each recorded in its own handoff and released together (owner decision D186).

  **It checks its input (TASK-N2-A1).**
  - `get_block`, `get_template` and `get_install_command` validate the item name as a registry id at the protocol boundary. Before, an unvalidated name was interpolated into the `shadcn add` command these tools print.
  - `get_install_command` checks that the item exists in the generated registry before printing a command. An unknown item returns `isError` instead of a command that cannot work.
  - Every tool enforces the `additionalProperties: false` its published JSON Schema already advertised. Unknown arguments are rejected instead of dropped.
  - The server reports the version from `package.json`. Before, it reported a `0.1.0` literal that predates the 0.2.0 release; `server.json` agrees with it.
  - New on `@dzup-ui/mcp/registry`: `isRegistryId`, `REGISTRY_ID_RE`, `REGISTRY_ID_MAX_LENGTH`. `docs/mcp-tool-surface.json` ships in the tarball.

  Each of these narrows a wrong-input path. A call that worked before still works.

  **It answers component questions from generated metadata (TASK-N2-A2).**
  - New tools `search_components`, `get_component_metadata` and `get_component_example` read `/r/component-meta.json`. It carries every component's props, events, slots and exposed members, extracted from source, joined to its family, risk tier, anatomy parts and evidence state.
  - `get_component_example` returns real Storybook story source, verbatim. A component with no story returns an explicit absence; the server never makes up example markup.
  - New: `COMPONENT_META_PATH`, `RegistryClient#componentMeta()` and `RegistryClient#componentMetaFor()` on `@dzup-ui/mcp/registry`; `searchComponents`, `getComponentMetadata` and `getComponentExample` on the root entry point.

  **It lists the whole catalog (TASK-N2-A3).** `list_components` and `get_component` return 43 components they used to omit. The `llms.txt` parser accepts component names that do not start with `Dz`. If you point the server at your own `llms.txt`, component names are matched by `[A-Z][A-Za-z0-9]*`.

### Patch Changes

- 527dbd1: **A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**

  **WCAG 2.2 SC 2.5.7 Dragging Movements was measured as not met on three
  surfaces** — `DzResizable`, `DzSplitter` and `DzTable`'s column resize. All
  three were keyboard-operable, and a keyboard path satisfies SC 2.1.1, not this
  one: the criterion is about pointer input and asks for a single pointer without
  dragging. `DzTable`'s handle was the worst of them, because `@click.stop` sat on
  it and discarded the one plain press that might have been a non-drag path.

  Each of the three now carries a **stepper pair** — one control that shrinks, one
  that grows:
  - **Nothing moves until you reach for it.** The pair is absolutely positioned
    over the gutter (or, for a column, over the header cell) and rests fully
    transparent, so it occupies no layout and paints nothing: every splitter and
    every table header looks exactly as it did, and no consuming layout shifts.
    It is revealed by hovering the gutter, by focusing the separator, or by one
    tap on a device that has no hover. The **DOM** does gain two buttons per
    handle, so a consumer's own DOM snapshot of one of these three components will
    need re-recording — that is the one thing this change asks of you.
  - **It is the same step as the keyboard.** On a splitter, a press dispatches the
    very `keydown` the arrow keys already drive, so the step is `keyboardResizeBy`
    and `Shift` is still the full sweep. On a column, both paths call one
    function: 8 px, or 24 px with `Shift`.
  - **There is no prop to switch it off.** A conformance claim a consumer can
    withdraw is not one worth publishing.
  - Each control is **24 × 24 CSS px**, the SC 2.5.8 floor, measured in chromium,
    firefox and webkit.

  New `data-part` names you can style and test against: `step-decrease` and
  `step-increase` on the resizable, splitter and table anatomies. `DzTable`'s
  column-resize handle also gains `data-part="separator"` — it has carried
  `role="separator"` all along — plus `aria-valuenow` and `aria-valuemin`, so a
  screen reader is told the width it is changing.

  Four catalog keys, so nothing is hard-coded English:
  `DzResizableHandle.shrinkPane`, `DzResizableHandle.growPane`,
  `DzTableCell.narrowColumn`, `DzTableCell.widenColumn`.

  **The packages now declare a supported-browser floor.** All six published
  packages carry a `browserslist` key naming the same range. It is not a
  preference: it is the lowest range the published CSS can be generated for, so a
  declaration below it would be a promise the build could not keep. The
  browser-support evidence page reads it out of the tree and prints, beside it,
  the engines the matrix actually drives — a browser the floor admits and no lane
  measures is named as supported by declaration and nothing more.

  This is a `patch` under `packages/contracts/VERSIONING.md`: every part, key and
  attribute above is **added**, none is removed, renamed or narrowed, and §3's
  accessibility carve-out puts a corrected rendered accessibility attribute in the
  patch position deliberately — we would rather ship the fix than hold it for a
  range bump.

- eec0bce: **A registry outage is no longer reported as a missing block or template.** `get_block` and `get_template` caught every error and answered `Block "…" not found`, so a DNS failure, a refused connection or a timeout told the client the item did not exist. They now return the not-found result only for a 404, a "not found" or a "no such file" error and re-throw anything else, so the server's error guard reports the real failure.

  A registry request that never answers no longer holds the MCP session forever: every HTTP read is aborted after 15 seconds.

  `search_components` no longer throws when a component in the metadata has no `props`, `slots`, `events` or `stories`; it counts the missing lists as empty.

- 4b913e6: **The installed MCP server starts when a client runs it.** `npx -y @dzup-ui/mcp` — the config the README gives for Cursor, Claude Code, Windsurf and VS Code — exited 0 without serving anything, and every client reported the server as unavailable.

  The guard that decides whether to start the stdio server compared the invoked file's **name** against `index.js`. `node_modules/.bin/dzup-ui-mcp` is a symlink, Node reports the path it was invoked through in `process.argv[1]`, and that path ends in `dzup-ui-mcp`, so the test was false for every invocation npm actually creates. `main()` never ran and the process exited in silence.

  The entry check now resolves the invoked path with `realpathSync` and compares it against this module's own directory, so it is true for the installed bin, for `yarn dev`'s `tsx src/index.ts`, and for `dist/index.js` spawned directly, while remaining false for imports and for the test runner. `packages/mcp/src/direct-invocation.spec.ts` reproduces the `node_modules/.bin/<name>` layout on disk and fails against the old rule.

  Nothing in the repo could see this: the package's own specs import the module, `scripts/e2e-smoke.mjs` spawned `dist/index.js` directly, and `yarn validate:mcp` only compared the `bin` entry against the `files` list. Both gaps are closed — the smoke lane now spawns the declared `bin` through the symlink npm installs, and `validate:mcp` gains an entry-point clause that runs that same invocation and requires an `initialize` answer.

## 0.2.0

### Minor Changes

- a0d8926: Ship `@dzup-ui/mcp` — a free, open-source Model Context Protocol server for the dzup-ui ecosystem (Task G5).

  Connect it in Cursor, Claude Code, Windsurf or VS Code with a single `npx -y @dzup-ui/mcp` and an assistant can browse every component, block, template and design token, then fetch the **real `.vue` source** and the `shadcn add` install command on request — "add a dzup-ui pricing block" now resolves to actual code.
  - **New package `packages/mcp`** — a thin, read-only, stdio MCP server over the STATIC catalog artifacts the landing site already generates (`/r/*.json`, `/r/tokens.json`, `/storybook/llms.txt`), so there is one source of truth and zero drift. Tools: `list_components`, `get_component`, `list_blocks`, `get_block`, `list_templates`, `get_template`, `list_tokens`, `get_install_command`, `search`. Configurable origin via `DZUP_UI_REGISTRY_URL` (defaults to the public site; accepts a local checkout for dev). Ships parser/registry unit tests plus an end-to-end JSON-RPC smoke test, and a `server.json` manifest for the public MCP registry.
  - **Landing `/ai` page** — "Use dzup-ui with your AI IDE": copy-paste MCP configs per client, the tool list and example prompts, wired into the top nav. New `dzupMcpConfig()` / `dzupMcpVscodeConfig()` / `dzupMcpClaudeCliCommand()` helpers in `blocks/config.ts` keep the page's snippets in lockstep with the shipped server.
