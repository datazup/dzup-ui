import type { Page } from '@playwright/test'

/** One box whose own overflow rule cuts its content off vertically. */
export interface ClippedBox {
  /** Position inside `#storybook-root`, stable between the two reads of one render. */
  path: string
  tag: string
  clientHeight: number
  scrollHeight: number
}

/**
 * Every box inside the story canvas whose vertical overflow is CLIPPED and whose
 * content is taller than the box.
 *
 * **Vertical only, deliberately.** A box that clips horizontally is usually a
 * carousel viewport, a scroller, or a `text-overflow: ellipsis` label — designed
 * truncation with the content still reachable, which is not what SC 1.4.4 or SC
 * 1.4.12 call loss of content. Vertical clipping is the failure both criteria
 * actually produce: bigger text or looser leading inside a box whose height was
 * fixed by the author, with the last line cut off and no way to reach it. Adding
 * the horizontal axis would report ~every carousel and data table in the
 * catalogue and get the lane switched off.
 *
 * `overflow: auto`/`scroll` is excluded for the same reason: the content is
 * reachable. Zero-height boxes are excluded because a collapsed accordion panel
 * is `height: 0; overflow: hidden` holding its full content, which is a
 * disclosure pattern, not a clip. Portalled content (a dialog teleported to
 * `<body>`) is out of this scope, exactly as it is for the focus-indicator
 * assertion above.
 */
export async function measureVerticalClipping(page: Page): Promise<ClippedBox[]> {
  return page.evaluate(() => {
    const root = document.querySelector('#storybook-root')
    if (root === null)
      return []

    function pathOf(element: Element): string {
      const parts: string[] = []
      let node: Element | null = element
      while (node !== null && node !== root) {
        const parent: HTMLElement | null = node.parentElement
        const index = parent === null ? 0 : [...parent.children].indexOf(node)
        parts.unshift(`${node.tagName}[${index}]`)
        node = parent
      }
      return parts.join('>')
    }

    const out: { path: string, tag: string, clientHeight: number, scrollHeight: number }[] = []
    for (const el of [root, ...root.querySelectorAll('*')]) {
      const style = getComputedStyle(el)
      if (style.overflowY !== 'hidden' && style.overflowY !== 'clip')
        continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0 || !el.checkVisibility())
        continue
      if ((el.textContent ?? '').trim() === '')
        continue
      // 2px of tolerance: sub-pixel layout and a rounded corner's clip both land
      // inside it, and neither hides a line of text.
      if (el.scrollHeight - el.clientHeight <= 2)
        continue
      out.push({
        path: pathOf(el),
        tag: el.tagName.toLowerCase(),
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
      })
    }
    return out
  })
}
