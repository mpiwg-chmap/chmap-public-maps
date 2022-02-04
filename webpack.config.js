const path = require("path");
const Dotenv = require('dotenv-webpack');

const config = {

    entry: {
        index: './src/js/index.js',
    },

    output: {
        path: path.resolve(__dirname, "dist", "js"),
        filename: `chmap-public-maps.js`,
        library: {
            name: "chmapPublicMaps",
            type: 'umd',
        }
    },

    // Define development options
    devtool: "source-map",

    optimization: {
       splitChunks: {
            chunks: 'async'
        }
    },

    performance: {
        hints: false,
    },

    // Define loaders
    module: {
        rules: [
            {
                test:  /coordinate-filter.js/,
                use: [
                    {
                        loader: "imports-loader",
                        options: {
                            imports: [
                                "default leaflet L",
                            ]
                        }
                    }
                ]
            },
            // Use babel for JS files
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                }
            },

        ],
    },

    plugins: []

};


module.exports = (webpackEnv, argV) => {

    const isProduction = (argV.mode === "production");

    const dotenvCfg =  { path: "./.env_dev" };

    if (isProduction) {
        config.performance.hints = 'warning';
        dotenvCfg.path = "./.env_prd";
    }

    // Load .env_dev file for environment variables in JS
    config.plugins.push(new Dotenv(dotenvCfg))

    return config;
};
