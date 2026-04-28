import fs from 'node:fs'

import string from '@adonisjs/core/helpers/string'

/**
 * MARK: generateValidator
 */
export const generateValidator = ({ name, columns }: { name: string, columns: any[] }) => {
  //Get template
  const templatePath = new URL('../stubs/validator.stub', import.meta.url)
  let content = fs.readFileSync(templatePath, 'utf8')

  content = content.replaceAll('{{ modelName }}', string.camelCase(string.singular(name)))

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
    'timestamp': `vine.date({ format: 'yyyy-MM-dd HH:mm:ss' })`,
  }

  let contentColumns = ''
  let contentColumnsUpdate = ''
  for (const column of columns) {
    if (column.COLUMN_NAME === 'id') {
      continue
    }
    if (column.COLUMN_NAME === 'created_at') {
      continue
    }
    if (column.COLUMN_NAME === 'updated_at') {
      continue
    }

    const maxLength = column.CHARACTER_MAXIMUM_LENGTH ? `.maxLength(${column.CHARACTER_MAXIMUM_LENGTH})` : ''
    contentColumns += `
    ${column.COLUMN_NAME}: ${columnTypes[column.DATA_TYPE]}${maxLength},`

    contentColumnsUpdate += `
    ${column.COLUMN_NAME}: ${columnTypes[column.DATA_TYPE]}${maxLength}.optional(),`
  }

  content = content.replace('{{ columns }}', contentColumns.trim())
  content = content.replace('{{ columnsUpdate }}', contentColumnsUpdate.trim())

  return content
}
