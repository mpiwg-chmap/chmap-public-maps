const path = require("path");
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {

    entry: {
        'public-maps-panel': './src/scss/public-maps-panel.scss',
    },

    output: {
    },

    // Define development options
    devtool: "source-map",

    performance: {
        hints: false,
    },

    // Define loaders
    module: {
        rules: [
            // CSS, PostCSS, and Sass
            {
                test: /\.(scss|css)$/,
                // exclude: /(node_modules|bower_components)/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2,
                            sourceMap: true,
                            url: false,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'autoprefixer',
                                ]
                            }
                        }
                    },
                    'sass-loader'
                ],
            },
        ],
    },
    plugins: [
        // Extracts CSS into separate files
        new FixStyleOnlyEntriesPlugin(),

        new MiniCssExtractPlugin({
            filename: "css/[name].css",
            chunkFilename: "[id].css"
        })
    ]

};


module.exports = (webpackEnv, argV) => {

    const isProduction = (argV.mode === "production");

    if (isProduction) {
        config.performance.hints = 'warning';
    }

    return config;
};
