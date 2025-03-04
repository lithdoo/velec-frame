<script lang="ts">
export abstract class InputTextHandler {
    isEdit: boolean = false
    placeholder: string = '请输入'
    abstract text(): string
    validate(_text: string): [boolean, string?] { return [true] }
    abstract submit(text: string): void
    cancel() { this.isEdit = false }
    edit() { this.isEdit = true }
}

</script>

<script setup lang="ts">
import { VxButton, VxInput } from '@renderer/components'
import { computed, ref, watch } from 'vue'


const props = defineProps<{ handler: InputTextHandler }>()

const currentVal = ref('')

const isEdit = computed(() => props.handler.isEdit)

const renderVal = computed(() => props.handler.text())

watch(isEdit, () => {
    if (!isEdit.value) currentVal.value = ''
    else currentVal.value = renderVal.value
})

const edit = () => {
    console.log('edit')
    props.handler.edit()
}
const cancel = () => props.handler.cancel()
const submit = () => {
    const [isContinue] = props.handler.validate(currentVal.value)
    if (isContinue) {
        props.handler.submit(currentVal.value)
        cancel()
    }
}

</script>

<template>
    <div class="input-text">
        <template v-if="!isEdit">
            {{ renderVal }} <VxButton class="input-text__edit-btn" only-icon icon="edit" :click="() => edit()" @click.native.stop></VxButton>
        </template>
        <template v-else>
            <VxInput class="db-chart-sider__entity-name-editor" @click.native.stop v-model="currentVal"
                :placeholder="handler.placeholder">
                <template #suffix>
                    <VxButton only-icon icon="clear" :click="() => cancel()">
                    </VxButton>
                    <VxButton only-icon icon="done" :click="() => submit()"></VxButton>
                </template>
            </VxInput>
        </template>
    </div>


</template>

<style lang="scss" scoped>
.input-text {
    display: flex;
    align-items: center;
    gap: 6px;

    .input-text__edit-btn{
        opacity: 0;
        transition: all 0.3s ease;
    }
    &:hover .input-text__edit-btn{
        opacity: 1;
    }
}
</style>