<script setup lang="ts">

import { Input } from 'ant-design-vue'
import { onMounted, ref } from 'vue';
const model = defineModel<string>()
const inputRef = ref<typeof Input | null>(null)
const props = defineProps<{
    placeholder?: string,
    mounted?: (el: { focus: () => void }) => void,
}>()

onMounted(() => {
    if (props.mounted) {
        props.mounted({
            focus: () => {
                inputRef.value?.focus()
            }
        })
    }
})

</script>

<template>
    <div>
        <Input v-model:value="model" ref="inputRef" :placeholder="placeholder" :style="{ width: '100%' }">
        <template #suffix>
            <div class="btn-input-suffix">
                <slot name="suffix"></slot>
            </div>
        </template>
        </Input>
    </div>
</template>

<style scoped>
.btn-input-suffix {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: -7px;
}
</style>