<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchModels, deleteModel } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import type { CarModel } from '@/types/model'
import type { Brand } from '@/types/brand'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSelect from '@/components/ui/AppSelect.vue'

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
  <div>
    <PageHeader title="Modeli">
      <template #actions>
        <RouterLink :to="{ name: 'models.create' }">
          <AppButton variant="primary">Dodaj model</AppButton>
        </RouterLink>
      </template>
    </PageHeader>

    <div class="p-6">
      <div class="mb-4 max-w-xs">
        <AppSelect v-model="selectedBrandId">
          <option :value="null">Sve marke</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
        </AppSelect>
      </div>

      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 font-medium">Naziv</th>
              <th class="px-4 py-3 font-medium">Marka</th>
              <th class="px-4 py-3 font-medium">Slug</th>
              <th class="px-4 py-3 font-medium">Generacija</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="model in models" :key="model.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-900 font-medium">{{ model.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ model.brand.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ model.slug }}</td>
              <td class="px-4 py-3 text-gray-500">{{ model.generations_count ?? 0 }}</td>
              <td class="px-4 py-3 text-right space-x-4">
                <RouterLink :to="{ name: 'models.edit', params: { id: model.id } }" class="text-indigo-600 hover:text-indigo-800 font-medium">Izmeni</RouterLink>
                <button @click="confirmDelete(model)" class="text-red-600 hover:text-red-800 font-medium">Obriši</button>
              </td>
            </tr>
            <tr v-if="models.length === 0">
              <td colspan="5" class="px-4 py-10 text-center text-gray-400">Nema dodatih modela.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog :open="modelToDelete !== null" @close="modelToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200">
          <DialogTitle class="text-base font-semibold text-gray-900">Obriši model?</DialogTitle>
          <p class="mt-2 text-sm text-gray-500">Da li si siguran da želiš da obrišeš "{{ modelToDelete?.name }}"? Ova akcija je nepovratna.</p>
          <div class="mt-6 flex justify-end gap-3">
            <AppButton variant="secondary" @click="modelToDelete = null">Otkaži</AppButton>
            <AppButton variant="danger" @click="handleDelete">Obriši</AppButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>