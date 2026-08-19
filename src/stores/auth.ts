import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/axios'

interface Admin {
  id: number
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const admin = ref<Admin | null>(null)
  const isLoading = ref(false)
  const initialized = ref(false)

  async function login(email: string, password: string) {
    await api.get('/sanctum/csrf-cookie')
    const response = await api.post('/api/admin/login', { email, password })
    admin.value = response.data.admin
    initialized.value = true
  }

  async function logout() {
    await api.post('/api/admin/logout')
    admin.value = null
  }

  async function fetchMe() {
    isLoading.value = true
    try {
      const response = await api.get('/api/admin/me')
      admin.value = response.data.admin
    } catch {
      admin.value = null
    } finally {
      isLoading.value = false
      initialized.value = true
    }
  }

  return { admin, isLoading, initialized, login, logout, fetchMe }
})