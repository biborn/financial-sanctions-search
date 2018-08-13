const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: path.resolve(__dirname, "static"),
    filename: "bundle.js"
  },
  devServer: {
    hot: true,
    publicPath: "/static/",
    port: 9000,
    contentBase: [
      path.join(__dirname, "node_modules/govuk-frontend"),
    ],
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  },
  module: {
    rules: [
      {
        test: /\.(c|sa|sc)ss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: "style.css"
    })
  ],
  resolve: {
    extensions: [".js", ".scss"]
  }
};
