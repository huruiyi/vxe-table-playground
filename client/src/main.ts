import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 样式顺序:reset -> vxe-pc-ui -> vxe-table -> 项目样式
import 'antdv-next/dist/reset.css'
import 'vxe-pc-ui/lib/style.css'
import 'vxe-table/lib/style.css'
import '@/styles/index.css'

import Antdv from 'antdv-next'
import App from './App.vue'
import router from '@/router'
import { setupVxe } from '@/plugins/vxe'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antdv)
setupVxe(app)

app.mount('#app')
