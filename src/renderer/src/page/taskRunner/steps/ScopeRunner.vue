<template>
    <StepWapper :step="props.step" :runner="runner">
        <div class="scope-runner__fields">
            <div class="scope-runner__field-item" v-for="(val, idx) in fields" :key="idx">
                <template v-if="idx === currentEditIdx">
                    <BtnInput v-model="currentEditText">
                        <template #btns>
                            <VxButton icon="del" only-icon :click="cancelEdit"></VxButton>
                            <VxButton icon="home" only-icon :click="submitEdit"></VxButton>
                        </template>
                    </BtnInput>
                </template>
                <template v-else>
                    <div class="scope-runner__field-item__label">
                        {{ val }}
                        <HoverMask>
                            <VxButton @click="beginEdit(idx)">编辑</VxButton>
                            <VxButton @click="removeField(idx)">删除</VxButton>
                        </HoverMask>
                    </div>
                </template>
            </div>
        </div>

        <div class="scope-runner__btns">
            <VxButton @click="addNewField">添加字段</VxButton>
        </div>
    </StepWapper>
</template>

<script setup lang="ts">
import { ScopeDataRunnerStep } from '@common/runnerExt';
import StepWapper from '../common/StepWapper.vue'
import { HoverMask, VxButton } from '@renderer/components/base/VxButton'
import { BtnInput } from '@renderer/components/base/BtnInput'
import { computed, ref } from 'vue';
import type { RunnnerModel } from '../runner';

const props = defineProps<{
    step: ScopeDataRunnerStep,
    runner: RunnnerModel
}>()

const fields = computed(() => {
    return props.step.option.fields
})

const currentEditIdx = ref(-1)
const currentEditText = ref('')


const addNewField = () => {
    cancelEdit()
    fields.value.push('')
    beginEdit(fields.value.length - 1, false)
}
const removeField = (idx: number) => {
    fields.value.splice(idx, 1)
    cancelEdit()
}


const beginEdit = (idx: number, clear = true) => {
    if (clear) cancelEdit()
    currentEditIdx.value = idx
    currentEditText.value = fields.value[idx] ?? ''
}

const submitEdit = async () => {
    if (currentEditIdx.value === -1) return
    const text = currentEditText.value
    const idx = currentEditIdx.value
    if (!text) return
    const same = fields.value.findIndex((v, i) => {
        if (i === idx) return
        return v === text
    })

    if (same >= 0) {
        return
    }

    fields.value[currentEditIdx.value] = text
    currentEditIdx.value = -1
    currentEditText.value = ''
}

const cancelEdit = () => {
    props.step.option.fields = props.step.option.fields.filter(v => !!v)
    if (currentEditIdx.value === -1) return
    currentEditIdx.value = -1
    currentEditText.value = ''
}

</script>

<style lang="scss" scoped>
.scope-runner__fields {
    display: flex;
    flex-direction: row;
    gap: 8px;
    padding: 8px;

    .scope-runner__field-item {
        flex: 0 0 auto;
    }
}


.scope-runner__field-item__label {
    min-width: 108px;
    min-height: 32px;
    text-align: center;
    border: 1px solid #6cf;
    line-height: 30px;
    position: relative;

    .scope-runner__field-item-btns {
        display: none;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 4px;
        transition: all 0.3s ease-in-out;
    }

    &:hover .scope-runner__field-item-btns {
        display: flex;
    }
}
</style>
