<template>
  <div v-if="pending" class="max-w-3xl mx-auto px-4 py-24 text-center text-stone-400 text-sm">
    Loading…
  </div>

  <div
    v-else-if="error || !data"
    class="max-w-3xl mx-auto px-4 py-24 text-center text-stone-400 text-sm"
  >
    Article not found.
  </div>

  <article v-else>
    <ArticleHero
      :headline="data.headline"
      :sub-head="data.subHead"
      :section="data.ssts.section"
      :byline="byline"
      :date="data.publishDate"
    />

    <!-- Featured image -->
    <div v-if="featuredImagePath" class="max-w-5xl mx-auto px-4 mb-12">
      <div class="aspect-video overflow-hidden rounded-sm bg-stone-200">
        <img :src="featuredImagePath" :alt="data.headline" class="h-full w-full object-cover" />
      </div>
    </div>

    <!-- Divider -->
    <div class="max-w-2xl mx-auto px-4 mb-10">
      <div class="border-t border-stone-200" />
    </div>

    <!-- Body -->
    <main class="article-body max-w-2xl mx-auto px-4 pb-24">
      <Asset v-for="(item, index) in data.body" :key="index" :item="item" />
    </main>
  </article>
</template>

<script setup lang="ts">
import type { Article } from '~/server/api/utils/types'

const route = useRoute()
const { id } = route.params

const { data, error, pending } = await useFetch<Article>(`/api/get-article/${id}`)

const byline = computed(() => data.value?.authors.map((a) => a.byline).join(', ') ?? '')

const featuredImagePath = computed(
  () =>
    data.value?.featuredImage?.crops?.find((c) => c.name === '16_9')?.path ??
    data.value?.featuredImage?.crops?.[0]?.path ??
    null
)

useHead(() => ({
  title: data.value?.headline ?? 'Article'
}))
</script>

<style>
:where(.article-body) p {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.15rem;
  line-height: 1.85;
  color: theme('colors.stone.800');
  margin: 1.6em 0;
}

:where(.article-body) h2 {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: theme('colors.stone.900');
  margin: 2em 0 0.75em;
}

:where(.article-body) a {
  color: theme('colors.brand.500');
  text-decoration: underline;
  text-underline-offset: 3px;
}

:where(.article-body) a:hover {
  color: theme('colors.brand.700');
}

:where(.article-body) ul {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.15rem;
  line-height: 1.85;
  color: theme('colors.stone.800');
  margin: 1.6em 0;
  padding-left: 1.5em;
  list-style-type: disc;
}

:where(.article-body) ol {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.15rem;
  line-height: 1.85;
  color: theme('colors.stone.800');
  margin: 1.6em 0;
  padding-left: 1.5em;
  list-style-type: decimal;
}

:where(.article-body) li {
  margin: 0.4em 0;
}

:where(.article-body)::after {
  content: '';
  display: table;
  clear: both;
}
</style>
