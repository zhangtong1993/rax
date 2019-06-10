const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const getShellConfig = require('./ShellWebpackConfig.js');
const pathToRegexp = require('path-to-regexp')

const { createElement } = require('rax');
const renderer = require('rax-server-renderer');

const NAME = 'rax-client-webpack-plugin';

class ClientPlugin {
  constructor(options) {
    this.ready = false;
    this.options = options;
    this.AppShellTemplate = '';
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync(NAME, (compilationParams, callback) => {
      const pathConfig = this.options.pathConfig;
      webpack(getShellConfig(pathConfig)).run((err) => {
        if (err) {
          console.error(err);
          return false;
        }
        const shellJsPath = path.resolve(pathConfig.appBuild, './shell.js');
        const component = require(shellJsPath).default;

        this.AppShellTemplate = renderer.renderToString(createElement(component, {}, createElement('div', { id: 'root-page' })));
        fs.unlinkSync(shellJsPath);
        callback();
      });
    });

    compiler.hooks.compilation.tap(NAME, bundle => {
      bundle.hooks.optimizeModules.tap(NAME, modules => {
        modules.forEach(mod => {
          if (mod.resource && mod.resource.indexOf('public/index.html') > -1) {
            mod._source._value = mod._source._value.replace(
              '<div id="root"></div>',
              `<div id="root">${this.AppShellTemplate}</div>`
            );
            // 如果开启 Service Worker
            if (true) {
              mod._source._value = mod._source._value.replace(
                '</body>',
                '<script>!function(){var e=document.createElement("script");e.src="/regSW.js?"+Date.now(),e.async=!0,e.type="text/javascript",e.crossOrigin="anonymous",document.head.insertBefore(e,document.head.firstChild)}();</script></body>'
              );
            }
            console.log(pathToRegexp('/index'))
            // 骨骼图
            if (true) {
              mod._source._value = mod._source._value.replace(
                '</body>',
                '<script>var pathname=window.location.pathname,hash=window.location.hash,isMatched=function(a,t){return"hash"===t?a.test(hash.replace("#","")):"history"===t&&a.test(pathname)};isMatched(' + pathToRegexp('/index').toString().replace(/\\/g, '\\\\') + ',"hash")&&(document.getElementById("root-page").innerHTML=`<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMTA4MCAyNjEiPjxkZWZzPjxwYXRoIGlkPSJiIiBkPSJNMCAwaDEwODB2MjYwSDB6Ii8+PGZpbHRlciBpZD0iYSIgd2lkdGg9IjIwMCUiIGhlaWdodD0iMjAwJSIgeD0iLTUwJSIgeT0iLTUwJSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij48ZmVPZmZzZXQgZHk9Ii0xIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+PGZlQ29sb3JNYXRyaXggaW49InNoYWRvd09mZnNldE91dGVyMSIgdmFsdWVzPSIwIDAgMCAwIDAuOTMzMzMzMzMzIDAgMCAwIDAgMC45MzMzMzMzMzMgMCAwIDAgMCAwLjkzMzMzMzMzMyAwIDAgMCAxIDAiLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEpIj48dXNlIGZpbGw9IiMwMDAiIGZpbHRlcj0idXJsKCNhKSIgeGxpbms6aHJlZj0iI2IiLz48dXNlIGZpbGw9IiNGRkYiIHhsaW5rOmhyZWY9IiNiIi8+PHBhdGggZmlsbD0iI0Y2RjZGNiIgZD0iTTIzMCA0NGg1MzN2NDZIMjMweiIvPjxyZWN0IHdpZHRoPSIxNzIiIGhlaWdodD0iMTcyIiB4PSIzMCIgeT0iNDQiIGZpbGw9IiNGNkY2RjYiIHJ4PSI0Ii8+PHBhdGggZmlsbD0iI0Y2RjZGNiIgZD0iTTIzMCAxMThoMzY5djMwSDIzMHpNMjMwIDE4MmgzMjN2MzBIMjMwek04MTIgMTE1aDIzOHYzOUg4MTJ6TTgwOCAxODRoMjQydjMwSDgwOHpNOTE3IDQ4aDEzM3YzN0g5MTd6Ii8+PC9nPjwvc3ZnPg=="/>`);</script></body>'
              );
            }
          }
        });
      });
    });
  }
}

module.exports = ClientPlugin;