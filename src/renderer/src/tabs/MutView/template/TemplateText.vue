<template>
    <div class="mv-template">
        <div class="mv-template__sub-title">Text</div>
        <div class="mv-template__component">
            <EditValue :valRef="template.text" :controller="controller" :onchange="onChangeText"></EditValue>
        </div>
    </div>
</template>

<script setup lang="ts">
import { EvalRef } from '@renderer/mods/mutv-eval';
import EditValue from '../common/EditValue.vue'
import { MVFileController } from '../controller';
import { MVTemplateText } from '@renderer/mods/mutv-template';

const props = defineProps<{
    controller: MVFileController,
    template: MVTemplateText
}>()

const onChangeText = (text:EvalRef)=>{
    props.controller.template.updateNode<MVTemplateText>(props.template.id,(node)=>{
        return { ...node , text }
    })
}

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