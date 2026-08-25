<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchDashboardStats } from '@/api/dashboard'
import type { DashboardStats } from '@/types/dashboard'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import BarChart from '@/components/ui/BarChart.vue'

const stats = ref<DashboardStats | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  stats.value = await fetchDashboardStats()
  isLoading.value = false
})
</script>

<template>
  <div>
    <PageHeader title="Pregled" />

    <div class="p-6">
      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <template v-else-if="stats">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Automobili" :value="stats.total_cars" :hint="`${stats.published_cars} objavljeno`" />
          <StatCard label="Marke" :value="stats.total_brands" />
          <StatCard label="Modeli" :value="stats.total_models" />
          <StatCard label="Motori" :value="stats.total_engines" />
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <StatCard label="Generacije" :value="stats.total_generations" />
          <StatCard label="Slike" :value="stats.total_images" />
          <StatCard label="AI analize" :value="stats.cars_with_ai_analysis" :hint="`od ${stats.total_cars} automobila`" />
          <StatCard label="Nacrti" :value="stats.draft_cars" />
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h2 class="text-sm font-medium text-gray-900 mb-4">Dodati automobili — poslednjih 6 meseci</h2>
          <BarChart :data="stats.cars_per_month" />
        </div>
      </template>
    </div>
  </div>
</template>