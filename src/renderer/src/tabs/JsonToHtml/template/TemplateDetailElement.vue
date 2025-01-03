<template>
    <div class="template-element-detail">
        {{ detail.tagName() }}
    </div>

</template>

<script setup lang="ts">
import type { TemplateDetailElementHander } from './handler';


const props = defineProps<{
    detail: TemplateDetailElementHander
}>()

</script>