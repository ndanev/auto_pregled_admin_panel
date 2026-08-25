<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchGeneration, createGeneration, updateGeneration } from '@/api/generations'
import { fetchModels } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import type { GenerationFormData } from '@/types/generation'
import type { CarModel } from '@/types/model'
import type { Brand } from '@/types/brand'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'

const route = useRoute()
const router = useRouter()
const generationId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEditing = computed(() => generationId.value !== null)

const brands = ref<Brand[]>([])
const allModels = ref<CarModel[]>([])
const selectedBrandId = ref<number | null>(null)

const filteredModels = computed(() =>
  selectedBrandId.value ? allModels.value.filter((m) => m.brand_id === selectedBrandId.value) : []
)

const form = ref<GenerationFormData>({ model_id: null, name: '', slug: '', year_start: null, year_end: null })
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
function handleNameInput() {
  if (!isEditing.value) form.value.slug = slugify(form.value.name)
}

watch(selectedBrandId, () => {
  const stillValid = filteredModels.value.some((m) => m.id === form.value.model_id)
  if (!stillValid) form.value.model_id = null
})

async function loadGeneration() {
  if (!generationId.value) return
  isLoading.value = true
  const generation = await fetchGeneration(generationId.value)
  form.value = {
    model_id: generation.model_id,
    name: generation.name,
    slug: generation.slug,
    year_start: generation.year_start,
    year_end: generation.year_end,
  }
  selectedBrandId.value = generation.model.brand_id
  isLoading.value = false
}
async function handleSubmit() {
  errors.value = {}
  isSubmitting.value = true
  try {
    if (isEditing.value && generationId.value) await updateGeneration(generationId.value, form.value)
    else await createGeneration(form.value)
    router.push({ name: 'generations.index' })
  } catch (err: any) {
    if (err.response?.status === 422) errors.value = err.response.data.errors
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  brands.value = await fetchBrands()
  allModels.value = await fetchModels()
  await loadGeneration()
})
</script>

<template>
  <div>
    <PageHeader :title="isEditing ? 'Izmeni generaciju' : 'Dodaj generaciju'" />
    <div class="p-6 max-w-xl">
      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>
      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <AppSelect v-model="selectedBrandId" label="Marka" required>
          <option :value="null" disabled>Izaberi marku</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
        </AppSelect>
        <AppSelect v-model="form.model_id" label="Model" required :disabled="!selectedBrandId" :error="errors.model_id?.[0]">
          <option :value="null" disabled>Izaberi model</option>
          <option v-for="model in filteredModels" :key="model.id" :value="model.id">{{ model.name }}</option>
        </AppSelect>
        <AppInput v-model="form.name" label="Naziv generacije" placeholder="npr. MK7" required @input="handleNameInput" :error="errors.name?.[0]" />
        <AppInput v-model="form.slug" label="Slug" required :error="errors.slug?.[0]" />
        <div class="grid grid-cols-2 gap-4">
          <AppInput v-model.number="form.year_start" type="number" label="Godina početka" required :error="errors.year_start?.[0]" />
          <AppInput v-model.number="form.year_end" type="number" label="Godina kraja" placeholder="i dalje u proizvodnji" :error="errors.year_end?.[0]" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <RouterLink :to="{ name: 'generations.index' }"><AppButton variant="secondary">Otkaži</AppButton></RouterLink>
          <AppButton type="submit" variant="primary" :disabled="isSubmitting">{{ isSubmitting ? 'Čuvanje...' : 'Sačuvaj' }}</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>