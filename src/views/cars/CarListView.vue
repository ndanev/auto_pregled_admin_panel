<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchCars, deleteCar } from '@/api/cars'
import { fetchGenerations } from '@/api/generations'
import { generateAiAnalysis } from '@/api/aiAnalysis'
import type { AiAnalysis } from '@/types/aiAnalysis'
import type { Car, CarStatus } from '@/types/car'
import type { Generation } from '@/types/generation'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const cars = ref<Car[]>([])
const generations = ref<Generation[]>([])
const selectedGenerationId = ref<number | null>(null)
const selectedStatus = ref<CarStatus | null>(null)
const isLoading = ref(true)
const carToDelete = ref<Car | null>(null)
const generatingCarId = ref<number | null>(null)
const analysisPreview = ref<AiAnalysis | null>(null)
const analysisError = ref<string | null>(null)

async function loadCars() {
  isLoading.value = true
  cars.value = await fetchCars({ generationId: selectedGenerationId.value ?? undefined, status: selectedStatus.value ?? undefined })
  isLoading.value = false
}
async function loadGenerations() {
  generations.value = await fetchGenerations()
}
function confirmDelete(car: Car) {
  carToDelete.value = car
}
async function handleDelete() {
  if (!carToDelete.value) return
  await deleteCar(carToDelete.value.id)
  carToDelete.value = null
  await loadCars()
}
function carLabel(car: Car): string {
  const g = car.generation
  return `${g.model.brand.name} ${g.model.name} ${g.name} ${car.engine.name}`
}
function generationLabel(g: Generation): string {
  return `${g.model.brand.name} ${g.model.name} ${g.name}`
}
async function handleGenerateAnalysis(car: Car) {
  generatingCarId.value = car.id
  analysisError.value = null
  try {
    const analysis = await generateAiAnalysis(car.id)
    analysisPreview.value = analysis
    car.has_ai_analysis = true
  } catch (err: any) {
    analysisError.value = err.response?.data?.message ?? 'Generisanje nije uspelo.'
  } finally {
    generatingCarId.value = null
  }
}

watch([selectedGenerationId, selectedStatus], loadCars)
onMounted(() => {
  loadGenerations()
  loadCars()
})
</script>

<template>
  <div>
    <PageHeader title="Automobili">
      <template #actions>
        <RouterLink :to="{ name: 'cars.create' }"><AppButton variant="primary">Dodaj automobil</AppButton></RouterLink>
      </template>
    </PageHeader>

    <div class="p-6">
      <div class="mb-4 flex gap-3 max-w-xl">
        <AppSelect v-model="selectedGenerationId">
          <option :value="null">Sve generacije</option>
          <option v-for="generation in generations" :key="generation.id" :value="generation.id">{{ generationLabel(generation) }}</option>
        </AppSelect>
        <AppSelect v-model="selectedStatus">
          <option :value="null">Svi statusi</option>
          <option value="draft">Nacrt</option>
          <option value="published">Objavljeno</option>
        </AppSelect>
      </div>

      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 font-medium">Automobil</th>
              <th class="px-4 py-3 font-medium">Slug</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Slike</th>
              <th class="px-4 py-3 font-medium">AI analiza</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="car in cars" :key="car.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-900 font-medium">{{ carLabel(car) }}</td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ car.slug }}</td>
              <td class="px-4 py-3">
                <StatusBadge :variant="car.status === 'published' ? 'success' : 'neutral'">
                  {{ car.status === 'published' ? 'Objavljeno' : 'Nacrt' }}
                </StatusBadge>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ car.images_count ?? 0 }}</td>
              <td class="px-4 py-3">
                <span v-if="car.has_ai_analysis" class="text-green-600">✓</span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-4 py-3 text-right space-x-4">
                <button @click="handleGenerateAnalysis(car)" :disabled="generatingCarId === car.id" class="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50">
                  {{ generatingCarId === car.id ? 'Generisanje...' : 'AI analiza' }}
                </button>
                <RouterLink :to="{ name: 'cars.images', params: { id: car.id } }" class="text-indigo-600 hover:text-indigo-800 font-medium">Slike</RouterLink>
                <RouterLink :to="{ name: 'cars.edit', params: { id: car.id } }" class="text-indigo-600 hover:text-indigo-800 font-medium">Izmeni</RouterLink>
                <button @click="confirmDelete(car)" class="text-red-600 hover:text-red-800 font-medium">Obriši</button>
              </td>
            </tr>
            <tr v-if="cars.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-gray-400">Nema dodatih automobila.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog :open="carToDelete !== null" @close="carToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200">
          <DialogTitle class="text-base font-semibold text-gray-900">Obriši automobil?</DialogTitle>
          <p class="mt-2 text-sm text-gray-500">Da li si siguran da želiš da obrišeš "{{ carToDelete ? carLabel(carToDelete) : '' }}"? Ova akcija je nepovratna.</p>
          <div class="mt-6 flex justify-end gap-3">
            <AppButton variant="secondary" @click="carToDelete = null">Otkaži</AppButton>
            <AppButton variant="danger" @click="handleDelete">Obriši</AppButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>

    <Dialog :open="analysisPreview !== null" @close="analysisPreview = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl border border-gray-200 max-h-[80vh] overflow-y-auto">
          <DialogTitle class="text-base font-semibold text-gray-900 mb-4">AI analiza generisana</DialogTitle>
          <div class="flex gap-3 mb-4 text-sm">
            <StatusBadge variant="neutral">Ocena: {{ analysisPreview?.overall_rating ?? '—' }}</StatusBadge>
            <StatusBadge variant="neutral">Pouzdanost: {{ analysisPreview?.reliability_score ?? '—' }}</StatusBadge>
            <StatusBadge v-if="analysisPreview?.has_insufficient_data" variant="warning">Nepotpuni podaci</StatusBadge>
          </div>
          <pre class="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs overflow-x-auto">{{ JSON.stringify(analysisPreview?.content, null, 2) }}</pre>
          <div class="mt-4 flex justify-end">
            <AppButton variant="secondary" @click="analysisPreview = null">Zatvori</AppButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>

    <div v-if="analysisError" class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-md shadow-lg text-sm">{{ analysisError }}</div>
  </div>
</template>