<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
    <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>