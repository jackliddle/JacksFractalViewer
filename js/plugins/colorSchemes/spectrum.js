import { ColorSchemeBase } from './base.js';
import { hslToRgb } from '../../utils/colorUtils.js';

/**
 * Spectrum color scheme implementation
 */
export class SpectrumColorScheme extends ColorSchemeBase {
    /**
     * Create a new Spectrum color scheme
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Spectrum Blue";
        this.description = "Blue to purple spectrum gradient";
    }
    
    /**
     * Map iteration count to RGB color
     * @param {number} iterations - Number of iterations
     * @returns {Object} RGB color object with r, g, b properties
     */
    getColor(iterations) {
        if (iterations === this.maxIterations) {
            return { r: 0, g: 0, b: 0 }; // Black for points in the set
        }
        
        // Create a smooth color gradient based on iteration count
        const hue = 240 + (iterations / this.maxIterations) * 120; // Blue to purple
        const saturation = 100;
        const lightness = 50;
        
        return hslToRgb(hue, saturation, lightness);
    }
}
