<template>
    <ToolBar :handler="chartToolBar"></ToolBar>
</template>

<script setup lang="ts">
import {ToolBar,ToolBarBuilder} from '@renderer/widgets/ToolBar'

const chartToolBar = ToolBarBuilder.create()
    .button('refresh', '重新加载', async () => {
        // await page.value.refresh()
    }, { icon: 'del' })
    .button('update', '清除缓存', () => {
        // page.value.insertMode()
    }, { icon: 'del' })
    .build()
</script>