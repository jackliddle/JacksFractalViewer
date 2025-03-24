import { ColorSchemeBase } from './base.js';
import { hslToRgb } from '../../utils/colorUtils.js';

/**
 * Fire color scheme implementation
 */
export class FireColorScheme extends ColorSchemeBase {
    /**
     * Create a new Fire color scheme
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Fire";
        this.description = "Red to yellow fire gradient";
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
        
        // Create a fire gradient (red to yellow)
        const hue = 30 - (iterations / this.maxIterations) * 30; // Yellow to red
        const saturation = 100;
        const lightness = Math.min(50, 10 + (iterations / this.maxIterations) * 50);
        
        return hslToRgb(hue, saturation, lightness);
    }
}
