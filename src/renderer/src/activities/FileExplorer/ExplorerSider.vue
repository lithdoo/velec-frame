<script setup lang="ts">
import { FlatTree } from '@renderer/widgets/FlatTree';
import { VxButton } from '@renderer/components'
import { computed } from 'vue';
import { ActivFileExplorer } from '.';

const props = defineProps<{
    handler: ActivFileExplorer
}>()

const handler = computed(() => props.handler)


const addWorkspace = () => handler.value.addExplorerWrokspace()
const reload = () => handler.value.reloadCurrentWorkspace()

</script>

<template>
    <div class="explorer-sider-panel">
        <div class="explorer-sider-panel__title">
            <div class="explorer-sider-panel__title-text">资源管理器 </div>
            <div class="explorer-sider-panel__title-actions">
                <VxButton only-icon icon="plus" @click="addWorkspace"></VxButton>
                <VxButton only-icon icon="reload" @click="reload"></VxButton>
            </div>
        </div>

        <template v-if="handler.list.length">
            <div class="explorer-sider-panel__tree" v-for="(ws, idx) in handler.list" :key="idx">
                <FlatTree :handler="ws.tree">
                    <template #item="{ item }">
                        <div @dblclick="() => handler.fileOpen(item)">
                            {{ item.name }}
                        </div>
                    </template>
                </FlatTree>
            </div>
        </template>
    </div>
</template>

<style>
:root {
    --explorer-sider-title-height: 36px;
    --explorer-sider-title-border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    --explorer-sider-title-font-size: 12px;
    --explorer-sider-title-padding-left: 18px;
}
</style>

<style lang="scss" scoped>
.explorer-sider-panel {
    height: 100%;
    display: flex;
    flex-direction: column;

    .explorer-sider-panel__title {
        height: var(--explorer-sider-title-height);
        border-bottom: var(--explorer-sider-title-border-bottom);
        display: flex;
        align-items: center;
        font-size: var(--explorer-sider-title-font-size);
        padding-left: var(--explorer-sider-title-padding-left);
        flex: 0 0 auto;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .explorer-sider-panel__title-text {
            flex: 1 1 0;
            width: 0;
        }

        .explorer-sider-panel__title-actions {
            flex: 0 0 auto;
            padding: 0 8px;
            display: flex;
            flex-direction: row;
            gap: 4px;
        }
    }

    .explorer-sider-panel__tree {
        flex: 1 1 0;
        height: 0;
    }

    .explorer-sider-panel__tree {
        flex: 1 1 0;
        height: 0;
    }
}
</style>