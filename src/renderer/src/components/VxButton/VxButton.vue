<template>
  <div class="page-tool-bar__button" :data-only-icon="onlyIcon" @click="(e) => click?.(e)">
    <VxIcon class="page-tool-bar__button-icon" v-if="icon" :name="icon"></VxIcon>
    <slot v-if="!onlyIcon"></slot>
  </div>
</template>

<script setup lang="ts">
import { VxIcon } from '../VxIcon'

defineProps<{
  icon?: string
  onlyIcon?: boolean
  click?: (e: MouseEvent) => void
}>()
</script>

<style lang="scss" scoped>
.page-tool-bar__button {
  height: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;

  &[data-only-icon='true'] .page-tool-bar__button-icon {
    margin-left: 0;
  }

  &:hover {
    background-color: rgba($color: #fff, $alpha: 0.2);
  }

  .page-tool-bar__button-icon {
    margin-left: -4px;
  }
}
</style>
