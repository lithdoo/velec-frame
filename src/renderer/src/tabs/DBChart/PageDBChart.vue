<template>
    <div class="page-db-chart">
        <div class="page-db-chart__tool-bar">
            <DBChartToolBar></DBChartToolBar>
        </div>
        <div class="page-db-chart__content">
            <SinglePanelSplit :handler="panelSplit">

                <template #panel>
                    <div :class="[
                        'page-db-chart__side-bar',
                        showSideBar ? '' : 'page-db-chart__side-bar--hidden'
                    ]" :style="{ width: siderSplitWidth + 'px' }">

                        <DBChartSider />
                    </div>
                </template>
                <template #extra>
                    <GraphContainer :view="props.model.view"></GraphContainer>
                </template>
            </SinglePanelSplit>
        </div>
    </div>
</template>

<script setup lang="ts">
import { SinglePanelSplit, SinglePanelSplitHandler } from '@renderer/widgets/SinglePanelSplit';
import DBChartSider from './PageChart/DBChartSider.vue'
import DBChartToolBar from './PageChart/DBChartToolBar.vue'
import type { DBChartModel } from './DBChartModel';
import GraphContainer from './GraphContainer.vue';
import { computed, ref } from 'vue';
import { fixReactive } from '@renderer/fix';

const panelSplit = fixReactive(new SinglePanelSplitHandler())
const siderSplitWidth = computed(() => showSideBar.value ? panelSplit.distance : 0)
const showSideBar = ref(true)





const props = defineProps<{
    model: DBChartModel
}>()

</script>

<style lang="scss" scoped>
.page-db-chart {
    height: 100%;
    display: flex;
    flex-direction: column;

    .page-db-chart__tool-bar {
        flex: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .page-db-chart__content {
        flex: 1 1 0;
        height: 0;
    }
}

.page-db-chart__side-bar {
    height: 100%;
    background-color: rgb(2, 8, 23);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
}
</style>