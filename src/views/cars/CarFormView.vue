<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchCar, createCar, updateCar } from '@/api/cars'
import { fetchGenerations } from '@/api/generations'
import { fetchEngines } from '@/api/engines'
import { fetchModels } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import {
  TRANSMISSION_LABELS,
  DRIVETRAIN_LABELS,
  BODY_TYPE_LABELS,
  CAR_STATUS_LABELS,
} from '@/types/car'
import type { CarFormData, Transmission, Drivetrain, BodyType } from '@/types/car'
import type { Generation } from '@/types/generation'
import type { Engine } from '@/types/engine'
import type { CarModel } from '@/types/model'
import type { Brand } from '@/types/brand'

const route = useRoute()
const router = useRouter()

const carId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEditing = computed(() => carId.value !== null)

const brands = ref<Brand[]>([])
const allModels = ref<CarModel[]>([])
const allGenerations = ref<Generation[]>([])
const allEngines = ref<Engine[]>([])

const selectedBrandId = ref<number | null>(null)
const selectedModelId = ref<number | null>(null)
const selectedGenerationId = ref<number | null>(null)

const existingSlug = ref<string | null>(null)

const filteredModels = computed(() =>
  selectedBrandId.value
    ? allModels.value.filter((m) => m.brand_id === selectedBrandId.value)
    : []
)

const filteredGenerations = computed(() =>
  selectedModelId.value
    ? allGenerations.value.filter((g) => g.model_id === selectedModelId.value)
    : []
)

const filteredEngines = computed(() =>
  selectedGenerationId.value
    ? allEngines.value.filter((e) => e.generation_id === selectedGenerationId.value)
    : []
)

const slugPreview = computed(() => {
  if (existingSlug.value) return existingSlug.value
  if (!selectedGenerationId.value || !form.value.engine_id || !form.value.transmission) {
    return 'biće generisan automatski nakon čuvanja'
  }
  return '(generiše se automatski)'
})

const form = ref<CarFormData>({
  generation_id: null,
  engine_id: null,
  transmission: null,
  drivetrain: null,
  body_type: null,
  status: 'draft',
  meta_title: null,
  meta_description: null,
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

const transmissionOptions = Object.entries(TRANSMISSION_LABELS) as [Transmission, string][]
const drivetrainOptions = Object.entries(DRIVETRAIN_LABELS) as [Drivetrain, string][]
const bodyTypeOptions = Object.entries(BODY_TYPE_LABELS) as [BodyType, string][]
const statusOptions = Object.entries(CAR_STATUS_LABELS) as ['draft' | 'published', string][]

watch(selectedBrandId, () => {
  const stillValid = filteredModels.value.some((m) => m.id === selectedModelId.value)
  if (!stillValid) selectedModelId.value = null
})

watch(selectedModelId, () => {
  const stillValid = filteredGenerations.value.some((g) => g.id === selectedGenerationId.value)
  if (!stillValid) selectedGenerationId.value = null
})

watch(selectedGenerationId, (val) => {
  form.value.generation_id = val
  const stillValid = filteredEngines.value.some((e) => e.id === form.value.engine_id)
  if (!stillValid) form.value.engine_id = null
})

async function loadCar() {
  if (!carId.value) return
  isLoading.value = true
  const car = await fetchCar(carId.value)
  form.value = {
    generation_id: car.generation_id,
    engine_id: car.engine_id,
    transmission: car.transmission,
    drivetrain: car.drivetrain,
    body_type: car.body_type,
    status: car.status,
    meta_title: car.meta_title,
    meta_description: car.meta_description,
  }
  existingSlug.value = car.slug
  selectedGenerationId.value = car.generation_id
  selectedModelId.value = car.generation.model_id
  selectedBrandId.value = car.generation.model.brand_id
  isLoading.value = false
}

async function handleSubmit() {
  errors.value = {}
  isSubmitting.value = true
  try {
    if (isEditing.value && carId.value) {
      await updateCar(carId.value, form.value)
    } else {
      await createCar(form.value)
    }
    router.push({ name: 'cars.index' })
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
  allGenerations.value = await fetchGenerations()
  allEngines.value = await fetchEngines()
  await loadCar()
})
</script>

<template>
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEditing ? 'Izmeni automobil' : 'Dodaj automobil' }}
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
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Model</label>
        <select
          v-model="selectedModelId"
          required
          :disabled="!selectedBrandId"
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option :value="null" disabled>Izaberi model</option>
          <option v-for="model in filteredModels" :key="model.id" :value="model.id">{{ model.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Generacija</label>
        <select
          v-model="selectedGenerationId"
          required
          :disabled="!selectedModelId"
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option :value="null" disabled>Izaberi generaciju</option>
          <option v-for="generation in filteredGenerations" :key="generation.id" :value="generation.id">
            {{ generation.name }}
          </option>
        </select>
        <p v-if="errors.generation_id" class="mt-1 text-sm text-red-600">{{ errors.generation_id[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Motor</label>
        <select
          v-model="form.engine_id"
          required
          :disabled="!selectedGenerationId"
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option :value="null" disabled>Izaberi motor</option>
          <option v-for="engine in filteredEngines" :key="engine.id" :value="engine.id">{{ engine.name }}</option>
        </select>
        <p v-if="errors.engine_id" class="mt-1 text-sm text-red-600">{{ errors.engine_id[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Menjač</label>
        <select
          v-model="form.transmission"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option :value="null" disabled>Izaberi menjač</option>
          <option v-for="[value, label] in transmissionOptions" :key="value" :value="value">{{ label }}</option>
        </select>
        <p v-if="errors.transmission" class="mt-1 text-sm text-red-600">{{ errors.transmission[0] }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Pogon (opciono)</label>
          <select
            v-model="form.drivetrain"
            class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option :value="null">—</option>
            <option v-for="[value, label] in drivetrainOptions" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Karoserija (opciono)</label>
          <select
            v-model="form.body_type"
            class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option :value="null">—</option>
            <option v-for="[value, label] in bodyTypeOptions" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Status</label>
        <select
          v-model="form.status"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option v-for="[value, label] in statusOptions" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>

      <div class="bg-gray-50 rounded-md p-3">
        <span class="block text-xs font-medium text-gray-500 mb-1">Slug (URL)</span>
        <span class="font-mono text-sm text-gray-700">{{ slugPreview }}</span>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Meta naslov (opciono)</label>
        <input
          v-model="form.meta_title"
          type="text"
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p v-if="errors.meta_title" class="mt-1 text-sm text-red-600">{{ errors.meta_title[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Meta opis (opciono)</label>
        <textarea
          v-model="form.meta_description"
          rows="2"
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <RouterLink
          :to="{ name: 'cars.index' }"
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