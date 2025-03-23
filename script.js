document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    const canvas = document.getElementById('mandelbrotCanvas');
    const ctx = canvas.getContext('2d');
    const selectionBox = document.getElementById('selection');
    const zoomBtn = document.getElementById('zoomBtn');
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
        const containerWidth = canvasContainer.clientWidth;
        canvasWidth = containerWidth;
        canvasHeight = Math.floor(containerWidth * 0.75); // 4:3 aspect ratio
        
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
            if (canvasContainer.requestFullscreen) {
                canvasContainer.requestFullscreen();
            } else if (canvasContainer.webkitRequestFullscreen) { /* Safari */
                canvasContainer.webkitRequestFullscreen();
            } else if (canvasContainer.msRequestFullscreen) { /* IE11 */
                canvasContainer.msRequestFullscreen();
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
            // Resize canvas to fill most of the screen, leaving room for controls
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - 100; // Leave space for controls
            
            // Ensure controls are visible in fullscreen mode
            const controls = document.querySelector('.controls');
            const info = document.querySelector('.info');
            
            if (controls) {
                controls.style.position = 'fixed';
                controls.style.bottom = '10px';
                controls.style.left = '0';
                controls.style.right = '0';
                controls.style.zIndex = '1000';
                controls.style.background = 'rgba(255, 255, 255, 0.8)';
                controls.style.padding = '10px';
                controls.style.borderRadius = '5px';
            }
            
            if (info) {
                info.style.position = 'fixed';
                info.style.bottom = '70px';
                info.style.left = '0';
                info.style.right = '0';
                info.style.zIndex = '1000';
                info.style.background = 'rgba(255, 255, 255, 0.8)';
                info.style.padding = '5px';
            }
        } else {
            // Reset canvas to container size
            resizeCanvas();
            
            // Reset control styles
            const controls = document.querySelector('.controls');
            const info = document.querySelector('.info');
            
            if (controls) {
                controls.style.position = '';
                controls.style.bottom = '';
                controls.style.left = '';
                controls.style.right = '';
                controls.style.zIndex = '';
                controls.style.background = '';
                controls.style.padding = '';
                controls.style.borderRadius = '';
            }
            
            if (info) {
                info.style.position = '';
                info.style.bottom = '';
                info.style.left = '';
                info.style.right = '';
                info.style.zIndex = '';
                info.style.background = '';
                info.style.padding = '';
            }
        }
        
        // Maintain aspect ratio and re-render
        adjustAspectRatio();
        renderFractal();
    }

    // Selection variables
    let isSelecting = false;
    let selectionStart = { x: 0, y: 0 };
    let selectionEnd = { x: 0, y: 0 };
    let hasSelection = false;

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

    // Simplified selection with single click
    function handleCanvasClick(e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Create a selection box around the clicked point
        selectionStart.x = Math.max(0, clickX - 50);
        selectionStart.y = Math.max(0, clickY - 50);
        selectionEnd.x = Math.min(canvas.width, clickX + 50);
        selectionEnd.y = Math.min(canvas.height, clickY + 50);
        
        // Show selection and enable zoom button
        hasSelection = true;
        zoomBtn.disabled = false;
        updateSelectionBox();
    }

    function updateSelectionBox() {
        const left = Math.min(selectionStart.x, selectionEnd.x);
        const top = Math.min(selectionStart.y, selectionEnd.y);
        const width = Math.abs(selectionEnd.x - selectionStart.x);
        const height = Math.abs(selectionEnd.y - selectionStart.y);
        
        selectionBox.style.display = 'block';
        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
    }
    
    // Zoom to selection
    function zoomToSelection() {
        if (!hasSelection) return;
        
        // Calculate new boundaries based on selection
        const selLeft = Math.min(selectionStart.x, selectionEnd.x);
        const selRight = Math.max(selectionStart.x, selectionEnd.x);
        const selTop = Math.min(selectionStart.y, selectionEnd.y);
        const selBottom = Math.max(selectionStart.y, selectionEnd.y);
        
        // Map selection coordinates to complex plane
        const newXMin = xMin + (selLeft / canvas.width) * (xMax - xMin);
        const newXMax = xMin + (selRight / canvas.width) * (xMax - xMin);
        const newYMin = yMin + (selTop / canvas.height) * (yMax - yMin);
        const newYMax = yMin + (selBottom / canvas.height) * (yMax - yMin);
        
        // Update boundaries
        xMin = newXMin;
        xMax = newXMax;
        yMin = newYMin;
        yMax = newYMax;
        
        // Clear selection
        hasSelection = false;
        selectionBox.style.display = 'none';
        zoomBtn.disabled = true;
        
        // Render with new boundaries
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
        
        // Clear selection
        hasSelection = false;
        selectionBox.style.display = 'none';
        zoomBtn.disabled = true;
        
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
            // Single touch - prepare for selection or panning
            touchStartX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
            touchStartY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
            selectionStart.x = touchStartX;
            selectionStart.y = touchStartY;
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
        
        if (e.touches.length === 1) {
            // Single touch - update selection box
            const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
            const touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
            selectionEnd.x = touchX;
            selectionEnd.y = touchY;
            updateSelectionBox();
            hasSelection = true;
            zoomBtn.disabled = false;
        } else if (e.touches.length === 2) {
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
        // Handle touch end if needed
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
    zoomBtn.addEventListener('click', zoomToSelection);
    resetBtn.addEventListener('click', resetView);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    fractalTypeSelect.addEventListener('change', handleFractalTypeChange);
    colorSchemeSelect.addEventListener('change', handleColorSchemeChange);
    
    // Fullscreen change event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Window resize event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Initial setup
    resizeCanvas(); // Set canvas dimensions based on container size
    resetView(); // Set appropriate boundaries based on selected fractal type
    zoomBtn.disabled = true;
});
