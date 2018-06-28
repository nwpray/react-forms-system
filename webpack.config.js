const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionWbpackPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	target: 'web',
	mode: 'development',
	entry: {
		index: path.resolve('src/index.jsx')
    },
	output: {
		filename: "[name].js",
		path: path.resolve('dist'),
		library: 'react-bowtie',
		libraryTarget: "umd",
		umdNamedDefine: true
	},
	resolve:{
		extensions: [' ', '.js', '.jsx']
	},
	devServer: {
		contentBase: path.resolve('dist'),
	},
	module:{
		rules:[
			{ test: /\.jsx?$/, use: ['babel-loader']}
		]
	},
    plugins:[
		new HtmlWebpackPlugin({
			template: path.resolve('src/index.html')
		}),
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve('./')
        }),
		new UglifyJsPlugin({
			test: /\.(js|css)$/
		}),
		new CompressionWbpackPlugin({
			asset: "[path].gz[query]",
			algorithm: "gzip",
			test: /\.(js|html)$/,
			threshold: 10240,
			minRatio: 0.8
		})
	]
};