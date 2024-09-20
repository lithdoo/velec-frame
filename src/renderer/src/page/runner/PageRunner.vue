<script lang="ts" setup>
import { RunnerClientStatus } from '@common/runner';
import type { PageRunner } from './index';
import { ToolBarBuilder, ToolBar } from '@renderer/components/base/ToolBar';
import { GraphContainer } from "@renderer/components/graph";
import { computed, onMounted } from 'vue';

const props = defineProps<{
    page: PageRunner
}>()

const toolbar = ToolBarBuilder.create()
    .button('save', '保存', () => {
        props.page.save()
    }, { icon: 'del' })
    .button('update', '更新', () => {
        props.page.view.refresh()
    }, { icon: 'del' })
    .button('addSqlNode', '添加 SQL 节点', async () => {
        const fileUrl = await window.explorerApi.selectFile({ extensions: ['db'] })
        if (fileUrl) {
            props.page.view.addSqlNode(fileUrl)
        }
    }, { icon: 'del' })
    .button('addJsonNode', '添加 Json 节点', async () => {
        props.page.view.addJsonNode('')
    }, { icon: 'del' })
    .button('addScopeNode', '添加 Scope 节点', async () => {
        props.page.view.addScopeNode('123')
    }, { icon: 'del' })
    .button('addFlowNode', '添加 Flow 节点', async () => {
        props.page.view.addFlowNode('')
    }, { icon: 'del' })
    .button('addFlowEdge', '添加 Flow 流程', async () => {
        props.page.view.addFlowEdge()
    }, { icon: 'del' })
    .build()

const page = computed(() => props.page)

onMounted(() => {
    setTimeout(() => {
        props.page.view.fitView()
    }, 100)
})

</script>

<template>
    <div class="page-sql-erd">
        <div class="page-sql-erd__toolbar">
            <div class="page-sql-erd__action">
                <ToolBar :handler="toolbar"></ToolBar>
            </div>
            <div :class="{
                'page-sql-erd__status': true,
                'page-sql-erd__status--free': page.clientStatus === RunnerClientStatus.Free,
                'page-sql-erd__status--procesing': page.clientStatus === RunnerClientStatus.Procesing,
                'page-sql-erd__status--offline': page.clientStatus === RunnerClientStatus.Offline,
            }"></div>
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
    display: flex;
    flex-direction: row;
    align-items: center;
}

.page-sql-erd__status {
    width: 92px;
    flex: 0 0 auto;
    text-align: center;
    height: 28px;
    line-height: 24px;
    border-radius: 4px;
    margin: 4px;
    font-weight: 800;

    &.page-sql-erd__status--free {
        border: 2px solid greenyellow;
        color: greenyellow;

        &::before {
            content: 'FREE';
        }
    }

    &.page-sql-erd__status--procesing {
        border: 2px solid lightseagreen;
        color: lightseagreen;

        &::before {
            content: 'PROCESING';
        }
    }

    &.page-sql-erd__status--offline {
        border: 2px solid #ccc;
        color: #ccc;

        &::before {
            content: 'OFFLINE';
        }
    }
}

.page-sql-erd__action {
    flex: 1 1 0;
    width: 0;
}

.page-sql-erd__graph {
    flex: 1 1 0;
    height: 0;
}
</style>
