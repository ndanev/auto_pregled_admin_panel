<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchGenerations, deleteGeneration } from '@/api/generations'
import { fetchModels } from '@/api/models'
import type { Generation } from '@/types/generation'
import type { CarModel } from '@/types/model'

const generations = ref<Generation[]>([])
const models = ref<CarModel[]>([])
const selectedModelId = ref<number | null>(null)
const isLoading = ref(true)
const generationToDelete = ref<Generation | null>(null)

async function loadGenerations() {
  isLoading.value = true
  generations.value = await fetchGenerations(selectedModelId.value ?? undefined)
  isLoading.value = false
}

async function loadModels() {
  models.value = await fetchModels()
}

function confirmDelete(generation: Generation) {
  generationToDelete.value = generation
}

async function handleDelete() {
  if (!generationToDelete.value) return
  await deleteGeneration(generationToDelete.value.id)
  generationToDelete.value = null
  await loadGenerations()
}

function formatYears(generation: Generation): string {
  return generation.year_end
    ? `${generation.year_start}–${generation.year_end}`
    : `${generation.year_start}–danas`
}

watch(selectedModelId, loadGenerations)

onMounted(() => {
  loadModels()
  loadGenerations()
})
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Generacije</h1>
      <RouterLink
        :to="{ name: 'generations.create' }"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Dodaj generaciju
      </RouterLink>
    </div>

    <div class="mb-4">
      <select
        v-model="selectedModelId"
        class="rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option :value="null">Svi modeli</option>
        <option v-for="model in models" :key="model.id" :value="model.id">
          {{ model.brand.name }} {{ model.name }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-500">
          <tr>
            <th class="px-4 py-3 font-medium">Naziv</th>
            <th class="px-4 py-3 font-medium">Model</th>
            <th class="px-4 py-3 font-medium">Godine</th>
            <th class="px-4 py-3 font-medium">Motora</th>
            <th class="px-4 py-3 font-medium">Automobila</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="generation in generations" :key="generation.id">
            <td class="px-4 py-3 text-gray-900">{{ generation.name }}</td>
            <td class="px-4 py-3 text-gray-500">
              {{ generation.model.brand.name }} {{ generation.model.name }}
            </td>
            <td class="px-4 py-3 text-gray-500">{{ formatYears(generation) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ generation.engines_count ?? 0 }}</td>
            <td class="px-4 py-3 text-gray-500">{{ generation.cars_count ?? 0 }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <RouterLink
                :to="{ name: 'generations.edit', params: { id: generation.id } }"
                class="text-blue-600 hover:underline"
              >
                Izmeni
              </RouterLink>
              <button @click="confirmDelete(generation)" class="text-red-600 hover:underline">
                Obriši
              </button>
            </td>
          </tr>
          <tr v-if="generations.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-400">
              Nema dodatih generacija.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog :open="generationToDelete !== null" @close="generationToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
          <DialogTitle class="text-lg font-semibold text-gray-900">
            Obriši generaciju?
          </DialogTitle>
          <p class="mt-2 text-sm text-gray-500">
            Da li si siguran da želiš da obrišeš "{{ generationToDelete?.name }}"? Ova akcija je nepovratna.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="generationToDelete = null"
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