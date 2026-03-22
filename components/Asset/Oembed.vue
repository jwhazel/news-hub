<template>
  <div ref="container" class="oembed my-6 overflow-hidden rounded-sm" />
</template>

<script setup lang="ts">
import type { OembedAssetData } from '~/server/api/utils/types'

const props = defineProps<{ data: OembedAssetData }>()
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!container.value || !props.data.html) return

  // Set HTML content
  container.value.innerHTML = props.data.html

  // Re-execute any script tags (v-html / innerHTML does not run scripts)
  const scripts = container.value.querySelectorAll('script')
  scripts.forEach((original) => {
    const script = document.createElement('script')
    if (original.src) {
      script.src = original.src
      script.async = true
    } else {
      script.textContent = original.textContent
    }
    original.replaceWith(script)
  })
})
</script>
