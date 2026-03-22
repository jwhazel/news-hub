<template>
  <main class="max-w-6xl mx-auto px-4 py-10">
    <div v-if="error" class="py-24 text-center text-stone-400 text-sm">
      Failed to load articles. Please try again.
    </div>

    <template v-else>
      <!-- Featured article -->
      <NuxtLink
        v-if="featured"
        :to="`/article/${featured.id}`"
        class="group grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 mb-12 pb-12 border-b border-stone-200"
      >
        <div class="md:col-span-3 overflow-hidden rounded-sm bg-stone-200 aspect-video">
          <img
            v-if="featured.featuredImage"
            :src="featured.featuredImage.path"
            :alt="featured.headline"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div class="md:col-span-2 flex flex-col justify-center gap-3">
          <span
            v-if="featured.ssts.section"
            class="text-xs font-semibold uppercase tracking-widest text-brand-600"
          >
            {{ featured.ssts.section }}
          </span>
          <h2
            class="font-serif text-2xl md:text-3xl font-semibold leading-tight text-stone-900 group-hover:text-brand-600 transition-colors duration-200"
          >
            {{ featured.headline }}
          </h2>
          <p class="text-stone-500 leading-relaxed text-sm md:text-base line-clamp-3">
            {{ featured.promoBrief }}
          </p>
          <div class="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
            <span v-if="featuredByline">{{ featuredByline }}</span>
            <span v-if="featuredByline" class="text-stone-300">·</span>
            <time :datetime="featured.publishDate">{{ formatDate(featured.publishDate) }}</time>
          </div>
        </div>
      </NuxtLink>

      <!-- Article grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        <ArticleCard v-for="article in rest" :key="article.id" :article="article" />
      </div>

      <!-- Load more (latest mode only) -->
      <div v-if="!curatedView" class="mt-14 flex flex-col items-center gap-3">
        <button
          v-if="cursor"
          :disabled="loadingMore"
          class="px-8 py-2.5 rounded-full border border-stone-300 text-sm font-medium text-stone-600 hover:border-stone-500 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="loadMore"
        >
          {{ loadingMore ? 'Loading…' : 'Load more' }}
        </button>
        <p v-else-if="articles.length" class="text-xs text-stone-400 tracking-wide uppercase">
          All articles loaded
        </p>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import type { ArticleCard, ArticleListResponse } from '~/server/api/utils/types'

const route = useRoute()
const { curatedView } = usePreferences()
const section = computed(() => route.query.section as string | undefined)

const frontSection = computed(() =>
  section.value ? (sections.find((s) => s.slug === section.value)?.front ?? section.value) : null
)

const url = computed(() => {
  if (curatedView.value) {
    return frontSection.value ? `/api/get-front?section=${frontSection.value}` : '/api/get-front'
  }
  return section.value ? `/api/get-list?section=${section.value}` : '/api/get-list'
})

const { data, error } = await useFetch<ArticleListResponse>(url)

const articles = ref<ArticleCard[]>(data.value?.articles ?? [])
const cursor = ref<string | null>(data.value?.cursor ?? null)
const loadingMore = ref(false)

const featured = computed(() => articles.value[0] ?? null)
const rest = computed(() => articles.value.slice(1))

const featuredByline = computed(() => featured.value?.authors.map((a) => a.byline).join(', ') ?? '')

async function loadMore() {
  if (!cursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const params = new URLSearchParams()
    params.set('cursor', cursor.value)
    if (section.value) params.set('section', section.value)

    const result = await $fetch<ArticleListResponse>(`/api/get-list?${params}`)
    articles.value.push(...result.articles)
    cursor.value = result.cursor
  } finally {
    loadingMore.value = false
  }
}

// Reset list when url changes (section or view mode)
watch(url, async () => {
  const result = await $fetch<ArticleListResponse>(url.value)
  articles.value = result.articles
  cursor.value = result.cursor
})
</script>
