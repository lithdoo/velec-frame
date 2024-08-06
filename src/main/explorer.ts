import { FileType } from "@common/file"
import { dialog, ipcMain } from "electron"
import { promises as fsp } from 'fs'
import { existsSync } from 'fs'
import * as fs from 'fs'
import path from 'path';
import { pathToFileURL } from 'node:url'


export class ExplorerService {
    static install() {
        ipcMain.handle('@explorer/workspace/open', async () => {
            const data = await dialog.showOpenDialog({ properties: ['openDirectory'] })
            if (!data.canceled && data.filePaths[0]) {
                return pathToFileURL(data.filePaths[0]).toString()
            } else {
                return ''
            }
        })

        ipcMain.handle('@explorer/dir/read', async (_, fileUrl: string) => {
            if (!existsSync(new URL(fileUrl))) {
                return null
            }
            const list = await fsp.readdir(new URL(fileUrl), { withFileTypes: true })
            return list.filter(v => v.isDirectory || v.isFile).map(val => {
                return {
                    name: val.name,
                    url: pathToFileURL(path.resolve(val.path, val.name)).toString(),
                    type: val.isDirectory() ? FileType.Directory : FileType.File
                }
            })
        })

        ipcMain.handle('@explorer/json/read', async (_, fileUrl: string) => {
            if (!existsSync(new URL(fileUrl))) {
                return null
            }

            try {
                const content = fs.readFileSync(new URL(fileUrl))
                const text = content.toString()
                const json = JSON.parse(text)
                return json
            } catch (_e) {
                return null
            }
        })

        ipcMain.handle('@explorer/json/write', async (_, fileUrl: string, content: any) => {
            try {
                const text = JSON.stringify(content)
                fs.writeFileSync(new URL(fileUrl), text)
            } catch (_e) {
            }
        })
    }

}