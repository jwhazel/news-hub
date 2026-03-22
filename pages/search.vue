<template>
  <main class="max-w-6xl mx-auto px-4 py-10">
    <!-- Search input -->
    <form class="mb-10" @submit.prevent="submit">
      <div class="flex gap-3 max-w-2xl">
        <input
          v-model="inputValue"
          type="search"
          placeholder="Search…"
          class="flex-1 px-4 py-2.5 rounded-sm border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <button
          type="submit"
          class="px-6 py-2.5 rounded-sm bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>

    <!-- States -->
    <div v-if="!q" class="py-16 text-center text-stone-400 text-sm">Enter a search term above.</div>

    <div v-else-if="pending" class="py-16 text-center text-stone-400 text-sm">Searching…</div>

    <div v-else-if="error" class="py-16 text-center text-stone-400 text-sm">
      Something went wrong. Please try again.
    </div>

    <template v-else>
      <p class="text-sm text-stone-400 mb-8">
        <span v-if="numResults">{{ numResults.toLocaleString() }} results for </span>
        <span v-else>No results for </span>
        <span class="font-medium text-stone-700">"{{ q }}"</span>
      </p>

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
          All results loaded
        </p>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import type { ArticleCard, ArticleListResponse } from '~/server/api/utils/types'

const route = useRoute()
const router = useRouter()

const q = computed(() => route.query.q as string | undefined)
const inputValue = ref(q.value ?? '')

const url = computed(() => (q.value ? `/api/search?q=${encodeURIComponent(q.value)}` : null))

const { data, error, pending } = await useFetch<ArticleListResponse>(
  () => url.value ?? '/api/search',
  { immediate: !!q.value }
)

const articles = ref<ArticleCard[]>(data.value?.articles ?? [])
const cursor = ref<string | null>(data.value?.cursor ?? null)
const numResults = ref<number>(data.value?.numResults ?? 0)
const loadingMore = ref(false)

watch(data, (val) => {
  if (val) {
    articles.value = val.articles
    cursor.value = val.cursor
    numResults.value = val.numResults
  }
})

function submit() {
  const trimmed = inputValue.value.trim()
  if (!trimmed) return
  router.push({ path: '/search', query: { q: trimmed } })
}

async function loadMore() {
  if (!cursor.value || !q.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const result = await $fetch<ArticleListResponse>(
      `/api/search?q=${encodeURIComponent(q.value)}&cursor=${encodeURIComponent(cursor.value)}`
    )
    articles.value.push(...result.articles)
    cursor.value = result.cursor
  } finally {
    loadingMore.value = false
  }
}

useHead(() => ({
  title: q.value ? `Search: ${q.value}` : 'Search'
}))
</script>
