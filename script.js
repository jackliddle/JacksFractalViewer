document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    const canvas = document.getElementById('mandelbrotCanvas');
    const ctx = canvas.getContext('2d');
    const resetBtn = document.getElementById('resetBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fractalTypeSelect = document.getElementById('fractalType');
    const colorSchemeSelect = document.getElementById('colorScheme');
    const canvasContainer = document.querySelector('.canvas-container');

    // Set initial canvas dimensions
    let canvasWidth = 800;
    let canvasHeight = 600;
    
    // Function to resize canvas based on container size
    function resizeCanvas() {
        // Get the dimensions of the canvas container
        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;
        
        // Set canvas dimensions to match container
        canvasWidth = containerWidth;
        canvasHeight = containerHeight;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Adjust complex plane boundaries to maintain aspect ratio
        adjustAspectRatio();
        
        // Re-render with new dimensions
        renderFractal();
    }

    // Initial complex plane boundaries
    let xMin = -2.5;
    let xMax = 1;
    let yMin = -1.2;
    let yMax = 1.2;
    
    // Julia set constant
    const juliaConstant = { real: -0.7, imag: 0.27 };

    // Function to adjust aspect ratio
    function adjustAspectRatio() {
        const aspectRatio = canvas.height / canvas.width;
        const xRange = xMax - xMin;
        const yCenter = (yMax + yMin) / 2;
        
        // Adjust y boundaries to match canvas aspect ratio
        yMin = yCenter - (xRange * aspectRatio) / 2;
        yMax = yCenter + (xRange * aspectRatio) / 2;
    }
    
    // Fullscreen functionality
    function toggleFullscreen() {
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
    
    // Handle fullscreen change
    function handleFullscreenChange() {
        if (document.fullscreenElement) {
            // Resize canvas to fill the entire screen
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
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
                
                // Clone controls and info
                if (controls) {
                    const clonedControls = controls.cloneNode(true);
                    clonedControls.style.margin = '0';
                    controlsContent.appendChild(clonedControls);
                }
                
                if (info) {
                    const clonedInfo = info.cloneNode(true);
                    clonedInfo.style.margin = '10px 0 0 0';
                    controlsContent.appendChild(clonedInfo);
                }
                
                floatingControls.appendChild(toggleBtn);
                floatingControls.appendChild(controlsContent);
                document.body.appendChild(floatingControls);
                
                // Add event listeners to the cloned controls
                const clonedResetBtn = floatingControls.querySelector('#resetBtn');
                const clonedFullscreenBtn = floatingControls.querySelector('#fullscreenBtn');
                const clonedFractalTypeSelect = floatingControls.querySelector('#fractalType');
                const clonedColorSchemeSelect = floatingControls.querySelector('#colorScheme');
                
                if (clonedResetBtn) {
                    clonedResetBtn.addEventListener('click', resetView);
                }
                
                if (clonedFullscreenBtn) {
                    clonedFullscreenBtn.addEventListener('click', toggleFullscreen);
                }
                
                if (clonedFractalTypeSelect) {
                    clonedFractalTypeSelect.addEventListener('change', handleFractalTypeChange);
                }
                
                if (clonedColorSchemeSelect) {
                    clonedColorSchemeSelect.addEventListener('change', handleColorSchemeChange);
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
            // Reset canvas to container size
            resizeCanvas();
            
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
        
        // Maintain aspect ratio and re-render
        adjustAspectRatio();
        renderFractal();
    }

    // No selection variables needed for direct click-to-zoom

    // Max iterations for fractal calculation
    const maxIterations = 100;

    // HSL to RGB conversion function
    function hslToRgb(h, s, l) {
        // Convert HSL percentages to decimals
        h = h % 360;
        s = s / 100;
        l = l / 100;
        
        let r, g, b;
        
        if (s === 0) {
            // Achromatic (gray)
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, (h / 360 + 1/3) % 1);
            g = hue2rgb(p, q, (h / 360) % 1);
            b = hue2rgb(p, q, (h / 360 - 1/3) % 1);
        }
        
        // Convert to 0-255 range
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // Color mapping functions
    function getSpectrumColor(iterations) {
        if (iterations === maxIterations) {
            return { r: 0, g: 0, b: 0 }; // Black for points in the set
        }
        
        // Create a smooth color gradient based on iteration count
        const hue = 240 + (iterations / maxIterations) * 120; // Blue to purple
        const saturation = 100;
        const lightness = 50;
        
        return hslToRgb(hue, saturation, lightness);
    }
    
    function getFireColor(iterations) {
        if (iterations === maxIterations) {
            return { r: 0, g: 0, b: 0 }; // Black for points in the set
        }
        
        // Create a fire gradient (red to yellow)
        const hue = 30 - (iterations / maxIterations) * 30; // Yellow to red
        const saturation = 100;
        const lightness = Math.min(50, 10 + (iterations / maxIterations) * 50);
        
        return hslToRgb(hue, saturation, lightness);
    }
    
    function getRainbowColor(iterations) {
        if (iterations === maxIterations) {
            return { r: 0, g: 0, b: 0 }; // Black for points in the set
        }
        
        // Create a rainbow gradient cycling through all hues
        const hue = (iterations * 360 / maxIterations) % 360;
        const saturation = 100;
        const lightness = 50;
        
        return hslToRgb(hue, saturation, lightness);
    }
    
    // Get color based on selected scheme
    function getColor(iterations) {
        const scheme = colorSchemeSelect.value;
        
        switch (scheme) {
            case 'fire':
                return getFireColor(iterations);
            case 'rainbow':
                return getRainbowColor(iterations);
            case 'spectrum':
            default:
                return getSpectrumColor(iterations);
        }
    }

    // Calculate if a point is in the Mandelbrot set
    function calculateMandelbrot(cReal, cImag) {
        let zReal = 0;
        let zImag = 0;
        let iteration = 0;
        
        // z = z^2 + c
        while (zReal * zReal + zImag * zImag < 4 && iteration < maxIterations) {
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
    
    // Calculate if a point is in the Julia set
    function calculateJulia(zReal, zImag) {
        let iteration = 0;
        const cReal = juliaConstant.real;
        const cImag = juliaConstant.imag;
        
        // z = z^2 + c (with fixed c)
        while (zReal * zReal + zImag * zImag < 4 && iteration < maxIterations) {
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
    
    // Calculate if a point is in the Burning Ship fractal
    function calculateBurningShip(cReal, cImag) {
        let zReal = 0;
        let zImag = 0;
        let iteration = 0;
        
        // z = (|Re(z)| + i|Im(z)|)^2 + c
        while (zReal * zReal + zImag * zImag < 4 && iteration < maxIterations) {
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
    
    // Calculate iterations based on selected fractal type
    function calculateFractal(cReal, cImag) {
        const fractalType = fractalTypeSelect.value;
        
        switch (fractalType) {
            case 'julia':
                return calculateJulia(cReal, cImag);
            case 'burningShip':
                return calculateBurningShip(cReal, cImag);
            case 'mandelbrot':
            default:
                return calculateMandelbrot(cReal, cImag);
        }
    }

    // Render the selected fractal
    function renderFractal() {
        // Create image data for direct pixel manipulation
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        // For each pixel in the canvas
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                // Map canvas coordinates to complex plane
                const cReal = xMin + (x / canvas.width) * (xMax - xMin);
                const cImag = yMin + (y / canvas.height) * (yMax - yMin);
                
                // Calculate iterations for this point based on selected fractal
                const iterations = calculateFractal(cReal, cImag);
                
                // Get RGB color based on iterations
                const rgb = getColor(iterations);
                
                // Set pixel color in image data
                const pixelIndex = (y * canvas.width + x) * 4;
                data[pixelIndex] = rgb.r;     // Red
                data[pixelIndex + 1] = rgb.g; // Green
                data[pixelIndex + 2] = rgb.b; // Blue
                data[pixelIndex + 3] = 255;   // Alpha (fully opaque)
            }
        }
        
        // Put image data to canvas
        ctx.putImageData(imageData, 0, 0);
    }

    // Direct click-to-zoom functionality
    function handleCanvasClick(e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Map click coordinates to complex plane
        const cReal = xMin + (clickX / canvas.width) * (xMax - xMin);
        const cImag = yMin + (clickY / canvas.height) * (yMax - yMin);
        
        // Calculate new boundaries (zoom in by factor of 2.5)
        const zoomFactor = 0.4; // 1/2.5
        const newWidth = (xMax - xMin) * zoomFactor;
        const newHeight = (yMax - yMin) * zoomFactor;
        
        // Center the new view on the clicked point
        xMin = cReal - newWidth / 2;
        xMax = cReal + newWidth / 2;
        yMin = cImag - newHeight / 2;
        yMax = cImag + newHeight / 2;
        
        // Re-render with new boundaries
        renderFractal();
    }

    // Reset view to initial state
    function resetView() {
        // Set appropriate initial boundaries based on fractal type
        const fractalType = fractalTypeSelect.value;
        
        switch (fractalType) {
            case 'julia':
                xMin = -2;
                xMax = 2;
                yMin = -1.5;
                yMax = 1.5;
                break;
            case 'burningShip':
                xMin = -2.5;
                xMax = 1.5;
                yMin = -2;
                yMax = 1;
                break;
            case 'mandelbrot':
            default:
                xMin = -2.5;
                xMax = 1;
                yMin = -1.2;
                yMax = 1.2;
                break;
        }
        
        // Adjust for aspect ratio
        const aspectRatio = canvas.height / canvas.width;
        const xRange = xMax - xMin;
        const center = yMin + (yMax - yMin) / 2;
        yMin = center - (xRange * aspectRatio) / 2;
        yMax = center + (xRange * aspectRatio) / 2;
        
        // Render with initial boundaries
        renderFractal();
    }

    // Handle fractal type change
    function handleFractalTypeChange() {
        resetView();
    }
    
    // Handle color scheme change
    function handleColorSchemeChange() {
        renderFractal();
    }

    // Touch event handlers for mobile
    let touchStartX, touchStartY;
    let touchStartDistance = 0;

    function handleTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            // Single touch - direct zoom
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Use the same zoom logic as click
            const cReal = xMin + (touchX / canvas.width) * (xMax - xMin);
            const cImag = yMin + (touchY / canvas.height) * (yMax - yMin);
            
            const zoomFactor = 0.4; // Same as click zoom
            const newWidth = (xMax - xMin) * zoomFactor;
            const newHeight = (yMax - yMin) * zoomFactor;
            
            xMin = cReal - newWidth / 2;
            xMax = cReal + newWidth / 2;
            yMin = cImag - newHeight / 2;
            yMax = cImag + newHeight / 2;
            
            renderFractal();
        } else if (e.touches.length === 2) {
            // Pinch gesture - prepare for zooming
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    }

    function handleTouchMove(e) {
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
            if (Math.abs(touchDistance - touchStartDistance) > 10) {
                const zoomCenter = {
                    x: (touch1.clientX + touch2.clientX) / 2 - canvas.getBoundingClientRect().left,
                    y: (touch1.clientY + touch2.clientY) / 2 - canvas.getBoundingClientRect().top
                };
                
                // Implement pinch zoom logic
                const zoomFactor = touchDistance > touchStartDistance ? 0.8 : 1.2;
                zoomAtPoint(zoomCenter.x, zoomCenter.y, zoomFactor);
                
                touchStartDistance = touchDistance;
            }
        }
    }

    function handleTouchEnd(e) {
        // No action needed
    }

    // Helper function for pinch zoom
    function zoomAtPoint(x, y, factor) {
        // Map canvas coordinates to complex plane
        const cReal = xMin + (x / canvas.width) * (xMax - xMin);
        const cImag = yMin + (y / canvas.height) * (yMax - yMin);
        
        // Calculate new boundaries
        const newWidth = (xMax - xMin) * factor;
        const newHeight = (yMax - yMin) * factor;
        
        xMin = cReal - (x / canvas.width) * newWidth;
        xMax = xMin + newWidth;
        yMin = cImag - (y / canvas.height) * newHeight;
        yMax = yMin + newHeight;
        
        renderFractal();
    }

    // Add collapsible controls for mobile
    const controlsToggle = document.createElement('div');
    controlsToggle.className = 'controls-toggle';
    controlsToggle.textContent = 'Show Controls ▼';
    const controls = document.querySelector('.controls');
    controls.parentNode.insertBefore(controlsToggle, controls);

    controlsToggle.addEventListener('click', () => {
        controls.classList.toggle('collapsed');
        controlsToggle.textContent = controls.classList.contains('collapsed') 
            ? 'Show Controls ▼' 
            : 'Hide Controls ▲';
    });

    // Event listeners
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);
    resetBtn.addEventListener('click', resetView);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    fractalTypeSelect.addEventListener('change', handleFractalTypeChange);
    colorSchemeSelect.addEventListener('change', handleColorSchemeChange);
    
    // Fullscreen change event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Keyboard shortcut for fullscreen
    document.addEventListener('keydown', (e) => {
        // F11 or F key for fullscreen
        if (e.key === 'F11' || e.key === 'f') {
            e.preventDefault(); // Prevent default F11 behavior
            toggleFullscreen();
        }
        
        // Ctrl+Enter is another common fullscreen shortcut
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            toggleFullscreen();
        }
    });
    
    // Window resize event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Initial setup
    resizeCanvas(); // Set canvas dimensions based on container size
    resetView(); // Set appropriate boundaries based on selected fractal type
});
