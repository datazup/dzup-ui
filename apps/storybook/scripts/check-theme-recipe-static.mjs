#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const staticRoot = resolve(import.meta.dirname, '../storybook-static')
const iframe = readFileSync(resolve(staticRoot, 'iframe.html'), 'utf8')
const index = JSON.parse(readFileSync(resolve(staticRoot, 'index.json'), 'utf8'))
const required = [
  'data-dz-theme-recipe-bootstrap="v1"',
  'dz-storybook-theme-recipe-css-v1',
  'data-theme-mode',
  'data-density',
  'data-motion-preview',
  "setAttribute('dir'",
]

for (const marker of required) {
  if (!iframe.includes(marker))
    throw new Error(`Static Storybook is missing ThemeRecipe marker: ${marker}`)
}

const entries = Object.values(index.entries ?? index.stories ?? {})
if (!entries.some(entry => entry.type === 'story'))
  throw new Error('Static Storybook index contains no stories.')

console.log(`ThemeRecipeV1 static Storybook contract: ${entries.length} entries checked.`)
