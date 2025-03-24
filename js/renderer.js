/**
 * Fractal renderer class
 */
export class FractalRenderer {
    /**
     * Create a new fractal renderer
     * @param {Object} options - Configuration options
     * @param {HTMLCanvasElement} options.canvas - Canvas element to render to
     * @param {number} options.maxIterations - Maximum iterations for fractal calculations
     */
    constructor(options = {}) {
        this.canvas = options.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.maxIterations = options.maxIterations || 100;
        
        // Default boundaries
        this.boundaries = {
            xMin: -2.5,
            xMax: 1,
            yMin: -1.2,
            yMax: 1.2
        };
        
        // Current fractal and color scheme
        this.fractal = null;
        this.colorScheme = null;
        
        // Rendering state
        this.isRendering = false;
        this.renderStartTime = 0;
        this.renderEndTime = 0;
    }
    
    /**
     * Set the fractal to render
     * @param {Object} fractal - Fractal instance
     */
    setFractal(fractal) {
        this.fractal = fractal;
    }
    
    /**
     * Set the color scheme to use
     * @param {Object} colorScheme - Color scheme instance
     */
    setColorScheme(colorScheme) {
        this.colorScheme = colorScheme;
    }
    
    /**
     * Set the boundaries of the complex plane to render
     * @param {Object} boundaries - Boundaries object with xMin, xMax, yMin, yMax
     */
    setBoundaries(boundaries) {
        this.boundaries = { ...this.boundaries, ...boundaries };
        this.adjustAspectRatio();
    }
    
    /**
     * Adjust the boundaries to match the canvas aspect ratio
     */
    adjustAspectRatio() {
        const aspectRatio = this.canvas.height / this.canvas.width;
        const xRange = this.boundaries.xMax - this.boundaries.xMin;
        const yCenter = (this.boundaries.yMax + this.boundaries.yMin) / 2;
        
        // Adjust y boundaries to match canvas aspect ratio
        this.boundaries.yMin = yCenter - (xRange * aspectRatio) / 2;
        this.boundaries.yMax = yCenter + (xRange * aspectRatio) / 2;
    }
    
    /**
     * Zoom to a specific point in the complex plane
     * @param {number} x - X coordinate in canvas space
     * @param {number} y - Y coordinate in canvas space
     * @param {number} factor - Zoom factor (< 1 to zoom in, > 1 to zoom out)
     */
    zoomToPoint(x, y, factor) {
        // Map canvas coordinates to complex plane
        const cReal = this.boundaries.xMin + (x / this.canvas.width) * (this.boundaries.xMax - this.boundaries.xMin);
        const cImag = this.boundaries.yMin + (y / this.canvas.height) * (this.boundaries.yMax - this.boundaries.yMin);
        
        // Calculate new boundaries
        const newWidth = (this.boundaries.xMax - this.boundaries.xMin) * factor;
        const newHeight = (this.boundaries.yMax - this.boundaries.yMin) * factor;
        
        // Center the new view on the clicked point
        this.boundaries.xMin = cReal - newWidth / 2;
        this.boundaries.xMax = cReal + newWidth / 2;
        this.boundaries.yMin = cImag - newHeight / 2;
        this.boundaries.yMax = cImag + newHeight / 2;
        
        // Re-render with new boundaries
        this.render();
    }
    
    /**
     * Reset the view to the default boundaries for the current fractal
     */
    resetView() {
        if (this.fractal) {
            this.setBoundaries(this.fractal.getDefaultBoundaries());
            this.render();
        }
    }
    
    /**
     * Render the fractal to the canvas
     * @param {Object} options - Rendering options
     * @param {boolean} options.progressive - Whether to use progressive rendering
     * @returns {Promise} Promise that resolves when rendering is complete
     */
    render(options = {}) {
        if (!this.fractal || !this.colorScheme) {
            console.error('Cannot render: fractal or color scheme not set');
            return Promise.resolve();
        }
        
        // Prevent multiple simultaneous renders
        if (this.isRendering) {
            return Promise.resolve();
        }
        
        this.isRendering = true;
        this.renderStartTime = performance.now();
        
        // Use progressive rendering by default
        const useProgressiveRendering = options.progressive !== false;
        
        return new Promise((resolve) => {
            if (useProgressiveRendering) {
                // First pass: render at lower resolution for immediate feedback
                this.renderLowResolution().then(() => {
                    // Second pass: render at full resolution
                    this.renderFullResolution().then(resolve);
                });
            } else {
                // Render at full resolution directly
                this.renderFullResolution().then(resolve);
            }
        });
    }
    
    /**
     * Render the fractal at low resolution for quick feedback
     * @returns {Promise} Promise that resolves when low-res rendering is complete
     */
    renderLowResolution() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                // Create image data for direct pixel manipulation
                const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
                const data = imageData.data;
                
