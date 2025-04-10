<template>
  <div class="template-field-editor">
    <div class="template-field-editor__value">
      <template v-if="editor.isEdit()">
        <div class="template-field-editor__selector">
          <VxSelector :options="editor.options" v-model="editor.currentValue"></VxSelector>
        </div>

        <div class="template-field-editor__input">
          <template v-if="editor.currentValue?.key === 'eval:js'">
            <VxInput v-model="editor.currentValue.target.content">
              <template #suffix>
                <VxButton only-icon icon="edit" :click="() => editor.codeEditor('javascript')"></VxButton>
                <VxButton only-icon icon="done" :click="() => editor.submitEdit()"></VxButton>
                <VxButton only-icon icon="clear" :click="() => editor.cancelEdit()"></VxButton>
              </template>
            </VxInput>
          </template>

          <template v-if="editor.currentValue?.key === 'json'">
            <VxInput v-model="editor.currentValue.target.content">
              <template #suffix>
                <VxButton only-icon icon="edit" :click="() => editor.codeEditor('json')"></VxButton>
                <VxButton only-icon icon="done" :click="() => editor.submitEdit()"></VxButton>
                <VxButton only-icon icon="clear" :click="() => editor.cancelEdit()"></VxButton>
              </template>
            </VxInput>
          </template>
        </div>
      </template>

      <template v-else>
        <span class="template-field-editor__text-type">{{ type }} : </span>
        <span class="template-field-editor__text-value">{{ content }}</span>

        <div class="template-field-editor__btns template-field-editor__btns--view">
          <VxButton only-icon icon="edit" :click="() => editor.beginEdit()"></VxButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VxSelector, VxInput, VxButton } from '@renderer/components'
import { EvalRef, EvalVal } from '@renderer/mods/mutv-eval';
import { MVFileController } from '../controller';
import { fixReactive } from '@renderer/fix';
import { TextEditorOption } from '@renderer/widgets/ModalStack';

const props = defineProps<{
  valRef: EvalRef,
  controller: MVFileController,
  onchange: (val: EvalRef) => void
}>()

const type = computed(() => {
  const val = props.controller.store.get(props.valRef)
  if (val) return val.type
  else return '<unknown>'
})

const content = computed(() => {
  const val = props.controller.store.get(props.valRef)
  if (val) return val.content.trim()
  else return '<unknown>'
})


const editor = computed(() => {
  return fixReactive(new class {
    isEdit() { return !!this.currentValue }
    options: { key: EvalVal['type']; label: string; target: EvalVal }[] = []
    oldValue: EvalVal | null = null
    currentValue: { key: EvalVal['type']; label: string; target: EvalVal } | null = null
    beginEdit() {
      const old = props.controller.store.get(props.valRef)
      this.oldValue = old
      this.options = [
        {
          key: 'json',
          label: 'JSON',
          target: old.type === 'json'
            ? JSON.parse(JSON.stringify(old))
            : { type: 'json', content: '{}' }
        },
        {
          key: 'eval:js',
          label: 'Javascript',
          target: old.type === 'eval:js'
            ? JSON.parse(JSON.stringify(old))
            : { type: 'eval:js', content: 'return {}' }
        }
      ]

      this.currentValue = this.options.find((o) => o.key === old.type) ?? null
    }

    codeEditor(lang:string){
      const modal = MVFileController.modal(props.controller)
      modal.textEditor({
        lang,
        content: this.currentValue?.target.content ?? '',
        title: '编辑',
        submit:(content:string)=>{
          if(!this.currentValue) return 
          this.currentValue.target.content = content
        }
      })
    }
    submitEdit() {
      if (!this.currentValue) return this.cancelEdit()
      if (this.oldValue
        && this.oldValue.content === this.currentValue.target.content
        && this.oldValue.type === this.currentValue.target.type
      ) return this.cancelEdit()

      const newValRef = props.controller.store.add(this.currentValue.target)
      props.onchange(newValRef)
      this.cancelEdit()

      
    }
    cancelEdit() {
      this.currentValue = null
      this.options = []
    }
  })
})

// const validate = () => {

// }

// const type = (type: ValueGenerator['type']) => {
//   if (type === 'static') return 'static'
//   if (type === 'dynamic:getter') return 'getter'
//   if (type === 'dynamic:script') return 'scrpit'
//   return new Error('unknown type')
// }

// const generator = computed(() => {
//   const vg = props.editor.controller.getVG(props.value)
//   if (!vg) throw new Error('unknown type')
//   return vg
// })

// const value = computed(() => {
//   const vg = generator.value
//   if (vg.type === 'static') {
//     return vg.json
//   } else if (vg.type === 'dynamic:getter') {
//     return vg.getter.join(',')
//   } else if (vg.type === 'dynamic:script') {
//     return vg.script
//   }
//   throw new Error('unknown type')
// })

// const isEdit = computed(() => {
//   return props.editor.target === props.value
// })

// const options = computed(() => {
//   return props.editor.options
// })

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
  }

  .template-field-editor__name-edit {
    flex: 1 1 auto;
  }
}
</style>
