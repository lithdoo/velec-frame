<script lang="ts">
export class RenderTestHandler {

    cntr = document.createElement('div')

    renderRoot?: JthRenderRoot

    constructor(
        public caseItem: {
            rootId: string;
            caseId: string;
            jsonData: string;
        },
        public state: () => JthFileState,
    ) { }

    render() {
        if (this.renderRoot) {
            this.renderRoot.despose()
        }

        const renderer = new JthFileRenderer(this.state())

        this.renderRoot = renderer.renderJson(
            this.caseItem.rootId, this.caseItem.jsonData
        )

        this.renderRoot.bind(this.cntr = document.createElement('div'))
        this.cntr.style.height = '100%'
        this.cntr.style.overflow = '100%'
        this.cntr.style.background = '#efefef'
    }

}




</script>


<script setup lang="ts">
import { JthFileRenderer, JthRenderRoot } from '@renderer/mods/json2html/render';
import { JthComponent, JthFileState, JthRenderController, TestRenderRoot } from '../base';
import { computed, ref } from 'vue';
import { fixReactive } from '@renderer/fix';
import { HTMLElementInject } from '@renderer/components';
import { VxButton } from '@renderer/components';

const props = defineProps<{
    controller: JthRenderController,
    component: JthComponent
}>()


const caseList = computed(() => {
    return props.controller.getTestList(props.component.rootId)
})

const cntrMap = new Map<string, TestRenderRoot>()


const renderList = computed(() => {

    return caseList.value.map(caseItem => {
        const { caseId, rootId } = caseItem

        const cache = cntrMap.get(caseId)
        if (cache) {
            console.warn('cache')
            return cache
        }

        const target = fixReactive(new TestRenderRoot(props.controller, rootId, caseId))

        cntrMap.set(caseId, target)

        return target
    })
})

const currentEditor = computed(() => {
    return renderList.value.find(v => v.caseId === current.value)
})


const current = ref<string>('')


</script>


<template>
    <div class="render-test-view">
        <div class="render-test-view__tab-list">
            <VxButton class="render-test-view__tab" v-for="(val) in caseList"
                :data-actived.native="current === val.caseId" :click="() => current = val.caseId">
                <div class="render-test-view__tab-text">{{ val.caseId }}</div>
            </VxButton>

            <div class="jth-component-body__toolbar-divide"></div>

            <template v-if="currentEditor">
                <VxButton icon="refresh" :click="() => currentEditor?.update()">
                    刷新
                </VxButton>
            </template>
        </div>

        <div class="render-test-view__editor-list">
            <div v-if="!currentEditor" class="render-test-view-empty">{{ caseList.length ? "请选择用例" : "请添加用例" }}</div>
            <div class="render-test-view__editor" v-for="(val) in renderList" v-show="current == val.caseId">
                <HTMLElementInject :style="{ height: '100%' }" :target="val.element()"></HTMLElementInject>
            </div>
        </div>
    </div>
</template>


<style lang="scss" scoped>
.render-test-view {
    height: 100%;

    display: flex;
    flex-direction: column;

    .render-test-view__tab-list {
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

        .render-test-view__tab-text {
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
            cursor: pointer;
        }

    }

    .render-test-view__editor-list {
        flex: 1 1 0;
        height: 0;

        .render-test-view__editor {
            height: 100%;
            background: #fff;
        }

        .render-test-view-empty {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            opacity: 0.6;
            font-weight: 600;
        }
    }
}
</style>