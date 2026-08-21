<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchEngines, deleteEngine } from '@/api/engines'
import { fetchGenerations } from '@/api/generations'
import { FUEL_TYPE_LABELS } from '@/types/engine'
import type { Engine } from '@/types/engine'
import type { Generation } from '@/types/generation'

const engines = ref<Engine[]>([])
const generations = ref<Generation[]>([])
const selectedGenerationId = ref<number | null>(null)
const isLoading = ref(true)
const engineToDelete = ref<Engine | null>(null)

async function loadEngines() {
  isLoading.value = true
  engines.value = await fetchEngines(selectedGenerationId.value ?? undefined)
  isLoading.value = false
}

async function loadGenerations() {
  generations.value = await fetchGenerations()
}

function confirmDelete(engine: Engine) {
  engineToDelete.value = engine
}

async function handleDelete() {
  if (!engineToDelete.value) return
  await deleteEngine(engineToDelete.value.id)
  engineToDelete.value = null
  await loadEngines()
}

function generationLabel(generation: Generation): string {
  return `${generation.model.brand.name} ${generation.model.name} ${generation.name}`
}

watch(selectedGenerationId, loadEngines)

onMounted(() => {
  loadGenerations()
  loadEngines()
})
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Motori</h1>
      <RouterLink
        :to="{ name: 'engines.create' }"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Dodaj motor
      </RouterLink>
    </div>

    <div class="mb-4">
      <select
        v-model="selectedGenerationId"
        class="rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option :value="null">Sve generacije</option>
        <option v-for="generation in generations" :key="generation.id" :value="generation.id">
          {{ generationLabel(generation) }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-500">
          <tr>
            <th class="px-4 py-3 font-medium">Naziv</th>
            <th class="px-4 py-3 font-medium">Generacija</th>
            <th class="px-4 py-3 font-medium">Gorivo</th>
            <th class="px-4 py-3 font-medium">Snaga (KS)</th>
            <th class="px-4 py-3 font-medium">Automobila</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="engine in engines" :key="engine.id">
            <td class="px-4 py-3 text-gray-900">{{ engine.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ generationLabel(engine.generation) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ FUEL_TYPE_LABELS[engine.fuel_type] }}</td>
            <td class="px-4 py-3 text-gray-500">{{ engine.power_hp ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ engine.cars_count ?? 0 }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <RouterLink
                :to="{ name: 'engines.edit', params: { id: engine.id } }"
                class="text-blue-600 hover:underline"
              >
                Izmeni
              </RouterLink>
              <button @click="confirmDelete(engine)" class="text-red-600 hover:underline">
                Obriši
              </button>
            </td>
          </tr>
          <tr v-if="engines.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-400">
              Nema dodatih motora.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog :open="engineToDelete !== null" @close="engineToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
          <DialogTitle class="text-lg font-semibold text-gray-900">
            Obriši motor?
          </DialogTitle>
          <p class="mt-2 text-sm text-gray-500">
            Da li si siguran da želiš da obrišeš "{{ engineToDelete?.name }}"? Ova akcija je nepovratna.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="engineToDelete = null"
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