<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchBrand, createBrand, updateBrand } from '@/api/brands'
import type { BrandFormData } from '@/types/brand'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { uploadBrandLogo } from '@/api/brands'
import type { Brand } from '@/types/brand'

const route = useRoute()
const router = useRouter()

const brandId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEditing = computed(() => brandId.value !== null)

const form = ref<BrandFormData>({ name: '', slug: '' })
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)
const currentBrand = ref<Brand | null>(null)
const isUploadingLogo = ref(false)

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
  currentBrand.value = brand
  form.value = { name: brand.name, slug: brand.slug }
  isLoading.value = false
}

async function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !brandId.value) return

  isUploadingLogo.value = true
  try {
    currentBrand.value = await uploadBrandLogo(brandId.value, file)
  } finally {
    isUploadingLogo.value = false
    target.value = ''
  }
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

        <div v-if="isEditing">
  <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
  <div class="flex items-center gap-4">
    <div class="w-16 h-16 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
      <img v-if="currentBrand?.logo_url" :src="currentBrand.logo_url" alt="" class="w-full h-full object-contain" />
      <span v-else class="text-xs text-gray-400">Nema</span>
    </div>
    <label class="cursor-pointer text-sm text-indigo-600 hover:underline">
      {{ isUploadingLogo ? 'Učitavanje...' : 'Otpremi logo' }}
      <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" :disabled="isUploadingLogo" />
    </label>
  </div>
</div>
<p v-else class="text-sm text-gray-400">Logo se dodaje nakon čuvanja marke.</p>

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