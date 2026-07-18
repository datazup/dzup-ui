import { createApp } from 'vue'
import App from './App.vue'
import router from './router.ts'

/* Generate utility classes used by component variants */
import './tailwind.css'

/* Motion keyframes + --dz-anim-* constants (after tailwind, before app mount) */
import './motion/tokens.css'

/* Import design tokens CSS + core base styles (order matters: tokens → core) */
import '@dzup-ui/tokens/css'
import '@dzup-ui/core/styles'

const app = createApp(App)

/**
 * Last-resort error handling (TASK-FREE-09). Errors inside the routed view are
 * caught by the DzErrorBoundary around <RouterView> in App.vue (a real
 * fallback UI with a retry); this handler catches what escapes it — errors in
 * the shell itself, watchers, event handlers — and makes them VISIBLE instead
 * of a silent console line under a possibly-blank page. The banner is plain
 * DOM on purpose: it must work even when Vue rendering is what broke.
 */
app.config.errorHandler = (error, _instance, info) => {
  console.error(`[dzup-ui landing] unhandled application error (${info}):`, error)
  if (typeof document === 'undefined' || document.getElementById('dz-fatal-banner'))
    return
  const banner = document.createElement('div')
  banner.id = 'dz-fatal-banner'
  banner.setAttribute('role', 'alert')
  banner.style.cssText
    = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;padding:12px 16px;'
      + 'border-radius:8px;background:#7f1d1d;color:#fff;font:14px/1.5 system-ui,sans-serif;'
      + 'display:flex;justify-content:space-between;gap:16px;align-items:center'
  const text = document.createElement('span')
  text.textContent = 'Something went wrong on this page. Reloading usually fixes it.'
  const reload = document.createElement('button')
  reload.textContent = 'Reload'
  reload.style.cssText
    = 'padding:6px 14px;border:1px solid rgba(255,255,255,.6);border-radius:6px;'
      + 'background:transparent;color:#fff;font:inherit;cursor:pointer'
  reload.addEventListener('click', () => window.location.reload())
  banner.append(text, reload)
  document.body.appendChild(banner)
}

app.use(router)
app.mount('#app')
