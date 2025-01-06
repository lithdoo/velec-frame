<template>
    <div class="template-detail">
        <TemplateDetailCommon :detail="detail" :tree="tree"></TemplateDetailCommon>

        <template v-if="detail.type() === JthTemplateType.Element">
            <TemplateDetailElement :detail="asType<any>(detail)"></TemplateDetailElement>
        </template>
    </div>

</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TemplateDetailHander, TemplateTreeHandler } from './handler';
import { JthComponentHandler, JthStateModel, JthTemplateType } from '../JthState';
import TemplateDetailElement from './TemplateDetailElement.vue'
import TemplateDetailCommon from './TemplateDetailCommon.vue'

const props = defineProps<{ templateId: string, model: JthStateModel ,tree: TemplateTreeHandler}>()

const detail = computed(() => {
    return TemplateDetailHander.create(props.model, props.templateId)
})

const asType = <T>(input: any) => {
    return input as T
}

</script>