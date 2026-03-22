<template>
  <div v-if="pending" class="my-6 h-48 bg-stone-100 rounded-sm animate-pulse" />
  <template v-else-if="asset">
    <AssetImage v-if="asset.assetType === 'image'" :data="asset.data" />
    <AssetGallery v-else-if="asset.assetType === 'gallery'" :id="asset.id" :data="asset.data" />
    <AssetOembed v-else-if="asset.assetType === 'oembed'" :data="asset.data" />
    <AssetVideo v-else-if="asset.assetType === 'video'" :data="asset.data" />
  </template>
</template>

<script setup lang="ts">
import type { ResolvedAsset } from '~/server/api/utils/types'

const props = defineProps<{ id: string }>()
const { data: asset, pending } = await useFetch<ResolvedAsset>(`/api/get-asset/${props.id}`)
</script>
