import { ipcMain } from "electron"
import fs from 'fs/promises'
import { tsRunnerConfig } from "./typescript"
import { langCenter } from "./common"
import { jsonRunnerConfig } from "./json"
import { sqlRunnerConfig } from './sql'

export class EditorService {
    static async install() {
        ipcMain.handle('@editor/file/content', async (_, fileUrl: string) => {
            const content = await fs.readFile(new URL(fileUrl))
            return content
        })
        langCenter.run(tsRunnerConfig())
        langCenter.run(jsonRunnerConfig())
        langCenter.run(sqlRunnerConfig())
    }
}