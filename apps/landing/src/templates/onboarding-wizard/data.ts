/**
 * Onboarding Wizard — co-located sample content (docs/templates.md §6.1).
 *
 * The step definitions and the option sets each form panel needs (roles, team
 * sizes, use-cases, set-up toggles). Kept beside the template so the component is
 * a thin view over realistic data (mirrors the shipped data files).
 */

/** One DzStepper header — title + supporting line. */
export interface WizardStep {
  title: string
  description: string
}

/** The four-step setup flow: Profile → Workspace → Invite → Done. */
export const STEPS: WizardStep[] = [
  { title: 'Profile', description: 'About you' },
  { title: 'Workspace', description: 'Your team' },
  { title: 'Invite', description: 'Add people' },
  { title: 'Done', description: 'All set' },
]

/** Shape consumed by DzSelect's `items` prop. */
export interface SelectOption {
  label: string
  value: string
}

/** Role choices on the Profile step. */
export const ROLE_OPTIONS: SelectOption[] = [
  { label: 'Founder / Owner', value: 'founder' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Product', value: 'product' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Operations', value: 'operations' },
]

/** Team-size choices on the Workspace step. */
export const TEAM_SIZE_OPTIONS: SelectOption[] = [
  { label: 'Just me', value: '1' },
  { label: '2–10 people', value: '2-10' },
  { label: '11–50 people', value: '11-50' },
  { label: '51–200 people', value: '51-200' },
  { label: '200+ people', value: '200+' },
]

/** Primary use-case radio options on the Workspace step. */
export interface RadioOption {
  value: string
  label: string
  hint: string
}

export const USE_CASE_OPTIONS: RadioOption[] = [
  { value: 'projects', label: 'Plan projects', hint: 'Boards, timelines and milestones' },
  { value: 'docs', label: 'Write & share docs', hint: 'A connected knowledge base' },
  { value: 'support', label: 'Run support', hint: 'Shared inbox and SLAs' },
]

/** "Set up for me" checkbox options on the Invite step. */
export interface SetupOption {
  value: string
  label: string
  hint: string
}

export const SETUP_OPTIONS: SetupOption[] = [
  { value: 'sample-data', label: 'Add sample data', hint: 'A demo project to explore' },
  { value: 'integrations', label: 'Connect integrations', hint: 'Slack, GitHub and Google' },
  { value: 'mobile', label: 'Send the mobile app link', hint: 'Get the iOS & Android apps' },
]
