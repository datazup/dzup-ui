/** Throwaway verification: screenshot the C1 auth templates, light+dark, desktop+mobile. */
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')
const OUT = resolve(LANDING_ROOT, 'verify-shots')

const SLUGS = ['sign-up', 'reset-password', 'verify-otp', 'onboarding-wizard']
const THEMES = ['light', 'dark'] as const
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

const ANSI = /\[[0-9;]*m/g

function startDevServer(): Promise<{ base: string; child: ChildProcess }> {
  const require = createRequire(import.meta.url)
  const viteBin = resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js')
  const child = spawn(process.execPath, [viteBin, '--no-open', '--clearScreen', 'false'], {
    cwd: LANDING_ROOT,
    env: { ...process.env, FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('vite not ready')), 60_000)
    const onData = (buf: Buffer) => {
      const text = buf.toString().replace(ANSI, '')
      const m = text.match(/(https?:\/\/localhost:\d+\S*)/i)
      if (m) {
        clearTimeout(t)
        child.stdout?.off('data', onData)
        res({ base: m[1]!.replace(/\/$/, ''), child })
      }
    }
    child.stdout?.on('data', onData)
  })
}

function stop(child: ChildProcess): void {
  if (child.pid === undefined) return
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' })
  else child.kill('SIGTERM')
}

async function main(): Promise<void> {
  const { chromium } = await import('playwright')
  await mkdir(OUT, { recursive: true })
  const { base, child } = await startDevServer()
  console.log('serving at', base)
  const browser = await chromium.launch()
  const errors: string[] = []
  try {
    for (const theme of THEMES) {
      for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
          reducedMotion: 'reduce',
        })
        await ctx.addInitScript((t) => { try { localStorage.setItem('dz-theme', t as string) } catch {} }, theme)
        const page = await ctx.newPage()
        page.on('pageerror', (e) => errors.push(`[${theme}/${vp.name}] ${e.message}`))
        page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${theme}/${vp.name}] console: ${m.text()}`) })
        for (const slug of SLUGS) {
          const url = `${base}/templates/${slug}/preview?theme=${theme}`
          await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
          await page.waitForFunction(() => {
            const root = document.querySelector('.preview-root')
            const loading = document.querySelector('.preview-loading')
            return !!root && root.children.length > 0 && !loading
          }, { timeout: 45_000 })
          await page.waitForTimeout(300)
          await page.screenshot({ path: resolve(OUT, `${slug}-${theme}-${vp.name}.png`), fullPage: vp.name === 'mobile' })
          console.log('  shot', slug, theme, vp.name)
        }
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
    stop(child)
  }
  if (errors.length) {
    console.log('\n=== PAGE ERRORS ===')
    for (const e of errors) console.log(e)
  } else {
    console.log('\nNo page/console errors.')
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1 })
