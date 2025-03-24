import { FractalBase } from './base.js';

/**
 * Mandelbrot Set fractal implementation
 */
export class MandelbrotFractal extends FractalBase {
    /**
     * Create a new Mandelbrot fractal
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Mandelbrot Set";
        this.description = "The classic Mandelbrot set fractal";
    }
    
    /**
     * Get default boundaries for Mandelbrot set
     * @returns {Object} Boundaries object
     */
    getDefaultBoundaries() {
        return {
            xMin: -2.5,
            xMax: 1,
            yMin: -1.2,
            yMax: 1.2
        };
    }
    
    /**
     * Calculate if a point is in the Mandelbrot set
     * @param {number} cReal - Real component of c
     * @param {number} cImag - Imaginary component of c
     * @returns {number} Number of iterations
     */
    calculate(cReal, cImag) {
        let zReal = 0;
        let zImag = 0;
        let iteration = 0;
        
        // z = z^2 + c
        while (zReal * zReal + zImag * zImag < 4 && iteration < this.maxIterations) {
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
