<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' | 'danger'; type?: 'button' | 'submit' }>(), {
  variant: 'primary',
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center px-3.5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :class="{
      'bg-indigo-600 text-white hover:bg-indigo-700': variant === 'primary',
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>