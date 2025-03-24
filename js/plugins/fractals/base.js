/**
 * Base class for fractal implementations
 */
export class FractalBase {
    /**
     * Create a new fractal
     * @param {Object} options - Configuration options
     * @param {number} options.maxIterations - Maximum number of iterations
     */
    constructor(options = {}) {
        this.maxIterations = options.maxIterations || 100;
        this.name = "Base Fractal";
        this.description = "Base fractal implementation";
    }
    
    /**
     * Get default boundaries for this fractal type
     * @returns {Object} Boundaries object with xMin, xMax, yMin, yMax
     */
    getDefaultBoundaries() {
        return {
            xMin: -2,
            xMax: 2,
            yMin: -1.5,
            yMax: 1.5
        };
    }
    
    /**
     * Calculate iterations for a point in the complex plane
     * @param {number} cReal - Real component
     * @param {number} cImag - Imaginary component
     * @returns {number} Number of iterations
     */
    calculate(cReal, cImag) {
        throw new Error("Method 'calculate' must be implemented by subclasses");
    }
    
    /**
     * Get custom UI controls specific to this fractal
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
