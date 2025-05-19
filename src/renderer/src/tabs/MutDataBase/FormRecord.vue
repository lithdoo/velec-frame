<script lang="ts">

export interface FormRecordProp {
  icon?: string | VNode,
  refKey?: string,
  disabled: boolean
  tableInfo: TableInfo,
  textEnum: { [key: string]: string[] }
  currentEdit: { [key: string]: number | string | boolean | [] | [string] | undefined }
  onSubmit: (data: any) => void
  onClose: () => void
  onValidate: () => boolean
}


export abstract class FromRecordBinder implements FormRecordProp {

  disabled: boolean = false
  refKey?: string | undefined = undefined
  icon?: string | VNode<RendererNode, RendererElement, { [key: string]: any; }> | undefined = undefined
  textEnum: { [key: string]: string[]; } = {}
  data: { [key: string]: string[]; } = {}
  currentEdit = {}
  required: string[] = []
  onSubmit = (data: DataRecord) => {
    this.submit(data)
  }
  onClose = () => { this.close() }

  onValidate = () => this.validate()

  constructor(
    public tableInfo: TableInfo
  ) { }

  submit(data: DataRecord) {
    this.refKey = data._ref_key_
  }

  validate() {
    const keyName = this.required.find(keyName => {
      const field = this.tableInfo.fields.find(v => v.field_name === keyName)
      if (!field) return false
      if (typeof this.currentEdit[keyName] === 'undefined') {
        Msg.warning(`"${keyName}" 是必填字段！`)
        return true
      }
      if(this.currentEdit[keyName] === '' && field.type === DataFieldType.String){
        Msg.warning(`"${keyName}" 是必填字段！`)
        return true
      }
      if((this.currentEdit[keyName]?.length === 0) && field.type === DataFieldType.RefId){
        Msg.warning(`"${keyName}" 是必填字段！`)
        return true
      }
      return false
    })
    if(keyName) return false
    else return true
  }

  abstract close(): void
}

</script>



<script setup lang="ts">
import { ElementInject } from '@renderer/components';
import VxInput from '@renderer/components/VxInput/VxInput.vue';
import VxSelector from '@renderer/components/VxInput/VxSelector.vue';
import { MutDBCRecordValue } from '@renderer/mods/mutd/json';
import { DataFieldType, DataRecord, FieldInfo, TableInfo } from '@renderer/mods/mutd/struc';
import { Msg } from '@renderer/utils';
import { nanoid } from 'nanoid';

import { ref, RendererElement, RendererNode, VNode } from 'vue';

const props = defineProps<FormRecordProp>()


const value = (field: FieldInfo): { key: string, label: string } | undefined => {
  const type = field.type
  const value = props.currentEdit[field.field_name]
  if (type === DataFieldType.Boolean) {
    if (value === undefined) return undefined
    else return value ? { key: 'true', label: 'true' } : { key: 'false', label: 'false' }
  } else if (type === DataFieldType.Number) {
    return { key: value, label: value } as any
  } else if (type === DataFieldType.String) {
    return { key: value, label: value } as any
  }else if (type === DataFieldType.RefId) {
    return { key: `[${value?.[0]??''}]`, label:  `[${value?.[0]??''}]` } as any
  }
  return {
    key: props.currentEdit[field.field_name] as any,
    label: props.currentEdit[field.field_name] as any
  }
}

const setValue = (field: FieldInfo, value: string) => {
  const type = field.type
  if (type === DataFieldType.Boolean) {
    props.currentEdit[field.field_name] = value === 'true'
  } else if (type === DataFieldType.Number) {
    props.currentEdit[field.field_name] = Number(value)
  } else if (type === DataFieldType.String) {
    props.currentEdit[field.field_name] = value
  }
}

const submit = () => {
  const data = MutDBCRecordValue.pre(props.tableInfo.fields, [{
    ...props.currentEdit,
    _ref_key_: props.refKey ?? nanoid()
  }])[0]
  console.log(data)
  if(props.onValidate()){
    props.onSubmit(data)
  }else{
    throw new Error('todo!!!')
  }
}

const close = () => {
  props.onClose()
}

</script>

<template>
  <div class="confirm-modal__inner">
    <div class="confirm-modal__header">
      <div class="confirm-modal__icon" v-if="icon">
        <template v-if="typeof icon === 'string'">
          <VxIcon :name="icon"></VxIcon>
        </template>
        <template v-else>
          <ElementInject :target="icon" />
        </template>
      </div>
      <div class="confirm-modal__title">{{ tableInfo.table_name }}
        <span v-if="refKey">{{ `< 编辑:${refKey}>` }}</span>
        <span v-else>{{ `< 新建>` }}</span>
      </div>
    </div>
    <div class="confirm-modal__body">
      <div v-for="field in tableInfo.fields" class="mut-db-form__row">
        <div class="mut-db-form__row-title"> {{ field.field_name }} < {{ field.is_key ? '*' : '' }}{{ field.type }}>
        </div>
        <div class="mut-db-form__row-input">
          <template v-if="field.type === DataFieldType.Boolean">
            <VxSelector :model-value="value(field)"
              :options="[{ label: 'true', key: 'true' }, { label: 'false', key: 'false' }]"
              @update:model-value="value => setValue(field, value?.key ?? '')">
            </VxSelector>
          </template>
          <template v-else-if="field.type === DataFieldType.String && textEnum[field.field_name]">
            <VxSelector :model-value="value(field)"
              :options="textEnum[field.field_name].map(key => ({ key, label: key }))"
              @update:model-value="value => setValue(field, value?.key ?? '')">
            </VxSelector>
          </template>

          <template v-else-if="field.type === DataFieldType.String">
            <VxInput :model-value="value(field)?.key" @update:model-value="value => setValue(field, value ?? '')">
            </VxInput>
          </template>
          <template v-else-if="field.type === DataFieldType.Number">
            <VxInput :model-value="value(field)?.key" @update:model-value="value => setValue(field, value ?? '')">
            </VxInput>
          </template>
          <template v-else-if="field.type === DataFieldType.RefId">
            <VxInput :model-value="value(field)?.key" :disabled="true"></VxInput>
          </template>
        </div>
      </div>
    </div>
    <div class="confirm-modal__footer">
      <div class="confirm-modal__buttons">
        <div class="confirm-modal__button" data-type='link' @click="() => submit()">更新</div>
      </div>
      <div class="confirm-modal__buttons">
        <div class="confirm-modal__button" data-type='link' @click="() => close()">关闭</div>
        <div class="confirm-modal__button" data-type='primary' @click="() => ((submit(), close()))">
          更新并关闭
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.mut-db-form__row {
  display: flex;
  flex-direction: row;
  padding: 0 12px;
  height: 36px;
  align-items: center;
  margin-top: 6px;

  .mut-db-form__row-title {
    flex: 0 0 auto;
    width: 200px;
  }

  .mut-db-form__row-input {
    flex: 1 1 0;
    width: 0;
  }
}

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