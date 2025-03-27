<script lang="ts">



export interface ModalEditorOption {
  key: string
  title: string | VNode
  icon?: string | VNode
  text: TextEditorHandler,
  close():void
  submit():void
}

</script>


<script setup lang="ts">
import { VNode } from 'vue'
// import { VxIcon } from '@renderer/components'
import { ElementInject } from '@renderer/components'
import { TextEditorHandler, TextEditor } from '../TextEditor'

 defineProps<{ option: ModalEditorOption }>()
</script>

<template>
  <div class="confirm-modal__inner">
    <div class="confirm-modal__header">
      <div class="confirm-modal__icon" v-if="option.icon">
        <template v-if="typeof option.icon === 'string'">
          <VxIcon :name="option.icon"></VxIcon>
        </template>
        <template v-else>
          <ElementInject :target="option.icon" />
        </template>
      </div>
      <div class="confirm-modal__title">{{ option.title }}</div>
    </div>
    <div class="confirm-modal__body">
      <!-- <ElementInject :target="info.content" /> -->
      <TextEditor :handler="option.text"></TextEditor>
    </div>
    <div class="confirm-modal__footer">
      <div class="confirm-modal__buttons">
        <div class="confirm-modal__button" data-type='link' @click="()=>option.submit()">更新</div>
      </div>
      <div class="confirm-modal__buttons">
        <div class="confirm-modal__button" data-type='link' @click="()=>option.close()">关闭</div>
        <div class="confirm-modal__button" data-type='primary'@click="()=>((option.submit(),option.close()))">更新并关闭</div>
      </div>
    </div>
  </div>
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

.confirm-modal__inner {
  height: 400px;
  width: 600px;
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

  .confirm-modal__inner {
    height: 400px;
    width: 600px;
    display: flex;
    flex-direction: column;
  }

  .confirm-modal__header {
    padding: 20px 24px;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 0 0 auto;

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
    padding: 2px;
    flex: 1 1 0;
    color: rgba(255, 255, 255, 0.65);
  }

  .confirm-modal__footer {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    padding: 20px 36px;
    // padding-top: 8px;

    justify-content: space-between;

    .confirm-modal__buttons {
      flex: 0 0 auto;
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;

      .confirm-modal__button {
        border-width: 1px;
        border-style: solid;
        border-color: #fff;
        border-radius: 2px;
        height: 32px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        min-width: 96px;
        padding: 0 16px;
        cursor: pointer;

        &[data-type='primary'] {
          background-color: #66ccff;
          border-color: #66ccff;
          color: #fff;

          &:hover {
            opacity: 0.8;
          }
        }

        &[data-type='danger'] {
          background-color: #b55353;
          border-color: #b55353;
          color: #fff;
          transform: translateY(1px);

          &:hover {
            opacity: 0.8;
          }
        }

        &[data-type='link'] {
          background-color: transparent;
          border-color: transparent;
          color: #fff;

          &:hover {
            opacity: 0.8;
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>
