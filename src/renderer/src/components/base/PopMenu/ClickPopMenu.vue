<script setup lang="ts">
import { Placement } from '@popperjs/core';
import PopMenuLayer from './PopMenuLayer.vue'
import { PopMenuLayerHandler, PopMenuListHandler } from './handler';
import { fixReactive } from '@renderer/fix';
import { onUnmounted } from 'vue';

const props = defineProps<{
    menu: PopMenuListHandler,
    placement: Placement
}>()

const layer = fixReactive(new PopMenuLayerHandler())

const click = (e: MouseEvent) => {
    setTimeout(() => {
        layer.open({
            target: e.target as HTMLElement,
            placement: props.placement
        }, props.menu)
    })

}

const bind = (target: HTMLElement) => {
    target.onclick = click
}

let hideTimeout: any = null

const hide = (force: boolean = true) => {
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

const remove = () => { hide(true) }

document.body.addEventListener('click', remove)
document.body.addEventListener('contextmenu', remove)
document.body.addEventListener('wheel', remove)

onUnmounted(() => {
    document.body.removeEventListener('click', remove)
    document.body.removeEventListener('contextmenu', remove)
    document.body.removeEventListener('wheel', remove)
})

</script>


<template>
    <slot name="triggler" :slot-scope="{ bind }"></slot>
    <PopMenuLayer :handler="layer" @mouseenter="stopHide"></PopMenuLayer>
</template>
