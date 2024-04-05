const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

const srcDir = path.join(__dirname, 'src')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    black_white: path.join(srcDir, 'black_white.js'),
    popup: path.join(srcDir, 'Popup/index.tsx'),
    import: path.join(srcDir, 'import.js'),
    adjust: path.join(srcDir, 'adjust.js'),
    background: path.join(srcDir, 'background.js'),
    content: path.join(srcDir, 'content_script.js'),
    options: path.join(srcDir, 'options.tsx'),
    login: path.join(srcDir, 'Login/index.tsx'),
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.join(__dirname, './dist/js'),
    filename: '[name].js',
    iife: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'public' }],
      options: {},
    }),
  ],
}
