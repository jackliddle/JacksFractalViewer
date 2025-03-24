/**
 * Example of how to create a custom fractal plugin
 */
import { FractalBase } from './js/plugins/fractals/base.js';

/**
 * Newton fractal implementation
 */
export class NewtonFractal extends FractalBase {
    /**
     * Create a new Newton fractal
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
        this.name = "Newton Fractal";
        this.description = "Newton's method applied to z^3 - 1";
    }
    
    /**
     * Get default boundaries for Newton fractal
     * @returns {Object} Boundaries object
     */
    getDefaultBoundaries() {
        return {
            xMin: -2,
            xMax: 2,
            yMin: -2,
            yMax: 2
        };
    }
    
    /**
     * Calculate if a point is in the Newton fractal
     * @param {number} cReal - Real component of starting point
     * @param {number} cImag - Imaginary component of starting point
     * @returns {number} Number of iterations
     */
    calculate(cReal, cImag) {
        let zReal = cReal;
        let zImag = cImag;
        let iteration = 0;
        
        // Tolerance for convergence
        const tolerance = 1e-6;
        
        // Roots of z^3 - 1 = 0
        const roots = [
            { real: 1, imag: 0 },
            { real: -0.5, imag: 0.866 },
            { real: -0.5, imag: -0.866 }
        ];
        
        // Newton's method: z = z - (z^3 - 1) / (3 * z^2)
        while (iteration < this.maxIterations) {
            // Check if we're close to any root
            for (const root of roots) {
                const dx = zReal - root.real;
                const dy = zImag - root.imag;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < tolerance) {
                    // Return iteration count based on which root we found
                    return iteration + roots.indexOf(root) * (this.maxIterations / 3);
                }
            }
            
            // Calculate z^2
            const zRealSquared = zReal * zReal;
            const zImagSquared = zImag * zImag;
            
            // Calculate z^3
            const zRealCubed = zReal * (zRealSquared - 3 * zImagSquared);
            const zImagCubed = zImag * (3 * zRealSquared - zImagSquared);
            
            // Calculate denominator: 3 * z^2
            const denomReal = 3 * (zRealSquared - zImagSquared);
            const denomImag = 6 * zReal * zImag;
            
            // Calculate numerator: z^3 - 1
            const numReal = zRealCubed - zImag * zImagSquared - 1;
            const numImag = zImagCubed + zReal * zImagSquared;
            
            // Calculate fraction: (z^3 - 1) / (3 * z^2)
            const denomSquared = denomReal * denomReal + denomImag * denomImag;
            const fracReal = (numReal * denomReal + numImag * denomImag) / denomSquared;
            const fracImag = (numImag * denomReal - numReal * denomImag) / denomSquared;
            
            // Calculate next z value: z - (z^3 - 1) / (3 * z^2)
            zReal = zReal - fracReal;
            zImag = zImag - fracImag;
            
            iteration++;
        }
        
        return this.maxIterations;
    }
}
