<script setup lang="ts">
import { computed, ref } from 'vue';
import { contextMenu } from './index'
import { PopMenuLayerHandler, PopMenuListHandler, PopMenuLayer } from '@renderer/components/base/PopMenu';
import { fixReactive } from '@renderer/fix';

document.addEventListener('contextmenu', (_ev) => {
    // contextMenu.ev = ev
})


contextMenu.$emitOpen = (handler: PopMenuListHandler) => {
    if (!archerElement.value) return
    layer.open({ target: archerElement.value, placement: 'right-start' }, handler)
}

const layer = fixReactive(new PopMenuLayerHandler())

const archerElement = ref<HTMLElement>()

const pos = computed(() => {
    if (!contextMenu.ev) return {
        x: '20px',
        y: '20px'
    }
    else return {
        x: contextMenu.ev.clientX + 'px',
        y: contextMenu.ev.clientY + 'px',
    }
})

const stopPropagation = (e: Event) => {
    e.stopPropagation()
}

const clear = () => {
    layer.clear()
}

</script>


<template>
    <div class="global-context-menu__archer" :style="{ 'left': pos.x, 'top': pos.y }" ref="archerElement"
        @contextmenu="stopPropagation"></div>
    <div v-if="pos && layer.stack[0]" class="global-context-menu__mask"
        @contextmenu="e => { stopPropagation(e); clear() }" @mousedown="clear" @wheel="clear"></div>
    <PopMenuLayer :handler="layer"></PopMenuLayer>
</template>


<style>
.global-context-menu__menu {
    z-index: 999;
}

.global-context-menu__archer {
    position: fixed;
    z-index: 999;
    width: 1px;
    height: 1px;
}

.global-context-menu__mask {
    position: fixed;
    z-index: 998;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
}
</style>