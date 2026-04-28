import fs from 'node:fs'

type SaveFile = {
  dir: string
  fileName: string
  content: string
  logger: any
  format?: 'ts' | 'json'
}

type CopyFile = {
  name: string
  destinationPath: string
  logger: any
  force?: boolean
}

export const saveFile = async ({ dir, fileName, content, logger, format = 'ts' }: SaveFile) => {
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }

  await fs.promises.writeFile(`${dir}/${fileName}.${format}`, content)

  logger.info(`${dir}/${fileName}.${format} created successfully.`)
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