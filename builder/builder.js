'use strict';

const { build } = require('./build.js');
const { cleanGeneratedFiles } = require('./output.js');
const { serve, watch } = require('./serve.js');

function parseArguments(argumentsList) {
  const command = argumentsList[0] || '';
  const tokens = argumentsList.slice(1);
  const portToken = tokens.find((token) => /^\d+$/.test(token));
  const open = !tokens.some((token) => token === 'no-open' || token === '--no-open');

  return {
    clean: command === 'clear' || command === 'clean',
    watch: command === 'watch',
    serve: command === 'serve',
    port: portToken ? Number(portToken) : 5500,
    open,
  };
}

function builder(argumentsList) {
  const options = parseArguments(argumentsList);

  if (options.clean) {
    cleanGeneratedFiles();
    return;
  }

  if (options.serve) {
    serve(options.port, options.open);
    return;
  }

  if (options.watch) {
    watch();
    return;
  }

  build();
}

if (require.main === module) {
  try {
    builder(process.argv.slice(2));
  } catch (error) {
    console.error(`Build failed: ${error.message}`);
    console.error(error);
    process.exitCode = 1;
  }
}

module.exports = { builder };
