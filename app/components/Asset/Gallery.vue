<template>
  <div class="my-6">
    <!-- Gallery preview card -->
    <button
      class="group relative w-full overflow-hidden rounded-sm bg-stone-900 aspect-video text-left"
      @click="open"
    >
      <img
        v-if="data.coverImage"
        :src="data.coverImage.path"
        :alt="data.headline"
        class="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-70"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 flex flex-col items-end justify-end p-4"
      >
        <p class="text-white font-semibold text-sm leading-snug drop-shadow">{{ data.headline }}</p>
        <p class="text-white text-xs mt-1 opacity-80">
          {{ data.count }} photos &mdash; tap to view
        </p>
      </div>
    </button>

    <!-- Lightbox modal -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/95 flex flex-col"
        @keydown.esc="close"
        @keydown.left="prev"
        @keydown.right="next"
        tabindex="0"
        ref="modal"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 text-white/60">
          <span class="text-sm font-medium text-white">{{ data.headline }}</span>
          <div class="flex items-center gap-4">
            <span class="text-sm">{{ current + 1 }} / {{ images.length }}</span>
            <button class="hover:text-white transition-colors p-1" @click="close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Image area -->
        <div class="flex-1 flex items-center justify-center px-12 min-h-0 relative">
          <template v-if="images.length">
            <img
              :src="images[current].path"
              :alt="images[current].caption ?? ''"
              class="max-h-full max-w-full object-contain"
            />
            <!-- Prev / Next -->
            <button
              v-if="current > 0"
              class="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
              @click="prev"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              v-if="current < images.length - 1"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
              @click="next"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </template>
        </div>

        <!-- Caption -->
        <div class="px-4 py-3 text-center min-h-[3.5rem]">
          <p v-if="images[current]?.caption" class="text-white/60 text-sm">
            {{ images[current].caption }}
            <span v-if="images[current].credit" class="italic">
              — {{ images[current].credit }}</span
            >
          </p>
        </div>

        <!-- Thumbnail strip -->
        <div class="flex gap-1.5 overflow-x-auto px-4 pb-4 scrollbar-hide">
          <button
            v-for="(img, i) in images"
            :key="img.id"
            class="flex-none w-16 h-10 overflow-hidden rounded-sm opacity-40 hover:opacity-70 transition-opacity"
            :class="{ '!opacity-100 ring-2 ring-brand-500': i === current }"
            @click="current = i"
          >
            <img :src="img.path" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { GalleryAssetData } from '~/server/api/utils/types'

const props = defineProps<{ id: string; data: GalleryAssetData }>()

const isOpen = ref(false)
const current = ref(0)
const modal = ref<HTMLElement | null>(null)
const images = computed(() => props.data?.images ?? [])

async function open() {
  isOpen.value = true
  current.value = 0
  await nextTick()
  modal.value?.focus()
}

function close() {
  isOpen.value = false
}
function prev() {
  if (current.value > 0) current.value--
}
function next() {
  if (current.value < images.value.length - 1) current.value++
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
