<template>
  <div class="template-field-editor">
    <div class="template-field-editor__name">
      <template v-if="isEdit">
        <div class="template-field-editor__name-edit">
          <VxInput v-model="editor.currentName"></VxInput>
        </div>
        <div class="template-field-editor__btns">
          <VxButton only-icon icon="done" :click="submitEdit"></VxButton>
          <VxButton only-icon icon="clear" :click="cancelEdit"></VxButton>
        </div>
      </template>
      <template v-else>
        <div class="template-field-editor__name-text">-- {{ field.name }} --</div>
        <div class="template-field-editor__btns template-field-editor__btns--view">
          <VxButton only-icon icon="edit" :click="beginEdit"></VxButton>
        </div>
      </template>
    </div>
    <div class="template-field-editor__value">
      <template v-if="isEdit">
        <div class="template-field-editor__selector">
          <VxSelector :options="options" v-model="editor.currentValue"></VxSelector>
        </div>

        <div class="template-field-editor__input">
          <template v-if="editor.currentValue?.target.type === 'dynamic:script'">
            <VxInput v-model="editor.currentValue.target.script"></VxInput>
          </template>

          <template v-if="editor.currentValue?.target.type === 'static'">
            <VxInput v-model="editor.currentValue.target.json"></VxInput>
          </template>
        </div>
      </template>

      <template v-else>
        <span class="template-field-editor__text-type">[{{ type(generator.type) }}] </span>
        <span class="template-field-editor__text-value">{{ value }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ValueField, ValueGenerator } from '../base'
import { VxSelector, VxInput, VxButton } from '@renderer/components'
import { FieldEditorHandler } from './handler'

const props = defineProps<{
  field: ValueField
  editor: FieldEditorHandler
}>()

const beginEdit = () => {
  props.editor.beginEdit(props.field)
}

const cancelEdit = () => {
  props.editor.cancelEdit()
}

const submitEdit = () => {
  props.editor.submitEdit()
}

const type = (type: ValueGenerator['type']) => {
  if (type === 'static') return 'static'
  if (type === 'dynamic:getter') return 'getter'
  if (type === 'dynamic:script') return 'scrpit'
  return new Error('unknown type')
}

const generator = computed(() => {
  const vg = props.editor.controller.getVG(props.field.value)
  if (!vg) throw new Error('unknown type')
  return vg
})

const value = computed(() => {
  const vg = generator.value
  if (vg.type === 'static') {
    return vg.json
  } else if (vg.type === 'dynamic:getter') {
    return vg.getter.join(',')
  } else if (vg.type === 'dynamic:script') {
    return vg.script
  }
  throw new Error('unknown type')
})

const isEdit = computed(() => {
  return props.editor.target === props.field
})

const options = computed(() => {
  return props.editor.options
})

// const current = computed(() => {
//     return props.editor.currentValue
// })
</script>

<style lang="scss" scoped>
.template-field-editor {
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);

    .template-field-editor__btns--view {
      width: auto;
    }
  }

  padding: 4px 0;

  .template-field-editor__btns--view {
    width: 0;
  }
}

.template-field-editor__value {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  min-height: 32px;

  .template-field-editor__text-type {
    flex: 0 0 auto;
  }

  .template-field-editor__text-value {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 4px;
  }

  .template-field-editor__selector {
    flex: 0 0 auto;
  }

  .template-field-editor__input {
    flex: 1 1 0;
    width: 0;
    margin-left: 8px;
  }

  .template-field-editor__input_btns {
    flex: 0 0 auto;
  }
}

.template-field-editor__name {
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  min-height: 32px;
  margin-bottom: 4px;

  .template-field-editor__btns {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .template-field-editor__name-text {
    flex: 1 1 auto;
    font-weight: bolder;
  }

  .template-field-editor__name-edit {
    flex: 1 1 auto;
  }
}
</style>
