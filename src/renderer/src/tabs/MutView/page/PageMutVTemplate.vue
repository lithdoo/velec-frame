<script lang="ts" setup>
import { ModalStack } from '@renderer/widgets/ModalStack/index'
import { ToolBarBuilder, ToolBar } from '@renderer/widgets/ToolBar'


import ComponentHead from '../component/ComponentHead.vue'
import ComponentBody from '../component/ComponentBody.vue'
import type { PageMutVTemplate } from './handler';
import { computed, ref } from 'vue';



const props = defineProps<{
  page: PageMutVTemplate
}>()

const controller = computed(() => props.page.controller)
const modal = computed(() => props.page.modal)

const allComponents = computed(() => controller.value.component.allComponents())

const current = ref('')

const toolbar = ToolBarBuilder.create()
  .button('addComponent', '添加组件', async () => {
    let idx = 0
    let keyName = 'new-component'

    while (allComponents.value.find(v => v.keyName === keyName)) {
      idx = idx + 1
      keyName = `new-component-${idx}`
    }

    controller.value.component.addComponent(keyName)
  })
  .button('reload', '从文件中刷新', async () => {
    await props.page.reload()
  })
  .button('save', '保存', async () => {
    await props.page.save()
  })
  .build()

const trees = computed(() => {
  return allComponents.value
})

</script>


<template>
  <div class="page-mutv-template">

    <ModalStack :handler="modal"></ModalStack>
    <div class="page-mutv-template__toolbar">
      <ToolBar :handler="toolbar"></ToolBar>
    </div>


    <div class="page-mutv-template__content">
      <div class="page-mutv-template__component" v-for="tree in trees" :key="tree.rootId"
        :data-current="tree.rootId === current">

        <ComponentHead v-model="current" :component="tree" :controller="controller"></ComponentHead>

        <div class="page-mutv-template__component-content">
          <ComponentBody :component="tree" :controller="controller"></ComponentBody>
        </div>
      </div>
    </div>

  </div>

</template>
<style lang="scss" scoped>
.page-mutv-template {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .page-mutv-template__toolbar {
    flex: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .page-mutv-template__content {
    flex: 1 1 0;
    height: 0;
    display: flex;
    flex-direction: column;

    .page-mutv-template__component-header {
      height: 42px;
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      flex: 0 0 auto;
      opacity: 0.8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0 16px;
      cursor: pointer;
    }

    .page-mutv-template__component-content {
      flex: 1 1 0;
      height: 0;
      overflow: hidden;
    }

    .page-mutv-template__component {
      flex: 0 0 auto;
      transition: all 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
    }

    .page-mutv-template__component[data-current='true'] {
      flex: 1 1 0;

      .page-mutv-template__component-header {
        opacity: 1;
        font-weight: 800;
      }

      .page-mutv-template__component-content {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
