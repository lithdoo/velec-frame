<script lang="ts" setup>
import { ToolBarBuilder, ToolBar } from '@renderer/widgets/ToolBar'
import type { PageSqlViewData } from './PageDBRecordsHandler'
import { DataGrid, GridPager } from '@renderer/widgets/DataGrid'
import { computed } from 'vue'

const props = defineProps<{
  page: PageSqlViewData
}>()

const page = computed(() => props.page)

const viewToolbar = ToolBarBuilder.create()
  .button(
    'refresh',
    '刷新',
    async () => {
      await page.value.refresh()
    },
    { icon: 'del' }
  )
  .button(
    'update',
    '添加数据',
    () => {
      page.value.insertMode()
    },
    { icon: 'del' }
  )
  .build()

const insertToolbar = ToolBarBuilder.create()
  .button(
    'update',
    '添加行',
    () => {
      page.value.insertHandler.addRow()
    },
    { icon: 'del' }
  )
  .button(
    'submit',
    '提交',
    () => {
      page.value.submitInsert()
    },
    { icon: 'del' }
  )
  .button(
    'cancel',
    '取消',
    () => {
      page.value.viewMode()
    },
    { icon: 'del' }
  )
  .build()
</script>

<template>
  <div class="page-sql-view-data">
    <div class="page-sql-view-data__view-page" v-show="!page.isInsertMode">
      <div class="page-sql-view-data__array-view-header">
        <div class="page-sql-view-data__array-view-title">
          <ToolBar :handler="viewToolbar"></ToolBar>
        </div>
        <GridPager class="page-sql-view-data__array-view-pager" :handler="props.page.viewHandler" />
      </div>
      <DataGrid class="page-sql-view-data__array-view-grid" :handler="props.page.viewHandler">
        <template #cell="scope">
          <input
            v-if="props.page.viewHandler.editData.get(scope.record)"
            type="text"
            v-model="props.page.viewHandler.editData.get(scope.record)[scope.column.key as string]"
          />
          <template v-else>{{ scope.record[scope.column.key as string] }}</template>
        </template>
      </DataGrid>
    </div>

    <div class="page-sql-view-data__insert-page" v-show="page.isInsertMode">
      <div class="page-sql-view-data__array-view-header">
        <div class="page-sql-view-data__array-view-title">
          <ToolBar :handler="insertToolbar"></ToolBar>
        </div>
        <GridPager
          class="page-sql-view-data__array-view-pager"
          :handler="props.page.insertHandler"
        />
      </div>
      <DataGrid class="page-sql-view-data__array-view-grid" :handler="props.page.insertHandler">
        <template #cell="scope">
          <input
            type="text"
            v-if="scope.column"
            v-model="scope.record[scope.column.key as string]"
          />
        </template>
      </DataGrid>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-sql-view-data {
  height: 100%;
  overflow: hidden;
}

.page-sql-view-data__view-page,
.page-sql-view-data__insert-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-sql-view-data__array-view-header {
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid #666;
  padding: 0 8px;
  min-height: 32px;
}

.page-sql-view-data__array-view-title {
  flex: 1 1 0;
  width: 0;
}

.page-sql-view-data__array-view-pager {
  flex: 0 0 auto;
}

.page-sql-view-data__array-view-grid {
  flex: 1 1 0;
  height: 0;
  padding: 8px 24px;
}
</style>
