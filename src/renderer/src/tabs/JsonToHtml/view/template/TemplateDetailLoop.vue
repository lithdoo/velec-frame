<template>
  <div class="template-loop-detail">
    <div class="template-loop-detail__sub-title">LoopValue</div>
    <div class="template-loop-detail__component">
      <TemplateEditValue :value="detail.target.loopValue" :editor="textEditor"></TemplateEditValue>
    </div>

    <div class="template-loop-detail__sub-title">
      ValueField
      <VxButton v-if="currentEditValueField === null" only-icon icon="edit" :click="() => beginEditVF()" />
    </div>

    <div class="template-loop-detail__tag">
      <template v-if="currentEditValueField === null">
        {{ detail.valueField() }}
      </template>
      <template v-else>
        <VxInput v-model="currentEditValueField">
          <template #suffix>
            <VxButton only-icon icon="clear" :click="() => cancelEditVF()"> </VxButton>
            <VxButton only-icon icon="done" :click="() => submitEditVF()"> </VxButton>
          </template>
        </VxInput>
      </template>
    </div>

    <div class="template-loop-detail__sub-title">
      IndexField
      <VxButton v-if="currentEditIndexField === null" only-icon icon="edit" :click="() => beginEditIF()" />
    </div>

    <div class="template-loop-detail__tag">
      <template v-if="currentEditIndexField === null">
        {{ detail.indexField() }}
      </template>
      <template v-else>
        <VxInput v-model="currentEditIndexField">
          <template #suffix>
            <VxButton only-icon icon="clear" :click="() => cancelEditIF()"> </VxButton>
            <VxButton only-icon icon="done" :click="() => submitEditIF()"> </VxButton>
          </template>
        </VxInput>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fixReactive } from '@renderer/fix'
import { TemplateDetailLoopHandler, ValueEditorHandler } from './handler'
import TemplateEditValue from './TemplateEditValue.vue'
import { ref } from 'vue';
import { VxButton } from '@renderer/components'
import { VxInput } from '@renderer/components'

const props = defineProps<{
  detail: TemplateDetailLoopHandler
}>()

const textEditor = fixReactive(
  new ValueEditorHandler(props.detail.controller, (_, newone) => props.detail.setLoopValue(newone))
)




const currentEditValueField = ref<string | null>(null)
const currentEditIndexField = ref<string | null>(null)

const beginEditVF = () => {
  currentEditValueField.value = props.detail.valueField()
}

const cancelEditVF = () => {
  currentEditValueField.value = null
}

const submitEditVF = () => {
  if (!currentEditValueField.value || !currentEditValueField.value.trim()) {
    return
  }
  props.detail.setValueField(currentEditValueField.value)
  cancelEditVF()
}



const beginEditIF = () => {
  currentEditIndexField.value = props.detail.indexField()
}

const cancelEditIF = () => {
  currentEditIndexField.value = null
}

const submitEditIF = () => {
  if (!currentEditIndexField.value || !currentEditIndexField.value.trim()) {
    return
  }
  props.detail.setIndexField(currentEditIndexField.value)
  cancelEditIF()
}
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

  .template-loop-detail__tag {
    padding: 0 8px;
    min-height: 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-weight: bolder;
  }
}
</style>
