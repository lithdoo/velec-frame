<template>
    <div class="template-element-detail">
        <div class="template-element-detail__sub-title">TagName
            <VxButton v-if="currentEditTag === null" only-icon icon="edit" :click="()=>beginEdit()" />
        </div>

        <div class="template-element-detail__tag">
            <template v-if="currentEditTag === null">
                <{{ detail.tagName() }} />
            </template>
            <template v-else>
                <VxInput v-model="currentEditTag">
                    <template #suffix>
                        <VxButton only-icon icon="clear" :click="() => cancelEdit()">
                        </VxButton>
                        <VxButton only-icon icon="done" :click="() => submitEdit()">
                        </VxButton>
                    </template>
                </VxInput>
            </template>
        </div>
        <div class="template-element-detail__sub-title">Attrs
            <VxButton only-icon icon="plus" :click="addField" />
        </div>
        <div class="template-element-detail__attr" v-for="field in detail.attrs()">
            <TemplateEditField :field="field" :editor="fieldEditor"></TemplateEditField>
        </div>
    </div>

</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix';
import { FieldEditorHandler, type TemplateDetailElementHandler } from './handler';
import TemplateEditField from './TemplateEditField.vue';
import { VxButton } from '@renderer/components'
import { VxInput } from '@renderer/components'
import { ref } from 'vue';

const props = defineProps<{
    detail: TemplateDetailElementHandler
}>()

const fieldEditor = fixReactive(new FieldEditorHandler())

const addField = () => {
    props.detail.addField()
    fieldEditor.beginEdit(props.detail.attrs()[0])
}

const currentEditTag = ref<string | null>(null)

const beginEdit = () => {
    currentEditTag.value = props.detail.tagName()
}


const cancelEdit = () => {
    currentEditTag.value = null
}

const submitEdit = () => {
    if ((!currentEditTag.value) || (!currentEditTag.value.trim())) {
        return
    }
    props.detail.target.tagName = currentEditTag.value
    cancelEdit()
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

    .template-element-detail__tag {
        padding: 0 8px;
        min-height: 36px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-weight: bolder;
    }
}
</style>