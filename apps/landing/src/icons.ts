/**
 * Central icon registry. Lucide icons are imported by name and exposed as a
 * record so data files can reference an icon by string key (keeps data.ts free
 * of component imports). Add an icon here before using its name in data.
 */
import type { Component } from 'vue'
import {
  Accessibility,
  Bell,
  Blocks,
  Boxes,
  Braces,
  Contact,
  CreditCard,
  Figma,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  LogIn,
  MoonStar,
  PackageCheck,
  Palette,
  Rocket,
  Settings,
  Shapes,
  Sparkles,
  SwatchBook,
  UserRound,
  Users,
  Wind,
} from 'lucide-vue-next'

export const ICONS: Record<string, Component> = {
  Accessibility,
  Bell,
  Blocks,
  Boxes,
  Braces,
  Contact,
  CreditCard,
  Figma,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  LogIn,
  MoonStar,
  PackageCheck,
  Palette,
  Rocket,
  Settings,
  Shapes,
  Sparkles,
  SwatchBook,
  UserRound,
  Users,
  Wind,
}
