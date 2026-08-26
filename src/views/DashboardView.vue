<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchDashboardStats } from '@/api/dashboard'
import { fetchAiUsageStats } from '@/api/aiUsage'
import type { DashboardStats } from '@/types/dashboard'
import type { AiUsageStats } from '@/types/aiUsage'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import AreaChart from '@/components/ui/AreaChart.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const stats = ref<DashboardStats | null>(null)
const usage = ref<AiUsageStats | null>(null)
const isLoading = ref(true)

function formatDate(value: string): string {
  return new Date(value).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  const [statsData, usageData] = await Promise.all([fetchDashboardStats(), fetchAiUsageStats()])
  stats.value = statsData
  usage.value = usageData
  isLoading.value = false
})
</script>

<template>
  <div>
    <PageHeader title="Pregled" />

    <div class="p-6">
      <div v-if="isLoading" class="text-sm text-gray-500">Učitavanje...</div>

      <template v-else-if="stats && usage">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Automobili" :value="stats.total_cars" :hint="`${stats.published_cars} objavljeno`" accent="indigo" />
          <StatCard label="Marke" :value="stats.total_brands" accent="indigo" />
          <StatCard label="AI analize" :value="stats.cars_with_ai_analysis" :hint="`od ${stats.total_cars}`" accent="purple" />
          <StatCard label="Nacrti" :value="stats.draft_cars" accent="amber" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <div class="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-baseline justify-between mb-4">
              <h2 class="text-sm font-medium text-gray-900">Dodati automobili — poslednjih 6 meseci</h2>
            </div>
            <AreaChart :data="stats.cars_per_month" />
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-sm font-medium text-gray-900 mb-4">AI korišćenje (30 dana)</h2>
            <div class="space-y-4">
              <div class="flex items-baseline justify-between">
                <span class="text-sm text-gray-500">Zahtevi</span>
                <span class="text-lg font-semibold text-gray-900">{{ usage.total_requests_30d }}</span>
              </div>
              <div class="flex items-baseline justify-between">
                <span class="text-sm text-gray-500">Tokeni</span>
                <span class="text-lg font-semibold text-gray-900">{{ usage.total_tokens_30d.toLocaleString() }}</span>
              </div>
              <div class="flex items-baseline justify-between">
                <span class="text-sm text-gray-500">Procenjeni trošak</span>
                <span class="text-lg font-semibold text-gray-900">${{ usage.estimated_cost_30d_usd.toFixed(2) }}</span>
              </div>
              <div v-if="usage.failed_requests_30d > 0" class="flex items-baseline justify-between">
                <span class="text-sm text-gray-500">Neuspešni</span>
                <StatusBadge variant="warning">{{ usage.failed_requests_30d }}</StatusBadge>
              </div>
              <p class="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Ukupno od početka: {{ usage.total_requests }} zahteva
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 mt-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-sm font-medium text-gray-900">Poslednji AI zahtevi</h2>
          </div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-gray-100">
              <tr v-for="req in usage.recent_requests" :key="req.id">
                <td class="px-6 py-3 text-gray-900">{{ req.car_label }}</td>
                <td class="px-6 py-3">
                  <StatusBadge :variant="req.status === 'success' ? 'success' : 'warning'">
                    {{ req.status === 'success' ? 'Uspešno' : 'Neuspešno' }}
                  </StatusBadge>
                </td>
                <td class="px-6 py-3 text-gray-500">{{ req.total_tokens.toLocaleString() }} tokena</td>
                <td class="px-6 py-3 text-gray-500">${{ req.estimated_cost_usd.toFixed(4) }}</td>
                <td class="px-6 py-3 text-gray-400 text-right">{{ formatDate(req.created_at) }}</td>
              </tr>
              <tr v-if="usage.recent_requests.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">Još nema AI zahteva.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>