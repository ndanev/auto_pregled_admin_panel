<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  error.value = ''
  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch {
    error.value = 'Neispravni podaci za prijavu.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <form @submit.prevent="handleSubmit" class="bg-white p-8 rounded-lg border border-gray-200 shadow-sm w-full max-w-sm space-y-5">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Auto Pregled</h1>
        <p class="text-sm text-gray-500 mt-1">Prijavi se u admin panel</p>
      </div>

      <AppInput v-model="email" type="email" label="Email" required />
      <AppInput v-model="password" type="password" label="Lozinka" required />

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <AppButton type="submit" variant="primary" :disabled="isSubmitting" class="w-full justify-center">
        {{ isSubmitting ? 'Prijavljivanje...' : 'Prijavi se' }}
      </AppButton>
    </form>
  </div>
</template>