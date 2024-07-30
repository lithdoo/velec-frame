<script lang="ts" setup generic="T">
import { Table as AntTable } from 'ant-design-vue'
import { DataGridHandler } from './handler';
import { computed } from 'vue';

const props = defineProps<{
    handler: DataGridHandler<T>
}>()


const dataSource = computed(() => {
    console.log(props.handler)
    return props.handler.grid.list as any[]
})

const columns = computed(() => {
    console.log(props.handler.fields)
    return props.handler.fields.map((field) => {
        return {
            title: field.name,
            dataIndex: field.fieldKey,
            key: field.fieldKey,
            align: field.align
        } as any
    })
})
</script>

<template>
    <AntTable :data-source="dataSource" :columns="columns"></AntTable>
</template>