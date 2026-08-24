/**
 * Reading `packages/core/perf/baselines.json` (TASK-OSS-P5-05).
 *
 * A separate module from the capture CLI on purpose: `perf-bench.spec.ts` runs
 * inside vitest and must not pull in a file that spawns Vite builds and child
 * processes just to look up a number.
 *
 * @module @dzup-ui/tooling/perf/read-baselines
 */

import type { Baseline, BaselineFile } from './baselines.ts'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

export const BASELINES_PATH = resolve(ROOT, 'packages/core/perf/baselines.json')

/** The whole file, or `undefined` when it has never been captured. */
export function readBaselineFile(path: string = BASELINES_PATH): BaselineFile | undefined {
  if (!existsSync(path))
    return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as BaselineFile
}

/** Baselines by metric id. Empty when the file does not exist. */
export function readBaselines(path: string = BASELINES_PATH): Map<string, Baseline> {
  const file = readBaselineFile(path)
  if (file === undefined)
    return new Map()
  return new Map(file.baselines.map(b => [b.id, b]))
}
