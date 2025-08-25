class ResourcePreloader {
    constructor() {
        this.preloadedResources = new Set();
    }
    // Preload a resource
    preload(resource) {
        if (this.preloadedResources.has(resource.href)) {
            return; // Already preloaded
        }
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.crossorigin) {
            link.crossOrigin = resource.crossorigin;
        }
        if (resource.type) {
            link.type = resource.type;
        }
        document.head.appendChild(link);
        this.preloadedResources.add(resource.href);
    }
    // Preload critical app resources
    preloadCriticalResources() {
        // Preload chart library if not already loaded
        if (!window.TradingView) {
            this.preload({
                href: '/lightweight-charts',
                as: 'script'
            });
        }
        // Preload critical fonts
        this.preload({
            href: '/fonts/inter.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous'
        });
    }
    // Prefetch non-critical resources
    prefetchResources(resources) {
        resources.forEach(href => {
            if (!this.preloadedResources.has(href)) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = href;
                document.head.appendChild(link);
                this.preloadedResources.add(href);
            }
        });
    }
    // Preconnect to external domains
    preconnectDomains(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
}
// Global preloader instance
export const resourcePreloader = new ResourcePreloader();
// React hook for resource preloading
export const useResourcePreloader = () => {
    React.useEffect(() => {
        // Preload critical resources
        resourcePreloader.preloadCriticalResources();
        // Preconnect to API domains
        resourcePreloader.preconnectDomains([
            'https://api.example.com',
            'https://ws.example.com'
        ]);
        // Prefetch likely-to-be-used chunks
        resourcePreloader.prefetchResources([
            '/chunks/indicators.js',
            '/chunks/panels.js'
        ]);
    }, []);
    return {
        preload: resourcePreloader.preload.bind(resourcePreloader),
        prefetch: resourcePreloader.prefetchResources.bind(resourcePreloader)
    };
};
// Import React
import React from 'react';
