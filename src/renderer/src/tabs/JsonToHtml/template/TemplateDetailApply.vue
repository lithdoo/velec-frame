<template>
  <div class="template-element-apply">
    <div class="template-element-apply__sub-title">Component</div>
    <div class="template-element-apply__component">
      <TemplateEditValue
        :value="detail.target.component"
        :editor="compoentEditor"
      ></TemplateEditValue>
    </div>
    <div class="template-element-apply__sub-title">
      Props
      <VxButton only-icon icon="plus" :click="addField" />
    </div>
    <div class="template-element-apply__attr" v-for="field in detail.data()">
      <TemplateEditField :field="field" :editor="fieldEditor"> </TemplateEditField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix'
import { FieldEditorHandler, ValueEditorHandler, type TemplateDetailApplyHandler } from './handler'
import TemplateEditValue from './TemplateEditValue.vue'
import TemplateEditField from './TemplateEditField.vue'
import { VxButton } from '@renderer/components'

const props = defineProps<{ detail: TemplateDetailApplyHandler }>()

const fieldEditor = fixReactive(
  new FieldEditorHandler(props.detail.controller, (oldone, newone) => {
    if (oldone === newone) return
    props.detail.updateAttr(oldone, newone)
  })
)

const compoentEditor = fixReactive(
  new ValueEditorHandler(props.detail.controller, (oldone, newone) => {
    if (oldone === newone) return
    props.detail.setComponent(newone)
  })
)

const addField = () => {
  props.detail.addField()
  fieldEditor.beginEdit(props.detail.data()[0])
}
</script>

<style lang="scss" scoped>
.template-element-apply {
  .template-element-apply__sub-title {
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
