<template>
  <div v-if="!hideVideos" class="my-6">
    <div
      class="relative aspect-video overflow-hidden rounded-sm bg-stone-900 cursor-pointer group"
      @click="playing = true"
    >
      <img
        v-if="data.thumbnail && !playing"
        :src="data.thumbnail"
        :alt="data.headline ?? 'Video'"
        class="h-full w-full object-cover opacity-80"
      />
      <!-- Play button -->
      <div v-if="!playing" class="absolute inset-0 flex items-center justify-center">
        <div
          class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors"
        >
          <svg class="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <!-- Native video player once play is clicked -->
      <video
        v-if="playing && data.hlsURL"
        :src="data.hlsURL"
        class="h-full w-full"
        controls
        autoplay
      />
    </div>
    <p v-if="data.headline" class="mt-2 text-xs text-stone-400">{{ data.headline }}</p>
  </div>
</template>

<script setup lang="ts">
import type { VideoAssetData } from '~/server/api/utils/types'
defineProps<{ data: VideoAssetData }>()
const playing = ref(false)
const { hideVideos } = usePreferences()
</script>
