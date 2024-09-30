<script lang="ts" setup>
import { RunnerClientStatus } from '@common/runner';
import type { PageRunner } from './index';
import { ToolBarBuilder, ToolBar } from '@renderer/components/base/ToolBar';
import { GraphContainer } from "@renderer/mods/graph";
import { computed, onMounted } from 'vue';
import { NodeShapeKey } from './common';
import { contextMenu } from '@renderer/view/fixed/contextmenu';
import { Menu, PopMenuListHandler } from '@renderer/components/base/PopMenu';
import { nanoid } from 'nanoid';

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
    .button('addScopeNode', '添加节点', async (event) => {
        contextMenu.open(PopMenuListHandler.create(
            ([
                ['SQL', NodeShapeKey.GH_RUNNER_SQL_NODE],
                ['JSON', NodeShapeKey.GH_RUNNER_JSON_NODE],
                ['FLOW', NodeShapeKey.GH_RUNNER_FLOW_NODE],
                // ['SCOPE', NodeShapeKey.GH_RUNNER_SCOPE_NODE]
            ] as [string, NodeShapeKey][]).map(([label, type]) => {
                return Menu.button({
                    icon: 'del', key: nanoid(), label, action: () => {
                        props.page.view.addBlankNode(type)
                    }
                })
            })
        ), event)

    }, { icon: 'del' })
    .button('addFlowEdge', '添加流程', async () => {
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
