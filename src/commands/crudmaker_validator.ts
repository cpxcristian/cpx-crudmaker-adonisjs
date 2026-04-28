import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { Database } from '@adonisjs/lucid/database'
import string from '@adonisjs/core/helpers/string'

import { getColumns } from '../components/db.js'
import { generateValidator } from '../components/generate_validator.js'
import { saveFile } from '../components/save_file.js'

export default class CpxCrudmakerValidatorCommand extends BaseCommand {
  static commandName = 'cpx-crudmaker:validator'
  static description = 'Make a new validator file. Params: {name : Table name in snake_case (Example: "user_plans").}'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  @args.string({ description: 'Table name in snake_case (Example: "user_plans").' })
  declare name: string

  async run() {
    const db = (await this.app.container.make('lucid.db')) as Database
    const databaseName = this.app.config.get('database.connections.mysql.connection.database') as string
    this.logger.info(`${new Date().toISOString()} - Creating validator for table: ${this.name}`)

    //Get columns and constraints
    const columns = await getColumns({ db, databaseName, tableName: this.name })

    //Save file
    const dir = this.app.makePath('app', 'validators')
    const fileName = string.singular(this.name)
    const content = generateValidator({ name: this.name, columns })
    saveFile({ dir, fileName, content, logger: this.logger })
  }
}
