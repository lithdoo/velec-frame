import { ElectronAPI } from '@electron-toolkit/preload'
import { explorerApi } from './explorer'

declare global {
  interface Window {
    electron: ElectronAPI
    explorerApi: typeof explorerApi
    api: unknown,
  }
}
