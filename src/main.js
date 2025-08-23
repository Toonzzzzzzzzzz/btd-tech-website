import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'
import vuetify from './plugins/vuetify'
import VueSweetalert2 from "vue-sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'


loadFonts()

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(vuetify)
app.use(VueSweetalert2)
app.use(pinia)
app.mount('#app')
