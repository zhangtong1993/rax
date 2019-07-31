'use strict';
const _ = require('lodash');
const webpack = require('webpack');
const serverRender = require('rax-server-renderer');
const babelMerge = require('babel-merge');
const babelConfig = require('../babel.config');
const UniversalDocumentPlugin = require('../universal-document-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const babelConfigWeb = babelMerge.all([{
  plugins: [require.resolve('rax-hot-loader/babel')],
}, babelConfig]);

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const getWebpackConfig = require('../webpack.config');

module.exports = () => {
  const webConfig = getWebpackConfig();

  webConfig.output.filename('[name].js');

  webConfig.externals({
    '@core/app': 'window.__core__',
    '@core/page': 'window.__core__',
    '@core/router': 'window.__core__',
  })

  webConfig.module.rule('jsx')
    .test(/\.(js|mjs|jsx)$/)
    .exclude
      .add(/(node_modules|bower_components)/)
      .end()
    .use('babel')
      .loader(require.resolve('babel-loader'))
      .options(babelConfigWeb);

  webConfig.module.rule('tsx')
    .test(/\.tsx?$/)
    .exclude
      .add(/(node_modules|bower_components)/)
      .end()
    .use('babel')
      .loader(require.resolve('babel-loader'))
      .options(babelConfigWeb)
      .end()
    .use('ts')
      .loader(require.resolve('ts-loader'));
  
  webConfig.module.rule('tsx')
    .test(/\.tsx?$/)
    .exclude
      .add(/(node_modules|bower_components)/)
      .end()
    .use('babel')
      .loader(require.resolve('babel-loader'))
      .options(babelConfigWeb)
      .end()
    .use('ts')
      .loader(require.resolve('ts-loader'));
  
  webConfig.module.rule('css')
    .test(/\.css?$/)
    .use('minicss')
      .loader(MiniCssExtractPlugin.loader)
      .end()
    .use('css')
      .loader(require.resolve('css-loader'))
      .end()
    .use('postcss')
      .loader(require.resolve('postcss-loader'))
      .options({
        ident: 'postcss',
        plugins: () => [
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
          require('postcss-plugin-rpx2vw')(),
        ],
      });
  
  webConfig.module.rule('assets')
    .test(/\.(svg|png|webp|jpe?g|gif)$/i)
    .use('source')
      .loader(require.resolve('image-source-loader'));

  if (process.env.ANALYZER) {
    config.plugin('analyze')
      .use(BundleAnalyzerPlugin);
  }

  webConfig.plugin('document')
    .use(UniversalDocumentPlugin, [{
      render: serverRender.renderToString,
    }]);

  webConfig.plugin('minicss')
    .use(MiniCssExtractPlugin, [{
      filename: '[name].css',
      chunkFilename: '[id].css',
    }]);

  webConfig.plugin('noError')
    .use(webpack.NoEmitOnErrorsPlugin);
  
  return webConfig;
};
