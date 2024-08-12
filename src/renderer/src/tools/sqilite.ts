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

    tableInfo(name:string){
        return window.sqliteApi.getTableInfo(this.url,name)
    }

    insertToTable() {

    }

    removeFromTable() {
    }
}



export interface SqliteTableInfo {
    name: string,

}