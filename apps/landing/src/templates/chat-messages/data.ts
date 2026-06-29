/**
 * Sample data for the Chat / Messages template (docs/templates.md §6.4). Co-located
 * so the template is self-contained and copy-pasteable (§5). Plausible product-team
 * conversations — never lorem ipsum (§5 "realistic content"). One rich thread for the
 * default conversation plus lighter histories for the rest so switching feels live.
 */
import type { Component } from 'vue'
import { Archive, MessageSquare, Phone, Settings, Users } from 'lucide-vue-next'

/** A sidebar navigation entry for the app rail. */
export interface NavItem {
  label: string
  icon: Component
  active?: boolean
  badge?: string
}

export const APP_NAV: NavItem[] = [
  { label: 'Chats', icon: MessageSquare, active: true, badge: '4' },
  { label: 'Calls', icon: Phone },
  { label: 'Contacts', icon: Users },
  { label: 'Archived', icon: Archive },
]

export const APP_NAV_SECONDARY: NavItem[] = [{ label: 'Settings', icon: Settings }]

/** A conversation in the left-hand list. */
export interface Conversation {
  id: string
  /** Display name (person or group). */
  name: string
  /** Avatar fallback initials. */
  initials: string
  /** Last-message preview shown under the name. */
  snippet: string
  /** Relative timestamp of the last message. */
  time: string
  /** Unread message count (0 = read). */
  unread: number
  /** Whether the contact is currently online (drives the presence dot). */
  online: boolean
  /** Longer presence label shown in the thread header. */
  presence: string
}

export const CONVERSATIONS: Conversation[] = [
  { id: 'c-01', name: 'Mara Petrović', initials: 'MP', snippet: 'Pushed the token fix — can you take a look?', time: '2m', unread: 2, online: true, presence: 'Online' },
  { id: 'c-02', name: 'Design System Guild', initials: 'DS', snippet: 'Lena: agenda is in the doc 👍', time: '18m', unread: 5, online: true, presence: '6 members · 3 online' },
  { id: 'c-03', name: 'Devon Reyes', initials: 'DR', snippet: 'You: shipping it after review', time: '1h', unread: 0, online: false, presence: 'Active 1h ago' },
  { id: 'c-04', name: 'Priya Nair', initials: 'PN', snippet: 'Thanks! That unblocks the migration.', time: '3h', unread: 0, online: true, presence: 'Online' },
  { id: 'c-05', name: 'Theo Andersen', initials: 'TA', snippet: 'Let’s sync tomorrow morning.', time: 'Yesterday', unread: 0, online: false, presence: 'Active yesterday' },
  { id: 'c-06', name: 'Release Crew', initials: 'RC', snippet: 'Sam: v2.4 is live 🚀', time: 'Tue', unread: 0, online: false, presence: '9 members · 1 online' },
]

/** Read-receipt state for messages sent by the current user. */
export type MessageStatus = 'sent' | 'delivered' | 'read'

/** A single message bubble in a thread. */
export interface Message {
  id: string
  /** 'me' = current user (right-aligned), 'them' = the contact (left-aligned). */
  author: 'me' | 'them'
  /** For group threads, the sender's name shown above their bubble. */
  sender?: string
  text: string
  time: string
  /** Day-separator label this message falls under. */
  day: string
  /** Delivery status — only meaningful on own ('me') messages. */
  status?: MessageStatus
}

/**
 * Per-conversation message history, keyed by conversation id. The active
 * conversation (`c-01`) carries a full multi-day thread; the others have shorter
 * histories so switching shows distinct content.
 */
