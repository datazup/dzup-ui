import { resolve } from 'node:path'
import { createLibConfig } from '../tooling/src/vite.ts'

export default createLibConfig({
  baseDir: __dirname,
  entry: 'src/index.ts',
  alias: {
    '@dzup-ui/tokens': resolve(__dirname, '../tokens/src'),
    '@dzup-ui/contracts': resolve(__dirname, '../contracts/src'),
    '@dzup-ui/core': resolve(__dirname, '../core/src'),
  },
})
