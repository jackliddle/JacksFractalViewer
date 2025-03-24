/**
 * UI handler class
 */
export class UI {
    /**
     * Create a new UI handler
     * @param {Object} options - Configuration options
     * @param {Object} options.registry - Plugin registry
     * @param {Object} options.renderer - Fractal renderer
     * @param {HTMLElement} options.fractalSelect - Fractal type select element
     * @param {HTMLElement} options.colorSchemeSelect - Color scheme select element
     * @param {HTMLElement} options.resetBtn - Reset view button
     * @param {HTMLElement} options.fullscreenBtn - Fullscreen button
     * @param {HTMLElement} options.canvasContainer - Canvas container element
     */
    constructor(options = {}) {
        this.registry = options.registry;
        this.renderer = options.renderer;
        this.fractalSelect = options.fractalSelect;
        this.colorSchemeSelect = options.colorSchemeSelect;
        this.resetBtn = options.resetBtn;
        this.fullscreenBtn = options.fullscreenBtn;
        this.canvasContainer = options.canvasContainer;
        this.canvas = this.renderer.canvas;
        
        // Custom controls container
        this.customControlsContainer = document.createElement('div');
        this.customControlsContainer.className = 'custom-controls';
        
        // Info element for displaying render information
        this.infoElement = document.querySelector('.info');
        
        // Touch event state
        this.touchStartDistance = 0;
    }
    
    /**
     * Initialize the UI
     */
    initialize() {
        // Populate select elements
        this.updateFractalList();
        this.updateColorSchemeList();
        
        // Add event listeners
        this.addEventListeners();
        
        // Get UI elements
        this.fractalNameElement = document.getElementById('fractalName');
        this.fractalDescriptionElement = document.getElementById('fractalDescription');
        this.instructionsElement = document.querySelector('.instructions');
        this.infoElement = document.querySelector('.info');
        
        // Add custom controls container after the fractal description box
        const descriptionBox = document.querySelector('.fractal-description-box');
        if (descriptionBox) {
            descriptionBox.after(this.customControlsContainer);
        }
        
        // Initialize fractal description with the current fractal
        const fractalId = this.fractalSelect.value;
        const options = { maxIterations: this.renderer.maxIterations };
        try {
            const fractal = this.registry.getFractal(fractalId, options);
            this.updateFractalDescription(fractal);
        } catch (error) {
            console.error('Error initializing fractal description:', error);
        }
        
        // Ensure canvas is properly sized before first render
        this.handleResize();
    }
    
    /**
     * Update the fractal type select element with available fractals
     */
    updateFractalList() {
        const fractalTypes = this.registry.getFractalTypes();
        
        // Clear existing options
        this.fractalSelect.innerHTML = '';
        
        // Add options for each fractal type
        fractalTypes.forEach(fractal => {
            const option = document.createElement('option');
            option.value = fractal.id;
            option.textContent = fractal.name;
            option.title = fractal.description;
            this.fractalSelect.appendChild(option);
        });
        
        // Set initial selection if available
        if (fractalTypes.length > 0) {
            this.fractalSelect.value = fractalTypes[0].id;
            this.handleFractalTypeChange();
        }
    }
    
    /**
     * Update the color scheme select element with available color schemes
     */
    updateColorSchemeList() {
        const colorSchemes = this.registry.getColorSchemes();
        
        // Clear existing options
        this.colorSchemeSelect.innerHTML = '';
        
        // Add options for each color scheme
        colorSchemes.forEach(scheme => {
            const option = document.createElement('option');
            option.value = scheme.id;
            option.textContent = scheme.name;
            option.title = scheme.description;
            this.colorSchemeSelect.appendChild(option);
        });
        
        // Set initial selection if available
        if (colorSchemes.length > 0) {
            this.colorSchemeSelect.value = colorSchemes[0].id;
            this.handleColorSchemeChange();
        }
    }
    
