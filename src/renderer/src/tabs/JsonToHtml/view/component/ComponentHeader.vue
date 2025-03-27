<script setup lang="ts">
import { fixReactive } from '@renderer/fix';
import { JthComponent } from '@renderer/mods/json2html/base/JthState';
import InputText, { InputTextHandler } from '../common/InputText.vue'

const props = defineProps<{
    component: JthComponent,
    actived: boolean,
    active: () => void
}>()

const inputText = fixReactive(new class extends InputTextHandler {
    text() { return props.component.keyName }
    submit(text: string): void { props.component.keyName = text }
})

</script>

<template>
    <div class="jth-component-header" :data-actived="actived" @click="() => active()">
        <InputText :handler="inputText"></InputText>
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
    cursor: pointer;


    &[data-actived="true"] {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-weight: bolder;
    }
}
</style>