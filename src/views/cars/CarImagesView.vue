<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { fetchImages, uploadImages, setMainImage, reorderImages, deleteImage } from '@/api/images'
import { fetchCar } from '@/api/cars'
import type { CarImage } from '@/types/image'
import type { Car } from '@/types/car'

const route = useRoute()
const carId = computed(() => Number(route.params.id))

const car = ref<Car | null>(null)
const images = ref<CarImage[]>([])
const isLoading = ref(true)
const isUploading = ref(false)
const isDraggingOver = ref(false)
const draggedImageId = ref<number | null>(null)

async function loadData() {
  isLoading.value = true
  car.value = await fetchCar(carId.value)
  images.value = await fetchImages(carId.value)
  isLoading.value = false
}

async function handleFiles(fileList: FileList | File[]) {
  const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
  if (files.length === 0) return

  isUploading.value = true
  try {
    const uploaded = await uploadImages(carId.value, files)
    images.value.push(...uploaded)
  } finally {
    isUploading.value = false
  }
}

function onFileInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) handleFiles(target.files)
  target.value = ''
}

function onDrop(event: DragEvent) {
  isDraggingOver.value = false
  if (event.dataTransfer?.files) handleFiles(event.dataTransfer.files)
}

async function handleSetMain(image: CarImage) {
  await setMainImage(image.id)
  images.value = images.value.map((img) => ({ ...img, is_main: img.id === image.id }))
}

async function handleDelete(image: CarImage) {
  await deleteImage(image.id)
  images.value = images.value.filter((img) => img.id !== image.id)
}

// Drag-to-reorder unutar grid-a
function onDragStart(image: CarImage) {
  draggedImageId.value = image.id
}

async function onDropReorder(targetImage: CarImage) {
  if (draggedImageId.value === null || draggedImageId.value === targetImage.id) return

  const fromIndex = images.value.findIndex((img) => img.id === draggedImageId.value)
  const toIndex = images.value.findIndex((img) => img.id === targetImage.id)
  if (fromIndex === -1 || toIndex === -1) return

  const reordered = [...images.value]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  images.value = reordered
  draggedImageId.value = null

  await reorderImages(carId.value, reordered.map((img) => img.id))
}

function carLabel(c: Car): string {
  const g = c.generation
  return `${g.model.brand.name} ${g.model.name} ${g.name} ${c.engine.name}`
}

onMounted(loadData)
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <RouterLink :to="{ name: 'cars.index' }" class="text-sm text-blue-600 hover:underline">
        ← Nazad na automobile
      </RouterLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-2">
        Slike — {{ car ? carLabel(car) : '' }}
      </h1>
    </div>

    <div v-if="isLoading" class="text-gray-500 text-sm">Učitavanje...</div>

    <template v-else>
      <div
        @dragover.prevent="isDraggingOver = true"
        @dragleave.prevent="isDraggingOver = false"
        @drop.prevent="onDrop"
        class="border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors"
        :class="isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
      >
        <p class="text-gray-500 mb-2">Prevuci slike ovde ili</p>
        <label class="inline-block cursor-pointer text-blue-600 font-medium hover:underline">
          izaberi fajlove
          <input
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onFileInputChange"
          />
        </label>
        <p v-if="isUploading" class="mt-3 text-sm text-gray-500">Upload u toku...</p>
      </div>

      <div v-if="images.length === 0" class="text-center text-gray-400 py-8">
        Nema dodatih slika.
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="image in images"
          :key="image.id"
          draggable="true"
          @dragstart="onDragStart(image)"
          @dragover.prevent
          @drop.prevent="onDropReorder(image)"
          class="relative group rounded-lg overflow-hidden border-2 cursor-move"
          :class="image.is_main ? 'border-blue-500' : 'border-transparent'"
        >
          <img :src="image.thumbnail_url" :alt="`Slika ${image.id}`" class="w-full h-32 object-cover" />

          <span
            v-if="image.is_main"
            class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
          >
            Glavna
          </span>

          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <button
              v-if="!image.is_main"
              @click="handleSetMain(image)"
              class="bg-white text-gray-900 text-xs px-2 py-1 rounded hover:bg-gray-100"
            >
              Postavi kao glavnu
            </button>
            <button
              @click="handleDelete(image)"
              class="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
            >
              Obriši
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>