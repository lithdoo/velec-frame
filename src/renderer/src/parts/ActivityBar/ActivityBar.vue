<script setup lang="ts">
import { VxIcon } from '@renderer/components'
import { siderControl } from '../SideBar'
import { computed } from 'vue'

const list = computed(() => siderControl.list)
const currentId = computed(() => siderControl.currentId)
const active = (id: string) => siderControl.active(id === siderControl.currentId ? null : id)
</script>

<template>
  <ul class="frame-activity-bar">
    <li
      v-for="panel in list"
      :key="panel.panelId"
      @click="() => active(panel.panelId)"
      :class="[
        'frame-activity-bar__item',
        currentId === panel.panelId ? 'frame-activity-bar__item--actived' : ''
      ]"
    >
      <VxIcon :name="panel.icon"></VxIcon>
    </li>
  </ul>
</template>

<style>
:root {
  --activity-bar-width: 48px;
  --activity-bar-item-height: 48px;
  --activity-bar-icon-size: 24px;
  --activity-bar-border: 1px solid rgba(255, 255, 255, 0.1);
  --activity-bar-icon-opacity: 0.3;
}
</style>

<style scoped lang="scss">
.frame-activity-bar {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  width: var(--activity-bar-width);

  font-size: 16px;
  border-top: var(--activity-bar-border);
  border-right: var(--activity-bar-border);
  height: 100%;

  li.frame-activity-bar__item {
    height: var(--activity-bar-item-height);
    width: var(--activity-bar-width);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--activity-bar-icon-size);
    opacity: var(--activity-bar-icon-opacity);

    &.frame-activity-bar__item--actived {
      opacity: 1;
    }
  }
}
</style>
