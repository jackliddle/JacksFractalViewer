import { FractalBase } from './base.js';

/**
 * Nova Fractal implementation based on Newton's method
 */
export class NovaFractal extends FractalBase {
    /**
     * Create a new Nova fractal
     * @param {Object} options - Configuration options
     * @param {number} options.relaxation - Relaxation factor for Newton's method
     */
    constructor(options = {}) {
        super(options);
        this.name = "Nova Fractal";
        this.description = `
            The Nova fractal is based on Newton's method for finding roots of complex functions, creating beautiful patterns at the boundaries between basins of attraction.
            <br><br>
            <strong>Mathematical Definition:</strong><br>
            The Nova fractal is generated using Newton's method to find the roots of a complex function. For the function <i>f(z) = z<sup>3</sup> - 1</i>, the iteration formula is:
            <br>
            <i>z</i><sub>n+1</sub> = <i>z</i><sub>n</sub> - <i>r</i> × <i>f(z<sub>n</sub>)</i> / <i>f'(z<sub>n</sub>)</i>
            <br>
            where <i>r</i> is the relaxation factor (adjustable below), <i>f'(z)</i> is the derivative of <i>f(z)</i>, and each pixel's color depends on which root the iteration converges to and how quickly.
            <br><br>
            <strong>Iteration Process:</strong><br>
            For each point <i>z</i> in the complex plane:
            <ul>
                <li>Apply Newton's method: <i>z</i> = <i>z</i> - <i>r</i> × (<i>z</i><sup>3</sup> - 1) / (3<i>z</i><sup>2</sup>)</li>
                <li>Continue iterating until <i>z</i> converges to one of the three cube roots of 1</li>
                <li>Color the point based on which root it converges to and the speed of convergence</li>
            </ul>
            <strong>Mathematical Significance:</strong><br>
            The Nova fractal reveals the structure of basins of attraction in Newton's method:
            <ul>
                <li>Each color represents the basin of attraction for a different root</li>
                <li>The fractal patterns occur at the boundaries between these basins</li>
                <li>The relaxation factor <i>r</i> controls the convergence behavior - values other than 1 can create more intricate patterns</li>
                <li>Points where the derivative is zero (critical points) create interesting features in the fractal</li>
            </ul>
            <strong>Historical Context:</strong><br>
            Newton fractals were first studied in the context of numerical analysis, as they visualize the behavior of Newton's method in the complex plane. They demonstrate how even simple numerical algorithms can exhibit chaotic behavior and complex dynamics in certain regions of the parameter space.
        `;
        
        // Default relaxation factor
        this.relaxation = options.relaxation || 1.0;
        
        // Roots of z^3 - 1 = 0 (cube roots of unity)
        this.roots = [
            { real: 1, imag: 0 },
            { real: -0.5, imag: 0.866 },
            { real: -0.5, imag: -0.866 }
        ];
    }
    
    /**
     * Get default boundaries for Nova fractal
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
     * Calculate the Nova fractal using Newton's method
     * @param {number} zReal - Real component of z
     * @param {number} zImag - Imaginary component of z
     * @returns {Object} Result object with iteration count and root index
     */
    calculate(zReal, zImag) {
        const MAX_DISTANCE = 1e-6; // Convergence threshold
        let iteration = 0;
        
        // Avoid starting exactly at a critical point (where derivative is zero)
        if (Math.abs(zReal) < 1e-10 && Math.abs(zImag) < 1e-10) {
            zReal = 1e-10;
        }
        
        while (iteration < this.maxIterations) {
            // Check if we're close to any root
            for (let i = 0; i < this.roots.length; i++) {
                const root = this.roots[i];
                const dx = zReal - root.real;
                const dy = zImag - root.imag;
                const distance = dx * dx + dy * dy;
                
                if (distance < MAX_DISTANCE) {
                    // Return both iteration count and which root we converged to
                    return {
                        iterations: iteration,
                        rootIndex: i
                    };
                }
            }
            
            // Calculate z^3
            const zRealSquared = zReal * zReal;
            const zImagSquared = zImag * zImag;
            const zRealCubed = zReal * (zRealSquared - 3 * zImagSquared);
            const zImagCubed = zImag * (3 * zRealSquared - zImagSquared);
            
            // Calculate z^3 - 1
            const fReal = zRealCubed - 1;
            const fImag = zImagCubed;
            
            // Calculate 3*z^2 (derivative of z^3 - 1)
            const dfReal = 3 * (zRealSquared - zImagSquared);
            const dfImag = 6 * zReal * zImag;
            
            // Calculate (z^3 - 1) / (3*z^2)
            const denominator = dfReal * dfReal + dfImag * dfImag;
            
            // Avoid division by zero
            if (denominator < 1e-10) {
                break;
            }
            
            const quotientReal = (fReal * dfReal + fImag * dfImag) / denominator;
            const quotientImag = (fImag * dfReal - fReal * dfImag) / denominator;
            
            // Apply Newton's method with relaxation: z = z - r * f(z)/f'(z)
            zReal = zReal - this.relaxation * quotientReal;
            zImag = zImag - this.relaxation * quotientImag;
            
            iteration++;
        }
        
        // If we didn't converge, return max iterations and no root
        return {
            iterations: this.maxIterations,
            rootIndex: -1
        };
    }
    
    /**
     * Get custom UI controls for Nova fractal
     * @returns {HTMLElement} Custom controls element
     */
    getCustomControls() {
        const container = document.createElement('div');
        container.className = 'nova-controls';
        
        const relaxationLabel = document.createElement('label');
        relaxationLabel.textContent = 'Relaxation factor:';
        relaxationLabel.htmlFor = 'nova-relaxation';
        
        const relaxationInput = document.createElement('input');
        relaxationInput.type = 'number';
        relaxationInput.id = 'nova-relaxation';
        relaxationInput.step = '0.05';
        relaxationInput.min = '0.1';
        relaxationInput.max = '2';
        relaxationInput.value = this.relaxation;
        
        // Store reference to this for event handlers
        const self = this;
        
        // Add event listeners for real-time updates
        const updateFractal = () => {
            self.relaxation = parseFloat(relaxationInput.value);
            
            // Dispatch a custom event to notify that parameters have changed
            const event = new CustomEvent('fractalParametersChanged', {
                detail: { fractal: self }
            });
            document.dispatchEvent(event);
        };
        
        // Update on input (while typing or using arrows)
        relaxationInput.addEventListener('input', updateFractal);
        
        container.appendChild(relaxationLabel);
        container.appendChild(relaxationInput);
        
        return container;
    }
    
    /**
     * Update Nova fractal parameters from custom controls
     * @param {HTMLElement} controlsContainer - Container with custom controls
     */
    updateFromControls(controlsContainer) {
        const relaxationInput = controlsContainer.querySelector('#nova-relaxation');
        
        if (relaxationInput) {
            this.relaxation = parseFloat(relaxationInput.value);
        }
    }
}
