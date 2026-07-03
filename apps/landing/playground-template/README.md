# dzup-ui playground

A minimal **Vite + Vue 3 + @dzup-ui/core** starter. It's the project that opens
when you click **"Open in StackBlitz"** on a block (`/blocks/:id`) or template
(`/templates/:slug`) page on [dzup-ui.com](https://dzup-ui.com) — the item's
source is injected as `src/App.vue` (templates also bring their `src/data.ts`).

```bash
npm install
npm run dev
```

- `src/main.ts` wires the design tokens (`@dzup-ui/tokens/css`) and base styles
  (`@dzup-ui/core/styles`) once, before your own CSS.
- `src/style.css` loads Tailwind and `@source`-scans the installed library so the
  components' runtime utility classes are generated.

Toggle dark mode by setting `data-theme="dark"` on `<html>` in `index.html`.
