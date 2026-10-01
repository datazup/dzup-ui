---
'@dzup-ui/codemods': patch
---

`@dzup-ui/codemods` declares the Node floor its `dzup-codemod` binary runs on, `^20.19.0 || >=22.13.0` (ADR-18), so a package manager warns on an older runtime instead of the CLI failing at startup.
