<script setup lang="ts">
import VxIcon from '../base/VxIcon.vue';

const list = new Array(7).fill(0)
    .map(_ => ({
        icon: 'exit'
    }))
</script>


<template>
    <ul class="frame-activity-bar">
        <li v-for="(v,i) in list" :key="i">
            <VxIcon :name="v.icon"></VxIcon>
        </li>
    </ul>
</template>


<style scoped lang="scss">
.frame-activity-bar{
    --activity-bar-width: 48px;
    --activity-bar-item-height: 48px;
    --activity-bar-icon-size: 24px;
    --activity-bar-border: 1px solid rgba(255,255,255,0.1);

    
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    width: var(--activity-bar-width);

    font-size: 16px;
    border-top: var(--activity-bar-border);
    border-right: var(--activity-bar-border);
    height: 100%;

    li{
        height: var(--activity-bar-item-height);
        width: var(--activity-bar-width);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--activity-bar-icon-size);
    }
}
</style>

