import type { Page } from '@playwright/test'
import type {
  ResponsiveProbe,
  ResponsiveProbeBlockId,
} from '../src/blocks/responsiveCertification.ts'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import {
  RESPONSIVE_PROBES,
  RESPONSIVE_VIEWPORTS,
} from '../src/blocks/responsiveCertification.ts'

interface PublishedRegistryIndex {
  items: Array<{ name: string, type: string }>
}

interface LayoutMetrics {
  bodyOverflow: number
  childCount: number
  documentOverflow: number
  frameOverflow: number
  frameOutsideLeft: number
  frameOutsideRight: number
  primaryOutsideLeft: number
  primaryOutsideRight: number
  rootOverflow: number
  textLength: number
}

/**
 * The generated registry is the browser suite's static test manifest. A paired
 * Vitest guard compares it with live `BLOCKS`, so a stale artifact cannot make
 * this pass while silently omitting a newly registered block.
 */
const publishedRegistry = JSON.parse(
  readFileSync(new URL('../public/r/registry.json', import.meta.url), 'utf8'),
) as PublishedRegistryIndex

const BLOCK_IDS = publishedRegistry.items
  .filter(item => item.type === 'registry:block')
  .map(item => item.name)

function isResponsiveProbeBlock(id: string): id is ResponsiveProbeBlockId {
  return Object.hasOwn(RESPONSIVE_PROBES, id)
}

/** Two animation frames let media queries, ResizeObservers, and Vue settle. */
async function settleResponsiveLayout(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
}

async function readLayoutMetrics(page: Page): Promise<LayoutMetrics> {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('.block-preview-root')
    const frame = document.querySelector<HTMLElement>('.block-preview-frame')
    const primary = frame?.firstElementChild as HTMLElement | null
    if (!root || !frame || !primary)
      throw new Error('Standalone preview did not render its root, frame, and block content')

    const viewportWidth = document.documentElement.clientWidth
    const frameRect = frame.getBoundingClientRect()
    const primaryRect = primary.getBoundingClientRect()
    return {
      bodyOverflow: Math.max(0, document.body.scrollWidth - viewportWidth),
      childCount: frame.children.length,
      documentOverflow: Math.max(0, document.documentElement.scrollWidth - viewportWidth),
      frameOverflow: Math.max(0, frame.scrollWidth - frame.clientWidth),
      frameOutsideLeft: Math.max(0, -frameRect.left),
      frameOutsideRight: Math.max(0, frameRect.right - viewportWidth),
      primaryOutsideLeft: Math.max(0, -primaryRect.left),
      primaryOutsideRight: Math.max(0, primaryRect.right - viewportWidth),
      rootOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
      textLength: frame.textContent?.trim().length ?? 0,
    }
  })
}

async function readProbeValue(page: Page, probe: ResponsiveProbe): Promise<string | number> {
  return page.locator(probe.selector).evaluate((element, property) => {
    const styles = getComputedStyle(element)
    if (property === 'gridColumns') {
      const columns = styles.gridTemplateColumns.trim()
      return columns === '' || columns === 'none' ? 0 : columns.split(/\s+/).length
    }
    if (property === 'flexDirection')
      return styles.flexDirection
    return styles.alignItems
  }, probe.property)
}

test.describe('block catalog — responsive certification', () => {
  test('uses a non-empty, duplicate-free registry manifest', () => {
    expect(BLOCK_IDS.length).toBeGreaterThan(0)
    expect(new Set(BLOCK_IDS).size).toBe(BLOCK_IDS.length)
  })

  for (const blockId of BLOCK_IDS) {
    test(`${blockId} renders and stays contained at every certified viewport`, async ({ page }) => {
      const runtimeErrors: string[] = []
      page.on('pageerror', error => runtimeErrors.push(error.message))

      const firstViewport = RESPONSIVE_VIEWPORTS[0]
      await page.setViewportSize(firstViewport)
      const response = await page.goto(
        `/blocks/preview/${blockId}?theme=light&dir=ltr`,
        { waitUntil: 'domcontentloaded' },
      )
      expect(response?.ok(), `${blockId}: standalone preview request failed`).toBe(true)
      await expect(page).toHaveURL(new RegExp(`/blocks/preview/${blockId}(?:\\?|$)`))

      const frame = page.locator('.block-preview-frame')
      await expect(frame).toBeVisible()
      await expect(frame.locator(':scope > *').first()).toBeVisible()

      for (const viewport of RESPONSIVE_VIEWPORTS) {
        await test.step(`${viewport.label} ${viewport.width}x${viewport.height}`, async () => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height })
          await settleResponsiveLayout(page)

          const metrics = await readLayoutMetrics(page)
          const evidence = `${blockId} @ ${viewport.id}: ${JSON.stringify(metrics)}`
          expect(metrics.childCount, `${evidence}; preview frame is empty`).toBeGreaterThan(0)
          expect(metrics.textLength, `${evidence}; preview has no meaningful text`).toBeGreaterThan(0)
          expect(metrics.documentOverflow, `${evidence}; document overflows horizontally`).toBeLessThanOrEqual(1)
          expect(metrics.bodyOverflow, `${evidence}; body overflows horizontally`).toBeLessThanOrEqual(1)
          expect(metrics.rootOverflow, `${evidence}; preview root overflows horizontally`).toBeLessThanOrEqual(1)
          expect(metrics.frameOverflow, `${evidence}; preview frame overflows horizontally`).toBeLessThanOrEqual(1)
          expect(metrics.frameOutsideLeft, `${evidence}; preview frame is clipped on the left`).toBeLessThanOrEqual(1)
          expect(metrics.frameOutsideRight, `${evidence}; preview frame is clipped on the right`).toBeLessThanOrEqual(1)
          expect(metrics.primaryOutsideLeft, `${evidence}; block root is clipped on the left`).toBeLessThanOrEqual(1)
          expect(metrics.primaryOutsideRight, `${evidence}; block root is clipped on the right`).toBeLessThanOrEqual(1)

          if (isResponsiveProbeBlock(blockId)) {
            const probe = RESPONSIVE_PROBES[blockId]
            const actual = await readProbeValue(page, probe)
            const expected = probe.expected[viewport.id]
            expect(
              actual,
              `${blockId} @ ${viewport.id}: ${probe.selector} ${probe.property} did not reflow`,
            ).toBe(expected)
          }
        })
      }

      expect(runtimeErrors, `${blockId}: uncaught browser errors`).toEqual([])
    })
  }
})
