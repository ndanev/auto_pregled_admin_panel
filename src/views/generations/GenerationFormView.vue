<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchGeneration, createGeneration, updateGeneration } from '@/api/generations'
import { fetchModels } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import type { GenerationFormData } from '@/types/generation'
import type { CarModel } from '@/types/model'
import type { Brand } from '@/types/brand'

const route = useRoute()
const router = useRouter()

const generationId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEditing = computed(() => generationId.value !== null)

const brands = ref<Brand[]>([])
const allModels = ref<CarModel[]>([])
const selectedBrandId = ref<number | null>(null)

const filteredModels = computed(() =>
  selectedBrandId.value
    ? allModels.value.filter((m) => m.brand_id === selectedBrandId.value)
    : []
)

const form = ref<GenerationFormData>({
  model_id: null,
  name: '',
  slug: '',
  year_start: null,
  year_end: null,
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function handleNameInput() {
  if (!isEditing.value) {
    form.value.slug = slugify(form.value.name)
  }
}

// Kad se promeni marka, resetuj model_id ako model ne pripada toj marki
watch(selectedBrandId, () => {
  const stillValid = filteredModels.value.some((m) => m.id === form.value.model_id)
  if (!stillValid) {
    form.value.model_id = null
  }
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
    if (isEditing.value && generationId.value) {
      await updateGeneration(generationId.value, form.value)
    } else {
      await createGeneration(form.value)
    }
    router.push({ name: 'generations.index' })
  } catch (err: any) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    }
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
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEditing ? 'Izmeni generaciju' : 'Dodaj generaciju' }}
    </h1>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Marka</label>
        <select
          v-model="selectedBrandId"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option :value="null" disabled>Izaberi marku</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Model</label>
        <select
          v-model="form.model_id"
          required
          :disabled="!selectedBrandId"
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option :value="null" disabled>Izaberi model</option>
          <option v-for="model in filteredModels" :key="model.id" :value="model.id">
            {{ model.name }}
          </option>
        </select>
        <p v-if="errors.model_id" class="mt-1 text-sm text-red-600">{{ errors.model_id[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Naziv generacije</label>
        <input
          v-model="form.name"
          @input="handleNameInput"
          type="text"
          placeholder="npr. MK7"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Slug</label>
        <input
          v-model="form.slug"
          type="text"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug[0] }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Godina početka</label>
          <input
            v-model.number="form.year_start"
            type="number"
            required
            class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p v-if="errors.year_start" class="mt-1 text-sm text-red-600">{{ errors.year_start[0] }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Godina kraja</label>
          <input
            v-model.number="form.year_end"
            type="number"
            placeholder="prazno = i dalje u proizvodnji"
            class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p v-if="errors.year_end" class="mt-1 text-sm text-red-600">{{ errors.year_end[0] }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <RouterLink
          :to="{ name: 'generations.index' }"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Otkaži
        </RouterLink>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Čuvanje...' : 'Sačuvaj' }}
        </button>
      </div>
    </form>
  </div>
</template>