import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineMain } from '@storybook/vue3-vite/node'
import tailwindcss from '@tailwindcss/vite'
import remarkGfm from 'remark-gfm'
import { resolveRemoteDevelopmentServer } from '../../../packages/tooling/src/remote-development-server.ts'
import { workspaceAliases } from '../../../packages/tooling/src/workspace-aliases.ts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)

// TASK-FREE2-02 — the `Visual Refresh/*` screens are an internal instrument, not
// documentation. They render `freestyle/*.vue` mockups in raw Tailwind palette
// classes with zero dzup-ui components — deliberately untokenized, because they are
// the comparison TARGET that docs/visual-refresh/AUDIT.md scores the token system
// against (see packages/core/stories/_gallery/README.md). Shipped in the public
// sidebar they read as documentation exhibiting the exact style ADR-04 forbids.
//
// So: excluded from every build by default, and brought back for the team with
//   DZUP_GALLERY=1 yarn workspace @dzup-ui/storybook dev
// The rationale and the local-run path are recorded in docs/storybook-decisions.md.
//
// This is an INCLUSION flag rather than a glob negation on purpose: `stories`
// entries are globbed independently, so a trailing `!…` pattern is not guaranteed
// to subtract from an earlier entry. Naming what ships is verifiable; naming what
// doesn't is a hope. `check-mdx-links.mjs` asserts the built index.json carries no
// `visual-refresh-*` id, so this can never silently leak back.
const INCLUDE_GALLERY = process.env.DZUP_GALLERY === '1'

// TASK-FREE2-06 — the `Core/Feedback/App-Specific/*` badges encode datazup product
// vocabulary (agent-coordination patterns, team-run participants, LLM token budgets),
// not design-system semantics. A catalog is a promise of general-purpose reuse, and
// four entries no consumer can use blur it. They stay exported from @dzup-ui/core for
// the internal consumer and stay covered by every stories-tree validator — they just
// don't publish. Brought back with:
//   DZUP_APP_SPECIFIC=1 yarn workspace @dzup-ui/storybook dev
// Same inclusion-flag reasoning as INCLUDE_GALLERY above: a negation fails open. The
// files live in their own directory so a fifth one cannot quietly land in `feedback/`
// and ship. `check-mdx-links.mjs` asserts no `core-feedback-app-specific` id in a
// public index.json. Rationale in docs/storybook-decisions.md (supersedes TASK-X.4).
const INCLUDE_APP_SPECIFIC = process.env.DZUP_APP_SPECIFIC === '1'
const REMOTE_DEVELOPMENT_HOST = 'dzup-ui-storybook.dev.dziphost.com'
const REMOTE_DEVELOPMENT_ENABLED = process.env.APP_ENV === 'development-remote'

// Apply the last ThemeRecipeV1 cache before the preview bundle mounts. The Vue
// decorator remains authoritative and rewrites this state from Storybook
// globals; this synchronous bootstrap only prevents a theme/density flash.
const THEME_RECIPE_PREVIEW_BOOTSTRAP = `<script data-dz-theme-recipe-bootstrap="v1">(function(){try{var c=JSON.parse(localStorage.getItem('dz-storybook-theme-recipe-css-v1')||'null');if(!c||c.version!==1)return;var q=window.matchMedia('(prefers-color-scheme:dark)').matches;var t=c.mode==='dark'?'dark':c.mode==='light'?'light':q?'dark':'light';var r=document.documentElement;var v=c[t];if(v&&typeof v==='object'){Object.keys(v).forEach(function(k){r.style.setProperty(k,v[k])})}r.setAttribute('data-theme',t);r.setAttribute('data-theme-mode',c.mode);r.setAttribute('data-density',c.density);r.setAttribute('data-motion-preview',c.motion);r.setAttribute('dir',c.direction)}catch(e){}})()</script>`

