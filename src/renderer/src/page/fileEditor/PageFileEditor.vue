<script lang="ts" setup>
import type { PageFileEditor } from './index';
import {ElementInject} from '@renderer/components/base/ElementInject'

const props = defineProps<{
    page: PageFileEditor
}>()

</script>

<template>
    <ElementInject :target="props.page.element"/>
</template>
