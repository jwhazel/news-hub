<template>
  <div v-html="value"></div>
</template>

<script setup>
defineProps({
  value: String
})
</script>
