'use strict';

function getRouteDataAttributes(fragment) {
  const match = fragment.match(/<route-data\b([^>]*)>/);

  if (!match) {
    return '';
  }

  return match[1];
}

function getAttribute(attributes, name) {
  const valuePattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`);

  if (valuePattern.test(attributes)) {
    const match = attributes.match(valuePattern);

    return match[2] ?? match[3];
  }

  if (new RegExp(`\\b${name}\\s*=`).test(attributes)) {
    throw new Error(`Malformed '${name}' in route-data: value is missing or unterminated`);
  }

  return null;
}

function hasAttribute(attributes, name) {
  return attributes.includes(name);
}

function extractMetadata(fragment) {
  const attributes = getRouteDataAttributes(fragment);

  return {
    title: getAttribute(attributes, 'data-title'),
    description: getAttribute(attributes, 'data-description') ?? '',
    hideRouteTitle: hasAttribute(attributes, 'data-hide-route-title'),
  };
}

function extractDataList(fragment, attributeName) {
  const attributes = getRouteDataAttributes(fragment);
  const rawValue = getAttribute(attributes, attributeName);

  if (rawValue === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      throw new Error(`expected a JSON array, got ${typeof parsed}`);
    }

    return parsed;
  } catch (error) {
    throw new Error(`Invalid '${attributeName}' JSON in route-data: ${error.message}`);
  }
}

function processFragment(fragment) {
  const scripts = [];

  const withoutScripts = fragment.replace(
    /<script\s*(?:defer\s*)?>([\s\S]*?)<\/script>/g,
    (match, innerCode) => {
      const code = innerCode.trim();

      if (code) {
        scripts.push(code);
      }

      return '';
    },
  );

  const withoutRouteData = withoutScripts.replace(
    /<route-data[\s\S]*?<\/route-data>\s*/g,
    '',
  );

  return {
    content: withoutRouteData.trim(),
    scripts,
  };
}

module.exports = { extractMetadata, extractDataList, processFragment };
