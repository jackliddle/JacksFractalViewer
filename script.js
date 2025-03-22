document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    const canvas = document.getElementById('mandelbrotCanvas');
    const ctx = canvas.getContext('2d');
    const selectionBox = document.getElementById('selection');
    const zoomBtn = document.getElementById('zoomBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;

    // Initial complex plane boundaries
    let xMin = -2.5;
    let xMax = 1;
    let yMin = -1.2;
    let yMax = 1.2;

    // Adjust yMin and yMax to match canvas aspect ratio
    const aspectRatio = canvas.height / canvas.width;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const center = yMin + yRange / 2;
    yMin = center - (xRange * aspectRatio) / 2;
    yMax = center + (xRange * aspectRatio) / 2;

    // Selection variables
    let isSelecting = false;
    let selectionStart = { x: 0, y: 0 };
    let selectionEnd = { x: 0, y: 0 };
    let hasSelection = false;

    // Max iterations for Mandelbrot calculation
    const maxIterations = 100;

    // Color mapping function
    function getColor(iterations) {
        if (iterations === maxIterations) {
            return '#000000'; // Black for points in the set
        }
        
        // Create a smooth color gradient based on iteration count
        const hue = 240 + (iterations / maxIterations) * 120; // Blue to purple
        const saturation = 100;
        const lightness = 50;
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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

    // Render the Mandelbrot set
    function renderMandelbrot() {
        // Create image data for direct pixel manipulation
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        // For each pixel in the canvas
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                // Map canvas coordinates to complex plane
                const cReal = xMin + (x / canvas.width) * (xMax - xMin);
                const cImag = yMin + (y / canvas.height) * (yMax - yMin);
                
                // Calculate iterations for this point
                const iterations = calculateMandelbrot(cReal, cImag);
                
                // Get color based on iterations
                const color = getColor(iterations);
                
                // Convert hex color to RGB
                const r = parseInt(color.slice(1, 3), 16) || 0;
                const g = parseInt(color.slice(3, 5), 16) || 0;
                const b = parseInt(color.slice(5, 7), 16) || 0;
                
                // Set pixel color in image data
                const pixelIndex = (y * canvas.width + x) * 4;
                data[pixelIndex] = r;     // Red
                data[pixelIndex + 1] = g; // Green
                data[pixelIndex + 2] = b; // Blue
                data[pixelIndex + 3] = 255; // Alpha (fully opaque)
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
        renderMandelbrot();
    }

    // Reset view to initial state
    function resetView() {
        xMin = -2.5;
        xMax = 1;
        yMin = -1.2;
        yMax = 1.2;
        
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
        renderMandelbrot();
    }

    // Event listeners
    canvas.addEventListener('click', handleCanvasClick);
    zoomBtn.addEventListener('click', zoomToSelection);
    resetBtn.addEventListener('click', resetView);
    
    // Initial render
    zoomBtn.disabled = true;
    renderMandelbrot();
});
