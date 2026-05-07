import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { Database } from '@adonisjs/lucid/database'
import string from '@adonisjs/core/helpers/string'

import { getColumns } from '../components/db.js'
import { generateModel } from '../components/generate_model.js'
import { saveFile } from '../components/save_file.js'

export default class CpxCrudmakerModelCommand extends BaseCommand {
  static commandName = 'cpx-crudmaker:model'
  static description = 'Make a new model file. Params: {name : Table name in snake_case (Example: "user_plans").}'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  @args.string({ description: 'Table name in snake_case (Example: "user_plans").' })
  declare name: string

  async run() {
    const db = (await this.app.container.make('lucid.db')) as Database
    const columns = await getColumns({ db, tableName: this.name })

    //Save file
    const dir = this.app.makePath('app', 'models')
    const fileName = string.singular(this.name)
    const content = generateModel({ name: this.name, columns })
    await saveFile({ dir, fileName, content, logger: this.logger, colors: this.colors, component: 'model' })
  }
}
