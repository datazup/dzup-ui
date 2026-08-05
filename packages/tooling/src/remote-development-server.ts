export interface RemoteDevelopmentServerConfig {
  enabled: boolean
  server: {
    host?: '0.0.0.0'
    allowedHosts?: string[]
    strictPort?: true
    hmr?: {
      protocol: 'wss'
      host: string
      clientPort: 443
    }
  }
}

export function resolveRemoteDevelopmentServer(
  env: Record<string, string | undefined>,
  expectedHostname: string,
): RemoteDevelopmentServerConfig {
  if (env.APP_ENV !== 'development-remote')
    return { enabled: false, server: {} }

  let publicUrl: URL
  try {
    publicUrl = new URL(env.VITE_PUBLIC_URL ?? '')
  }
  catch {
    throw new Error('remote development requires an absolute VITE_PUBLIC_URL')
  }

  if (
    publicUrl.protocol !== 'https:'
    || publicUrl.hostname !== expectedHostname
    || publicUrl.port !== ''
    || publicUrl.pathname !== '/'
    || publicUrl.search !== ''
    || publicUrl.hash !== ''
    || publicUrl.username !== ''
    || publicUrl.password !== ''
  ) {
    throw new Error(
      `remote development requires VITE_PUBLIC_URL=https://${expectedHostname}/`,
    )
  }

  return {
    enabled: true,
    server: {
      host: '0.0.0.0',
      allowedHosts: [expectedHostname],
      strictPort: true,
      hmr: {
        protocol: 'wss',
        host: expectedHostname,
        clientPort: 443,
      },
    },
  }
}
