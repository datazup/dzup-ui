---
"@dzup-ui/mcp": patch
---

Ship the licence text this package has always declared.

`packages/mcp/package.json` declared `"license": "MIT"` and the package shipped
no licence file: it was the only one of the eight packages under `packages/`
with no `LICENSE`, and the only published one whose `files` array did not name
it. A published MIT package with no licence text is not a cosmetic gap — a
consumer who installs it receives a licence identifier with nothing behind it,
and that is not retroactively fixable for anyone who already installed.

`packages/mcp/LICENSE` is the byte-identical copy of the text the other seven
packages and the repository root carry (MIT, `Copyright (c) 2026 DataZup`), and
`LICENSE` is now the first entry of `files`. `yarn workspace @dzup-ui/mcp pack`
confirms `package/LICENSE` in the tarball with the same checksum as its
siblings'. No code, no exports and no types change.
