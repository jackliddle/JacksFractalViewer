/**
 * Base class for color scheme implementations
 */
export class ColorSchemeBase {
    /**
     * Create a new color scheme
     * @param {Object} options - Configuration options
     * @param {number} options.maxIterations - Maximum number of iterations
     */
    constructor(options = {}) {
        this.maxIterations = options.maxIterations || 100;
        this.name = "Base Color Scheme";
        this.description = "Base color scheme implementation";
    }
    
    /**
     * Map iteration count to RGB color
     * @param {number} iterations - Number of iterations
     * @returns {Object} RGB color object with r, g, b properties
     */
    getColor(iterations) {
        throw new Error("Method 'getColor' must be implemented by subclasses");
    }
    
    /**
     * Get custom UI controls specific to this color scheme
     * @returns {HTMLElement|null} Custom controls element or null
     */
    getCustomControls() {
        return null; // Override to provide custom controls
    }
    
    /**
     * Update any parameters based on custom controls
     * @param {HTMLElement} controlsContainer - Container with custom controls
     */
    updateFromControls(controlsContainer) {
        // Override to handle custom control updates
    }
}
