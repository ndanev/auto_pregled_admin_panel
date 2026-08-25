<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchBrands, deleteBrand } from '@/api/brands'
import type { Brand } from '@/types/brand'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'

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
  <div>
    <PageHeader title="Marke">
      <template #actions>
        <RouterLink :to="{ name: 'brands.create' }">
          <AppButton variant="primary">Dodaj marku</AppButton>
        </RouterLink>
      </template>
    </PageHeader>

    <div class="p-6">
      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 font-medium">Naziv</th>
              <th class="px-4 py-3 font-medium">Slug</th>
              <th class="px-4 py-3 font-medium">Modela</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="brand in brands" :key="brand.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-900 font-medium">{{ brand.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ brand.slug }}</td>
              <td class="px-4 py-3 text-gray-500">{{ brand.models_count ?? 0 }}</td>
              <td class="px-4 py-3 text-right space-x-4">
                <RouterLink :to="{ name: 'brands.edit', params: { id: brand.id } }" class="text-indigo-600 hover:text-indigo-800 font-medium">
                  Izmeni
                </RouterLink>
                <button @click="confirmDelete(brand)" class="text-red-600 hover:text-red-800 font-medium">
                  Obriši
                </button>
              </td>
            </tr>
            <tr v-if="brands.length === 0">
              <td colspan="4" class="px-4 py-10 text-center text-gray-400">Nema dodatih marki.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog :open="brandToDelete !== null" @close="brandToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200">
          <DialogTitle class="text-base font-semibold text-gray-900">Obriši marku?</DialogTitle>
          <p class="mt-2 text-sm text-gray-500">
            Da li si siguran da želiš da obrišeš "{{ brandToDelete?.name }}"? Ova akcija je nepovratna.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <AppButton variant="secondary" @click="brandToDelete = null">Otkaži</AppButton>
            <AppButton variant="danger" @click="handleDelete">Obriši</AppButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>