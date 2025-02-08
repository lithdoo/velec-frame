<template>
  <div class="template-element-prop">
    <div class="template-element-prop__sub-title">
      Data
      <VxButton only-icon icon="plus" :click="addField" />
    </div>
    <div class="template-element-prop__attr" v-for="field in detail.data()">
      <TemplateEditField :field="field" :editor="fieldEditor"></TemplateEditField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix'
import { FieldEditorHandler, TemplateDetailPropHandler } from './handler'
import TemplateEditField from './TemplateEditField.vue'
import { VxButton } from '@renderer/components'

const props = defineProps<{
  detail: TemplateDetailPropHandler
}>()

const fieldEditor = fixReactive(
  new FieldEditorHandler(props.detail.controller, (oldone, newone) => {
    if (oldone === newone) return
    props.detail.updateAttr(oldone, newone)
  })
)

const addField = () => {
  props.detail.addField()
  fieldEditor.beginEdit(props.detail.data()[0])
}
</script>

<style lang="scss" scoped>
.template-element-prop {
  .template-element-prop__sub-title {
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
