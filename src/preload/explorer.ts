import { FileType } from "@common/file"
import { ipcRenderer } from "electron"

export const explorerApi = {
    addWorkspace: async () => {
        return ipcRenderer.invoke('@explorer/workspace/open') as Promise<string>
    },
    readDir: async (filename: string) => {
        return await ipcRenderer.invoke('@explorer/dir/read', filename) as Promise<{
            name: string,
            url: string,
            type: FileType,
        }[]>
    }
}