<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchBrands, deleteBrand } from '@/api/brands'
import type { Brand } from '@/types/brand'

const brands = ref<Brand[]>([])
const isLoading = ref(true)
const brandToDelete = ref<Brand | null>(null)

async function loadBrands() {
  isLoading.value = true
  brands.value = await fetchBrands()
  isLoading.value = false
}

function confirmDelete(brand: Brand) {
  brandToDelete.value = brand
}

async function handleDelete() {
  if (!brandToDelete.value) return
  await deleteBrand(brandToDelete.value.id)
  brandToDelete.value = null
  await loadBrands()
}

onMounted(loadBrands)
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Marke</h1>
      <RouterLink
        :to="{ name: 'brands.create' }"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Dodaj marku
      </RouterLink>
    </div>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-500">
          <tr>
            <th class="px-4 py-3 font-medium">Naziv</th>
            <th class="px-4 py-3 font-medium">Slug</th>
            <th class="px-4 py-3 font-medium">Modela</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="brand in brands" :key="brand.id">
            <td class="px-4 py-3 text-gray-900">{{ brand.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ brand.slug }}</td>
            <td class="px-4 py-3 text-gray-500">{{ brand.models_count ?? 0 }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <RouterLink
                :to="{ name: 'brands.edit', params: { id: brand.id } }"
                class="text-blue-600 hover:underline"
              >
                Izmeni
              </RouterLink>
              <button @click="confirmDelete(brand)" class="text-red-600 hover:underline">
                Obriši
              </button>
            </td>
          </tr>
          <tr v-if="brands.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-400">
              Nema dodatih marki.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog :open="brandToDelete !== null" @close="brandToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
          <DialogTitle class="text-lg font-semibold text-gray-900">
            Obriši marku?
          </DialogTitle>
          <p class="mt-2 text-sm text-gray-500">
            Da li si siguran da želiš da obrišeš "{{ brandToDelete?.name }}"? Ova akcija je nepovratna.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="brandToDelete = null"
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