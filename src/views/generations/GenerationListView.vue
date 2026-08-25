<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchGenerations, deleteGeneration } from '@/api/generations'
import { fetchModels } from '@/api/models'
import type { Generation } from '@/types/generation'
import type { CarModel } from '@/types/model'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSelect from '@/components/ui/AppSelect.vue'

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
function formatYears(g: Generation): string {
  return g.year_end ? `${g.year_start}–${g.year_end}` : `${g.year_start}–danas`
}

watch(selectedModelId, loadGenerations)
onMounted(() => {
  loadModels()
  loadGenerations()
})
</script>

<template>
  <div>
    <PageHeader title="Generacije">
      <template #actions>
        <RouterLink :to="{ name: 'generations.create' }"><AppButton variant="primary">Dodaj generaciju</AppButton></RouterLink>
      </template>
    </PageHeader>

    <div class="p-6">
      <div class="mb-4 max-w-xs">
        <AppSelect v-model="selectedModelId">
          <option :value="null">Svi modeli</option>
          <option v-for="model in models" :key="model.id" :value="model.id">{{ model.brand.name }} {{ model.name }}</option>
        </AppSelect>
      </div>

      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
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
            <tr v-for="generation in generations" :key="generation.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-900 font-medium">{{ generation.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ generation.model.brand.name }} {{ generation.model.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ formatYears(generation) }}</td>
              <td class="px-4 py-3 text-gray-500">{{ generation.engines_count ?? 0 }}</td>
              <td class="px-4 py-3 text-gray-500">{{ generation.cars_count ?? 0 }}</td>
              <td class="px-4 py-3 text-right space-x-4">
                <RouterLink :to="{ name: 'generations.edit', params: { id: generation.id } }" class="text-indigo-600 hover:text-indigo-800 font-medium">Izmeni</RouterLink>
                <button @click="confirmDelete(generation)" class="text-red-600 hover:text-red-800 font-medium">Obriši</button>
              </td>
            </tr>
            <tr v-if="generations.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-gray-400">Nema dodatih generacija.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog :open="generationToDelete !== null" @close="generationToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200">
          <DialogTitle class="text-base font-semibold text-gray-900">Obriši generaciju?</DialogTitle>
          <p class="mt-2 text-sm text-gray-500">Da li si siguran da želiš da obrišeš "{{ generationToDelete?.name }}"? Ova akcija je nepovratna.</p>
          <div class="mt-6 flex justify-end gap-3">
            <AppButton variant="secondary" @click="generationToDelete = null">Otkaži</AppButton>
            <AppButton variant="danger" @click="handleDelete">Obriši</AppButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>