<script setup lang="ts">
defineProps<{ variant?: 'success' | 'neutral' | 'warning' }>()
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="{
      'bg-green-50 text-green-700': variant === 'success',
      'bg-gray-100 text-gray-600': variant === 'neutral',
      'bg-amber-50 text-amber-700': variant === 'warning',
    }"
  >
    <slot />
  </span>
</template>