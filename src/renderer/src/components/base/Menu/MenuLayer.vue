<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { MenuList } from '@renderer/components/base/Menu'
import { createPopper } from '@popperjs/core';
import type { Instance } from '@popperjs/core'
import { MenuLayerHandler } from './MenuHandler'


const props = defineProps<{
    handler: MenuLayerHandler
}>()

props.handler.$apply = async (ro) => {
    await nextTick()
    if (!ro.container) return
    if (ro.popper) ro.popper.forceUpdate()
    ro.popper = createPopper(ro.pos.target, ro.container, { placement: ro.pos.place })
}

const handler = computed(() => {
    return props.handler
})

const clear = () => {
    props.handler.clear()
}

</script>


<template>
    <div v-if="handler.stack.length" class="menu-layer__mask" @contextmenu="clear()" @mousedown="clear" @wheel="clear">
    </div>
    <template v-for="menu in handler.stack"  :key="menu.key" >
        <div class="menu-layer__menu" :style="{ opacity: menu.popper ? 1 : 0 }"
            :ref="el => menu.container = el as HTMLDivElement">
            <MenuList :handler="menu.handler"></MenuList>
        </div>
    </template>
</template>

<style>
.menu-layer__menu {
    z-index: 999;
}

.menu-layer__archer {
    position: fixed;
    z-index: 999;
    width: 1px;
    height: 1px;
}

.menu-layer__mask {
    position: fixed;
    z-index: 998;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
}
</style>