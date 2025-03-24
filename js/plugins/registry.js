/**
 * Registry for fractal and color scheme plugins
 */
export class PluginRegistry {
    /**
     * Create a new plugin registry
     */
    constructor() {
        this.fractals = new Map();
        this.colorSchemes = new Map();
    }
    
    /**
     * Register a fractal type
     * @param {string} id - Unique identifier for the fractal
     * @param {class} fractalClass - Fractal class constructor
     */
    registerFractal(id, fractalClass) {
        this.fractals.set(id, fractalClass);
    }
    
    /**
     * Register a color scheme
     * @param {string} id - Unique identifier for the color scheme
     * @param {class} colorSchemeClass - Color scheme class constructor
     */
    registerColorScheme(id, colorSchemeClass) {
        this.colorSchemes.set(id, colorSchemeClass);
    }
    
    /**
     * Get a fractal instance by ID
     * @param {string} id - Fractal identifier
     * @param {Object} options - Options to pass to the fractal constructor
     * @returns {Object} Fractal instance
     */
    getFractal(id, options = {}) {
        const FractalClass = this.fractals.get(id);
        if (!FractalClass) {
            throw new Error(`Fractal type '${id}' not found`);
        }
        return new FractalClass(options);
    }
    
    /**
     * Get a color scheme instance by ID
     * @param {string} id - Color scheme identifier
     * @param {Object} options - Options to pass to the color scheme constructor
     * @returns {Object} Color scheme instance
     */
    getColorScheme(id, options = {}) {
        const ColorSchemeClass = this.colorSchemes.get(id);
        if (!ColorSchemeClass) {
            throw new Error(`Color scheme '${id}' not found`);
        }
        return new ColorSchemeClass(options);
    }
    
    /**
     * Get a list of all registered fractal types
     * @returns {Array} Array of fractal type information objects
     */
    getFractalTypes() {
        return Array.from(this.fractals.entries()).map(([id, FractalClass]) => {
            const instance = new FractalClass();
            return {
                id,
                name: instance.name,
                description: instance.description
            };
        });
    }
    
    /**
     * Get a list of all registered color schemes
     * @returns {Array} Array of color scheme information objects
     */
    getColorSchemes() {
        return Array.from(this.colorSchemes.entries()).map(([id, ColorSchemeClass]) => {
            const instance = new ColorSchemeClass();
            return {
                id,
                name: instance.name,
                description: instance.description
            };
        });
    }
    
    /**
     * Load an external plugin from a URL
     * @param {string} url - URL to the plugin module
     * @param {string} type - Type of plugin ('fractal' or 'colorScheme')
     * @returns {Promise<boolean>} Promise resolving to true if plugin was loaded successfully
     */
    async loadExternalPlugin(url, type) {
        try {
            const module = await import(url);
            
            if (type === 'fractal') {
                const id = url.split('/').pop().replace('.js', '');
                this.registerFractal(id, module.default);
                return true;
            } else if (type === 'colorScheme') {
                const id = url.split('/').pop().replace('.js', '');
                this.registerColorScheme(id, module.default);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to load plugin:', error);
            return false;
        }
    }
}
