<script lang="ts" setup generic="T extends Record<string,unknown>">
import { CommonForm } from '@renderer/components/form';
import type { PageDataForm } from '.';
import { computed } from 'vue';
import { ToolBarBuilder, ToolBar } from '@renderer/components/base/ToolBar';

const props = defineProps<{
    page: PageDataForm<T>
}>()

const page = computed(() => props.page)

const toolbar = ToolBarBuilder.create()
    .button('save', '提交并关闭', async () => {
        await page.value.submit()
        page.value.close()
    }, { icon: 'del' })
    .build()

</script>

<template>
    <div class="page-sql-add-table">
        <div class="page-sql-add-table__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>
        <div class="page-sql-add-table__graph">
            <CommonForm :handler="page.form"></CommonForm>
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
