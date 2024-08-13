import { TableInfo, SqliteDataType } from '@common/sql'

export class SqliteConnect {

    label: string
    readonly url: string
    constructor(url: string) {
        this.url = url
        this.label = decodeURIComponent(url.split('/').reverse()[0])
    }


    private all(sql: string) {
        return window.sqliteApi.sqlSelectAll(this.url, sql)
    }

    erdData() {
        return window.sqliteApi.getRawData(this.url)
    }

    searchTable(name: string) {
        const sql = `select * from ${name}`
        return this.all(sql)
    }

    private lableSql(table: TableInfo<SqliteDataType>) {
        let sql = `COMMENT ON TABLE ${table.name} IS '${table.label}';`

        table.fieldList.forEach(field => {
            sql += `
            COMMENT ON COLUMN ${table.name}.${field.name} IS '${field.label}';
            `
        })

        return sql
    }

    createTable(table: TableInfo<SqliteDataType>) {
        const rows = table.fieldList
            .map(field => `${field.name
                } ${field.type
                } ${field.notNull ? "NOT NULL" : ""
                } ${field.unique ? "UNIQUE " : ""
                }`).join(',\r\n')

        const pkList = table.fieldList.filter(v => v.primaryKey)

        const pks = pkList.length
            ? `,PRIMARY KEY( ${pkList.map(v => v.name).join(',')} )`
            : ''
        const sql = `
        CREATE TABLE ${table.name}(
        ${rows}
        ${pks}
        );
        `+ this.lableSql(table)

        return window.sqliteApi.sqlRun(this.url, sql)
    }

    renameTable(oldName: string, newName: string) {
        const sql = `ALTER TABLE "${oldName}" to "${newName}";`
        return sql
    }

    deleteTable(name: string) {
        const sql = `DROP TABLE ${name};`
        return window.sqliteApi.sqlRun(this.url, sql)
    }

    commonOnTable(table: TableInfo<SqliteDataType>) {
        const sql = this.lableSql(table)
        return window.sqliteApi.sqlRun(this.url, sql)
    }

    tableInfo(name: string) {
        return window.sqliteApi.getTableInfo(this.url, name)
    }

    insertToTable(table: TableInfo<SqliteDataType>, records: Record<string, string>[], type: 'INSERT' | 'REPLACE' | 'INSERT OR REPLACE' = 'INSERT') {


        const sql = `
        ${type} INTO ${table.name} (${table.fieldList.map(v => v.name).join(', ')}) 
           VALUES ${records.map(record => `(${table.fieldList.map(v => value(v.type, record[v.name]))})`).join(', ')}
        `
        return window.sqliteApi.sqlRun(this.url, sql)
    }

    updateToTable(table: TableInfo<SqliteDataType>, record: Record<string, string>, newone: Record<string, string>) {
        const pks = table.fieldList.filter(v => v.primaryKey)
        const where = pks.length ? pks : table.fieldList

        const sql = `
        UPDATE ${table.name}
        SET ${table.fieldList.map(v => `${v.name} = ${value(v.type, newone[v.name])}`).join(', ')}
        WHERE ${where.map(v => `${v.name} = ${value(v.type, record[v.name])}`).join(' and ')};
        `
        return window.sqliteApi.sqlRun(this.url, sql)
    }

    removeFromTable(table: TableInfo<SqliteDataType>, record: Record<string, string>) {
        const pks = table.fieldList.filter(v => v.primaryKey)
        const where = pks.length ? pks : table.fieldList

        const sql = `
        DELETE FROM ${table.name}
        WHERE ${where.map(v => `${v.name} = ${value(v.type, record[v.name])}`).join(' and ')};
        `
        return window.sqliteApi.sqlRun(this.url, sql)
    }
}



export interface SqliteTableInfo {
    name: string,

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