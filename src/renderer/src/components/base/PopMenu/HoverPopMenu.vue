<script setup lang="ts">
import { Placement } from '@popperjs/core';
import PopMenuLayer from './PopMenuLayer.vue'
import { PopMenuLayerHandler, PopMenuListHandler } from './handler';
import { fixReactive } from '@renderer/fix';

const props = defineProps<{
    menu: PopMenuListHandler,
    placement: Placement
}>()

const layer = fixReactive(new PopMenuLayerHandler())

const mouseenter = (e: MouseEvent) => {
    setTimeout(() => {
        layer.open({
            target: e.target as HTMLElement,
            placement: props.placement
        }, props.menu)
    })

}

const mouseleave = () => {
    hide()
}

const bind = (target: HTMLElement) => {
    target.onmouseenter = mouseenter
    target.onmouseleave = mouseleave
}

let hideTimeout: any = null

const hide = (force: boolean = false) => {
    if (force) {
        layer.clear()
        return
    }
    if (hideTimeout) clearTimeout(hideTimeout)
    hideTimeout = setTimeout(() => {
        layer.clear()
        hideTimeout = null
    }, 1000)
}

const stopHide = () => {
    if (hideTimeout) clearTimeout(hideTimeout)
}




document.body.addEventListener('click', () => hide(true))
document.body.addEventListener('contextmenu', () => hide(true))
document.body.addEventListener('wheel', () => hide(true))


</script>


<template>
    <slot name="triggler" :slot-scope="{ bind }"></slot>
    <PopMenuLayer :handler="layer" @mouseenter="stopHide"></PopMenuLayer>
</template>
