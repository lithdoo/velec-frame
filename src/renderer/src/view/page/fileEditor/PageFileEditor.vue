<script lang="ts" setup>
import type { PageFileEditor } from './index';
import {ElementInject} from '@renderer/components/base/ElementInject'

const props = defineProps<{
    page: PageFileEditor
}>()

</script>

<template>
    <!-- <div>
        tabId: {{ props.page.tabId }}
    </div>
    <div>
        title: {{ props.page.title }}
    </div>
    <div>
        url: {{ props.page.file.url }}
    </div> -->
    <ElementInject :target="props.page.editorElement"/>
</template>
