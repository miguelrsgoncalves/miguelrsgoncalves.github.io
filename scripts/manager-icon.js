var managerIcon = (function() {
    const cache = new Map()

    managerGarbageCollector.register(cleanup)
    
    async function createIcons() {
        const iconElements = document.querySelectorAll('icon[data-id]')
        
        const iconTargets = {}
        iconElements.forEach(element => {
            const iconID = element.dataset.id
            
            if (iconID) {
                if (!iconTargets[iconID]) iconTargets[iconID] = []
                iconTargets[iconID].push(element)
            }
        });
        
        const fetchPromises = Object.keys(iconTargets).map(async (iconID) => {
            let svgElement
            
            if (cache.has(iconID)) {
                svgElement = cache.get(iconID)
            } else {
                try {
                    const response = await fetch(resolveIconUrl(iconID))
                    if (!response.ok) throw new Error(`Local icon "${iconID}" not found.`)
                    
                    const svgText = await response.text()
                    
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(svgText, 'image/svg+xml')
                    svgElement = doc.querySelector('svg')
                    
                    if (svgElement) {
                        cache.set(iconID, svgElement)
                    }
                } catch (err) {
                    console.error('Icon Loader Error:', err)
                    return;
                }
            }
            
            if (svgElement) {
                iconTargets[iconID].forEach(element => {
                    element.replaceChildren(svgElement.cloneNode(true))
                });
            }
        });
        
        await Promise.all(fetchPromises)
    }
    
    function resolveIconUrl(name) {
        if (name.includes('/')) return `/assets/icons/${name}.svg`
        return `/assets/icons/lucide/${name}.svg`
    }

    function cleanup() {
        cache.clear()
    }
    
    return { createIcons, cleanup }
})()
