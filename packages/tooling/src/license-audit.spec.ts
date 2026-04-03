import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runLicenseAudit } from './license-audit'

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..')

describe('license-audit', () => {
  it('discovers production dependencies from core, pro, and tokens', () => {
    const result = runLicenseAudit(ROOT_DIR)

    expect(result.entries).toBeInstanceOf(Array)
    expect(result.entries.length).toBeGreaterThan(0)
  })

  it('classifies known safe licenses as allowed', () => {
    const result = runLicenseAudit(ROOT_DIR)

    // clsx and tailwind-merge are MIT
    const clsx = result.entries.find(e => e.package === 'clsx')
    expect(clsx).toBeDefined()
    expect(clsx!.allowed).toBe(true)
    expect(clsx!.license).toBe('MIT')
  })

  it('does not flag any blocked licenses in current deps', () => {
    const result = runLicenseAudit(ROOT_DIR)

    // Our current deps should all be compatible
    expect(result.flagged).toBe(0)
    expect(result.allPassed).toBe(true)
  })

  it('excludes workspace:* dependencies', () => {
    const result = runLicenseAudit(ROOT_DIR)

    const workspaceDeps = result.entries.filter(e =>
      e.package.startsWith('@dzup-ui/'),
    )
    expect(workspaceDeps.length).toBe(0)
  })

  it('provides version info for each dependency', () => {
    const result = runLicenseAudit(ROOT_DIR)

    for (const entry of result.entries) {
      expect(entry.version).toBeTruthy()
      expect(entry.license).toBeTruthy()
    }
  })
})
