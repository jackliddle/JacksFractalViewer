import { FractalBase } from './base.js';

/**
 * Julia Set fractal implementation
 */
export class JuliaFractal extends FractalBase {
    /**
     * Create a new Julia set fractal
     * @param {Object} options - Configuration options
     * @param {Object} options.constant - Complex constant for Julia set
     */
    constructor(options = {}) {
        super(options);
        this.name = "Julia Set";
        this.description = "Julia set fractal with configurable constant";
        
        // Default Julia set constant
        this.constant = options.constant || { real: -0.7, imag: 0.27 };
    }
    
    /**
     * Get default boundaries for Julia set
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
     * Calculate if a point is in the Julia set
     * @param {number} zReal - Real component of z
     * @param {number} zImag - Imaginary component of z
     * @returns {number} Number of iterations
     */
    calculate(zReal, zImag) {
        let iteration = 0;
        const cReal = this.constant.real;
        const cImag = this.constant.imag;
        
        // z = z^2 + c (with fixed c)
        while (zReal * zReal + zImag * zImag < 4 && iteration < this.maxIterations) {
            // Calculate z^2
            const zRealSquared = zReal * zReal;
            const zImagSquared = zImag * zImag;
            
            // Calculate next z value with fixed c
            const zRealNew = zRealSquared - zImagSquared + cReal;
            const zImagNew = 2 * zReal * zImag + cImag;
            
            zReal = zRealNew;
            zImag = zImagNew;
            
            iteration++;
        }
        
        return iteration;
    }
    
    /**
     * Get custom UI controls for Julia set
     * @returns {HTMLElement} Custom controls element
     */
    getCustomControls() {
        const container = document.createElement('div');
        container.className = 'julia-controls';
        
        const realLabel = document.createElement('label');
        realLabel.textContent = 'Real part (c):';
        realLabel.htmlFor = 'julia-real';
        
        const realInput = document.createElement('input');
        realInput.type = 'number';
        realInput.id = 'julia-real';
        realInput.step = '0.01';
        realInput.value = this.constant.real;
        
        const imagLabel = document.createElement('label');
        imagLabel.textContent = 'Imaginary part (c):';
        imagLabel.htmlFor = 'julia-imag';
        
        const imagInput = document.createElement('input');
        imagInput.type = 'number';
        imagInput.id = 'julia-imag';
        imagInput.step = '0.01';
        imagInput.value = this.constant.imag;
        
        container.appendChild(realLabel);
        container.appendChild(realInput);
        container.appendChild(imagLabel);
        container.appendChild(imagInput);
        
        return container;
    }
    
    /**
     * Update Julia set parameters from custom controls
     * @param {HTMLElement} controlsContainer - Container with custom controls
     */
    updateFromControls(controlsContainer) {
        const realInput = controlsContainer.querySelector('#julia-real');
        const imagInput = controlsContainer.querySelector('#julia-imag');
        
        if (realInput && imagInput) {
            this.constant.real = parseFloat(realInput.value);
            this.constant.imag = parseFloat(imagInput.value);
        }
    }
}
