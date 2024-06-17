<script setup lang="ts">
import { appSider } from '@renderer/state/sider';
import { ElementInject } from '@renderer/components/base/ElementInject';
import { computed } from 'vue';
const element = computed(() => appSider.currentPanel()?.element ?? null)
</script>

<template>
    <div class="frame-side-bar">
        <ElementInject :target="element" :style="{ 'height': '100%' }" />
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