import fs from 'node:fs'

import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import { generateController, generateBaseController } from '../components/generate_controller.js'
import { saveFile, copyFile } from '../components/save_file.js'

export default class CpxCrudmakerControllerCommand extends BaseCommand {
  static commandName = 'cpx-crudmaker:controller'
  static description = 'Make a new controller file. Params: {name : Table name in snake_case (Example: "user_plans").}'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  @args.string({ description: 'Table name in snake_case (Example: "user_plans").' })
  declare name: string

  @flags.boolean({ description: 'Create full controller with all methods', alias: 'f' })
  declare full: boolean

  @flags.boolean({ description: 'Force regenerate (base_controller, query_filter_service, file_upload_service)', alias: 's' })
  declare forceStubs: boolean

  async run() {
    this.logger.info(`${new Date().toISOString()} - Creating controller for table: ${this.name}`)

    copyFile({ name: 'query_filter_service', destinationPath: this.app.makePath('app', 'services'), logger: this.logger, force: this.forceStubs })
    copyFile({ name: 'file_upload_service', destinationPath: this.app.makePath('app', 'services'), logger: this.logger, force: this.forceStubs })

    const dirBase = this.app.makePath('app', 'controllers')
    const fileNameBase = `base_controller`
    const fileExists = fs.existsSync(`${dirBase}/${fileNameBase}.ts`)

    if (!fileExists || this.forceStubs) {
      //Copy base controller if not exist
      const contentBase = generateBaseController()
      saveFile({ dir: dirBase, fileName: fileNameBase, content: contentBase, logger: this.logger })
    }


    //Save file
    const dir = this.app.makePath('app', 'controllers')
    const fileName = `${this.name}_controller`
    const content = generateController({ name: this.name })
    saveFile({ dir, fileName, content, logger: this.logger })
  }
}
