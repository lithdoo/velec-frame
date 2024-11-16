// const { code } = require('./runner_script.json')
// const fn = new Function('$', 'module', 'exports', code)
// const _code = fs.readFileSync('./runner_example.js').toString()
// fs.writeFileSync('./runner_code.json', JSON.stringify({ code: _code}, null, 2))

const fs = require('fs')
const url = require('url')
const path = require('path')

const $ = new Map()
$.set('url', url)
$.set('fs', fs)
$.set('path', path)


Promise.resolve()
    .then(() => {
        const { code, inputs } = require('./runner_code.json')
        const fn = new Function(code)

        const res = fn.apply(null, [$, ...inputs])
        return res
    })
    .then(e => {
        const result = e
        fs.writeFileSync('./runner_result.json', JSON.stringify({ result, error: null }, null, 2))
    })
    .catch(e => {
        const error = e.message
        fs.writeFileSync('./runner_result.json', JSON.stringify({ result: null, error}, null, 2))
    })


