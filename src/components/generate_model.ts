import fs from 'node:fs'

import string from '@adonisjs/core/helpers/string'

type GetRelation = {
  name: string
  relationType: string
  modelsImports: string[]
}

type GenerateModel = {
  name: string
  columns: any[]
  constraints: any[]
}

/**
 * MARK: getRelation
 */
const getRelation = ({ name, relationType, modelsImports }: GetRelation) => {
  let result = ''
  let modelsImportsResult = []
  const modelName = string.pascalCase(string.singular(name))
  const relation: Record<string, string> = {
    'belongsTo': 'BelongsTo',
    'hasMany': 'HasMany',
    'hasOne': 'HasOne',
    'manyToMany': 'ManyToMany',
  }
  result = `
  @${relationType}(() => ${modelName})
  declare ${modelName}: ${relation[relationType]}<typeof ${modelName}>
`
  if (!modelsImports.includes(modelName)) {
    modelsImportsResult.push(modelName)
  }
  return { result, modelsImportsResult }
}


/**
 * MARK: generateModel
 */
export const generateModel = ({ name, columns, constraints }: GenerateModel) => {
  //Get template
  const templatePath = new URL('../stubs/model.stub', import.meta.url)
  let content = fs.readFileSync(templatePath, 'utf8')

  content = content.replace('{{ modelName }}', string.pascalCase(string.singular(name)))

  //MARK: Add columns
  const columnTypes: Record<string, string> = {
    'varchar': 'string',
    'int': 'number',
    'bigint': 'number',
    'tinyint': 'number',
    'smallint': 'number',
    'mediumint': 'number',
    'float': 'number',
    'double': 'number',
  }

  let contentColumns = ''
  for (const column of columns) {
    if (column.COLUMN_NAME === 'id') {
      contentColumns += `
  @column({ isPrimary: true })
  declare id: number
`
      continue
    }
    if (column.COLUMN_NAME === 'created_at') {
      contentColumns += `
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
`
      continue
    }
    if (column.COLUMN_NAME === 'updated_at') {
      contentColumns += `
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
`
      continue
    }

    contentColumns += `
  @column()
  declare ${column.COLUMN_NAME}: ${columnTypes[column.DATA_TYPE]}
`
  }

  content = content.replace('{{ columns }}', contentColumns.trim())
  content = content.replace('{{ arrayColumns }}', columns.map((column: any) => `'${column.COLUMN_NAME}'`).join(', '))

  //MARK: Add relations
  let modelsImports: string[] = []
  let resultBelongsTo = ''
  let resultHasMany = ''

  for (const constraint of constraints) {
    if (constraint.REFERENCED_TABLE_SCHEMA === null) {
      continue
    }

    if (constraint.TABLE_NAME == name) {
      const relation = getRelation({ name: constraint.REFERENCED_TABLE_NAME, relationType: 'belongsTo', modelsImports })
      resultBelongsTo += relation.result
      modelsImports = [...modelsImports, ...relation.modelsImportsResult]
    }

    if (constraint.REFERENCED_TABLE_NAME == name) {
      const relation = getRelation({ name: constraint.TABLE_NAME, relationType: 'hasMany', modelsImports })
      resultHasMany += relation.result
      modelsImports = [...modelsImports, ...relation.modelsImportsResult]
    }
  }

  content = content.replace('{{ relations }}', (resultBelongsTo + resultHasMany).trim())

  //MARK: Add imports
  let imports = ''
  modelsImports.forEach((model: string) => {
    imports += `
import ${model} from './${string.singular(string.snakeCase(model))}.js'`
  })

  content = content.replace('{{ imports }}', imports)

  return content
}
