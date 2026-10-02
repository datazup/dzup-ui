import { mergeConfig } from 'vitest/config'
import config from '../../vitest.config.ts'

export default mergeConfig(config, {
  cacheDir: '.cache/csp-vitest',
  test: {
    include: [...config.test!.include!, 'e2e/csp/ssr.spec.ts'],
  },
})
