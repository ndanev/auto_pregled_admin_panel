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
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'

const route = useRoute()
const router = useRouter()
const engineId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEditing = computed(() => engineId.value !== null)

const brands = ref<Brand[]>([])
const allModels = ref<CarModel[]>([])
const allGenerations = ref<Generation[]>([])
const selectedBrandId = ref<number | null>(null)
const selectedModelId = ref<number | null>(null)

const filteredModels = computed(() =>
  selectedBrandId.value ? allModels.value.filter((m) => m.brand_id === selectedBrandId.value) : []
)
const filteredGenerations = computed(() =>
  selectedModelId.value ? allGenerations.value.filter((g) => g.model_id === selectedModelId.value) : []
)

const form = ref<EngineFormData>({
  generation_id: null, name: '', fuel_type: null, displacement_cc: null, power_hp: null, torque_nm: null,
})
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)
const fuelTypeOptions = Object.entries(FUEL_TYPE_LABELS) as [FuelType, string][]

watch(selectedBrandId, () => {
  if (!filteredModels.value.some((m) => m.id === selectedModelId.value)) selectedModelId.value = null
})
watch(selectedModelId, () => {
  if (!filteredGenerations.value.some((g) => g.id === form.value.generation_id)) form.value.generation_id = null
})

async function loadEngine() {
  if (!engineId.value) return
  isLoading.value = true
  const engine = await fetchEngine(engineId.value)
  form.value = {
    generation_id: engine.generation_id, name: engine.name, fuel_type: engine.fuel_type,
    displacement_cc: engine.displacement_cc, power_hp: engine.power_hp, torque_nm: engine.torque_nm,
  }
  selectedModelId.value = engine.generation.model_id
  selectedBrandId.value = engine.generation.model.brand_id
  isLoading.value = false
}
async function handleSubmit() {
  errors.value = {}
  isSubmitting.value = true
  try {
    if (isEditing.value && engineId.value) await updateEngine(engineId.value, form.value)
    else await createEngine(form.value)
    router.push({ name: 'engines.index' })
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
  await loadEngine()
})
</script>

<template>
  <div>
    <PageHeader :title="isEditing ? 'Izmeni motor' : 'Dodaj motor'" />
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
        <AppSelect v-model="form.generation_id" label="Generacija" required :disabled="!selectedModelId" :error="errors.generation_id?.[0]">
          <option :value="null" disabled>Izaberi generaciju</option>
          <option v-for="generation in filteredGenerations" :key="generation.id" :value="generation.id">{{ generation.name }}</option>
        </AppSelect>
        <AppInput v-model="form.name" label="Naziv motora" placeholder="npr. 2.0 TDI" required :error="errors.name?.[0]" />
        <AppSelect v-model="form.fuel_type" label="Tip goriva" required :error="errors.fuel_type?.[0]">
          <option :value="null" disabled>Izaberi tip goriva</option>
          <option v-for="[value, label] in fuelTypeOptions" :key="value" :value="value">{{ label }}</option>
        </AppSelect>
        <div class="grid grid-cols-3 gap-4">
          <AppInput v-model.number="form.displacement_cc" type="number" label="Zapremina (cm³)" />
          <AppInput v-model.number="form.power_hp" type="number" label="Snaga (KS)" />
          <AppInput v-model.number="form.torque_nm" type="number" label="Obrtni moment (Nm)" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <RouterLink :to="{ name: 'engines.index' }"><AppButton variant="secondary">Otkaži</AppButton></RouterLink>
          <AppButton type="submit" variant="primary" :disabled="isSubmitting">{{ isSubmitting ? 'Čuvanje...' : 'Sačuvaj' }}</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>