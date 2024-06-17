<script setup lang="ts">
import { computed } from 'vue';
import { contextMenu } from './index'
import { Menu, MenuList, MenuListHandler } from '@renderer/components/base/MenuList'

document.addEventListener('contextmenu', (ev) => {
    console.log(contextMenu)
    contextMenu.ev = ev
    contextMenu.open(MenuListHandler.create([
        Menu.button({ icon: 'del', key: '3', label: '撤销', onClick: () => { alert('打开文件') }}),
        Menu.button({ icon: 'del', key: '4', label: '恢复' }),
        Menu.div(),
        Menu.button({ key: '1', label: '打开文件', onClick: () => { alert('打开文件') }}),
        Menu.button({ key: '2', label: '打开文件夹', onClick: () => { alert('打开文件') }}),
        Menu.div(),
        Menu.button({ icon: 'del', key: '5', label: '粘贴', onClick: () => { alert('打开文件') }}),
        Menu.button({ icon: 'del', key: '6', label: '复制', onClick: () => { alert('打开文件') }}),
        Menu.button({ icon: 'del', key: '7', label: '剪切', onClick: () => { alert('打开文件') }}),
    ]))
})

const menu = computed(() => contextMenu.current)

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



</script>


<template>
    <div v-if="pos && menu" class="gloal-context-menu" :style="{ 'left': pos.x, 'top': pos.y }">
        <MenuList :handler="menu"></MenuList>
    </div>
</template>

<style>
.gloal-context-menu {
    position: fixed;
    z-index: 999;
}
</style>