export const THREADS: Record<string, Message[]> = {
  'c-01': [
    { id: 'm-0101', author: 'them', text: 'Morning! Did the new radius tokens land in main?', time: '9:02 AM', day: 'Monday' },
    { id: 'm-0102', author: 'me', text: 'Yep — merged late Friday. They’re in the 2.4 release branch now.', time: '9:05 AM', day: 'Monday', status: 'read' },
    { id: 'm-0103', author: 'them', text: 'Perfect. I’ll rebase the card refactor on top of it today.', time: '9:06 AM', day: 'Monday' },
    { id: 'm-0104', author: 'me', text: 'Ping me if anything looks off in dark mode — the muted ramp shifted a touch.', time: '9:08 AM', day: 'Monday', status: 'read' },
    { id: 'm-0105', author: 'them', text: 'Found a contrast issue on DzBadge subtle. Opened #491 with a screenshot.', time: '4:41 PM', day: 'Yesterday' },
    { id: 'm-0106', author: 'me', text: 'Nice catch. The subtle background needs the 100 step, not 50, on light.', time: '4:48 PM', day: 'Yesterday', status: 'read' },
    { id: 'm-0107', author: 'them', text: 'Agreed. Want me to take it or are you already mid-fix?', time: '4:49 PM', day: 'Yesterday' },
    { id: 'm-0108', author: 'me', text: 'All yours — I’m heads-down on the calendar template.', time: '4:50 PM', day: 'Yesterday', status: 'read' },
    { id: 'm-0109', author: 'them', text: 'Pushed the token fix — can you take a look?', time: '11:32 AM', day: 'Today' },
    { id: 'm-0110', author: 'them', text: 'I also bumped the changeset so it ships in the same release.', time: '11:32 AM', day: 'Today' },
  ],
  'c-02': [
    { id: 'm-0201', author: 'them', sender: 'Lena Fischer', text: 'Standup in 10 — anything blocking?', time: '9:50 AM', day: 'Today' },
    { id: 'm-0202', author: 'me', text: 'Nothing blocking. Reviewing the chat template this morning.', time: '9:52 AM', day: 'Today', status: 'delivered' },
    { id: 'm-0203', author: 'them', sender: 'Sam Okafor', text: 'I’ll demo the new DzCalendar day-cell slot after.', time: '9:53 AM', day: 'Today' },
    { id: 'm-0204', author: 'them', sender: 'Lena Fischer', text: 'agenda is in the doc 👍', time: '9:55 AM', day: 'Today' },
  ],
  'c-03': [
    { id: 'm-0301', author: 'them', text: 'PR #482 is ready whenever you have a minute.', time: '12:10 PM', day: 'Today' },
    { id: 'm-0302', author: 'me', text: 'Looking now — the diff is clean.', time: '12:22 PM', day: 'Today', status: 'read' },
    { id: 'm-0303', author: 'me', text: 'Shipping it after review.', time: '12:24 PM', day: 'Today', status: 'read' },
  ],
  'c-04': [
    { id: 'm-0401', author: 'me', text: 'Migration script is on staging — gave you write access.', time: '8:30 AM', day: 'Today', status: 'read' },
    { id: 'm-0402', author: 'them', text: 'Thanks! That unblocks the migration.', time: '8:41 AM', day: 'Today' },
  ],
  'c-05': [
    { id: 'm-0501', author: 'them', text: 'Can we move the roadmap review?', time: '5:02 PM', day: 'Yesterday' },
    { id: 'm-0502', author: 'me', text: 'Sure — morning works better for me too.', time: '5:10 PM', day: 'Yesterday', status: 'read' },
    { id: 'm-0503', author: 'them', text: 'Let’s sync tomorrow morning.', time: '5:11 PM', day: 'Yesterday' },
  ],
  'c-06': [
    { id: 'm-0601', author: 'them', sender: 'Sam Okafor', text: 'Cutting the release now.', time: '2:00 PM', day: 'Tuesday' },
    { id: 'm-0602', author: 'them', sender: 'Sam Okafor', text: 'v2.4 is live 🚀', time: '2:14 PM', day: 'Tuesday' },
    { id: 'm-0603', author: 'me', text: 'Beautiful. Changelog is published too.', time: '2:20 PM', day: 'Tuesday', status: 'read' },
  ],
}

/** Attachment options shown in the composer's "attach" dropdown menu. */
export interface AttachOption {
  label: string
  hint: string
}

export const ATTACH_OPTIONS: AttachOption[] = [
  { label: 'Photo or video', hint: 'PNG, JPG, MP4' },
  { label: 'Document', hint: 'PDF, DOCX' },
  { label: 'Code snippet', hint: 'Formatted block' },
]
