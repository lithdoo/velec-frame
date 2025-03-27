<script lang="ts">

class TestJsonEditorHandler {

    static case(
        rootId: string,
        caseId: string,
        controller: JthStateController,
    ) {
        const key = this.tablekey(rootId, caseId, controller)
        const cache = this.table.get(key)
        return cache ?? fixReactive(new TestJsonEditorHandler(rootId, caseId, controller))
    }

    static table: Map<string, TestJsonEditorHandler> = new Map()
    static controllers: WeakMap<JthStateController, string> = new WeakMap()
    static tablekey(rootId: string, caseId: string, controller: JthStateController) {
        const cKey = TestJsonEditorHandler.controllers.get(controller) ?? Math.random().toString()
        TestJsonEditorHandler.controllers.set(controller, cKey)
        return `${rootId}|${caseId}|${cKey}`
    }

    text: TextEditorHandler

    constructor(
        public rootId: string,
        public caseId: string,
        public controller: JthStateController,
    ) {
        TestJsonEditorHandler.table.set(TestJsonEditorHandler.tablekey(
            this.rootId, this.caseId, this.controller
        ), fixReactive(this))
        const content = this.controller.getTestJsonData(this.caseId)
        this.text = new TextEditorHandler(content, 'JSON')
    }

    reload() {
        return this.text.setContent(this.controller.getTestJsonData(this.caseId))
    }

    update() {
        try {
            this.controller.setTestJsonData(this.caseId, this.text.getContent())
        } catch (e: any) {
            alert(e.message)
        }
        return
    }

    delCase() {
        this.controller.delTestCase(this.caseId)
    }
}

</script>


<script setup lang="ts">
import { TextEditor, TextEditorHandler } from '@renderer/widgets/TextEditor';
import { JthComponent, JthStateController } from '../base';
import { fixReactive } from '@renderer/fix';
import { computed, ref } from 'vue';
import { VxButton } from '@renderer/components';

const props = defineProps<{
    controller: JthStateController,
    component: JthComponent
}>()


const caseList = computed(() => {
    return props.controller.getTestList(props.component.rootId)
})


const editorList = computed(() => {
    return caseList.value.map(v => TestJsonEditorHandler.case(props.component.rootId, v.caseId, props.controller))
})


const current = ref<string>('')

const currentEditor = computed(() => {
    const { caseId } = caseList.value.find(v => v.caseId === current.value) ?? { caseId: undefined }
    if (!caseId) return null
    return TestJsonEditorHandler.case(props.component.rootId, caseId, props.controller)
})

</script>

<template>
    <div class="state-json-editor">
        <div class="state-json-editor__tab-list">
            <VxButton class="state-json-editor__tab" v-for="(val) in caseList"
                :data-actived.native="current === val.caseId" :click="() => current = val.caseId">
                <div class="state-json-editor__tab-text">{{ val.caseId }}</div>
            </VxButton>

            <div class="jth-component-body__toolbar-divide"></div>

            <template v-if="currentEditor">
                <VxButton icon="del" :click="() => currentEditor?.delCase()">
                    删除当前用例
                </VxButton>
                <VxButton icon="refresh" :click="() => currentEditor?.reload()">
                    重载
                </VxButton>
                <VxButton icon="plus" :click="() => currentEditor?.update()">
                    更新
                </VxButton>
            </template>
        </div>

        <div class="state-json-editor__editor-list">
            <div v-if="!currentEditor" class="state-json-editor-empty">{{ caseList.length ? "请选择用例" : "请添加用例" }}</div>
            <div class="state-json-editor__editor" v-for="(val) in editorList" v-show="current == val.caseId">
                <TextEditor :handler="val.text"></TextEditor>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.state-json-editor {
    height: 100%;

    display: flex;
    flex-direction: column;

    .state-json-editor__tab-list {
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

        .state-json-editor__tab-text {
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
            cursor: pointer;
        }

    }

    .state-json-editor__editor-list {
        flex: 1 1 0;
        height: 0;

        .state-json-editor__editor {
            height: 100%;
        }

        .state-json-editor-empty {
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