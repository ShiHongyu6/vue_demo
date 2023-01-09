import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/main.css'
import SvgIcon from './core/components/SvgIcon/index.vue'
import { injectPlugin } from './injectGlobal'

const app = createApp(App)

app.use(
    createPinia()
).use(
    injectPlugin
)

app.component('svg-icon', SvgIcon)

app.mount('#vue-app')
