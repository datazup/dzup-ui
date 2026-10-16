/**
 * getting-started-parity.spec.ts — the Storybook Getting Started page and the
 * VitePress guide tell a new adopter the same setup (UI-DZUP-UI-UX-M-09).
 *
 * Every landing "Getting started" link opens the Storybook page, which used to
 * install only core + tokens and import only the token CSS: components rendered
 * unstyled and a yarn berry install lacked the `reka-ui` peer. The VitePress
 * guide is the one whose install line a packed-tarball fixture checks, so the
 * Storybook page is pinned to it, block for block, for the steps that make a
 * first component render: the install commands, the Vite plugin, the
 * `style.css` imports and the entry import.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const STORYBOOK = readFileSync(resolve(ROOT, 'apps/storybook/stories/GettingStarted.mdx'), 'utf8')
const VITEPRESS = readFileSync(resolve(ROOT, 'apps/docs/guide/getting-started.md'), 'utf8')

/** The body of a `## heading` section, up to the next `## `. */
function section(doc: string, heading: string): string {
  const start = doc.indexOf(`\n## ${heading}\n`)
  if (start < 0)
    return ''
  const rest = doc.slice(start + heading.length + 5)
  const end = rest.search(/\n## /)
  return end < 0 ? rest : rest.slice(0, end)
}

/** Every fenced code block in `text`, as `lang\nbody`. */
function fences(text: string): string[] {
  return [...text.matchAll(/```(\w*)\n([\s\S]*?)```/g)].map(([, lang, body]) => `${lang}\n${body!.trimEnd()}`)
}

describe('getting started: Storybook page matches the VitePress guide', () => {
  it.each(['Install', 'Generate the component utilities'])('the "%s" code blocks are identical', (heading) => {
    const expected = fences(section(VITEPRESS, heading))
    // A section that lost its fences would make the comparison vacuous.
    expect(expected.length).toBeGreaterThan(0)
    expect(fences(section(STORYBOOK, heading))).toEqual(expected)
  })

  it('installs vue, reka-ui and tailwindcss beside core and tokens', () => {
    const install = fences(section(STORYBOOK, 'Install')).join('\n')
    for (const pkg of ['@dzup-ui/core', '@dzup-ui/tokens', 'vue@', 'reka-ui@', 'tailwindcss@'])
      expect(install).toContain(pkg)
  })

  it('shows the style.css block with the core styles and the @source scan', () => {
    const css = fences(section(STORYBOOK, 'Generate the component utilities')).find(block => block.startsWith('css\n'))
    expect(css).toContain('@import "tailwindcss";')
    expect(css).toContain('@import "@dzup-ui/core/styles";')
    expect(css).toMatch(/@source "[^"]*@dzup-ui\/core\/dist";/)
  })
})
