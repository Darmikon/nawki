var BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin"),
	webpack = require("webpack"),
	parsedConsoleArgs = require("./utils/parsedConsoleArgs");
	src = './src/';
	build = './build/';

var env = console.log(parsedConsoleArgs().env || 'dev'); //webpack --env=dev -bool -null=null -num=5 -float=5.5

// definePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
var definePlugin = new webpack.DefinePlugin(
	{
		__DEV__: env,
		__PRERELEASE__: env
	}
);

module.exports = {
	entry: {
		nawki: "./src/js/nawki.js"
	},
	output: {
		path: __dirname + '/build',
		filename: "js/[name].js"
		//sourceMapFilename: "js/[name].js.map"
	},
	devtool: "source-map",
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: "style!css" //syntax single
			},
			/*In this form of syntax I've got source maps but I've also got inline css within js file*/
			//{
			//	test: /\.scss$/,
			//	loaders: ["style","css?sourceMap","sass?sourceMap"] //syntax multiple
			//	http://webpack.github.io/docs/configuration.html#devtool
			//},

			/*
			 * I extracted file however I've lost source maps
			 * To bring it back I'll use
			 * devtool: "source-map" at the beginning of main config
			 * */
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract("style","css?sourceMap!sass?sourceMap") //syntax
				// multiple
			},
			//{
			//	test: /\.js$/,
			//	loader: "babel-loader",
			//	exclude: "/node_modules/"
			//},
			//{
			//	test: /\.js$/,
			//	loader: "eslint-loader",
			//	exclude: "/node_modules/"
			//},
			{
				test: /\.(js|jsx)?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel?optional[]=runtime'
			}
			//TODO
			//,loaders: [{
			//	test: /\.(js|jsx)$/,
			//	exclude: /node_modules/,
			//	loader: 'react-hot!babel-loader'
			//}
		]
	},
	plugins: [
		new BrowserSyncPlugin(
			{
				host: 'localhost',
				port: 3000,
				server: {baseDir: ['./']},
				files: [
					src + '**/*.css',
					build + '**/*.js',
					//src + '**/*.map',
					src + 'images/**/*.*',
					src + 'fonts/*',
					src + 'index.html'
				]
			}
		),
		new ExtractTextPlugin("css/[name].css")
	],
	eslint: {
		configFile: './.eslintrc'
		//,formatter: require("eslint-friendly-formatter")
	}
};