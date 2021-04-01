// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');
module.exports = {
    // Where Webpack looks to load your JavaScript
    entry: {
        main: path.resolve(__dirname, 'src/index.tsx'),
    },
    // Add a rule so Webpack reads JS with Babel
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'url-loader',
                },
            },
        ]
    },
    mode: 'development',
    // Where Webpack spits out the results (the myapp static folder)
    output: {
        path: path.resolve(__dirname, '../backend/static/build/'),
        filename: '[name].js',
    },
    devtool: 'source-map',
    plugins: [
        // Don't output new files if there is an error
        new webpack.NoEmitOnErrorsPlugin(),
    ],
    // Where find modules that can be imported (eg. React)
    resolve: {
        extensions: ['*', '.tsx', '.ts', '.js'],
        modules: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules'),
        ],
    },
}