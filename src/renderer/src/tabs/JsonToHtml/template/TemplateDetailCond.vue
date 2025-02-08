<template>
  <div class="template-cond-detail">
    <div class="template-cond-detail__sub-title">Test</div>
    <div class="template-cond-detail__component">
      <TemplateEditValue :value="detail.target.test" :editor="textEditor"></TemplateEditValue>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix'
import { TemplateDetailCondHandler, ValueEditorHandler } from './handler'
import TemplateEditValue from './TemplateEditValue.vue'

const props = defineProps<{
  detail: TemplateDetailCondHandler
}>()

const textEditor = fixReactive(
  new ValueEditorHandler(props.detail.controller, (newone) => props.detail.setTest(newone))
)
</script>

<style lang="scss" scoped>
.template-cond-detail {
  .template-cond-detail__sub-title {
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
