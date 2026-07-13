import { describe, expect, it } from 'vitest'
import { checkStorySource, checkStoryStatus, isComponentTitle } from './story-status.ts'

const FILE = 'packages/core/stories/buttons/DzExample.stories.ts'

function story(body: string): string {
  return `const meta = {\n${body}\n} satisfies Meta`
}

describe('isComponentTitle', () => {
  it('accepts Core/<Family>/<Component>', () => {
    expect(isComponentTitle('Core/Buttons/DzButton')).toBe(true)
    expect(isComponentTitle('Core/Feedback/App-Specific/DzRunStatusBadge')).toBe(true)
  })

  it('rejects gallery and guide pages, which are not components', () => {
    expect(isComponentTitle('Visual Refresh/Dashboard')).toBe(false)
    expect(isComponentTitle('Guides/Design Tokens')).toBe(false)
    expect(isComponentTitle('Core/Buttons')).toBe(false)
  })
})

describe('checkStorySource', () => {
  it('passes a component story with exactly one status tag', () => {
    const source = story(`  title: 'Core/Buttons/DzButton',\n  tags: ['autodocs', 'status:stable'],`)
    expect(checkStorySource(FILE, source)).toEqual([])
  })

  it('flags a component story with no status tag', () => {
    const source = story(`  title: 'Core/Buttons/DzButton',\n  tags: ['autodocs'],`)
    const violations = checkStorySource(FILE, source)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.rule).toBe('missing-status-tag')
    // The message must be actionable without opening the validator.
    expect(violations[0]!.message).toContain('Core/Buttons/DzButton')
    expect(violations[0]!.message).toContain('status:experimental')
  })

  it('flags a component story carrying two status tags', () => {
    const source = story(`  title: 'Core/Buttons/DzButton',\n  tags: ['status:beta', 'status:stable'],`)
    const violations = checkStorySource(FILE, source)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.rule).toBe('multiple-status-tags')
    expect(violations[0]!.message).toContain('2 status tags')
  })

  it('skips non-component stories entirely', () => {
    const source = story(`  title: 'Visual Refresh/Dashboard',\n  tags: ['autodocs'],`)
    expect(checkStorySource(FILE, source)).toEqual([])
  })

  it('skips a file with no title', () => {
    expect(checkStorySource(FILE, story(`  component: DzButton,`))).toEqual([])
  })

  it('does not mistake prose in a doc comment for a tag', () => {
    // `status:stable` appears unquoted in the comment — it must not count.
    const source = `/** Tag this status:stable once the API settles. */\n${story(
      `  title: 'Core/Buttons/DzButton',\n  tags: ['autodocs'],`,
    )}`
    const violations = checkStorySource(FILE, source)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.rule).toBe('missing-status-tag')
  })

  it('requires a deprecated component to name its replacement', () => {
    const source = story(`  title: 'Core/Buttons/DzOld',\n  tags: ['status:deprecated'],`)
    const violations = checkStorySource(FILE, source)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.rule).toBe('deprecated-without-migration')
  })

  it('accepts a deprecated component that carries a migration note', () => {
    const source = story(
      `  title: 'Core/Buttons/DzOld',\n  tags: ['status:deprecated'],\n`
      + `  parameters: { migration: 'Use DzButton instead.' },`,
    )
    expect(checkStorySource(FILE, source)).toEqual([])
  })
})

describe('checkStoryStatus (whole repo)', () => {
  it('every Core component story carries exactly one status:* tag', () => {
    const violations = checkStoryStatus()
    // Print the offenders rather than a bare count — the failure must be fixable
    // straight from CI output.
    const report = violations.map(v => `${v.file} [${v.rule}]: ${v.message}`).join('\n')
    expect(report).toBe('')
  })
})
