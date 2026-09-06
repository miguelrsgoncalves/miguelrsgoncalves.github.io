'use strict';

function escapeAttr(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function getOgImagePath(route) {
  if (route.groupName === 'tabs') {
    return null;
  }

  return `/assets/${route.groupName}/${route.routeName}/images/thumbnail.png`;
}

function buildPage(options) {
  const { shell, content, inlineScripts, title, description, route, domain, ogImagePath, dataJs, dataCss } = options;

  let page = shell;
  const fullTitle = title ? `MRSG | ${title}` : 'MRSG';
  const desc = description || 'All there is about MRSG';

  page = page.replace(/\n\t\t<meta property="og:[^>]*>/g, '');
  page = page.replace(/\n\t\t<meta name="twitter:[^>]*>/g, '');
  page = page.replace(/\n\t\t<link rel="canonical"[^>]*>/g, '');
  page = page.replace(/\n\n\n+/g, '\n\n');

  page = page.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(fullTitle)}</title>`);
  page = page.replace(
    /<meta name="description" content=".*?">/,
    `<meta name="description" content="${escapeAttr(desc)}">`,
  );

  const routeUrl = route ? `${domain}/${route}/` : `${domain}/`;
  const ogImageUrl = ogImagePath
    ? `${domain}${ogImagePath}`
    : `${domain}/assets/logo/mrsg_logo.png`;

  const ogBlock = `\t\t<meta property="og:title" content="${escapeAttr(fullTitle)}">
\t\t<meta property="og:description" content="${escapeAttr(desc)}">
\t\t<meta property="og:url" content="${routeUrl}">
\t\t<meta property="og:type" content="website">
\t\t<meta property="og:image" content="${ogImageUrl}">
\t\t<meta name="twitter:card" content="summary_large_image">
\t\t<meta name="twitter:title" content="${escapeAttr(fullTitle)}">
\t\t<meta name="twitter:description" content="${escapeAttr(desc)}">
\t\t<meta name="twitter:image" content="${ogImageUrl}">
\t\t<link rel="canonical" href="${routeUrl}">`;

  const headParts = [];
  for (const cssPath of dataCss) {
    headParts.push(`\t\t<link route-fragment rel="stylesheet" href="${cssPath}">`);
  }
  for (const jsPath of dataJs) {
    headParts.push(`\t\t<script route-fragment src="${jsPath}" defer></script>`);
  }

  let headBlock;
  if (headParts.length > 0) {
    headBlock = `\n${headParts.join('\n')}

${ogBlock}
\t</head>`;
  } else {
    headBlock = `${ogBlock}\n\t</head>`;
  }

  headBlock = headBlock.replace(/\n\n\n+/g, '\n\n');
  page = page.replace('\n\t</head>', `\n${headBlock}`);

  page = page.replace('<main></main>', `<main>\n${content}\n\t\t</main>`);

  if (inlineScripts.length > 0) {
    page = page.replace('\t</body>', `${buildScriptBlock(inlineScripts)}\n\t</body>`);
  }

  return page;
}

function buildScriptBlock(inlineScripts) {
  const blocks = [];

  for (const script of inlineScripts) {
    const lines = [];

    for (const rawLine of script.trim().split('\n')) {
      const line = rawLine.trim();

      if (line) {
        lines.push(`\t\t\t\t${line}`);
      }
    }

    blocks.push(lines.join('\n'));
  }

  const combined = blocks.join('\n\n');

  return [
    '\n\t\t<script route-fragment>',
    '\t\t\tfunction runPageScripts() {',
    combined,
    '\t\t\t}',
    '\t\t\tif (document.readyState === "loading") {',
    '\t\t\t\tdocument.addEventListener("DOMContentLoaded", runPageScripts);',
    '\t\t\t} else {',
    '\t\t\t\trunPageScripts();',
    '\t\t\t}',
    '\t\t</script>',
    '',
  ].join('\n');
}

module.exports = { buildPage, getOgImagePath };
