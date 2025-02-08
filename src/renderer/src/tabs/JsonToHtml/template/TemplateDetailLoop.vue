<template>
  <div class="template-loop-detail">
    <div class="template-loop-detail__sub-title">LoopValue</div>
    <div class="template-loop-detail__component">
      <TemplateEditValue :value="detail.target.loopValue" :editor="textEditor"></TemplateEditValue>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix'
import { TemplateDetailLoopHandler, ValueEditorHandler } from './handler'
import TemplateEditValue from './TemplateEditValue.vue'

const props = defineProps<{
  detail: TemplateDetailLoopHandler
}>()

const textEditor = fixReactive(
  new ValueEditorHandler(props.detail.controller, (newone) => props.detail.setLoopValue(newone))
)
</script>

<style lang="scss" scoped>
.template-loop-detail {
  .template-loop-detail__sub-title {
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
