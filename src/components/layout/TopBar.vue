<template>
  <LoadingOverlay v-if="loading" />
  <!-- Navigation Drawer (ซ่อน/แสดงได้) -->
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :prepend-icon="item.icon"
        @click="go(item.route)"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Topbar -->
  <v-app-bar app color="primary" dark>
    <!-- ปุ่มเปิดเมนู -->
    <v-app-bar-nav-icon @click="drawer = !drawer" />

    <!-- โลโก้ -->
    <v-toolbar-title class="ml-2">
      <img src="@/assets/logo.png" alt="Logo" height="35" class="mr-2" />
      <span class="font-weight-bold">{{ group.name }}</span>
    </v-toolbar-title>

    <v-spacer />

    <!-- โปรไฟล์ Dropdown -->
    <v-menu>
      <template v-slot:activator="{ props, isActive }">
        <v-btn
          v-bind="props"
          variant="text"
          class="d-flex align-center"
          style="height: 100% !important; margin-right: 12px;"
        >
          <v-avatar size="40" class="mr-2">
            <img
              :src="`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`"
              alt="Avatar"
              style="width: 100%; height: 100%; object-fit: contain;"
            />
          </v-avatar>

          <span>{{ user.name || '-' }}</span>

          <!-- icon ลูกศร -->
          <v-icon class="ml-2">
            {{ isActive ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item @click="go('/profile')">
          <v-list-item-title>โปรไฟล์</v-list-item-title>
        </v-list-item>
        <v-list-item @click="go('/settings')">
          <v-list-item-title>ตั้งค่า</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>ออกจากระบบ</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

  </v-app-bar>
</template>

<script>
import menuItem from '@/config/menuItem'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { useUserStore } from '@/stores/user'
import { useGroupStore } from '@/stores/group'

export default {
  name: "TopBar",
  components: {
    LoadingOverlay
  },
  data() {
    return {
      drawer: false,
      menuItems: [],
      loading: false,
      user: {},
      group: {}
    }
  },
  methods: {
    go(route) {
      this.$router.push(route)
      this.drawer = false
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('keyapi')
      this.$router.push('/login')
    },
    async fetchdata() {
      try {
        const userStore = useUserStore()
        await userStore.fetchUserInfo()
        const groupStore = useGroupStore()
        await groupStore.fetchGroupInfo()
        this.user = userStore.userInfo
        this.group = groupStore.groupInfo
        this.menuItems = menuItem(this.user.role)
      } catch (error) {
        console.error("API Error:", error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    if(localStorage.getItem('token')){
      this.loading = true
      this.fetchdata()
    }
  }
}
</script>
