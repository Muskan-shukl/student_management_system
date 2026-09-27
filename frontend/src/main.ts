import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from '@/core/router'
import { vReveal } from '@/core/composables/useReveal'
import '@/core/composables/useTheme'
import '@/styles/base.css'

createApp(App).use(createPinia()).use(router).directive('reveal', vReveal).mount('#app')
