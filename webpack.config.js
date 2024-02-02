const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const srcDir = path.join(__dirname, 'src')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    // popup: path.join(srcDir, 'popup.ts'),
    background: path.join(srcDir, 'background.js'),
    content: path.join(srcDir, 'content_script.js'),
  },
  output: {
    path: path.join(srcDir, './dist/js'),
    filename: '[name].js',
    iife: false,
  },
  // plugins: [
  //   new CopyPlugin({
  //     patterns: [{ from: '.', to: '../', context: 'public' }],
  //     options: {},
  //   }),
  // ],
}
