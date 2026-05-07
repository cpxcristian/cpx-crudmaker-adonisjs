import type { Database } from '@adonisjs/lucid/database'
import SchemaInspectorModule from 'knex-schema-inspector'

type GetColumns = {
  db: Database
  tableName: string
}

type GetConstraints = {
  db: Database
  tableName: string
}

const columnOrder: any = {
  id: 1,
  uuid: 2,
  name: 10,
  last_name: 11,
  paternal_last_name: 12,
  maternal_last_name: 13,
  description: 20,
  email: 30,
  phone: 31,
  whatsapp: 32,
  address: 40,
  street: 41,
  number: 42,
  city: 43,
  state: 44,
  zip_code: 45,
  notes: 1001,
  deleted_at: 1002,
  created_by: 1003,
  updated_by: 1004,
  created_at: 1005,
  updated_at: 1006,
}

const arbitraryOrder = (columns: any[]) => {
  let c = 100
  return columns.sort((a: any, b: any) => {
    const aOrder = columnOrder[a.name] || c++
    const bOrder = columnOrder[b.name] || c++
    return aOrder - bOrder
  })
}

const getInspector = (db: Database) => {
  const knexInstance = db.connection().getReadClient()
  const createInspector = (SchemaInspectorModule as any).default || SchemaInspectorModule
  const inspector = createInspector(knexInstance)
  return inspector
}

export const getColumns = async ({ db, tableName }: GetColumns) => {
  const inspector = getInspector(db)
  const columns = await inspector.columnInfo(tableName)
  return arbitraryOrder(columns)
}

export const getConstraints = async ({ db, tableName }: GetConstraints) => {
  const inspector = getInspector(db)
  const constraints = await inspector.foreignKeys(tableName)
  return constraints
}