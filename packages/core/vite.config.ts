import { resolve } from 'node:path'
import { createLibConfig } from '../tooling/src/vite.ts'

export default createLibConfig({
  baseDir: __dirname,
  entry: {
    index: 'src/index.ts',
    resolver: 'src/resolver.ts',
  },
  alias: {
    '@dzup-ui/tokens': resolve(__dirname, '../tokens/src'),
    '@dzup-ui/contracts': resolve(__dirname, '../contracts/src'),
  },
})
