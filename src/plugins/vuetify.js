// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        background: '#fff', // Black background
      },
    },
  },
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
})
