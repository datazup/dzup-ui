import { describe, expect, it } from 'vitest'
import { resolveRemoteDevelopmentServer } from './remote-development-server.ts'

describe('resolveRemoteDevelopmentServer', () => {
  it('leaves local development defaults untouched', () => {
    expect(
      resolveRemoteDevelopmentServer(
        { APP_ENV: 'local' },
        'dzup-ui.dev.dziphost.com',
      ),
    ).toEqual({ enabled: false, server: {} })
  })

  it('pins remote bind, host admission, strict port, and secure HMR', () => {
    expect(
      resolveRemoteDevelopmentServer(
        {
          APP_ENV: 'development-remote',
          VITE_PUBLIC_URL: 'https://dzup-ui.dev.dziphost.com/',
        },
        'dzup-ui.dev.dziphost.com',
      ),
    ).toEqual({
      enabled: true,
      server: {
        host: '0.0.0.0',
        allowedHosts: ['dzup-ui.dev.dziphost.com'],
        strictPort: true,
        hmr: {
          protocol: 'wss',
          host: 'dzup-ui.dev.dziphost.com',
          clientPort: 443,
        },
      },
    })
  })

  it('rejects an unexpected host, path, or credential-bearing URL', () => {
    for (const value of [
      'https://untrusted.example/',
      'https://dzup-ui.dev.dziphost.com/path',
      'https://user:password@dzup-ui.dev.dziphost.com/',
    ]) {
      expect(() =>
        resolveRemoteDevelopmentServer(
          { APP_ENV: 'development-remote', VITE_PUBLIC_URL: value },
          'dzup-ui.dev.dziphost.com',
        ),
      ).toThrow(/requires VITE_PUBLIC_URL/)
    }
  })
})
