<script lang="ts" setup generic="T">
import { Table as AntTable } from 'ant-design-vue'
import { DataGridHandler } from './handler';
import { computed } from 'vue';

const props = defineProps<{
    handler: DataGridHandler<T>
}>()


const dataSource = computed(() => {
    return props.handler.grid.list as any[]
})

const columns = computed(() => {
    return props.handler.fields.map((field) => {
        return {
            title: field.name,
            dataIndex: field.fieldKey,
            key: field.fieldKey,
            align: field.align,
            width: 120
        } as any
    })
})
</script>

<template>
    <AntTable class="data-grid" size="small" :scroll="{y:'100%'}"  :pagination="false" :data-source="dataSource" :columns="columns"></AntTable>
</template>

<style>
.data-grid .ant-table,
.data-grid .ant-spin-nested-loading,
.data-grid .ant-spin-container,
.data-grid .ant-table-container,
.data-grid .ant-table-content,
.data-grid .ant-table-content > table{
    height: 100%;
}


.data-grid .ant-table-container{
    display: flex;
    flex-direction: column;
}
.data-grid .ant-table-header{
    flex: 0 0 auto;
}

.data-grid .ant-table-body{
    flex: 1 1 0;
    height: 0;
}

</style>