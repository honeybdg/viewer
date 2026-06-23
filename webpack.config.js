// The config is intended for building dist files and running the development server.
const path = require('node:path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

/** @type {import('webpack').Configuration} */
module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    target: ['web', 'es5'],
    entry: [
      './src/styles/main.css',
      './src/Viewer.js',
    ],
    output: {
      path: distDir,
      library: 'Viewer',
      libraryExport: 'default',
      filename: 'viewer.min.js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.svg$/,
          type: 'asset/source',
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'viewer.min.css',
      }),
      isDevelopment && new HtmlWebpackPlugin({
        template: path.join(publicDir, 'index.html'),
        scriptLoading: 'blocking',
      }),
    ].filter(Boolean),
    optimization: {
      minimizer: [
        '...',
        new CssMinimizerPlugin(),
      ],
    },
    devServer: {
      historyApiFallback: true,
      allowedHosts: 'all',
      hot: true,
      host: 'localhost',
      port: 3000,
    },
  };
};
