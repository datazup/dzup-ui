// Tailwind utilities (scans @dzup-ui/core — see style.css) + your own styles.
import './style.css'
// dzup-ui design tokens — must be imported once, before your own styles, so the
// components' `var(--dz-*)` values resolve. (Getting Started → "Wire up tokens".)
import '@dzup-ui/tokens/css'
// Base interaction utilities used by component variants (focus rings, disabled).
import '@dzup-ui/core/styles'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
