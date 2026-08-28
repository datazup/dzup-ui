/**
 * TASK-TV2-02 — the /templates hero depth field.
 *
 * The field floats REAL committed screenshots of featured templates as parallax
 * postcards. These specs pin the contract:
 *
 *   1. decoration only — aria-hidden + inert host, no interactive descendants,
 *      every img lazy + dimensioned;
 *   2. the postcards are the first five FEATURED registry rows, showing their
 *      light screenshots by default;
 *   3. a dark provider swaps every postcard to its `-dark` screenshot;
 *   4. every referenced file — light and dark — exists on disk (the field can
 *      never point at a screenshot the build doesn't guarantee).
 *
 * The parallax/float motion is CSS + pointer driven — jsdom asserts none of it.
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DzThemeProvider } from '@dzup-ui/core'
import { cleanup, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { TEMPLATES } from '../../templates/registry.ts'
import { templateThumb, templateThumbDark } from '../../templates/thumbs.ts'
import TemplatesHeroField from './TemplatesHeroField.vue'

const PUBLIC_DIR = resolve(__dirname, '../../../public')

/** The composition contract: the first five featured registry rows. */
const FEATURED = TEMPLATES.filter(t => t.featured).slice(0, 5)

beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

async function renderField(theme: 'light' | 'dark' = 'light') {
  // The provider persists the preference; clear so `defaultTheme` always wins.
  window.localStorage.clear()
  const utils = render(
    defineComponent({
      setup: () => () =>
        h(DzThemeProvider, { defaultTheme: theme }, { default: () => h(TemplatesHeroField) }),
    }),
  )
  // The field renders nothing until its post-paint `ready` gate flips.
  await flushPromises()
  return utils.container as HTMLElement
}

function fieldHost(container: HTMLElement): HTMLElement {
  const host = container.querySelector<HTMLElement>('.tv2-hero-field')
  if (!host)
    throw new Error('hero field not rendered')
  return host
}

describe('templatesHeroField (TASK-TV2-02)', () => {
  it('is pure decoration: aria-hidden + inert, nothing interactive, imgs lazy and dimensioned', async () => {
    const container = await renderField()
    const host = fieldHost(container)
    expect(host.getAttribute('aria-hidden')).toBe('true')
    expect(host.hasAttribute('inert')).toBe(true)
    expect(host.querySelector('a, button, input, [tabindex]')).toBeNull()
    const imgs = [...host.querySelectorAll('img')]
    expect(imgs.length).toBeGreaterThan(0)
    for (const img of imgs) {
      expect(img.getAttribute('alt')).toBe('')
      expect(img.getAttribute('loading')).toBe('lazy')
      expect(img.getAttribute('decoding')).toBe('async')
      expect(img.getAttribute('width')).toBeTruthy()
      expect(img.getAttribute('height')).toBeTruthy()
    }
  })

  it('floats the first five featured templates, light screenshots by default', async () => {
    const container = await renderField()
    const srcs = [...fieldHost(container).querySelectorAll('img')].map(i => i.getAttribute('src'))
    expect(srcs).toEqual(FEATURED.map(t => templateThumb(t)))
  })

  it('swaps every postcard to its -dark screenshot under a dark provider', async () => {
    const container = await renderField('dark')
    const srcs = [...fieldHost(container).querySelectorAll('img')].map(i => i.getAttribute('src'))
    expect(srcs).toEqual(FEATURED.map(t => templateThumbDark(t)))
  })

  it('references only screenshots that exist on disk — light and dark', () => {
    for (const t of FEATURED) {
      expect(existsSync(resolve(PUBLIC_DIR, `.${templateThumb(t)}`)), `${templateThumb(t)} missing`).toBe(true)
      expect(
        existsSync(resolve(PUBLIC_DIR, `.${templateThumbDark(t)}`)),
        `${templateThumbDark(t)} missing`,
      ).toBe(true)
    }
  })
})
