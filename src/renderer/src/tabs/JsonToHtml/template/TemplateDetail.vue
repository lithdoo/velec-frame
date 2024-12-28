<template>
    <div class="template-detail">
        <div>{{ templateId }}</div>
        <div>[{{ detail.type() }}]</div>
    </div>

</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TemplateDetailHander } from './handler';
import { JthStateModel } from '../JthState';


const props = defineProps<{ templateId: string, model: JthStateModel }>()

const detail = computed(() => {
    return TemplateDetailHander.create(props.model, props.templateId)
})


</script>