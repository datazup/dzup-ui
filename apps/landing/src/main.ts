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
app.use(router)
app.mount('#app')
