<script lang="ts" setup>
import { ModalStack } from '@renderer/widgets/ModalStack/index'
import { ToolBarBuilder, ToolBar } from '@renderer/widgets/ToolBar'
import { VxButton, VxSelector } from '@renderer/components';
import InputText, { InputTextHandler } from '../common/InputText.vue';
import EditValue from '../common/EditValue.vue'
import InputTextLine from '../common/InputTextLine.vue';
import { SinglePanelSplitHandler, SinglePanelSplit } from '@renderer/widgets/SinglePanelSplit'
import type { PageMutVCaseRender } from './handler';
import { computed, ref } from 'vue';
import { fixReactive } from '@renderer/fix';
import { EvalRef } from '@renderer/mods/mutv-eval';
import { nanoid } from 'nanoid';
import ElementInject from '@renderer/components/ElementInject/ElementInject.vue';



const splitCenter = ref(new SinglePanelSplitHandler())
const props = defineProps<{
    page: PageMutVCaseRender
}>()

const file = computed(() => props.page.fileController)
const renderer = computed(() => props.page.renderController)
const modal = computed(() => props.page.modal)


const caseToolbar = ToolBarBuilder.create()
    .button('addComponent', '添加数据', async () => {
        addContext()
    })
    .button('reload', '重新加载', async () => {
        await props.page.reload()
    })
    .button('save', '保存', async () => {
        await props.page.save()
    })
    .build()


const renderSelector = fixReactive(new class {
    contexts = () => file.value.context.allData().map((v) => ({ label: v.name, key: v.id }))
    components = () => file.value.component.allComponents().map((v) => ({ label: v.keyName, key: v.rootId }))

    contextId: null | string = null
    componentRootId: null | string = null

    selectorContext = () => {
        return this.contexts().find(v => v.key === this.contextId)
    }

    selectorComponent = () => {
        return this.components().find(v => v.key === this.componentRootId)
    }

    render() {
        const contextId = this.selectorContext()?.key
        const rootId = this.selectorComponent()?.key
        if (!contextId || !rootId) return
        const data = renderer.value.context.getContextData(contextId)
        renderer.value.render(data, rootId)
    }

})


const contexts = computed(() => file.value.context.allData()
    .map(({ id, name, value }) => {
        return fixReactive(new class extends InputTextHandler {
            text(): string {
                return name
            }
            submit(text: string): void {
                const newName = text.trim()
                file.value.context.renameData(id, newName)
            }

            value() {
                return value
            }

            onValueChange(newValue: EvalRef) {
                file.value.context.updateValue(id, newValue)
            }

            del() {
                file.value.context.delData(id)
            }
        })
    })
)


const addContext = () => {
    let name = 'context'
    let idx = 0
    const all = file.value.context.allData()
    while (all.find(v => v.name === name)) {
        idx = idx + 1
        name = `context_${idx}`
    }
    file.value.context.addData({
        id: nanoid(), name, context: [], value: { '_VALUE_GENERATOR_REFERENCE_': 'null' }
    })
}



</script>


<template>
    <div class="page-mutv-render">

        <ModalStack :handler="modal"></ModalStack>


        <SinglePanelSplit :handler="splitCenter">
            <template #panel>
                <div class="page-mutv-render__case-list" :style="{ width: splitCenter.distance + 'px' }">
                    <ToolBar :handler="caseToolbar"></ToolBar>

                    <div class="page-mutv-render__case-list-content">

                        <template v-for="field in contexts">

                            <div class="mv-template__sub-title">
                                <InputTextLine :handler="field">
                                    <template #hover-btn>
                                        <VxButton icon="del" only-icon :click="() => field.del()"></VxButton>
                                    </template>
                                </InputTextLine>
                            </div>
                            <div class="mv-template__component">
                                <EditValue :valRef="field.value()" :controller="file"
                                    :onchange="ref => field.onValueChange(ref)">
                                </EditValue>
                            </div>
                        </template>

                        <div style="margin-top: 16px;display: flex; align-items: center;justify-content: center;">
                            <VxButton icon="plus" style="text-align: center;" :click="() => addContext()">Add Field
                            </VxButton>
                        </div>
                    </div>
                </div>
            </template>
            <template #extra>
                <div class="page-mutv-render__render-cntr">
                    <!-- <PageTab></PageTab> -->

                    <div class="page-mutv-render__render-toolbar">
                        <VxSelector style="min-width: 120px;" :options="renderSelector.contexts()"
                            :model-value="renderSelector.selectorContext()"
                            @update:model-value="(val) => renderSelector.contextId = val?.key ?? null"></VxSelector>

                        <VxSelector style="min-width: 120px;" :options="renderSelector.components()"
                            :model-value="renderSelector.selectorComponent()"
                            @update:model-value="(val) => renderSelector.componentRootId = val?.key ?? null">
                        </VxSelector>

                        <VxButton icon="reload" :click="() => renderSelector.render()">重新渲染</VxButton>
                    </div>

                    <div class="page-mutv-render__render-view">
                        <ElementInject :target="renderer.renderRoot.element()" :style="{
                            height: '100%'
                        }"></ElementInject>
                    </div>

                </div>
            </template>
        </SinglePanelSplit>
        <!-- <div class="page-mutv-render__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>


        <div class="page-mutv-render__content">
            <div class="page-mutv-render__component" v-for="tree in trees" :key="tree.rootId"
                :data-current="tree.rootId === current">

                <ComponentHead v-model="current" :component="tree" :controller="controller"></ComponentHead>

                <div class="page-mutv-render__component-content">
                    <ComponentBody :component="tree" :controller="controller"></ComponentBody>
                </div>
            </div>
        </div> -->

    </div>

</template>
<style lang="scss" scoped>
.page-mutv-render {
    height: 100%;
    display: flex;
    flex-direction: row;
    position: relative;

    .page-mutv-render__case-list {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        height: 100%;
        overflow: hidden;

        display: flex;
        flex-direction: column;

        .page-mutv-render__case-list-content {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            flex: 1 1 0;
            height: 0;
            overflow: auto;
        }
    }

    .mv-template__sub-title {
        margin-top: 8px;
        padding: 0 8px;
        font-size: 16px;
        font-weight: bolder;
        opacity: 0.7;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        height: 32px;
    }


    .page-mutv-render__render-cntr {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .page-mutv-render__render-toolbar {
        flex: 0 0 auto;
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 4px 8px;
    }

    .page-mutv-render__render-view {
        flex: 1 1 0;
        height: 100%;
        padding: 8px;
        overflow: auto;
        background-color: #efefef;
    }

}
</style>
