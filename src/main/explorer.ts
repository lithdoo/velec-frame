import { FileType } from "@common/file"
import { dialog, ipcMain } from "electron"
import fs from 'fs/promises'
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
            const list = await fs.readdir(new URL(fileUrl), { withFileTypes: true })
            return list.filter(v => v.isDirectory || v.isFile).map(val => {
                return {
                    name: val.name,
                    url: pathToFileURL(path.resolve(val.path, val.name)).toString(),
                    type: val.isDirectory() ? FileType.Directory : FileType.File
                }
            })
        })
    }

}