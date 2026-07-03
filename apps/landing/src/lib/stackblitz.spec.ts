/**
 * openInStackblitz — forks a runnable Vite + Vue 3 + @dzup-ui/core project on
 * StackBlitz with a block/template's source injected. This guards the two things
 * that make the forked project actually *run*:
 *   1. the whole in-repo starter (package.json, index.html, main.ts, …) ships, not
 *      just the injected file, and
 *   2. the `@dzup-ui/*` deps are pinned to the published range (the workspace
 *      `workspace:*` specifiers can't resolve inside StackBlitz).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DZUP_VERSION, openInStackblitz } from './stackblitz.ts'

/** Read a hidden field's value from a submitted form by its `name`. */
function field(form: HTMLFormElement, name: string): string | null {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`)
  return input ? input.value : null
}

describe('openInStackblitz', () => {
  afterEach(() => vi.restoreAllMocks())

  it('submits a StackBlitz form that boots the full starter with the source injected', () => {
    let submitted: HTMLFormElement | undefined
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(function (
      this: HTMLFormElement,
    ) {
      submitted = this
    })

    const source = '<template>\n  <DzButton>Hi</DzButton>\n</template>\n'
    openInStackblitz({
      title: 'Split hero — dzup-ui block',
      description: 'Copy left, media right.',
      files: { 'src/App.vue': source },
    })

    expect(submitted).toBeDefined()
    const form = submitted!

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
    let submitted: HTMLFormElement | undefined
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(function (
      this: HTMLFormElement,
    ) {
      submitted = this
    })

    openInStackblitz({
      title: 'Analytics Dashboard — dzup-ui template',
      description: 'A full dashboard.',
      files: {
        'src/App.vue': '<script setup lang="ts">import { rows } from "./data.ts"</script>',
        'src/data.ts': 'export const rows = []\n',
      },
    })

    const form = submitted!
    expect(field(form, 'project[files][src/data.ts]')).toContain('export const rows')
  })
})
