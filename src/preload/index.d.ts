import { ElectronAPI } from '@electron-toolkit/preload'
import { explorerApi } from './explorer'
import { editorApi } from './editor'
import { sqliteApi } from './sqlite'
import { runnerApi } from './runner'

declare global {
  interface Window {
    electron: ElectronAPI
    explorerApi: typeof explorerApi
    editorApi: typeof editorApi
    sqliteApi: typeof sqliteApi
    runnerApi: typeof runnerApi
    api: unknown,
  }
}
