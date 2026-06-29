/**
 * About & FAQ — co-located sample data (docs/templates.md §6.2).
 *
 * A plausible company narrative for the about page: headline stats, a founding-
 * to-now story for the DzTimeline, the values cards, the leadership grid (+ the
 * wider team for the DzAvatarGroup) and the FAQ accordion. Icons are referenced
 * by their Lucide registry key so the data stays free of component imports.
 */

/** A single headline figure under the hero. */
export interface Stat {
  value: string
  label: string
}

/** Proof-point figures, in reading order. */
export const STATS: Stat[] = [
  { value: '2018', label: 'Founded' },
  { value: '12k+', label: 'Teams onboard' },
  { value: '64', label: 'People' },
  { value: '4', label: 'Continents' },
]

/** One milestone on the company-story timeline. */
export interface Milestone {
  year: string
  title: string
  detail: string
  /** The most recent node is toned as the "current" chapter. */
  current?: boolean
}

/** The founding-to-today story, oldest first. */
export const MILESTONES: Milestone[] = [
  {
    year: '2018',
    title: 'Two laptops and a hunch',
    detail:
      'Ava and Marco quit their agency jobs to fix the tool-sprawl they kept seeing — one workspace instead of nine tabs.',
  },
  {
    year: '2020',
    title: 'First thousand teams',
    detail:
      'Northwind opened to the public and crossed a thousand active teams in its first quarter, entirely word-of-mouth.',
  },
  {
    year: '2022',
    title: 'A real company',
    detail:
      'A seed round let us hire a support team that actually answers, and ship the integrations customers had been asking for.',
  },
  {
    year: '2024',
    title: 'Going remote-first',
    detail:
      'We closed the headquarters lease and rebuilt around async work — hiring from four continents without missing a beat.',
  },
  {
    year: 'Today',
    title: 'Building in the open',
    detail:
      'Sixty-four people, twelve thousand teams, and a public roadmap. The hunch held: simpler tools, calmer work.',
    current: true,
  },
]

/** A company value card — `icon` is a Lucide registry key. */
export interface Value {
  icon: string
  title: string
  detail: string
}

/** What the company optimises for, shown as a card grid. */
export const VALUES: Value[] = [
  {
    icon: 'Compass',
    title: 'Default to clarity',
    detail:
      'Plain language, visible decisions, no jargon moats. If a teammate can’t follow it, we rewrite it.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Customers, not users',
    detail:
      'Real people with deadlines. We answer fast, apologise plainly when we’re wrong, and ship the fix.',
  },
  {
    icon: 'Sparkles',
    title: 'Craft over volume',
    detail:
      'Fewer features, finished properly. We’d rather ship one delightful thing than five half-done ones.',
  },
  {
    icon: 'Leaf',
    title: 'Sustainable pace',
    detail:
      'No hero crunches. Rested teams make better calls — we plan for the long game, not the sprint.',
  },
]

/** A leadership-team member shown as an avatar card. */
export interface TeamMember {
  name: string
  role: string
  /** Initials for the DzAvatar fallback (asset-free). */
  initials: string
  blurb: string
}

/** The leadership grid. */
export const TEAM: TeamMember[] = [
  {
    name: 'Ava Kessler',
    role: 'Co-founder & CEO',
    initials: 'AK',
    blurb: 'Ex-agency PM who got tired of context-switching. Keeps the roadmap honest.',
  },
  {
    name: 'Marco Pereira',
    role: 'Co-founder & CTO',
    initials: 'MP',
    blurb: 'Wrote the first prototype on a train. Still reviews the gnarliest pull requests.',
  },
  {
    name: 'Lena Novak',
    role: 'Head of Design',
    initials: 'LN',
    blurb: 'Believes empty states deserve as much love as the happy path.',
  },
  {
    name: 'Theo Adeyemi',
    role: 'Head of Support',
    initials: 'TA',
    blurb: 'Turned the inbox into a feature. Replies faster than you expect.',
  },
]

/** Initials for the rest of the team, fed to the DzAvatarGroup overflow. */
export const WIDER_TEAM: string[] = ['RS', 'JC', 'KL', 'DM', 'YH', 'BN', 'PV', 'GA', 'SR', 'WT']

/** One FAQ entry; `value` keys the accordion item. */
export interface Faq {
  value: string
  q: string
  a: string
}

/** The about-page FAQ. */
export const FAQS: Faq[] = [
  {
    value: 'remote',
    q: 'Are you really fully remote?',
    a: 'Yes — we’ve been headquarters-free since 2024. The team spans four continents and works async by default, with two optional in-person weeks a year.',
  },
  {
    value: 'hiring',
    q: 'Are you hiring?',
    a: 'Often. We hire in waves rather than continuously, so roles open and close. If nothing fits today, send an intro anyway — we keep great notes.',
  },
  {
    value: 'funding',
    q: 'Who funds Northwind?',
    a: 'A single seed round in 2022 from founders and operators we respect. We’re majority employee-owned and intend to stay independent.',
  },
  {
    value: 'data',
    q: 'How do you handle customer data?',
    a: 'It’s encrypted in transit and at rest, never sold, and never used to train models without explicit opt-in. Our sub-processor list is public.',
  },
  {
    value: 'values',
    q: 'Do the values actually mean anything?',
    a: 'They’re the tie-breaker in real decisions — what we ship, who we hire, how we say no. If a value stops being true, we change it rather than pretend.',
  },
]
