---
'@dzup-ui/core': patch
'@dzup-ui/contracts': patch
---

Fix invalid published declarations (D152). Emits payloads labelled `event` printed `(event: "click", event: MouseEvent)`, a duplicate identifier (`TS2300`) in `DzPopconfirm.vue.d.ts` and `DzSpeedDial.vue.d.ts` for any consumer on TypeScript's default `skipLibCheck: false`, and the same invalid signature in the generated docs. The 60 payload labels are now `e`; tuple labels do not affect assignability, so no consumer code changes.
