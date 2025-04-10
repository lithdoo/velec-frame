<template>
    <div class="mv-template">
        <div class="mv-template__sub-title">LoopValue</div>
        <div class="mv-template__component">
            <EditValue :valRef="template.loopValue" :controller="controller" :onchange="onChange"></EditValue>
        </div>

        <div class="mv-template__sub-title">ValueField</div>
        <div class="mv-template__component" style="margin-left: -8px;">
            <InputText :handler="valueFieldInput"></InputText>
        </div>
        
        <div class="mv-template__sub-title">IndexField</div>
        <div class="mv-template__component" style="margin-left: -8px;">
            <InputText :handler="IndexFieldInput"></InputText>
        </div>
    </div>
</template>

<script setup lang="ts">
import { EvalRef } from '@renderer/mods/mutv-eval';
import EditValue from '../common/EditValue.vue'
import { MVFileController } from '../controller';
import { MVTemplateLoop } from '@renderer/mods/mutv-template';
import InputText, { InputTextHandler } from '../common/InputText.vue';
import { computed } from 'vue';
import { fixReactive } from '@renderer/fix';

const props = defineProps<{
    controller: MVFileController,
    template: MVTemplateLoop
}>()

const onChange = (loopValue: EvalRef) => {
    props.controller.template.updateNode<MVTemplateLoop>(props.template.id, (node) => {
        return { ...node, loopValue }
    })
}

const valueFieldInput = computed(() => fixReactive(new class extends InputTextHandler {
    minWidth: number = 48
    text() { return props.template.valueField }
    submit(valueField: string): void {
        props.controller.template.updateNode<MVTemplateLoop>(props.template.id, (node) => {
            return { ...node, valueField }
        })
    }
}))


const IndexFieldInput = computed(() => fixReactive(new class extends InputTextHandler {
    minWidth: number = 48
    text() { return props.template.indexField }
    submit(indexField: string): void {
        props.controller.template.updateNode<MVTemplateLoop>(props.template.id, (node) => {
            return { ...node, indexField }
        })
    }
}))


// const textEditor = fixReactive(
//     new ValueEditorHandler(props.detail.controller, (_, newone) => props.detail.setText(newone))
// )

</script>

<style lang="scss" scoped>
.mv-template {
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
}
</style>