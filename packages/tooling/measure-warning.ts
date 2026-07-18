/* eslint-disable no-console -- ad-hoc CLI report; console.log is its output */
import { readFileSync } from 'node:fs'
import { contrastRatio } from './src/token-checks/oklch-contrast.ts'

const css = readFileSync('packages/tokens/dist/tokens.css', 'utf8')

function blocks(re: RegExp): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of css.matchAll(re)) {
    for (const [, k, v] of m[1]!.matchAll(/(--[a-z0-9-]+)\s*:\s*([^\s;][^;]*);/gi))
      out[k!] = v!.trim()
  }
  return out
}
const light = blocks(/(?:^|\n)\s*:root(?:\s*,\s*\[data-theme="light"\])?\s*\{([^}]*)\}/gi)
const dark = { ...light, ...blocks(/\[data-theme="dark"\]\s*\{([^}]*)\}/gi) }

function deref(t: Record<string, string>, v: string, d = 0): string {
  const m = /var\(\s*(--[a-z0-9-]+)\s*\)/i.exec(v)
  if (!m || d > 12)
    return v.trim()
  const next = t[m[1]!]
  return next ? deref(t, next, d + 1) : v.trim()
}

// Is ANY foreground capable of clearing 4.5:1 on the raw --dz-warning fill?
// --dz-warning-foreground is a SHARED token: it also has to stay legible on
// --dz-warning-solid, so a candidate must clear 4.5:1 on BOTH surfaces at once.
for (const [name, t] of [
  ['LIGHT', light],
  ['DARK', dark],
] as const) {
  const warn = deref(t, t['--dz-warning']!)
  const solid = deref(t, t['--dz-warning-solid']!)
  console.log(`\n=== ${name} ===   --dz-warning = ${warn}`)
  const candidates: [string, string][] = [
    ['pure black', 'oklch(0 0 0)'],
    ['pure white', 'oklch(1 0 0)'],
    ['neutral-900 (current fg)', deref(t, t['--dz-warning-foreground']!)],
    ['warning-950', deref(t, t['--dz-colors-warning-950']!)],
  ]
  for (const [label, c] of candidates) {
    const onWarn = contrastRatio(c, warn) ?? 0
    const onSolid = contrastRatio(c, solid) ?? 0
    const ok = onWarn >= 4.5 && onSolid >= 4.5
    console.log(
      `  ${label.padEnd(26)} on --dz-warning ${onWarn.toFixed(2).padStart(5)}:1`
      + ` | on --dz-warning-solid ${onSolid.toFixed(2).padStart(5)}:1  ${ok ? '<-- would satisfy BOTH' : ''}`,
    )
  }
}
