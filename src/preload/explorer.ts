import { FileStat, FileType } from '@common/file'
import { ipcRenderer } from 'electron'

export const explorerApi = {
  addWorkspace: async () => {
    return ipcRenderer.invoke('@explorer/workspace/open') as Promise<string>
  },
  selectFile: async (option: { extensions?: string[] } = {}) => {
    return ipcRenderer.invoke('@explorer/file/select', option) as Promise<string | null>
  },
  selectDir: async () => {
    return ipcRenderer.invoke('@explorer/dir/select') as Promise<string | null>
  },

  fileStat: async (fileUrl: string) => {
    return ipcRenderer.invoke('@explorer/file/stat', fileUrl) as Promise<FileStat | null>
  },
  readDir: async (filename: string) => {
    return (await ipcRenderer.invoke('@explorer/dir/read', filename)) as Promise<
      | {
          name: string
          url: string
          type: FileType
        }[]
      | null
    >
  },
  readJson: async (filename: string) => {
    return (await ipcRenderer.invoke('@explorer/json/read', filename)) as Promise<any>
  },
  readContent: async (filename: string) => {
    return (await ipcRenderer.invoke('@explorer/content/read', filename)) as Promise<string | null>
  },
  saveContent: async (filename: string, content: string) => {
    return (await ipcRenderer.invoke('@explorer/content/write', filename, content)) as Promise<void>
  },
  getFileTemplates: async () => {
    return (await ipcRenderer.invoke('@explorer/file/template/list')) as Promise<
      {
        name: string
        url: string
        ext: string
      }[]
    >
  },
  createFileFromTemplate: async (fileName: string, templateUrl: string, dirUrl: string) => {
    return (await ipcRenderer.invoke('@explorer/file/create-from-template', {
      fileName,
      templateUrl,
      dirUrl
    })) as Promise<void>
  },
  onDirChanged: (callback: (dirUrl: string) => void) => {
    ipcRenderer.on('@explorer/workspace/directory-changed', (_, str: string) => {
      callback(str)
    })
  }
}
