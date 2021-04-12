const path = require('path')
const buble = require('rollup-plugin-buble')


const aliases = require('./alias')

const resolve = p => {
    const base = p.split('/')[0]
    if (aliases[base]) {
        return path.resolve(aliases[base], p.slice(base.length + 1))
    } else {
        return path.resolve(__dirname, '../', p)
    }
}

const builds = {
    'web-full-dev' : {
        entry: resolve('web/entry-runtime-with-compiler-fragment.js'),
        dest: resolve('dist/mvue.js'),
        format: 'umd',
        env: 'development'
    },
    'web-full-dev-vn' : {
        entry: resolve('web/entry-runtime-with-compiler-vn.js'),
        dest: resolve('dist/mvue.js'),
        format: 'umd',
        env: 'development'
    }
}

function genConfig(name) {
    const opts = builds[name]
    console.log(opts)
    return {
        input: opts.entry,
        output: {
            file: opts.dest,
            format: opts.format,
            name: opts.moduleName || 'MVue'
        }
    }
}

module.exports = genConfig(process.env.TARGET)
