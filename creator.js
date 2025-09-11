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
        this.imageScaleX = 300;
        this.imageScaleY = 300;
        this.pinNumberColor = '#2c3e50';
        this.pageTitle = 'Custom Pinout Diagram';
        this.metaDescription = '';
        this.pageContent = '';
        this.quill = null;
        
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
        this.initializeRichTextEditor();
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
        
        document.getElementById('imageScaleX').addEventListener('input', (e) => {
            this.imageScaleX = parseInt(e.target.value) || 300;
            this.updatePreview();
        });
        
        document.getElementById('imageScaleY').addEventListener('input', (e) => {
            this.imageScaleY = parseInt(e.target.value) || 300;
            this.updatePreview();
        });
        
        document.getElementById('resetImagePosition').addEventListener('click', () => {
            this.imageOffsetX = 0;
            this.imageOffsetY = 0;
            document.getElementById('imageOffsetX').value = 0;
            document.getElementById('imageOffsetY').value = 0;
            this.updatePreview();
        });
        
        document.getElementById('resetImageScale').addEventListener('click', () => {
            this.imageScaleX = 300;
            this.imageScaleY = 300;
            document.getElementById('imageScaleX').value = 300;
            document.getElementById('imageScaleY').value = 300;
            this.updatePreview();
        });
        
        // Action buttons
        document.getElementById('updatePreview').addEventListener('click', () => {
            this.updatePreview();
        });
        
        document.getElementById('publishPinout').addEventListener('click', () => {
            this.publishPinout();
        });
        
        document.getElementById('downloadSVG').addEventListener('click', () => {
            this.downloadAsSVG();
        });
        
        document.getElementById('saveTemplate').addEventListener('click', () => {
            this.saveTemplate();
        });
        
        document.getElementById('addPin').addEventListener('click', () => {
            this.addPin();
        });
        
        // SEO content
        document.getElementById('pageTitle').addEventListener('input', (e) => {
            this.pageTitle = e.target.value;
        });
        
        document.getElementById('metaDescription').addEventListener('input', (e) => {
            this.metaDescription = e.target.value;
        });
    }
    
    initializeRichTextEditor() {
        // Initialize Quill editor
        this.quill = new Quill('#richTextEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                ]
            },
            placeholder: 'Write your pinout page content here...'
        });
        
        // Listen for text changes
        this.quill.on('text-change', () => {
            this.pageContent = this.quill.root.innerHTML;
        });
        
        // Set initial content
        this.quill.root.innerHTML = '<p>This pinout diagram shows the complete pin configuration for the <strong>' + this.chipName + '</strong> microcontroller.</p><p>Use this diagram to understand pin functions, voltage levels, and connections for your projects.</p>';
        this.pageContent = this.quill.root.innerHTML;
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
        chipHeight = Math.round(chipHeight);
        
        // Calculate pin spacing with rounding and minimum
        const spacing = Math.max(12, Math.round(chipHeight / (maxSidePinCount * 2)));
        
        // Set CSS variables
        previewContainer.style.setProperty('--pin-count', totalPinCount);
        previewContainer.style.setProperty('--chip-height', `${chipHeight}px`);
        previewContainer.style.setProperty('--pin-spacing', `${spacing}px`);
        
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
        
        // Use exact 96 dpi conversion, then round
        const PX_PER_MM = 96 / 25.4; // 3.779527559...
        const widthPx = Math.round(this.boardWidth * PX_PER_MM);
        chipBody.style.width = `${widthPx}px`;
        
        // Apply background based on type
        if (this.backgroundType === 'image' && this.backgroundImage) {
            chipBody.style.backgroundImage = `url(${this.backgroundImage})`;
            chipBody.style.backgroundSize = `${this.imageScaleX}px ${this.imageScaleY}px`;
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
    
    publishPinout() {
        // Create and open a new page with the generated pinout
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
            imageScaleX: this.imageScaleX,
            imageScaleY: this.imageScaleY,
            pinNumberColor: this.pinNumberColor,
            pageTitle: this.pageTitle,
            metaDescription: this.metaDescription,
            pageContent: this.pageContent,
            pins: this.pins
        };
        
        // Convert preview to SVG for perfect consistency
        const svg = this.convertToSVG();
        if (!svg) {
            console.error('convertToSVG returned null');
            alert('Error: Could not generate SVG from preview. Check console for details.');
            return;
        }
        
        // Generate HTML content with embedded SVG
        const htmlContent = this.generatePinoutHTML(pinoutData, svg);
        
        // Open the generated page in a new tab
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        
        // Clean up the URL after a short delay to allow the page to load
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }
    
    getEmbeddedCSS() {
        // This will be populated with the actual CSS content
        // For now, return a placeholder that will be replaced
        return `
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Header */
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 20px;
        }

        .logo h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d3748;
            text-decoration: none;
        }

        .logo a {
            text-decoration: none;
            color: inherit;
        }

        .nav {
            display: flex;
            gap: 2rem;
        }

        .nav-link {
            color: #4a5568;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
            color: #667eea;
        }

        /* Main content */
        .main {
            margin-top: 2rem;
        }

        /* Content grid layout */
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        /* Left column - pinout and content */
        .left-column {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        /* Right column - info panels */
        .right-column {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        /* Right side panels */
        .info-panel,
        .specs-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        /* Pinout section */
        .pinout-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .section-header {
            margin-bottom: 2rem;
            text-align: center;
        }

        .section-header h2 {
            color: #2d3748;
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
        }

        .section-subtitle {
            color: #718096;
            font-size: 1rem;
            margin: 0;
        }

        .chip-diagram {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0;
            margin-bottom: 2rem;
            min-height: 400px;
        }

        .pin-column {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: var(--chip-height, 400px);
            padding: 8px 0;
        }

        .custom-pinout .pin {
            margin: 0;
            position: relative;
            display: flex;
            align-items: center;
            overflow: visible;
            flex: 1;
        }

        .pin-label {
            font-size: 14px;     /* px, not rem */
            line-height: 14px;   /* lock line-height */
            white-space: nowrap; /* no wrapping that changes row height */
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 600;
            color: white;
            text-align: center;
            min-width: 80px;
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
        }

        .pin-label:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .pin-label.selected {
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
        }

        .left-pins .pin-label {
            right: 10px; /* Position closer to the gray pin rectangle */
            text-align: right;
        }

        .right-pins .pin-label {
            left: 10px; /* Position closer to the gray pin rectangle */
            text-align: left;
        }


        .left-pins .pin::before {
            content: '';
            position: absolute;
            width: 20px;
            height: 8px;
            background: #7f8c8d;
            border-radius: 2px;
            right: -4px;
        }

        .right-pins .pin::before {
            content: '';
            position: absolute;
            width: 20px;
            height: 8px;
            background: #7f8c8d;
            border-radius: 2px;
            left: -4px;
        }

        .custom-pinout .chip-body {
            height: var(--chip-height, 400px);
            width: 200px;
            background: #ecf0f1;
            border: 2px solid #bdc3c7;
            border-radius: 8px;
            position: relative;
        }

        .custom-pinout .chip-body::before,
        .custom-pinout .chip-body::after {
            display: none;
        }

        .pin-numbers-left,
        .pin-numbers-right {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
        }

        .pin-numbers-left {
            left: 5px;
        }

        .pin-numbers-right {
            right: 5px;
        }

        .custom-pinout .pin-num {
            position: absolute;
            font-size: 12px;
            font-weight: bold;
            color: #2c3e50;
            transform: translateY(-50%);
        }

        .custom-pinout .pin::before {
            content: '';
            position: absolute;
            width: 20px;
            height: 8px;
            background: #7f8c8d;
            border-radius: 2px;
        }

        .left-pins .pin::before {
            right: -4px;
        }

        .right-pins .pin::before {
            left: -4px;
        }

        /* Pin type colors */
        .pin-type-power { background: #e74c3c; }
        .pin-type-gnd { background: #2c3e50; }
        .pin-type-gpio { background: #27ae60; }
        .pin-type-data { background: #3498db; }
        .pin-type-clock { background: #9b59b6; }
        .pin-type-analog { background: #f39c12; }
        .pin-type-special { background: #e67e22; }
        .pin-type-other { background: #95a5a6; }

        .pin-details h3 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }

        .pin-placeholder {
            color: #718096;
            font-style: italic;
            margin: 0;
        }

        .chip-specs h3 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }

        .spec-grid {
            display: grid;
            gap: 0.75rem;
        }

        .spec-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .spec-item:last-child {
            border-bottom: none;
        }

        .spec-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 0.9rem;
        }

        .spec-value {
            color: #2d3748;
            font-size: 0.9rem;
            text-align: right;
        }

        /* Downloads section */
        .downloads-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .downloads-section h3 {
            color: #2d3748;
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
            text-align: center;
        }

        .download-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: #718096;
            color: white;
        }

        .btn-secondary:hover {
            background: #4a5568;
            transform: translateY(-2px);
        }

        /* Content section */
        .content-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .content-wrapper {
            line-height: 1.8;
        }

        .content-wrapper h1,
        .content-wrapper h2,
        .content-wrapper h3 {
            color: #2d3748;
            margin: 1.5rem 0 1rem 0;
        }

        .content-wrapper h1 {
            font-size: 2rem;
            border-bottom: 2px solid #667eea;
            padding-bottom: 0.5rem;
        }

        .content-wrapper h2 {
            font-size: 1.5rem;
            color: #4a5568;
        }

        .content-wrapper h3 {
            font-size: 1.25rem;
            color: #718096;
        }

        .content-wrapper p {
            margin-bottom: 1rem;
            color: #4a5568;
        }

        .content-wrapper ul,
        .content-wrapper ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }

        .content-wrapper li {
            margin-bottom: 0.5rem;
            color: #4a5568;
        }

        .content-wrapper a {
            color: #667eea;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-bottom-color 0.3s ease;
        }

        .content-wrapper a:hover {
            border-bottom-color: #667eea;
        }

        /* Footer */
        .footer {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            margin-top: 3rem;
            padding: 2rem 0;
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .content-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .left-column,
            .right-column {
                gap: 1.5rem;
            }

            .chip-diagram {
                flex-direction: column;
                gap: 2rem;
            }

            .pin-column {
                min-height: auto;
            }

            .download-buttons {
                flex-direction: column;
                align-items: center;
            }

            .nav {
                gap: 1rem;
            }

            .section-header h2 {
                font-size: 1.5rem;
            }

            .section-subtitle {
                font-size: 0.9rem;
            }
        }
        `;
    }

    getEmbeddedJS() {
        return `
        function generateCustomPinout() {
            const container = document.getElementById('chipDiagram');
            
            // Calculate dynamic chip height based on pin count
            let maxSidePinCount;
            if (pinoutData.symmetricPins) {
                maxSidePinCount = Math.ceil(pinoutData.pinCount / 2);
            } else {
                maxSidePinCount = Math.max(pinoutData.leftPinCount, pinoutData.rightPinCount);
            }
            
            let chipHeight;
            if (maxSidePinCount <= 14) {
                chipHeight = 400;
            } else {
                chipHeight = 400 + (maxSidePinCount - 14) * 15;
            }
            chipHeight = Math.round(chipHeight);
            
            // Calculate pin spacing with rounding and minimum
            const spacing = Math.max(12, Math.round(chipHeight / (maxSidePinCount * 2)));
            
            container.style.setProperty('--pin-count', pinoutData.pinCount);
            container.style.setProperty('--chip-height', \`\${chipHeight}px\`);
            container.style.setProperty('--pin-spacing', \`\${spacing}px\`);
            
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
            
            // Add click event for pin selection
            label.addEventListener('click', () => {
                selectPin(pinDiv, pin);
            });
            
            // Add hover effects
            label.addEventListener('mouseenter', () => {
                label.classList.add('selected');
            });
            
            label.addEventListener('mouseleave', () => {
                label.classList.remove('selected');
            });
            
            pinDiv.appendChild(label);
            return pinDiv;
        }
        
        function createChipBody() {
            const chipBody = document.createElement('div');
            chipBody.className = 'chip-body';
            
            // Use exact 96 dpi conversion, then round
            const PX_PER_MM = 96 / 25.4; // 3.779527559...
            const widthPx = Math.round(pinoutData.boardWidth * PX_PER_MM);
            chipBody.style.width = \`\${widthPx}px\`;
            
            // Apply background
            if (pinoutData.backgroundType === 'image' && pinoutData.backgroundImage) {
                chipBody.style.backgroundImage = \`url(\${pinoutData.backgroundImage})\`;
                chipBody.style.backgroundSize = \`\${pinoutData.imageScaleX || 300}px \${pinoutData.imageScaleY || 300}px\`;
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
        
        function selectPin(pinElement, pin) {
            // Remove previous selection
            document.querySelectorAll('.pin-label').forEach(label => {
                label.classList.remove('selected');
            });
            
            // Add selection to current pin
            const label = pinElement.querySelector('.pin-label');
            label.classList.add('selected');
            
            // Update info panel (if exists)
            updateInfoPanel(pin);
        }
        
        function updateInfoPanel(pin) {
            console.log('updateInfoPanel called with:', pin);
            const pinDetails = document.getElementById('pinDetails');
            if (!pinDetails) {
                console.error('pinDetails element not found');
                return;
            }
            
            // Update pin information
            pinDetails.innerHTML = \`
                <h3>Pin Information</h3>
                <div class="spec-grid">
                    <div class="spec-item">
                        <span class="spec-label">Pin Number:</span>
                        <span class="spec-value">\${pin.number}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Pin Name:</span>
                        <span class="spec-value">\${pin.name}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Type:</span>
                        <span class="spec-value">\${getPinTypeName(pin.type)}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Side:</span>
                        <span class="spec-value">\${pin.side === 'left' ? 'Left' : 'Right'}</span>
                    </div>
                </div>
            \`;
        }
        
        function getPinTypeName(type) {
            const types = {
                'power': 'Power',
                'gnd': 'GND',
                'gpio': 'GPIO',
                'data': 'Data',
                'clock': 'Clock',
                'analog': 'Analog',
                'special': 'Special',
                'other': 'Other'
            };
            return types[type] || 'Unknown';
        }
        
        function setupDownloadButtons() {
            // PDF Download
            const pdfButton = document.getElementById('downloadPdf');
            if (pdfButton) {
                pdfButton.addEventListener('click', downloadAsPDF);
            }
            
            // Image Download
            const imageButton = document.getElementById('downloadImage');
            if (imageButton) {
                imageButton.addEventListener('click', downloadAsImage);
            }
            
            // SVG Download
            const svgButton = document.getElementById('downloadSVG');
            if (svgButton) {
                svgButton.addEventListener('click', downloadAsSVG);
            }
            
            // Datasheet Link
            const datasheetButton = document.getElementById('datasheetLink');
            if (datasheetButton) {
                datasheetButton.addEventListener('click', () => {
                    alert('Datasheet link would open here');
                });
            }
        }
        
        function downloadAsPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.text(pinoutData.chipName + ' Pinout Diagram', 20, 20);
            
            // Add pinout diagram as image
            const pinoutSection = document.querySelector('.pinout-section');
            html2canvas(pinoutSection).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 170;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                doc.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
                
                // Add specifications
                let yPosition = imgHeight + 60;
                doc.setFontSize(14);
                doc.text('Specifications:', 20, yPosition);
                yPosition += 10;
                
                doc.setFontSize(10);
                doc.text(\`Pin Count: \${pinoutData.pinCount}\`, 20, yPosition);
                yPosition += 8;
                doc.text(\`Dimensions: \${pinoutData.boardWidth}mm × \${pinoutData.boardHeight}mm\`, 20, yPosition);
                yPosition += 8;
                doc.text(\`Configuration: \${pinoutData.symmetricPins ? 'Symmetric' : 'Asymmetric'}\`, 20, yPosition);
                
                // Save the PDF
                doc.save(\`\${pinoutData.chipName.toLowerCase().replace(/\\s+/g, '-')}-pinout.pdf\`);
            });
        }
        
        function downloadAsImage() {
            const pinoutSection = document.querySelector('.pinout-section');
            html2canvas(pinoutSection).then(canvas => {
                const link = document.createElement('a');
                link.download = \`\${pinoutData.chipName.toLowerCase().replace(/\\s+/g, '-')}-pinout.png\`;
                link.href = canvas.toDataURL();
                link.click();
            });
        }
        
        function downloadAsSVG() {
            const svg = document.querySelector('#chipDiagram svg');
            if (!svg) {
                alert('No SVG found to download');
                return;
            }
            
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = \`\${pinoutData.chipName.toLowerCase().replace(/\\s+/g, '-')}-pinout.svg\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        `;
    }

    generatePinoutHTML(data, svg = null) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.pageTitle || data.chipName + ' Pinout - MicroPinouts'}</title>
    <meta name="description" content="${data.metaDescription || 'Complete pinout diagram for ' + data.chipName + ' microcontroller with detailed pin information and specifications.'}">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        /* Embedded CSS for standalone page */
        ${this.getEmbeddedCSS()}
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <h1 class="logo">
                    <a href="index.html">MicroPinouts</a>
                </h1>
                <nav class="nav">
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="pinout-creator.html" class="nav-link">Pinout Creator</a>
                </nav>
            </div>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div class="content-grid">
                <div class="left-column">
                    <div class="pinout-section">
                        <div class="section-header">
                            <h2>${data.chipName}</h2>
                            <p class="section-subtitle">${data.symmetricPins ? `${data.pinCount} pins (symmetric)` : `${data.leftPinCount}L + ${data.rightPinCount}R pins`} - ${data.boardWidth}mm × ${data.boardHeight}mm</p>
                        </div>
                        
                        <div class="chip-diagram custom-pinout" id="chipDiagram">
                            ${svg ? new XMLSerializer().serializeToString(svg) : '<!-- Pinout will be generated by JavaScript -->'}
                        </div>
                    </div>
                    
                    <!-- Page Content -->
                    <div class="content-section">
                        <div class="content-wrapper">
                            ${data.pageContent || ''}
                        </div>
                    </div>
                </div>

                <div class="right-column">
                    <div class="info-panel">
                        <div class="pin-details" id="pinDetails">
                            <h3>Pin Information</h3>
                            <p class="pin-placeholder">Click on a pin to view details</p>
                        </div>
                    </div>

                    <div class="specs-panel">
                        <div class="chip-specs">
                            <h3>Specifications</h3>
                            <div class="spec-grid">
                                <div class="spec-item">
                                    <span class="spec-label">Dimensions:</span>
                                    <span class="spec-value">${data.boardWidth}mm × ${data.boardHeight}mm</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Pin Configuration:</span>
                                    <span class="spec-value">${data.symmetricPins ? `${data.pinCount} pins (symmetric)` : `${data.leftPinCount}L + ${data.rightPinCount}R`}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Background:</span>
                                    <span class="spec-value">${data.backgroundType === 'image' ? 'Custom Image' : 'Default'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Pin Count:</span>
                                    <span class="spec-value">${data.pinCount} total</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Downloads Section -->
                    <div class="downloads-section">
                        <h3>Downloads</h3>
                        <div class="download-buttons">
                            <button id="downloadPdf" class="btn btn-primary">
                                <i class="fas fa-file-pdf"></i> Pinout as PDF
                            </button>
                            <button id="downloadImage" class="btn btn-primary">
                                <i class="fas fa-image"></i> Pinout as Image (PNG)
                            </button>
                            <button id="downloadSVG" class="btn btn-info">
                                <i class="fas fa-download"></i> Pinout as SVG
                            </button>
                            <button id="datasheetLink" class="btn btn-secondary">
                                <i class="fas fa-external-link-alt"></i> Chip Datasheet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 MicroPinouts. Interactive microcontroller pinout reference.</p>
        </div>
    </footer>

    <script>
        // Generated pinout data
        const pinoutData = ${JSON.stringify(data, null, 2)};
        
        // Initialize the pinout
        document.addEventListener('DOMContentLoaded', function() {
            // Check if SVG is already embedded
            const chipDiagram = document.getElementById('chipDiagram');
            if (chipDiagram && chipDiagram.innerHTML.includes('<svg')) {
                // SVG is already embedded, just set up event listeners
                setupSVGEventListeners();
            } else {
                // Generate pinout dynamically
                generateCustomPinout();
            }
            setupDownloadButtons();
        });
        
        function setupSVGEventListeners() {
            // Set up event listeners for SVG elements
            const svg = document.querySelector('#chipDiagram svg');
            if (!svg) {
                console.error('No SVG found in chipDiagram');
                return;
            }
            
            console.log('Setting up SVG event listeners');
            
            // Add click listeners directly to SVG elements
            const pinLabels = svg.querySelectorAll('.pin-label-bg, .pin-label-text, .pin-num-text');
            pinLabels.forEach((element, index) => {
                element.addEventListener('click', function(e) {
                    console.log('SVG element clicked:', element);
                    
                    // Remove previous selection
                    svg.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
                    
                    // Add selection to clicked elements
                    element.classList.add('selected');
                    
                    // Find all elements with the same data-pin-index
                    const pinIndex = element.getAttribute('data-pin-index');
                    if (pinIndex !== null) {
                        svg.querySelectorAll(\`[data-pin-index="\${pinIndex}"]\`).forEach(el => {
                            el.classList.add('selected');
                        });
                        
                        // Find the pin data
                        const pinName = element.textContent || element.querySelector('text')?.textContent;
                        console.log('Looking for pin:', pinName);
                        const pin = pinoutData.pins.find(p => p.name === pinName);
                        if (pin) {
                            console.log('Found pin data:', pin);
                            updateInfoPanel(pin);
                        } else {
                            console.error('Pin not found:', pinName);
                        }
                    }
                });
            });
        }
        
        ${this.getEmbeddedJS()}
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

    // Convert HTML pinout to interactive SVG
    convertToSVG() {
        // Try to find the pinout container (works for both creator and published pages)
        const pinoutContainer = document.querySelector('.pinout-container') || document.querySelector('#previewContainer');
        if (!pinoutContainer) {
            console.error('No pinout container found');
            return null;
        }
        
        console.log('Found pinout container:', pinoutContainer);

        // Check if there are any pins in the container
        const pins = pinoutContainer.querySelectorAll('.pin');
        if (pins.length === 0) {
            console.error('No pins found in container');
            return null;
        }
        
        console.log('Found', pins.length, 'pins');

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
                const imageUrl = bgImage.slice(5, -2); // Remove 'url("' and '")'
                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttribute('href', imageUrl);
                image.setAttribute('x', chipRect.left - containerRect.left);
                image.setAttribute('y', chipRect.top - containerRect.top);
                image.setAttribute('width', chipRect.width);
                image.setAttribute('height', chipRect.height);
                image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
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

            // Note: Event listeners will be added after SVG is embedded in the page
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

    // Download as SVG
    downloadAsSVG() {
        const svg = this.convertToSVG();
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pinout.svg';
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
