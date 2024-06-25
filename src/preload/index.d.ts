import { ElectronAPI } from '@electron-toolkit/preload'
import { explorerApi } from './explorer'
import { editorApi } from './editor'

declare global {
  interface Window {
    electron: ElectronAPI
    explorerApi: typeof explorerApi
    editorApi: typeof editorApi
    api: unknown,
  }
}
