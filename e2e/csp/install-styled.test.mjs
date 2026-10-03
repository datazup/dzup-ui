// Native Node proves the public setup without Vitest aliases or transforms.
/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../../', import.meta.url)

test('getting-started and README give the same complete utility stylesheet', () => {
  const guide = readFileSync(new URL('apps/docs/guide/getting-started.md', root), 'utf8')
  const readme = readFileSync(new URL('README.md', root), 'utf8')
  const css = guide.match(/```css\n([\s\S]*?)```/)?.[1]
  assert.ok(css, 'getting-started must document the app stylesheet')
  assert.match(css, /@import ['"]tailwindcss['"]/)
  assert.match(css, /@import ['"]@dzup-ui\/tokens\/css['"]/)
  assert.match(css, /@import ['"]@dzup-ui\/core\/styles['"]/)
  assert.match(css, /@source ['"]\.\.\/node_modules\/@dzup-ui\/core\/dist['"]/)
  assert.equal(readme.match(/```css\n([\s\S]*?)```/)?.[1], css)
  for (const text of [guide, readme]) {
    assert.match(text, /yarn add -D tailwindcss@\^4 @tailwindcss\/vite@\^4/)
    assert.match(text, /tailwindcss\(\)/)
    assert.match(text, /import ['"]\.\/style\.css['"]/)
  }
})
