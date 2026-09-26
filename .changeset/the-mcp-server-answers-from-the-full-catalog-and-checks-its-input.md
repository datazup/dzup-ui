---
"@dzup-ui/mcp": minor
---

**The MCP server checks its input, answers component questions from generated metadata, and lists the whole catalog.** Three behaviour changes, each recorded in its own handoff and released together (owner decision D186).

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
