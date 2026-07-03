/** One-off structural validator for the generated llms.txt files (not shipped). */
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function validate(name, text) {
  const lines = text.split(/\r?\n/)
  const errors = []

  // 1. Code fences must be balanced.
  let fences = 0
  for (const l of lines) if (/^```/.test(l.trim())) fences++
  if (fences % 2 !== 0) errors.push(`unbalanced code fences (${fences})`)

  // 2. GFM tables: every row in a contiguous table block has the same column count.
  let inFence = false
  let table = []
  const flush = () => {
    if (table.length >= 2) {
      // Split on unescaped pipes only — `\|` inside a cell is a literal, not a
      // column boundary (union types like `'a' \| 'b'` rely on this).
      const cols = table.map(r => r.split(/(?<!\\)\|/).length)
      if (new Set(cols).size !== 1)
        errors.push(`table near line ${table._start} has ragged columns: ${cols.join(',')}`)
    }
    table = []
  }
  lines.forEach((l, i) => {
    if (/^```/.test(l.trim())) inFence = !inFence
    if (inFence) return
    if (/^\s*\|.*\|\s*$/.test(l)) {
      if (!table.length) table._start = i + 1
      table.push(l.trim())
    } else {
      flush()
    }
  })
  flush()

  // 3. Exactly one H1.
  const h1 = lines.filter(l => /^# /.test(l)).length
  if (h1 !== 1) errors.push(`expected exactly one H1, found ${h1}`)

  console.log(`${name}: ${lines.length} lines, ${fences / 2} code blocks — ${errors.length ? 'FAIL' : 'OK'}`)
  for (const e of errors) console.log(`  ✗ ${e}`)
  return errors.length === 0
}

const files = ['public/llms.txt', 'public/llms-full.txt']
let ok = true
for (const f of files) {
  ok = validate(f, await readFile(resolve(appRoot, f), 'utf8')) && ok
}
process.exitCode = ok ? 0 : 1
