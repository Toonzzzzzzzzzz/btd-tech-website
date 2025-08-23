import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import CallbackDiscord from '../pages/CallbackDiscord.vue'
import Dashboard from '../pages/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Dashboard,
    meta: { requiresAuth: true, showTopbar: true, title: 'แดชบอร์ด' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, showTopbar: false, title: 'เข้าสู่ระบบ' }
  },
  {
    path: '/callback',
    name: 'CallbackDiscord',
    component: CallbackDiscord,
    meta: { requiresAuth: false, showTopbar: false, title: 'กำลังดำเนินการ' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, showTopbar: true, title: 'แดชบอร์ด' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `BTD-Tech | ${to.meta.title}`
  } else {
    document.title = 'BTD-Tech'
  }

  const isAuthenticated = localStorage.getItem('token') != null;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      next()
    }
  } else if (isAuthenticated && (to.path === '/login' || to.path === '/callback')) {
    next('/dashboard'); // Redirect to dashboard if authenticated and trying to access login/callback
  } else {
    next()
  }
})

export default router
