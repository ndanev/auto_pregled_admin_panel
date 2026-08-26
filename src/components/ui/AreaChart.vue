<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ data: { label: string; count: number }[] }>()

const width = 600
const height = 160
const padding = 20

const max = computed(() => Math.max(1, ...props.data.map((d) => d.count)))

const points = computed(() => {
  const step = (width - padding * 2) / Math.max(1, props.data.length - 1)
  return props.data.map((d, i) => ({
    x: padding + i * step,
    y: height - padding - (d.count / max.value) * (height - padding * 2),
    label: d.label,
    count: d.count,
  }))
})

// Glatka kriva preko kvadratnih Bezier segmenata između tačaka
const linePath = computed(() => {
  if (points.value.length === 0) return ''
  const [first, ...rest] = points.value
  let path = `M ${first.x} ${first.y}`
  rest.forEach((p, i) => {
    const prev = points.value[i]
    const midX = (prev.x + p.x) / 2
    path += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + p.y) / 2}`
    path += ` Q ${midX} ${(prev.y + p.y) / 2} ${p.x} ${p.y}`
  })
  return path
})

const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  const last = points.value[points.value.length - 1]
  const first = points.value[0]
  return `${linePath.value} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`
})
</script>

<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-40">
    <defs>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6366F1" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#6366F1" stop-opacity="0" />
      </linearGradient>
    </defs>

    <path :d="areaPath" fill="url(#areaGradient)" />
    <path :d="linePath" fill="none" stroke="#6366F1" stroke-width="2.5" stroke-linecap="round" />

    <g v-for="point in points" :key="point.label">
      <circle :cx="point.x" :cy="point.y" r="3.5" fill="white" stroke="#6366F1" stroke-width="2" />
      <text :x="point.x" :y="height - 2" text-anchor="middle" class="fill-gray-400" font-size="10">
        {{ point.label }}
      </text>
    </g>
  </svg>
</template>