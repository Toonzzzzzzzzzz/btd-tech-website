<template>
  <v-app>
    <TopBar v-if="showTopbar" />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { useRoute } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import { computed } from 'vue'

export default {
  name: 'App',
  components: { TopBar },
  setup() {
    const route = useRoute()
    const showTopbar = computed(() => {
      return !(route.path === '/login' || route.path === '/callback')
    })
    return { showTopbar }
  }
}
</script>


<style>
html, body, #app {
  font-family: 'Kanit', sans-serif;
  background-color: #000000 !important; 
}

.swal2-confirm,
.swal2-cancel {
  color: #fff !important;
}
</style>
