<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchCar, createCar, updateCar } from '@/api/cars'
import { fetchGenerations } from '@/api/generations'
import { fetchEngines } from '@/api/engines'
import { fetchModels } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import { TRANSMISSION_LABELS, DRIVETRAIN_LABELS, BODY_TYPE_LABELS, CAR_STATUS_LABELS } from '@/types/car'
import type { CarFormData, Transmission, Drivetrain, BodyType } from '@/types/car'
import type { Generation } from '@/types/generation'
import type { Engine } from '@/types/engine'
import type { CarModel } from '@/types/model'
import type { Brand } from '@/types/brand'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'

const route = useRoute()
const router = useRouter()
const carId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEditing = computed(() => carId.value !== null)

const brands = ref<Brand[]>([])
const allModels = ref<CarModel[]>([])
const allGenerations = ref<Generation[]>([])
const allEngines = ref<Engine[]>([])
const selectedBrandId = ref<number | null>(null)
const selectedModelId = ref<number | null>(null)
const selectedGenerationId = ref<number | null>(null)
const existingSlug = ref<string | null>(null)

const filteredModels = computed(() => selectedBrandId.value ? allModels.value.filter((m) => m.brand_id === selectedBrandId.value) : [])
const filteredGenerations = computed(() => selectedModelId.value ? allGenerations.value.filter((g) => g.model_id === selectedModelId.value) : [])
const filteredEngines = computed(() => selectedGenerationId.value ? allEngines.value.filter((e) => e.generation_id === selectedGenerationId.value) : [])

const slugPreview = computed(() => existingSlug.value ?? '(generiše se automatski nakon čuvanja)')

const form = ref<CarFormData>({
  generation_id: null, engine_id: null, transmission: null, drivetrain: null, body_type: null,
  status: 'draft', meta_title: null, meta_description: null,
})
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

const transmissionOptions = Object.entries(TRANSMISSION_LABELS) as [Transmission, string][]
const drivetrainOptions = Object.entries(DRIVETRAIN_LABELS) as [Drivetrain, string][]
const bodyTypeOptions = Object.entries(BODY_TYPE_LABELS) as [BodyType, string][]
const statusOptions = Object.entries(CAR_STATUS_LABELS) as ['draft' | 'published', string][]

watch(selectedBrandId, () => { if (!filteredModels.value.some((m) => m.id === selectedModelId.value)) selectedModelId.value = null })
watch(selectedModelId, () => { if (!filteredGenerations.value.some((g) => g.id === selectedGenerationId.value)) selectedGenerationId.value = null })
watch(selectedGenerationId, (val) => {
  form.value.generation_id = val
  if (!filteredEngines.value.some((e) => e.id === form.value.engine_id)) form.value.engine_id = null
})

async function loadCar() {
  if (!carId.value) return
  isLoading.value = true
  const car = await fetchCar(carId.value)
  form.value = {
    generation_id: car.generation_id, engine_id: car.engine_id, transmission: car.transmission,
    drivetrain: car.drivetrain, body_type: car.body_type, status: car.status,
    meta_title: car.meta_title, meta_description: car.meta_description,
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
    if (isEditing.value && carId.value) await updateCar(carId.value, form.value)
    else await createCar(form.value)
    router.push({ name: 'cars.index' })
  } catch (err: any) {
    if (err.response?.status === 422) errors.value = err.response.data.errors
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
  <div>
    <PageHeader :title="isEditing ? 'Izmeni automobil' : 'Dodaj automobil'" />
    <div class="p-6 max-w-xl">
      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>
      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <AppSelect v-model="selectedBrandId" label="Marka" required>
          <option :value="null" disabled>Izaberi marku</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
        </AppSelect>
        <AppSelect v-model="selectedModelId" label="Model" required :disabled="!selectedBrandId">
          <option :value="null" disabled>Izaberi model</option>
          <option v-for="model in filteredModels" :key="model.id" :value="model.id">{{ model.name }}</option>
        </AppSelect>
        <AppSelect v-model="selectedGenerationId" label="Generacija" required :disabled="!selectedModelId" :error="errors.generation_id?.[0]">
          <option :value="null" disabled>Izaberi generaciju</option>
          <option v-for="generation in filteredGenerations" :key="generation.id" :value="generation.id">{{ generation.name }}</option>
        </AppSelect>
        <AppSelect v-model="form.engine_id" label="Motor" required :disabled="!selectedGenerationId" :error="errors.engine_id?.[0]">
          <option :value="null" disabled>Izaberi motor</option>
          <option v-for="engine in filteredEngines" :key="engine.id" :value="engine.id">{{ engine.name }}</option>
        </AppSelect>
        <AppSelect v-model="form.transmission" label="Menjač" required :error="errors.transmission?.[0]">
          <option :value="null" disabled>Izaberi menjač</option>
          <option v-for="[value, label] in transmissionOptions" :key="value" :value="value">{{ label }}</option>
        </AppSelect>
        <div class="grid grid-cols-2 gap-4">
          <AppSelect v-model="form.drivetrain" label="Pogon (opciono)">
            <option :value="null">—</option>
            <option v-for="[value, label] in drivetrainOptions" :key="value" :value="value">{{ label }}</option>
          </AppSelect>
          <AppSelect v-model="form.body_type" label="Karoserija (opciono)">
            <option :value="null">—</option>
            <option v-for="[value, label] in bodyTypeOptions" :key="value" :value="value">{{ label }}</option>
          </AppSelect>
        </div>
        <AppSelect v-model="form.status" label="Status" required>
          <option v-for="[value, label] in statusOptions" :key="value" :value="value">{{ label }}</option>
        </AppSelect>

        <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
          <span class="block text-xs font-medium text-gray-500 mb-1">Slug (URL)</span>
          <span class="font-mono text-sm text-gray-700">{{ slugPreview }}</span>
        </div>

        <AppInput v-model="form.meta_title" label="Meta naslov (opciono)" :error="errors.meta_title?.[0]" />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Meta opis (opciono)</label>
          <textarea v-model="form.meta_description" rows="2" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <RouterLink :to="{ name: 'cars.index' }"><AppButton variant="secondary">Otkaži</AppButton></RouterLink>
          <AppButton type="submit" variant="primary" :disabled="isSubmitting">{{ isSubmitting ? 'Čuvanje...' : 'Sačuvaj' }}</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>