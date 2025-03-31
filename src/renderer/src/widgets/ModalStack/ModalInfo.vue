<script lang="ts">



export interface ModalInfoOption {
  key: string
  title: string | VNode
  icon?: string | VNode
  content: VNode | HTMLElement
}

</script>


<script setup lang="ts">
import {  VNode } from 'vue'
// import { VxIcon } from '@renderer/components'
import { ElementInject } from '@renderer/components'

defineProps<{ info: ModalInfoOption }>()
</script>

<template>
  <!-- <div class="confirm-modal" v-if="info"> -->
    <div class="confirm-modal__inner">
      <div class="confirm-modal__header">
        <div class="confirm-modal__icon" v-if="info.icon">
          <template v-if="typeof info.icon === 'string'">
            <VxIcon :name="info.icon"></VxIcon>
          </template>
          <template v-else>
            <ElementInject :target="info.icon" />
          </template>
        </div>
        <div class="confirm-modal__title">{{ info.title }}</div>
      </div>
      <div class="confirm-modal__body">
        <ElementInject :target="info.content" />
      </div>
    </div>
    <!-- <div class="confirm-modal__extra" v-for="(_, i) in new Array(extraLenth).fill(0)" :key="i"></div> -->
  <!-- </div>
  </div> -->
</template>

<style lang="scss" scoped>


.confirm-modal {
  position: absolute;
  z-index: 100;
  background: #1f1f1f;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.confirm-modal {
  background-color: #1f1f1f;
  background-clip: padding-box;
  border: 0;
  border-radius: 8px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .confirm-modal__header {
    padding: 20px 24px;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    flex-direction: column;

    .confirm-modal__icon {
      font-size: 36px;
    }

    .confirm-modal__title {
      margin: 0;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 600;
      font-size: 18px;
      line-height: 1.5;
      word-wrap: break-word;
    }
  }

  .confirm-modal__body {
    padding: 20px 36px;
    color: rgba(255, 255, 255, 0.65);
  }
}

</style>
