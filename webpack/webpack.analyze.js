const { merge } = require("webpack-merge");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const base = require("./webpack.prod");

module.exports = merge(base, {
  plugins: [...base.plugins, new BundleAnalyzerPlugin()],
});
