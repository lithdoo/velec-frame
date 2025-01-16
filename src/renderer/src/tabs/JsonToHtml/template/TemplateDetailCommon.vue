<template>
    <div class="template-detail-common">
        <div class="template-detail-common__type">
            <template v-if="!changeType.currentType">
                <div class="template-detail-common__type-text">[ {{ detail.type() }} ] : {{ detail.target.id }}</div>
                <div class="template-detail-common__type-btns">
                    <VxButton :click="() => changeType.change()" only-icon icon="edit"></VxButton>
                </div>
            </template>
            <template v-else>
                <div class="template-detail-common__type-selector">
                    <VxSelector :options="changeType.options" v-model="changeType.currentType">
                        <template #suffix>
                            <VxButton only-icon icon="done" :click="() => changeType.submit()"></VxButton>
                            <VxButton only-icon icon="clear" :click="() => changeType.cancel()"></VxButton>
                        </template>
                    </VxSelector>
                </div>
            </template>
        </div>

    </div>

</template>

<script setup lang="ts">
import { TemplateDetailHandler, TemplateTreeHandler } from './handler';
import { JthStateController, JthTemplateType } from '../common';
import { fixReactive } from '@renderer/fix';
import { VxSelector } from '@renderer/components'
import VxButton from '@renderer/components/VxButton/VxButton.vue';


const props = defineProps<{
    detail: TemplateDetailHandler<any>,
    tree: TemplateTreeHandler
}>()


const changeType = fixReactive(new class {
    currentType: { key: JthTemplateType, label: string } | null = null

    options: { key: JthTemplateType, label: string }[] = [
        { key: JthTemplateType.Apply, label: 'APPLY' },
        { key: JthTemplateType.Cond, label: 'Cond' },
        { key: JthTemplateType.Element, label: 'Element' },
        { key: JthTemplateType.Loop, label: 'Loop' },
        { key: JthTemplateType.Prop, label: 'Prop' },
        { key: JthTemplateType.Text, label: 'Text' },
    ]


    change() {
        const type = props.detail.type()
        this.currentType = this.options.find(v => v.key === type) ?? null
    }

    cancel() {
        this.currentType = null
    }

    submit() {
        if (!this.currentType) return
        if (this.currentType.key === props.detail.type()) return
        const node = JthStateController.createBlankNode(this.currentType.key)
        props.detail.controller.updateTNode({
            ...node,
            id: props.detail.target.id,
        })
        props.tree.detail(props.detail.target.id)
        props.tree.reload()
    }
})

</script>

<style scoped lang="scss">
.template-detail-common__type {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 8px;

    .template-detail-common__type-text {
        flex: 1 1 0;
        line-height: 32px;
        width: 0;
    }

    .template-detail-common__type-btns {
        flex: 0 0 auto;
    }

    .template-detail-common__type-selector {
        flex: 1 1 0;
        width: 0;
    }

}
</style>