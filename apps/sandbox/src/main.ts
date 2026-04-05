import { createApp } from 'vue'
import App from './App.vue'
import router from './router.ts'

/* Generate utility classes used by component variants */
import './tailwind.css'

/* Import design tokens CSS from package export */
import '@dzip-ui/tokens/css'
import '@dzip-ui/core/styles'

const app = createApp(App)
app.use(router)
app.mount('#app')
