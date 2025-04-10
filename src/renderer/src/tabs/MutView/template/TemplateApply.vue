<template>
    <div class="template-element-apply">
        <div class="template-element-apply__sub-title">Component</div>
        <div class="" style="padding: 8px;">
            <VxSelector :options="components" :model-value="current" @update:model-value="val => onchange(val)">
            </VxSelector>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VxSelector from '@renderer/components/VxInput/VxSelector.vue'
import { MVFileController } from '../controller';
import { MVTemplateApply } from '@renderer/mods/mutv-template';

const props = defineProps<{
    controller: MVFileController,
    template: MVTemplateApply
}>()

const components = computed(() => props.controller.component.allComponents().map(val => ({
    key: val.rootId, label: val.keyName
})))

const current = computed(() => {
    return components.value.find(v => v.key === props.template.rootId)
})

const onchange = (val?: { key: string } | null) => {
    props.controller.template.updateNode<MVTemplateApply>(props.template.id, (node) => {
        return { ...node, rootId: val?.key || '' }
    })
}

</script>

<style lang="scss" scoped>
.template-element-apply {
    .template-element-apply__sub-title {
        margin-top: 8px;
        padding: 0 8px;
        font-size: 16px;
        font-weight: bolder;
        opacity: 0.7;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        height: 32px;
    }
}
</style>