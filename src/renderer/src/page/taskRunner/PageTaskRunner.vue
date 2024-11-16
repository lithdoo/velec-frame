<script lang="ts" setup>
import { contextMenu } from '@renderer/view/fixed/contextmenu';
import ConfigRender from './ConfigRender.vue';
import FlowRender from './FlowRender.vue';
import type { PageTaskRunner } from './index';
import { ToolBar, ToolBarBuilder } from '@renderer/components/base/ToolBar'
import { Menu, PopMenuListHandler } from '@renderer/components/base/PopMenu';
import { RunnerStepType } from './runner';
import { nanoid } from 'nanoid';
import { ref } from 'vue';

const props = defineProps<{
    page: PageTaskRunner
}>()

const pannelView = ref<'step' | 'flow'>('step')

const toolbar = ToolBarBuilder.create()
    .button('save', '保存', () => { props.page.runner.save() }, {
        icon: 'del'
    })
    .button('addStep', "添加步骤", (event) => {
        contextMenu.open(PopMenuListHandler.create(
            ([
                ['Json', RunnerStepType.Json],
                ['NodeJs', RunnerStepType.NodeJs],
                ['Scope', RunnerStepType.Scope],
                ['Sqlite', RunnerStepType.Sqlite],
            ] as [string, RunnerStepType][]).map(([label, type]) => {
                return Menu.button({
                    icon: 'del', key: nanoid(), label, action: () => {
                        props.page.runner.createBlankStep(type)
                    }
                })
            })
        ), event)
    })

    .button('addFlow', "添加流程", () => {
        props.page.runner.createBlankFlow()
        pannelView.value = 'flow'
    })
    .button('toggle', "切换视图", () => {
        pannelView.value = pannelView.value === 'step' ? 'flow' : 'step'
    })
    .build()

</script>

<template>
    <div class="page-runner-editor">
        <div class="page-runner-editor__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>
        <div class="page-runner-editor__editor">
            <ConfigRender v-show="pannelView === 'step'" :config="page.runner.config" :runner="page.runner">
            </ConfigRender>
            <FlowRender v-show="pannelView === 'flow'" :config="page.runner.config" :runner="page.runner"></FlowRender>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-runner-editor {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.page-runner-editor__toolbar {
    flex: 0 0 auto;
    border-bottom: 1px solid #666;
}

.page-runner-editor__editor {
    flex: 1 1 0;
    height: 0;

    overflow: auto;
}
</style>
