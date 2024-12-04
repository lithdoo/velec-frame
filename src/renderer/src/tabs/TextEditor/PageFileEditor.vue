<script lang="ts" setup>
import type { PageTextEditor } from './index';
import { ElementInject } from '@renderer/components/ElementInject'

const props = defineProps<{
    page: PageTextEditor
}>()

</script>

<template>
    <ElementInject :target="props.page.element" />
</template>
