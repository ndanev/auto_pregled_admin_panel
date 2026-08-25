<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter, RouterView } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'dashboard', label: 'Pregled', to: { name: 'dashboard' } },
  { name: 'brands', label: 'Marke', to: { name: 'brands.index' } },
  { name: 'models', label: 'Modeli', to: { name: 'models.index' } },
  { name: 'generations', label: 'Generacije', to: { name: 'generations.index' } },
  { name: 'engines', label: 'Motori', to: { name: 'engines.index' } },
  { name: 'cars', label: 'Automobili', to: { name: 'cars.index' } },
]

function isActive(name: string): boolean {
  return route.name?.toString().startsWith(name) ?? false
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <aside class="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div class="h-16 flex items-center px-5 border-b border-gray-200">
        <span class="font-semibold text-gray-900">Auto Pregled</span>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-0.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="isActive(item.name)
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="px-3 py-4 border-t border-gray-200">
        <div class="px-3 py-2">
          <p class="text-sm font-medium text-gray-900">{{ auth.admin?.name }}</p>
          <p class="text-xs text-gray-500">{{ auth.admin?.email }}</p>
        </div>
        <button
          @click="handleLogout"
          class="w-full mt-1 flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          Odjavi se
        </button>
      </div>
    </aside>

    <div class="flex-1 min-w-0">
      <RouterView />
    </div>
  </div>
</template>