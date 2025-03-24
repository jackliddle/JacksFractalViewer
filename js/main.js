import { PluginRegistry } from './plugins/registry.js';
import { FractalRenderer } from './renderer.js';
import { UI } from './ui.js';

// Import built-in plugins
import { MandelbrotFractal } from './plugins/fractals/mandelbrot.js';
import { JuliaFractal } from './plugins/fractals/julia.js';
import { BurningShipFractal } from './plugins/fractals/burningShip.js';
import { NovaFractal } from './plugins/fractals/nova.js';
import { PhoenixFractal } from './plugins/fractals/phoenix.js';
import { SpectrumColorScheme } from './plugins/colorSchemes/spectrum.js';
import { FireColorScheme } from './plugins/colorSchemes/fire.js';
import { RainbowColorScheme } from './plugins/colorSchemes/rainbow.js';

/**
 * Main Fractal Viewer application class
 */
class FractalViewer {
    /**
     * Create a new Fractal Viewer application
     */
    constructor() {
        // Initialize plugin registry
        this.registry = new PluginRegistry();
        
        // Register built-in plugins
        this.registerBuiltInPlugins();
        
        // Initialize renderer
        this.renderer = new FractalRenderer({
            canvas: document.getElementById('mandelbrotCanvas'),
            maxIterations: 100
        });
        
        // Initialize UI
        this.ui = new UI({
            registry: this.registry,
            renderer: this.renderer,
            fractalSelect: document.getElementById('fractalType'),
            colorSchemeSelect: document.getElementById('colorScheme'),
            resetBtn: document.getElementById('resetBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            canvasContainer: document.querySelector('.canvas-container')
        });
        
        // Set initial state
        this.setFractal('julia');
        this.setColorScheme('rainbow');
        
        // Initialize UI
        this.ui.initialize();
    }
    
    /**
     * Register built-in plugins
     */
    registerBuiltInPlugins() {
        // Register fractal types
        this.registry.registerFractal('mandelbrot', MandelbrotFractal);
        this.registry.registerFractal('julia', JuliaFractal);
        this.registry.registerFractal('burningShip', BurningShipFractal);
        this.registry.registerFractal('nova', NovaFractal);
        this.registry.registerFractal('phoenix', PhoenixFractal);
        
        // Register color schemes
        this.registry.registerColorScheme('spectrum', SpectrumColorScheme);
        this.registry.registerColorScheme('fire', FireColorScheme);
        this.registry.registerColorScheme('rainbow', RainbowColorScheme);
    }
    
    /**
     * Set the current fractal
     * @param {string} id - Fractal identifier
     */
    setFractal(id) {
        const options = { maxIterations: this.renderer.maxIterations };
        const fractal = this.registry.getFractal(id, options);
        this.renderer.setFractal(fractal);
        
        // Set default boundaries for this fractal
        const boundaries = fractal.getDefaultBoundaries();
        this.renderer.setBoundaries(boundaries);
        
        // Render
        this.renderer.render();
    }
    
    /**
     * Set the current color scheme
     * @param {string} id - Color scheme identifier
     */
    setColorScheme(id) {
        const options = { maxIterations: this.renderer.maxIterations };
        const colorScheme = this.registry.getColorScheme(id, options);
        this.renderer.setColorScheme(colorScheme);
        
        // Render
        this.renderer.render();
    }
    
    /**
     * Load an external plugin
     * @param {string} url - URL to the plugin module
     * @param {string} type - Type of plugin ('fractal' or 'colorScheme')
     * @returns {Promise<boolean>} Promise resolving to true if plugin was loaded successfully
     */
    async loadExternalPlugin(url, type) {
        try {
            const success = await this.registry.loadExternalPlugin(url, type);
            
            if (success) {
                if (type === 'fractal') {
                    this.ui.updateFractalList();
                } else if (type === 'colorScheme') {
                    this.ui.updateColorSchemeList();
                }
            }
            
            return success;
        } catch (error) {
            console.error('Failed to load plugin:', error);
            return false;
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance for debugging and plugin loading
    window.fractalViewer = new FractalViewer();
    
    console.log('Fractal Viewer initialized. Access the application via window.fractalViewer');
});
