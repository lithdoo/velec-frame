<script lang="ts" setup>
import type { PageSqlErd } from './index';
import { ToolBarBuilder, ToolBar } from '@renderer/components/base/ToolBar';
import { GraphContainer } from "@renderer/components/_graph";

const props = defineProps<{
    page: PageSqlErd
}>()

const toolbar = ToolBarBuilder.create()
    .button('save', '保存', () => {
        props.page.saveCache()
    }, { icon: 'del' })
    .button('update', '更新', () => {
        props.page.reload()
    }, { icon: 'del' })
    .button('createTable', '新建表', () => {
        props.page.addTable()
    }, { icon: 'del' })
    .build()

</script>

<template>
    <div class="page-sql-erd">
        <div class="page-sql-erd__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>
        <div class="page-sql-erd__graph">
            <GraphContainer :view="props.page.view"></GraphContainer>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-sql-erd {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.page-sql-erd__toolbar {
    flex: 0 0 auto;
    border-bottom: 1px solid #666;
}

.page-sql-erd__graph {
    flex: 1 1 0;
    height: 0;
}
</style>
