<template>
  <header class="max-w-3xl mx-auto px-4 pt-12 pb-8 text-center">
    <NuxtLink
      v-if="section"
      :to="`/?section=${section}`"
      class="inline-block text-xs font-semibold uppercase tracking-widest text-brand-600 hover:text-brand-800 mb-4 transition-colors"
    >
      {{ section }}
    </NuxtLink>

    <h1
      class="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-stone-900"
    >
      {{ headline }}
    </h1>

    <p
      v-if="subHead"
      class="mt-4 text-lg md:text-xl text-stone-500 leading-relaxed max-w-2xl mx-auto"
    >
      {{ subHead }}
    </p>

    <div class="flex items-center justify-center gap-2 mt-6 text-sm text-stone-400">
      <span v-if="byline" class="font-medium text-stone-600">{{ byline }}</span>
      <span v-if="byline && date" class="text-stone-300">·</span>
      <time v-if="date" :datetime="date">{{ formattedDate }}</time>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  headline: string
  subHead?: string
  section?: string
  byline?: string
  date?: string
}

const props = defineProps<Props>()

const formattedDate = computed(() =>
  props.date
    ? new Date(props.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : ''
)
</script>
