import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from "@vitejs/plugin-vue-jsx";
import vsix from '@codingame/monaco-vscode-rollup-vsix-plugin'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({exclude:['vscode-ws-jsonrpc']})],
    resolve: {
      alias: {
        '@common': resolve('src/common')
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('vscode-ws-jsonrpc')) {
              return 'vscode-ws-jsonrpc'
            }
            if(id.includes('jsonServer')){
              return 'jsonServer'
            }
          }
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@common': resolve('src/common')
      }
    },
    plugins: [vue(),vueJsx(),vsix()]
  }
})
