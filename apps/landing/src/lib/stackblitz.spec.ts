/**
 * openInStackblitz — forks a runnable Vite + Vue 3 + @dzup-ui/core project on
 * StackBlitz with a block/template's source injected. This guards the two things
 * that make the forked project actually *run*:
 *   1. the whole in-repo starter (package.json, index.html, main.ts, …) ships, not
 *      just the injected file, and
 *   2. the `@dzup-ui/*` deps are pinned to the published range (the workspace
 *      `workspace:*` specifiers can't resolve inside StackBlitz).
 *
 * …and the gate that keeps it honest until then: the project installs from npm,
 * so while the packages are unpublished the fork is a no-op rather than a boot
 * that dies on `npm install` (TASK-FREE3-03). Every "it works" case therefore
 * runs with the publish flag stubbed ON; the OFF case is asserted explicitly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DZUP_VERSION, openInStackblitz } from './stackblitz.ts'

/** Read a hidden field's value from a submitted form by its `name`. */
function field(form: HTMLFormElement, name: string): string | null {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`)
  return input ? input.value : null
}

describe('openInStackblitz', () => {
  beforeEach(() => vi.stubEnv('VITE_PACKAGES_PUBLISHED', 'true'))
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('is a no-op until the packages are published — no fork that fails npm install', () => {
    vi.stubEnv('VITE_PACKAGES_PUBLISHED', '')
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {})

    openInStackblitz({
      title: 'Split hero — dzup-ui block',
      description: 'Copy left, media right.',
      files: { 'src/App.vue': '<template />' },
    })

    expect(submit).not.toHaveBeenCalled()
  })

  it('submits a StackBlitz form that boots the full starter with the source injected', () => {
    // `submit()` is called on the transient form, so the spy's recorded `this` IS
    // the form under test.
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {})

    const source = '<template>\n  <DzButton>Hi</DzButton>\n</template>\n'
    openInStackblitz({
      title: 'Split hero — dzup-ui block',
      description: 'Copy left, media right.',
      files: { 'src/App.vue': source },
    })

    const form = submit.mock.contexts[0] as HTMLFormElement
    expect(form).toBeDefined()

    // Posts to the documented create-project endpoint, opening the item's file.
    expect(form.method.toLowerCase()).toBe('post')
    expect(form.action).toContain('stackblitz.com/run')
    expect(form.action).toContain(`file=${encodeURIComponent('src/App.vue')}`)
    expect(form.target).toBe('_blank')

    // A full Vite project → the node template StackBlitz boots and `npm run dev`s.
    expect(field(form, 'project[template]')).toBe('node')
    expect(field(form, 'project[title]')).toBe('Split hero — dzup-ui block')

    // The injected source becomes src/App.vue …
    expect(field(form, 'project[files][src/App.vue]')).toBe(source)
    // … and the WHOLE starter ships, so the project actually runs.
    expect(field(form, 'project[files][src/main.ts]')).toContain('createApp')
    expect(field(form, 'project[files][index.html]')).toContain('<div id="app">')

    // Deps are pinned to the published range (workspace:* can't resolve remotely).
    const pkg = JSON.parse(field(form, 'project[files][package.json]')!)
    expect(pkg.dependencies['@dzup-ui/core']).toBe(DZUP_VERSION)
    expect(pkg.dependencies['@dzup-ui/tokens']).toBe(DZUP_VERSION)
    expect(pkg.dependencies['@dzup-ui/core']).not.toContain('workspace')

    // The transient form is cleaned up after submission.
    expect(document.body.contains(form)).toBe(false)
  })

  it('injects a template data module alongside App.vue when provided', () => {
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {})

    openInStackblitz({
      title: 'Analytics Dashboard — dzup-ui template',
      description: 'A full dashboard.',
      files: {
        'src/App.vue': '<script setup lang="ts">import { rows } from "./data.ts"</script>',
        'src/data.ts': 'export const rows = []\n',
      },
    })

    const form = submit.mock.contexts[0] as HTMLFormElement
    expect(field(form, 'project[files][src/data.ts]')).toContain('export const rows')
  })
})
