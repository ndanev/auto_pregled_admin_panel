<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { fetchEngines, deleteEngine } from '@/api/engines'
import { fetchGenerations } from '@/api/generations'
import { FUEL_TYPE_LABELS } from '@/types/engine'
import type { Engine } from '@/types/engine'
import type { Generation } from '@/types/generation'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSelect from '@/components/ui/AppSelect.vue'

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
function generationLabel(g: Generation): string {
  return `${g.model.brand.name} ${g.model.name} ${g.name}`
}

watch(selectedGenerationId, loadEngines)
onMounted(() => {
  loadGenerations()
  loadEngines()
})
</script>

<template>
  <div>
    <PageHeader title="Motori">
      <template #actions>
        <RouterLink :to="{ name: 'engines.create' }"><AppButton variant="primary">Dodaj motor</AppButton></RouterLink>
      </template>
    </PageHeader>

    <div class="p-6">
      <div class="mb-4 max-w-xs">
        <AppSelect v-model="selectedGenerationId">
          <option :value="null">Sve generacije</option>
          <option v-for="generation in generations" :key="generation.id" :value="generation.id">{{ generationLabel(generation) }}</option>
        </AppSelect>
      </div>

      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
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
            <tr v-for="engine in engines" :key="engine.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-900 font-medium">{{ engine.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ generationLabel(engine.generation) }}</td>
              <td class="px-4 py-3 text-gray-500">{{ FUEL_TYPE_LABELS[engine.fuel_type] }}</td>
              <td class="px-4 py-3 text-gray-500">{{ engine.power_hp ?? '—' }}</td>
              <td class="px-4 py-3 text-gray-500">{{ engine.cars_count ?? 0 }}</td>
              <td class="px-4 py-3 text-right space-x-4">
                <RouterLink :to="{ name: 'engines.edit', params: { id: engine.id } }" class="text-indigo-600 hover:text-indigo-800 font-medium">Izmeni</RouterLink>
                <button @click="confirmDelete(engine)" class="text-red-600 hover:text-red-800 font-medium">Obriši</button>
              </td>
            </tr>
            <tr v-if="engines.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-gray-400">Nema dodatih motora.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog :open="engineToDelete !== null" @close="engineToDelete = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200">
          <DialogTitle class="text-base font-semibold text-gray-900">Obriši motor?</DialogTitle>
          <p class="mt-2 text-sm text-gray-500">Da li si siguran da želiš da obrišeš "{{ engineToDelete?.name }}"? Ova akcija je nepovratna.</p>
          <div class="mt-6 flex justify-end gap-3">
            <AppButton variant="secondary" @click="engineToDelete = null">Otkaži</AppButton>
            <AppButton variant="danger" @click="handleDelete">Obriši</AppButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>