<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import PopMenuList from './PopMenuList.vue'
import { createPopper } from '@popperjs/core';
import { PopMenuLayerHandler } from './handler'

const props = defineProps<{
    handler: PopMenuLayerHandler
}>()

// props.handler.$apply = async (ro) => {
//     await nextTick()
//     if (!ro.container) return
//     if (ro.popper) ro.popper.forceUpdate()
//     ro.popper = createPopper(ro.target, ro.container, { placement: ro.placement })
// }

const stack = computed(() => layer.value.stack)

const layer = computed(() => {
    return props.handler
})

const popers = computed(() => stack.value.map(({ option }) => ([option.container, option.popper])))

watch([popers], () => {
    stack.value.forEach(val => {
        if (val.option.popper) {
            val.option.popper.forceUpdate()
        } else if (val.option.container) {
            val.option.popper = createPopper(val.option.target, val.option.container, { placement: val.option.placement })
        }
    })
})

</script>

<template>
    <div v-if="stack.length" class="menu-layer__menu-container" @click.stop @wheel.stop @contextmenu.stop>
        <template v-for="({ menu, option }, idx) in handler.stack" :key="menu.key"  @mouseenter="$emit('mouseenter')">
            <div class="menu-layer__menu" :style="{ opacity: option.popper ? 1 : 0, zIndex: idx }"
                :ref="el => option.container = el as HTMLDivElement">
                <PopMenuList :handler="menu" :layer="layer"></PopMenuList>
            </div>
        </template>
    </div>
</template>

<style>
.menu-layer__menu {
    position: fixed;
}

.menu-layer__menu-container {
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