'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

const paths = {
  projectRoot,
  builder: path.join(projectRoot, 'builder'),
  manifest: path.join(projectRoot, 'builder', 'bin', '.build-manifest.json'),
  serverPid: path.join(projectRoot, 'builder', 'bin', '.build-server.pid'),
  shell: path.join(projectRoot, 'index.html'),
  pages: path.join(projectRoot, 'pages'),
};

const gitignoreMarkers = {
  start: '# Builder Output',
  end: '# End Builder Output',
};

const reloadSnippet = `
<script>
(function () {
  const reloadStream = new EventSource('/__reload');
  reloadStream.onmessage = function () {
    window.location.reload();
  };
})();
</script>`;

function getDomain() {
  const cnamePath = path.join(projectRoot, 'CNAME');

  if (!fs.existsSync(cnamePath)) {
    return 'http://localhost:5500';
  }

  return `https://${fs.readFileSync(cnamePath, 'utf8').trim()}`;
}

module.exports = { projectRoot, paths, gitignoreMarkers, reloadSnippet, getDomain };
