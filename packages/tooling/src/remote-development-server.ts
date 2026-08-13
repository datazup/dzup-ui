export interface RemoteDevelopmentServerConfig {
  enabled: boolean
  server: {
    host?: '0.0.0.0'
    allowedHosts?: string[]
    strictPort?: true
    hmr?: {
      protocol: 'wss'
      clientPort: 443
    }
  }
}

export function resolveRemoteDevelopmentServer(
  env: Record<string, string | undefined>,
  expectedHostname: string | readonly string[],
): RemoteDevelopmentServerConfig {
  if (env.APP_ENV !== 'development-remote')
    return { enabled: false, server: {} }

  const expectedHostnames = [
    ...new Set(
      (Array.isArray(expectedHostname) ? expectedHostname : [expectedHostname])
        .map(hostname => hostname.trim())
        .filter(Boolean),
    ),
  ]
  if (expectedHostnames.length === 0)
    throw new Error('remote development requires at least one expected hostname')

  let publicUrl: URL
  try {
    publicUrl = new URL(env.VITE_PUBLIC_URL ?? '')
  }
  catch {
    throw new Error('remote development requires an absolute VITE_PUBLIC_URL')
  }

  if (
    publicUrl.protocol !== 'https:'
    || !expectedHostnames.includes(publicUrl.hostname)
    || publicUrl.port !== ''
    || publicUrl.pathname !== '/'
    || publicUrl.search !== ''
    || publicUrl.hash !== ''
    || publicUrl.username !== ''
    || publicUrl.password !== ''
  ) {
    throw new Error(
      `remote development requires VITE_PUBLIC_URL to use an approved HTTPS hostname: ${expectedHostnames.join(', ')}`,
    )
  }

  return {
    enabled: true,
    server: {
      host: '0.0.0.0',
      allowedHosts: [publicUrl.hostname],
      strictPort: true,
      hmr: {
        protocol: 'wss',
        clientPort: 443,
      },
    },
  }
}
