/**
 * Sample data for the Analytics Dashboard template. Co-located so the template
 * is self-contained and copy-pasteable (docs/templates.md §7). Content is
 * plausible product-analytics fare — never lorem ipsum (§7 "realistic content").
 */
import type { Component } from 'vue'
import {
  Activity,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-vue-next'

/** A sidebar navigation entry. */
export interface NavItem {
  label: string
  icon: Component
  /** Marks the current page (one per nav). */
  active?: boolean
  /** Optional count badge (e.g. unread). */
  badge?: string
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Audience', icon: Users },
  { label: 'Revenue', icon: CreditCard, badge: '3' },
  { label: 'Activity', icon: Activity },
  { label: 'Trends', icon: TrendingUp },
]

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Settings', icon: Settings },
  { label: 'Support', icon: LifeBuoy },
]

/** Headline KPIs for the stat-card row. */
export interface Stat {
  title: string
  value: string
  trend: 'up' | 'down'
  trendValue: string
  icon: Component
}

export const STATS: Stat[] = [
  { title: 'Revenue', value: '$48,210', trend: 'up', trendValue: '+12.4%', icon: CreditCard },
  { title: 'Active users', value: '8,942', trend: 'up', trendValue: '+5.1%', icon: Users },
  { title: 'Sessions', value: '23,508', trend: 'up', trendValue: '+8.7%', icon: Activity },
  { title: 'Churn', value: '1.8%', trend: 'down', trendValue: '-0.4%', icon: TrendingUp },
]

/** Monthly revenue series (in $k) for the faux chart panel. */
export const REVENUE_SERIES: { month: string; value: number }[] = [
  { month: 'Jan', value: 28 },
  { month: 'Feb', value: 35 },
  { month: 'Mar', value: 31 },
  { month: 'Apr', value: 42 },
  { month: 'May', value: 38 },
  { month: 'Jun', value: 48 },
  { month: 'Jul', value: 44 },
  { month: 'Aug', value: 53 },
  { month: 'Sep', value: 49 },
  { month: 'Oct', value: 61 },
  { month: 'Nov', value: 57 },
  { month: 'Dec', value: 68 },
]

/** A row in the members table. */
export interface Member {
  name: string
  email: string
  plan: 'Solo' | 'Team' | 'Org'
  usage: number
  status: 'Active' | 'Trial' | 'Invited'
}

export const MEMBERS: Member[] = [
  { name: 'Ava Restić', email: 'ava@northwind.io', plan: 'Team', usage: 72, status: 'Active' },
  { name: 'Liam Novak', email: 'liam@northwind.io', plan: 'Solo', usage: 38, status: 'Active' },
  { name: 'Mara Petrović', email: 'mara@northwind.io', plan: 'Org', usage: 91, status: 'Trial' },
  { name: 'Noah Kvist', email: 'noah@northwind.io', plan: 'Solo', usage: 14, status: 'Invited' },
  { name: 'Sofia Adeyemi', email: 'sofia@northwind.io', plan: 'Team', usage: 64, status: 'Active' },
]

export const STATUS_TONE: Record<Member['status'], 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Trial: 'warning',
  Invited: 'info',
}

/** Acquisition channels for the side breakdown. */
export const CHANNELS: { label: string; share: number }[] = [
  { label: 'Organic search', share: 46 },
  { label: 'Direct', share: 28 },
  { label: 'Referral', share: 17 },
  { label: 'Social', share: 9 },
]
