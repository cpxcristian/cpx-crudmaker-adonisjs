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
    // Relation name is the singular of the table name.
    relationName = string.singular(tableName)

    //If your foreign key does not contain the name of the table, add it
    //Example: If your foreignKey is: created_by, and tableName is: users, the relationName will be: userCreatedBy.
    //This is done to avoid name collisions like: userUpdatedBy and userCreatedBy.
    if (!foreignKey.includes(relationName)) {
      relationName += `_${foreignKey}`
    }

    relationName = string.camelCase(relationName)
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
export const generateModel = ({ name, columns }: GenerateModel) => {
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
    const columnType = column.data_type.replace(' unsigned', '')
    if (column.name === 'id') {
      contentColumns += `
  @column({ isPrimary: true })
  declare id: number
`
      continue
    }
    if (column.name === 'created_at') {
      contentColumns += `
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
`
      continue
    }
    if (column.name === 'updated_at') {
      contentColumns += `
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
`
      continue
    }
    if (['timestamp', 'datetime', 'date'].includes(columnType)) {
      contentColumns += `
  @column.${columnType === 'date' ? 'date' : 'dateTime'}()
  declare ${string.camelCase(column.name)}: DateTime${column.is_nullable || column.default_value !== null ? ' | null' : ''}
`
      continue
    }

    contentColumns += `
  @column()
  declare ${string.camelCase(column.name)}: ${columnTypes[columnType]}${column.is_nullable || column.default_value !== null ? ' | null' : ''}
`
  }

  content = content.replace('{{ columns }}', contentColumns.trim())
  content = content.replace('{{ arrayColumns }}', columns.map(
    (column: any) => `'${string.camelCase(column.name)}'`
  ).join(',\n    '))

  //MARK: Add relations
  let modelsImports: string[] = []
  let resultBelongsTo = ''
  let resultHasMany = ''

  for (const constraint of columns.filter((column: any) => column.foreign_key_table !== null)) {
    const relation = getRelation({
      tableName: constraint.foreign_key_table,
      relationType: 'belongsTo',
      modelsImports,
      foreignKey: constraint.name
    })
    resultBelongsTo += relation.result
    modelsImports = [...modelsImports, ...relation.modelsImportsResult]
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
