<script lang="ts">
export abstract class ComponentBodyHandler {
    current: 'template' | 'defstate' | "render" = 'template'
    abstract controler: JthStateController
    abstract renderer: JthRenderController
    abstract component: JthComponent

    isCurTemplate() { return this.current === 'template' }
    showTemplate() {
        console.log('showTemplate')
        this.current = 'template'
    }

    isCurDefState() { return this.current === 'defstate' }
    showDefState() { this.current = 'defstate' }

    isCurRender() { return this.current === 'render' }
    showRender() { this.current = 'render' }


    addTextTest() {
        this.controler.addTestCase(this.component.rootId)
    }

    addScriptTest() {
        this.controler.addTestCase(this.component.rootId, true)
    }
}
</script>



<script setup lang="ts">
import { computed } from 'vue';
import { JthComponent, JthRenderController, JthStateController } from '../base';
import TemplateTree from '../template/TemplateTree.vue'
import { TemplateTreeHandler } from '../template/handler';
import VxButton from '@renderer/components/VxButton/VxButton.vue';
import StateJsonEditor from '../testJson/StateJsonEditor.vue';
import RenderTestView from '../render/RenderTestView.vue';

const props = defineProps<{
    handler: ComponentBodyHandler
}>()

const tree = computed(() =>
    TemplateTreeHandler.all.get(props.handler.component)
    ?? TemplateTreeHandler.create(props.handler.controler, props.handler.component)
)



</script>

<template>
    <div class="jth-component-body">
        <div class="jth-component-body__toolbar">
            <VxButton :data-actived.native="handler.isCurTemplate()" :click="() => handler.showTemplate()">Template Tree
            </VxButton>
            <VxButton :data-actived.native="handler.isCurDefState()" :click="() => handler.showDefState()">Test Json
            </VxButton>
            <VxButton :data-actived.native="handler.isCurRender()" :click="() => handler.showRender()">Render View
            </VxButton>

            <div class="jth-component-body__toolbar-divide"></div>

            <template v-if="handler.isCurTemplate()">
                <VxButton icon="plus" :click="() => tree.addTemplateToRoot()">
                    添加根节点
                </VxButton>
                <VxButton v-if="!tree.flatTree.openKeys.length" icon="plus" :click="() => tree.flatTree.expandAll()">
                    展开全部
                </VxButton>
                <VxButton v-else icon="plus" :click="() => tree.flatTree.collapseAll()">
                    收起全部
                </VxButton>
            </template>

            <template v-if="handler.isCurDefState()">
                <VxButton icon="refresh" :click="() => handler.addTextTest()">
                    添加 Text 用例
                </VxButton>
                <VxButton icon="refresh" :click="() => handler.addScriptTest()">
                    添加 Sciprt 用例
                </VxButton>
            </template>

            <template v-if="handler.isCurRender()">
                <!-- <VxButton icon="refresh" :click="() => render.render()">
                    刷新渲染
                </VxButton> -->
            </template>


        </div>

        <div class="jth-component-body__content">
            <div v-show="handler.isCurTemplate()">
                <TemplateTree :tree="tree" />
            </div>
            <div v-show="handler.isCurDefState()">
                <StateJsonEditor :component="handler.component" :controller="handler.controler"></StateJsonEditor>
            </div>
            <div v-show="handler.isCurRender()">
                <RenderTestView :component="handler.component" :controller="handler.renderer"></RenderTestView>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.jth-component-body {
    height: 100%;

    display: flex;
    flex-direction: column;

    .jth-component-body__toolbar {
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        gap: 8px;
        padding: 12px 6px;

        [data-actived="true"] {
            outline: 2px solid #fff;
            font-weight: bolder;
        }

        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .jth-component-body__toolbar-divide {
            height: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    }


    .jth-component-body__content {
        height: 0;
        flex: 1 1 0;

        >div {
            height: 100%;
        }
    }
}
</style>