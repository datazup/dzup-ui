/**
 * Textual reads of `.github/workflows/*.yml` for the CI pinning specs.
 *
 * GitHub's workflow shape is fixed enough — top-level keys at column 0, jobs
 * at 2 spaces, steps at 6 — to read without a YAML parser, as
 * `release/release-workflow.spec.ts` and `validators/browser-lane.ts` already
 * do. Comment and blank lines are ignored everywhere.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..', '..')
export const WORKFLOW_DIR = resolve(ROOT_DIR, '.github', 'workflows')

/** Every workflow file name, sorted. */
export function listWorkflowFiles(): string[] {
  return readdirSync(WORKFLOW_DIR).filter(f => /\.ya?ml$/.test(f)).sort()
}

export function readWorkflow(file: string): string {
  return readFileSync(resolve(WORKFLOW_DIR, file), 'utf-8')
}

function meaningfulLines(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map(line => line.replace(/\s+$/, ''))
    .filter(line => line.trim() !== '' && !line.trim().startsWith('#'))
}

function indentOf(line: string): number {
  return line.length - line.trimStart().length
}

/** Whether the workflow declares a top-level `permissions:` block. */
export function hasTopLevelPermissions(source: string): boolean {
  return meaningfulLines(source).some(line => line.startsWith('permissions:'))
}

/** Job ids mapped to their body lines (everything indented under the id). */
export function jobs(source: string): Map<string, string[]> {
  const result = new Map<string, string[]>()
  let inJobs = false
  let current: string[] | undefined
  for (const line of meaningfulLines(source)) {
    const indent = indentOf(line)
    if (indent === 0) {
      inJobs = /^jobs:$/.test(line)
      current = undefined
      continue
    }
    if (!inJobs)
      continue
    const id = indent === 2 ? /^ {2}([\w-]+):$/.exec(line)?.[1] : undefined
    if (id) {
      current = []
      result.set(id, current)
    }
    else {
      current?.push(line)
    }
  }
  return result
}

/** Whether a job body declares its own `permissions:` (job keys sit at 4 spaces). */
export function jobHasPermissions(body: string[]): boolean {
  return body.some(line => /^ {4}permissions:/.test(line))
}

/** Every `uses:` reference, e.g. `actions/checkout@v4` or `./.github/workflows/x.yml`. */
export function usesRefs(source: string): string[] {
  return meaningfulLines(source)
    .map(line => /^\s*(?:-\s+)?uses:\s*(\S+)/.exec(line)?.[1])
    .filter((ref): ref is string => ref !== undefined)
    .map(ref => ref.replace(/^['"]|['"]$/g, ''))
}

/** The script text of every `run:` key, inline or block scalar. */
export function runScripts(source: string): string[] {
  const lines = source.split(/\r?\n/)
  const scripts: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const match = /^(\s*)(?:-\s+)?run:(.*)$/.exec(lines[i]!)
    if (!match)
      continue
    const keyIndent = match[1]!.length + (lines[i]!.trimStart().startsWith('-') ? 2 : 0)
    const inline = match[2]!.trim()
    if (inline !== '' && !/^[|>][+-]?$/.test(inline)) {
      scripts.push(inline)
      continue
    }
    const body: string[] = []
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j]!
      if (line.trim() !== '' && indentOf(line) <= keyIndent)
        break
      body.push(line)
    }
    scripts.push(body.join('\n'))
  }
  return scripts
}
