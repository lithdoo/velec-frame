import { SqliteDataType } from '@common/sql'
import { SqliteTableInfo } from './DBService'

export class EvEventTable<
  // S extends string,
  T extends { [key: string]: any[] }
> {
  mapo: { [Key in keyof T]: (...inputs: T[Key]) => void | Promise<void> } = {} as any

  async emit<KeyName extends keyof T>(name: KeyName, ...inputs: T[KeyName]) {
    console.log(this)
    const callback = this.mapo[name]
    if (callback) {
      await callback(...inputs)
    }
  }

  on<KeyName extends keyof T>(
    name: KeyName,
    callback: (...inputs: T[KeyName]) => void | Promise<void>
  ) {
    this.mapo[name] = callback
  }
}

export class ChartControl extends EvEventTable<{
  ['table:delete']: [string]
  ['table:add']: [string] | []
  ['table:focus']: [string]
  ['table:rename']: [string, string]
  ['field:rename']: [SqliteTableInfo, string, string]
  ['field:add']: [SqliteTableInfo, string, SqliteDataType]
  ['field:delete']: [SqliteTableInfo, string]
  ['table:showDataGrid']: [string, 'view' | 'insert']
  ['db:showExecuteEditor']: []
  ['db:sortTables']: [{ table: string; idx: number }[]]
  ['chart:reload']: []
  ['chart:clearCache']: []
}> {}
