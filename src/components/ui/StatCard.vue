<script setup lang="ts">
defineProps<{ label: string; value: number | string; hint?: string }>()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <span class="text-sm text-gray-500">{{ label }}</span>
    <div class="mt-2 flex items-baseline gap-2">
      <span class="text-2xl font-semibold text-gray-900">{{ value }}</span>
      <span v-if="hint" class="text-xs text-gray-400">{{ hint }}</span>
    </div>
  </div>
</template>