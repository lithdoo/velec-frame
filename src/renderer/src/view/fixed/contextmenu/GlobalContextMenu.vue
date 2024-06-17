<script setup lang="ts">
import { computed } from 'vue';
import { contextMenu } from './index'

document.addEventListener('contextmenu', (ev) => {
    console.log(contextMenu)
    contextMenu.ev = ev

    contextMenu.open([])
})

const menu = computed(() => contextMenu.current)

const pos = computed(() => {
    if (!contextMenu.ev) return null
    return {
        x: contextMenu.ev.clientX,
        y: contextMenu.ev.clientY
    }
})

</script>


<template>
    <div v-if="pos && menu" class="gloal-context-menu" :style="{ 'left': pos.x + 'px', 'top': pos.y + 'px'}">
        fdsaff
    </div>


</template>

<style>
.gloal-context-menu {
    position: fixed;
    background: #ccc;
    z-index: 999;
}
</style>