/**
 * Pseudo-localisation (TASK-OSS-P4-03).
 *
 * A pseudo-locale is a translation of English into English that *looks* foreign
 * and *measures* foreign. It answers three questions before a real translator
 * is ever paid, and the third is the one that costs money to discover late:
 *
 *   1. **Is this string translatable at all?** Anything that comes out
 *      untransformed is hard-coded somewhere the catalog does not reach.
 *   2. **Does the layout survive a longer string?** German and Finnish run
 *      20–40% longer than English; the padding here is +30%, so a label that
 *      clips under pseudo will clip in production.
 *   3. **Does the component survive non-ASCII?** Accents, combining marks and
 *      a bracketed frame catch truncation that silently splits a grapheme.
 *
 * The brackets are load-bearing, not decoration. `[!!! … !!!]` makes a clipped
 * string obvious: if the trailing `!!!]` is missing, the text was cut, and no
 * one has to know what the full label should have said.
 *
 * **Not exported from the package barrel.** It is a development fixture — the
 * Storybook toolbar and the long-label decorator are the only consumers — and
 * shipping it would put a transformation nobody runs in production into every
 * consumer's bundle graph.
 *
 * @module @dzup-ui/core/i18n/pseudo
 */

import type { DzMessages } from '@dzup-ui/contracts'
import { enMessages } from './messages.ts'

/**
 * Latin letters mapped to accented look-alikes.
 *
 * Look-alikes rather than a different script on purpose: the point is that a
 * reviewer can still *read* the string well enough to tell which one clipped,
 * while it is unmistakably not the shipped English.
 */
const ACCENTS: Record<string, string> = {
  a: 'á',
  b: 'ƀ',
  c: 'ç',
  d: 'ð',
  e: 'é',
  f: 'ƒ',
  g: 'ĝ',
  h: 'ĥ',
  i: 'í',
  j: 'ĵ',
  k: 'ķ',
  l: 'ļ',
  m: 'ɱ',
  n: 'ñ',
  o: 'ö',
  p: 'þ',
  q: 'ǫ',
  r: 'ŕ',
  s: 'ş',
  t: 'ţ',
  u: 'ú',
  v: 'ṽ',
  w: 'ŵ',
  x: 'ẋ',
  y: 'ý',
  z: 'ž',
  A: 'Á',
  B: 'Ɓ',
  C: 'Ç',
  D: 'Ð',
  E: 'É',
  F: 'Ƒ',
  G: 'Ĝ',
  H: 'Ĥ',
  I: 'Í',
  J: 'Ĵ',
  K: 'Ķ',
  L: 'Ļ',
  M: 'Ṁ',
  N: 'Ñ',
  O: 'Ö',
  P: 'Þ',
  Q: 'Ǫ',
  R: 'Ŕ',
  S: 'Ş',
  T: 'Ţ',
  U: 'Ú',
  V: 'Ṽ',
  W: 'Ŵ',
  X: 'Ẋ',
  Y: 'Ý',
  Z: 'Ž',
}

/** Padding characters, cycled so the tail is not one repeated glyph. */
const PADDING = '·~·'

/**
 * Pseudo-localise one string: accent it, pad it by ~30%, frame it.
 *
 * Interpolation placeholders (`{count}`, `%s`) pass through untouched — a
 * pseudo-locale that mangles them would fail for a reason that has nothing to
 * do with what it is testing.
 */
export function pseudoLocalise(value: string): string {
  const accented = value.replace(/\{[^}]*\}|%[sd]|./gu, segment =>
    (segment.length > 1 ? segment : ACCENTS[segment] ?? segment))

  const padLength = Math.ceil(value.length * 0.3)
  let padding = ''
  while (padding.length < padLength)
    padding += PADDING[padding.length % PADDING.length]

  return `[!!! ${accented}${padding === '' ? '' : ` ${padding}`} !!!]`
}

/** Recursively pseudo-localise every leaf of a catalog. */
export function pseudoLocaliseCatalog(catalog: DzMessages): DzMessages {
  const out: Record<string, string | DzMessages> = {}
  for (const [key, value] of Object.entries(catalog)) {
    out[key] = typeof value === 'string' ? pseudoLocalise(value) : pseudoLocaliseCatalog(value)
  }
  return out
}

/**
 * The whole shipped catalog, pseudo-localised.
 *
 * Built from `enMessages` rather than hand-maintained, so a message added
 * tomorrow is covered by the fixture today. That is the property that makes
 * this a test rather than a demo.
 */
export function pseudoMessages(): DzMessages {
  return pseudoLocaliseCatalog(enMessages as unknown as DzMessages)
}
