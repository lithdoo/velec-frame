import { BrowserWindow, dialog, ipcMain } from 'electron'
import { SqliteConection } from './connection'
import { getRawData } from './erd'
import { promises as fsp } from 'fs'

export * from './connection'
export * from './erd'

export class SqliteService {
  static install(window: BrowserWindow) {
    ipcMain.handle('@sqlite/erd/rawData', async (_, url: string) => {
      const connection = SqliteService.connection(url)
      return await getRawData(connection)
    })

    ipcMain.handle('@sqlite/sql/selectAll', async (_, url: string, sql: string) => {
      const connection = SqliteService.connection(url)
      return await connection.runSelectAll(sql)
    })

    ipcMain.handle('@sqlite/sql/selectAlltoFile', async (_, url: string, sql: string) => {
      const connection = SqliteService.connection(url)
      const result = await connection.runSelectAll(sql)
      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        defaultPath: 'data.json'
      })
      if (!canceled && filePath) {
        await fsp.writeFile(filePath, JSON.stringify(result, null, 2))
      }
    })

    ipcMain.handle('@sqlite/sql/run', async (_, url: string, sql: string, params?: any[]) => {
      const connection = SqliteService.connection(url)
      return await connection.run(sql, params)
    })
    ipcMain.handle(
      '@sqlite/sql/runList',
      async (_, url: string, sqls: string[], params?: any[][]) => {
        const connection = SqliteService.connection(url)
        return await connection.runList(sqls, params)
      }
    )

    ipcMain.handle('@sqlite/table/all', async (_, url: string) => {
      const connection = SqliteService.connection(url)
      return await connection.getAllTables()
    })

    ipcMain.handle('@sqlite/table/info', async (_, url: string, name: string) => {
      const connection = SqliteService.connection(url)
      return await connection.getTableInfo(name)
    })

    // ipcMain.handle('@sqlite/table/data', async (_, url: string,sql:string) => {
    //     const connection = SqliteService.connection(url)
    //     return await connection.run(sql)
    // })
  }

  static connections: Map<string, SqliteConection> = new Map()

  static connection(url: string) {
    const connection = this.connections.get(url)
    if (connection) {
      return connection
    } else {
      const connection = new SqliteConection(url)
      SqliteService.connections.set(url, connection)
      connection.onDestroy = () => {
        SqliteService.connections.delete(url)
      }
      return connection
    }
  }

  static {
    const chechTimeout = () => {
      Array.from(SqliteService.connections.values()).forEach((v) => v.chechTimeout())
      setTimeout(chechTimeout, 1000 * 60 * 1)
    }
    chechTimeout()
  }
}
