import { ipcRenderer } from 'electron'

export const editorApi = {
  fileContent: async (url: string) => {
    return ipcRenderer.invoke('@editor/file/content', url) as Promise<Buffer>
  }
}
