// Pinout Preview JavaScript

class PinoutPreview {
    constructor() {
        this.pinoutData = null;
        this.pinoutId = null;
        this.isEditMode = false;
        this.init();
    }
    
    init() {
        this.loadPinoutData();
        this.setupEventListeners();
    }
    
    loadPinoutData() {
        // Check for injected data from server (slug-based routing)
        if (window.pinoutData && window.pinoutId) {
            this.pinoutData = window.pinoutData;
            this.pinoutId = window.pinoutId;
            this.renderPreview();
            return;
        }
        
        // Get pinout data from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        this.pinoutId = urlParams.get('id');
        this.isEditMode = urlParams.get('edit') === 'true';
        
        if (this.pinoutId) {
            this.loadPinoutFromAPI();
        } else {
            // Load from localStorage (from creator)
            const savedData = localStorage.getItem('pinoutPreviewData');
            if (savedData) {
                this.pinoutData = JSON.parse(savedData);
                this.renderPreview();
            } else {
                this.showError('No pinout data found');
            }
        }
    }
    
    async loadPinoutFromAPI() {
        try {
            const response = await fetch(`api/pinouts.php/${this.pinoutId}`);
            const result = await response.json();
            
            if (result.success) {
                this.pinoutData = result.data;
                this.renderPreview();
            } else {
                this.showError(result.error || 'Failed to load pinout');
            }
        } catch (error) {
            console.error('Error loading pinout:', error);
            this.showError('Failed to load pinout from server');
        }
    }
    
