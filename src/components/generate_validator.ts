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
    const columnType = column.data_type.replace(' unsigned', '')
    //Skip columns
    if (column.name === 'id') {
      continue
    }
    if (column.name === 'created_at') {
      continue
    }
    if (column.name === 'updated_at') {
      continue
    }


    const baseColumn = `${string.camelCase(column.name)}: ${columnTypes[columnType]}`
    const maxLength = column.max_length ? `.maxLength(${column.max_length})` : ''
    let addUnique = ''
    let addUniqueUpdate = ''
    let addOptional = ''

    //Pending: Shemabuilder does not return unique columns
    if (column.column_key === 'UNI') {
      addUnique = `.unique({ table: '${name}' })`
      addUniqueUpdate = `.unique({ table: '${name}', filter: (db, value, field) => {
      db.whereNot('id', field.meta.id) 
    } })`
    }

    //Add optional to created_by and updated_by
    if (column.name === 'created_by' || column.name === 'updated_by') {
      addOptional = `.optional()`
    }
    if (column.is_nullable || column.default_value !== null) {
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
