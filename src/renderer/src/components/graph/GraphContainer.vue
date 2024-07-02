<script setup lang="ts">
import { computed } from 'vue';
import type { GraphView } from './handler'

const props = defineProps<{ view: GraphView }>()

const view = computed(() => props.view)

const load = (container: HTMLElement) => {
    view.value.loadContainer(container)
}

</script>

<template>
    <div class="graph-view" :ref="dom => { if (dom) load(dom as HTMLElement) }"></div>
</template>

<style lang="scss" scoped>
.graph-view {
    height: 100%;
}
</style>