<script setup lang="ts">
import { computed } from 'vue';
import { VxIcon } from '../VxIcon';
import { MenuListHandler } from './MenuListHandler';

const props = defineProps<{
    handler: MenuListHandler
}>()

const list = computed(() => {
    return props.handler.list
})

</script>

<template>
    <div class="menu-list">
        <div class="menu-list__item" v-for="item in list">
            <template v-if="item.type === 'divide'">
                <hr class="menu-list__divide" />
            </template>
            <template v-if="item.type === 'button'">
                <div @click="item.handler?.onClick" :class="['menu-list__button',item.handler?'':'menu-list__button--disabled']">
                    <div class="menu-list__button-icon">
                        <VxIcon v-if="item.icon" :name="item.icon"></VxIcon>
                    </div>
                    <div class="menu-list__button-label">{{ item.label }}</div>
                </div>
            </template>
        </div>

    </div>

</template>
<style>
:root {
    --menu-list-background: #1b1b1f;
    --menu-list-width: 240px;
    --menu-list-border: 1px solid rgba(255, 255, 255, 0.2);
    --menu-list-border-radius: 4px;
    --menu-list-box-shadow: 0 4px 8px 1px rgba(255, 255, 255, 0.04);
    --menu-list-padding: 4px;

    --menu-list-divide-margin: 4px 0;
    --menu-list-divide-height: 1px;
    --menu-list-divide-background: rgba(255, 255, 255, 0.2);

    --menu-list-button-height: 28px;
    --menu-list-button-font-size: 14px;
    --menu-list-button-text-color: #fff;
    --menu-list-button-disabled-text-color: rgba(255,255,255,0.3);
}
</style>

<style lang="scss" scoped>
.menu-list {
    background: var(--menu-list-background);
    width: var(--menu-list-width);
    border: var(--menu-list-border);
    border-radius: var(--menu-list-border-radius);
    box-shadow: var(--menu-list-box-shadow);
    overflow: hidden;
    padding: var(--menu-list-padding);

    .menu-list__button {
        height: var(--menu-list-button-height);
        border-radius: var(--menu-list-border-radius);
        color: var(--menu-list-button-text-color);
        cursor: pointer;

        &:hover {
            background: #66ccff;
        }

        display: flex;
        flex-direction: row;
        align-items: center;


        &.menu-list__button--disabled{
            color: var(--menu-list-button-disabled-text-color);
            &:hover{
                background: none
            }
        }

        .menu-list__button-icon{
            width: 24px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .menu-list__button-label{
            font-size: var(--menu-list-button-font-size);
        }
        
    }

    .menu-list__divide {
        display: block;
        width: auto;
        border: none;
        height: var(--menu-list-divide-height);
        background: var(--menu-list-divide-background);
        margin: var(--menu-list-divide-margin)
    }
}
</style>