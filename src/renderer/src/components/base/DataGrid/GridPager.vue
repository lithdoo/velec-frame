<script lang="ts" setup generic="T">
import { Pagination as AntPagination } from 'ant-design-vue'
import { DataGridHandler } from './handler';
import { computed } from 'vue';

const props = defineProps<{
    handler: DataGridHandler<T>
}>()


const current = computed(() => {
    return props.handler.grid.current
})

const pageSize = computed(() => {
    return props.handler.grid.pageSize
})

const total = computed(() => {
    return props.handler.grid.total
})

const change = (page: number, pageSize: number) => {
    props.handler.grid.current = page
    props.handler.grid.pageSize = pageSize
    props.handler.refresh()
}

</script>

<template>
    <div class="grid-pager">
        <AntPagination size="small" @change="change" :showSizeChanger="false" :hideOnSinglePage="true" v-if="pageSize"
            :current="current" :page-size="pageSize" :total="total" :show-total="total => `共 ${total} 条数据`" />
    </div>
</template>


<style lang="scss" scoped>

.grid-pager{
}
</style>