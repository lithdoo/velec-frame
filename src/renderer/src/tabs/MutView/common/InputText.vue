<script lang="ts">
export abstract class InputTextHandler {
    isEdit: boolean = false
    placeholder: string = '请输入'
    minWidth: number = 64
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
            <div class="input-text__text" :style="{ minWidth: handler.minWidth + 'px' }">
                {{ renderVal }}
                <div class="input-text__hover-btns">
                    <VxButton class="input-text__edit-btn" only-icon icon="edit" :click="() => edit()"
                        @click.native.stop></VxButton>
                    <slot name="hover-btn"></slot>
                </div>
            </div>
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
    padding: 0 6px;

    .input-text__text{
        position: relative;
        text-align: center;
        height: 32px;
        // flex: 1 1 auto;
        line-height: 32px;
        padding: 0 10px;
        &:hover .input-text__hover-btns{
            opacity: 1;
        }
    }
    .input-text__hover-btns{
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;
    }

    // .input-text__edit-btn {
    //     opacity: 0;
    //     transition: all 0.3s ease;
    // }

    // &:hover .input-text__edit-btn {
    //     opacity: 1;
    // }
}
</style>