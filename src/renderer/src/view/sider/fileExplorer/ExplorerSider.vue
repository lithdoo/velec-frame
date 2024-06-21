<script setup lang="ts">
import { FlatTreeHandler, FlatTreeItem, FlatTree } from '@renderer/components/base/FlatTree';
import { ref } from 'vue';
import { appTab } from '@renderer/state/tab';
import { PageBgTask } from '@renderer/view/page/bgTask';
import { contextMenu } from '@renderer/view/fixed/contextmenu';
import { testMenu } from '@renderer/components/base/PopMenu';
const testFile = {
    'vscode': '',
    'build': {
        'docs': '',
        'resoucre': {},
        'src': {
            'vscode': '',
            'build': '',
            'docs': '',
            'resoucre': {},
        }
    },
    'docs': '',
    'resoucre': {},
    'src': {
        'vscode': '',
        'build': '',
        'docs': '',
        'resoucre': {},
    }
}

const fileTree = ref(new FlatTreeHandler<FlatTreeItem & {
    name: string
}>())

fileTree.value.onItemContextMenu = (item) => {
    setTimeout(() => {
        fileTree.value.selectedKeys = [item.id]
        contextMenu.open(testMenu)
    })
}

const load = (data: any, pid?: string) => {
    Array.from(Object.entries(data)).forEach(([key, value]) => {
        const id = Math.random().toString()
        const isLeaf = !(value && typeof value === 'object')
        fileTree.value.data.push({
            id, pid, name: key, isLeaf,
        })

        if (value && typeof value === 'object') {
            load(value, id)
        }
    })
}

const openFile = (name: string) => {
    appTab.addTab(new PageBgTask(name))
}

load(testFile)

</script>

<template>
    <div class="explorer-sider-panel">
        <div class="explorer-sider-panel__title">
            资源管理器
        </div>
        <div class="explorer-sider-panel__tree">
            <FlatTree :handler="fileTree">
                <template #item="{ item }">
                    <div @dblclick="() => openFile(item.name)">
                        {{ item.name }}
                    </div>
                </template>
            </FlatTree>
        </div>
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