import { ColorSchemeBase } from './base.js';
import { hslToRgb } from '../../utils/colorUtils.js';

/**
 * Rainbow color scheme implementation
 */
export class RainbowColorScheme extends ColorSchemeBase {
    /**
     * Create a new Rainbow color scheme
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Rainbow";
        this.description = "Full rainbow color cycle";
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
        
        // Create a rainbow gradient cycling through all hues
        const hue = (iterations * 360 / this.maxIterations) % 360;
        const saturation = 100;
        const lightness = 50;
        
        return hslToRgb(hue, saturation, lightness);
    }
}
