<script setup lang="ts">
import { RunnerTaskConfig, isJsonDataRunnerStep, isNodeJsRunnerStep, isScopeDataRunnerStep, isSqliteRunnerStep } from '@common/runnerExt';
import { computed } from 'vue';
import JsonRunner from './steps/JsonRunner.vue'
import SqliteRunner from './steps/SqliteRunner.vue'
import NodeJsRunner from './steps/NodeJsRunner.vue'
import ScopeRunner from './steps/ScopeRunner.vue'
import { RunnnerModel } from './runner';
const props = defineProps<{ config: RunnerTaskConfig, runner: RunnnerModel }>()
const steps = computed(() => props.config.steps)

</script>

<template>
    <div class="config-render">
        <div class="config-render__step-card" v-for="step in steps">

            <template v-if="isJsonDataRunnerStep(step)">
                <JsonRunner :step="step" :runner="runner" />
            </template>
            <template v-if="isSqliteRunnerStep(step)">
                <SqliteRunner :step="step" :runner="runner" />
            </template>
            <template v-if="isNodeJsRunnerStep(step)">
                <NodeJsRunner :step="step" :runner="runner" />
            </template>
            <template v-if="isScopeDataRunnerStep(step)">
                <ScopeRunner :step="step" :runner="runner" />
            </template>
            <!-- 
            <template v-else>
                {{ step.output.toLocaleUpperCase() }}
            </template> -->
        </div>
    </div>
</template>


<style lang="scss" scoped>
.config-render {

    .config-render__step-card {
        // margin-bottom: 48px;
        // border: 1px solid #6cf;
    }

}
</style>
