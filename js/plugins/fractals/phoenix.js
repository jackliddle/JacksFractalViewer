import { FractalBase } from './base.js';

/**
 * Phoenix Fractal implementation
 */
export class PhoenixFractal extends FractalBase {
    /**
     * Create a new Phoenix fractal
     * @param {Object} options - Configuration options
     * @param {Object} options.phoenixParam - Complex parameter for Phoenix fractal
     */
    constructor(options = {}) {
        super(options);
        this.name = "Phoenix Fractal";
        this.description = `
            The Phoenix fractal is a fascinating variant of the Mandelbrot set that incorporates a "memory" of previous iterations.
            <br><br>
            <strong>Mathematical Definition:</strong><br>
            The Phoenix fractal is defined by iterating the equation: <i>z</i><sub>n+1</sub> = <i>z</i><sub>n</sub><sup>2</sup> + <i>c</i> + <i>p</i> × <i>z</i><sub>n-1</sub>
            <br>
            where <i>z</i><sub>0</sub> = 0, <i>z</i><sub>-1</sub> = 0, <i>c</i> is a complex number corresponding to the point being tested, and <i>p</i> is an additional complex parameter that you can adjust with the controls below.
            <br><br>
            <strong>Iteration Process:</strong><br>
            For each point <i>c</i> in the complex plane:
            <ul>
                <li>Start with <i>z</i><sub>0</sub> = 0 and <i>z</i><sub>-1</sub> = 0</li>
                <li>Repeatedly apply the formula <i>z</i><sub>n+1</sub> = <i>z</i><sub>n</sub><sup>2</sup> + <i>c</i> + <i>p</i> × <i>z</i><sub>n-1</sub></li>
                <li>If the magnitude of <i>z</i> remains bounded after many iterations, the point is in the set</li>
                <li>If |<i>z</i>| exceeds 2, the point will escape to infinity and is not in the set</li>
            </ul>
            <strong>Mathematical Significance:</strong><br>
            The Phoenix fractal is unique because:
            <ul>
                <li>It has "memory" - each new value depends not just on the current state but also on the previous state</li>
                <li>This creates more complex dynamics than the standard Mandelbrot set</li>
                <li>The parameter <i>p</i> controls the influence of the previous iteration, creating dramatically different patterns</li>
                <li>When <i>p</i> = 0, it reduces to the standard Mandelbrot set</li>
            </ul>
            <strong>Historical Context:</strong><br>
            The Phoenix fractal was discovered in the late 1980s and named for its flame-like appearance in certain parameter regions. It's part of a broader class of "memory" fractals that incorporate previous iteration values, demonstrating how small modifications to the iteration formula can produce dramatically different fractal structures.
        `;
        
        // Default Phoenix parameter
        this.phoenixParam = options.phoenixParam || { real: -0.5, imag: 0.1 };
    }
    
    /**
     * Get default boundaries for Phoenix fractal
     * @returns {Object} Boundaries object
     */
    getDefaultBoundaries() {
        return {
            xMin: -2,
            xMax: 2,
            yMin: -1.5,
            yMax: 1.5
        };
    }
    
    /**
     * Calculate if a point is in the Phoenix fractal
     * @param {number} cReal - Real component of c
     * @param {number} cImag - Imaginary component of c
     * @returns {number} Number of iterations
     */
    calculate(cReal, cImag) {
        let zReal = 0;
        let zImag = 0;
        let zPrevReal = 0;
        let zPrevImag = 0;
        let iteration = 0;
        
        const pReal = this.phoenixParam.real;
        const pImag = this.phoenixParam.imag;
        
        // z_{n+1} = z_n^2 + c + p * z_{n-1}
        while (zReal * zReal + zImag * zImag < 4 && iteration < this.maxIterations) {
            // Calculate z^2
            const zRealSquared = zReal * zReal;
            const zImagSquared = zImag * zImag;
            
            // Calculate p * z_{n-1}
            const pzPrevReal = pReal * zPrevReal - pImag * zPrevImag;
            const pzPrevImag = pReal * zPrevImag + pImag * zPrevReal;
            
            // Save current z as previous z for next iteration
            const tempZReal = zReal;
            const tempZImag = zImag;
            
            // Calculate next z value: z^2 + c + p * z_{n-1}
            zReal = zRealSquared - zImagSquared + cReal + pzPrevReal;
            zImag = 2 * tempZReal * zImag + cImag + pzPrevImag;
            
            // Update previous z
            zPrevReal = tempZReal;
            zPrevImag = tempZImag;
            
            iteration++;
        }
        
        return iteration;
    }
    
    /**
     * Get custom UI controls for Phoenix fractal
     * @returns {HTMLElement} Custom controls element
     */
    getCustomControls() {
        const container = document.createElement('div');
        container.className = 'phoenix-controls';
        
        const realLabel = document.createElement('label');
        realLabel.textContent = 'Parameter p (real):';
        realLabel.htmlFor = 'phoenix-real';
        
        const realInput = document.createElement('input');
        realInput.type = 'number';
        realInput.id = 'phoenix-real';
        realInput.step = '0.01';
        realInput.value = this.phoenixParam.real;
        
        const imagLabel = document.createElement('label');
        imagLabel.textContent = 'Parameter p (imag):';
        imagLabel.htmlFor = 'phoenix-imag';
        
        const imagInput = document.createElement('input');
        imagInput.type = 'number';
        imagInput.id = 'phoenix-imag';
        imagInput.step = '0.01';
        imagInput.value = this.phoenixParam.imag;
        
        // Store reference to this for event handlers
        const self = this;
        
        // Add event listeners for real-time updates
        const updateFractal = () => {
            self.phoenixParam.real = parseFloat(realInput.value);
            self.phoenixParam.imag = parseFloat(imagInput.value);
            
            // Dispatch a custom event to notify that parameters have changed
            const event = new CustomEvent('fractalParametersChanged', {
                detail: { fractal: self }
            });
            document.dispatchEvent(event);
        };
        
        // Update on input (while typing or using arrows)
        realInput.addEventListener('input', updateFractal);
        imagInput.addEventListener('input', updateFractal);
        
        container.appendChild(realLabel);
        container.appendChild(realInput);
        container.appendChild(imagLabel);
        container.appendChild(imagInput);
        
        return container;
    }
    
    /**
     * Update Phoenix fractal parameters from custom controls
     * @param {HTMLElement} controlsContainer - Container with custom controls
     */
    updateFromControls(controlsContainer) {
        const realInput = controlsContainer.querySelector('#phoenix-real');
        const imagInput = controlsContainer.querySelector('#phoenix-imag');
        
        if (realInput && imagInput) {
            this.phoenixParam.real = parseFloat(realInput.value);
            this.phoenixParam.imag = parseFloat(imagInput.value);
        }
    }
}
