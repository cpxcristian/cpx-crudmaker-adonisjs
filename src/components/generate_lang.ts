import fs from 'node:fs'

import string from '@adonisjs/core/helpers/string'

/**
 * MARK: generateLang
 */
export const generateLang = ({ name }: { name: string }) => {
  //Get template
  const templatePath = new URL('../stubs/lang.stub', import.meta.url)
  let content = fs.readFileSync(templatePath, 'utf8')

  content = content.replaceAll('{{ modelName }}', string.pascalCase(string.singular(name)))

  return content
}
