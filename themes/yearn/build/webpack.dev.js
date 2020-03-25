const merge = require("webpack-merge");
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  // devtool: 'inline-source-map',
  watch: true, // 修改文件后自动打包
  watchOptions: {
    ignored: ['node_modules/**']
  }
});