export default defineMain({
  core: {
    // Storybook serves its manager outside Vite's `server.allowedHosts` check.
    // Keep that surface fail-closed as well as the Vite preview/HMR server.
    allowedHosts: REMOTE_DEVELOPMENT_ENABLED ? [REMOTE_DEVELOPMENT_HOST] : undefined,
  },
  // Addon registration is split across two files and the rule is NOT "keep the two
  // lists identical" — they answer different questions:
  //   • main.ts `addons`  — build-time: presets, Vite config, and MANAGER UI panels.
  //   • preview.ts `addons` — runtime: preview-side behavior (decorators, parameters).
  // Only addon-docs strictly needs an entry on both sides (manager UI here, doc
  // rendering there). a11y wires its preview behavior in preview.ts and is listed
  // here so its panel mounts on a fresh `storybook dev`. The ThemeRecipe toolbar
  // is declared by preview.ts globalTypes; addon-vitest is build-time only.
  // Adding an addon to one list does not imply adding it to the other; ask which
  // side needs it.
  addons: [
    // GitHub-flavoured markdown, for TABLES above all (TASK-FREE-14). MDX2+ ships
    // CommonMark only, which has no table syntax — so every `| a | b |` block in
    // this repo's MDX rendered as a literal row of pipes and dashes, in prose, in
    // the built docs. Thirteen files were affected, including every family
    // Overview's "when to use which" table. Nothing caught it because the page
    // still *built*: broken markdown is just text.
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  stories: [
    // Component families (buttons, cards, …). `_gallery` is excluded here and its
    // two halves re-added explicitly below — see INCLUDE_GALLERY above. `_app-specific`
    // is excluded outright unless flagged in — see INCLUDE_APP_SPECIFIC.
    '../../../packages/core/stories/!(_gallery|_app-specific)/**/*.stories.ts',
    // `_gallery/` holds two unrelated things. DzTokenBrowser IS public docs — it is
    // the `Guides/Design Tokens` page — so it is named explicitly rather than left
    // to a directory-wide glob that would drag the demo screens back in with it.
    '../../../packages/core/stories/_gallery/DzTokenBrowser.stories.ts',
    ...(INCLUDE_GALLERY ? ['../../../packages/core/stories/_gallery/*Gallery.stories.ts'] : []),
    ...(INCLUDE_APP_SPECIFIC ? ['../../../packages/core/stories/_app-specific/*.stories.ts'] : []),
    // Local app stories (intro, etc.)
    '../stories/**/*.mdx',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal(config) {
    // Tailwind CSS 4 — required for utility classes in component variants
    config.plugins = config.plugins || []
    config.plugins.push(tailwindcss())

    // @vue/repl (the "Try it now" doc block) imports `vue/compiler-sfc`. Two
    // problems bundling that for the browser, both fixed by a pre-enforced
    // resolveId that runs before alias resolution:
    //
    // 1. The Vue plugin's broad `vue` → `vue/dist/vue.esm-bundler.js` alias runs
    //    after this hook and would rewrite the specifier to the non-existent
    //    `…/vue.esm-bundler.js/compiler-sfc`.
    // 2. Node's default resolution picks compiler-sfc's CJS build, which bundles
    //    @vue/consolidate and its dozens of OPTIONAL, node-only template-engine
    //    requires (pug, velocityjs, teacup/lib/express, …) — unresolvable in the
    //    browser. We pin to the `esm-browser` build instead (the one
    //    play.vuejs.org uses): it drops consolidate entirely.
    const compilerSfcBrowser = require
      .resolve('@vue/compiler-sfc')
      .replace(/compiler-sfc\.cjs\.js$/, 'compiler-sfc.esm-browser.js')
    config.plugins.push({
      name: 'dzup-repl-compiler-sfc',
      enforce: 'pre',
      resolveId(id: string) {
        if (id === 'vue/compiler-sfc' || id.endsWith('vue.esm-bundler.js/compiler-sfc'))
          return { id: compilerSfcBrowser }
        return null
      },
    })

    // Workspace package aliases — Storybook doesn't auto-resolve yarn workspace
    // links to source. Single-sourced; see workspace-aliases.ts for the ordering
    // rule and why the token CSS targets resolve to dist/.
    config.resolve = config.resolve || {}
    config.resolve.alias = [
      // Keep the exact REPL compiler subpath ahead of the framework's broad
      // `vue` runtime alias. The pre-resolver above protects normal Storybook
      // builds; this alias also survives into @storybook/addon-vitest's derived
      // Vite config, where plugin ordering is different.
      { find: /^vue\/compiler-sfc$/, replacement: compilerSfcBrowser },
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
      ...workspaceAliases(resolve(__dirname, '../../..')),
    ]

    // Vite's dependency optimiser uses esbuild rather than the normal Vite
    // resolver. It consequently applies the framework's broad `vue` alias
    // before the compiler-SFC resolver above. Keep the browser-only REPL out
    // of that prebundle so normal Vite resolution can map its compiler import.
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
      '@vue/repl',
    ]

    const remoteDevelopment = resolveRemoteDevelopmentServer(
      process.env,
      REMOTE_DEVELOPMENT_HOST,
    )
    config.server = {
      ...config.server,
      ...remoteDevelopment.server,
    }

    return config
  },
  // Brand favicon (apps/storybook/public/favicon.svg — served at the manager
  // root by Vite's publicDir). Injected explicitly so the dzup-ui mark replaces
  // Storybook's default favicon on a fresh `dev` and in the built static app.
  managerHead: head =>
    `${head}\n<link rel="icon" type="image/svg+xml" href="./favicon.svg" />`,
  previewHead: head => `${head}\n${THEME_RECIPE_PREVIEW_BOOTSTRAP}`,
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
  },
})
