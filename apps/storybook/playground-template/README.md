# dzup-ui playground

A minimal **Vite + Vue 3 + Tailwind CSS 4** starter wired up with
[`@dzup-ui/core`](https://www.npmjs.com/package/@dzup-ui/core). This is the
template behind the **"Open in StackBlitz"** buttons in the dzup-ui Storybook —
it lives in the repo (`apps/storybook/playground-template/`) so it always tracks
the current major version.

```bash
npm install
npm run dev
```

Key wiring (see `src/main.ts` and `src/style.css`):

1. `@dzup-ui/tokens/css` — design tokens (`--dz-*`), imported once, first.
2. `@dzup-ui/core/styles` — base interaction utilities.
3. Tailwind, told to `@source` the installed library so the utility classes the
   components render at runtime are generated.

Dark mode keys off `data-theme="dark"` on an ancestor (see `index.html`).

Edit `src/App.vue` and go.
