const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CompressionWbpackPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  target: "web",
  entry: {
    index: path.resolve("src/index.jsx"),
  },
  output: {
    filename: "[name].js",
    path: path.resolve("dist"),
    library: "react-forms-system",
    libraryTarget: "umd",
    umdNamedDefine: true,
  },
  resolve: {
    extensions: [" ", ".js", ".jsx"],
    alias: {
      "@": path.resolve("src"),
    },
  },
  module: {
    rules: [{ test: /\.jsx?$/, use: ["babel-loader"] }],
  },
  plugins: [
    new CleanWebpackPlugin(["dist"], {
      root: path.resolve("./"),
    }),
    new CompressionWbpackPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.(js|css)$/,
      }),
    ],
  },
};
