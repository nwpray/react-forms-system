const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionWbpackPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    target: 'web',
    mode: 'development',
    entry: {
        index: path.resolve('src/index.jsx'),
    },
    output: {
        filename: '[name].js',
        path: path.resolve('dist'),
        library: 'react-forms-system',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    resolve: {
        extensions: [' ', '.js', '.jsx'],
    },
    devServer: {
        contentBase: path.resolve('dist'),
    },
    module: {
        rules: [
            { test: /\.jsx?$/, use: ['babel-loader'] },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve('./'),
        }),
        new UglifyJsPlugin({
            test: /\.(js|css)$/,
        }),
        new CompressionWbpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|html)$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
    ],
};
