<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchCars, deleteCar } from '@/api/cars'
import { fetchGenerations } from '@/api/generations'
import { CAR_STATUS_LABELS } from '@/types/car'
import type { Car, CarStatus } from '@/types/car'
import type { Generation } from '@/types/generation'

const cars = ref<Car[]>([])
const generations = ref<Generation[]>([])
const selectedGenerationId = ref<number | null>(null)
const selectedStatus = ref<CarStatus | null>(null)
const isLoading = ref(true)
const carToDelete = ref<Car | null>(null)

async function loadCars() {
  isLoading.value = true
  cars.value = await fetchCars({
    generationId: selectedGenerationId.value ?? undefined,
    status: selectedStatus.value ?? undefined,
  })
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

function generationLabel(generation: Generation): string {
  return `${generation.model.brand.name} ${generation.model.name} ${generation.name}`
}

watch([selectedGenerationId, selectedStatus], loadCars)

onMounted(() => {
  loadGenerations()
  loadCars()
})
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Automobili</h1>
      <RouterLink
        :to="{ name: 'cars.create' }"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Dodaj automobil
      </RouterLink>
    </div>

    <div class="mb-4 flex gap-3">
      <select
        v-model="selectedGenerationId"
        class="rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option :value="null">Sve generacije</option>
        <option v-for="generation in generations" :key="generation.id" :value="generation.id">
          {{ generationLabel(generation) }}
        </option>
      </select>

      <select
        v-model="selectedStatus"
        class="rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option :value="null">Svi statusi</option>
        <option value="draft">Nacrt</option>
        <option value="published">Objavljeno</option>
      </select>
    </div>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-500">
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
          <tr v-for="car in cars" :key="car.id">
            <td class="px-4 py-3 text-gray-900">{{ carLabel(car) }}</td>
            <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ car.slug }}</td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="car.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ CAR_STATUS_LABELS[car.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ car.images_count ?? 0 }}</td>
            <td class="px-4 py-3 text-gray-500">
              <span v-if="car.has_ai_analysis" class="text-green-600">✓</span>
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-4 py-3 text-right space-x-3">
              <RouterLink
                :to="{ name: 'cars.edit', params: { id: car.id } }"
                class="text-blue-600 hover:underline"
              >
                Izmeni
              </RouterLink>
              <button @click="confirmDelete(car)" class="text-red-600 hover:underline">
                Obriši
              </button>
            </td>
          </tr>
          <tr v-if="cars.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-400">
              Nema dodatih automobila.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog :open="carToDelete !== null" @close="carToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
          <DialogTitle class="text-lg font-semibold text-gray-900">
            Obriši automobil?
          </DialogTitle>
          <p class="mt-2 text-sm text-gray-500">
            Da li si siguran da želiš da obrišeš "{{ carToDelete ? carLabel(carToDelete) : '' }}"? Ova akcija je nepovratna.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="carToDelete = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Otkaži
            </button>
            <button
              @click="handleDelete"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Obriši
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>