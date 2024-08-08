<script lang="ts" setup>
import { CommonForm } from '@renderer/components/form';
import type { PageSqlAddTable } from '.';
import { computed } from 'vue';
import { ToolBarBuilder, ToolBar } from '@renderer/components/base/ToolBar';

const props = defineProps<{
    page: PageSqlAddTable
}>()

const page = computed(() => props.page)

const toolbar = ToolBarBuilder.create()
    .button('save', '提交并关闭', async () => {
        await page.value.submit()
        page.value.close()
    }, { icon: 'del' })
    .button('update', '添加字段', () => {
        page.value.addField()
    }, { icon: 'del' })
    .build()

</script>

<template>
    <div class="page-sql-add-table">
        <div class="page-sql-add-table__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>
        <div class="page-sql-add-table__graph">
            <CommonForm :handler="page.main"></CommonForm>
            <div class="page-sql-add-table__fields">
                <template v-for="field in page.fields">
                    <div class="page-sql-add-table__field-item">
                        <CommonForm :handler="field"></CommonForm>
                    </div>
                </template>
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.page-sql-add-table {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.page-sql-add-table__toolbar {
    flex: 0 0 auto;
    border-bottom: 1px solid #666;
}

.page-sql-add-table__graph {
    flex: 1 1 0;
    height: 0;
    overflow: auto;
}
</style>