    setupEventListeners() {
        const datasheetBtn = document.getElementById('datasheetBtn');
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        const downloadPngBtn = document.getElementById('downloadPngBtn');
        
        if (datasheetBtn) {
            // Datasheet button is an anchor tag, no event listener needed
        }
        
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                this.downloadPDF();
            });
        }
        
        if (downloadPngBtn) {
            downloadPngBtn.addEventListener('click', () => {
                this.downloadPNG();
            });
        }
    }
    
    renderPreview() {
        if (!this.pinoutData) return;
        
        this.renderPinoutDiagram();
        this.renderSpecifications();
        this.renderContent();
    }
    
    renderPinoutDiagram() {
        const container = document.getElementById('previewPinout');
        
        // Update title and subtitle
        document.getElementById('previewTitle').textContent = this.pinoutData.chip_name || 'Pinout Preview';
        document.getElementById('previewSubtitle').textContent = this.getSubtitle();
        
        // If we have SVG content from the database, use it
        if (this.pinoutData.svg_content) {
            container.innerHTML = this.pinoutData.svg_content;
            // Add interactions to stored SVG
            this.setupSVGInteractions();
        } else {
            // Use HTML structure with SVG-like styling for better compatibility
            this.generateHTMLWithSVGStyling();
        }
    }
    
    generateHTMLWithSVGStyling() {
        const container = document.getElementById('previewPinout');
        
        // Create the pinout structure with SVG-like styling
        const pinoutHTML = this.generatePinoutHTML();
        container.innerHTML = pinoutHTML;
        
        // Add custom CSS to make it look like the SVG
        this.addSVGLikeStyling();
        
        // Add interactive functionality
        this.setupPinoutInteractions();
    }
    
    addSVGLikeStyling() {
        const container = document.getElementById('previewPinout');
        
        // Add custom styles to make HTML look like SVG
        const style = document.createElement('style');
        style.textContent = `
            #previewPinout .chip-diagram {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            #previewPinout .pin::before {
                content: '';
                position: absolute;
                width: 20px;
                height: 4px;
                background: #95a5a6;
                border-radius: 2px;
                z-index: 1;
            }
            
            #previewPinout .left-pins .pin::before {
                right: -4px;
            }
            
            #previewPinout .right-pins .pin::before {
                left: -4px;
            }
            
            #previewPinout .pin-label {
                position: relative;
                z-index: 2;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            #previewPinout .pin-label:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    generateAndDisplaySVG() {
        const container = document.getElementById('previewPinout');
        
        // First create the pinout structure temporarily
        const pinoutHTML = this.generatePinoutHTML();
        container.innerHTML = pinoutHTML;
        
        // Now convert it to SVG (similar to creator's convertToSVG method)
        const svg = this.convertToSVG();
        if (svg) {
            container.innerHTML = new XMLSerializer().serializeToString(svg);
            // Add click interactions to the SVG elements
            this.setupSVGInteractions();
        } else {
            // Fallback to interactive pinout if SVG generation fails
            this.setupPinoutInteractions();
        }
    }
    
    convertToSVG() {
        // Try to find the pinout container
        const pinoutContainer = document.querySelector('.chip-diagram') || document.querySelector('#previewPinout');
        if (!pinoutContainer) {
            console.error('No pinout container found');
            return null;
        }

        // Check if there are any pins in the container
        const pins = pinoutContainer.querySelectorAll('.pin');
        if (pins.length === 0) {
            console.error('No pins found in container');
            return null;
        }

        // Get dimensions
        const rect = pinoutContainer.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        if (width === 0 || height === 0) {
            console.error('Container has zero dimensions:', width, height);
            return null;
        }

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.backgroundColor = '#f8f9fa';

        // Get chip body element
        const chipBody = pinoutContainer.querySelector('.chip-body');
        if (chipBody) {
            const chipRect = chipBody.getBoundingClientRect();
            const containerRect = pinoutContainer.getBoundingClientRect();
            
            // Create chip body rectangle
            const chipRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            chipRectElement.setAttribute('x', chipRect.left - containerRect.left);
            chipRectElement.setAttribute('y', chipRect.top - containerRect.top);
            chipRectElement.setAttribute('width', chipRect.width);
            chipRectElement.setAttribute('height', chipRect.height);
            chipRectElement.setAttribute('fill', '#ecf0f1');
            chipRectElement.setAttribute('stroke', '#bdc3c7');
            chipRectElement.setAttribute('stroke-width', '2');
            chipRectElement.setAttribute('rx', '8');
            svg.appendChild(chipRectElement);

            // Add chip body background image if present
            const bgImage = window.getComputedStyle(chipBody).backgroundImage;
            if (bgImage && bgImage !== 'none') {
                // Hide the chip body outline when background image is present
                chipRectElement.setAttribute('fill', 'transparent');
                chipRectElement.setAttribute('stroke', 'transparent');
                
                const imageUrl = bgImage.slice(5, -2); // Remove 'url("' and '")'
                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttribute('href', imageUrl);
                
                // Apply custom positioning and scaling
                const chipCenterX = chipRect.left - containerRect.left + chipRect.width / 2;
                const chipCenterY = chipRect.top - containerRect.top + chipRect.height / 2;
                
                // Use the pinout data for custom positioning and scaling
                const imageScaleX = this.pinoutData.image_scale_x || 300;
                const imageScaleY = this.pinoutData.image_scale_y || 300;
                const imageOffsetX = this.pinoutData.image_offset_x || 0;
                const imageOffsetY = this.pinoutData.image_offset_y || 0;
                
                // Calculate position with custom offset
                const imageX = chipCenterX - imageScaleX / 2 + imageOffsetX;
                const imageY = chipCenterY - imageScaleY / 2 + imageOffsetY;
                
                image.setAttribute('x', imageX);
                image.setAttribute('y', imageY);
                image.setAttribute('width', imageScaleX);
                image.setAttribute('height', imageScaleY);
                image.setAttribute('preserveAspectRatio', 'none'); // Allow custom scaling
                svg.appendChild(image);
            }
        }

        // Process all pins
        pins.forEach((pin, index) => {
            const pinRect = pin.getBoundingClientRect();
            const containerRect = pinoutContainer.getBoundingClientRect();
            
            // Get pin label
            const label = pin.querySelector('.pin-label');
            if (!label) return;

            const labelRect = label.getBoundingClientRect();
            const labelText = label.textContent;
            const labelColor = window.getComputedStyle(label).backgroundColor;
            
            // Get pin number
            const pinNum = pin.querySelector('.pin-num');
            const pinNumber = pinNum ? pinNum.textContent : '';

            // Create pin rectangle (gray connector)
            const pinRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            
            // Determine if this is a left or right pin based on container class
            const isLeftPin = pin.closest('.left-pins') !== null;
            
            if (isLeftPin) {
                // For left pins, position gray rectangle to the right of the pin label (closer to chip body)
                pinRectElement.setAttribute('x', labelRect.right - containerRect.left);
            } else {
                // For right pins, position gray rectangle to the left of the pin label (closer to chip body)
                pinRectElement.setAttribute('x', labelRect.left - containerRect.left - 20);
            }
            
            pinRectElement.setAttribute('y', pinRect.top - containerRect.top + pinRect.height / 2 - 2);
            pinRectElement.setAttribute('width', 20);
            pinRectElement.setAttribute('height', 4);
            pinRectElement.setAttribute('fill', '#95a5a6');
            pinRectElement.setAttribute('rx', '2');
            svg.appendChild(pinRectElement);

            // Create pin label background
            const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            labelBg.setAttribute('x', labelRect.left - containerRect.left);
            labelBg.setAttribute('y', labelRect.top - containerRect.top);
            labelBg.setAttribute('width', labelRect.width);
            labelBg.setAttribute('height', labelRect.height);
            labelBg.setAttribute('fill', labelColor);
            labelBg.setAttribute('rx', '6');
            labelBg.setAttribute('cursor', 'pointer');
            labelBg.classList.add('pin-label-bg');
            labelBg.setAttribute('data-pin-index', index);
            svg.appendChild(labelBg);

            // Create pin label text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelRect.left - containerRect.left + labelRect.width / 2);
            text.setAttribute('y', labelRect.top - containerRect.top + labelRect.height / 2 + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', '600');
            text.setAttribute('font-family', 'Arial, sans-serif');
            text.setAttribute('cursor', 'pointer');
            text.classList.add('pin-label-text');
            text.setAttribute('data-pin-index', index);
            text.textContent = labelText;
            svg.appendChild(text);

            // Create pin number text if it exists
            if (pinNumber && pinNum) {
                const pinNumRect = pinNum.getBoundingClientRect();
                const pinNumText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                pinNumText.setAttribute('x', pinNumRect.left - containerRect.left + pinNumRect.width / 2);
                pinNumText.setAttribute('y', pinNumRect.top - containerRect.top + pinNumRect.height / 2 + 5);
                pinNumText.setAttribute('text-anchor', 'middle');
                pinNumText.setAttribute('fill', window.getComputedStyle(pinNum).color);
                pinNumText.setAttribute('font-size', '12');
                pinNumText.setAttribute('font-weight', '600');
                pinNumText.setAttribute('font-family', 'Arial, sans-serif');
                pinNumText.setAttribute('cursor', 'pointer');
                pinNumText.classList.add('pin-num-text');
                pinNumText.setAttribute('data-pin-index', index);
                pinNumText.textContent = pinNumber;
                svg.appendChild(pinNumText);
            }
        });

        // Add CSS styles for SVG
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .pin-label-bg.selected { stroke: #3498db; stroke-width: 2; }
            .pin-label-text.selected { fill: #3498db; }
            .pin-label-bg { transition: all 0.3s ease; }
            .pin-label-text { transition: all 0.3s ease; }
        `;
        svg.appendChild(style);

        return svg;
    }
    
    setupSVGInteractions() {
        const container = document.getElementById('previewPinout');
        const svg = container.querySelector('svg');
        if (!svg) {
            console.error('No SVG found in preview container');
            return;
        }
        
        console.log('Setting up SVG interactions...');
        
        // Add click listeners to pin label backgrounds and texts
        const pinLabels = svg.querySelectorAll('.pin-label-bg, .pin-label-text');
        console.log('Found', pinLabels.length, 'pin label elements');
        
        pinLabels.forEach((element, index) => {
            const pinIndex = element.getAttribute('data-pin-index');
            console.log(`Element ${index}: data-pin-index = ${pinIndex}`);
            
            if (pinIndex !== null) {
                element.addEventListener('click', (e) => {
                    console.log('Pin clicked:', pinIndex);
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePinClick(parseInt(pinIndex));
                });
                
                // Add hover effects
                element.addEventListener('mouseenter', () => {
                    this.highlightPin(parseInt(pinIndex), true);
                });
                
                element.addEventListener('mouseleave', () => {
                    this.highlightPin(parseInt(pinIndex), false);
                });
            }
        });
    }
    
    handlePinClick(pinIndex) {
        console.log('handlePinClick called with index:', pinIndex);
        const data = this.pinoutData;
        if (!data || !data.pins) {
            console.error('No pinout data or pins available');
            return;
        }
        
        // Find the pin data by index (pins are processed in order in convertToSVG)
        const leftPins = data.pins.filter(pin => pin.side === 'left');
        const rightPins = data.pins.filter(pin => pin.side === 'right');
        const allPins = [...leftPins, ...rightPins];
        
        console.log('Total pins:', allPins.length, 'Requested index:', pinIndex);
        
        if (pinIndex < allPins.length) {
            const pin = allPins[pinIndex];
            console.log('Found pin:', pin);
            this.showPinInfo(pin);
        } else {
            console.error('Pin index out of range');
        }
    }
    
    highlightPin(pinIndex, highlight) {
        const container = document.getElementById('previewPinout');
        const svg = container.querySelector('svg');
        if (!svg) return;
        
        // Find elements with matching data-pin-index
        const bgElement = svg.querySelector(`.pin-label-bg[data-pin-index="${pinIndex}"]`);
        const textElement = svg.querySelector(`.pin-label-text[data-pin-index="${pinIndex}"]`);
        
        if (bgElement && textElement) {
            if (highlight) {
                bgElement.classList.add('selected');
                textElement.classList.add('selected');
            } else {
                bgElement.classList.remove('selected');
                textElement.classList.remove('selected');
            }
        }
    }
    
    renderContent() {
        const contentContainer = document.getElementById('contentSection');
        const data = this.pinoutData;
        
        if (data.page_content && data.page_content.trim()) {
            contentContainer.innerHTML = `
                <div class="content-text">
                    ${data.page_content}
                </div>
            `;
        } else {
            contentContainer.innerHTML = `
                <div class="content-text">
                    <p>No additional content available for this pinout.</p>
                </div>
            `;
        }
    }
    
    getSubtitle() {
        const categoryName = this.pinoutData.category_name || 'Custom Pinout';
        const pinCount = this.pinoutData.symmetric_pins ? 
            `${this.pinoutData.pin_count} pins (symmetric)` : 
            `${this.pinoutData.left_pin_count}L + ${this.pinoutData.right_pin_count}R pins`;
        const dimensions = `${this.pinoutData.board_width}mm × ${this.pinoutData.board_height}mm`;
        
        return `${categoryName} • ${pinCount} • ${dimensions}`;
    }
    
    generatePinoutHTML() {
        const data = this.pinoutData;
        const leftPins = data.pins.filter(pin => pin.side === 'left');
        const rightPins = data.pins.filter(pin => pin.side === 'right');
        
        // Calculate dimensions
        const maxSidePinCount = Math.max(leftPins.length, rightPins.length);
        let chipHeight = maxSidePinCount <= 14 ? 400 : 400 + (maxSidePinCount - 14) * 15;
        const spacing = Math.max(12, Math.round(chipHeight / (maxSidePinCount * 2)));
        
        return `
            <div class="pinout-section">
                <div class="section-header">
                    <h2>${data.chip_name}</h2>
                    <p class="section-subtitle">
                        ${this.getCategoryIcon(data.category_id)} ${data.category_name || 'Custom Pinout'} • 
                        ${data.symmetric_pins ? `${data.pin_count} pins (symmetric)` : `${data.left_pin_count}L + ${data.right_pin_count}R pins`} • 
                        ${data.board_width}mm × ${data.board_height}mm
                    </p>
                </div>
                
                <div class="chip-diagram custom-pinout" style="--pin-count: ${data.pin_count}; --chip-height: ${chipHeight}px; --pin-spacing: ${spacing}px;">
                    <div class="pin-column left-pins">
                        ${leftPins.map(pin => this.createPinElement(pin)).join('')}
                    </div>
                    
                    <div class="chip-body" style="width: ${data.board_width * 3.78}px; height: ${chipHeight}px;">
                        ${this.createPinNumbers(leftPins, 'left')}
                        ${this.createPinNumbers(rightPins, 'right')}
                    </div>
                    
                    <div class="pin-column right-pins">
                        ${rightPins.map(pin => this.createPinElement(pin)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    createPinElement(pin) {
        const pinTypes = {
            'power': 'pin-type-power',
            'gnd': 'pin-type-gnd',
            'gpio': 'pin-type-gpio',
            'data': 'pin-type-data',
            'clock': 'pin-type-clock',
            'analog': 'pin-type-analog',
            'reset': 'pin-type-reset',
            'special': 'pin-type-special',
            'other': 'pin-type-other'
        };
        
        return `
            <div class="pin" data-pin-number="${pin.number}">
                <div class="pin-label ${pinTypes[pin.type] || 'pin-type-other'}">
                    ${pin.name}
                </div>
            </div>
        `;
    }
    
    createPinNumbers(pins, side) {
        return `
            <div class="pin-numbers-${side}">
                ${pins.map((pin, index) => {
                    const position = index + 1;
                    const percentage = ((position * 2 - 1) / (pins.length * 2)) * 100;
                    return `
                        <div class="pin-num" style="top: ${percentage}%; color: ${this.pinoutData.pin_number_color || '#2c3e50'};">
                            ${pin.number}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    setupPinoutInteractions() {
        const pins = document.querySelectorAll('.pin');
        pins.forEach(pin => {
            pin.addEventListener('click', () => {
                this.selectPin(pin);
            });
            
            pin.addEventListener('mouseenter', () => {
                pin.querySelector('.pin-label').style.transform = 'scale(1.05)';
            });
            
            pin.addEventListener('mouseleave', () => {
                pin.querySelector('.pin-label').style.transform = 'scale(1)';
            });
        });
    }
    
    selectPin(pinElement) {
        // Remove previous selection
        document.querySelectorAll('.pin-label').forEach(label => {
            label.classList.remove('selected');
        });
        
        // Add selection to current pin
        const label = pinElement.querySelector('.pin-label');
        label.classList.add('selected');
        
        // Show pin information
        const pinNumber = pinElement.dataset.pinNumber;
        const pinData = this.pinoutData.pins.find(p => p.number == pinNumber);
        if (pinData) {
            this.showPinInfo(pinData);
        }
    }
    
    showPinInfo(pin) {
        const infoPanel = document.getElementById('pinDetails');
        infoPanel.innerHTML = `
            <h3>Pin ${pin.number} Information</h3>
            <div class="spec-grid">
                <div class="spec-item">
                    <span class="spec-label">Pin Name:</span>
                    <span class="spec-value">${pin.name}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Type:</span>
                    <span class="spec-value">${pin.type.toUpperCase()}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Side:</span>
                    <span class="spec-value">${pin.side === 'left' ? 'Left' : 'Right'}</span>
                </div>
                ${pin.functions ? `
                    <div class="spec-item">
                        <span class="spec-label">Functions:</span>
                        <span class="spec-value">${Array.isArray(pin.functions) ? pin.functions.join(', ') : pin.functions}</span>
                    </div>
                ` : ''}
                ${pin.voltage ? `
                    <div class="spec-item">
                        <span class="spec-label">Voltage Range:</span>
                        <span class="spec-value">${pin.voltage}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderSpecifications() {
        const specsContainer = document.getElementById('chipSpecs');
        const data = this.pinoutData;
        
        specsContainer.innerHTML = `
            <div class="spec-item">
                <span class="spec-label">Chip Name:</span>
                <span class="spec-value">${data.chip_name}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Category:</span>
                <span class="spec-value">${this.getCategoryIcon(data.category_id)} ${data.category_name || 'Custom'}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Pin Count:</span>
                <span class="spec-value">${data.pin_count} total</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Configuration:</span>
                <span class="spec-value">${data.symmetric_pins ? 'Symmetric' : 'Asymmetric'}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Package Size:</span>
                <span class="spec-value">${data.board_width}mm × ${data.board_height}mm</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Background:</span>
                <span class="spec-value">${data.background_type === 'image' ? 'Custom Image' : 'Default'}</span>
            </div>
            ${data.view_count ? `
                <div class="spec-item">
                    <span class="spec-label">Views:</span>
                    <span class="spec-value">${data.view_count}</span>
                </div>
            ` : ''}
        `;
        
        // Handle datasheet link
        this.renderDatasheetLink();
    }
    
    renderDatasheetLink() {
        const datasheetBtn = document.getElementById('datasheetBtn');
        const data = this.pinoutData;
        
        if (data.datasheet_link && data.datasheet_link.trim()) {
            datasheetBtn.href = data.datasheet_link;
            datasheetBtn.style.display = 'flex';
        } else {
            datasheetBtn.style.display = 'none';
        }
    }
    
    
    getCategoryIcon(categoryId) {
        const categories = {
            1: '🔧', // microcontroller-8bit
            2: '⚙️', // microcontroller-16bit
            3: '🔩', // microcontroller-32bit
            4: '📱', // development-board
            5: '📡', // sensor-module
            6: '📶', // communication-ic
            7: '⚡', // power-management
            8: '💾', // memory-storage
            9: '🔧'  // custom-other
        };
        return categories[categoryId] || '🔧';
    }
    
    async publishPinout() {
        try {
            const response = await fetch('api/pinouts.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.pinoutData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Pinout published successfully!');
                // Redirect to manage pinouts page
                window.location.href = 'manage-pinouts.html';
            } else {
                alert('Failed to publish pinout: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error publishing pinout:', error);
            alert('Failed to publish pinout. Please try again.');
        }
    }
    
    downloadPDF() {
        // Implementation for PDF download
        alert('PDF download functionality will be implemented');
    }
    
    downloadPNG() {
        // Implementation for PNG download
        alert('PNG download functionality will be implemented');
    }
    
    saveDraft() {
        // Save to localStorage for later editing
        localStorage.setItem('pinoutDraft', JSON.stringify(this.pinoutData));
        alert('Draft saved successfully!');
    }
    
    goBack() {
        if (this.pinoutId) {
            window.location.href = 'manage-pinouts.html';
        } else {
            window.location.href = 'pinout-creator.html';
        }
    }
    
    showError(message) {
        const container = document.getElementById('previewPinout');
        container.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// Initialize preview when page loads
document.addEventListener('DOMContentLoaded', function() {
    new PinoutPreview();
});