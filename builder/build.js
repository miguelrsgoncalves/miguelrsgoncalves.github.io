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
    clean: argumentsList[0] === 'clean',
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
  const routeGroups = fs.readdirSync(paths.pages, {
    withFileTypes: true,
  });

  for (const routeGroup of routeGroups) {
    if (!routeGroup.isDirectory()) {
      continue;
    }

    const groupName = routeGroup.name;
    const groupDirectory = path.join(paths.pages, groupName);
    const entries = fs.readdirSync(groupDirectory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.html')) {
        continue;
      }

      const routeName = entry.name.slice(0, -'.html'.length);
      const outputPath = getOutputPath(groupName, routeName);

      routes.push({
        groupName,
        routeName,
        sourcePath: path.join(groupDirectory, entry.name),
        outputPath,
      });
    }
  }

  routes.sort((firstRoute, secondRoute) => {
    return firstRoute.outputPath.localeCompare(secondRoute.outputPath);
  });

  return routes;
}

function getOutputPath(groupName, routeName) {
  if (groupName === 'tabs') {
    return routeName;
  }

  return `${groupName}/${routeName}`;
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
  console.log(`Domain: ${getDomain()}`);
  console.log(`Shell characters: ${inputs.shell.length}`);
  console.log(`Routes discovered: ${inputs.routes.length}`);

  for (const route of inputs.routes) {
    console.log(
      `${route.sourcePath} -> ${route.outputPath}/index.html`,
    );
  }
}

try {
  build(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}