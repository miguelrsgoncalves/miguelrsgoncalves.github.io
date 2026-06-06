const iconCache = new Map();

async function createIcons() {
  const iconElements = document.querySelectorAll('icon[icon-name]');
  
  const groups = {};
  iconElements.forEach(el => {
    const name = el.getAttribute('icon-name');
    if (name) {
      if (!groups[name]) groups[name] = [];
      groups[name].push(el);
    }
  });

  const fetchPromises = Object.keys(groups).map(async (iconName) => {
    let svgElement;

    if (iconCache.has(iconName)) {
      svgElement = iconCache.get(iconName);
    } else {
      try {
        const response = await fetch(`/assets/fonts/icons/lucide-icons/${iconName}.svg`);
        if (!response.ok) throw new Error(`Local icon "${iconName}.svg" not found.`);
        const svgText = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        svgElement = doc.querySelector('svg');
        
        if (svgElement) {
          svgElement.setAttribute('class', 'lucide');
          iconCache.set(iconName, svgElement);
        }
      } catch (err) {
        console.error('Icon Loader Error:', err);
        return;
      }
    }

    if (svgElement) {
      groups[iconName].forEach(element => {
        element.replaceWith(svgElement.cloneNode(true));
      });
    }
  });

  await Promise.all(fetchPromises);
}