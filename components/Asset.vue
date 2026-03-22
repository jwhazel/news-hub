<template>
  <Text v-if="item.type === 'text'" :value="item.value" />
  <AssetResolver v-else :id="item.id" />
</template>

<script setup lang="ts">
import type { ArticleBodyItem } from '~/server/api/utils/types'
defineProps<{ item: ArticleBodyItem }>()
</script>
