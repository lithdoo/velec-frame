<template>
    <div class="mv-template">

        <div class="mv-template__sub-title">TagName</div>
        <div class="mv-template__component" style="margin-left: -6px;">
            <InputText :handler="tagNameInput"></InputText>
        </div>

        <div class="mv-template__sub-title">
            BEM Style
            <VxButton only-icon icon="plus" :click="() => bemBinderHandler.newTag()" />
        </div>
        <div class="mv-template__bem" style="padding: 0 8px;">
            <!-- <BEMSelector :bem="detail.controller.bem"></BEMSelector> -->
             <BEMBinder :handler="bemBinderHandler"></BEMBinder>
        </div>

        <template v-for="field in fields">

            <div class="mv-template__sub-title">
                <InputTextLine :handler="field">
                    <template #hover-btn>
                        <VxButton icon="del" only-icon :click="() => field.del()"></VxButton>
                    </template>
                </InputTextLine>
            </div>
            <div class="mv-template__component">
                <EditValue :valRef="field.value()" :controller="controller" :onchange="ref => field.onValueChange(ref)">
                </EditValue>
            </div>
        </template>

        <div style="margin-top: 16px;display: flex; align-items: center;justify-content: center;">
            <VxButton icon="plus" style="text-align: center;" :click="() => addField()">Add Field</VxButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { EvalRef } from '@renderer/mods/mutv-eval';
import EditValue from '../common/EditValue.vue'
import { MVFileController } from '../controller';
import { MVTemplateElement } from '@renderer/mods/mutv-template';
import InputText, { InputTextHandler } from '../common/InputText.vue';
import InputTextLine from '../common/InputTextLine.vue';
import { computed } from 'vue';
import { fixReactive } from '@renderer/fix';
import VxButton from '@renderer/components/VxButton/VxButton.vue';
import BEMBinder, { BEMElementBinderHandler } from '../bemStyle/BEMElementBinder.vue';

const props = defineProps<{
    controller: MVFileController,
    template: MVTemplateElement
}>()

const tagNameInput = computed(() => fixReactive(new class extends InputTextHandler {
    minWidth: number = 48
    text() { return props.template.tagName }
    submit(tagName: string): void {
        props.controller.template.updateNode<MVTemplateElement>(props.template.id, (node) => {
            return { ...node, tagName }
        })
    }
}))


const bemBinderHandler  = computed(() => fixReactive(new BEMElementBinderHandler(
    props.template.id, props.controller
)))
const addField = () => {
    let name = 'field'
    let idx = 0
    while (props.template.attrs.map(v => v.name).includes(name)) {
        idx = idx + 1
        name = `field_${idx}`
    }
    props.controller.template.updateNode(props.template.id, (node: MVTemplateElement) => {
        const attrs = node.attrs

        let name = 'field'
        let idx = 0
        while (attrs.map(v => v.name).includes(name)) {
            idx = idx + 1
            name = `field_${idx}`
        }
        const newNode: MVTemplateElement = { ...node, attrs: [...attrs, { name, value: { '_VALUE_GENERATOR_REFERENCE_': 'null' } }] }
        return newNode
    })
}


const fields = computed(() => {
    return props.template.attrs.map(({ name, value }) => {
        return fixReactive(new class extends InputTextHandler {
            text(): string {
                return name
            }
            submit(text: string): void {
                const newName = text.trim()

                props.controller.template.updateNode<MVTemplateElement>(props.template.id, (node: MVTemplateElement) => {
                    if (node.attrs.map(v => v.name).includes(newName)) {
                        throw new Error('name is exist')
                    }
                    return {
                        ...node, attrs: node.attrs.map(({ name: current, value }) => {
                            return { value, name: current === name ? newName : current }
                        })
                    }
                })
            }

            value() {
                return value
            }

            onValueChange(newValue: EvalRef) {
                props.controller.template.updateNode<MVTemplateElement>(props.template.id, (node: MVTemplateElement) => {
                    return {
                        ...node, attrs: node.attrs.map(({ name: current, value }) => {
                            return { name: current, value: name === current ? newValue : value }
                        })
                    }
                })
            }

            del() {
                props.controller.template.updateNode<MVTemplateElement>(props.template.id, (node: MVTemplateElement) => {
                    return {
                        ...node, attrs: node.attrs.filter(v => v.name !== name)
                    }
                })
            }
        })


    })
})


</script>

<style lang="scss" scoped>
.mv-template {
    .mv-template__sub-title {
        margin-top: 8px;
        padding: 0 8px;
        font-size: 16px;
        font-weight: bolder;
        opacity: 0.7;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        height: 32px;
        display: flex;
    }
}
</style>