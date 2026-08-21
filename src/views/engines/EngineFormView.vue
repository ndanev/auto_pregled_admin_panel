<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchEngine, createEngine, updateEngine } from '@/api/engines'
import { fetchGenerations } from '@/api/generations'
import { fetchModels } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import { FUEL_TYPE_LABELS } from '@/types/engine'
import type { EngineFormData, FuelType } from '@/types/engine'
import type { Generation } from '@/types/generation'
import type { CarModel } from '@/types/model'
import type { Brand } from '@/types/brand'

const route = useRoute()
const router = useRouter()

const engineId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEditing = computed(() => engineId.value !== null)

const brands = ref<Brand[]>([])
const allModels = ref<CarModel[]>([])
const allGenerations = ref<Generation[]>([])

const selectedBrandId = ref<number | null>(null)
const selectedModelId = ref<number | null>(null)

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

const form = ref<EngineFormData>({
  generation_id: null,
  name: '',
  fuel_type: null,
  displacement_cc: null,
  power_hp: null,
  torque_nm: null,
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

const fuelTypeOptions = Object.entries(FUEL_TYPE_LABELS) as [FuelType, string][]

watch(selectedBrandId, () => {
  const stillValid = filteredModels.value.some((m) => m.id === selectedModelId.value)
  if (!stillValid) {
    selectedModelId.value = null
  }
})

watch(selectedModelId, () => {
  const stillValid = filteredGenerations.value.some((g) => g.id === form.value.generation_id)
  if (!stillValid) {
    form.value.generation_id = null
  }
})

async function loadEngine() {
  if (!engineId.value) return
  isLoading.value = true
  const engine = await fetchEngine(engineId.value)
  form.value = {
    generation_id: engine.generation_id,
    name: engine.name,
    fuel_type: engine.fuel_type,
    displacement_cc: engine.displacement_cc,
    power_hp: engine.power_hp,
    torque_nm: engine.torque_nm,
  }
  selectedModelId.value = engine.generation.model_id
  selectedBrandId.value = engine.generation.model.brand_id
  isLoading.value = false
}

async function handleSubmit() {
  errors.value = {}
  isSubmitting.value = true
  try {
    if (isEditing.value && engineId.value) {
      await updateEngine(engineId.value, form.value)
    } else {
      await createEngine(form.value)
    }
    router.push({ name: 'engines.index' })
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
  await loadEngine()
})
</script>

<template>
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEditing ? 'Izmeni motor' : 'Dodaj motor' }}
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
          v-model="selectedModelId"
          required
          :disabled="!selectedBrandId"
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option :value="null" disabled>Izaberi model</option>
          <option v-for="model in filteredModels" :key="model.id" :value="model.id">
            {{ model.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Generacija</label>
        <select
          v-model="form.generation_id"
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
        <label class="block text-sm font-medium text-gray-700">Naziv motora</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="npr. 2.0 TDI"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Tip goriva</label>
        <select
          v-model="form.fuel_type"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option :value="null" disabled>Izaberi tip goriva</option>
          <option v-for="[value, label] in fuelTypeOptions" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <p v-if="errors.fuel_type" class="mt-1 text-sm text-red-600">{{ errors.fuel_type[0] }}</p>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Zapremina (cm³)</label>
          <input
            v-model.number="form.displacement_cc"
            type="number"
            class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Snaga (KS)</label>
          <input
            v-model.number="form.power_hp"
            type="number"
            class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Obrtni moment (Nm)</label>
          <input
            v-model.number="form.torque_nm"
            type="number"
            class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <RouterLink
          :to="{ name: 'engines.index' }"
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