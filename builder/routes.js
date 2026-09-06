'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { paths } = require('./config.js');

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
        fileName: entry.name,
        sourcePath: path.join(groupDirectory, entry.name),
        outputPath,
      });
    }
  }

  routes.sort(compareRoutes);

  return routes;
}

function compareRoutes(firstRoute, secondRoute) {
  if (firstRoute.groupName !== secondRoute.groupName) {
    if (firstRoute.groupName === 'tabs') {
      return -1;
    }

    if (secondRoute.groupName === 'tabs') {
      return 1;
    }

    if (firstRoute.groupName < secondRoute.groupName) {
      return -1;
    }

    return 1;
  }

  if (firstRoute.fileName < secondRoute.fileName) {
    return -1;
  }

  if (firstRoute.fileName > secondRoute.fileName) {
    return 1;
  }

  return 0;
}

function getOutputPath(groupName, routeName) {
  if (groupName === 'tabs') {
    return routeName;
  }

  return `${groupName}/${routeName}`;
}

module.exports = { readBuildInputs };
