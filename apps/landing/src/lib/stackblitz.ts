/**
 * Open a block or template's source in a live StackBlitz project.
 *
 * Both the /blocks/:id and /templates/:slug detail pages already have the item's
 * exact source available as a `?raw` string; this turns that source into a full,
 * runnable Vite + Vue 3 + @dzup-ui/core project on StackBlitz in one click —
 * removing the last step between "I like this" and "it runs in my editor".
 *
 * The starter project lives in-repo at `apps/landing/playground-template/`
 * (shared with the storybook "Open in StackBlitz" surface in spirit — one canonical
 * Vite+Vue+dzup starter) and is inlined here at build time via
 * `import.meta.glob('?raw')`, so the button always ships the current template. We
 * inject the item into `src/App.vue` (templates also bring their `src/data.ts`) and
 * stamp the published `@dzup-ui/*` version into the forked project's package.json.
 *
 * No SDK dependency: StackBlitz exposes a documented HTTP endpoint — a form POST to
 * `https://stackblitz.com/run` with `project[...]` fields creates and opens the
 * project. We build that form on demand and submit it to a new tab, so nothing
 * weighs on the app bundle and there's no extra package to install/keep in sync.
 */

/**
 * Published `@dzup-ui/*` version the StackBlitz starter installs from npm. Single
 * source of truth — keep in sync with `packages/core/package.json` `version`. The
 * landing app depends on the workspace copies (`workspace:*`), which can't resolve
 * inside StackBlitz, so the forked project pins the published range instead.
 */
export const DZUP_VERSION = '^0.1.0'

/** The StackBlitz "create project from an HTTP POST" endpoint. */
const STACKBLITZ_RUN_URL = 'https://stackblitz.com/run'

// Inline the in-repo starter template as { projectPath: contents }. Eager so it
// compiles into this chunk; keys are relative to this file (../../playground-template).
const RAW_TEMPLATE = import.meta.glob('../../playground-template/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const TEMPLATE_MARKER = 'playground-template/'

/**
 * Build the StackBlitz project files from the in-repo starter, overlaying the
 * injected files (e.g. `src/App.vue`, `src/data.ts`) and pinning the published
 * `@dzup-ui/*` versions so the fork installs from npm rather than the workspace.
 */
function buildFiles(injected: Record<string, string>): Record<string, string> {
  const files: Record<string, string> = {}
  for (const [path, contents] of Object.entries(RAW_TEMPLATE)) {
    const idx = path.indexOf(TEMPLATE_MARKER)
    if (idx === -1)
      continue
    files[path.slice(idx + TEMPLATE_MARKER.length)] = contents
  }

  // Overlay the injected source (App.vue and any siblings the item imports).
  Object.assign(files, injected)

  // Pin @dzup-ui/* to the current published version (single source of truth).
  if (files['package.json']) {
    try {
      const pkg = JSON.parse(files['package.json']) as {
        dependencies?: Record<string, string>
      }
      pkg.dependencies = pkg.dependencies ?? {}
      pkg.dependencies['@dzup-ui/core'] = DZUP_VERSION
      pkg.dependencies['@dzup-ui/tokens'] = DZUP_VERSION
      pkg.dependencies['@dzup-ui/contracts'] = DZUP_VERSION
      files['package.json'] = `${JSON.stringify(pkg, null, 2)}\n`
    }
    catch {
      // Leave the starter's package.json untouched if it isn't parseable.
    }
  }

  return files
}

/** Append one hidden `<input name=… value=…>` to a form. */
function addField(form: HTMLFormElement, name: string, value: string): void {
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = name
  input.value = value
  form.appendChild(input)
}

export interface OpenInStackblitzOptions {
  /** Project title shown in StackBlitz. */
  title: string
  /** Short project description. */
  description: string
  /**
   * Files to overlay on the starter, keyed by project-relative path. The main
   * source goes to `src/App.vue`; a template's data module to `src/data.ts`.
   */
  files: Record<string, string>
  /** File to focus when the project opens (defaults to `src/App.vue`). */
  openFile?: string
}

/**
 * Fork the dzup-ui starter on StackBlitz with the given files injected, opening it
 * in a new tab. Builds and submits the documented `stackblitz.com/run` form; the
 * form is removed immediately after submission. No-op during SSR/prerender.
 */
export function openInStackblitz(options: OpenInStackblitzOptions): void {
  if (typeof document === 'undefined')
    return

  const openFile = options.openFile ?? 'src/App.vue'
  const files = buildFiles(options.files)

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `${STACKBLITZ_RUN_URL}?file=${encodeURIComponent(openFile)}`
  form.target = '_blank'
  form.rel = 'noopener noreferrer'
  form.style.display = 'none'

  addField(form, 'project[title]', options.title)
  addField(form, 'project[description]', options.description)
  // A full Vite project (its own package.json defines the deps) → the `node`
  // template, which StackBlitz boots in a WebContainer and runs `npm run dev`.
  addField(form, 'project[template]', 'node')
  addField(form, 'project[settings]', JSON.stringify({ compile: { clearConsole: false } }))
  for (const [path, contents] of Object.entries(files)) {
    addField(form, `project[files][${path}]`, contents)
  }

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}
