<template>
  <span>
    <template v-for="(author, index) in authors" :key="index">
      <template v-if="index">, </template>
      <NuxtLink
        v-if="author.contributorId"
        :to="`/author/${author.contributorId}`"
        class="relative z-10 hover:text-brand-600 hover:underline underline-offset-2 transition-colors"
      >
        {{ author.byline }}
      </NuxtLink>
      <template v-else>{{ author.byline }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
import type { ArticleAuthor } from '#shared/types'

defineProps<{ authors: ArticleAuthor[] }>()
</script>
