<template>
  <div class="template-detail">
    <TemplateDetailCommon :detail="detail" :tree="tree"></TemplateDetailCommon>

    <template v-if="detail.type() === JthTemplateType.Element">
      <TemplateDetailElement :detail="asType<any>(detail)"></TemplateDetailElement>
    </template>
    <template v-if="detail.type() === JthTemplateType.Prop">
      <TemplateDetailProp :detail="asType<any>(detail)"></TemplateDetailProp>
    </template>
    <template v-if="detail.type() === JthTemplateType.Apply">
      <TemplateDetailApply :detail="asType<any>(detail)"></TemplateDetailApply>
    </template>
    <template v-if="detail.type() === JthTemplateType.Text">
      <TemplateDetailText :detail="asType<any>(detail)"></TemplateDetailText>
    </template>
    <template v-if="detail.type() === JthTemplateType.Cond">
      <TemplateDetailCond :detail="asType<any>(detail)"></TemplateDetailCond>
    </template>
    <template v-if="detail.type() === JthTemplateType.Loop">
      <TemplateDetailLoop :detail="asType<any>(detail)"></TemplateDetailLoop>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TemplateDetailHandler, TemplateTreeHandler } from './handler'
import { JthStateController, JthTemplateType } from '../../common'
import TemplateDetailElement from './TemplateDetailElement.vue'
import TemplateDetailProp from './TemplateDetailProp.vue'
import TemplateDetailApply from './TemplateDetailApply.vue'
import TemplateDetailText from './TemplateDetailText.vue'
import TemplateDetailCond from './TemplateDetailCond.vue'
import TemplateDetailLoop from './TemplateDetailLoop.vue'
import TemplateDetailCommon from './TemplateDetailCommon.vue'

const props = defineProps<{
  templateId: string
  model: JthStateController
  tree: TemplateTreeHandler
}>()

const detail = computed(() => {
  return TemplateDetailHandler.create(props.model, props.templateId)
})

const asType = <T,>(input: any) => {
  return input as T
}
</script>
