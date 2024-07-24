<script lang="ts" setup>
import type { PageSqlErdEditor } from './index';
import {ElementInject} from '@renderer/components/base/ElementInject'

const props = defineProps<{
    page: PageSqlErdEditor
}>()

</script>

<template>
    <ElementInject :target="props.page.element"/>
</template>
