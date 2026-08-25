<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchModel, createModel, updateModel } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import type { ModelFormData } from '@/types/model'
import type { Brand } from '@/types/brand'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'

const route = useRoute()
const router = useRouter()
const modelId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEditing = computed(() => modelId.value !== null)

const brands = ref<Brand[]>([])
const form = ref<ModelFormData>({ brand_id: null, name: '', slug: '' })
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
function handleNameInput() {
  if (!isEditing.value) form.value.slug = slugify(form.value.name)
}
async function loadModel() {
  if (!modelId.value) return
  isLoading.value = true
  const model = await fetchModel(modelId.value)
  form.value = { brand_id: model.brand_id, name: model.name, slug: model.slug }
  isLoading.value = false
}
async function handleSubmit() {
  errors.value = {}
  isSubmitting.value = true
  try {
    if (isEditing.value && modelId.value) await updateModel(modelId.value, form.value)
    else await createModel(form.value)
    router.push({ name: 'models.index' })
  } catch (err: any) {
    if (err.response?.status === 422) errors.value = err.response.data.errors
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  brands.value = await fetchBrands()
  await loadModel()
})
</script>

<template>
  <div>
    <PageHeader :title="isEditing ? 'Izmeni model' : 'Dodaj model'" />
    <div class="p-6 max-w-xl">
      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>
      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <AppSelect v-model="form.brand_id" label="Marka" required :error="errors.brand_id?.[0]">
          <option :value="null" disabled>Izaberi marku</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
        </AppSelect>
        <AppInput v-model="form.name" label="Naziv" required @input="handleNameInput" :error="errors.name?.[0]" />
        <AppInput v-model="form.slug" label="Slug" required :error="errors.slug?.[0]" />
        <div class="flex justify-end gap-3 pt-2">
          <RouterLink :to="{ name: 'models.index' }"><AppButton variant="secondary">Otkaži</AppButton></RouterLink>
          <AppButton type="submit" variant="primary" :disabled="isSubmitting">{{ isSubmitting ? 'Čuvanje...' : 'Sačuvaj' }}</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>