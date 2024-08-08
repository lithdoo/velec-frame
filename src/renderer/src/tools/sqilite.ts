



export interface FieldInfo<DataType extends string> {
    name: string;
    label: string;
    type: DataType;                // 类型

    primaryKey: boolean        // 是否主键
    unique: boolean;
    notNull: boolean;
}

export interface TableInfo<DataType extends string> {
    name: string
    label: string;
    fieldList: FieldInfo<DataType>[],
}




export enum SqliteDataType {
    INTEGER = "INTEGER",
    TEXT = 'TEXT',
    NUMERIC = 'NUMERIC'
}

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
        `

        console.log(sql)
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

    insertToTable() {

    }

    removeFromTable() {
    }
}



export interface SqliteTableInfo {
    name: string,

}