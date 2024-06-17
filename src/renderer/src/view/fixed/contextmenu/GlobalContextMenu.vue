<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { contextMenu } from './index'
import { MenuList } from '@renderer/components/base/MenuList'
import { createPopper } from '@popperjs/core';
import type { Instance } from '@popperjs/core'

document.addEventListener('contextmenu', (ev) => {
    contextMenu.ev = ev
})

const menu = computed(() => contextMenu.current)
const pop = ref<Instance | null>(null)

const archerElement = ref<HTMLElement>()
const menuElement = ref<HTMLElement>()

onMounted(() => {
    if (archerElement.value && menuElement.value) {
        pop.value = createPopper(archerElement.value, menuElement.value, { placement: 'right-start' })
    }
})

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

const isMenuVisible = ref(false)

const hide = () => {
    isMenuVisible.value = false
    setTimeout(() => {
        contextMenu.close()
    });
}

const show = () => {
    if (pop.value) pop.value.forceUpdate()
    isMenuVisible.value = true
}

watch([menu],(menu)=>{
    isMenuVisible.value = false
    if(menu){
        setTimeout(()=>{
            show()
        })
    }
})

</script>


<template>
    <div v-if="pos && menu" class="global-context-menu__mask" @contextmenu="e => { stopPropagation(e); hide() }"
        @mousedown="hide" @wheel="hide"></div>
    <div class="global-context-menu__archer" :style="{ 'left': pos.x, 'top': pos.y }" ref="archerElement"
        @contextmenu="stopPropagation"></div>
    <div class="global-context-menu__menu" ref="menuElement" :style="{ opacity: isMenuVisible ? 1 : 0 }"
        @contextmenu="stopPropagation">
        <MenuList v-if="pos && menu" :handler="menu"></MenuList>
    </div>
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