<template>
  <ToolBar :handler="chartToolBar"></ToolBar>
</template>

<script setup lang="ts">
import { ToolBar, ToolBarBuilder } from '@renderer/widgets/ToolBar'
import { DBChartModel } from '../DBChartModel'

const props = defineProps<{ model: DBChartModel }>()

const chartToolBar = ToolBarBuilder.create()
  .button(
    'refresh',
    '重新加载',
    async () => {
      await props.model.control.emit('chart:reload')
    },
    { icon: 'del' }
  )
  .button(
    'update',
    '清除缓存',
    async () => {
      await props.model.control.emit('chart:clearCache')
    },
    { icon: 'del' }
  )
  .button(
    'sql',
    '执行 SQL',
    async () => {
      await props.model.control.emit('db:showExecuteEditor')
    },
    {}
  )
  .button(
    'addBlankTable',
    '新建空白表',
    async () => {
      await props.model.control.emit('table:add')
    },
    {}
  )
  .build()
</script>
