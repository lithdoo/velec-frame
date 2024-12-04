<template>
     <HtmlElementInject v-if="target?.element" :target="target.element" />
     <component v-if="target?.vnode" :is="target.vnode"></component>
</template>

<script setup lang="ts">

import { VNode, computed } from 'vue';
import HtmlElementInject from './HtmlElementInject.vue';

const props = defineProps<{
     target: HTMLElement | VNode | null
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