    /**
     * Add event listeners to UI elements
     */
    addEventListeners() {
        // Fractal type change
        this.fractalSelect.addEventListener('change', () => this.handleFractalTypeChange());
        
        // Color scheme change
        this.colorSchemeSelect.addEventListener('change', () => this.handleColorSchemeChange());
        
        // Reset view button
        this.resetBtn.addEventListener('click', () => this.renderer.resetView());
        
        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Canvas click for zooming
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
        
        // Fullscreen change
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Render complete event
        this.canvas.addEventListener('fractalRendered', (e) => this.updateRenderInfo(e.detail));
        
        // Listen for fractal parameter changes
        document.addEventListener('fractalParametersChanged', () => {
            // Re-render the fractal when parameters change
            this.renderer.render();
        });
    }
    
    /**
     * Handle fractal type change
     */
    handleFractalTypeChange() {
        const fractalId = this.fractalSelect.value;
        const options = { maxIterations: this.renderer.maxIterations };
        
        try {
            // Get fractal instance
            const fractal = this.registry.getFractal(fractalId, options);
            
            // Set fractal in renderer
            this.renderer.setFractal(fractal);
            
            // Update custom controls
            this.updateCustomControls(fractal);
            
            // Update fractal description
            this.updateFractalDescription(fractal);
            
            // Reset view to default boundaries for this fractal
            this.renderer.resetView();
        } catch (error) {
            console.error('Error changing fractal type:', error);
        }
    }
    
    /**
     * Update the fractal description display
     * @param {Object} fractal - Fractal instance
     */
    updateFractalDescription(fractal) {
        if (fractal) {
            if (this.fractalNameElement) {
                this.fractalNameElement.textContent = fractal.name;
            }
            
            if (this.fractalDescriptionElement && fractal.description) {
                this.fractalDescriptionElement.textContent = fractal.description;
            }
        }
    }
    
    /**
     * Handle color scheme change
     */
    handleColorSchemeChange() {
        const schemeId = this.colorSchemeSelect.value;
        const options = { maxIterations: this.renderer.maxIterations };
        
        try {
            // Get color scheme instance
            const colorScheme = this.registry.getColorScheme(schemeId, options);
            
            // Set color scheme in renderer
            this.renderer.setColorScheme(colorScheme);
            
            // Re-render with new color scheme
            this.renderer.render();
        } catch (error) {
            console.error('Error changing color scheme:', error);
        }
    }
    
    /**
     * Update custom controls for the current fractal
     * @param {Object} fractal - Fractal instance
     */
    updateCustomControls(fractal) {
        // Clear existing custom controls
        this.customControlsContainer.innerHTML = '';
        
        // Get custom controls from fractal
        const controls = fractal.getCustomControls();
        
        if (controls) {
            // Add controls to container
            this.customControlsContainer.appendChild(controls);
            
            // Show custom controls
            this.customControlsContainer.style.display = 'block';
        } else {
            // Hide custom controls if none available
            this.customControlsContainer.style.display = 'none';
        }
    }
    
