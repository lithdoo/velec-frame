<template>
  <div class="template-element-text">
    <div class="template-element-text__sub-title">Text</div>
    <div class="template-element-text__component">
      <TemplateEditValue :value="detail.target.text" :editor="textEditor"></TemplateEditValue>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix'
import { TemplateDetailTextHandler, ValueEditorHandler } from './handler'
import TemplateEditValue from './TemplateEditValue.vue'

const props = defineProps<{
  detail: TemplateDetailTextHandler
}>()

const textEditor = fixReactive(
  new ValueEditorHandler(props.detail.controller, (_,newone) => props.detail.setText(newone))
)


</script>

<style lang="scss" scoped>
.template-element-text {
  .template-element-text__sub-title {
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
