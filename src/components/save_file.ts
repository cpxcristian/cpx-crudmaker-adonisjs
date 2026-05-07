import fs from 'node:fs'
import { relative } from 'path'

type SaveFile = {
  dir: string
  fileName: string
  content: string
  logger: any
  colors: any
  component: string
  format?: 'ts' | 'json'
}

type CopyFile = {
  name: string
  destinationPath: string
  logger: any
  force?: boolean
}

export const saveFile = async ({ dir, fileName, content, logger, colors, component, format = 'ts' }: SaveFile) => {
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }

  const filePath = `${dir}/${fileName}.${format}`

  await fs.promises.writeFile(filePath, content)

  logger.log(`[ ${colors.green('success')} ][ ${colors.blue(component)} ] ${colors.dim(relative(process.cwd(), filePath))} created.`)
}

export const copyFile = async ({ name, destinationPath, logger, force = false }: CopyFile) => {
  const source = `../stubs/${name}.stub`
  if (!fs.existsSync(destinationPath)) {
    await fs.promises.mkdir(destinationPath, { recursive: true })
  }

  const fileExists = fs.existsSync(`${destinationPath}/${name}.ts`)
  if (fileExists && !force) {
    return
  }

  const sourcePath = new URL(source, import.meta.url)
  const sourceContent = fs.readFileSync(sourcePath, 'utf8')

  await fs.promises.writeFile(`${destinationPath}/${name}.ts`, sourceContent)

  logger.info(`${destinationPath}/${name}.ts created successfully.`)
}