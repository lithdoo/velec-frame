<template>
  <HtmlElementInject v-if="target?.element" :target="target.element"  :style="props.style" />
  <component v-if="target?.vnode" :is="target.vnode"></component>
</template>

<script setup lang="ts">
import { CSSProperties, VNode, computed } from 'vue'
import HtmlElementInject from './HtmlElementInject.vue'

const props = defineProps<{
  target: HTMLElement | VNode | null,
  style?: Partial<CSSProperties>,
}>()

const target = computed(() => {
  const element = props.target
  if (element && element instanceof HTMLElement) {
    return { element, vnode: null }
  } else if (element) {
    return { vnode: element, element: null }
  } else {
    return null
  }
})
</script>
