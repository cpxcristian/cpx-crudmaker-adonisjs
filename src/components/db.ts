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

const getInspector = (db: Database) => {
  const knexInstance = db.connection().getReadClient()
  const createInspector = (SchemaInspectorModule as any).default || SchemaInspectorModule
  const inspector = createInspector(knexInstance)
  return inspector
}

export const getColumns = async ({ db, tableName }: GetColumns) => {
  const inspector = getInspector(db)
  const columns = await inspector.columnInfo(tableName)
  return columns
}

export const getConstraints = async ({ db, tableName }: GetConstraints) => {
  const inspector = getInspector(db)
  const constraints = await inspector.foreignKeys(tableName)
  return constraints
}