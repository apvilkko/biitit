const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const entry = "./src/index.js";
const publicPath = process.env.NODE_ENV === "production" ? "/biitit/" : "/";

module.exports = {
  mode: "development",
  entry: ["@babel/polyfill", entry],
  output: {
    filename: "bundle.[hash].js",
    path: path.resolve(__dirname, "./dist"),
    publicPath
  },
  module: {
    rules: [
      {
        test: /\.(woff2?|ttf|otf|eot|svg)$/,
        exclude: /node_modules/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]"
        }
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  devtool: "source-map",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./template/index.ejs",
      title: "Biitit",
      inject: false,
      hash: true
    })
  ],
  devServer: {
    contentBase: path.resolve("./public")
  }
};
