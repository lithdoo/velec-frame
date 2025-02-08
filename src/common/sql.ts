export interface FieldInfo<DataType extends string> {
  name: string
  label: string
  type: DataType // 类型
  // foreignKey: boolean        // 是否外键
  primaryKey: boolean // 是否主键
  unique: boolean
  notNull: boolean
}

export interface TableInfo<DataType extends string> {
  name: string
  label: string
  fieldList: FieldInfo<DataType>[]
}

export enum SqliteDataType {
  INTEGER = 'INTEGER',
  TEXT = 'TEXT',
  NUMERIC = 'NUMERIC'
}
