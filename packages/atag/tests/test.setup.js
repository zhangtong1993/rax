const chalk = require('chalk');
const puppeteer = require('puppeteer');
const fs = require('fs');
const kill = require('kill-port')
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
const DEV_PORT = 9002;

module.exports = async function() {
  kill(DEV_PORT);
  console.log(chalk.green('Setup WebpackDevServer at ' + DEV_PORT));
  global.__WEBPACK_DEV_SERVER__ = await startDevServer(DEV_PORT);

  console.log(chalk.green('Setup Puppeteer'));
  const browser = await puppeteer.launch({});
  // This global is not available inside tests but only in global teardown
  global.__BROWSER_GLOBAL__ = browser;
  // Instead, we expose the connection details via file system to be used in tests
  mkdirp.sync(DIR);
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};

function startDevServer(port) {
  port = port || 9002;
  return new Promise((resolve => {
    const handle = spawn(require.resolve('webpack-dev-server/bin/webpack-dev-server.js'), [
      '--config',
      require.resolve('../config/webpack.config.dev.js'),
      '--content-base=' + path.resolve(__dirname, '../src'),
      '--host=0.0.0.0',
      '--port=' + port,
      '--hot=false',
    ], {
      env: Object.assign({}, process.env, {
        NODE_ENV: 'development',
      }),
      // stdio: 'inherit',
    });
    handle.stdout.on('data', (data) => {
      const str = data.toString();
      console.log(str);
      if (str.indexOf('Compiled successfully.') !== -1) {
        resolve(handle);
      }
    });
  }));
}
