/**
 * A11y gate helpers (TASK-X.3).
 *
 * The WCAG 2.2 AA ruleset is configured globally in
 * `apps/storybook/.storybook/preview.ts`, where the default gate is report-only
 * (`test: 'todo'`). Enforcement rolls out **per family**: once a family's
 * stories audit clean, its story metas opt into CI-gating with `a11yError`.
 *
 * Usage — opt a whole family into enforcement from each story meta:
 *
 * ```ts
 * import { a11yError } from '../_shared'
 *
 * const meta = {
 *   title: 'Core/Buttons/DzButton',
 *   parameters: { ...a11yError },
 * } satisfies Meta<typeof DzButton>
 * ```
 *
 * Until a family opts in it inherits the report-only default, so its violations
 * are surfaced but never fail CI.
 */

/**
 * Meta/story `parameters` fragment that flips a family from report-only to
 * CI-gating (`test: 'error'`). Spread it into `parameters`. Only add it after
 * the family audits clean at error level.
 */
export const a11yError = { a11y: { test: 'error' } } as const

/**
 * Story-level `parameters` fragment that keeps the story gating (`test:
 * 'error'`) while disabling one or more *specific* axe rules that are documented
 * false positives for that story (e.g. an intentionally low-contrast decorative
 * placeholder). Always pass the exact rule id(s) and explain why at the call
 * site — never disable the whole audit.
 *
 * ```ts
 * export const DecorativePlaceholder: Story = {
 *   // Placeholder bars are decorative and intentionally low-contrast.
 *   parameters: { ...a11yDisableRules('color-contrast') },
 * }
 * ```
 */
export function a11yDisableRules(...ruleIds: string[]) {
  return {
    a11y: {
      test: 'error',
      config: { rules: ruleIds.map(id => ({ id, enabled: false })) },
    },
  } as const
}
