<script setup lang="ts">
import { VxButton, VxInput } from '@renderer/components'
import { computed, ref, watch } from 'vue'
import { InputTextHandler } from './InputText.vue';


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
            <div class="input-text__text">
                {{ renderVal }}
            </div>

            <div class="input-text__hover-btns">
                <VxButton class="input-text__edit-btn" only-icon icon="edit" :click="() => edit()" @click.native.stop>
                </VxButton>
                <slot name="hover-btn"></slot>
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

    .input-text__text {
        position: relative;
        height: 32px;
        flex: 1 1 auto;
        line-height: 32px;
    }

    &:hover .input-text__hover-btns {
        opacity: 1;
    }

    .input-text__hover-btns {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        // opacity: 0;
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