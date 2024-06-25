import { FileType } from "@common/file"
import { dialog, ipcMain } from "electron"
import fs from 'fs/promises'
import path from 'path';

export default function pathToUrl(filePath, options = { resolve: true }) {
    if (typeof filePath !== 'string') {
        throw new TypeError(`Expected a string, got ${typeof filePath}`);
    }

    const { resolve = true } = options;

    let pathName = filePath;
    if (resolve) {
        pathName = path.resolve(filePath);
    }

    pathName = pathName.replace(/\\/g, '/');

    // Windows drive letter must be prefixed with a slash.
    if (pathName[0] !== '/') {
        pathName = `/${pathName}`;
    }

    // Escape required characters for path components.
    // See: https://tools.ietf.org/html/rfc3986#section-3.3
    return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
}


export class ExplorerService {
    static install() {
        ipcMain.handle('@explorer/workspace/open', async () => {
            const data = await dialog.showOpenDialog({ properties: ['openDirectory'] })
            if (!data.canceled && data.filePaths[0]) {
                return pathToUrl(data.filePaths[0])
            } else {
                return ''
            }
        })

        ipcMain.handle('@explorer/dir/read', async (_, fileUrl: string) => {
            const list = await fs.readdir(new URL(fileUrl), { withFileTypes: true })
            return list.filter(v => v.isDirectory || v.isFile).map(val => {
                return {
                    name: val.name,
                    url: pathToUrl(path.resolve(val.path,val.name)),
                    type: val.isDirectory() ? FileType.Directory : FileType.File
                }
            })
        })
    }

}