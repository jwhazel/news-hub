<template>
  <div class="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
    <AppNav />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
})
</script>
