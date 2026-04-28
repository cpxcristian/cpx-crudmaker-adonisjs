import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class CpxCrudmakerCommand extends BaseCommand {
  static commandName = 'cpx-crudmaker:all'
  static description = 'Generate full crud. Params: {name : Table name in snake_case (Example: "user_plans").}'

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
    await this.kernel.exec('cpx-crudmaker:model', [this.name])
    await this.kernel.exec('cpx-crudmaker:validator', [this.name])
    await this.kernel.exec('cpx-crudmaker:controller', [this.name, this.full ? '--full' : '', this.forceStubs ? '--forceStubs' : ''])
    await this.kernel.exec('cpx-crudmaker:lang', [this.name])
  }
}
