'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { paths, gitignoreMarkers } = require('./config.js');
const { extractMetadata, extractDataList, processFragment } = require('./parser.js');
const { buildPage, getOgImagePath } = require('./page.js');

function createManifest() {
  return {
    build: {
      files: [],
      directories: [],
    },
    fragments: [],
  };
}

function addBuildFile(manifest, filePath, hash) {
  manifest.build.files.push({ path: filePath, hash });
}

function addBuildDirectory(manifest, directory) {
  if (!manifest.build.directories.includes(directory)) {
    manifest.build.directories.push(directory);
  }
}

function addFragment(manifest, route) {
  manifest.fragments.push({
    path: path.join('pages', route.groupName, route.fileName),
    outputPath: route.outputPath,
  });
}

function writeRoutePage(route, shell, domain, fragment, inputHash, manifest) {
  let metadata;
  let scriptPaths;
  let stylePaths;

  try {
    metadata = extractMetadata(fragment);
    scriptPaths = extractDataList(fragment, 'data-js');
    stylePaths = extractDataList(fragment, 'data-css');
  } catch (error) {
    throw new Error(`Could not process fragment '${route.sourcePath}': ${error.message}`);
  }

  const processed = processFragment(fragment);

  const page = buildPage({
    shell,
    content: processed.content,
    inlineScripts: processed.scripts,
    title: metadata.title,
    description: metadata.description,
    route: route.outputPath,
    domain,
    ogImagePath: getOgImagePath(route),
    dataJs: scriptPaths,
    dataCss: stylePaths,
  });

  const outputDirectory = path.join(paths.projectRoot, route.outputPath);
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, 'index.html'), page);

  addBuildDirectory(manifest, route.outputPath);
  addBuildFile(manifest, `${route.outputPath}/index.html`, inputHash);
  console.log(`  Built: ${route.outputPath}/index.html`);
}

function writeSitemap(routes, domain, manifest, previousHashes) {
  const urls = [`  <url>\n    <loc>${domain}/</loc>\n  </url>`];

  for (const route of routes) {
    urls.push(`  <url>\n    <loc>${domain}/${route.outputPath}/</loc>\n  </url>`);
  }

  const sitemap = [
    '<?xml version="1.0" ?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  const filePath = 'sitemap.xml';
  const hash = contentHash([sitemap]);

  if (previousHashes.get(filePath) === hash && fs.existsSync(path.join(paths.projectRoot, filePath))) {
    addBuildFile(manifest, filePath, hash);
    return;
  }

  fs.writeFileSync(path.join(paths.projectRoot, filePath), sitemap);
  addBuildFile(manifest, filePath, hash);
  console.log('  Built: sitemap.xml');
}

function writeRobots(domain, manifest, previousHashes) {
  const robots = `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`;

  const filePath = 'robots.txt';
  const hash = contentHash([robots]);

  if (previousHashes.get(filePath) === hash && fs.existsSync(path.join(paths.projectRoot, filePath))) {
    addBuildFile(manifest, filePath, hash);
    return;
  }

  fs.writeFileSync(path.join(paths.projectRoot, filePath), robots);
  addBuildFile(manifest, filePath, hash);
  console.log('  Built: robots.txt');
}

function updateGitignore(manifest) {
  const gitignorePath = path.join(paths.projectRoot, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    return;
  }

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const entries = new Set();

  for (const directory of manifest.build.directories) {
    entries.add(`/${directory.split('/')[0]}/`);
  }

  entries.add('/robots.txt');
  entries.add('/sitemap.xml');

  const generatedBlock = [...entries].sort().join('\n');
  const newSection = `${gitignoreMarkers.start}\n${generatedBlock}\n${gitignoreMarkers.end}`;
  const pattern = new RegExp(
    `${escapeRegExp(gitignoreMarkers.start)}[\\s\\S]*?${escapeRegExp(gitignoreMarkers.end)}`,
  );
  let newContent;

  if (pattern.test(content)) {
    newContent = content.replace(pattern, newSection);
  } else {
    newContent = `${content.trimEnd()}\n\n${newSection}\n`;
  }

  if (newContent !== content) {
    fs.writeFileSync(gitignorePath, newContent);
    console.log('  Updated: .gitignore');
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filePathsFrom(manifest) {
  const files = manifest.build ? manifest.build.files : manifest.files || [];

  return files.map((entry) => (typeof entry === 'string' ? entry : entry.path));
}

function directoriesFrom(manifest) {
  return manifest.build ? manifest.build.directories : manifest.directories || [];
}

function removeStaleFiles(previous, manifest) {
  if (!previous) {
    return;
  }

  const newFiles = new Set(manifest.build.files.map((entry) => entry.path));

  for (const file of filePathsFrom(previous)) {
    if (!newFiles.has(file)) {
      const filePath = path.join(paths.projectRoot, file);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`  Deleted: ${file}`);
      }
    }
  }

  for (const directory of directoriesFrom(previous)) {
    if (!manifest.build.directories.includes(directory)) {
      if (removeDirectoryIfEmpty(path.join(paths.projectRoot, directory))) {
        console.log(`  Deleted dir: ${directory}`);
      }
    }
  }
}

function removeDirectoryIfEmpty(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return false;
  }

  const entries = fs.readdirSync(directoryPath);

  if (entries.length === 0) {
    fs.rmdirSync(directoryPath);
    return true;
  }

  if (entries.length === 1 && entries[0] === '.gitignore') {
    fs.unlinkSync(path.join(directoryPath, '.gitignore'));
    fs.rmdirSync(directoryPath);
    return true;
  }

  return false;
}

function readManifest() {
  if (!fs.existsSync(paths.manifest)) {
    return null;
  }

  const manifest = JSON.parse(fs.readFileSync(paths.manifest, 'utf8'));

  if (!manifest.build || !Array.isArray(manifest.build.files)) {
    return null;
  }

  return manifest;
}

function writeManifest(manifest) {
  fs.writeFileSync(paths.manifest, JSON.stringify(manifest, null, 2));
}

function cleanGeneratedFiles() {
  if (!fs.existsSync(paths.manifest)) {
    console.log('No build manifest found. Nothing to clean.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(paths.manifest, 'utf8'));

  for (const file of filePathsFrom(manifest)) {
    const filePath = path.join(paths.projectRoot, file);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  Deleted: ${file}`);
    }
  }

  const directories = [...directoriesFrom(manifest)].sort(
    (first, second) => second.length - first.length,
  );

  for (const directory of directories) {
    if (removeDirectoryIfEmpty(path.join(paths.projectRoot, directory))) {
      console.log(`  Deleted dir: ${directory}`);
    }
  }

  fs.unlinkSync(paths.manifest);
  console.log('Clean complete.');
}

function contentHash(parts) {
  return crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

module.exports = {
  createManifest,
  addBuildFile,
  addBuildDirectory,
  addFragment,
  writeRoutePage,
  writeSitemap,
  writeRobots,
  updateGitignore,
  removeStaleFiles,
  readManifest,
  writeManifest,
  cleanGeneratedFiles,
  contentHash,
};
