<template>
  <div class="page-jth-template">
    <ModalStack :handler="modal"></ModalStack>
    <div class="page-jth-template__toolbar">
      <ToolBar :handler="toolbar"></ToolBar>
    </div>

    <div class="page-jth-template__content">
      <div class="page-jth-template__component" v-for="tree in trees" :key="tree.id"
        :data-current="tree.id === current">

        <ComponentHeader :active="() => focus(tree.id)" :actived="tree.id === current" :mod="controller.component" :component="tree.component">
        </ComponentHeader>

        <div class="page-jth-template__component-content">
          <ComponentBody :handler="genBodyHandler(tree.component)"></ComponentBody>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ToolBarBuilder, ToolBar } from '@renderer/widgets/ToolBar'
import { nanoid } from 'nanoid'
import { TemplateTreeHandler } from './view/template/handler'
import type { PageJthTemplate } from '.'
import { JthComponent, JthRenderController, JthStateController } from './view/base'
import { fixReactive } from '@renderer/fix'
import ComponentHeader from './view/component/ComponentHeader.vue'
import ComponentBody, { ComponentBodyHandler } from './view/component/ComponentBody.vue'
import { ModalStack } from '@renderer/widgets/ModalStack/index'
import { PageJthBase } from './PageBase'

const props = defineProps<{
  page: PageJthTemplate
}>()

const current = ref<string | null>(null)
const controller = computed(() => props.page.controller)
const renderer = computed(() => props.page.renderer)
const modal = computed(()=>{
  return PageJthBase.modal(props.page.controller)
})

function focus(id: string) {
  if (current.value === id) current.value = null
  else current.value = id
}

const toolbar = ToolBarBuilder.create()
  .button('addComponent', '添加组件', async () => {
    const id = await controller.value.newComponent('Component-' + nanoid())
    console.log(id)
    focus(id)
  })
  .button('reload', '从文件中刷新', async () => {
    await props.page.reload()
  })
  .button('save', '保存', async () => {
    await props.page.save()
  })
  .build()

const trees = computed(() => {
  const components = controller.value.allComponents()
  return components.map(
    (c) => TemplateTreeHandler.all.get(c) ?? TemplateTreeHandler.create(controller.value, c)
  )
})

watch(trees,()=>{
  if(current.value) return 
  const first = trees.value[0]
  if(!first) return 
  focus(first.id)
})

const genBodyHandler = (component:JthComponent)=>{
    return fixReactive(new class extends ComponentBodyHandler {
        controler: JthStateController = controller.value
        component: JthComponent = component
        renderer: JthRenderController = renderer.value
    })
} 

</script>

<style lang="scss" scoped>
.page-jth-template {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .page-jth-template__toolbar {
    flex: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .page-jth-template__content {
    flex: 1 1 0;
    height: 0;
    display: flex;
    flex-direction: column;

    .page-jth-template__component-header {
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

    .page-jth-template__component-content {
      flex: 1 1 0;
      height: 0;
      overflow: hidden;
    }

    .page-jth-template__component {
      flex: 0 0 auto;
      transition: all 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
    }

    .page-jth-template__component[data-current='true'] {
      flex: 1 1 0;

      .page-jth-template__component-header {
        opacity: 1;
        font-weight: 800;
      }

      .page-jth-template__component-content {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
