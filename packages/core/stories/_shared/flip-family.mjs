/* eslint-disable no-console -- one-shot CLI codemod; console.log is its output */
/**
 * One-shot codemod: opt a story family into the enforced a11y gate.
 *
 *   node packages/core/stories/_shared/flip-family.mjs buttons "Buttons audits clean (TASK-DS-07)."
 *
 * For every `*.stories.ts` in the family it:
 *   1. ensures `a11yError` is imported from '../_shared'
 *   2. spreads `...a11yError` into the *meta*'s `parameters` (creating it if absent)
 *
 * It only ever touches the `const meta = {` object, never a story's own parameters.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const [family, note] = process.argv.slice(2)
if (!family || !note)
  throw new Error('usage: flip-family.mjs <family> <note>')

const dir = join('packages', 'core', 'stories', family)

/** Find the `const meta = { … }` span by brace-matching from its opening brace. */
function metaSpan(src) {
  const start = src.indexOf('const meta = {')
  if (start === -1)
    return null
  const open = src.indexOf('{', start)
  let depth = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') {
      depth++
    }
    else if (src[i] === '}') {
      depth--
      if (depth === 0)
        return { open, close: i }
    }
  }
  return null
}

for (const file of readdirSync(dir).filter(f => f.endsWith('.stories.ts'))) {
  const path = join(dir, file)
  const src = readFileSync(path, 'utf8')
  if (/\ba11yError\b/.test(src)) {
    console.log(`skip (already flipped): ${file}`)
    continue
  }

  const span = metaSpan(src)
  if (!span) {
    console.log(`SKIP (no meta): ${file}`)
    continue
  }

  // --- 2. parameters ---------------------------------------------------------
  const meta = src.slice(span.open, span.close)
  // A top-level `parameters:` key sits at exactly 2-space indent inside meta.
  const paramsRe = /\n {2}parameters: \{/
  let next
  if (paramsRe.test(meta)) {
    const patched = meta.replace(paramsRe, m => `${m}\n    // ${note}\n    ...a11yError,`)
    next = src.slice(0, span.open) + patched + src.slice(span.close)
  }
  else {
    // Insert a fresh parameters block, keeping the family's key order
    // (title / component / tags / parameters / argTypes) — so anchor it after
    // `tags:`, falling back to `component:`, then to the top of meta.
    const block = `\n  parameters: {\n    // ${note}\n    ...a11yError,\n  },`
    const anchor = /\n {2}tags: \[[^\]]*\],/.exec(meta) ?? /\n {2}component: [^\n]*,/.exec(meta)
    const at = anchor ? span.open + anchor.index + anchor[0].length : span.open + 1
    next = src.slice(0, at) + block + src.slice(at)
  }

  // --- 1. import -------------------------------------------------------------
  const importRe = /import \{([^}]*)\} from '\.\.\/_shared'/
  if (importRe.test(next)) {
    next = next.replace(importRe, (_m, names) => {
      const list = [...names.split(',').map(s => s.trim()).filter(Boolean), 'a11yError'].sort()
      return `import { ${list.join(', ')} } from '../_shared'`
    })
  }
  else {
    // No _shared import yet — add one after the last existing import.
    const imports = [...next.matchAll(/^import .*$/gm)]
    const last = imports.at(-1)
    const at = last.index + last[0].length
    next = `${next.slice(0, at)}\nimport { a11yError } from '../_shared'${next.slice(at)}`
  }

  writeFileSync(path, next)
  console.log(`flipped: ${file}`)
}
