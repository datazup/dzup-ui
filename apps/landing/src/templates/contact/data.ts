/**
 * Contact — co-located sample data (docs/templates.md §6.2).
 *
 * Realistic, self-contained content for the two-column contact page: the topic
 * options the DzSelect offers, the contact-detail rows, the office-hours rota and
 * the support promises. Kept free of component imports (icons referenced by their
 * Lucide name) so the data stays portable, per the shipped templates' convention.
 */

/** A selectable enquiry topic — `value` is what validation/submit reads. */
export interface TopicOption {
  label: string
  value: string
}

/** The enquiry topics the form's DzSelect offers, broadest first. */
export const TOPICS: TopicOption[] = [
  { label: 'Sales & pricing', value: 'sales' },
  { label: 'Product support', value: 'support' },
  { label: 'Partnerships', value: 'partnerships' },
  { label: 'Press & media', value: 'press' },
  { label: 'Careers', value: 'careers' },
  { label: 'Something else', value: 'other' },
]

/** One row in the "reach us" details card — `icon` is a Lucide registry key. */
export interface ContactDetail {
  icon: string
  label: string
  value: string
  href?: string
}

/** The direct channels, alongside the form. */
export const DETAILS: ContactDetail[] = [
  { icon: 'Mail', label: 'Email', value: 'hello@northwind.io', href: 'mailto:hello@northwind.io' },
  { icon: 'Phone', label: 'Phone', value: '+1 (415) 555-0132', href: 'tel:+14155550132' },
  { icon: 'MapPin', label: 'Office', value: '500 Harrison St, San Francisco, CA 94105' },
]

/** A single day's opening hours for the office-hours card. */
export interface OfficeHour {
  day: string
  hours: string
  /** Today's row is highlighted as "open now". */
  today?: boolean
}

/** The week's support window — Wednesday flagged as the current day. */
export const OFFICE_HOURS: OfficeHour[] = [
  { day: 'Monday – Thursday', hours: '8:00 – 18:00 PT', today: true },
  { day: 'Friday', hours: '8:00 – 16:00 PT' },
  { day: 'Saturday – Sunday', hours: 'Closed' },
]

/** Short reassurances shown under the form heading. */
export const PROMISES: string[] = [
  'A real person replies — usually within one business day.',
  'No bots, no ticket maze, no premium-support upsell.',
  'Your details are never shared or sold.',
]
