<script lang="ts" setup>
import type { PageDataView } from './index';
import { ToolBar, ToolBarBuilder } from '@renderer/components/base/ToolBar'
import { DataGrid } from '@renderer/components/base/DataGrid'



const props = defineProps<{
    page: PageDataView
}>()

</script>

<template>
    <div class="page-sql-editor">
        <DataGrid :handler="props.page.dataHandler"></DataGrid>
    </div>
</template>

<style lang="scss" scoped>
.page-sql-editor {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.page-sql-editor__toolbar {
    flex: 0 0 auto;
}

.page-sql-editor__editor {
    flex: 1 1 0;
    height: 0;
}
</style>
