<script setup lang="ts">
import { FlatTree } from '@renderer/widgets/FlatTree'
import { VxButton, VxIcon } from '@renderer/components'
import { computed } from 'vue'
import { ActivFileExplorer, ExplorerWrokspace } from '.'
import { ViewModal } from '@renderer/widgets/ViewModal'

const props = defineProps<{
  handler: ActivFileExplorer
}>()

const handler = computed(() => props.handler)

const addWorkspace = () => handler.value.addExplorerWrokspace()
const reload = () => handler.value.reloadCurrentWorkspace()
const wsContextMenu = (ev: MouseEvent, ws: ExplorerWrokspace) => ws.dirContextMenu(ev, ws.rootUrl)
</script>

<template>
  <div class="explorer-sider-panel">
    <ViewModal :handler="handler.modal"></ViewModal>
    <div class="explorer-sider-panel__title">
      <div class="explorer-sider-panel__title-text">资源管理器</div>
      <div class="explorer-sider-panel__title-actions">
        <VxButton only-icon icon="plus" @click="addWorkspace"></VxButton>
        <VxButton only-icon icon="reload" @click="reload"></VxButton>
      </div>
    </div>

    <template v-if="handler.list.length">
      <div class="explorer-sider-panel__workspace" v-for="(ws, idx) in handler.list" :key="idx">
        <div
          class="explorer-sider-panel__workspace-title"
          :title="ws.rootUrl"
          @contextmenu="(ev) => wsContextMenu(ev, ws)"
        >
          <VxIcon class="explorer-sider-panel__workspace-icon" name="home" />
          {{ ws.rootUrl.split('/').pop() }}
        </div>
        <div class="explorer-sider-panel__workspace-tree">
          <FlatTree :handler="ws.tree">
            <template #item="{ item }">
              <div @dblclick="() => handler.fileOpen(item)">
                {{ item.name }}
              </div>
            </template>
          </FlatTree>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
:root {
  --explorer-sider-title-height: 36px;
  --explorer-sider-title-border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  --explorer-sider-title-font-size: 12px;
  --explorer-sider-title-padding-left: 18px;
}
</style>

<style lang="scss" scoped>
.explorer-sider-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .explorer-sider-panel__title {
    height: var(--explorer-sider-title-height);
    border-bottom: var(--explorer-sider-title-border-bottom);
    display: flex;
    align-items: center;
    font-size: var(--explorer-sider-title-font-size);
    padding-left: var(--explorer-sider-title-padding-left);
    flex: 0 0 auto;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .explorer-sider-panel__title-text {
      flex: 1 1 0;
      width: 0;
    }

    .explorer-sider-panel__title-actions {
      flex: 0 0 auto;
      padding: 0 8px;
      display: flex;
      flex-direction: row;
      gap: 4px;
    }
  }

  .explorer-sider-panel__workspace {
    flex: 1 1 0;
    height: 0;
  }

  .explorer-sider-panel__workspace-title {
    font-size: 16px;
    padding: 4px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: bolder;
    background: rgba($color: #fff, $alpha: 0.05);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .explorer-sider-panel__workspace-icon {
    font-size: 18px;
  }
}
</style>
