import { mkdtempSync, writeFileSync } from 'node:fs'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { generateDesignApplicationPlan } from './design-application-plan'

const tempDirs: string[] = []

async function createFixture(): Promise<{
  appDir: string
  designPath: string
  mappingPath: string
  outputPath: string
}> {
  const root = mkdtempSync(join(tmpdir(), 'dzup-ui-plan-'))
  tempDirs.push(root)

  const appDir = join(root, 'apps', 'demo-app')
  await mkdir(join(appDir, 'src', 'styles'), { recursive: true })
  await mkdir(join(appDir, 'src', 'components'), { recursive: true })

  writeFileSync(
    join(appDir, 'package.json'),
    JSON.stringify({
      name: 'demo-app',
      packageManager: 'yarn@4.6.0',
      dependencies: {
        '@dzup-ui/core': 'workspace:*',
        '@dzup-ui/tokens': 'workspace:*',
      },
    }, null, 2),
  )

  writeFileSync(
    join(appDir, 'src', 'main.ts'),
    [
      'import "@dzup-ui/tokens/css"',
      'import "@dzup-ui/core/styles"',
      'import "./styles/theme.css"',
      '',
    ].join('\n'),
  )

  writeFileSync(
    join(appDir, 'src', 'styles', 'theme.css'),
    [
      ':root {',
      '  --dz-primary: #2563eb;',
      '}',
      '',
    ].join('\n'),
  )

  writeFileSync(
    join(appDir, 'src', 'components', 'DemoPanel.vue'),
    [
      '<template>',
      '  <section data-theme="light">',
      '    <button type="button">Save</button>',
      '    <input v-model="name" />',
      '    <DzButton>Already migrated</DzButton>',
      '  </section>',
      '</template>',
      '',
    ].join('\n'),
  )

  const designPath = join(appDir, 'DESIGN.md')
  writeFileSync(
    designPath,
    [
      '# Demo App Design',
      '',
      '## Colors',
      '',
      '- Primary: #2563eb',
      '',
    ].join('\n'),
  )

  const mappingPath = join(root, 'MAPPING_TOKENS.md')
  writeFileSync(mappingPath, '# Mapping DESIGN.md Tokens To dzup-ui\n')

  return {
    appDir,
    designPath,
    mappingPath,
    outputPath: join(appDir, 'docs', 'DESIGN_TO_DZUP_UI_PLAN.md'),
  }
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('design-application-plan', () => {
  it('writes a filled app plan from package, style, and control evidence', async () => {
    const fixture = await createFixture()

    const result = generateDesignApplicationPlan({
      appPath: fixture.appDir,
      designPath: fixture.designPath,
      mappingPath: fixture.mappingPath,
      outputPath: fixture.outputPath,
    })

    const markdown = await readFile(fixture.outputPath, 'utf8')

    expect(result.usage.usesCore).toBe(true)
    expect(result.usage.usesTokens).toBe(true)
    expect(result.styles.coreStylesImports).toEqual(['src/main.ts'])
    expect(result.styles.tokenCssImports).toEqual(['src/main.ts'])
    expect(result.styles.candidateOverrideFiles).toEqual(['src/styles/theme.css'])
    expect(result.controls.rawButtons).toEqual(['src/components/DemoPanel.vue'])
    expect(result.controls.rawInputs).toEqual(['src/components/DemoPanel.vue'])
    expect(result.controls.dzupUiFiles).toEqual(['src/components/DemoPanel.vue'])
    expect(markdown).toContain('# DESIGN.md to dzup-ui Application Plan')
    expect(markdown).toContain('## Token Overrides')
    expect(markdown).toContain('`src/styles/theme.css`')
    expect(markdown).toContain('Raw `<button>`')
    expect(markdown).toContain('Demo App Design')
  })

  it('warns in the plan when dzup-ui packages are not declared', async () => {
    const fixture = await createFixture()
    writeFileSync(
      join(fixture.appDir, 'package.json'),
      JSON.stringify({ name: 'demo-app', dependencies: {} }, null, 2),
    )

    const result = generateDesignApplicationPlan({
      appPath: fixture.appDir,
      designPath: fixture.designPath,
      mappingPath: fixture.mappingPath,
      outputPath: fixture.outputPath,
    })

    expect(result.usage.usesCore).toBe(false)
    expect(result.usage.usesTokens).toBe(false)
    expect(result.markdown).toContain('Uses `@dzup-ui/core`: no')
    expect(result.markdown).toContain('Uses `@dzup-ui/tokens`: no')
  })
})
