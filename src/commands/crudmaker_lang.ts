import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import string from '@adonisjs/core/helpers/string'

import { generateLang } from '../components/generate_lang.js'
import { saveFile } from '../components/save_file.js'

export default class CpxCrudmakerLangCommand extends BaseCommand {
  static commandName = 'cpx-crudmaker:lang'
  static description = 'Make a new lang file. Params: {name : Table name in snake_case (Example: "user_plans").}'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  @args.string({ description: 'Table name in snake_case (Example: "user_plans").' })
  declare name: string

  async run() {
    this.logger.info(`${new Date().toISOString()} - Creating lang for table: ${this.name}`)
    const locale = (this.app.config.get('i18n.defaultLocale') || 'es') as string

    //Save file
    const dir = this.app.makePath('resources', 'lang', locale)
    const fileName = this.name
    const content = generateLang({ name: this.name })
    saveFile({ dir, fileName, content, format: 'json', logger: this.logger })
  }
}
