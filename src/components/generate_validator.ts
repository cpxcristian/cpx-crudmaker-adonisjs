import fs from 'node:fs'

import string from '@adonisjs/core/helpers/string'

/**
 * MARK: generateValidator
 */
export const generateValidator = ({ name, columns }: { name: string, columns: any[] }) => {
  //Get template
  const templatePath = new URL('../stubs/validator.stub', import.meta.url)
  let content = fs.readFileSync(templatePath, 'utf8')

  content = content.replaceAll('{{ modelName }}', string.pascalCase(string.singular(name)))

  //MARK: Add columns
  const columnTypes: Record<string, string> = {
    'varchar': 'vine.string().trim()',
    'int': 'vine.number()',
    'bigint': 'vine.number()',
    'tinyint': 'vine.number()',
    'smallint': 'vine.number()',
    'mediumint': 'vine.number()',
    'float': 'vine.number()',
    'double': 'vine.number()',
    'timestamp': `vine.date({ formats: ['YYYY-MM-DD HH:mm:ss'] })`,
    'date': `vine.date({ formats: ['YYYY-MM-DD'] })`,
    'datetime': `vine.date({ formats: ['YYYY-MM-DD HH:mm:ss'] })`,
  }

  let contentColumns = ''
  let contentColumnsUpdate = ''
  for (const column of columns) {
    //Skip columns
    if (column.COLUMN_NAME === 'id') {
      continue
    }
    if (column.COLUMN_NAME === 'created_at') {
      continue
    }
    if (column.COLUMN_NAME === 'updated_at') {
      continue
    }


    const baseColumn = `${string.camelCase(column.COLUMN_NAME)}: ${columnTypes[column.DATA_TYPE]}`
    const maxLength = column.CHARACTER_MAXIMUM_LENGTH ? `.maxLength(${column.CHARACTER_MAXIMUM_LENGTH})` : ''
    let addUnique = ''
    let addUniqueUpdate = ''
    let addOptional = ''

    //Add unique to unique columns
    if (column.COLUMN_KEY === 'UNI') {
      addUnique = `.unique({ table: '${name}' })`
      addUniqueUpdate = `.unique({ table: '${name}', filter: (db, value, field) => {
      db.whereNot('id', field.meta.id) 
    } })`
    }

    //Add optional to created_by and updated_by
    if (column.COLUMN_NAME === 'created_by' || column.COLUMN_NAME === 'updated_by') {
      addOptional = `.optional()`
    }
    if (column.IS_NULLABLE === 'YES' || column.COLUMN_DEFAULT !== null) {
      addOptional = `.optional()`
    }

    contentColumns += `
    ${baseColumn}${maxLength}${addUnique}${addOptional},`

    contentColumnsUpdate += `
    ${baseColumn}${maxLength}${addUniqueUpdate}.optional(),`
  }

  content = content.replace('{{ columns }}', contentColumns.trim())
  content = content.replace('{{ columnsUpdate }}', contentColumnsUpdate.trim())

  return content
}
