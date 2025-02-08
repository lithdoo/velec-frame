import { ElectronAPI } from '@electron-toolkit/preload'
import { explorerApi } from './explorer'
import { editorApi } from './editor'
import { sqliteApi } from './sqlite'
import { runnerApi, runerExtApi } from './runner'
import { jsonDataApi } from './jsonData'

declare global {
  interface Window {
    electron: ElectronAPI
    explorerApi: typeof explorerApi
    editorApi: typeof editorApi
    sqliteApi: typeof sqliteApi
    runnerApi: typeof runnerApi
    jsonDataApi: typeof jsonDataApi
    runerExtApi: typeof runerExtApi
    api: unknown
  }
}
