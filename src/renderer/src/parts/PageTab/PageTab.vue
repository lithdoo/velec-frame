<script setup lang="ts">
import { tabControl } from './tab'
import { computed, onMounted, ref } from 'vue'
import { ElementInject, VxIcon } from '@renderer/components'

const tabList = ref<HTMLElement | null>(null)

onMounted(() => {
  if (tabList.value) {
    const item = tabList.value
    item.addEventListener('wheel', function (e) {
      if (e.deltaY > 0) item.scrollLeft += 50
      else item.scrollLeft -= 50
    })
  }
})

const currentPage = computed(() => {
  return tabControl.currentPage()
})

const activeTab = (tabId: string) => {
  if (tabControl.currentId == tabId) return
  tabControl.active(tabId)
}
</script>

<template>
  <div class="frame-task-tab">
    <div class="frame-task-tab__tab-list" ref="tabList">
      <div
        @mousedown="() => activeTab(page.tabId)"
        v-for="page in tabControl.list"
        :class="[
          'frame-task-tab__tab-item',
          tabControl.currentId === page.tabId ? 'frame-task-tab__tab-item--actived' : ''
        ]"
      >
        <VxIcon :name="page.icon"></VxIcon>
        <div class="frame-task-tab__tab-item-title">{{ page.title || `[无标题]` }}</div>
        <VxIcon :name="'clear'" @click.native="tabControl.removeTab(page.tabId)"></VxIcon>
      </div>
    </div>
    <div
      class="frame-task-tab__page-container"
      v-for="page in tabControl.list"
      v-show="page === currentPage"
    >
      <ElementInject :target="page.element" :style="{ height: '100%' }" />
    </div>
  </div>
</template>

<style>
:root {
  --task-tab-border: 1px solid rgba(255, 255, 255, 0.1);
  --task-tab-list-border: 1px solid rgba(255, 255, 255, 0.1);
  --task-tab-list-height: 36px;
  --task-tab-item-border-right: 1px solid rgba(255, 255, 255, 0.1);
  --task-tab-item-border-top: 1px solid transparent;
}
</style>

<style lang="scss" scoped>
.frame-task-tab {
  --task-tab-item-border-top-selected: 1px solid #66ccff;
  --task-tab-item-padding: 0 12px 0 8px;
  height: 100%;
  border-top: var(--task-tab-border);

  display: flex;
  flex-direction: column;

  .frame-task-tab__tab-list {
    height: var(--task-tab-list-height);
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    border-bottom: var(--task-tab-list-border);
    overflow-y: auto;
    -ms-overflow-style: none;
    /* Internet Explorer 10+ */
    scrollbar-width: none;

    /* Firefox */
    &::-webkit-scrollbar {
      display: none;
      /* Safari and Chrome */
    }
  }

  .frame-task-tab__tab-item {
    border-right: var(--task-tab-item-border-right);
    border-top: var(--task-tab-item-border-top);
    display: flex;
    align-items: center;
    padding: var(--task-tab-item-padding);
    flex: 0 0 auto;

    &.frame-task-tab__tab-item--actived {
      border-top: var(--task-tab-item-border-top-selected);
    }
  }

  .frame-task-tab__page-container {
    flex: 1 1 0;
    height: 0;
    overflow: hidden;
  }
}
</style>
