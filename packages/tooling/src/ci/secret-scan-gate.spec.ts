/**
 * The credential scan is a blocking pull-request gate (UI-DZUP-UI-SEC-L-02).
 *
 * `scripts/credential-scan.sh` existed only as `yarn scan:credentials`, which
 * no workflow ran. ci.yml's `secret-scan` job now runs its `--diff` mode on
 * every pull request. The behavioural half runs that mode against a scratch
 * repository: an added credential fails the scan without echoing the value,
 * and a clean diff passes.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { jobs, readWorkflow, ROOT_DIR } from './workflow-text.ts'

const SCRIPT = resolve(ROOT_DIR, 'scripts', 'credential-scan.sh')

describe('ci.yml secret-scan job (UI-DZUP-UI-SEC-L-02)', () => {
  const source = readWorkflow('ci.yml')
  const body = jobs(source).get('secret-scan')

  it('exists and runs the credential scan in diff mode', () => {
    expect(body).toBeDefined()
    expect(body!.join('\n')).toMatch(/run: bash scripts\/credential-scan\.sh --diff "origin\/\$BASE_REF"/)
  })

  it('runs on pull requests and is blocking', () => {
    expect(source).toMatch(/^ {2}pull_request:/m)
    expect(body!.join('\n')).toContain(`if: github.event_name == 'pull_request'`)
    expect(body!.join('\n')).not.toMatch(/continue-on-error:\s*true/)
  })

  it('fetches enough history to reach the merge base', () => {
    expect(body!.join('\n')).toMatch(/fetch-depth: 0/)
  })
})

describe('credential-scan.sh --diff', () => {
  let repo: string

  function git(...args: string[]): string {
    return execFileSync('git', ['-c', 'user.name=spec', '-c', 'user.email=spec@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd: repo, encoding: 'utf-8' })
  }

  function scan(): { status: number | null, out: string } {
    const result = spawnSync('bash', ['scripts/credential-scan.sh', '--diff', 'main'], { cwd: repo, encoding: 'utf-8' })
    return { status: result.status, out: `${result.stdout}${result.stderr}` }
  }

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), 'dzup-secret-scan-'))
    mkdirSync(join(repo, 'scripts'))
    copyFileSync(SCRIPT, join(repo, 'scripts', 'credential-scan.sh'))
    git('init', '-q', '-b', 'main')
    writeFileSync(join(repo, 'README.md'), 'base\n')
    git('add', '.')
    git('commit', '-q', '-m', 'base')
    git('checkout', '-q', '-b', 'feature')
  })

  afterEach(() => {
    rmSync(repo, { recursive: true, force: true })
  })

  it('fails on an added credential and names the file, not the value', () => {
    // Built at run time so this spec's own source never matches the pattern.
    const fake = `ghp_${'Z'.repeat(36)}`
    writeFileSync(join(repo, 'config.ts'), `export const key = '${fake}'\n`)
    git('add', '.')
    git('commit', '-q', '-m', 'leak')

    const { status, out } = scan()
    expect(status).toBe(1)
    expect(out).toContain('config.ts')
    expect(out).not.toContain(fake)
  })

  it('passes when the added lines carry no credential pattern', () => {
    writeFileSync(join(repo, 'feature.ts'), 'export const answer = 42\nFOO=bar-but-not-an-env-file\n')
    git('add', '.')
    git('commit', '-q', '-m', 'clean')

    const { status, out } = scan()
    expect(out).toContain('SECRET SCAN PASSED')
    expect(status).toBe(0)
  })
})
