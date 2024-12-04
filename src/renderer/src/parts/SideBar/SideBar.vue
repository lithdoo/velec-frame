<script setup lang="ts">
import { siderControl } from './state';
import { ElementInject } from '@renderer/components/ElementInject';
import { computed } from 'vue';
const target = computed(() => {
    return siderControl.currentPanel()?.element ?? null
})

</script>

<template>
    <div class="frame-side-bar">
        <ElementInject :target="target" />
    </div>
</template>

<style>
:root {
    --side-bar-border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>

<style lang="scss">
.frame-side-bar {
    height: 100%;
    border-right: var(--side-bar-border);
    border-top: var(--side-bar-border);
}
</style>