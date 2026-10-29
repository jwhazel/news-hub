<template>
  <main class="max-w-6xl mx-auto px-4 py-10">
    <div v-if="pending" class="py-24 text-center text-stone-400 text-sm">Loading…</div>

    <div v-else-if="error || !data?.author" class="py-24 text-center text-stone-400 text-sm">
      Author not found.
    </div>

    <template v-else>
      <!-- Author header -->
      <header class="flex items-center gap-5 mb-12 pb-10 border-b border-stone-200">
        <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-stone-200">
          <img
            v-if="data.author.image"
            :src="data.author.image"
            :alt="data.author.byline"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="flex flex-col gap-1">
          <h1 class="font-serif text-2xl md:text-3xl font-semibold text-stone-900">
            {{ data.author.byline }}
          </h1>
          <p v-if="data.author.title" class="text-sm text-stone-500">{{ data.author.title }}</p>
        </div>
      </header>

      <div v-if="!articles.length" class="py-16 text-center text-stone-400 text-sm">
        No articles yet.
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>

      <div class="mt-14 flex flex-col items-center gap-3">
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
import type { ArticleCard, AuthorResponse } from '#shared/types'

const route = useRoute()
const { id } = route.params

const { data, error, pending } = await useFetch<AuthorResponse>(`/api/get-author/${id}`)

const articles = ref<ArticleCard[]>(data.value?.articles ?? [])
const cursor = ref<string | null>(data.value?.cursor ?? null)
const loadingMore = ref(false)

watch(data, (val) => {
  if (val) {
    articles.value = val.articles
    cursor.value = val.cursor
  }
})

async function loadMore() {
  if (!cursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const result = await $fetch<AuthorResponse>(
      `/api/get-author/${id}?cursor=${encodeURIComponent(cursor.value)}`
    )
    articles.value.push(...result.articles)
    cursor.value = result.cursor
  } finally {
    loadingMore.value = false
  }
}

useHead(() => ({
  title: data.value?.author?.byline ?? 'Author'
}))
</script>
