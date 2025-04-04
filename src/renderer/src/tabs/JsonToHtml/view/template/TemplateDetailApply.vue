<template>
  <div class="template-element-apply">
    <div class="template-element-apply__sub-title">Component</div>
    <div class="" style="padding: 8px;">

      <VxSelector :options="components" :model-value="current" @update:model-value="val => onchange(val)"></VxSelector>
    </div>


    <!-- <div class="template-element-apply__component">
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
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { type TemplateDetailApplyHandler } from './handler'
import { computed } from 'vue'
import VxSelector from '@renderer/components/VxInput/VxSelector.vue'

const props = defineProps<{ detail: TemplateDetailApplyHandler }>()

const components = computed(() => props.detail.components().map(val => ({
  key: val.rootId, label: val.keyName
})))

const current = computed(() => {
  return components.value.find(v => v.key === props.detail.target.target)
})

const onchange = (val?: { key: string } | null) => {
  props.detail.updateTarget(val?.key ?? '')
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