    /**
     * Handle canvas click for zooming
     * @param {Event} e - Click event
     */
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Zoom in by factor of 2.5
        this.renderer.zoomToPoint(clickX, clickY, 0.4); // 1/2.5
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            // Single touch - direct zoom
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Zoom in by factor of 2.5
            this.renderer.zoomToPoint(touchX, touchY, 0.4); // 1/2.5
        } else if (e.touches.length === 2) {
            // Pinch gesture - prepare for zooming
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.touchStartDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 2) {
            // Pinch gesture - calculate zoom factor
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const touchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            // Determine zoom direction (in or out)
            if (Math.abs(touchDistance - this.touchStartDistance) > 10) {
                const zoomCenter = {
                    x: (touch1.clientX + touch2.clientX) / 2 - this.canvas.getBoundingClientRect().left,
                    y: (touch1.clientY + touch2.clientY) / 2 - this.canvas.getBoundingClientRect().top
                };
                
                // Implement pinch zoom logic
                const zoomFactor = touchDistance > this.touchStartDistance ? 0.8 : 1.2;
                this.renderer.zoomToPoint(zoomCenter.x, zoomCenter.y, zoomFactor);
                
                this.touchStartDistance = touchDistance;
            }
        }
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        // No action needed
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            const fractalColumn = document.querySelector('.fractal-column');
            if (fractalColumn.requestFullscreen) {
                fractalColumn.requestFullscreen();
            } else if (fractalColumn.webkitRequestFullscreen) { /* Safari */
                fractalColumn.webkitRequestFullscreen();
            } else if (fractalColumn.msRequestFullscreen) { /* IE11 */
                fractalColumn.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    }
    
    /**
     * Handle fullscreen change
     */
    handleFullscreenChange() {
        if (document.fullscreenElement) {
            // Store original canvas dimensions before fullscreen
            this.originalCanvasWidth = this.canvas.width;
            this.originalCanvasHeight = this.canvas.height;
            
            // Resize canvas to fill the entire screen
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Create floating controls for fullscreen mode
            const controlsColumn = document.querySelector('.controls-column');
            const controls = document.querySelector('.controls');
            const info = document.querySelector('.info');
            
            // Store original display state to restore later
            if (controlsColumn) {
                controlsColumn.dataset.originalDisplay = controlsColumn.style.display;
                controlsColumn.style.display = 'none';
            }
            
            // Create floating controls container
            let floatingControls = document.getElementById('floating-controls');
            if (!floatingControls) {
                floatingControls = document.createElement('div');
                floatingControls.id = 'floating-controls';
                floatingControls.style.position = 'fixed';
                floatingControls.style.bottom = '10px';
                floatingControls.style.right = '10px';
                floatingControls.style.zIndex = '1000';
                floatingControls.style.background = 'rgba(255, 255, 255, 0.8)';
                floatingControls.style.padding = '10px';
                floatingControls.style.borderRadius = '5px';
                floatingControls.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
                
                // Add minimize/maximize toggle
                const toggleBtn = document.createElement('button');
                toggleBtn.textContent = '−';
                toggleBtn.style.position = 'absolute';
                toggleBtn.style.top = '5px';
                toggleBtn.style.right = '5px';
                toggleBtn.style.padding = '0 5px';
                toggleBtn.style.background = 'transparent';
                toggleBtn.style.border = 'none';
                toggleBtn.style.fontSize = '16px';
                toggleBtn.style.cursor = 'pointer';
                
                const controlsContent = document.createElement('div');
                controlsContent.id = 'floating-controls-content';
                
                // Clone controls, instructions, and info
                if (controls) {
                    const clonedControls = controls.cloneNode(true);
                    clonedControls.style.margin = '0';
                    controlsContent.appendChild(clonedControls);
                    
                    // Update the fractal name and description in the cloned controls
                    const clonedNameElement = clonedControls.querySelector('#fractalName');
                    const clonedDescriptionElement = clonedControls.querySelector('#fractalDescription');
                    
                    if (clonedNameElement && this.fractalNameElement) {
                        clonedNameElement.textContent = this.fractalNameElement.textContent;
                    }
                    
                    if (clonedDescriptionElement && this.fractalDescriptionElement) {
                        clonedDescriptionElement.textContent = this.fractalDescriptionElement.textContent;
                    }
                }
                
                // Clone instructions
                const instructions = document.querySelector('.instructions');
                if (instructions) {
                    const clonedInstructions = instructions.cloneNode(true);
                    clonedInstructions.style.margin = '10px 0';
                    controlsContent.appendChild(clonedInstructions);
                }
                
                // Clone info (render time)
                if (info) {
                    const clonedInfo = info.cloneNode(true);
                    clonedInfo.style.margin = '10px 0 0 0';
                    controlsContent.appendChild(clonedInfo);
                }
                
                floatingControls.appendChild(toggleBtn);
                floatingControls.appendChild(controlsContent);
                
                // Append to the fullscreen element instead of document.body for better Chrome compatibility
                const fullscreenElement = document.fullscreenElement || 
                                         document.webkitFullscreenElement || 
                                         document.mozFullScreenElement || 
                                         document.msFullscreenElement;
                
                if (fullscreenElement) {
                    fullscreenElement.appendChild(floatingControls);
                    console.log('Floating controls added to fullscreen element');
                } else {
                    document.body.appendChild(floatingControls);
                    console.log('Floating controls added to document body');
                }
                
                // Add event listeners to the cloned controls
                const clonedResetBtn = floatingControls.querySelector('#resetBtn');
                const clonedFullscreenBtn = floatingControls.querySelector('#fullscreenBtn');
                const clonedFractalTypeSelect = floatingControls.querySelector('#fractalType');
                const clonedColorSchemeSelect = floatingControls.querySelector('#colorScheme');
                
                if (clonedResetBtn) {
                    clonedResetBtn.addEventListener('click', () => this.renderer.resetView());
                }
                
                if (clonedFullscreenBtn) {
                    clonedFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
                }
                
                if (clonedFractalTypeSelect) {
                    clonedFractalTypeSelect.addEventListener('change', () => {
                        this.fractalSelect.value = clonedFractalTypeSelect.value;
                        this.handleFractalTypeChange();
                        
                        // Update the cloned fractal name and description when fractal type changes
                        const clonedNameElement = floatingControls.querySelector('#fractalName');
                        const clonedDescriptionElement = floatingControls.querySelector('#fractalDescription');
                        
                        if (clonedNameElement && this.fractalNameElement) {
                            clonedNameElement.textContent = this.fractalNameElement.textContent;
                        }
                        
                        if (clonedDescriptionElement && this.fractalDescriptionElement) {
                            clonedDescriptionElement.textContent = this.fractalDescriptionElement.textContent;
                        }
                    });
                }
                
                if (clonedColorSchemeSelect) {
                    clonedColorSchemeSelect.addEventListener('change', () => {
                        this.colorSchemeSelect.value = clonedColorSchemeSelect.value;
                        this.handleColorSchemeChange();
                    });
                }
                
                // Toggle button functionality
                toggleBtn.addEventListener('click', () => {
                    const content = document.getElementById('floating-controls-content');
                    if (content.style.display === 'none') {
                        content.style.display = 'block';
                        toggleBtn.textContent = '−';
                    } else {
                        content.style.display = 'none';
                        toggleBtn.textContent = '+';
                    }
                });
            } else {
                floatingControls.style.display = 'block';
            }
        } else {
            // Restore canvas dimensions to pre-fullscreen state
            this.restoreCanvasDimensions();
            
            // Remove floating controls
            const floatingControls = document.getElementById('floating-controls');
            if (floatingControls) {
                floatingControls.style.display = 'none';
            }
            
            // Restore original layout
            const controlsColumn = document.querySelector('.controls-column');
            if (controlsColumn && controlsColumn.dataset.originalDisplay !== undefined) {
                controlsColumn.style.display = controlsColumn.dataset.originalDisplay;
            }
        }
        
        // Re-render with new dimensions
        this.renderer.adjustAspectRatio();
        this.renderer.render();
    }
    
    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // F11 or F key for fullscreen
        if (e.key === 'F11' || e.key === 'f') {
            e.preventDefault(); // Prevent default F11 behavior
            this.toggleFullscreen();
        }
        
        // Ctrl+Enter is another common fullscreen shortcut
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            this.toggleFullscreen();
        }
        
        // R key for reset view
        if (e.key === 'r') {
            this.renderer.resetView();
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Get the dimensions of the canvas container
        const containerWidth = this.canvasContainer.clientWidth;
        const containerHeight = this.canvasContainer.clientHeight;
        
        // Set canvas dimensions to match container
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
        
        // Re-render with new dimensions
        this.renderer.adjustAspectRatio();
        this.renderer.render();
    }
    
    /**
     * Restore canvas dimensions after exiting fullscreen
     */
    restoreCanvasDimensions() {
        if (this.originalCanvasWidth && this.originalCanvasHeight) {
            // Restore original canvas dimensions
            this.canvas.width = this.originalCanvasWidth;
            this.canvas.height = this.originalCanvasHeight;
            
            // Clear the stored dimensions
            this.originalCanvasWidth = null;
            this.originalCanvasHeight = null;
        } else {
            // Fallback to container dimensions if original dimensions not available
            this.handleResize();
        }
    }
    
    /**
     * Update render information display
     * @param {Object} info - Render information
     */
    updateRenderInfo(info) {
        if (this.infoElement) {
            const renderTimeMs = info.renderTime.toFixed(2);
            this.infoElement.innerHTML = `
                <p>Render Time: ${renderTimeMs}ms</p>
            `;
        }
    }
}
