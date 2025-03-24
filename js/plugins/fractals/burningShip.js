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
        this.description = `
            The Burning Ship fractal is a fascinating variation of the Mandelbrot set, discovered by Michael Michelitsch and Otto E. Rössler in 1992.
            <br><br>
            <strong>Mathematical Definition:</strong><br>
            The Burning Ship fractal is defined by iterating the equation: <i>z</i><sub>n+1</sub> = (|Re(<i>z</i><sub>n</sub>)| + |Im(<i>z</i><sub>n</sub>)|<i>i</i>)<sup>2</sup> + <i>c</i>
            <br>
            where <i>z</i><sub>0</sub> = 0 and <i>c</i> is a complex number corresponding to the point being tested.
            <br><br>
            <strong>The Absolute Value Modification:</strong><br>
            The key difference from the Mandelbrot set is taking the absolute values of the real and imaginary parts before squaring:
            <ul>
                <li>First, take the absolute value of both components: |Re(<i>z</i>)| and |Im(<i>z</i>)|</li>
                <li>Then square this new complex number: (|Re(<i>z</i>)| + |Im(<i>z</i>)|<i>i</i>)<sup>2</sup></li>
                <li>Finally, add the constant <i>c</i></li>
            </ul>
            <strong>Visual Characteristics:</strong><br>
            This modification creates the distinctive "burning ship" appearance, with flame-like tendrils and a structure resembling a ship on fire when viewed from above. The fractal exhibits both symmetry along the real axis and intricate detail at various scales.
            <br><br>
            <strong>Mathematical Significance:</strong><br>
            Like the Mandelbrot set, the Burning Ship fractal is a quadratic fractal, but the absolute value operation creates different dynamics and visual properties, demonstrating how small changes to the iterative formula can produce dramatically different fractal structures.
        `;
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
