import fs from 'fs'
import path from 'path'

const list = fs.readdirSync(__dirname)

list.forEach((file) => {
  const stat = fs.statSync(path.resolve(__dirname, file))
  if (!stat.isFile()) {
    return
  }
  const reg = /(^[A-Z|a-z]+[0-9]+)[A-Z].mp4$/
  console.log(file.match(reg))
})
