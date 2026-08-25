import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import AdminLayout from '@/components/AdminLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import BrandListView from '@/views/brands/BrandListView.vue'
import BrandFormView from '@/views/brands/BrandFormView.vue'
import ModelListView from '@/views/models/ModelListView.vue'
import ModelFormView from '@/views/models/ModelFormView.vue'
import GenerationListView from '@/views/generations/GenerationListView.vue'
import GenerationFormView from '@/views/generations/GenerationFormView.vue'
import EngineListView from '@/views/engines/EngineListView.vue'
import EngineFormView from '@/views/engines/EngineFormView.vue'
import CarListView from '@/views/cars/CarListView.vue'
import CarFormView from '@/views/cars/CarFormView.vue'
import CarImagesView from '@/views/cars/CarImagesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'brands', name: 'brands.index', component: BrandListView },
        { path: 'brands/new', name: 'brands.create', component: BrandFormView },
        { path: 'brands/:id/edit', name: 'brands.edit', component: BrandFormView, props: true },
        { path: 'models', name: 'models.index', component: ModelListView },
        { path: 'models/new', name: 'models.create', component: ModelFormView },
        { path: 'models/:id/edit', name: 'models.edit', component: ModelFormView, props: true },
        { path: 'generations', name: 'generations.index', component: GenerationListView },
        { path: 'generations/new', name: 'generations.create', component: GenerationFormView },
        { path: 'generations/:id/edit', name: 'generations.edit', component: GenerationFormView, props: true },
        { path: 'engines', name: 'engines.index', component: EngineListView },
        { path: 'engines/new', name: 'engines.create', component: EngineFormView },
        { path: 'engines/:id/edit', name: 'engines.edit', component: EngineFormView, props: true },
        { path: 'cars', name: 'cars.index', component: CarListView },
        { path: 'cars/new', name: 'cars.create', component: CarFormView },
        { path: 'cars/:id/edit', name: 'cars.edit', component: CarFormView, props: true },
        { path: 'cars/:id/images', name: 'cars.images', component: CarImagesView, props: true },
      ],
    },
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