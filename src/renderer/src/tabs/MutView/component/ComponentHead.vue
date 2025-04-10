<script setup lang="ts">
import { fixReactive } from '@renderer/fix';
import InputText, { InputTextHandler } from '../common/InputText.vue'
import { MVFileController } from '../controller';
import { MVComponent } from '@renderer/mods/mutv-mods/component';
import { VxButton } from '@renderer/components'
import { computed } from 'vue';
import { isMVTemplateRoot, MVTemplateRoot } from '@renderer/mods/mutv-template';
import InputTextLine  from '../common/InputTextLine.vue';


const props = defineProps<{
    controller: MVFileController,
    component: MVComponent
}>()

const actived = defineModel<string>()
const active = () => {
    actived.value = props.component.rootId
}

const inputText = fixReactive(new class extends InputTextHandler {
    text() {
        return props.component.keyName
    }
    submit(text: string): void {
        props.controller.component.renameComponent(
            props.component.rootId, text
        )
    }
})

const allProps = computed(() => {
    const nodeData = props.controller.template.node(props.component.rootId)
    if (!isMVTemplateRoot(nodeData)) { return [] }
    return nodeData.props
})


const allPropsInput = computed(() => {
    return allProps.value.map(v => fixReactive(new class extends InputTextHandler {
        minWidth = 72

        text() {
            return v
        }

        del() {
            props.controller.template.updateNode<MVTemplateRoot>(props.component.rootId, node => {
                return {
                    ...node, props: allProps.value.filter(s => s !== v)
                }
            })
        }

        submit(text: string): void {
            if (!text.trim()) {
                throw new Error(`prop name is blank`)
            }

            if (allProps.value.includes(text.trim())) {
                throw new Error(`prop name "${text}" is exist`)
            }

            props.controller.template.updateNode<MVTemplateRoot>(props.component.rootId, node => {
                return {
                    ...node, props: allProps.value.map(s => s === v ? text.trim() : s)
                }
            })
        }
    }))
})


const addProp = () => {
    let name = 'prop'
    let idx = 0

    while (allProps.value.find(v => v === name)) {
        idx = idx + 1
        name = `prop_${idx}`
    }

    props.controller.template.updateNode<MVTemplateRoot>(props.component.rootId, node => {
        return {
            ...node, props: allProps.value.concat([name])
        }
    })
}

</script>

<template>
    <div class="jth-component-header" :data-actived="actived === component.rootId" @click="() => active()">
        <InputTextLine :handler="inputText">
            <template #hover-btn>
                <VxButton class="input-text__edit-btn" only-icon icon="plus" :click="() => addProp()"
                    @click.native.stop>
                </VxButton>
            </template>
        </InputTextLine>

        <div class="jth-component-header__prop" v-for="input in allPropsInput">
            <InputText :handler="input">
                <template #hover-btn>
                    <VxButton class="input-text__edit-btn" only-icon icon="del" :click="() => input.del()" @click.native.stop>
                    </VxButton>
                </template>
            </InputText>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.jth-component-header {
    height: 42px;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    flex: 0 0 auto;
    opacity: 0.8;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 16px;
    gap: 6px;
    cursor: pointer;


    &[data-actived="true"] {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-weight: bolder;
    }

    .jth-component-header__prop {
        border: 1px solid #66ccff;
    }
}
</style>