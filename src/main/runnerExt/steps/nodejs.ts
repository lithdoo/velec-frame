import { NodeJsRunnerStep } from "@common/runnerExt";
import { StepRunner } from "./base";
import path from "path";
import fs from "fs"
import { exec } from "child_process";
import url from "url";

export class NodejsRunner extends StepRunner<NodeJsRunnerStep> {
    async run() {
        const { code, workdir } = this.step.option
        const workdirPath = workdir.indexOf('file://') >= 0
            ? url.fileURLToPath(workdir)
            : workdir

        return this.checkWorkdir(workdirPath, code, this.inputs)
    }

    private async checkWorkdir(workdir: string, code: string, inputs: any[]) {
        if (!fs.existsSync(workdir)) {
            throw new Error(`Workdir ${workdir} does not exist`)
        }

        const stat = await fs.statSync(workdir)
        const isirectory = stat.isDirectory()
        if (!isirectory) {
            throw new Error(`Workdir ${workdir} is not a directory`)
        }
        const codePath = path.join(workdir, 'runner_code.json')
        if (fs.existsSync(codePath)) {
            fs.unlinkSync(codePath)
        }

        const scriptPath = path.join(workdir, 'runner_script.js')
        if (fs.existsSync(scriptPath)) {
            fs.unlinkSync(scriptPath)
        }

        const resultPath = path.join(workdir, 'runner_result.json')
        if (fs.existsSync(resultPath)) {
            fs.unlinkSync(resultPath)
        }

        fs.writeFileSync(codePath, JSON.stringify({ code, inputs }))

        fs.writeFileSync(scriptPath, `
const fs = require('fs')
const url = require('url')
const path = require('path')

const $ = new Map()
$.set('url', url)
$.set('fs', fs)
$.set('path', path)

try {
    const { code, inputs } = require('./runner_code.json')
    const fn = new Function(code)
    const res = fn.apply(null, [$, ...inputs])
    Promise.resolve(res).then(e => {
        const result = e
        fs.writeFileSync(
            path.resolve(__dirname,'./runner_result.json'), 
            JSON.stringify({ result }, null, 2)
        )
    }).catch((e)=>{
        throw e
    }).finally(()=>{
        console.log('done')
    })
}catch (e) {
    throw e
    console.log('done')
}

            `)


        return new Promise((resolve, reject) => {
            const child = exec(`node ${scriptPath}`)
            console.log(`node ${scriptPath}`)
            const done = () => {
                if (!fs.existsSync(resultPath)) {
                    return reject(new Error('result file not found'))
                }
                const { result, error } = JSON.parse(fs.readFileSync(resultPath).toString())
                if (fs.existsSync(resultPath)) {
                    fs.unlinkSync(resultPath)
                }

                if (fs.existsSync(scriptPath)) {
                    fs.unlinkSync(scriptPath)
                }

                if (fs.existsSync(codePath)) {
                    fs.unlinkSync(codePath)
                }

                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            }

            child.stdout?.on('data', (data) => {
                const message = data.toString()
                if (message.trim() === 'done') {
                    setTimeout(() => {
                        done()
                    }, 100);
                }else{
                    console.log('stdout',message)
                }
            })

            child.stderr?.on('stderr', (data) => {
                console.log('err',data.toString())
            })
        })
    }
}
