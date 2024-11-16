<template>
    <StepWapper :step="props.step" :runner="runner">
        <div class="sqlite-step__recevid">
            <VxButton icon="del" :click="editUrl">[workdir] : {{ decodeURIComponent(props.step.option.workdir) ||
                '[无连接]' }} </VxButton>
        </div>
        <div class="sqlite-step__val">
            <code>
                <pre>{{ sqlText || 'test' }}</pre>
            </code>

            <HoverMask>
                <VxButton icon="del" only-icon :click="editSql"></VxButton>
            </HoverMask>
        </div>
    </StepWapper>
</template>

<script setup lang="ts">
import { NodeJsRunnerStep } from '@common/runnerExt';
import StepWapper from '../common/StepWapper.vue'
import { HoverMask, VxButton } from '@renderer/components/base/VxButton'
import { computed } from 'vue';
import { PageSqlEditor } from '@renderer/page/sqlEditor';
import type { RunnnerModel } from '../runner';

const props = defineProps<{
    step: NodeJsRunnerStep,
    runner: RunnnerModel
}>()

const sqlText = computed(() => {
    return props.step.option.code
})

const editSql = () => {
    PageSqlEditor.open({
        title: '编辑 Code',
        content: props.step.option.code,
        save: (val) => {
            props.step.option.code = val
        }
    })
}

const editUrl = async () => {
    const workdir = await window.explorerApi.selectDir()
    if (!workdir) return
    props.step.option.workdir = workdir
}


</script>

<style lang="scss" scoped>
.sqlite-step__recevid {
    padding: 4px 8px;
    display: flex;
    flex-direction: row;

    >* {
        flex: 0 0 auto;
    }
}

.sqlite-step__val {
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
    max-height: 240px;
    overflow: hidden;
}
</style>
