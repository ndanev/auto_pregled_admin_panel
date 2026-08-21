import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

import BrandListView from '@/views/brands/BrandListView.vue'
import BrandFormView from '@/views/brands/BrandFormView.vue'
import ModelListView from '@/views/models/ModelListView.vue'
import ModelFormView from '@/views/models/ModelFormView.vue'
import GenerationListView from '@/views/generations/GenerationListView.vue'
import GenerationFormView from '@/views/generations/GenerationFormView.vue'
import EngineListView from '@/views/engines/EngineListView.vue'
import EngineFormView from '@/views/engines/EngineFormView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/brands', name: 'brands.index', component: BrandListView, meta: { requiresAuth: true } },
    { path: '/brands/new', name: 'brands.create', component: BrandFormView, meta: { requiresAuth: true } },
    { path: '/brands/:id/edit', name: 'brands.edit', component: BrandFormView, meta: { requiresAuth: true }, props: true },
    { path: '/models', name: 'models.index', component: ModelListView, meta: { requiresAuth: true } },
    { path: '/models/new', name: 'models.create', component: ModelFormView, meta: { requiresAuth: true } },
    { path: '/models/:id/edit', name: 'models.edit', component: ModelFormView, meta: { requiresAuth: true }, props: true },
    { path: '/generations', name: 'generations.index', component: GenerationListView, meta: { requiresAuth: true } },
    { path: '/generations/new', name: 'generations.create', component: GenerationFormView, meta: { requiresAuth: true } },
    { path: '/generations/:id/edit', name: 'generations.edit', component: GenerationFormView, meta: { requiresAuth: true }, props: true },
    { path: '/engines', name: 'engines.index', component: EngineListView, meta: { requiresAuth: true } },
    { path: '/engines/new', name: 'engines.create', component: EngineFormView, meta: { requiresAuth: true } },
    { path: '/engines/:id/edit', name: 'engines.edit', component: EngineFormView, meta: { requiresAuth: true }, props: true },
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