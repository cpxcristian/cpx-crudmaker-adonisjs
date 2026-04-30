import fs from 'node:fs'

import string from '@adonisjs/core/helpers/string'

type GetRelation = {
  tableName: string
  relationType: string
  modelsImports: string[]
  foreignKey: string
}

type GenerateModel = {
  name: string
  columns: any[]
  constraints: any[]
}

/**
 * MARK: getRelation
 */
const getRelation = ({ tableName, relationType, modelsImports, foreignKey }: GetRelation) => {
  let result = ''
  let modelsImportsResult = []
  const modelName = string.pascalCase(string.singular(tableName))
  const relation: Record<string, string> = {
    'belongsTo': 'BelongsTo',
    'hasMany': 'HasMany',
    'hasOne': 'HasOne',
    'manyToMany': 'ManyToMany',
  }
  let relationName = ''

  if (relationType === 'hasMany') {
    // Relation name is the plural of the table name. Example: roles
    relationName = string.camelCase(string.plural(tableName))
  } else {
    // Relation name is the singular of the table name plus the foreign key. Example: userUpdatedBy
    relationName = string.camelCase(`${string.singular(tableName)}_${foreignKey}`)
  }

  result = `
  @${relationType}(() => ${modelName}, {
    localKey: 'id',
    foreignKey: '${string.camelCase(foreignKey)}',
  })
  declare ${relationName}: ${relation[relationType]}<typeof ${modelName}>
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

  content = content.replaceAll('{{ modelName }}', string.pascalCase(string.singular(name)))

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
  declare ${string.camelCase(column.COLUMN_NAME)}: ${columnTypes[column.DATA_TYPE]}
`
  }

  content = content.replace('{{ columns }}', contentColumns.trim())
  content = content.replace('{{ arrayColumns }}', columns.map(
    (column: any) => `'${string.camelCase(column.COLUMN_NAME)}'`
  ).join(',\n    '))

  //MARK: Add relations
  let modelsImports: string[] = []
  let resultBelongsTo = ''
  let resultHasMany = ''

  for (const constraint of constraints) {
    if (constraint.REFERENCED_TABLE_SCHEMA === null) {
      continue
    }

    const foreignKey = constraint.CONSTRAINT_NAME.replace(`${constraint.TABLE_NAME}_`, '').replace('_foreign', '')

    if (constraint.TABLE_NAME == name) {
      const relation = getRelation({
        tableName: constraint.REFERENCED_TABLE_NAME,
        relationType: 'belongsTo',
        modelsImports,
        foreignKey
      })
      resultBelongsTo += relation.result
      modelsImports = [...modelsImports, ...relation.modelsImportsResult]
    }

    if (constraint.REFERENCED_TABLE_NAME == name) {
      const relation = getRelation({
        tableName: constraint.TABLE_NAME,
        relationType: 'hasMany',
        modelsImports,
        foreignKey
      })
      resultHasMany += relation.result
      modelsImports = [...modelsImports, ...relation.modelsImportsResult]
    }
  }

  content = content.replace('{{ relations }}', (resultBelongsTo + resultHasMany).trim())

  //MARK: Add imports
  const modelRelImports = [
    ...(resultHasMany.length > 0 ? ['HasMany'] : []),
    ...(resultBelongsTo.length > 0 ? ['BelongsTo'] : []),
  ]
  content = content.replace('{{ arrayRelations }}', (modelRelImports.length > 0 ? ', ' : '') + modelRelImports.map((column: any) => `${string.camelCase(column)}`).join(', '))
  content = content.replace('{{ arrayRelationsTypes }}', modelRelImports.length > 0 ? `
import type { ${modelRelImports.join(', ')} } from '@adonisjs/lucid/types/relations'` : '')

  let imports = ''
  modelsImports.forEach((model: string) => {
    imports += `
import ${model} from '#models/${string.singular(string.snakeCase(model))}'`
  })
  content = content.replace('{{ imports }}', imports)

  return content
}
