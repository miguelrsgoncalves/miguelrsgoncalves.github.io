'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

const paths = {
  projectRoot,
  shell: path.join(projectRoot, 'index.html'),
  pages: path.join(projectRoot, 'pages'),
};

function parseArguments(argumentsList) {
  return {
    clean: argumentsList.includes('clean'),
    local: argumentsList.includes('--local'),
  };
}

function readBuildInputs() {
  if (!fs.existsSync(paths.shell)) {
    throw new Error(`Missing shell file: ${paths.shell}`);
  }

  if (!fs.existsSync(paths.pages)) {
    throw new Error(`Missing pages directory: ${paths.pages}`);
  }

  return {
    shell: fs.readFileSync(paths.shell, 'utf8'),
    routes: discoverRoutes(),
  };
}

function discoverRoutes() {
  const routes = [];
  const pageEntries = fs.readdirSync(paths.pages, {
    withFileTypes: true,
  });

  for (const pageEntry of pageEntries) {
    if (pageEntry.isDirectory()) {
      routes.push({
        name: pageEntry.name,
        directory: path.join(paths.pages, pageEntry.name),
      });
      continue;
    }

    if (pageEntry.isFile() && pageEntry.name.endsWith('.html')) {
      routes.push({
        name: pageEntry.name.slice(0, -'.html'.length),
        file: path.join(paths.pages, pageEntry.name),
      });
    }
  }

  routes.sort((firstRoute, secondRoute) => {
    return firstRoute.name.localeCompare(secondRoute.name);
  });

  return routes;
}

function build(argumentsList) {
  const options = parseArguments(argumentsList);

  if (options.clean) {
    console.log('Clean mode is not implemented yet.');
    return;
  }

  const inputs = readBuildInputs();

  console.log('Builder foundation is working.');
  console.log(`Project root: ${paths.projectRoot}`);
  console.log(`Shell characters: ${inputs.shell.length}`);
  console.log(`Routes discovered: ${inputs.routes.length}`);

  for (const route of inputs.routes) {
    console.log(`- ${route.name}`);
  }
}

try {
  build(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}