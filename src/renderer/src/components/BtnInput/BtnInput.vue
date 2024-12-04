<script setup lang="ts">

import { Input } from 'ant-design-vue'
const model = defineModel<string>()

</script>

<template>
    <div>
        <Input v-model:value="model">
            <template #suffix>
                <slot name="btns"></slot>
            </template>
        </Input>
    </div>
</template>

<style scoped></style>