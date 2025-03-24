import { ColorSchemeBase } from './base.js';
import { hslToRgb } from '../../utils/colorUtils.js';

/**
 * Neon color scheme implementation
 */
export class NeonColorScheme extends ColorSchemeBase {
    /**
     * Create a new Neon color scheme
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Neon";
        this.description = "Vibrant neon colors with high contrast";
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
        
        // Create a neon effect with high saturation and brightness
        // Use a smaller set of hues to create more distinct color bands
        const hueBase = [320, 260, 180, 70, 30]; // Magenta, Purple, Cyan, Green, Orange
        const hueIndex = Math.floor((iterations / this.maxIterations) * hueBase.length) % hueBase.length;
        const hue = hueBase[hueIndex];
        
        // Vary the lightness based on iteration count for a pulsing effect
        const iterationFraction = (iterations % (this.maxIterations / 10)) / (this.maxIterations / 10);
        const lightness = 50 + 30 * Math.sin(iterationFraction * Math.PI);
        
        // High saturation for vibrant colors
        const saturation = 100;
        
        return hslToRgb(hue, saturation, lightness);
    }
}
