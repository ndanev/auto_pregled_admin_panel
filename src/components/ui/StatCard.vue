<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: number | string
    hint?: string
    accent?: 'indigo' | 'green' | 'amber' | 'purple'
  }>(),
  { accent: 'indigo' }
)
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5 relative overflow-hidden">
    <div
      class="absolute top-0 left-0 w-1 h-full"
      :class="{
        'bg-indigo-500': accent === 'indigo',
        'bg-green-500': accent === 'green',
        'bg-amber-500': accent === 'amber',
        'bg-purple-500': accent === 'purple',
      }"
    ></div>
    <span class="text-sm text-gray-500">{{ label }}</span>
    <div class="mt-2 flex items-baseline gap-2">
      <span class="text-2xl font-semibold text-gray-900">{{ value }}</span>
      <span v-if="hint" class="text-xs text-gray-400">{{ hint }}</span>
    </div>
  </div>
</template>