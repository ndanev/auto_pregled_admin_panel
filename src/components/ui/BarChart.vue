<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ data: { label: string; count: number }[] }>()
const max = computed(() => Math.max(1, ...props.data.map((d) => d.count)))
</script>

<template>
  <div class="flex items-end gap-4 h-40">
    <div v-for="item in data" :key="item.label" class="flex-1 flex flex-col items-center gap-2">
      <div class="w-full flex items-end justify-center h-32">
        <div
          class="w-full max-w-10 bg-indigo-500 rounded-t transition-all duration-500"
          :style="{ height: `${(item.count / max) * 100}%`, minHeight: item.count > 0 ? '4px' : '0px' }"
        ></div>
      </div>
      <span class="text-xs text-gray-500">{{ item.label }}</span>
      <span class="text-xs font-medium text-gray-700">{{ item.count }}</span>
    </div>
  </div>
</template>