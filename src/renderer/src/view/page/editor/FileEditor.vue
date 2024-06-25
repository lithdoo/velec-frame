<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { runClient ,configureMonacoWorkers } from './json';

onMounted(() => {
    setTimeout(() => {

        if (cntr.value) {
            configureMonacoWorkers()
            runClient(cntr.value)
        }
    },3000)
})

const cntr = ref<HTMLElement>()
</script>
<template>
    <div class="file-editor__cntr" style="height:100%" ref="cntr"></div>
</template>
