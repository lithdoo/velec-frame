<script lang="ts" setup>
import type { PageDataView } from './index';
import { ToolBar, ToolBarBuilder } from '@renderer/components/base/ToolBar'
import { DataGrid, GridPager } from '@renderer/components/base/DataGrid'



const props = defineProps<{
    page: PageDataView
}>()

</script>

<template>
    <div class="page-data-view">
        <div class="page-data-view__array-view">
            <div class="page-data-view__array-view-header">
                <div class="page-data-view__array-view-title">{{ "<root>" }}</div>
                <GridPager class="page-data-view__array-view-pager" :handler="props.page.dataHandler" />
            </div>

            <DataGrid class="page-data-view__array-view-grid" :handler="props.page.dataHandler"></DataGrid>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-data-view {
    height: 100%;
    overflow: hidden;
}

.page-data-view__array-view {
    height: 100%;
    display: flex;
    flex-direction: column;

    .page-data-view__array-view-header {
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid #666;
        padding: 0 8px;
        min-height: 32px;
    }

    .page-data-view__array-view-title {
        flex: 1 1 0;
        width: 0;
    }

    .page-data-view__array-view-pager {
        flex: 0 0 auto;
    }

    .page-data-view__array-view-grid {
        flex: 1 1 0;
        height: 0;
    }
}
</style>
