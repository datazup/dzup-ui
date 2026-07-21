/**
 * AutodocsPage — the custom autodocs template, set globally as `docs.page` in
 * `.storybook/preview.ts` (TASK-FREE2-12).
 *
 * It is a byte-for-byte mirror of Storybook 10.5's built-in `DocsPage`
 * (node_modules/@storybook/addon-docs → Title/Subtitle/Description/Primary/Controls/
 * Stories, with the single-story special-casing) with ONE addition: an
 * `<OpenInPlayground/>` block injected right after the primary demo, where a reader's
 * intent to "try it myself" is highest.
 *
 * WHY a custom page and not a `docs.container` wrapper: `docs.page` applies ONLY to
 * autodocs (tag-generated) pages — MDX guide pages (Introduction, family Overviews,
 * Contributing) supply their own page and are untouched. That scopes the playground
 * to component pages automatically, with no page-type sniffing. OpenInPlayground
 * itself renders nothing when the page's component has no snippet, so the rare
 * autodocs page without a `Core/<Family>/<Component>` title stays clean too.
 *
 * If Storybook's default template changes in a future major, this mirror must be
 * re-synced — the blocks it composes are stable public API, but their arrangement
 * is not contractual. verify-repl.mjs asserts the playground renders on real
 * component pages, so a drift that drops the injection fails CI.
 */
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks'
import { Fragment, createElement as h } from 'react'
import { OpenInPlayground } from './OpenInPlayground.ts'

/** Component name for the current docs page = last segment of its story title. */
function componentFromTitle(title: string | undefined): string | undefined {
  if (!title)
    return undefined
  const segments = title.split('/')
  return segments[segments.length - 1]
}

export function AutodocsPage() {
  let title: string | undefined
  let isSingleStory = false
  try {
    const resolved = useOf('meta', ['meta']) as {
      preparedMeta?: { title?: string }
      csfFile?: { stories?: Record<string, unknown> }
    }
    title = resolved.preparedMeta?.title
    isSingleStory = Object.keys(resolved.csfFile?.stories ?? {}).length === 1
  }
  catch {
    // No attached meta (shouldn't happen on an autodocs page) — degrade to the
    // stock blocks with no playground rather than throwing the whole page.
  }

  return h(
    Fragment,
    null,
    h(Title),
    h(Subtitle),
    h(Description, { of: 'meta' }),
    isSingleStory ? h(Description, { of: 'story' }) : null,
    h(Primary),
    h(OpenInPlayground, { component: componentFromTitle(title) }),
    h(Controls),
    isSingleStory ? null : h(Stories),
  )
}
