<script lang="ts">
export abstract class ComponentBodyHandler {
    current: 'template' | 'defstate' | "render" = 'template'
    abstract controler: JthStateController
    abstract component: JthComponent

    isCurTemplate() { return this.current === 'template' }
    showTemplate() { this.current = 'template' }

    isCurDefState() { return this.current === 'defstate' }
    showDefState() { this.current = 'defstate' }

    isCurRender() { return this.current === 'render' }
    showRender() { this.current = 'render' }
}
</script>



<script setup lang="ts">
import { computed } from 'vue';
import { JthComponent, JthStateController } from '../../common';
import TemplateTree from '../template/TemplateTree.vue'
import { TemplateTreeHandler } from '../template/handler';
import VxButton from '@renderer/components/VxButton/VxButton.vue';

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
            <VxButton :data-actived.native="handler.isCurDefState()" :click="() => handler.showDefState()">State
                (default)</VxButton>
            <VxButton :data-actived.native="handler.isCurRender()" :click="() => handler.showRender()">Render View
            </VxButton>

            <div class="jth-component-body__toolbar-divide"></div>

            <template v-if="handler.isCurTemplate()">
                <VxButton icon="plus" :click="() => tree.addTemplateToRoot()">
                    添加根节点
                </VxButton>
            </template>

            
            <template v-if="handler.isCurRender()">
                <VxButton icon="refresh" :click="() => tree.addTemplateToRoot()">
                    刷新渲染
                </VxButton>
            </template>
        </div>

        <div class="jth-component-body__content">
            <template v-if="handler.isCurTemplate()">
                <TemplateTree :tree="tree" />
            </template>
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

    }
}
</style>