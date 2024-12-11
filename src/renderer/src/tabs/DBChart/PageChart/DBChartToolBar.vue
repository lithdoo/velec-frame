<template>
    <ToolBar :handler="chartToolBar"></ToolBar>
</template>

<script setup lang="ts">
import { ToolBar, ToolBarBuilder } from '@renderer/widgets/ToolBar'
import { DBChartModel } from '../DBChartModel';
import { modalControl } from '../common';
import { ConfirmModalHandler } from '@renderer/widgets/ConfirmModal';

const props = defineProps<{ model: DBChartModel }>()

const chartToolBar = ToolBarBuilder.create()
    .button('refresh', '重新加载', async () => {
        // await page.value.refresh()
    }, { icon: 'del' })
    .button('update', '清除缓存', () => {
        modalControl.get(props.model).open({
            title: "确定要清除缓存吗？",
            message: "这将清除所有缓存数据，包括图表数据、配置等。请谨慎操作。",
            buttons: [ConfirmModalHandler.btnClose(), {
                text: "确认清除缓存",
                type: "primary",
                action: async ({ close }) => {  // 清除缓存
                    await props.model.clearCache()
                    close()
                }
            }]
        })
    }, { icon: 'del' })
    .build()
</script>