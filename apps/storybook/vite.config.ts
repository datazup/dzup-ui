import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

/**
 * Storybook's Vite config. **This file is load-bearing — do not delete it.**
 *
 * It looks unreferenced: no script names it, `storybook dev|build` are pointed at
 * `.storybook/main.ts`, and vitest uses `vitest.config.ts`. It is loaded anyway.
 * `@storybook/builder-vite` calls Vite's `loadConfigFromFile(configEnv, viteConfigPath,
 * projectRoot)` with `projectRoot = resolve(configDir, '..')` — i.e. `apps/storybook` —
 * and merges the result under its own config (`commonConfig()` in builder-vite's
 * `vite-config.ts`). So this is Storybook's Vite config, reached by convention rather
 * than by reference.
 *
 * **Why the vue plugin lives here and not in `main.ts`'s `viteFinal`.**
 * `@storybook/vue3-vite` does not depend on `@vitejs/plugin-vue` and never registers
 * it (check its `package.json` dependencies — the framework ships the renderer and
 * docgen only). The plugin has to come from this config, which is exactly what the
 * framework expects. Removing it fails the preview build with "Install
 * @vitejs/plugin-vue to handle .vue files" — verified, TASK-FREE-12.
 *
 * **Why there is nothing else here.** Until TASK-FREE-12 this file also carried
 * `tailwindcss()` and a hand-copied list of the six workspace aliases, both of which
 * `main.ts`'s `viteFinal` already supplies — so every Storybook build ran two Tailwind
 * plugin instances and resolved aliases from whichever of two copies happened to
 * agree. They didn't fully: this copy was missing `@dzup-ui/core/styles`. The aliases
 * now come from `packages/tooling/src/workspace-aliases.ts` via `viteFinal`, and
 * Tailwind is registered once, there. Keep this file limited to what only it can
 * provide.
 */
export default defineConfig({
  plugins: [vue()],
})
