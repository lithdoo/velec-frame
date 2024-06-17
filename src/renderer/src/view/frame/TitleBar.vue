<script setup lang="ts">
import logo from '@renderer/assets/icon.png'
const menus = ['文件', '编辑', '选择', '查看', '运行', '帮助']
const drag = {'app-region':'drag'}
</script>

<template>

    <div class="frame-title-bar">
        <div class="frame-title-bar__logo" :style="{ backgroundImage: `url(${logo})` ,...drag}">

        </div>

        <div class="frame-title-bar__menu">
            <div class="frame-title-bar__menu-item" v-for="item in menus" :key="item">
                <div class="frame-title-bar__menu-title">
                    {{ item }}
                </div>
            </div>
        </div>

        <div class="frame-title-bar__extra" :style="drag"></div>

    </div>


</template>

<style>
:root{
    --title-bar-height: 36px;
    --menu-title-padding: 0 8px;
    --menu-title-bg-hover: rgb(255, 255, 255, 0.12);
    --menu-title-radius-hover: 2px;
    --logo-size: 24px;
    --logo-margin: 0 8px 0 8px;
}
</style>

<style lang="scss">
.frame-title-bar {


    display: flex;
    flex-direction: row;
    align-items: center;
    height: var(--title-bar-height);


    .frame-title-bar__logo {
        height: var(--logo-size);
        width: var(--logo-size);
        background-size: contain;
        margin: var(--logo-margin);
        -webkit-app-region: drag;
    }

    .frame-title-bar__menu {
        display: flex;
        flex-direction: row;
        align-items: center;
    }


    .frame-title-bar__menu-item {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .frame-title-bar__menu-title {
        padding: var(--menu-title-padding);

        &:hover {
            background: var(--menu-title-bg-hover);
            border-radius: var(--menu-title-radius-hover);
            cursor: default;
        }
    }

    .frame-title-bar__extra{
        flex: 1 1 0;
        width: 0;
        
        height:100%
    }


}
</style>