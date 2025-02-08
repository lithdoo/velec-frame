<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TextEditorHandler } from './handler'

const props = defineProps<{
  handler: TextEditorHandler
}>()

const editorElement = ref<HTMLElement | null>(null)

onMounted(() => {
  if (editorElement.value) props.handler.initEditor(editorElement.value)
})
</script>
<template>
  <div style="height: 100%" ref="editorElement"></div>
</template>
