import type { UserConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { createLibConfig } from '../tooling/src/vite.ts'

// createLibConfig returns a Vite UserConfig; widen to the Vitest UserConfig so
// the `test` field is typed. The shared createLibConfig shape is preserved.
const config = createLibConfig({
  baseDir: __dirname,
  entry: {
    'index': 'src/index.ts',
    'resolver': 'src/resolver.ts',
    // Side-effect CSS entry: pulls src/styles/*.css into the extracted
    // dist/core.css asset (exported as "@dzup-ui/core/styles"). Named
    // "styles/index" so the emitted JS sits beside its .d.ts (validate:dts).
    'styles/index': 'src/styles/index.ts',
  },
  alias: {
    '@dzup-ui/tokens': resolve(__dirname, '../tokens/src'),
    '@dzup-ui/contracts': resolve(__dirname, '../contracts/src'),
  },
}) as UserConfig

config.test = {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./vitest.setup.ts'],
}

export default config
