// TASK-R5-O9 baseline method — hash every built package's dist/.
//
// Usage (from ui/dzup-ui, after `yarn build`):
//   node docs/program-2026-09-04/reports/TASK-R5-O9-baseline/hash-dist.mjs <outDir>
//
// Writes two files into <outDir>:
//   dist-files.tsv    one line per file:  package \t path \t bytes \t sha256
//   dist-summary.tsv  one line per package: package \t files \t bytes \t listSha256 \t contentSha256
// listSha256    = sha256 of the sorted relative paths joined by "\n"   (file-LIST identity)
// contentSha256 = sha256 of the sorted "path bytes sha256" lines       (file-CONTENT identity)
//
// Paths are relative to the package's dist/, forward slashes, sorted by code
// unit, so the output is identical on every platform for identical bytes.
// Compare a later run with `diff` (exit 0 = byte-identical dist trees).
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const outDir = resolve(process.argv[2] ?? '.')
mkdirSync(outDir, { recursive: true })

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory())
      out.push(...walk(full))
    else if (st.isFile())
      out.push(full)
  }
  return out
}

const sha = buf => createHash('sha256').update(buf).digest('hex')
const fileLines = []
const summaryLines = []
const packages = readdirSync(join(root, 'packages')).sort()
for (const pkg of packages) {
  const dist = join(root, 'packages', pkg, 'dist')
  if (!existsSync(dist)) {
    summaryLines.push(`${pkg}\t0\t0\t-\t- (no dist)`)
    continue
  }
  const entries = walk(dist)
    .map((full) => {
      const buf = readFileSync(full)
      return { path: relative(dist, full).split('\\').join('/'), bytes: buf.length, hash: sha(buf) }
    })
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  let bytes = 0
  for (const e of entries) {
    bytes += e.bytes
    fileLines.push(`${pkg}\t${e.path}\t${e.bytes}\t${e.hash}`)
  }
  const listHash = sha(entries.map(e => e.path).join('\n'))
  const contentHash = sha(entries.map(e => `${e.path} ${e.bytes} ${e.hash}`).join('\n'))
  summaryLines.push(`${pkg}\t${entries.length}\t${bytes}\t${listHash}\t${contentHash}`)
}

writeFileSync(join(outDir, 'dist-files.tsv'), `package\tpath\tbytes\tsha256\n${fileLines.join('\n')}\n`)
writeFileSync(join(outDir, 'dist-summary.tsv'), `package\tfiles\tbytes\tlistSha256\tcontentSha256\n${summaryLines.join('\n')}\n`)
process.stdout.write(`${summaryLines.join('\n')}\n`)
