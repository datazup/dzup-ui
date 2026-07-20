/**
 * AI-readable docs guard (docs/blocks.md §1.3, Task G2).
 *
 * The generator (`scripts/build-registry.ts`) writes `public/llms.txt`,
 * `public/llms-full.txt` and `public/r/<id>.md` from the real `BLOCKS` using the
 * pure shaping in `llmsText.ts` — but it boots Vite, so it does not run in CI.
 * This suite exercises that SAME shaping over the live catalog, so a malformed
 * doc (a block missing from the index, a broken deep link, a dropped source)
 * fails Vitest rather than shipping markdown an assistant would misread.
 */

import { describe, expect, it } from 'vitest'
import { SITE_ORIGIN } from '../origin.ts'
import {
  blockDeepLink,
  blockIndexLine,
  blockMarkdown,
  blockPrompt,
  llmsFullTxt,
  llmsTxt,
} from './llmsText.ts'
import { BLOCKS, CATEGORIES } from './registry.ts'

import { getBlockSource } from './sources.ts'

/** Injected source lookup — mirrors what the generator and the browser both pass. */
const getSource = (block: { path: string }): string => getBlockSource(block.path)

describe('llms.txt index', () => {
  const text = llmsTxt(BLOCKS, CATEGORIES)

  it('is a markdown doc led by an H1 and a summary blockquote', () => {
    const lines = text.split('\n')
    expect(lines[0]).toMatch(/^# /)
    expect(text).toContain('\n> ')
  })

  it('lists every block exactly once, linking its canonical /blocks/<id> page', () => {
    for (const block of BLOCKS) {
      const line = blockIndexLine(block)
      expect(text).toContain(line)
      expect(line).toContain(`(${blockDeepLink(block.id)})`)
      // one occurrence of the anchor — no duplicate or missing entry.
      const anchor = `](${blockDeepLink(block.id)})`
      expect(text.split(anchor).length - 1).toBe(1)
    }
  })

  it('names each block category as a section heading', () => {
    const used = new Set(BLOCKS.map(b => b.category))
    for (const category of CATEGORIES) {
      if (used.has(category.id))
        expect(text).toContain(`## ${category.label}`)
    }
  })

  it('stays an index — carries no fenced source (that is llms-full.txt)', () => {
    expect(text).not.toContain('```vue')
  })
})

describe('llms-full.txt', () => {
  const text = llmsFullTxt(BLOCKS, CATEGORIES, getSource)

  it('inlines every block title and its fenced SFC source', () => {
    for (const block of BLOCKS) {
      expect(text).toContain(`### ${block.title}`)
      expect(text).toContain(getBlockSource(block.path).trim())
    }
    // one ```vue fence opens per block (paired by a matching close).
    expect(text.split('```vue').length - 1).toBe(BLOCKS.length)
  })
})

describe('per-block markdown (r/<id>.md)', () => {
  it.each(BLOCKS.map(block => ({ block, label: block.id })))(
    'page "$label" is self-contained: title, description, components, deep link, source',
    ({ block }) => {
      const md = blockMarkdown(block, CATEGORIES, getSource)
      expect(md).toContain(`# ${block.title}`)
      expect(md).toContain(block.description)
      expect(md).toContain(block.components.join(', '))
      expect(md).toContain(blockDeepLink(block.id))
      expect(md).toContain(getBlockSource(block.path).trim())
      expect(md.endsWith('\n')).toBe(true)
    },
  )
})

describe('block prompt (copy as prompt, Task G3)', () => {
  const url = `${SITE_ORIGIN}/llms.txt`

  it.each(BLOCKS.map(block => ({ block, label: block.id })))(
    'prompt "$label" references llms.txt and restates title, description, components',
    ({ block }) => {
      const prompt = blockPrompt(block, url)
      expect(prompt).toContain(url)
      expect(prompt).toContain(block.title)
      expect(prompt).toContain(block.components.join(', '))
      // The description is restated (sans any trailing period), so an assistant
      // gets the same one-line intent shown in the UI.
      expect(prompt).toContain(block.description.replace(/[.\s]+$/, ''))
    },
  )

  it('is a single line that never doubles the sentence punctuation', () => {
    const [first] = BLOCKS
    expect(first).toBeDefined()
    const prompt = blockPrompt(first as (typeof BLOCKS)[number], url)
    expect(prompt).not.toContain('\n')
    expect(prompt).not.toContain('..')
    expect(prompt.endsWith('.')).toBe(true)
  })
})
