const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin'); // 每次构建前清除输出文件夹
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 拷贝文件 文件名不变
const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 将所有 required 的 *.css 模块抽取到分离的 CSS 文件
const HtmlWebpackPlugin = require('html-webpack-plugin');

const minifyHTML = {
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  minifyJS: true
}

module.exports = {
  entry: './source-src/app/main.js',
  output: {
    filename: 'js/[name].[hash:6].js', // 生成的文件位于js文件夹下面
    publicPath: "./",
    path: path.resolve(__dirname, '..', 'source'), // 以配置文件的位置为标准 绝对路径
  },
  module: {
    rules: [{
      test: /\.(scss|sass|css)$/,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [
          'css-loader',
          'sass-loader'
        ]
      })
    }]
  },

  plugins: [
    new CleanWebpackPlugin(['source'], {
      root: path.resolve(__dirname, '../'),  //以wenpack配置文件的位置为根目录(当要删除的目录的位置和配置文件位置不同级时使用)
    }),
    new CopyWebpackPlugin([{ // 拷贝图片文件
      from: path.resolve(__dirname, '../source-src/assets/img'),
      to: path.resolve(__dirname, '../source/img'),
      ignore: ['.*']
    }]),
    new CopyWebpackPlugin([{ // 拷贝js文件
      from: path.resolve(__dirname, '../source-src/assets/js'),
      to: path.resolve(__dirname, '../source/js'),
      ignore: ['.*', 'trianglify.min.js']
    }]),
    new HtmlWebpackPlugin({
      inject: false,
      cache: false,
      minify: minifyHTML,
      template: './source-src/script.ejs',
      filename: '../layout/_partial/script.ejs'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      cache: false,
      minify: minifyHTML,
      template: './source-src/css.ejs',
      filename: '../layout/_partial/css.ejs'
    }),
    new ExtractTextPlugin('style/[name].[hash:6].css'), // 生成的css文件的存储路径
  ]
}