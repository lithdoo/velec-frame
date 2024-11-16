<template>
    <div class="step-wapper">
        <div class="step-wapper__inner">
            <div class="step-wapper__id">

                <template v-if="editValue !== null">
                    <BtnInput v-model="editValue">
                        <template #btns>
                            <VxButton icon="del" only-icon :click="cancelEdit"></VxButton>
                            <VxButton icon="home" only-icon :click="submitEdit"></VxButton>
                        </template>
                    </BtnInput>
                </template>
                <template v-else>
                    <div class="step-wapper__id-text">
                        {{ stepCommont || '未命名 STEP' }}
                        <HoverMask>
                            <VxButton icon="del" :click="() => remove()">删除</VxButton>
                            <VxButton icon="del" :click="() => beginEdit()">修改</VxButton>
                        </HoverMask>
                    </div>
                </template>
                <div class="step-wapper__id-type">
                    [ {{ typeName }} ]：{{ step.output.toLocaleUpperCase() }}
                </div>
            </div>
            <div class="step-wapper__content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { isJsonDataRunnerStep, isNodeJsRunnerStep, isScopeDataRunnerStep, isSqliteRunnerStep, RunnerTaskStep } from '@common/runnerExt';
import type { RunnnerModel } from '../runner';
import { BtnInput } from '@renderer/components/base/BtnInput'
import { HoverMask, VxButton } from '@renderer/components/base/VxButton';
import { computed, ref } from 'vue';


const props = defineProps<{
    step: RunnerTaskStep<unknown>,
    runner: RunnnerModel
}>()

const remove = () => {
    props.runner.removeStep(props.step.output)
}

const beginEdit = () => {
    editValue.value = stepCommont.value
}

const cancelEdit = () => {
    editValue.value = null
}

const submitEdit = () => {
    if (editValue.value === null) return
    props.runner.setComment(stepCommontKey.value, editValue.value)
    editValue.value = null
}

const editValue = ref<null | string>(null)

const typeName = computed(() => {
    if (isJsonDataRunnerStep(props.step)) {
        return 'JSON'
    }
    if (isSqliteRunnerStep(props.step)) {
        return 'SQLite'
    }
    if (isNodeJsRunnerStep(props.step)) {
        return 'Node.js'
    }
    if (isScopeDataRunnerStep(props.step)) {
        return 'Scope'
    }
    throw new Error('unknown step type')
})

const stepCommontKey = computed(() => {
    return `step-${props.step.output}`
})

const stepCommont = computed(() => {
    const commonts = props.runner.comments
    return commonts[stepCommontKey.value] || ''
})

</script>

<style lang="scss" scoped>
.step-wapper__inner {
    display: flex;
    flex-direction: row;

    .step-wapper__id {
        flex: 0 0 auto;
        padding: 8px;

        .step-wapper__id-text {
            width: 200px;
            text-align: center;
            background: #6cf;
            line-height: 32px;
            color: #fff;
            border-radius: 4px;
        }
    }

    .step-wapper__content {
        flex: 1 1 0;
        width: 0;
    }
}

.step-wapper::after {
    content: '';
    display: block;
    width: 400px;
    border-top: 1px solid tomato;
    margin: 24px auto;
}

.step-wapper__content {
    padding: 0 12px;
}

.step-wapper__id-type {
    margin: 12px 0;
    width: 100%;
    overflow: hidden;
}
</style>
