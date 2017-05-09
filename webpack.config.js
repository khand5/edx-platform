/* eslint-env node */

'use strict';

var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

var isProd = process.env.NODE_ENV === 'production';

var wpconfig = {
    context: __dirname,

    entry: {
        CourseOutline: './openedx/features/course_experience/static/course_experience/js/CourseOutline.js',
        Import: './cms/static/js/features/import/factories/import.js'
    },

    output: {
        path: path.resolve(__dirname, 'common/static/bundles'),
        filename: isProd ? '[name].[chunkhash].js' : '[name].js',
        libraryTarget: 'window'
    },

    devtool: isProd ? false : 'source-map',

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new webpack.LoaderOptionsPlugin({
            debug: !isProd
        }),
        new BundleTracker({
            path: process.env.STATIC_ROOT_CMS,
            filename: 'webpack-stats.json'
        }),
        new BundleTracker({
            path: process.env.STATIC_ROOT_LMS,
            filename: 'webpack-stats.json'
        }),
        new webpack.ProvidePlugin({
            _: 'underscore',
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        })
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.coffee$/,
                exclude: /node_modules/,
                use: 'coffee-loader'
            },
            {
                test: /\.underscore$/,
                use: 'raw-loader'
            },
            {
                // This file is used by both RequireJS and Webpack and depends on window globals
                // This is a dirty hack and shouldn't be replicated for other files.
                test: path.resolve(__dirname, 'cms/static/cms/js/main.js'),
                use: {
                    loader: 'imports-loader',
                    options: {
                        AjaxPrefix: 'exports-loader?this.AjaxPrefix!../../../../common/static/coffee/src/ajax_prefix.coffee'
                    }
                }
            }
        ]
    },

    resolve: {
        extensions: ['.js', '.json', '.coffee'],
        alias: {
            'edx-ui-toolkit': 'edx-ui-toolkit/src/',  // @TODO: some paths in toolkit are not valid relative paths
            'jquery.ui': 'jQuery-File-Upload/js/vendor/jquery.ui.widget.js',
            jquery: 'jquery/src/jquery'  // Use the non-dist form of jQuery for better debugging + optimization
        },
        modules: [
            'node_modules',
            'common/static/js/vendor/'
        ]
    },

    resolveLoader: {
        alias: {
            text: 'raw-loader'  // Compatibility with RequireJSText's text! loader, uses raw-loader under the hood
        }
    },

    externals: {
        gettext: 'gettext'
    },

    watchOptions: {
        poll: true
    }
};

if (isProd) {
    wpconfig.plugins = wpconfig.plugins.concat([
        new webpack.LoaderOptionsPlugin({  // This may not be needed; legacy option for loaders written for webpack 1
            minimize: true
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]);
}

module.exports = wpconfig;
