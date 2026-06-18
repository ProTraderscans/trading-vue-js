
// Plugin for saving compiled webworker
// for further use as a Blob content (see script_ww_api.js)

const fs = require('fs')
const path = require('path')
const { minify } = require("terser")
const lz = require('lz-string')

const PATH = `./src/helpers/tmp/`

module.exports = class WWPlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
            try {
                let data = '';
                const outputPath = compiler.options.output.path || path.resolve(__dirname, '../dist');
                const filePath = path.join(outputPath, 'script_ww.worker.js');
                if (fs.existsSync(filePath)) {
                    data = fs.readFileSync(filePath, 'utf8');
                } else {
                    let asset = compilation.assets['script_ww.worker.js'];
                    if (asset) {
                        try {
                            data = asset.source();
                        } catch (e) {}
                    }
                }
                if (data) {
                    if (Buffer.isBuffer(data)) {
                        data = data.toString('utf8');
                    }
                    data = lz.compressToBase64(data)
                    let json = JSON.stringify([data])
                    try {
                        var prev = fs.readFileSync(PATH + 'ww$$$.json')
                    } catch(e) {}

                    if (json != prev) {
                        fs.writeFileSync(PATH + 'ww$$$.json', json)
                        console.log('Successfully wrote ww$$$.json!');
                    }
                } else {
                    console.log('Worker asset script_ww.worker.js not found');
                }
            } catch (err) {
                console.error('Error compiling worker:', err);
            }
        })
    }
}
