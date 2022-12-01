import * as fs from 'fs/promises'
import * as path from 'path'

const bump = async () => {
  const packageJsonFile = await fs.readFile(
    path.join(__dirname, '../package.json'),
    'utf8',
  )
  const packageJson = JSON.parse(packageJsonFile)

  console.log(packageJson)
}

;(async () => {
  await bump()
})()
