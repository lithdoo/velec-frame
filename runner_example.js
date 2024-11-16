// $ config 
// const fs = require('fs')
// const url = require('url')
// const path = require('path')

const [$, config] = arguments

const fs = $.get('fs')
const url = $.get('url')
const path = $.get('path')
let dir_path = config['dir_path']

const main = async () => {
    if(dir_path.indexOf('file://') !== -1) {
        dir_path = url.fileURLToPath(dir_path)
    }
    
    if(!fs.existsSync(dir_path)) {
        throw('file not exist')
    } 
    
    const stat  = await fs.promises.stat(dir_path)
    const isDir = stat.isDirectory()

    if(!isDir) {
        throw('file is not a directory')
    }
    
    const list = await fs.promises.readdir(dir_path)
    const files = []

    for (const fileName of list) {
        const filePath = path.join(dir_path, fileName)

        try{
            const stat = await fs.promises.stat(filePath)
            const isFile = stat.isFile()
            if(isFile) {
                files.push({
                    $name: fileName,
                    $url: url.pathToFileURL(filePath).href,
                    $size: stat.size || 0
                })
            }
        }catch(e) {
            console.log(e)
        }
    }

    return files
}

return main()
