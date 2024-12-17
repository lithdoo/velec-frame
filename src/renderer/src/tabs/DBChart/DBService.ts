import { SqliteDataType, TableInfo } from "@common/sql"

export class DBService {
    constructor(public dbUrl: string) {
    }

    protected async run(sql: string) {
        return await window.sqliteApi.sqlRun(this.dbUrl, sql)
    }
    protected async select(sql: string) {
        return await window.sqliteApi.sqlSelectAll(this.dbUrl, sql)
    }
    protected async runList(sqls: string[]) {
        return await window.sqliteApi.sqlRunList(this.dbUrl, sqls)
    }

}


export class DBChartService extends DBService {

    async init() {
        const sqlCreateLabelStore = `
        CREATE TABLE IF NOT EXISTS ${HiddenTable.Comment}(
            key_name TEXT PRIMARY KEY,
            content TEXT NOT NULL
        );`
        const sqlCreateVFKeyStore = `
        CREATE TABLE IF NOT EXISTS ${HiddenTable.Relation}(
            id TEXT PRIMARY KEY,
            from_table_name TEXT NOT NULL,
            to_table_name TEXT NOT NULL,
            from_field_name TEXT NOT NULL,
            to_field_name TEXT NOT NULL
        );`
        const sqlCreateEntityStore = `
        CREATE TABLE IF NOT EXISTS ${HiddenTable.Render}(
            table_name TEXT PRIMARY KEY,
            pos_left INTEGER NOT NULL,
            pos_top INTEGER NOT NULL,
            size_width INTEGER NOT NULL,
            size_height INTEGER NOT NULL,
            color TEXT NOT NULL,
            list_idx INTEGER NOT NULL
        );`

        await this.run(sqlCreateLabelStore)
        await this.run(sqlCreateVFKeyStore)
        await this.run(sqlCreateEntityStore)

        return this
    }

    async getAllTableInfo() {
        return (await window.sqliteApi.getAllTables(this.dbUrl))
        // .filter(v => !HiddenTableSet.has(v.name as any))
    }

    async getCommentStore() {
        const sql = `SELECT * FROM ${HiddenTable.Comment}`
        return await window.sqliteApi.sqlSelectAll(this.dbUrl, sql) as CommentStoreRecord[]
    }

    async getRelatioStore() {
        const sql = `SELECT * FROM ${HiddenTable.Relation}`
        return await window.sqliteApi.sqlSelectAll(this.dbUrl, sql) as RelationStoreRecord[]
    }

    async updateRenderRecords(records: RenderStoreRecord[]) {
        const sql = `INSERT OR REPLACE INTO ${HiddenTable.Render} (table_name, pos_left, pos_top, size_width, size_height, color, list_idx ) VALUES ${records.map(record => `
                ('${record.table_name}', ${record.pos_left}, ${record.pos_top}, ${record.size_width}, ${record.size_height}, '${record.color}', ${record.list_idx})`).join(',')
            }`
        await this.run(sql)
    }

    async getRenderStore() {
        const sql = `SELECT * FROM ${HiddenTable.Render} ORDER BY list_idx ASC`
        return await window.sqliteApi.sqlSelectAll(this.dbUrl, sql) as RenderStoreRecord[]
    }

    async updateEntityPos(entityName: string, pos_left: number, pos_top: number) {
        const sql = `UPDATE ${HiddenTable.Render} SET pos_left = ${pos_left}, pos_top = ${pos_top} WHERE table_name = '${entityName}'`
        await this.run(sql)
    }
    async clearData() {
        const sqls = Array.from(Object.values(HiddenTable))
            .flatMap(table => [`DROP TABLE ${table};`])
        await Promise.all(sqls.map(sql => this.run(sql)))
    }

    async sortTable(list: { table: string, idx: number }[]) {
        const sqls = list.map(({ table, idx }) => `UPDATE ${HiddenTable.Render} SET list_idx = ${idx} WHERE table_name = '${table}'`)
        await this.runList(sqls)
    }

    async createBlankTable(name: string) {
        const sql = `CREATE TABLE IF NOT EXISTS ${name}(id TEXT);`
        console.log(sql)
        await this.run(sql)
    }

    async deleteTable(name: string) {
        const sqls = [`DROP TABLE ${name};`, `DELETE FROM ${HiddenTable.Render} WHERE table_name = '${name}'`]
        await this.runList(sqls)
    }

    async renameTable(oldName: string, newName: string) {
        const sqls = [
            `ALTER TABLE ${oldName} RENAME TO ${newName};`,
            `UPDATE ${HiddenTable.Render} SET table_name = '${newName}' WHERE table_name = '${oldName}';`
        ]
        await this.runList(sqls)
    }

