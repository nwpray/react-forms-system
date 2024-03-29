const path = require("path");
const { merge } = require("webpack-merge");
const base = require("./webpack.base");

module.exports = merge(base, {
  mode: "development",
  devServer: {
    contentBase: path.resolve("dist"),
  },
});
