<script setup lang="ts">
import AppFrame from './view/frame/Index.vue'
import GlobalContextMenu from './view/fixed/contextmenu/GlobalContextMenu.vue';
import { ConfigProvider,theme } from 'ant-design-vue'

// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <ConfigProvider :theme="{
    token: {
      borderRadius: 0,
    },
    algorithm:[theme.darkAlgorithm,theme.compactAlgorithm]
  }">
    <AppFrame />
    <GlobalContextMenu />
  </ConfigProvider>
  <!-- <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div>
  <Versions /> -->
</template>
