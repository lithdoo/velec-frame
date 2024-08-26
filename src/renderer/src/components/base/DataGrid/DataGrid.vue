<script lang="ts" setup generic="T">
import { Table as AntTable } from 'ant-design-vue'
import { DataGridHandler, isActionField, isDataField } from './handler';
import { computed } from 'vue';

const props = defineProps<{
    handler: DataGridHandler<T>
}>()


const dataSource = computed(() => {
    return props.handler.grid.list as any[]
})

const columns = computed(() => {
    return props.handler.fields.map((field) => {

        if (isDataField(field)) {
            return {
                title: field.name,
                dataIndex: field.fieldKey,
                key: field.fieldKey,
                align: field.align,
                width: 120
            } as any
        }

        if (isActionField(field)) {
            const width = field.width()
            return {
                title: '操作',
                dataIndex: '__btns__',
                key: field.key,
                align: 'left',
                width: width,
            } as any
        }
    })
})

const actionBtns = (key: any, record: Record<string, any>) => {
    const field = props.handler.fields.find(v => isActionField(v) && v.key === key)
    if (!field) return []
    if (!isActionField(field)) return []
    const btns = field.btns(record as T)
    return btns ?? []
}
</script>

<template>
    <AntTable class="data-grid" size="small" :scroll="{ y: '100%' }" :pagination="false" :data-source="dataSource"
        :columns="columns">
        <template #bodyCell="scope">
            <template v-if="scope.column.dataIndex === '__btns__'">
                <template v-for="btn in actionBtns(scope.column.key ?? '', scope.record)" :key="btn.key">
                    <a @click.prevent="(e) => btn.action(e)">{{ btn.title }}</a>
                </template>
            </template>
            <template v-else>
                <slot name="cell" v-bind="scope"></slot>
            </template>
        </template>
    </AntTable>
</template>

<style>
.data-grid .ant-table,
.data-grid .ant-spin-nested-loading,
.data-grid .ant-spin-container,
.data-grid .ant-table-container,
.data-grid .ant-table-content,
.data-grid .ant-table-content>table {
    height: 100%;
}


.data-grid .ant-table-container {
    display: flex;
    flex-direction: column;
}

.data-grid .ant-table-header {
    flex: 0 0 auto;
}

.data-grid .ant-table-body {
    flex: 1 1 0;
    height: 0;
}
</style>