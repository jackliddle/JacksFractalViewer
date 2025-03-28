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
        this.description = `
            The Mandelbrot set is one of the most famous fractals in mathematics, discovered by Benoit Mandelbrot in 1980.
            <br><br>
            <strong>Mathematical Definition:</strong><br>
            The Mandelbrot set is defined by iterating the equation: <i>z</i><sub>n+1</sub> = <i>z</i><sub>n</sub><sup>2</sup> + <i>c</i>
            <br>
            where <i>z</i><sub>0</sub> = 0 and <i>c</i> is a complex number corresponding to the point being tested.
            <br><br>
            <strong>Iteration Process:</strong><br>
            For each point <i>c</i> in the complex plane:
            <ul>
                <li>Start with <i>z</i> = 0</li>
                <li>Repeatedly apply the formula <i>z</i> = <i>z</i><sup>2</sup> + <i>c</i></li>
                <li>If the magnitude of <i>z</i> remains bounded (|<i>z</i>| < 2) after many iterations, the point is in the set</li>
                <li>If |<i>z</i>| exceeds 2, the point will escape to infinity and is not in the set</li>
            </ul>
            <strong>Mathematical Significance:</strong><br>
            The boundary of the Mandelbrot set is infinitely complex, exhibiting self-similarity at various scales. The number of iterations before a point escapes determines its color in the visualization, creating the beautiful patterns we see.
        `;
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
