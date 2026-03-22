<template>
  <NuxtLink :to="`/article/${article.id}`" class="group flex flex-col gap-3">
    <div class="aspect-video overflow-hidden rounded-sm bg-stone-200">
      <img
        v-if="article.featuredImage"
        :src="article.featuredImage.path"
        :alt="article.headline"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <div class="flex flex-col gap-1.5">
      <span
        v-if="article.ssts.section"
        class="text-xs font-semibold uppercase tracking-widest text-brand-600"
      >
        {{ article.ssts.section }}
      </span>
      <h2
        class="font-serif text-[1.05rem] font-semibold leading-snug text-stone-900 group-hover:text-brand-600 transition-colors duration-200"
      >
        {{ article.headline }}
      </h2>
      <p v-if="article.promoBrief" class="text-sm text-stone-500 line-clamp-2 leading-relaxed">
        {{ article.promoBrief }}
      </p>
      <div class="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
        <span v-if="byline">{{ byline }}</span>
        <span v-if="byline" class="text-stone-300">·</span>
        <time :datetime="article.publishDate">{{ formattedDate }}</time>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ArticleCard } from '~/server/api/utils/types'

const props = defineProps<{ article: ArticleCard }>()

const byline = computed(() => props.article.authors.map((a) => a.byline).join(', '))

const formattedDate = computed(() => formatDate(props.article.publishDate))
</script>
