import path from 'path'
import fs from 'fs'

export const findAppSettingDir = () => {
  const track = (dirPath: string) => {
    const settingDir = path.resolve(dirPath, '.velec')
    if (fs.existsSync(settingDir) && fs.statSync(settingDir).isDirectory()) {
      return settingDir
    } else if (fs.existsSync(path.resolve(dirPath, '../'))) {
      return track(path.resolve(dirPath, '../'))
    } else {
      console.log(`not found setting dir`)
      return null
    }
  }
  return track(__dirname)
}
