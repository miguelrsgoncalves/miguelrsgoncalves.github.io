'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { paths, getDomain } = require('./config.js');
const { readBuildInputs } = require('./routes.js');
const {
  createManifest,
  addBuildFile,
  addBuildDirectory,
  addFragment,
  writeRoutePage,
  writeSitemap,
  writeRobots,
  writeOutputIgnores,
  removeStaleFiles,
  readManifest,
  writeManifest,
  contentHash,
} = require('./output.js');

function build() {
  const inputs = readBuildInputs();
  const previous = readManifest();
  const previousHashes = new Map(
    previous
      ? previous.build.files.map((entry) => [entry.path, entry.hash])
      : [],
  );

  const domain = getDomain();
  const manifest = createManifest();
  let builtCount = 0;

  for (const route of inputs.routes) {
    let fragment;

    try {
      fragment = fs.readFileSync(route.sourcePath, 'utf8');
    } catch (error) {
      throw new Error(`Could not process fragment '${route.sourcePath}': ${error.message}`);
    }

    addFragment(manifest, route);

    const inputHash = contentHash([inputs.shell, fragment, domain]);
    const outputFile = `${route.outputPath}/index.html`;
    const outputPath = path.join(paths.projectRoot, outputFile);

    if (previousHashes.get(outputFile) === inputHash && fs.existsSync(outputPath)) {
      addBuildDirectory(manifest, route.outputPath);
      addBuildFile(manifest, outputFile, inputHash);
      continue;
    }

    writeRoutePage(route, inputs.shell, domain, fragment, inputHash, manifest);
    builtCount += 1;
  }

  writeSitemap(inputs.routes, domain, manifest, previousHashes);
  writeRobots(domain, manifest, previousHashes);
  writeOutputIgnores(manifest);

  removeStaleFiles(previous, manifest);
  writeManifest(manifest);

  console.log(`  Routes: ${builtCount} built, ${inputs.routes.length - builtCount} unchanged`);
  return manifest.build.files.length;
}

module.exports = { build };
