import { FileType } from "@common/file"
import { ipcRenderer } from "electron"

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
    readDir: async (filename: string) => {
        return await ipcRenderer.invoke('@explorer/dir/read', filename) as Promise<{
            name: string,
            url: string,
            type: FileType,
        }[] | null>
    },
    readJson: async (filename: string) => {
        return await ipcRenderer.invoke('@explorer/json/read', filename) as Promise<any>
    },
    saveJson: async (filename: string, json: any) => {
        return await ipcRenderer.invoke('@explorer/json/write', filename, json) as Promise<void>
    }
}