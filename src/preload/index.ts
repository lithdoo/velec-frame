import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { explorerApi } from './explorer'
import { editorApi } from './editor'

// Custom APIs for renderer
const api = {
  
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('explorerApi', explorerApi)
    contextBridge.exposeInMainWorld('editorApi', editorApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.explorerApi = explorerApi
}
