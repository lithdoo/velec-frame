<template>
    <StepWapper :step="props.step" :runner="runner">
        <div class="sqlite-step__recevid">
            <VxButton icon="del" :click="editUseParams">[useParams] : {{ props.step.option.useParams ? 'true' : 'false' }}</VxButton>
            <VxButton icon="del" :click="editUrl">[fileUrl] : {{ decodeURIComponent(props.step.option.fileUrl) ||
                '[无连接]' }} </VxButton>
            <VxButton icon="del" :click="editType">[type] : {{ props.step.option.type }} </VxButton>
        </div>
        <div class="sqlite-step__val">
            <div class="sqlite-step__val-mask">
                <VxButton icon="del" only-icon :click="editSql"></VxButton>
            </div>
            <code>
                <pre>{{ sqlText || 'test' }}</pre>
            </code>
        </div>
    </StepWapper>
</template>

<script setup lang="ts">
import { SqliteRunnerStep } from '@common/runnerExt';
import StepWapper from '../common/StepWapper.vue'
import { VxButton } from '@renderer/components/base/VxButton'
import { computed } from 'vue';
import { PageSqlEditor } from '@renderer/page/sqlEditor';
import type { RunnnerModel } from '../runner';

const props = defineProps<{
    step: SqliteRunnerStep,
    runner: RunnnerModel
}>()

const sqlText = computed(() => {
    return props.step.option.sql
})

const editSql = () => {
    PageSqlEditor.open({
        title: '编辑 Sql',
        content: props.step.option.sql,
        save: (val) => {
            props.step.option.sql = val
        }
    })
}

const editUseParams = ()=>{
    props.step.option.useParams = !props.step.option.useParams
}

const editUrl = async () => {
    const fileUrl = await window.explorerApi.selectFile({ extensions: ['db'] })
    if (!fileUrl) return
    props.step.option.fileUrl = fileUrl
}

const editType = () => {
    props.step.option.type = props.step.option.type === 'run' ? 'query' : 'run'
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

    .sqlite-step__val-mask {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(66, 66, 66, 0.8);
    }

    &:hover .sqlite-step__val-mask {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
}
</style>
