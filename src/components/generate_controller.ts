import fs from 'node:fs'

import string from '@adonisjs/core/helpers/string'

/**
 * MARK: generateController
 */
export const generateController = ({ name }: { name: string }) => {
  //Get template
  const templatePath = new URL('../stubs/controller.stub', import.meta.url)
  let content = fs.readFileSync(templatePath, 'utf8')
  const crudMethods = fs.readFileSync(new URL('../stubs/controller_methods.stub', import.meta.url), 'utf8')

  content = content.replaceAll('{{ modelName }}', string.pascalCase(string.singular(name)))
  content = content.replaceAll('{{ modelFileName }}', string.snakeCase(string.singular(name)))
  content = content.replaceAll('{{ modelInstanceName }}', string.camelCase(string.singular(name)))
  content = content.replaceAll('{{ controllerName }}', string.pascalCase(string.plural(name)))
  content = content.replaceAll('{{ langFileName }}', string.snakeCase(string.plural(name)))
  content = content.replaceAll('{{ crudMethods }}', `

  ${crudMethods}`)
  content = content.replaceAll('{{ httpContext }}', `import type { HttpContext } from '@adonisjs/core/http'
`)

  return content
}
/**
 * MARK: generateBaseController
 */
export const generateBaseController = () => {
  //Get template
  const templatePath = new URL('../stubs/base_controller.stub', import.meta.url)
  let content = fs.readFileSync(templatePath, 'utf8')
  const crudMethods = fs.readFileSync(new URL('../stubs/controller_methods.stub', import.meta.url), 'utf8')
  content = content.replaceAll('{{ crudMethods }}', crudMethods)

  return content
}
