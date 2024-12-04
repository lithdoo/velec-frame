<script setup lang="ts" generic="T extends {label:string, key:string}">
import { Select, SelectOption } from 'ant-design-vue'
import { computed } from 'vue';
const model = defineModel<T | null>()
const props = defineProps<{
    options: T[]
}>()

const value = computed(() => {
    if (model.value) return model.value.key
    else return undefined
})

const onchange = (key: string) => {
    model.value = props.options.find(item => item.key === key) ?? null
}

</script>

<template>
    <div class="btn-selector">
        <Select :value="value" @change="val => onchange(val as any)" style="width: 100%;" >
            <SelectOption v-for="item in options" :key="item.key" :value="item.key">{{ item.label }}</SelectOption>
            <template #suffixIcon>
                <slot name="btns"></slot>
            </template>
        </Select>
    </div>
</template>

<style >
.btn-selector .ant-select-arrow{
    user-select: all!important;
    color: inherit!important;
    pointer-events: all!important;
}

</style>