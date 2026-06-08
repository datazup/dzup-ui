import type { RouteRecordRaw } from 'vue-router'

export interface SandboxRoute {
  name: string
  path: string
  label: string
  icon: string
  order: number
  component: () => Promise<unknown>
}

const PAGE_MODULES = import.meta.glob('./pages/*Page.vue')

const ORDER: Record<string, number> = {
  Home: 0,
  Buttons: 1,
  Inputs: 2,
  Forms: 3,
  Cards: 4,
  Data: 5,
  Editors: 6,
  Feedback: 7,
  Layout: 8,
  Navigation: 9,
  Overlays: 10,
  Media: 11,
  Typography: 12,
}

const ICON: Record<string, string> = {
  Home: 'H',
  Buttons: 'B',
  Inputs: 'I',
  Forms: 'F',
  Cards: 'C',
  Data: 'D',
  Editors: 'E',
  Feedback: 'Fb',
  Layout: 'L',
  Navigation: 'N',
  Overlays: 'O',
  Media: 'M',
  Typography: 'T',
}

function deriveName(file: string): string {
  const match = file.match(/\.\/pages\/(\w+)Page\.vue$/)
  if (!match || !match[1]) throw new Error(`Unexpected page filename: ${file}`)
  return match[1]
}

function toPath(name: string): string {
  return name === 'Home' ? '/' : `/${name.toLowerCase()}`
}

export const sandboxRoutes: SandboxRoute[] = Object.entries(PAGE_MODULES)
  .map(([file, loader]) => {
    const label = deriveName(file)
    return {
      name: label.toLowerCase(),
      path: toPath(label),
      label,
      icon: ICON[label] ?? label.slice(0, 1).toUpperCase(),
      order: ORDER[label] ?? 999,
      component: loader as () => Promise<unknown>,
    }
  })
  .sort((a, b) => a.order - b.order)

export const routerRoutes: RouteRecordRaw[] = sandboxRoutes.map(r => ({
  path: r.path,
  name: r.name,
  component: r.component,
}))
