<script lang="ts" setup>
import type { PageBgTask } from './index';

const props = defineProps<{
    page:PageBgTask
}>()


</script>


<template>
    <div>
        tabId: {{ props.page.tabId }}
    </div>
    <div>
        title: {{ props.page.title }}
    </div>
</template>

