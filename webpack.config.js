const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: "node",
  output: {
    globalObject: "typeof self !== 'undefined' ? self : this",
    path: path.resolve(__dirname, 'dist'),
    filename: 'fetcher_browser_database.js',
    library: 'fetcher_browser_database',
    libraryTarget: 'umd'
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: "source-map",
  externals: {
    'country-language': 'country-language'
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    modules: [
      "./node_modules",
      "./src",
    ]
  },
  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader", enforce: 'pre' },
      {
        test: /\.tsx?$/, loader: "awesome-typescript-loader" }
    ]
  },

};
