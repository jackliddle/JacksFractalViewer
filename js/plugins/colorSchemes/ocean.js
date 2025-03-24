import { ColorSchemeBase } from './base.js';
import { hslToRgb } from '../../utils/colorUtils.js';

/**
 * Ocean color scheme implementation
 */
export class OceanColorScheme extends ColorSchemeBase {
    /**
     * Create a new Ocean color scheme
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Ocean";
        this.description = "Blues and greens reminiscent of ocean depths";
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
        
        // Ocean colors range from deep blue to teal to aqua
        // Map iterations to a position in this range
        const iterationRatio = iterations / this.maxIterations;
        
        // Hue ranges from deep blue (240) through teal (180) to aqua-green (160)
        // Lower iterations = deeper blues (deeper ocean)
        const hue = 240 - (iterationRatio * 80);
        
        // Saturation increases with iterations (deeper water is more muted)
        const saturation = 70 + (iterationRatio * 30);
        
        // Lightness increases with iterations (deeper water is darker)
        const lightness = 15 + (iterationRatio * 50);
        
        return hslToRgb(hue, saturation, lightness);
    }
}
