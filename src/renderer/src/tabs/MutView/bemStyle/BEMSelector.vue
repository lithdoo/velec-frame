<script lang="ts">

export class BEMSelectorHandler {
    static blankId = nanoid()
    static dealBlank = (v: { key: string } | null | undefined) => {
        if (!v) return null
        if (v.key === BEMSelectorHandler.blankId) return null
        else return v.key
    }



    constructor(
        public bemStyle: MVModBEMStyle,
        public getCurrent: () => BemTag | null,
        public setCurrent: (tag: BemTag | null) => void
    ) {

    }

    get current() {
        return this.getCurrent()
    }

    set current(value: BemTag | null) {
        this.setCurrent(value)
    }

    mode: 'add-block' | 'add-element' | 'add-modifier' | 'select' = 'select'


    inputValue: string = ''
    disableSelector() { return this.mode !== 'select' }
    backToSelector() {
        this.mode = 'select'
    }


    blockCurrent() {
        if (!this.current) return null
        return this.blockList().find(v => v.key === this.current?.[0]) ?? null
    }
    blockChange(block: string | null) {
        if (!block) this.current = null
        else this.current = [block, null, null]
    }
    blockStartAdd() {
        this.mode = 'add-block'
        this.inputValue = ''
    }
    blockSubmitAdd() {
        if (!this.inputValue) {
            alert('empty string')
        }
        try {
            this.bemStyle.addTag([this.inputValue, null, null])
            this.backToSelector()
            this.current = [this.inputValue, null, null]
        } catch (e: any) {
            alert(e.message)
            throw e
        }
    }


    blockList() {
        return [...new Set(this.bemStyle.getAllTag().map(v => v[0]))].map(key => ({
            label: key, key: key
        }))
    }


    elementCurrent() {
        if (!this.current) return null
        const element = this.current[1] ?? BEMSelectorHandler.blankId
        return this.elementList().find(v => v.key === element) ?? null
    }
    elementChange(element: string | null) {
        if (!this.current) return
        const [block] = this.current
        this.current = [block, element, null]
    }
    elementList() {
        if (!this.current) { return [] }
        const [block] = this.current
        const tag = this.bemStyle.getAllTag().filter(v => v[0] === block)
        const elements = [...new Set(tag.map(v => v[1]))].map(key => ({
            key: key === null ? BEMSelectorHandler.blankId : key,
            label: key === null ? '<empty>' : key
        }))
        return elements
    }
    elementStartAdd() {
        this.mode = 'add-element'
        this.inputValue = ''
    }

    elementSubmitAdd() {
        if (!this.inputValue) {
            return alert('empty string')
        }
        if (!this.current) {
            return alert('emty block')
        }
        const [block] = this.current
        try {
            this.bemStyle.addTag([block, this.inputValue, null])
            this.backToSelector()
            this.current = [block, this.inputValue, null]
        } catch (e: any) {
            alert(e.message)
        }
    }

    modifierCurrent() {
        if (!this.current) return null
        const element = this.current[2] ?? BEMSelectorHandler.blankId
        return this.modifierList().find(v => v.key === element) ?? null
    }
    modifierChange(modifier: string | null) {
        if (!this.current) return
        const [block, element] = this.current
        this.current = [block, element, modifier]
    }
    modifierList() {
        if (!this.current) { return [] }
        const [block, element] = this.current
        const tag = this.bemStyle.getAllTag().filter(v => v[0] === block && v[1] === element)
        const modifiers = [...new Set(tag.map(v => v[2]))].map(key => ({
            key: key === null ? BEMSelectorHandler.blankId : key,
            label: key === null ? '<empty>' : key
        }))
        return modifiers
    }
    modifierStartAdd() {
        this.mode = 'add-modifier'
        this.inputValue = ''
    }

    modifierSubmitAdd() {
        if (!this.inputValue) {
            alert('empty string')
        }
        if (!this.current) {
            return alert('emty block')
        }
        const [block, element] = this.current
        try {
            this.bemStyle.addTag([block, element, this.inputValue])
            this.backToSelector()
            this.current = [block, element, this.inputValue]
        } catch (e: any) {
            alert(e.message)
        }
    }


}

