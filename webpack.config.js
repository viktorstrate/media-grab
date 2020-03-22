const path = require('path');
const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'sourcemap',
  stats: 'errors-only',
  entry: {
      background: "./src/background/background",
      "popup/popup": "./src/popup/popup"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: 'svelte-loader'
      }
    ],
  },
  output: {
    path: path.join(__dirname, 'distribution'),
    filename: '[name].js'
  },
  plugins: [
    new SizePlugin(),
    new CopyWebpackPlugin([
      {
        from: '**',
        context: 'src',
        ignore: [
          '*.js', '*.ts', '*.svelte'
        ]
      }
    ])
  ],
  resolve: {
    extensions: [ '.ts', '.js', '.svelte' ],
  },
  optimization: {
    // Without this, function names will be garbled and enableFeature won't work
    concatenateModules: true,

    // Automatically enabled on production; keeps it somewhat readable for AMO reviewers
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            indent_level: 2 // eslint-disable-line camelcase
          }
        }
      })
    ]
  }
};