    async renameField(table: SqliteTableInfo, oldName: string, newName: string) {
        // const moveOldtoTemp = `ALTER TABLE ${table.name} RENAME TO ${table.name}_temp;`

        const createNewTempTable = `CREATE TABLE IF NOT EXISTS ${table.name}_temp (${table.fieldList.map((col, idx) => {
            return `${idx !== 0 ? ',\n' : '\n'}   ${col.name === oldName ? newName : col.name
                } ${col.type
                } ${col.primaryKey ? 'PRIMARY KEY' : ''
                } ${col.notNull ? 'NOT NULL' : ''
                }`
        }).join('')}\n);`
        const moveData = `INSERT INTO ${table.name}_temp(${table.fieldList.map(v => v.name === oldName ? newName : v.name).join(', ')}) SELECT ${table.fieldList.map(v => v.name).join(', ')} FROM ${table.name};`
        const dropOldTable = `DROP TABLE ${table.name};`
        const renameNewTable = `ALTER TABLE ${table.name}_temp RENAME TO ${table.name};`
        await this.runList([
            createNewTempTable, moveData, dropOldTable, renameNewTable
        ])
    }

    async addField(table: SqliteTableInfo, oldName: string, type: SqliteDataType) {
        const alterTable = `ALTER TABLE ${table.name} ADD COLUMN ${oldName} ${type};`
        await this.run(alterTable)
    }
    async deleteField(table: SqliteTableInfo, field: string,) {
        // const alterTable = `ALTER TABLE ${table.name} ADD COLUMN ${oldName} ${type};`
        // await this.run(alterTable)

        const fields = table.fieldList.filter(v => v.name !== field)

        const createNewTempTable = `CREATE TABLE IF NOT EXISTS ${table.name}_temp (${fields.map((col, idx) => {
            return `${idx !== 0 ? ',\n' : '\n'}   ${col.name
                } ${col.type
                } ${col.primaryKey ? 'PRIMARY KEY' : ''
                } ${col.notNull ? 'NOT NULL' : ''
                }`
        }).join('')}\n);`
        const moveData = `INSERT INTO ${table.name}_temp(${fields.map(v => v.name).join(', ')}) SELECT ${fields.map(v => v.name).join(', ')} FROM ${table.name};`
        const dropOldTable = `DROP TABLE ${table.name};`
        const renameNewTable = `ALTER TABLE ${table.name}_temp RENAME TO ${table.name};`
        await this.runList([
            createNewTempTable, moveData, dropOldTable, renameNewTable
        ])
    }

}

export class DBRecordsService extends DBService {
    constructor(dbUrl: string) {
        super(dbUrl)
    }
    async tableInfo(name: string) {
        return window.sqliteApi.getTableInfo(this.dbUrl, name)
    }

    async insertToTable(table: TableInfo<SqliteDataType>, records: Record<string, string>[], type: 'INSERT' | 'REPLACE' | 'INSERT OR REPLACE' = 'INSERT') {
        const sql = `
        ${type} INTO ${table.name} (${table.fieldList.map(v => v.name).join(', ')}) 
           VALUES ${records.map(record => `(${table.fieldList.map(v => value(v.type, record[v.name]))})`).join(', ')}
        `
        return await this.run(sql)
    }

    async searchTable(name: string) {
        const sql = `select * from ${name}`
        return this.select(sql)
    }

    async updateToTable(table: SqliteTableInfo, record: Record<string, string>, newone: Record<string, string>) {
        const pks = table.fieldList.filter(v => v.primaryKey)
        const where = pks.length ? pks : table.fieldList

        const sql = `
        UPDATE ${table.name}
        SET ${table.fieldList.map(v => `${v.name} = ${value(v.type, newone[v.name])}`).join(', ')}
        WHERE ${where.map(v => `${v.name} = ${value(v.type, record[v.name])}`).join(' and ')};
        `
        return await this.run(sql)
    }

    async removeFromTable(table: TableInfo<SqliteDataType>, record: Record<string, string>) {
        const pks = table.fieldList.filter(v => v.primaryKey)
        const where = pks.length ? pks : table.fieldList

        const sql = `
        DELETE FROM ${table.name}
        WHERE ${where.map(v => `${v.name} = ${value(v.type, record[v.name])}`).join(' and ')};
        `
        return await this.run(sql)
    }
}

function value(type: SqliteDataType, value?: string) {
    if (!value) return 'NULL'
    if (type === SqliteDataType.TEXT) return `"${value.replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"')
        }"`
    if (type === SqliteDataType.INTEGER) return value
    if (type === SqliteDataType.NUMERIC) return value

    throw new Error()
}

export type SqliteTableInfo = TableInfo<SqliteDataType>

export enum HiddenTable {
    Comment = 'GH_SQLERD_STATE_COMMENT_V0',
    Render = 'GH_SQLERD_STATE_RENDER_V0',
    Relation = 'GH_SQLERD_STATE_RELATION_V0'
}

export const HiddenTableSet = new Set(Object.values(HiddenTable))

export type CommentStoreRecord = {
    key_name: string,
    content: string
}

export type RenderStoreRecord = {
    table_name: string,
    pos_left: number,
    pos_top: number,
    size_width: number,
    size_height: number,
    color: string,
    list_idx: number
}

export type RelationStoreRecord = {
    id: string,
    from_table_name: string,
    to_table_name: string,
    from_field_name: string,
    to_field_name: string,
}