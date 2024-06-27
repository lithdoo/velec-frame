import { ipcMain } from "electron"
import fs from 'fs/promises'
import { tsRunnerConfig } from "./typescript"
import { langCenter } from "./common"
import { jsonRunnerConfig } from "./json"

export class EditorService {
    static install() {
        ipcMain.handle('@editor/file/content', async (_, fileUrl: string) => {
            const content = await fs.readFile(new URL(fileUrl))
            return content
        })
        langCenter.run(tsRunnerConfig())
        langCenter.run(jsonRunnerConfig())
    }
}