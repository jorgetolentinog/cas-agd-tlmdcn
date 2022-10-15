const path = require("path");
const slsw = require("serverless-webpack");
const TerserPlugin = require("terser-webpack-plugin");

Object.entries(slsw.lib.entries).forEach(([key, value]) => {
  slsw.lib.entries[key] = [
    "reflect-metadata",
    '@/infrastructure/injection',
    value,
  ];
});

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  target: "node",
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
        },
      }),
    ],
  },
};
