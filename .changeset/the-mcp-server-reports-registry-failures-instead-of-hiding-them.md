---
"@dzup-ui/mcp": patch
---

**A registry outage is no longer reported as a missing block or template.** `get_block` and `get_template` caught every error and answered `Block "…" not found`, so a DNS failure, a refused connection or a timeout told the client the item did not exist. They now return the not-found result only for a 404, a "not found" or a "no such file" error and re-throw anything else, so the server's error guard reports the real failure.

A registry request that never answers no longer holds the MCP session forever: every HTTP read is aborted after 15 seconds.

`search_components` no longer throws when a component in the metadata has no `props`, `slots`, `events` or `stories`; it counts the missing lists as empty.
