<template>
    <StepWapper :step="props.step" :runner="runner">
        <div class="json-step__recevid">
            recevid: {{ props.step.option.receiveId }}
        </div>
        <div class="json-step__val">
            <div class="json-step__val-mask">
                <VxButton icon="del" only-icon :click="editJson"></VxButton>
            </div>
            <code>
                <pre>{{ jsonRender || 'test' }}</pre>
            </code>
        </div>
    </StepWapper>
</template>

<script setup lang="ts">
import { JsonDataRunnerStep } from '@common/runnerExt';
import StepWapper from '../common/StepWapper.vue'
import { VxButton } from '@renderer/components/base/VxButton'
import { PageJsonEditor } from '@renderer/page/jsonEditor';
import { computed } from 'vue';
import type { RunnnerModel } from '../runner';

const props = defineProps<{
    step: JsonDataRunnerStep,
    runner: RunnnerModel
}>()

const jsonRender = computed(() => {
    try {
        return JSON.stringify(props.step.option.default, null, 2)
    } catch (e) {
        return '无效的 json 对象'
    }
})

const editJson = () => {
    PageJsonEditor.open({
        title: '编辑Json',
        value: props.step.option.default,
        save: (val) => {
            props.step.option.default = val
        }
    })
}

</script>

<style lang="scss" scoped>
.json-step__recevid {
    padding: 4px 8px;
}

.json-step__val {
    code {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1em;
        background-color: rgb(246, 248, 250);
        color: rgb(31, 35, 40);
        border-radius: 6px;
        padding: 0 16px;
    }

    position: relative;

    .json-step__val-mask {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(66, 66, 66, 0.8);
    }

    &:hover .json-step__val-mask {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
}
</style>
