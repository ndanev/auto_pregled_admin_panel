<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchModel, createModel, updateModel } from '@/api/models'
import { fetchBrands } from '@/api/brands'
import type { ModelFormData } from '@/types/model'
import type { Brand } from '@/types/brand'

const route = useRoute()
const router = useRouter()

const modelId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEditing = computed(() => modelId.value !== null)

const brands = ref<Brand[]>([])
const form = ref<ModelFormData>({
  brand_id: null,
  name: '',
  slug: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function handleNameInput() {
  if (!isEditing.value) {
    form.value.slug = slugify(form.value.name)
  }
}

async function loadModel() {
  if (!modelId.value) return
  isLoading.value = true
  const model = await fetchModel(modelId.value)
  form.value = { brand_id: model.brand_id, name: model.name, slug: model.slug }
  isLoading.value = false
}

async function handleSubmit() {
  errors.value = {}
  isSubmitting.value = true
  try {
    if (isEditing.value && modelId.value) {
      await updateModel(modelId.value, form.value)
    } else {
      await createModel(form.value)
    }
    router.push({ name: 'models.index' })
  } catch (err: any) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  brands.value = await fetchBrands()
  await loadModel()
})
</script>

<template>
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEditing ? 'Izmeni model' : 'Dodaj model' }}
    </h1>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Marka</label>
        <select
          v-model="form.brand_id"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option :value="null" disabled>Izaberi marku</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
        <p v-if="errors.brand_id" class="mt-1 text-sm text-red-600">{{ errors.brand_id[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Naziv</label>
        <input
          v-model="form.name"
          @input="handleNameInput"
          type="text"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Slug</label>
        <input
          v-model="form.slug"
          type="text"
          required
          class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug[0] }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <RouterLink
          :to="{ name: 'models.index' }"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Otkaži
        </RouterLink>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Čuvanje...' : 'Sačuvaj' }}
        </button>
      </div>
    </form>
  </div>
</template>