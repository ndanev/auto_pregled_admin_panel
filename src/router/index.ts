import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized && !auth.isLoading) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.admin) {
    return { name: 'login' }
  }

  if (to.meta.guest && auth.admin) {
    return { name: 'dashboard' }
  }
})

export default router