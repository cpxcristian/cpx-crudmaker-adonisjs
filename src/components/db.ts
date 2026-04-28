import type { Database } from '@adonisjs/lucid/database'

type GetColumns = {
  db: Database
  databaseName: string
  tableName: string
}

type GetConstraints = {
  db: Database
  databaseName: string
}

export const getColumns = async ({ db, databaseName, tableName }: GetColumns) => {
  const columns = await db.connection('information_schema').rawQuery(`
    SELECT *
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = '${databaseName}' AND TABLE_NAME = '${tableName}'`)
  return columns[0]
}

export const getConstraints = async ({ db, databaseName }: GetConstraints) => {
  const columns = await db.connection('information_schema').rawQuery(`
    SELECT *
    FROM information_schema.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = '${databaseName}'`)
  return columns[0]
}