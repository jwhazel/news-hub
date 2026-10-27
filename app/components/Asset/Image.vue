<template>
  <figure class="my-6" :class="isVertical ? 'float-right ml-6 mb-2 max-w-[300px] clear-right' : ''">
    <img :src="data.path" :alt="data.caption ?? ''" class="w-full rounded-sm object-cover" />
    <figcaption v-if="data.caption || data.credit" class="mt-2 text-xs text-stone-400 leading-snug">
      <span v-if="data.caption">{{ data.caption }}</span>
      <span v-if="data.caption && data.credit"> — </span>
      <span v-if="data.credit" class="italic">{{ data.credit }}</span>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { ImageAssetData } from '~/server/api/utils/types'
const props = defineProps<{ data: ImageAssetData }>()
const isVertical = computed(() => props.data.orientation === 'vertical')
</script>
