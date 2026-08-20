import { createApp } from 'vue'
import App from './App.vue'
import router from './router.ts'

/* Generate utility classes used by component variants */
import './tailwind.css'

/* Import design tokens CSS from package export */
import '@dzup-ui/tokens/css'
import '@dzup-ui/core/styles'

const app = createApp(App)
app.use(router)
app.mount('#app')
