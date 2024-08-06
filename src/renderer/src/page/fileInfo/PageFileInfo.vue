<script lang="ts" setup>
import type { PageFileInfo } from './index';

const props = defineProps<{
    page: PageFileInfo
}>()

</script>

<template>
    <div>
        tabId: {{ props.page.tabId }}
    </div>
    <div>
        title: {{ props.page.title }}
    </div>
    <div>
        url: {{ props.page.file.url }}
    </div>
</template>
