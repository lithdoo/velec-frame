<script setup lang="ts">
import AppFrame from './Frame.vue'
import { ConfigProvider, theme } from 'ant-design-vue'

// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <ConfigProvider
    :theme="{
      token: {
        borderRadius: 0,
        fontSize: 13
      },
      algorithm: [theme.darkAlgorithm]
    }"
  >
    <AppFrame />
  </ConfigProvider>
</template>
