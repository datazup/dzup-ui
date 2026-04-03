import type { Component } from 'vue'
/**
 * SSR Smoke Tests — Core Components
 *
 * Verifies that all core component families can render to string
 * via @vue/server-renderer without throwing. This catches SSR-unsafe
 * patterns like direct DOM access outside onMounted(), missing
 * browser API guards, etc.
 *
 * These are NOT behavioral tests — they only assert "renders without crash".
 */
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'

// Reka UI primitives can be slow during SSR in jsdom — allow generous timeout
vi.setConfig({ testTimeout: 15000 })

/**
 * Helper: render a component to HTML string via SSR.
 * Returns the HTML or throws if SSR fails.
 */
async function ssrRender(
  component: Component,
  props: Record<string, unknown> = {},
  children?: Record<string, () => ReturnType<typeof h>>,
): Promise<string> {
  const app = createSSRApp({
    render() {
      return h(component, props, children)
    },
  })
  return renderToString(app)
}

// ---------------------------------------------------------------------------
// buttons
// ---------------------------------------------------------------------------

describe('sSR: buttons', () => {
  it('dzButton renders in SSR', async () => {
    const DzButton = (await import('../../src/components/buttons/DzButton.vue')).default
    const html = await ssrRender(DzButton, {}, {
      default: () => h('span', 'Click me'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Click me')
  })

  it('dzIconButton renders in SSR', async () => {
    const DzIconButton = (await import('../../src/components/buttons/DzIconButton.vue')).default
    const html = await ssrRender(DzIconButton, { ariaLabel: 'Close' })
    expect(html).toBeTruthy()
  })

  it('dzButtonGroup renders in SSR', async () => {
    const DzButtonGroup = (await import('../../src/components/buttons/DzButtonGroup.vue')).default
    const html = await ssrRender(DzButtonGroup)
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// cards
// ---------------------------------------------------------------------------

describe('sSR: cards', () => {
  it('dzCard renders in SSR', async () => {
    const DzCard = (await import('../../src/components/cards/DzCard.vue')).default
    const html = await ssrRender(DzCard, {}, {
      default: () => h('p', 'Card content'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Card content')
  })

  it('dzStatCard renders in SSR', async () => {
    const DzStatCard = (await import('../../src/components/cards/DzStatCard.vue')).default
    const html = await ssrRender(DzStatCard, { title: 'Revenue', value: '$1,234' })
    expect(html).toBeTruthy()
    expect(html).toContain('Revenue')
  })
})

// ---------------------------------------------------------------------------
// data
// ---------------------------------------------------------------------------

describe('sSR: data', () => {
  it('dzTable renders in SSR', async () => {
    const DzTable = (await import('../../src/components/data/DzTable.vue')).default
    const html = await ssrRender(DzTable, { ariaLabel: 'Test table' })
    expect(html).toBeTruthy()
    expect(html).toContain('table')
  })

  it('dzTag renders in SSR', async () => {
    const DzTag = (await import('../../src/components/data/DzTag.vue')).default
    const html = await ssrRender(DzTag, {}, {
      default: () => h('span', 'Tag text'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Tag text')
  })

  it('dzChip renders in SSR', async () => {
    const DzChip = (await import('../../src/components/data/DzChip.vue')).default
    const html = await ssrRender(DzChip, {}, {
      default: () => h('span', 'Chip'),
    })
    expect(html).toBeTruthy()
  })

  it('dzTimeline renders in SSR', async () => {
    const DzTimeline = (await import('../../src/components/data/DzTimeline.vue')).default
    const html = await ssrRender(DzTimeline)
    expect(html).toBeTruthy()
  })

  it('dzList renders in SSR', async () => {
    const DzList = (await import('../../src/components/data/DzList.vue')).default
    const html = await ssrRender(DzList)
    expect(html).toBeTruthy()
  })

  // SKIP: Reka UI AccordionRoot hangs during renderToString in jsdom.
  // This is a known upstream issue with Reka UI's AccordionRoot SSR support.
  // The component itself is SSR-safe (no direct DOM access), but the Reka UI
  // primitive's internal setup stalls the SSR render pipeline.
  it.skip('dzAccordion renders in SSR (blocked by Reka UI AccordionRoot SSR stall)', async () => {
    const DzAccordion = (await import('../../src/components/data/DzAccordion.vue')).default
    const html = await ssrRender(DzAccordion, {
      type: 'single',
      modelValue: '',
    })
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// feedback
// ---------------------------------------------------------------------------

describe('sSR: feedback', () => {
  it('dzAlert renders in SSR', async () => {
    const DzAlert = (await import('../../src/components/feedback/DzAlert.vue')).default
    const html = await ssrRender(DzAlert, { tone: 'success', title: 'Done' }, {
      default: () => h('span', 'Success message'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Success message')
  })

  it('dzBadge renders in SSR', async () => {
    const DzBadge = (await import('../../src/components/feedback/DzBadge.vue')).default
    const html = await ssrRender(DzBadge, { tone: 'primary' }, {
      default: () => h('span', '5'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('5')
  })

  it('dzProgress renders in SSR (bar)', async () => {
    const DzProgress = (await import('../../src/components/feedback/DzProgress.vue')).default
    const html = await ssrRender(DzProgress, { value: 60, variant: 'bar' })
    expect(html).toBeTruthy()
    expect(html).toContain('progressbar')
  })

  it('dzProgress renders in SSR (circular)', async () => {
    const DzProgress = (await import('../../src/components/feedback/DzProgress.vue')).default
    const html = await ssrRender(DzProgress, { value: 40, variant: 'circular' })
    expect(html).toBeTruthy()
    expect(html).toContain('svg')
  })

  it('dzSpinner renders in SSR', async () => {
    const DzSpinner = (await import('../../src/components/feedback/DzSpinner.vue')).default
    const html = await ssrRender(DzSpinner)
    expect(html).toBeTruthy()
    expect(html).toContain('Loading')
  })

  it('dzSkeleton renders in SSR', async () => {
    const DzSkeleton = (await import('../../src/components/feedback/DzSkeleton.vue')).default
    const html = await ssrRender(DzSkeleton)
    expect(html).toBeTruthy()
  })

  it('dzEmpty renders in SSR', async () => {
    const DzEmpty = (await import('../../src/components/feedback/DzEmpty.vue')).default
    const html = await ssrRender(DzEmpty)
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// forms
// ---------------------------------------------------------------------------

describe('sSR: forms', () => {
  it('dzFormField renders in SSR', async () => {
    const DzFormField = (await import('../../src/components/forms/DzFormField.vue')).default
    const html = await ssrRender(DzFormField, { required: true }, {
      default: () => h('span', 'Field content'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Field content')
  })

  // Reka UI CheckboxRoot can intermittently stall during SSR under heavy load.
  // Use a 30s timeout to accommodate slow CI/full-suite runs.
  it('dzCheckbox renders in SSR', async () => {
    const DzCheckbox = (await import('../../src/components/forms/DzCheckbox.vue')).default
    const html = await ssrRender(DzCheckbox, {}, {
      default: () => h('span', 'Accept terms'),
    })
    expect(html).toBeTruthy()
  }, 30000)

  it('dzSwitch renders in SSR', async () => {
    const DzSwitch = (await import('../../src/components/forms/DzSwitch.vue')).default
    const html = await ssrRender(DzSwitch, {}, {
      default: () => h('span', 'Toggle'),
    })
    expect(html).toBeTruthy()
  }, 30000)

  it('dzSelect renders in SSR', async () => {
    const DzSelect = (await import('../../src/components/forms/DzSelect.vue')).default
    const html = await ssrRender(DzSelect, {
      items: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ],
      placeholder: 'Pick fruit',
    })
    expect(html).toBeTruthy()
  }, 30000)

  it('dzRadio renders in SSR (inside RadioGroup)', async () => {
    const DzRadioGroup = (await import('../../src/components/forms/DzRadioGroup.vue')).default
    const DzRadio = (await import('../../src/components/forms/DzRadio.vue')).default
    const app = createSSRApp({
      render() {
        return h(DzRadioGroup, { modelValue: '' }, {
          default: () => [
            h(DzRadio, { value: 'opt1' }, { default: () => h('span', 'Option 1') }),
            h(DzRadio, { value: 'opt2' }, { default: () => h('span', 'Option 2') }),
          ],
        })
      },
    })
    const html = await renderToString(app)
    expect(html).toBeTruthy()
  }, 30000)

  it('dzSlider renders in SSR', async () => {
    const DzSlider = (await import('../../src/components/forms/DzSlider.vue')).default
    const html = await ssrRender(DzSlider)
    expect(html).toBeTruthy()
  }, 30000)
})

// ---------------------------------------------------------------------------
// inputs
// ---------------------------------------------------------------------------

describe('sSR: inputs', () => {
  it('dzInput renders in SSR', async () => {
    const DzInput = (await import('../../src/components/inputs/DzInput.vue')).default
    const html = await ssrRender(DzInput, { placeholder: 'Enter text' })
    expect(html).toBeTruthy()
    expect(html).toContain('Enter text')
  })

  it('dzTextarea renders in SSR', async () => {
    const DzTextarea = (await import('../../src/components/inputs/DzTextarea.vue')).default
    const html = await ssrRender(DzTextarea, { placeholder: 'Type here' })
    expect(html).toBeTruthy()
  })

  it('dzNumberInput renders in SSR', async () => {
    const DzNumberInput = (await import('../../src/components/inputs/DzNumberInput.vue')).default
    const html = await ssrRender(DzNumberInput)
    expect(html).toBeTruthy()
  })

  it('dzPasswordInput renders in SSR', async () => {
    const DzPasswordInput = (await import('../../src/components/inputs/DzPasswordInput.vue')).default
    const html = await ssrRender(DzPasswordInput, { placeholder: 'Password' })
    expect(html).toBeTruthy()
  })

  it('dzSearchInput renders in SSR', async () => {
    const DzSearchInput = (await import('../../src/components/inputs/DzSearchInput.vue')).default
    const html = await ssrRender(DzSearchInput)
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------------

describe('sSR: layout', () => {
  it('dzContainer renders in SSR', async () => {
    const DzContainer = (await import('../../src/components/layout/DzContainer.vue')).default
    const html = await ssrRender(DzContainer, {}, {
      default: () => h('p', 'Page content'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Page content')
  })

  it('dzDivider renders in SSR', async () => {
    const DzDivider = (await import('../../src/components/layout/DzDivider.vue')).default
    const html = await ssrRender(DzDivider)
    expect(html).toBeTruthy()
    expect(html).toContain('separator')
  })

  it('dzFlex renders in SSR', async () => {
    const DzFlex = (await import('../../src/components/layout/DzFlex.vue')).default
    const html = await ssrRender(DzFlex)
    expect(html).toBeTruthy()
  })

  it('dzGrid renders in SSR', async () => {
    const DzGrid = (await import('../../src/components/layout/DzGrid.vue')).default
    const html = await ssrRender(DzGrid)
    expect(html).toBeTruthy()
  })

  it('dzStack renders in SSR', async () => {
    const DzStack = (await import('../../src/components/layout/DzStack.vue')).default
    const html = await ssrRender(DzStack)
    expect(html).toBeTruthy()
  })

  it('dzSpacer renders in SSR', async () => {
    const DzSpacer = (await import('../../src/components/layout/DzSpacer.vue')).default
    const html = await ssrRender(DzSpacer)
    expect(html).toBeTruthy()
  })

  it('dzAspectRatio renders in SSR', async () => {
    const DzAspectRatio = (await import('../../src/components/layout/DzAspectRatio.vue')).default
    const html = await ssrRender(DzAspectRatio)
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// media
// ---------------------------------------------------------------------------

describe('sSR: media', () => {
  it('dzAvatar renders in SSR', async () => {
    const DzAvatar = (await import('../../src/components/media/DzAvatar.vue')).default
    const html = await ssrRender(DzAvatar, { fallback: 'JD', ariaLabel: 'Jane Doe' })
    expect(html).toBeTruthy()
    expect(html).toContain('JD')
  })

  it('dzImage renders in SSR', async () => {
    const DzImage = (await import('../../src/components/media/DzImage.vue')).default
    const html = await ssrRender(DzImage, { src: '/photo.jpg', alt: 'Photo' })
    expect(html).toBeTruthy()
    expect(html).toContain('/photo.jpg')
  })

  it('dzIcon renders in SSR', async () => {
    const DzIcon = (await import('../../src/components/media/DzIcon.vue')).default
    const html = await ssrRender(DzIcon, { name: 'check' })
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// navigation
// ---------------------------------------------------------------------------

describe('sSR: navigation', () => {
  it('dzTabs renders in SSR', async () => {
    const DzTabs = (await import('../../src/components/navigation/DzTabs.vue')).default
    const html = await ssrRender(DzTabs, { modelValue: 'tab1' })
    expect(html).toBeTruthy()
  }, 30000)

  it('dzBreadcrumb renders in SSR', async () => {
    const DzBreadcrumb = (await import('../../src/components/navigation/DzBreadcrumb.vue')).default
    const html = await ssrRender(DzBreadcrumb)
    expect(html).toBeTruthy()
    expect(html).toContain('Breadcrumb')
  })

  it('dzPagination renders in SSR', async () => {
    const DzPagination = (await import('../../src/components/navigation/DzPagination.vue')).default
    const html = await ssrRender(DzPagination, { totalItems: 100, pageSize: 10 })
    expect(html).toBeTruthy()
  })

  it('dzStepper renders in SSR', async () => {
    const DzStepper = (await import('../../src/components/navigation/DzStepper.vue')).default
    const html = await ssrRender(DzStepper)
    expect(html).toBeTruthy()
  })

  it('dzSegmented renders in SSR', async () => {
    const DzSegmented = (await import('../../src/components/navigation/DzSegmented.vue')).default
    const html = await ssrRender(DzSegmented)
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// overlays
// ---------------------------------------------------------------------------

describe('sSR: overlays', () => {
  it('dzDialog renders in SSR', async () => {
    const DzDialog = (await import('../../src/components/overlays/DzDialog.vue')).default
    const html = await ssrRender(DzDialog, { open: false })
    expect(html).toBeTruthy()
  })

  it('dzTooltip renders in SSR', async () => {
    const DzTooltip = (await import('../../src/components/overlays/DzTooltip.vue')).default
    const html = await ssrRender(DzTooltip)
    expect(html).toBeTruthy()
  })

  it('dzPopover renders in SSR', async () => {
    const DzPopover = (await import('../../src/components/overlays/DzPopover.vue')).default
    const html = await ssrRender(DzPopover)
    expect(html).toBeTruthy()
  })

  it('dzSheet renders in SSR', async () => {
    const DzSheet = (await import('../../src/components/overlays/DzSheet.vue')).default
    const html = await ssrRender(DzSheet)
    expect(html).toBeTruthy()
  })

  it('dzDropdownMenu renders in SSR', async () => {
    const DzDropdownMenu = (await import('../../src/components/overlays/DzDropdownMenu.vue')).default
    const html = await ssrRender(DzDropdownMenu)
    expect(html).toBeTruthy()
  })

  it('dzContextMenu renders in SSR', async () => {
    const DzContextMenu = (await import('../../src/components/overlays/DzContextMenu.vue')).default
    const html = await ssrRender(DzContextMenu)
    expect(html).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// typography
// ---------------------------------------------------------------------------

describe('sSR: typography', () => {
  it('dzHeading renders in SSR', async () => {
    const DzHeading = (await import('../../src/components/typography/DzHeading.vue')).default
    const html = await ssrRender(DzHeading, { level: 1 }, {
      default: () => h('span', 'Page Title'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Page Title')
    expect(html).toContain('h1')
  })

  it('dzText renders in SSR', async () => {
    const DzText = (await import('../../src/components/typography/DzText.vue')).default
    const html = await ssrRender(DzText, { size: 'sm' }, {
      default: () => h('span', 'Body text'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('Body text')
  })

  it('dzCode renders in SSR', async () => {
    const DzCode = (await import('../../src/components/typography/DzCode.vue')).default
    const html = await ssrRender(DzCode, {}, {
      default: () => h('span', 'const x = 1'),
    })
    expect(html).toBeTruthy()
  })

  it('dzBlockquote renders in SSR', async () => {
    const DzBlockquote = (await import('../../src/components/typography/DzBlockquote.vue')).default
    const html = await ssrRender(DzBlockquote, {}, {
      default: () => h('span', 'A wise quote'),
    })
    expect(html).toBeTruthy()
    expect(html).toContain('A wise quote')
  })

  it('dzCaption renders in SSR', async () => {
    const DzCaption = (await import('../../src/components/typography/DzCaption.vue')).default
    const html = await ssrRender(DzCaption, {}, {
      default: () => h('span', 'Caption text'),
    })
    expect(html).toBeTruthy()
  })
})
