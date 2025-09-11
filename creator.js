// Pinout Creator JavaScript

class PinoutCreator {
    constructor() {
        this.pins = [];
        this.currentPinCount = 16;
        this.leftPinCount = 8;
        this.rightPinCount = 8;
        this.symmetricPins = true;
        this.chipName = 'Custom Chip';
        this.boardHeight = 20; // in mm
        this.boardWidth = 50; // in mm
        this.widthManuallySet = false; // Track if width was manually set
        this.backgroundType = 'default';
        this.backgroundImage = null;
        this.imageOffsetX = 0;
        this.imageOffsetY = 0;
        this.imageScale = 100;
        this.pinNumberColor = '#2c3e50';
        
        this.pinTypes = {
            'power': { name: 'Power', color: '#e74c3c', class: 'pin-type-power' },
            'gnd': { name: 'GND', color: '#2c3e50', class: 'pin-type-gnd' },
            'gpio': { name: 'GPIO', color: '#27ae60', class: 'pin-type-gpio' },
            'data': { name: 'Data', color: '#3498db', class: 'pin-type-data' },
            'clock': { name: 'Clock', color: '#9b59b6', class: 'pin-type-clock' },
            'analog': { name: 'Analog', color: '#f39c12', class: 'pin-type-analog' },
            'special': { name: 'Special', color: '#e67e22', class: 'pin-type-special' },
            'other': { name: 'Other', color: '#95a5a6', class: 'pin-type-other' }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateInitialPins();
        this.updatePreview();
    }
    
    setupEventListeners() {
        // Basic settings
        document.getElementById('chipName').addEventListener('input', (e) => {
            this.chipName = e.target.value;
            this.updatePreview();
        });
        
        document.getElementById('symmetricPins').addEventListener('change', (e) => {
            this.symmetricPins = e.target.checked;
            this.togglePinCountInputs();
            this.generateInitialPins();
            this.updatePreview();
        });
        
        document.getElementById('pinCount').addEventListener('change', (e) => {
            this.currentPinCount = parseInt(e.target.value);
            if (this.symmetricPins) {
                this.leftPinCount = Math.ceil(this.currentPinCount / 2);
                this.rightPinCount = this.currentPinCount - this.leftPinCount;
            }
            this.generateInitialPins();
            this.updatePreview();
        });
        
        document.getElementById('leftPinCount').addEventListener('change', (e) => {
            this.leftPinCount = parseInt(e.target.value);
            this.generateInitialPins();
            this.updatePreview();
        });
        
        document.getElementById('rightPinCount').addEventListener('change', (e) => {
            this.rightPinCount = parseInt(e.target.value);
            this.generateInitialPins();
            this.updatePreview();
        });
        
        document.getElementById('boardHeight').addEventListener('input', (e) => {
            this.boardHeight = parseFloat(e.target.value) || 20;
            // Auto-calculate width if it hasn't been manually set
            if (!this.widthManuallySet) {
                const aspectRatio = 2.5; // height:width ratio
                this.boardWidth = this.boardHeight * aspectRatio;
                document.getElementById('boardWidth').value = this.boardWidth;
            }
            this.updatePreview();
        });
        
        document.getElementById('boardWidth').addEventListener('input', (e) => {
            this.boardWidth = parseFloat(e.target.value) || 50;
            this.widthManuallySet = true; // Mark width as manually set
            this.updatePreview();
        });
        
        document.getElementById('pinNumberColor').addEventListener('input', (e) => {
            this.pinNumberColor = e.target.value;
            this.updatePreview();
        });
        
        // Background settings
        document.getElementById('backgroundType').addEventListener('change', (e) => {
            this.backgroundType = e.target.value;
            this.toggleBackgroundOptions();
            this.updatePreview();
        });
        
        document.getElementById('backgroundImage').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.backgroundImage = event.target.result;
                    this.updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });
        
        document.getElementById('imageUrl').addEventListener('input', (e) => {
            this.backgroundImage = e.target.value;
            this.updatePreview();
        });
        
        // Image position controls
        document.getElementById('imageOffsetX').addEventListener('input', (e) => {
            this.imageOffsetX = parseInt(e.target.value) || 0;
            this.updatePreview();
        });
        
