const iconCache = new Map();

function resolveIconUrl(name) {
  // Namespaced name, e.g. "brands/itchdotio" -> /assets/icons/brands/itchdotio.svg
  if (name.includes('/')) return `/assets/icons/${name}.svg`;
  // Plain name, e.g. "download" -> /assets/icons/lucide/download.svg
  return `/assets/icons/lucide/${name}.svg`;
}

async function createIcons() {
  const iconElements = document.querySelectorAll('icon[data-icon-name]');
  
  const groups = {};
  iconElements.forEach(element => {
    const name = element.dataset.iconName;
    if (name) {
      if (!groups[name]) groups[name] = [];
      groups[name].push(element);
    }
  });

  const fetchPromises = Object.keys(groups).map(async (iconName) => {
    let svgElement;

    if (iconCache.has(iconName)) {
      svgElement = iconCache.get(iconName);
    } else {
      try {
        const response = await fetch(resolveIconUrl(iconName));
        if (!response.ok) throw new Error(`Local icon "${iconName}" not found.`);
        const svgText = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        svgElement = doc.querySelector('svg');
        
        if (svgElement) {
          if (!svgElement.hasAttribute('fill')) {
            svgElement.setAttribute('fill', 'currentColor');
          }
          iconCache.set(iconName, svgElement);
        }
      } catch (err) {
        console.error('Icon Loader Error:', err);
        return;
      }
    }

    if (svgElement) {
      groups[iconName].forEach(element => {
        element.replaceChildren(svgElement.cloneNode(true));
      });
    }
  });

  await Promise.all(fetchPromises);
}