const path = require('path')
const webpack = require('webpack')

module.exports = function(config, env) {
    // Add an exclusion rule to prevent the file-loader being used
    const wasmExtensionRegExp = /\.wasm$/;
    config.resolve.extensions.push('.wasm');
    config.module.rules.forEach(rule => {
        (rule.oneOf || []).forEach(oneOf => {
            if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
                oneOf.exclude.push(wasmExtensionRegExp);
            }
        });
    });

    // Add a dedicated loader for WASM
    config.module.rules.push({
        test: wasmExtensionRegExp,
        include: path.resolve(__dirname, 'src'),
        use: [{ loader: require.resolve('wasm-loader'), options: {} }]
    });

    // Tell webpack to use the Web, rather than NodeJS, version of Buttplug
    config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^#/, resource => {
            if (resource.request === "#buttplug_rs_ffi_bg") {
                resource.request = "./buttplug_rs_ffi_bg_web.js"
            }
        })
    )

    return config;
}