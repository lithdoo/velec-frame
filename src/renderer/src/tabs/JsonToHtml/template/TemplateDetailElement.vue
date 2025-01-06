<template>
    <div class="template-element-detail">
        <div class="template-element-detail__sub-title">Tag
            <{{ detail.tagName() }} />
        </div>
        <div class="template-element-detail__sub-title">Attr
            <VxButton only-icon icon="plus" :click="addField" />
        </div>
        <div class="template-element-detail__attr" v-for="field in detail.attrs()">
            <TemplateFieldEdior :field="field" :editor="fieldEditor"></TemplateFieldEdior>
        </div>
    </div>

</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix';
import { FieldEditorHandler, type TemplateDetailElementHander } from './handler';
import TemplateFieldEdior from './TemplateFieldEdior.vue';
import { VxButton } from '@renderer/components'

const props = defineProps<{
    detail: TemplateDetailElementHander
}>()

const fieldEditor = fixReactive(new FieldEditorHandler())

const addField = () => {
    props.detail.addField()
    fieldEditor.beginEdit(props.detail.attrs()[0])
}

</script>

<style lang="scss" scoped>
.template-element-detail {
    .template-element-detail__sub-title {
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