        document.getElementById('imageOffsetY').addEventListener('input', (e) => {
            this.imageOffsetY = parseInt(e.target.value) || 0;
            this.updatePreview();
        });
        
        document.getElementById('imageScale').addEventListener('input', (e) => {
            this.imageScale = parseInt(e.target.value) || 100;
            this.updatePreview();
        });
        
        document.getElementById('resetImagePosition').addEventListener('click', () => {
            this.imageOffsetX = 0;
            this.imageOffsetY = 0;
            this.imageScale = 100;
            document.getElementById('imageOffsetX').value = 0;
            document.getElementById('imageOffsetY').value = 0;
            document.getElementById('imageScale').value = 100;
            this.updatePreview();
        });
        
        // Action buttons
        document.getElementById('updatePreview').addEventListener('click', () => {
            this.updatePreview();
        });
        
        document.getElementById('generatePinout').addEventListener('click', () => {
            this.generatePinout();
        });
        
        document.getElementById('saveTemplate').addEventListener('click', () => {
            this.saveTemplate();
        });
        
        document.getElementById('addPin').addEventListener('click', () => {
            this.addPin();
        });
    }
    
    toggleBackgroundOptions() {
        const imageUploadGroup = document.getElementById('imageUploadGroup');
        const imageUrlGroup = document.getElementById('imageUrlGroup');
        const imagePositionGroup = document.getElementById('imagePositionGroup');
        
        if (this.backgroundType === 'image') {
            imageUploadGroup.style.display = 'block';
            imageUrlGroup.style.display = 'block';
            imagePositionGroup.style.display = 'block';
        } else {
            imageUploadGroup.style.display = 'none';
            imageUrlGroup.style.display = 'none';
            imagePositionGroup.style.display = 'none';
        }
    }
    
    togglePinCountInputs() {
        const totalPinGroup = document.getElementById('totalPinGroup');
        const asymmetricPinGroup = document.getElementById('asymmetricPinGroup');
        
        if (this.symmetricPins) {
            totalPinGroup.style.display = 'block';
            asymmetricPinGroup.style.display = 'none';
        } else {
            totalPinGroup.style.display = 'none';
            asymmetricPinGroup.style.display = 'block';
        }
    }
    
    
    generateInitialPins() {
        this.pins = [];
        
        if (this.symmetricPins) {
            // Symmetric pins - use total pin count
            const pinCount = this.currentPinCount;
            const leftPinCount = Math.ceil(pinCount / 2);
            const rightPinCount = pinCount - leftPinCount;
            
            // Generate left pins (1 to leftPinCount)
            for (let i = 1; i <= leftPinCount; i++) {
                this.pins.push({
                    number: i,
                    name: `Pin${i}`,
                    type: 'gpio',
                    side: 'left'
                });
            }
            
            // Generate right pins (pinCount down to leftPinCount + 1) - reverse order
            for (let i = pinCount; i > leftPinCount; i--) {
                this.pins.push({
                    number: i,
                    name: `Pin${i}`,
                    type: 'gpio',
                    side: 'right'
                });
            }
        } else {
            // Asymmetric pins - use individual left and right counts
            // Generate left pins (1 to leftPinCount)
            for (let i = 1; i <= this.leftPinCount; i++) {
                this.pins.push({
                    number: i,
                    name: `Pin${i}`,
                    type: 'gpio',
                    side: 'left'
                });
            }
            
            // Generate right pins - descending order (highest number at top)
            const rightStartNumber = this.leftPinCount + this.rightPinCount;
            for (let i = rightStartNumber; i > this.leftPinCount; i--) {
                this.pins.push({
                    number: i,
                    name: `Pin${i}`,
                    type: 'gpio',
                    side: 'right'
                });
            }
        }
        
        this.renderPinList();
    }
    
    renderPinList() {
        const pinList = document.getElementById('pinList');
        pinList.innerHTML = '';
        
        this.pins.forEach((pin, index) => {
            const pinItem = document.createElement('div');
            pinItem.className = 'pin-item';
            pinItem.innerHTML = `
                <div class="pin-number">${pin.number}</div>
                <input type="text" class="pin-name-input" value="${pin.name}" 
                       data-index="${index}" placeholder="Pin name">
                <select class="pin-type-select" data-index="${index}">
                    ${Object.entries(this.pinTypes).map(([key, type]) => 
                        `<option value="${key}" ${pin.type === key ? 'selected' : ''}>${type.name}</option>`
                    ).join('')}
                </select>
                <button type="button" class="remove-pin" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            pinList.appendChild(pinItem);
        });
        
        // Add event listeners for pin inputs
        pinList.querySelectorAll('.pin-name-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.pins[index].name = e.target.value;
                this.updatePreview();
            });
        });
        
        pinList.querySelectorAll('.pin-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.pins[index].type = e.target.value;
                this.updatePreview();
            });
        });
        
        pinList.querySelectorAll('.remove-pin').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-pin').dataset.index);
                this.removePin(index);
            });
        });
    }
    
    addPin() {
        const newPinNumber = Math.max(...this.pins.map(p => p.number)) + 1;
        const side = this.pins.length % 2 === 0 ? 'left' : 'right';
        
        this.pins.push({
            number: newPinNumber,
            name: `Pin${newPinNumber}`,
            type: 'gpio',
            side: side
        });
        
        this.renderPinList();
        this.updatePreview();
    }
    
    removePin(index) {
        if (this.pins.length <= 2) {
            alert('Cannot remove pin. Minimum 2 pins required.');
            return;
        }
        
        this.pins.splice(index, 1);
        this.renderPinList();
        this.updatePreview();
    }
    
    updatePreview() {
        const previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = '';
        
        // Calculate total pin count
        const totalPinCount = this.symmetricPins ? this.currentPinCount : (this.leftPinCount + this.rightPinCount);
        
        // Calculate height based on the longer side (more pins)
        let maxSidePinCount;
        if (this.symmetricPins) {
            maxSidePinCount = Math.ceil(this.currentPinCount / 2);
        } else {
            maxSidePinCount = Math.max(this.leftPinCount, this.rightPinCount);
        }
        
        // Calculate dynamic chip height based on the longer side pin count
        // Base height: 400px for up to 14 pins per side, then scale up
        let chipHeight;
        if (maxSidePinCount <= 14) {
            chipHeight = 400;
        } else {
            // Scale up: 400px + (maxSidePinCount - 14) * 15px
            chipHeight = 400 + (maxSidePinCount - 14) * 15;
        }
        
        // Set CSS variables
        previewContainer.style.setProperty('--pin-count', totalPinCount);
        previewContainer.style.setProperty('--chip-height', `${chipHeight}px`);
        previewContainer.style.setProperty('--pin-spacing', `${chipHeight / (maxSidePinCount * 2)}px`);
        
        // Generate pinout structure
        this.generatePinoutStructure(previewContainer);
    }
    
    generatePinoutStructure(container) {
        const leftPins = this.pins.filter(pin => pin.side === 'left');
        const rightPins = this.pins.filter(pin => pin.side === 'right');
        
        // Create left pins column
        const leftColumn = document.createElement('div');
        leftColumn.className = 'pin-column left-pins';
        leftPins.forEach(pin => {
            const pinElement = this.createPinElement(pin);
            leftColumn.appendChild(pinElement);
        });
        
        // Create chip body
        const chipBody = this.createChipBody();
        
        // Create right pins column
        const rightColumn = document.createElement('div');
        rightColumn.className = 'pin-column right-pins';
        rightPins.forEach(pin => {
            const pinElement = this.createPinElement(pin);
            rightColumn.appendChild(pinElement);
        });
        
        // Create pin numbers
        const leftNumbers = this.createPinNumbers(leftPins, 'left');
        const rightNumbers = this.createPinNumbers(rightPins, 'right');
        
        chipBody.appendChild(leftNumbers);
        chipBody.appendChild(rightNumbers);
        
        // Assemble the diagram
        container.appendChild(leftColumn);
        container.appendChild(chipBody);
        container.appendChild(rightColumn);
    }
    
    createPinElement(pin) {
        const pinDiv = document.createElement('div');
        pinDiv.className = 'pin';
        pinDiv.dataset.pinNumber = pin.number;
        
        const label = document.createElement('div');
        label.className = `pin-label ${this.pinTypes[pin.type].class}`;
        label.textContent = pin.name;
        
        pinDiv.appendChild(label);
        return pinDiv;
    }
    
    createChipBody() {
        const chipBody = document.createElement('div');
        chipBody.className = 'chip-body';
        
        // Use both height and width for precise control
        // Convert mm to pixels (approximate: 1mm = 3.78px at 96 DPI)
        const mmToPx = 3.78;
        const width = this.boardWidth * mmToPx;
        chipBody.style.width = `${width}px`;
        
        // Apply background based on type
        if (this.backgroundType === 'image' && this.backgroundImage) {
            chipBody.style.backgroundImage = `url(${this.backgroundImage})`;
            chipBody.style.backgroundSize = `${this.imageScale}%`;
            chipBody.style.backgroundRepeat = 'no-repeat';
            chipBody.style.backgroundPosition = `calc(50% + ${this.imageOffsetX}px) calc(50% + ${this.imageOffsetY}px)`;
            chipBody.style.border = 'none';
        }
        
        return chipBody;
    }
    
    createPinNumbers(pins, side) {
        const numbersContainer = document.createElement('div');
        numbersContainer.className = `pin-numbers-${side}`;
        
        // Use the actual number of pins on this side for positioning
        const sidePinCount = pins.length;
        
        pins.forEach((pin, index) => {
            const pinNum = document.createElement('div');
            pinNum.className = 'pin-num';
            pinNum.textContent = pin.number;
            pinNum.style.color = this.pinNumberColor;
            
            // Calculate position based on the pin's position in the array
            const position = index + 1; // 1-based index
            const percentage = ((position * 2 - 1) / (sidePinCount * 2)) * 100;
            pinNum.style.top = `${percentage}%`;
            
            numbersContainer.appendChild(pinNum);
        });
        
        return numbersContainer;
    }
    
    generatePinout() {
        // Create a new page with the generated pinout
        const totalPinCount = this.symmetricPins ? this.currentPinCount : (this.leftPinCount + this.rightPinCount);
        
        const pinoutData = {
            chipName: this.chipName,
            pinCount: totalPinCount,
            leftPinCount: this.leftPinCount,
            rightPinCount: this.rightPinCount,
            symmetricPins: this.symmetricPins,
            boardHeight: this.boardHeight,
            boardWidth: this.boardWidth,
            backgroundType: this.backgroundType,
            backgroundImage: this.backgroundImage,
            imageOffsetX: this.imageOffsetX,
            imageOffsetY: this.imageOffsetY,
            imageScale: this.imageScale,
            pinNumberColor: this.pinNumberColor,
            pins: this.pins
        };
        
        // Generate HTML content
        const htmlContent = this.generatePinoutHTML(pinoutData);
        
        // Create and download the file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.chipName.toLowerCase().replace(/\s+/g, '-')}-pinout.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    generatePinoutHTML(data) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.chipName} Pinout - MicroPinouts</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="pinout-styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1><a href="index.html">MicroPinouts</a></h1>
            <nav>
                <a href="index.html">Home</a>
                <a href="pinout-creator.html">Pinout Creator</a>
            </nav>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            <div class="pinout-container">
                <div class="chip-diagram custom-pinout" id="chipDiagram">
                    <!-- Pinout will be generated by JavaScript -->
                </div>
                
                <div class="info-panel">
                    <h2>${data.chipName}</h2>
                    <div class="chip-info">
                        <div class="info-item">
                            <span class="label">Dimensions:</span>
                            <span class="value">${data.boardWidth}mm × ${data.boardHeight}mm</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Pin Configuration:</span>
                            <span class="value">${data.symmetricPins ? `${data.pinCount} pins (symmetric)` : `${data.leftPinCount}L + ${data.rightPinCount}R`}</span>
                        </div>
                    </div>
                </div>
                
                <div class="downloads-panel">
                    <h3>Downloads</h3>
                    <div class="download-buttons">
                        <button id="downloadPdf" class="btn btn-primary">
                            <i class="fas fa-file-pdf"></i> Pinout as PDF
                        </button>
                        <button id="downloadImage" class="btn btn-primary">
                            <i class="fas fa-image"></i> Pinout as Image (PNG)
                        </button>
                        <button id="datasheetLink" class="btn btn-secondary">
                            <i class="fas fa-external-link-alt"></i> Chip Datasheet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Generated pinout data
        const pinoutData = ${JSON.stringify(data, null, 2)};
        
        // Initialize the pinout
        document.addEventListener('DOMContentLoaded', function() {
            generateCustomPinout();
            setupDownloadButtons();
        });
        
        function generateCustomPinout() {
            const container = document.getElementById('chipDiagram');
            container.style.setProperty('--pin-count', pinoutData.pinCount);
            container.style.setProperty('--chip-height', '500px');
            container.style.setProperty('--pin-spacing', \`\${500 / pinoutData.pinCount}px\`);
            
            // Clear container
            container.innerHTML = '';
            
            // Separate left and right pins
            const leftPins = pinoutData.pins.filter(pin => pin.side === 'left');
            const rightPins = pinoutData.pins.filter(pin => pin.side === 'right');
            
            // Create left pins column
            const leftColumn = document.createElement('div');
            leftColumn.className = 'pin-column left-pins';
            leftPins.forEach(pin => {
                const pinElement = createPinElement(pin);
                leftColumn.appendChild(pinElement);
            });
            
            // Create chip body
            const chipBody = createChipBody();
            
            // Create right pins column
            const rightColumn = document.createElement('div');
            rightColumn.className = 'pin-column right-pins';
            rightPins.forEach(pin => {
                const pinElement = createPinElement(pin);
                rightColumn.appendChild(pinElement);
            });
            
            // Create pin numbers
            const leftNumbers = createPinNumbers(leftPins, 'left');
            const rightNumbers = createPinNumbers(rightPins, 'right');
            
            chipBody.appendChild(leftNumbers);
            chipBody.appendChild(rightNumbers);
            
            // Assemble the diagram
            container.appendChild(leftColumn);
            container.appendChild(chipBody);
            container.appendChild(rightColumn);
        }
        
        function createPinElement(pin) {
            const pinDiv = document.createElement('div');
            pinDiv.className = 'pin';
            pinDiv.dataset.pinNumber = pin.number;
            
            const label = document.createElement('div');
            label.className = \`pin-label pin-type-\${pin.type}\`;
            label.textContent = pin.name;
            
            pinDiv.appendChild(label);
            return pinDiv;
        }
        
        function createChipBody() {
            const chipBody = document.createElement('div');
            chipBody.className = 'chip-body';
            
            // Set width based on board width
            const mmToPx = 3.78;
            const width = pinoutData.boardWidth * mmToPx;
            chipBody.style.width = \`\${width}px\`;
            
            // Apply background
            if (pinoutData.backgroundType === 'image' && pinoutData.backgroundImage) {
                chipBody.style.backgroundImage = \`url(\${pinoutData.backgroundImage})\`;
                chipBody.style.backgroundSize = \`\${pinoutData.imageScale || 100}%\`;
                chipBody.style.backgroundRepeat = 'no-repeat';
                chipBody.style.backgroundPosition = \`calc(50% + \${pinoutData.imageOffsetX || 0}px) calc(50% + \${pinoutData.imageOffsetY || 0}px)\`;
                chipBody.style.border = 'none';
            }
            
            return chipBody;
        }
        
        function createPinNumbers(pins, side) {
            const numbersContainer = document.createElement('div');
            numbersContainer.className = \`pin-numbers-\${side}\`;
            
            const sidePinCount = pins.length;
            
            pins.forEach((pin, index) => {
                const pinNum = document.createElement('div');
                pinNum.className = 'pin-num';
                pinNum.textContent = pin.number;
                pinNum.style.color = pinoutData.pinNumberColor || '#2c3e50';
                
                const position = index + 1;
                const percentage = ((position * 2 - 1) / (sidePinCount * 2)) * 100;
                pinNum.style.top = \`\${percentage}%\`;
                
                numbersContainer.appendChild(pinNum);
            });
            
            return numbersContainer;
        }
        
        function setupDownloadButtons() {
            // Setup download functionality
            // ... (implementation details)
        }
    </script>
</body>
</html>`;
    }
    
    saveTemplate() {
        const template = {
            name: this.chipName,
            pinCount: this.currentPinCount,
            packageType: this.packageType,
            backgroundType: this.backgroundType,
            backgroundImage: this.backgroundImage,
            pins: this.pins,
            createdAt: new Date().toISOString()
        };
        
        const templateJson = JSON.stringify(template, null, 2);
        const blob = new Blob([templateJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.chipName.toLowerCase().replace(/\s+/g, '-')}-template.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the pinout creator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new PinoutCreator();
});
