<template>
  <div class="mv-template">

    <div class="mv-template__sub-title">Type</div>
    <div class="mv-template__type">
      <template v-if="!changeType.currentType">
        <div class="mv-template__type-text">
          [ {{ template.type }} ]
        </div>
        <div class="mv-template__type-btns">
          <VxButton :click="() => changeType.change()" only-icon icon="edit"></VxButton>
        </div>
      </template>
      <template v-else>
        <div class="mv-template__type-selector">
          <VxSelector :options="changeType.options" v-model="changeType.currentType">
            <template #suffix>
              <VxButton only-icon icon="done" :click="() => changeType.submit()"></VxButton>
              <VxButton only-icon icon="clear" :click="() => changeType.cancel()"></VxButton>
            </template>
          </VxSelector>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
//   import { TemplateDetailHandler, TemplateTreeHandler } from './handler'
//   import { JthTemplateType } from '../base'
import { fixReactive } from '@renderer/fix'
import { VxSelector } from '@renderer/components'
import VxButton from '@renderer/components/VxButton/VxButton.vue'
import { MVFileController } from '../controller';
import { MVTemplateApply, MVTemplateComponentType, MVTemplateCond, MVTemplateElement, MVTemplateFlowType, MVTemplateHtmlType, MVTemplateLoop, MVTemplateNode, MVTemplateScope, MVTemplateText } from '@renderer/mods/mutv-template';
import { nanoid } from 'nanoid';


const createBlankNode = (type: string) => {
  if (type === MVTemplateComponentType.Apply) {
    const data: MVTemplateApply = {
      type, id: nanoid(), isLeaf: true, rootId: ''
    }
    return data
  }
  if (type === MVTemplateComponentType.Scope) {
    const data: MVTemplateScope = {
      type, id: nanoid(), isLeaf: false, bind: { '_VALUE_GENERATOR_REFERENCE_': 'empty_object' }
    }
    return data
  }

  if (type === MVTemplateHtmlType.Element) {
    const data: MVTemplateElement = {
      type, id: nanoid(), isLeaf: false, tagName: 'div', attrs: []
    }
    return data
  }

  if (type === MVTemplateHtmlType.Text) {
    const data: MVTemplateText = {
      type, id: nanoid(), isLeaf: true, text: { '_VALUE_GENERATOR_REFERENCE_': 'blank_string' }
    }
    return data
  }


  if (type === MVTemplateFlowType.Loop) {
    const data: MVTemplateLoop = {
      type, id: nanoid(), isLeaf: false, valueField: 'value', indexField: 'index',
      loopValue: { '_VALUE_GENERATOR_REFERENCE_': 'empty_array' }
    }
    return data
  }

  if (type === MVTemplateFlowType.Cond) {
    const data: MVTemplateCond = {
      type, id: nanoid(), isLeaf: false,
      test: { '_VALUE_GENERATOR_REFERENCE_': 'true' }
    }
    return data
  }

  throw new Error('')
}

const props = defineProps<{
  controller: MVFileController,
  template: MVTemplateNode
}>()

const changeType = fixReactive(
  new (class {
    currentType: { key: string; label: string } | null = null

    options: { key: string; label: string }[] = [
      { key: MVTemplateComponentType.Apply, label: 'APPLY' },
      { key: MVTemplateComponentType.Scope, label: 'Scope' },
      { key: MVTemplateHtmlType.Element, label: 'Element' },
      { key: MVTemplateHtmlType.Text, label: 'Text' },
      { key: MVTemplateFlowType.Loop, label: 'Loop' },
      { key: MVTemplateFlowType.Cond, label: 'Cond' },
    ]

    change() {
      const type = props.template.type
      this.currentType = this.options.find((v) => v.key === type) ?? null
    }

    cancel() {
      this.currentType = null
    }

    submit() {
      if (!this.currentType) return
      if (this.currentType.key === props.template.type) return
      const node = createBlankNode(this.currentType.key)
      props.controller.template.replaceNode(props.template.id, node)
    }
  })()
)
</script>

<style scoped lang="scss">
.mv-template__sub-title {
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

.mv-template__type {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 8px;

  .mv-template__type-text {
    flex: 1 1 0;
    line-height: 32px;
    width: 0;
  }

  .mv-template__type-btns {
    flex: 0 0 auto;
  }

  .mv-template__type-selector {
    flex: 1 1 0;
    width: 0;
  }

}
</style>