import { describe, expect, it } from 'vitest'
import {
  buildContext,
  checkStoryDod,
  checkStorySource,
  declaredStateProps,
  declaresControls,
  indexComponentTypes,
  isComponentTitle,
} from './story-dod.ts'

const FILE = 'packages/core/stories/buttons/DzExample.stories.ts'

/** A story file that passes every enforced check, for tests to subtract from. */
function completeStory(overrides: {
  title?: string
  extraExports?: string
  omitDescription?: boolean
  omitDarkMode?: boolean
  omitArgTypes?: boolean
} = {}): string {
  const {
    title = 'Core/Buttons/DzButton',
    extraExports = '',
    omitDescription = false,
    omitDarkMode = false,
    omitArgTypes = false,
  } = overrides
  const description = omitDescription ? '' : '/** DzButton triggers an action. */\n'
  const argTypes = omitArgTypes ? '' : `  argTypes: { size: { control: 'select' } },\n`
  return `import { darkModeDecorator } from '../_shared'\n\n`
    + `${description}const meta = {\n  title: '${title}',\n${argTypes}`
    + `  tags: ['autodocs'],\n} satisfies Meta\n\n`
    + `export default meta\n\n`
    + `export const Default: Story = {\n`
    + `  render: (args) => ({ template: '<DzButton v-bind="args" />' }),\n`
    + `}\n${
      omitDarkMode ? '' : `export const DarkMode: Story = { decorators: [darkModeDecorator] }\n`
    }${extraExports}`
}

describe('isComponentTitle', () => {
  it('accepts Core/<Family>/<Component>', () => {
    expect(isComponentTitle('Core/Buttons/DzButton')).toBe(true)
    expect(isComponentTitle('Core/Feedback/App-Specific/DzRunStatusBadge')).toBe(true)
  })

  it('rejects gallery and guide pages, which are not component pages', () => {
    expect(isComponentTitle('Visual Refresh/Dashboard')).toBe(false)
    expect(isComponentTitle('Guides/Design Tokens')).toBe(false)
  })
})

describe('buildContext', () => {
  it('takes the meta title, not a fixture label that happens to be called title', () => {
    // Compositions stories carry `title: 'Total Revenue'` in their sample data.
    // Reading the first `title:` in the file would classify the story as that.
    const source = `const cards = [{ title: 'Total Revenue', value: 12 }]\n`
      + `const meta = { title: 'Core/Compositions/DashboardCard' } satisfies Meta`
    expect(buildContext(FILE, source, new Map())?.title).toBe('Core/Compositions/DashboardCard')
  })

  it('returns null for a non-component story', () => {
    const source = `const meta = { title: 'Visual Refresh/Dashboard' }`
    expect(buildContext(FILE, source, new Map())).toBeNull()
  })
})

describe('declaredStateProps', () => {
  it('finds the state props a component declares', () => {
    const types = `export interface DzButtonProps {\n  variant?: ButtonVariant\n`
      + `  disabled?: boolean\n  loading?: boolean\n}`
    expect(declaredStateProps(types)).toEqual(['disabled', 'loading'])
  })

  it('does not count a state prop merely mentioned in prose', () => {
    // The DoD hinges on this: a component with no state props needs no States
    // story, so a JSDoc mention must not make one applicable.
    const types = `/** Pair with disabled? See the loading pattern. */\n`
      + `export interface DzTextProps {\n  as?: TextElement\n}`
    expect(declaredStateProps(types)).toEqual([])
  })

  it('returns nothing for an unresolved component', () => {
    expect(declaredStateProps(undefined)).toEqual([])
  })
})

