import { FractalBase } from './base.js';

/**
 * Burning Ship fractal implementation
 */
export class BurningShipFractal extends FractalBase {
    /**
     * Create a new Burning Ship fractal
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Burning Ship";
        this.description = "The Burning Ship fractal";
    }
    
    /**
     * Get default boundaries for Burning Ship
     * @returns {Object} Boundaries object
     */
    getDefaultBoundaries() {
        return {
            xMin: -2.5,
            xMax: 1.5,
            yMin: -2,
            yMax: 1
        };
    }
    
    /**
     * Calculate if a point is in the Burning Ship fractal
     * @param {number} cReal - Real component of c
     * @param {number} cImag - Imaginary component of c
     * @returns {number} Number of iterations
     */
    calculate(cReal, cImag) {
        let zReal = 0;
        let zImag = 0;
        let iteration = 0;
        
        // z = (|Re(z)| + i|Im(z)|)^2 + c
        while (zReal * zReal + zImag * zImag < 4 && iteration < this.maxIterations) {
            // Take absolute values
            zReal = Math.abs(zReal);
            zImag = Math.abs(zImag);
            
            // Calculate z^2
            const zRealSquared = zReal * zReal;
            const zImagSquared = zImag * zImag;
            
            // Calculate next z value
            const zRealNew = zRealSquared - zImagSquared + cReal;
            const zImagNew = 2 * zReal * zImag + cImag;
            
            zReal = zRealNew;
            zImag = zImagNew;
            
            iteration++;
        }
        
        return iteration;
    }
}
