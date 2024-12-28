<template>
    <div class="page-jth-template">
        <div class="page-jth-template__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>

        <div class="page-jth-template__content">
            <div class="page-jth-template__component" v-for="tree in trees" :key="tree.id"
                :data-current="tree.id === current">
                <div class="page-jth-template__component-header" @dblclick="() => tree.addTemplateToRoot()"
                    @click="() => focus(tree.id)">
                    {{ tree.component.keyName }}
                    <VxButton @click.native.stop v-if="tree.id === current" :click="() => tree.addTemplateToRoot()">
                        添加节点
                    </VxButton>
                </div>
                <div class="page-jth-template__component-content">
                    <TemplateTree :tree="tree" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, } from 'vue';
import { JthStateModel, } from './JthState';
import { ToolBarBuilder, ToolBar } from '@renderer/widgets/ToolBar';
import { nanoid } from 'nanoid';
import VxButton from '@renderer/components/VxButton/VxButton.vue';
import { TemplateTreeHandler } from './template/handler';
import TemplateTree from './template/TemplateTree.vue';

const props = defineProps<{
    model: JthStateModel
}>()

const current = ref<string | null>(null)
function focus(id: string) {
    if (current.value === id) current.value = null
    else current.value = id
}


const toolbar = ToolBarBuilder.create()
    .button('addComponent', '添加组件', async () => {
        await props.model.component.newComponent('Component-' + nanoid())
    })
    .build()


const trees = computed(() => {
    const components = props.model.component.allComponents()
    return components.map(c => TemplateTreeHandler.all.get(c) ?? TemplateTreeHandler.create(props.model, c))
})


</script>


<style lang="scss" scoped>
.page-jth-template {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;

    .page-jth-template__toolbar {
        flex: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .page-jth-template__content {
        flex: 1 1 0;
        height: 0;
        display: flex;
        flex-direction: column;

        .page-jth-template__component-header {
            height: 32px;
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
            flex: 0 0 auto;
            opacity: 0.8;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0 16px;
            cursor: pointer;
        }

        .page-jth-template__component-content {
            flex: 1 1 0;
            height: 0;
            overflow: hidden;
        }

        .page-jth-template__component {
            flex: 0 0 32px;
            height: 32px;
            transition: all 0.3s ease-in-out;
            display: flex;
            flex-direction: column
        }

        .page-jth-template__component[data-current="true"] {
            flex: 1 1 32px;

            .page-jth-template__component-header {
                opacity: 1;
                font-weight: 800;
            }

            .page-jth-template__component-content {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    }
}
</style>