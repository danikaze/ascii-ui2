const { join } = require('path');
const { DefinePlugin } = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { getTemplateVars } = require('./test/html/template');
const {
  getDefineValues,
  getEntries,
  getChunkFiles,
} = require('./test/webpack');

const gitRevisionPlugin = new GitRevisionPlugin();
const targetPath = join(__dirname, 'vr-test-static');

module.exports = env => {
  const isProduction = env && env.prod;
  const isStatic = env && env.static;

  const stats = {
    assetsSort: 'name',
    modules: false,
    children: false,
    excludeAssets: [/hot(-update)?\.js(on)?/, /webpack-dev-server/],
  };

  return {
    mode: isProduction ? 'production' : 'development',
    watch: !isStatic,
    devtool: isProduction ? undefined : 'source-map',

    entry: getEntries(),

    output: {
      path: targetPath,
    },

    stats,

    devServer: {
      stats,
      contentBase: targetPath,
      compress: true,
      port: 9000,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
    },

    target: 'node',

    optimization: {
      minimize: isProduction,
      namedModules: !isProduction,
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules)|(data)/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        },
      ],
    },

    plugins: [
      new DefinePlugin(
        getDefineValues({
          NODE_ENV: isProduction ? 'production' : 'development',
        })
      ),
      new HtmlWebpackPlugin({
        template: join(__dirname, 'test', 'html', 'index.html'),
        filename: 'index.html',
        ...getTemplateVars(getChunkFiles(), gitRevisionPlugin),
      }),
    ],
  };
};
