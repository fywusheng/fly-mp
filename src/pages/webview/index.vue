<script setup lang="ts">
const props = defineProps<{
  url?: string
}>()

onLoad((options: any) => {
  console.log('WebView 页面加载，url:', options.url)
})
</script>

<template>
  <web-view :src="url || ''" />
</template>