                // Use a larger step size for faster rendering
                const step = 4; // Render every 4th pixel
                
                // Clear the canvas with a black background
                this.ctx.fillStyle = 'black';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // For each pixel in the canvas (with step)
                for (let x = 0; x < this.canvas.width; x += step) {
                    for (let y = 0; y < this.canvas.height; y += step) {
                        // Map canvas coordinates to complex plane
                        const cReal = this.boundaries.xMin + (x / this.canvas.width) * (this.boundaries.xMax - this.boundaries.xMin);
                        const cImag = this.boundaries.yMin + (y / this.canvas.height) * (this.boundaries.yMax - this.boundaries.yMin);
                        
                        // Calculate iterations for this point
                        const iterations = this.fractal.calculate(cReal, cImag);
                        
                        // Get RGB color based on iterations
                        const rgb = this.colorScheme.getColor(iterations);
                        
                        // Fill a block of pixels with the same color
                        for (let dx = 0; dx < step && x + dx < this.canvas.width; dx++) {
                            for (let dy = 0; dy < step && y + dy < this.canvas.height; dy++) {
                                const pixelIndex = ((y + dy) * this.canvas.width + (x + dx)) * 4;
                                data[pixelIndex] = rgb.r;     // Red
                                data[pixelIndex + 1] = rgb.g; // Green
                                data[pixelIndex + 2] = rgb.b; // Blue
                                data[pixelIndex + 3] = 255;   // Alpha (fully opaque)
                            }
                        }
                    }
                }
                
                // Put image data to canvas
                this.ctx.putImageData(imageData, 0, 0);
                
                resolve();
            });
        });
    }
    
    /**
     * Render the fractal at full resolution
     * @returns {Promise} Promise that resolves when full-res rendering is complete
     */
    renderFullResolution() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                // Create image data for direct pixel manipulation
                const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
                const data = imageData.data;
                
                // For each pixel in the canvas
                for (let x = 0; x < this.canvas.width; x++) {
                    for (let y = 0; y < this.canvas.height; y++) {
                        // Map canvas coordinates to complex plane
                        const cReal = this.boundaries.xMin + (x / this.canvas.width) * (this.boundaries.xMax - this.boundaries.xMin);
                        const cImag = this.boundaries.yMin + (y / this.canvas.height) * (this.boundaries.yMax - this.boundaries.yMin);
                        
                        // Calculate iterations for this point
                        const iterations = this.fractal.calculate(cReal, cImag);
                        
                        // Get RGB color based on iterations
                        const rgb = this.colorScheme.getColor(iterations);
                        
                        // Set pixel color in image data
                        const pixelIndex = (y * this.canvas.width + x) * 4;
                        data[pixelIndex] = rgb.r;     // Red
                        data[pixelIndex + 1] = rgb.g; // Green
                        data[pixelIndex + 2] = rgb.b; // Blue
                        data[pixelIndex + 3] = 255;   // Alpha (fully opaque)
                    }
                }
                
                // Put image data to canvas
                this.ctx.putImageData(imageData, 0, 0);
                
                this.renderEndTime = performance.now();
                this.isRendering = false;
                
                // Dispatch a custom event when rendering is complete
                const renderTime = this.renderEndTime - this.renderStartTime;
                const event = new CustomEvent('fractalRendered', { 
                    detail: { 
                        renderTime,
                        fractalType: this.fractal.name,
                        colorScheme: this.colorScheme.name
                    } 
                });
                this.canvas.dispatchEvent(event);
                
                resolve();
            });
        });
    }
    
    /**
     * Get information about the current render
     * @returns {Object} Render information
     */
    getRenderInfo() {
        return {
            fractalType: this.fractal ? this.fractal.name : 'None',
            colorScheme: this.colorScheme ? this.colorScheme.name : 'None',
            boundaries: { ...this.boundaries },
            renderTime: this.renderEndTime - this.renderStartTime,
            dimensions: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        };
    }
    
    /**
     * Get the current center point of the view in complex plane coordinates
     * @returns {Object} Center point with real and imaginary components
     */
    getViewCenter() {
        return {
            real: (this.boundaries.xMin + this.boundaries.xMax) / 2,
            imag: (this.boundaries.yMin + this.boundaries.yMax) / 2
        };
    }
    
    /**
     * Set the view to center on a specific point with the current zoom level
     * @param {Object} center - Center point with real and imaginary components
     */
    centerViewOn(center) {
        const xRange = this.boundaries.xMax - this.boundaries.xMin;
        const yRange = this.boundaries.yMax - this.boundaries.yMin;
        
        this.boundaries.xMin = center.real - xRange / 2;
        this.boundaries.xMax = center.real + xRange / 2;
        this.boundaries.yMin = center.imag - yRange / 2;
        this.boundaries.yMax = center.imag + yRange / 2;
    }
}