describe('checkStorySource', () => {
  const types = new Map([['DzButton', 'export interface P {\n  disabled?: boolean\n}']])

  it('passes a story that meets every enforced check', () => {
    const errors = checkStorySource(FILE, completeStory(), new Map())
      .filter(v => v.level === 'error')
    expect(errors).toEqual([])
  })

  it('skips non-component stories entirely', () => {
    expect(checkStorySource(FILE, completeStory({ title: 'Visual Refresh/Dashboard' }))).toEqual([])
  })

  describe('declaresControls', () => {
    it('is true when meta declares argTypes', () => {
      expect(declaresControls(completeStory())).toBe(true)
    })

    it('is false for an anatomy page that declares neither args nor argTypes', () => {
      expect(declaresControls(completeStory({ omitArgTypes: true }))).toBe(false)
    })

    it('does not count a story-level args block below the meta', () => {
      // Only the meta's own declaration puts a Controls panel on the page.
      const source = `const meta = {\n  title: 'Core/Data/DzDataParts',\n} satisfies Meta\n`
        + `export default meta\n`
        + `export const Anatomy: Story = {\n  args: { open: true },\n}`
      expect(declaresControls(source)).toBe(false)
    })
  })

  describe('controls-driven', () => {
    it('accepts a controls-driven story named something other than Default', () => {
      // DzCalendar opens with `Month`, DzSpeedDial with `Fab`. Renaming those to
      // `Default` would make the docs worse — binding args is what matters.
      const source = `/** Doc. */\nimport { darkModeDecorator } from '../_shared'\n`
        + `const meta = {\n  title: 'Core/Data/DzCalendar',\n  argTypes: { size: {} },\n}\n`
        + `export default meta\n`
        + `export const Month: Story = { render: (args) => ({ template: '<C v-bind="args" />' }) }\n`
        + `export const D: Story = { decorators: [darkModeDecorator] }`
      expect(checkStorySource(FILE, source).filter(v => v.check === 'controls-driven')).toEqual([])
    })

    it('flags a page that advertises controls but has no entry story', () => {
      const source = `/** Doc. */\nimport { darkModeDecorator } from '../_shared'\n`
        + `const meta = {\n  title: 'Core/Data/DzThing',\n  argTypes: { size: {} },\n}\n`
        + `export default meta\n`
        + `export const Static: Story = { render: () => ({ template: '<C />' }) }`
      const v = checkStorySource(FILE, source).filter(x => x.check === 'controls-driven')
      expect(v).toHaveLength(1)
      expect(v[0]!.level).toBe('error')
      expect(v[0]!.message).toContain('v-bind="args"')
    })

    it('does not apply to an anatomy page that declares no controls', () => {
      // DzDataParts documents how compound sub-parts fit together. Its nominal
      // `component` cannot render standalone (it needs inject context from a
      // parent), so there is nothing for a Controls panel to drive.
      const source = completeStory({ omitArgTypes: true })
        .replace(/export const Default[\s\S]*?\n\}\n/, '')
      const v = checkStorySource(FILE, source).filter(x => x.check === 'controls-driven')
      expect(v).toEqual([])
    })
  })

  describe('controls-live', () => {
    it('flags a page whose declared controls drive nothing', () => {
      // The panel renders because argTypes exist; dragging a knob does nothing.
      const source = `/** Doc. */\nimport { darkModeDecorator } from '../_shared'\n`
        + `const meta = {\n  title: 'Core/Data/DzThing',\n  argTypes: { size: {} },\n}\n`
        + `export default meta\n`
        + `export const Default: Story = { render: () => ({ template: '<C />' }) }\n`
        + `export const D: Story = { decorators: [darkModeDecorator] }`
      const v = checkStorySource(FILE, source).filter(x => x.check === 'controls-live')
      expect(v).toHaveLength(1)
      expect(v[0]!.level).toBe('report')
      expect(v[0]!.message).toContain('inert')
    })

    it('passes when a story binds the args', () => {
      expect(checkStorySource(FILE, completeStory()).filter(x => x.check === 'controls-live'))
        .toEqual([])
    })
  })

  describe('states', () => {
    it('requires a States story when the component declares state props', () => {
      const v = checkStorySource(FILE, completeStory(), types).filter(x => x.check === 'states')
      expect(v).toHaveLength(1)
      expect(v[0]!.message).toContain('`disabled`')
    })

    it('does not require one when the component declares no state props', () => {
      // This is the "as applicable" clause the DoD always carried. DzVisuallyHidden
      // has no states; demanding a States story from it is how a gate loses trust.
      const v = checkStorySource(FILE, completeStory(), new Map())
        .filter(x => x.check === 'states')
      expect(v).toEqual([])
    })

    it('is satisfied by a States story', () => {
      const source = completeStory({ extraExports: 'export const States: Story = {}\n' })
      expect(checkStorySource(FILE, source, types).filter(x => x.check === 'states')).toEqual([])
    })
  })

  describe('dark-mode', () => {
    it('accepts the decorator on a story that is not named DarkMode', () => {
      const source = `/** Doc. */\nconst meta = { title: 'Core/Data/DzThing' }\n`
        + `export const Default: Story = { render: (args) => ({ template: '<C v-bind="args" />' }),\n`
        + `  decorators: [darkModeDecorator] }`
      expect(checkStorySource(FILE, source).filter(x => x.check === 'dark-mode')).toEqual([])
    })

    it('flags a file that never previews dark mode', () => {
      const v = checkStorySource(FILE, completeStory({ omitDarkMode: true }))
        .filter(x => x.check === 'dark-mode')
      expect(v).toHaveLength(1)
      expect(v[0]!.level).toBe('error')
    })
  })

  describe('description', () => {
    it('flags a story with no description at all', () => {
      const v = checkStorySource(FILE, completeStory({ omitDescription: true }))
        .filter(x => x.check === 'description')
      expect(v).toHaveLength(1)
      expect(v[0]!.level).toBe('error')
    })

    it('flags a doc comment that does not sit directly above const meta', () => {
      // Storybook attaches only the JSDoc immediately preceding `const meta`. A
      // comment separated by fixture data is prose no user will ever see, which is
      // exactly the trap DzDataGrid fell into.
      const source = `/** DzDataGrid is the most complex data component. */\n\n`
        + `const sampleData = [{ id: 1 }]\n\n`
        + `const meta = { title: 'Core/Data/DzDataGrid' } satisfies Meta\n`
        + `import { darkModeDecorator } from '../_shared'\n`
        + `export const Default: Story = { render: (args) => ({ template: '<C v-bind="args" />' }) }\n`
        + `export const D: Story = { decorators: [darkModeDecorator] }`
      const v = checkStorySource(FILE, source).filter(x => x.check === 'description')
      expect(v).toHaveLength(1)
      expect(v[0]!.message).toContain('DIRECTLY above')
    })

    it('accepts an explicit parameters.docs.description.component', () => {
      const source = `const meta = {\n  title: 'Core/Data/DzThing',\n`
        + `  parameters: { docs: { description: { component: 'What it is for.' } } },\n}\n`
        + `import { darkModeDecorator } from '../_shared'\n`
        + `export const Default: Story = { render: (args) => ({ template: '<C v-bind="args" />' }) }\n`
        + `export const D: Story = { decorators: [darkModeDecorator] }`
      expect(checkStorySource(FILE, source).filter(x => x.check === 'description')).toEqual([])
    })
  })
})

describe('checkStoryDod (whole repo)', () => {
  const results = checkStoryDod()

  it('reports a count for every DoD check', () => {
    expect(results.length).toBeGreaterThan(0)
    for (const r of results)
      expect(r.applicable).toBeGreaterThan(0)
  })

  it('every enforced check passes across the story corpus', () => {
    const violations = results.filter(r => r.level === 'error').flatMap(r => r.violations)
    // Print the offenders rather than a bare count — the failure must be fixable
    // straight from CI output.
    const report = violations.map(v => `${v.file} [${v.check}]: ${v.message}`).join('\n')
    expect(report).toBe('')
  })
})

describe('indexComponentTypes', () => {
  it('indexes the real component type files', () => {
    const index = indexComponentTypes()
    expect(index.get('DzButton')).toContain('DzButtonProps')
  })
})
