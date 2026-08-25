<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchBrand, createBrand, updateBrand } from '@/api/brands'
import type { BrandFormData } from '@/types/brand'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'

const route = useRoute()
const router = useRouter()

const brandId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEditing = computed(() => brandId.value !== null)

const form = ref<BrandFormData>({ name: '', slug: '', logo_path: null })
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function handleNameInput() {
  if (!isEditing.value) form.value.slug = slugify(form.value.name)
}

async function loadBrand() {
  if (!brandId.value) return
  isLoading.value = true
  const brand = await fetchBrand(brandId.value)
  form.value = { name: brand.name, slug: brand.slug, logo_path: brand.logo_path }
  isLoading.value = false
}

async function handleSubmit() {
  errors.value = {}
  isSubmitting.value = true
  try {
    if (isEditing.value && brandId.value) {
      await updateBrand(brandId.value, form.value)
    } else {
      await createBrand(form.value)
    }
    router.push({ name: 'brands.index' })
  } catch (err: any) {
    if (err.response?.status === 422) errors.value = err.response.data.errors
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadBrand)
</script>

<template>
  <div>
    <PageHeader :title="isEditing ? 'Izmeni marku' : 'Dodaj marku'" />

    <div class="p-6 max-w-xl">
      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <AppInput v-model="form.name" label="Naziv" required @input="handleNameInput" :error="errors.name?.[0]" />
        <AppInput v-model="form.slug" label="Slug" required :error="errors.slug?.[0]" />

        <div class="flex justify-end gap-3 pt-2">
          <RouterLink :to="{ name: 'brands.index' }">
            <AppButton variant="secondary">Otkaži</AppButton>
          </RouterLink>
          <AppButton type="submit" variant="primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Čuvanje...' : 'Sačuvaj' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>