</script>


<script setup lang="ts">
import VxSelector from '@renderer/components/VxInput/VxSelector.vue';
import { computed } from 'vue';
import VxButton from '@renderer/components/VxButton/VxButton.vue';
import { nanoid } from 'nanoid';
import { VxInput } from '@renderer/components';
import { fixReactive } from '@renderer/fix';
import { BemTag, MVModBEMStyle } from '@renderer/mods/mutv-mods/bem';

const props = defineProps<{ bem: MVModBEMStyle }>()
const current = defineModel<BemTag | null>()


const handler = computed(() => {
    return fixReactive(new BEMSelectorHandler(
        props.bem,
        () => current.value ?? null,
        (tag) => current.value = tag)
    )
})



</script>


<template>
    <div class="bem-selector">
        <div class="bem-selector__form-item">
            <div class="bem-selector__label">Block: </div>
            <div class="bem-selector__input">
                <VxInput v-model="handler.inputValue" v-if="handler.mode === 'add-block'">
                    <template #suffix>
                        <VxButton only-icon icon="clear" :click="() => handler.backToSelector()"></VxButton>
                        <VxButton only-icon icon="done" :click="() => handler.blockSubmitAdd()"></VxButton>
                    </template>
                </VxInput>
                <VxSelector v-else :options="handler.blockList()" :disabled="handler.disableSelector()"
                    :model-value="handler.blockCurrent()"
                    @update:model-value="(value) => handler.blockChange(BEMSelectorHandler.dealBlank(value))">
                    <template #suffix>
                        <VxButton only-icon icon="plus" :click="() => handler.blockStartAdd()"></VxButton>
                    </template>
                </VxSelector>

            </div>
        </div>
        <div class="bem-selector__form-item">
            <div class="bem-selector__label">Element: </div>
            <div class="bem-selector__input">
                <VxInput v-model="handler.inputValue" v-if="handler.mode === 'add-element'">
                    <template #suffix>
                        <VxButton only-icon icon="clear" :click="() => handler.backToSelector()"></VxButton>
                        <VxButton only-icon icon="done" :click="() => handler.elementSubmitAdd()"></VxButton>
                    </template>
                </VxInput>
                <VxSelector v-else :options="handler.elementList()"
                    :disabled="handler.disableSelector() || !handler.current" :model-value="handler.elementCurrent()"
                    @update:model-value="(value) => handler.elementChange(BEMSelectorHandler.dealBlank(value))">
                    <template #suffix>
                        <VxButton v-if="handler.current" only-icon icon="plus" :click="() => handler.elementStartAdd()">
                        </VxButton>
                    </template>
                </VxSelector>
            </div>
        </div>
        <div class="bem-selector__form-item">
            <div class="bem-selector__label">Modifier: </div>
            <div class="bem-selector__input">
                <VxInput v-model="handler.inputValue" v-if="handler.mode === 'add-modifier'">
                    <template #suffix>
                        <VxButton only-icon icon="clear" :click="() => handler.backToSelector()"></VxButton>
                        <VxButton only-icon icon="done" :click="() => handler.modifierSubmitAdd()"></VxButton>
                    </template>
                </VxInput>
                <VxSelector v-else :options="handler.modifierList()"
                    :disabled="handler.disableSelector() || !handler.current" :model-value="handler.modifierCurrent()"
                    @update:model-value="(value) => handler.blockChange(BEMSelectorHandler.dealBlank(value))">
                    <template #suffix>
                        <VxButton v-if="handler.current" only-icon icon="plus"
                            :click="() => handler.modifierStartAdd()">
                        </VxButton>
                    </template>
                </VxSelector>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.bem-selector {
    .bem-selector__form-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-top: 6px;

        .bem-selector__label {
            width: 80px;
            flex: 0 0 auto;
        }

        .bem-selector__input {
            flex: 1 1 0;
            width: 0;
        }
    }
}
</style>
