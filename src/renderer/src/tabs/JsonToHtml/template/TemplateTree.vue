<template>
  <div class="template-tree">
    <div class="template-tree__tree">
      <FlatTree :handler="tree.flatTree">
        <template #item="{ item }">
          <div>{{ item.templateData.type }} -- {{ tree.treeText(item.templateData) }}</div>
        </template>
      </FlatTree>
      <div :data-show="showLineTree" class="template-tree__line-tree">
        <FlatLineTree :handler="tree.flatTree">
          <template #item="{ item }">
            <span style="color:#666">{{ item.templateData.type }}</span>
          </template>
        </FlatLineTree>
      </div>
      <div @click="() => showLineTree = !showLineTree" tabindex="-1" class="template-tree__line-tree-togger"></div>
    </div>
    <div class="template-tree__detail" v-if="tree.showDetailTemplateId">
      <TemplateDetail :model="tree.controller" :template-id="tree.showDetailTemplateId" :tree="tree"></TemplateDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TemplateTreeHandler } from './handler'
import { FlatTree, FlatLineTree } from '@renderer/widgets/FlatTree'
import TemplateDetail from './TemplateDetail.vue'
import { ref } from 'vue';


const showLineTree = ref(false)



// const props =
defineProps<{ tree: TemplateTreeHandler }>()
</script>

<style scoped lang="scss">
.template-tree {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;

  .template-tree__tree {
    flex: 1 1 0;
    width: 0;
    height: 100%;
    overflow: auto;
    position: relative;
  }

  .template-tree__line-tree {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: antiquewhite;

    &[data-show="false"] {
      display: none;
    }
  }

  .template-tree__line-tree-togger {
    position: absolute;
    right: 36px;
    bottom: 36px;
    height: 36px;
    width: 36px;
    background-color: aqua;
    border-radius: 50%;
    cursor: pointer;
    z-index: 999;
    transition: all 0.3s ease-in-out;

    &:active {
      background-color: antiquewhite;
    }
  }

  .template-tree__detail {
    flex: 0 0 360px;
    width: 360px;
    // border-left: 1px solid #ccc
    background-color: rgb(24, 24, 24);
    box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
  }
}
</style>
