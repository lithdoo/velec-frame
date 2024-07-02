<script lang="ts" setup>
import type { PageGraphEditor } from './index';
import {ElementInject} from '@renderer/components/base/ElementInject'

const props = defineProps<{
    page: PageGraphEditor
}>()

</script>

<template>
    <ElementInject :target="props.page.element"/>
</template>
