<script lang="ts" setup>
import type { PageRunner } from './index';
import { ToolBarBuilder, ToolBar } from '@renderer/components/base/ToolBar';
import { GraphContainer } from "@renderer/components/graph";
import { onMounted } from 'vue';

const props = defineProps<{
    page: PageRunner
}>()

const toolbar = ToolBarBuilder.create()
    .button('save', '保存', () => {
        props.page.save()
    }, { icon: 'del' })
    .button('update', '更新', () => {
        // props.page.reload()
    }, { icon: 'del' })
    .button('addSqlNode', '添加 SQL 节点', async () => {
        const fileUrl = await window.explorerApi.selectFile({extensions:['db']})
        if(fileUrl) {
            props.page.view.addSqlNode(fileUrl)
        }
    }, { icon: 'del' })
    .button('addJsonNode', '添加 Json 节点', async () => {
        props.page.view.addJsonNode('')
    }, { icon: 'del' })
    .button('addFlowNode', '添加 Flow 节点', async () => {
        props.page.view.addFlowNode('')
    }, { icon: 'del' })
    .button('addFlowEdge', '添加 Flow 流程', async () => {
        props.page.view.addFlowEdge()
    }, { icon: 'del' })
    .build()

onMounted(()=>{
    setTimeout(()=>{
        props.page.view.fitView()
    },100)
})

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
