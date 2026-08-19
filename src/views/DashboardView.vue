<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">Dobrodošao, {{ auth.admin?.name }}</h1>
    <button @click="handleLogout" class="mt-4 text-sm text-red-600">Odjavi se</button>
  </div>
</template>