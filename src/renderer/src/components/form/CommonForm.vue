<script lang="ts" setup>
import { computed, watch } from 'vue';
import { CommonFormHandler, Field, FileUrlField, isFileUrlField, isOptionField, isSwitchField, isTextField } from './handler';
import {
    Form as AntForm,
    FormItem as AntFormItem,
    Input as AntInput,
    Select as AntSelect,
    SelectOption as AntSelectOption,
    Switch as AntSwitch
} from 'ant-design-vue'


const props = defineProps<{
    handler: CommonFormHandler<any>
}>()

const handler = computed(() => props.handler)

const getValidateMessage = (field: Field<any, unknown>) => {
    return handler.value.validateMesssage.get(field) ?? undefined
}

const selectFile = async (field: FileUrlField<string>) => {
    const root = await window.explorerApi.selectFile({ extensions: [...field.extensions] })
    if (!root) return
    field.value = root
}

const value = computed(() => {
    return handler.value.value()
})

watch(value,()=>{
    handler.value.emitValueChange()
})


</script>


<template>
    <div class="common-form">
        <AntForm layout="vertical" size="small">
            <template v-for="field in handler.list">
                <AntFormItem v-if="isTextField(field)" :required="field.required" :help="getValidateMessage(field)">
                    <template #label>
                        <div class="common-form__form-item-label">{{ field.title }} :</div>
                    </template>
                    <AntInput v-model:value="field.value" @change="handler.emitValidate(field.keyName)" />
                </AntFormItem>

                <AntFormItem v-if="isOptionField(field)" :required="field.required" :help="getValidateMessage(field)">
                    <template #label>
                        <div class="common-form__form-item-label">{{ field.title }} :</div>
                    </template>
                    <AntSelect v-model:value="field.value" @change="handler.emitValidate(field.keyName)">
                        <AntSelectOption :value="option.key" :key="option.key" v-for="option in field.options">
                            {{ option.title }}
                        </AntSelectOption>
                    </AntSelect>
                </AntFormItem>

                <AntFormItem v-if="isSwitchField(field)" :required="field.required" :help="getValidateMessage(field)">
                    <template #label>
                        <div class="common-form__form-item-label">{{ field.title }} :</div>
                    </template>
                    <AntSwitch v-model:checked="field.value" @change="handler.emitValidate(field.keyName)" />
                </AntFormItem>

                <AntFormItem v-if="isFileUrlField(field)" :required="field.required" :help="getValidateMessage(field)">
                    <template #label>
                        <div class="common-form__form-item-label">{{ field.title }} :</div>
                    </template>
                    <AntInput :value="field.value" :readonly="true" @change="handler.emitValidate(field.keyName)">
                        <template #addonAfter>
                            <div type="primary" :style="{ 'cursor': 'pointer' }" @click="selectFile(field)">选择文件</div>
                        </template>
                    </AntInput>
                </AntFormItem>
            </template>
        </AntForm>
    </div>
</template>


<style lang="scss" scoped>
.common-form {
    padding: 16px;
    max-width: 480px;

    .common-form__form-item-label {
        padding: 0 6px;
    }
}
</style>