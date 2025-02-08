<script lang="ts" setup>
// import { computed } from 'vue';
import { type ToolBarHandler } from './handler'
import { VxIcon } from '@renderer/components/VxIcon'

const props = defineProps<{
  handler: ToolBarHandler
}>()
</script>

<template>
  <div class="page-tool-bar">
    <div
      class="page-tool-bar__item"
      v-for="(v, i) in props.handler.list"
      :key="v.type === 'button' ? v.key : i"
    >
      <div
        v-if="v.type == 'button'"
        class="page-tool-bar__button"
        @click="(e) => props.handler.emit(v.key, e)"
      >
        <VxIcon class="page-tool-bar__button-icon" v-if="v.icon" :name="v.icon"></VxIcon>
        {{ v.label }}
      </div>
      <div v-else-if="v.type == 'divide'" class="page-tool-bar__divide"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-tool-bar {
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.page-tool-bar__item {
  flex: 0 0 auto;
  margin-left: 8px;
}

.page-tool-bar__button {
  height: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }

  .page-tool-bar__button-icon {
    margin-left: -4px;
  }
}
</style>
