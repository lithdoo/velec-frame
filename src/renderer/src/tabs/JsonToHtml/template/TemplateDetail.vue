<template>
    <div class="template-detail">
        <div>{{ templateId }}</div>
        <div>[{{ detail.type() }}]</div>

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
import { fixReactive } from '@renderer/fix';


const props = defineProps<{ templateId: string, model: JthStateModel ,tree: TemplateTreeHandler}>()

const detail = computed(() => {
    return TemplateDetailHander.create(props.model, props.templateId)
})

const asType = <T>(input: any) => {
    return input as T
}



const changeType = fixReactive(new class {
    currentType: JthTemplateType | null = null

    change() {
        this.currentType = detail.value.type()
    }

    submit() {
        if (this.currentType === detail.value.type()) return
        const node = JthComponentHandler.createBlankNode(this.currentType!)
        detail.value.model.component.replaceTemplateNode(detail.value.target.id, node)
        props.tree.detail(detail.value.target.id)
    }
})

</script>