import { FileType } from "@common/file"
import { ipcRenderer } from "electron"

export const editorApi = {
    fileContent: async (url: string) => {
        return ipcRenderer.invoke('@editor/file/content', url) as Promise<Buffer>
    },
    readDir: async (filename: string) => {
        return await ipcRenderer.invoke('@explorer/dir/read', filename) as Promise<{
            name: string,
            url: string,
            type: FileType,
        }[]>
    }
}