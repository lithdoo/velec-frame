import { FileType } from '@common/file'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import { promises as fsp } from 'fs'
import { existsSync } from 'fs'
import * as fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'
import { findAppSettingDir } from './utils'

export class ExplorerService {
  static install(window: BrowserWindow) {
    const emitDirChanged = (url: string) => {
      window.webContents.send('@explorer/workspace/directory-changed', url)
    }

    ipcMain.handle('@explorer/workspace/open', async () => {
      const data = await dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (!data.canceled && data.filePaths[0]) {
        return pathToFileURL(data.filePaths[0]).toString()
      } else {
        return ''
      }
    })

    ipcMain.handle('@explorer/dir/select', async () => {
      const data = await dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (!data.canceled && data.filePaths[0]) {
        return pathToFileURL(data.filePaths[0]).toString()
      } else {
        return ''
      }
    })

    ipcMain.handle('@explorer/file/select', async (_, options: { extensions?: string[] }) => {
      const data = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Files', extensions: options.extensions ?? ['*'] }]
      })
      if (!data.canceled && data.filePaths[0]) {
        return pathToFileURL(data.filePaths[0]).toString()
      } else {
        return null
      }
    })

    ipcMain.handle('@explorer/dir/read', async (_, fileUrl: string) => {
      if (!existsSync(new URL(fileUrl))) {
        return null
      }
      const list = await fsp.readdir(new URL(fileUrl), { withFileTypes: true })
      return list
        .filter((v) => v.isDirectory || v.isFile)
        .map((val) => {
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

    ipcMain.handle('@explorer/content/read', async (_, fileUrl: string) => {
      console.log(fileUrl)
      if (!existsSync(new URL(fileUrl))) {
        return null
      }
      try {
        const content = fs.readFileSync(new URL(fileUrl)).toString()
        return content
      } catch (_e) {
        return null
      }
    })

    ipcMain.handle('@explorer/file/stat', async (_, fileUrl: string) => {
      if (!existsSync(new URL(fileUrl))) {
        return null
      }

      const stat = fs.statSync(new URL(fileUrl))
      if (stat.isDirectory()) {
        return null
      } else {
        return {
          size: stat.size,
          mtimeMs: stat.mtimeMs
        }
      }
    })

    ipcMain.handle('@explorer/json/write', async (_, fileUrl: string, content: string) => {
      console.log({
        fileUrl,
        content
      })
      try {
        const text = JSON.stringify(content)
        fs.writeFileSync(new URL(fileUrl), text)
      } catch (_e) { }
    })

    ipcMain.handle('@explorer/content/write', async (_, fileUrl: string, content: string) => {
      console.log({
        fileUrl,
        content
      })
      try {
        fs.writeFileSync(new URL(fileUrl), content)
      } catch (_e) { }
    })

    ipcMain.handle('@explorer/setting/file/url', async (_, filePath: string) => {
      const settingDir = await findAppSettingDir()
      if (!settingDir) return ''
      const templateDir = path.join(settingDir, filePath)
      return pathToFileURL(templateDir).href
    })

    ipcMain.handle('@explorer/file/template/list', async (_) => {
      const settingDir = await findAppSettingDir()
      if (!settingDir) {
        return []
      }
      const templateDir = path.join(settingDir, 'templates')
      if (!existsSync(templateDir)) {
        return []
      }
      const files = (await fs.promises.readdir(templateDir))
        .map((file) => {
          return {
            name: file,
            path: path.join(templateDir, file),
            stat: fs.statSync(path.join(templateDir, file))
          }
        })
        .filter((file) => file.stat.isFile())

      const templates = files.map((file) => {
        const [name, ...exts] = file.name.split('.')
        let ext = exts.join('.')
        if (ext) {
          ext = '.' + ext
        }
        return {
          name,
          ext,
          url: pathToFileURL(file.path).href
        }
      })

      return templates
    })

    ipcMain.handle(
      '@explorer/file/create-from-template',
      async (
        _,
        option: {
          fileName: string
          templateUrl: string
          dirUrl: string
        }
      ) => {
        const templatePath = fileURLToPath(option.templateUrl)
        const dirPath = fileURLToPath(option.dirUrl)
        await fs.promises.copyFile(templatePath, path.join(dirPath, option.fileName))
        emitDirChanged(option.dirUrl)
      }
    )
  }
}
