<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchModels, deleteModel } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import type { CarModel } from '@/types/model'
import type { Brand } from '@/types/brand'

const models = ref<CarModel[]>([])
const brands = ref<Brand[]>([])
const selectedBrandId = ref<number | null>(null)
const isLoading = ref(true)
const modelToDelete = ref<CarModel | null>(null)

async function loadModels() {
  isLoading.value = true
  models.value = await fetchModels(selectedBrandId.value ?? undefined)
  isLoading.value = false
}

async function loadBrands() {
  brands.value = await fetchBrands()
}

function confirmDelete(model: CarModel) {
  modelToDelete.value = model
}

async function handleDelete() {
  if (!modelToDelete.value) return
  await deleteModel(modelToDelete.value.id)
  modelToDelete.value = null
  await loadModels()
}

watch(selectedBrandId, loadModels)

onMounted(() => {
  loadBrands()
  loadModels()
})
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Modeli</h1>
      <RouterLink
        :to="{ name: 'models.create' }"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Dodaj model
      </RouterLink>
    </div>

    <div class="mb-4">
      <select
        v-model="selectedBrandId"
        class="rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option :value="null">Sve marke</option>
        <option v-for="brand in brands" :key="brand.id" :value="brand.id">
          {{ brand.name }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-500">
          <tr>
            <th class="px-4 py-3 font-medium">Naziv</th>
            <th class="px-4 py-3 font-medium">Marka</th>
            <th class="px-4 py-3 font-medium">Slug</th>
            <th class="px-4 py-3 font-medium">Generacija</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="model in models" :key="model.id">
            <td class="px-4 py-3 text-gray-900">{{ model.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ model.brand.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ model.slug }}</td>
            <td class="px-4 py-3 text-gray-500">{{ model.generations_count ?? 0 }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <RouterLink
                :to="{ name: 'models.edit', params: { id: model.id } }"
                class="text-blue-600 hover:underline"
              >
                Izmeni
              </RouterLink>
              <button @click="confirmDelete(model)" class="text-red-600 hover:underline">
                Obriši
              </button>
            </td>
          </tr>
          <tr v-if="models.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">
              Nema dodatih modela.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog :open="modelToDelete !== null" @close="modelToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
          <DialogTitle class="text-lg font-semibold text-gray-900">
            Obriši model?
          </DialogTitle>
          <p class="mt-2 text-sm text-gray-500">
            Da li si siguran da želiš da obrišeš "{{ modelToDelete?.name }}"? Ova akcija je nepovratna.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="modelToDelete = null"
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