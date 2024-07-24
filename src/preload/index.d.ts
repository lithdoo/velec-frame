import { ElectronAPI } from '@electron-toolkit/preload'
import { explorerApi } from './explorer'
import { editorApi } from './editor'
import { sqliteApi } from './sqlite'


declare global {
  interface Window {
    electron: ElectronAPI
    explorerApi: typeof explorerApi
    editorApi: typeof editorApi
    sqliteApi: typeof sqliteApi
    api: unknown,
  }
}
