const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entry = './src/index.ts'
const isProd = process.env.NODE_ENV === 'production'
const publicPath = isProd ? '/biitit/' : '/'
const mode = isProd ? 'production' : 'development'

module.exports = {
  mode,
  entry: ['@babel/polyfill', entry],
  output: {
    filename: 'bundle.[fullhash].js',
    path: path.resolve(__dirname, './dist'),
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(woff2?|ttf|otf|eot|svg)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './template/index.ejs',
      title: 'Biitit',
      inject: false,
      hash: true,
    }),
  ],
  devServer: {
    contentBase: path.resolve('./public'),
    proxy: {
      '/shared': 'http://localhost:8081',
    },
  },
}
