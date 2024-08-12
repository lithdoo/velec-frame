<script setup lang="ts">
import { FlatTree } from '@renderer/components/base/FlatTree';
import { computed } from 'vue';
import { SiderFileExplorer } from '.';

const props = defineProps<{
    handler: SiderFileExplorer
}>()

const handler = computed(() => props.handler)


const addWorkspace = () => handler.value.addExplorerWrokspace()

</script>

<template>
    <div class="explorer-sider-panel">
        <div class="explorer-sider-panel__title">
            资源管理器
        </div>

        <template v-if="!handler.list.length">
            <div>
                <button @click="addWorkspace">添加工作空间</button>
            </div>
        </template>
        <template v-else>
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
    }

    .explorer-sider-panel__tree {
        flex: 1 1 0;
        height: 0;
    }
}
</style>