'use strict';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { paths, reloadSnippet } = require('./config.js');
const { build } = require('./build.js');

const serverPidFile = paths.serverPid;

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function stopRunningServer() {
  if (!fs.existsSync(serverPidFile)) {
    return false;
  }

  const pid = Number(fs.readFileSync(serverPidFile, 'utf8').trim());

  if (Number.isInteger(pid) && isProcessAlive(pid)) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch (error) {}
  }

  fs.unlinkSync(serverPidFile);
  console.log('Server stopped.');
  return true;
}

function recordServerPid() {
  fs.writeFileSync(serverPidFile, String(process.pid));
}

function removeServerPid() {
  try {
    fs.unlinkSync(serverPidFile);
  } catch (error) {}
}

function debounce(callback, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function watchSources(rebuild) {
  const groupDirectories = fs
    .readdirSync(paths.pages, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(paths.pages, entry.name));

  fs.watch(paths.shell, rebuild);
  fs.watch(paths.pages, rebuild);
  for (const directory of groupDirectories) {
    fs.watch(directory, rebuild);
  }
}

function runBuild() {
  try {
    build();
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

//#region watch

function watch() {
  runBuild();
  const rebuild = debounce(runBuild, 150);
  watchSources(rebuild);
  console.log('Watching for changes... (Ctrl+C to stop)');
}

//#endregion

//#region serve

function contentTypeFor(filePath) {
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.pdf': 'application/pdf',
  };

  return types[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function serveStaticFile(urlPath, request, response) {
  const normalized = path.normalize(decodeURIComponent(urlPath));
  let filePath = path.join(paths.projectRoot, normalized);

  if (!filePath.startsWith(paths.projectRoot)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const type = contentTypeFor(filePath);

  if (type === 'text/html; charset=utf-8') {
    let html = fs.readFileSync(filePath, 'utf8');

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${reloadSnippet}</body>`);
    } else {
      html = `${html}${reloadSnippet}`;
    }

    response.writeHead(200, { 'Content-Type': type });
    response.end(html);
    return;
  }

  response.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(response);
}

function openInBrowser(url) {
  const platformCommand = {
    darwin: 'open',
    linux: 'xdg-open',
    win32: 'cmd',
  }[process.platform];

  if (!platformCommand) {
    return;
  }

  const args = process.platform === 'win32'
    ? ['/c', 'start', '', url]
    : [url];

  try {
    const child = spawn(platformCommand, args, { stdio: 'ignore', detached: true });
    child.unref();
  } catch (error) {}
}

function serve(port, open) {
  if (stopRunningServer()) {
    process.exitCode = 0;
    return;
  }

  if (!runBuild()) {
    process.exitCode = 1;
    return;
  }

  const reloadClients = new Set();

  const server = http.createServer((request, response) => {
    const urlPath = new URL(request.url, 'http://localhost').pathname;

    if (urlPath === '/__reload') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      response.write('retry: 1000\n\n');
      reloadClients.add(response);
      request.on('close', () => reloadClients.delete(response));
      return;
    }

    serveStaticFile(urlPath, request, response);
  });

  const rebuild = debounce(() => {
    if (runBuild()) {
      for (const client of reloadClients) {
        client.write('data: reload\n\n');
      }
    }
  }, 150);

  watchSources(rebuild);

  recordServerPid();

  const stopServer = () => {
    server.close();
    removeServerPid();
    process.exit(0);
  };

  process.once('SIGINT', stopServer);
  process.once('SIGTERM', stopServer);

  server.listen(port, () => {
    console.log(`Serving http://localhost:${port}`);
    console.log('Watching for changes... (Ctrl+C to stop, or press serve again)');

    if (open) {
      openInBrowser(`http://localhost:${port}`);
    }
  });
}

//#endregion

module.exports = { serve, watch };
