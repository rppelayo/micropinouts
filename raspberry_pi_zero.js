// Raspberry Pi Zero pinout data
const raspberryPiZeroData = {
    pins: {
        // GPIO pins (2-27)
        1: { name: '3V3', description: '3.3V Power Supply', functions: ['Power'], type: 'power', voltage: '3.3V', x: null, y: null },
        2: { name: '5V', description: '5V Power Supply', functions: ['Power'], type: 'power', voltage: '5V', x: null, y: null },
        3: { name: 'GPIO2', description: 'GPIO 2 - SDA (I2C)', functions: ['GPIO', 'I2C SDA'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        4: { name: '5V', description: '5V Power Supply', functions: ['Power'], type: 'power', voltage: '5V', x: null, y: null },
        5: { name: 'GPIO3', description: 'GPIO 3 - SCL (I2C)', functions: ['GPIO', 'I2C SCL'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        6: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        7: { name: 'GPIO4', description: 'GPIO 4', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        8: { name: 'GPIO14', description: 'GPIO 14 - TXD (UART)', functions: ['GPIO', 'UART TX'], type: 'output', voltage: '3.3V', x: null, y: null },
        9: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        10: { name: 'GPIO15', description: 'GPIO 15 - RXD (UART)', functions: ['GPIO', 'UART RX'], type: 'input', voltage: '3.3V', x: null, y: null },
        11: { name: 'GPIO17', description: 'GPIO 17', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        12: { name: 'GPIO18', description: 'GPIO 18 - PWM', functions: ['GPIO', 'PWM'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        13: { name: 'GPIO27', description: 'GPIO 27', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        14: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        15: { name: 'GPIO22', description: 'GPIO 22', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        16: { name: 'GPIO23', description: 'GPIO 23', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        17: { name: '3V3', description: '3.3V Power Supply', functions: ['Power'], type: 'power', voltage: '3.3V', x: null, y: null },
        18: { name: 'GPIO24', description: 'GPIO 24', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        19: { name: 'GPIO10', description: 'GPIO 10 - MOSI (SPI)', functions: ['GPIO', 'SPI MOSI'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        20: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        21: { name: 'GPIO9', description: 'GPIO 9 - MISO (SPI)', functions: ['GPIO', 'SPI MISO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        22: { name: 'GPIO25', description: 'GPIO 25', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        23: { name: 'GPIO11', description: 'GPIO 11 - SCLK (SPI)', functions: ['GPIO', 'SPI SCLK'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        24: { name: 'GPIO8', description: 'GPIO 8 - CE0 (SPI)', functions: ['GPIO', 'SPI CE0'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        25: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        26: { name: 'GPIO7', description: 'GPIO 7 - CE1 (SPI)', functions: ['GPIO', 'SPI CE1'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        27: { name: 'ID_SD', description: 'ID EEPROM Data', functions: ['ID EEPROM'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        28: { name: 'ID_SC', description: 'ID EEPROM Clock', functions: ['ID EEPROM'], type: 'output', voltage: '3.3V', x: null, y: null },
        29: { name: 'GPIO5', description: 'GPIO 5', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        30: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        31: { name: 'GPIO6', description: 'GPIO 6', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        32: { name: 'GPIO12', description: 'GPIO 12 - PWM', functions: ['GPIO', 'PWM'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        33: { name: 'GPIO13', description: 'GPIO 13 - PWM', functions: ['GPIO', 'PWM'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        34: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        35: { name: 'GPIO19', description: 'GPIO 19 - PWM', functions: ['GPIO', 'PWM'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        36: { name: 'GPIO16', description: 'GPIO 16', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        37: { name: 'GPIO26', description: 'GPIO 26', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        38: { name: 'GPIO20', description: 'GPIO 20', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null },
        39: { name: 'GND', description: 'Ground', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        40: { name: 'GPIO21', description: 'GPIO 21', functions: ['GPIO'], type: 'bidirectional', voltage: '3.3V', x: null, y: null }
    }
};

// Initialize pin positions
for (const k of Object.keys(raspberryPiZeroData.pins)) {
    raspberryPiZeroData.pins[k].x = null;
    raspberryPiZeroData.pins[k].y = null;
}

// Connector to pin number mapping for Raspberry Pi Zero
// Zigzag pattern: connector0pin = bottom-left, connector1pin = top-left, connector2pin = bottom-2nd column, etc.
const connectorToPinNumber = {
    // Column 1 (leftmost)
    'connector0pin': 1,   // 3V3 (bottom)
    'connector1pin': 2,   // 5V (top)
    
    // Column 2
    'connector2pin': 3,   // GPIO2 (bottom)
    'connector3pin': 4,   // 5V (top)
    
    // Column 3
    'connector4pin': 5,   // GPIO3 (bottom)
    'connector5pin': 6,   // GND (top)
    
    // Column 4
    'connector6pin': 7,   // GPIO4 (bottom)
    'connector7pin': 8,   // GPIO14 (top)
    
    // Column 5
    'connector8pin': 9,   // GND (bottom)
    'connector9pin': 10,  // GPIO15 (top)
    
    // Column 6
    'connector10pin': 11, // GPIO17 (bottom)
    'connector11pin': 12, // GPIO18 (top)
    
    // Column 7
    'connector12pin': 13, // GPIO27 (bottom)
    'connector13pin': 14, // GND (top)
    
    // Column 8
    'connector14pin': 15, // GPIO22 (bottom)
    'connector15pin': 16, // GPIO23 (top)
    
    // Column 9
    'connector16pin': 17, // 3V3 (bottom)
    'connector17pin': 18, // GPIO24 (top)
    
    // Column 10
    'connector18pin': 19, // GPIO10 (bottom)
    'connector19pin': 20, // GND (top)
    
    // Column 11
    'connector20pin': 21, // GPIO9 (bottom)
    'connector21pin': 22, // GPIO25 (top)
    
    // Column 12
    'connector22pin': 23, // GPIO11 (bottom)
    'connector23pin': 24, // GPIO8 (top)
    
    // Column 13
    'connector24pin': 25, // GND (bottom)
    'connector25pin': 26, // GPIO7 (top)
    
    // Column 14
    'connector26pin': 27, // ID_SD (bottom)
    'connector27pin': 28, // ID_SC (top)
    
    // Column 15
    'connector28pin': 29, // GPIO5 (bottom)
    'connector29pin': 30, // GND (top)
    
    // Column 16
    'connector30pin': 31, // GPIO6 (bottom)
    'connector31pin': 32, // GPIO12 (top)
    
    // Column 17
    'connector32pin': 33, // GPIO13 (bottom)
    'connector33pin': 34, // GND (top)
    
    // Column 18
    'connector34pin': 35, // GPIO19 (bottom)
    'connector35pin': 36, // GPIO16 (top)
    
    // Column 19
    'connector36pin': 37, // GPIO26 (bottom)
    'connector37pin': 38, // GPIO20 (top)
    
    // Column 20 (rightmost)
    'connector38pin': 39, // GND (bottom)
    'connector39pin': 40  // GPIO21 (top)
};

// Global variables
let snap, labelsGroup, showLines = true;
let currentFilter = 'all';

// Get pin color based on pin name/type
function getPinColor(pinName) {
    if (pinName.includes('GPIO')) {
        return '#00FF00'; // Green for GPIO
    } else if (pinName === '3V3') {
        return '#FF6600'; // Orange for 3.3V
    } else if (pinName === '5V') {
        return '#FF0000'; // Red for 5V
    } else if (pinName === 'GND') {
        return '#000000'; // Black for GND
    } else if (pinName.includes('ID_')) {
        return '#800080'; // Purple for ID pins
    } else {
        return '#0066CC'; // Blue for other pins
    }
}

// Get display pin name based on current filter
function getDisplayPinName(pinNumber, filter) {
    const pin = raspberryPiZeroData.pins[pinNumber];
    if (!pin) return pin.name;
    
    const functions = pin.functions.map(f => f.toLowerCase());
    
    switch (filter) {
        case 'all':
            return pin.name;
        case 'spi':
            if (functions.includes('spi mosi')) return 'MOSI';
            if (functions.includes('spi miso')) return 'MISO';
            if (functions.includes('spi sclk')) return 'SCLK';
            if (functions.includes('spi ce0')) return 'CE0';
            if (functions.includes('spi ce1')) return 'CE1';
            return pin.name;
        case 'i2c':
            if (functions.includes('i2c sda')) return 'SDA';
            if (functions.includes('i2c scl')) return 'SCL';
            return pin.name;
        case 'uart':
            if (functions.includes('uart tx')) return 'TXD';
            if (functions.includes('uart rx')) return 'RXD';
            return pin.name;
        case 'pwm':
            if (functions.includes('pwm')) return pin.name;
            return pin.name;
        case 'camera':
            if (functions.includes('camera')) return pin.name;
            return pin.name;
        default:
            return pin.name;
    }
}

// Check if pin matches current filter
function pinMatchesFilter(pinNumber, filter) {
    const pin = raspberryPiZeroData.pins[pinNumber];
    if (!pin) return false;
    
    const functions = pin.functions.map(f => f.toLowerCase());
    
    switch (filter) {
        case 'all':
            return true;
        case 'gpio':
            return functions.includes('gpio');
        case 'power':
            return functions.includes('power');
        case 'spi':
            return functions.some(f => f.includes('spi'));
        case 'i2c':
            return functions.some(f => f.includes('i2c'));
        case 'uart':
            return functions.some(f => f.includes('uart'));
        case 'pwm':
            return functions.includes('pwm');
        case 'camera':
            return functions.includes('camera');
        default:
            return true;
    }
}

// Filter pins based on current filter
function filterPins() {
    Object.keys(raspberryPiZeroData.pins).forEach(pinNumber => {
        const pin = raspberryPiZeroData.pins[pinNumber];
        if (pin.x == null || pin.y == null) return;
        
        const shouldShow = pinMatchesFilter(pinNumber, currentFilter);
        
        // Find the label group for this pin
        const labelGroup = labelsGroup.select(`[data-pin="${pinNumber}"]`);
        if (labelGroup) {
            labelGroup.attr({ opacity: shouldShow ? 1 : 0 });
            
            // Update text content based on current filter
            if (shouldShow) {
                const displayName = getDisplayPinName(pinNumber, currentFilter);
                const textElement = labelGroup.select('text');
                if (textElement) {
                    textElement.attr({ text: displayName });
                }
            }
        }
        
        // Find the line for this pin
        // Lines are no longer used - pin rectangles provide visual representation
    });
    
    // Filter applied successfully
}

// Setup filter button event listeners
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update current filter
            currentFilter = button.getAttribute('data-filter');
            
            // Apply filter
            filterPins();
        });
    });
    
    // Filter buttons setup complete
}

// Normalize the root SVG for proper scaling
function normalizeRootSvg(rootSvg) {
    // Let the SVG scale to its container
    rootSvg.removeAttribute('width');
    rootSvg.removeAttribute('height');
    rootSvg.setAttribute('width', '100%');
    rootSvg.setAttribute('height', '100%');
    rootSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // If there is a tight board group, use its bbox for a tight viewBox
    const boardGroup = rootSvg.querySelector('#breadboard') ||
                      rootSvg.querySelector('g[id*="board"]') ||
                      rootSvg.querySelector('g[id*="layer"]');

    // Compute a sane viewBox
    if (!rootSvg.hasAttribute('viewBox')) {
        const bb = (boardGroup || rootSvg).getBBox();
        rootSvg.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
    }

    // If the SVG already has a viewBox but it's huge, tighten it to the board group
    if (boardGroup) {
        const bb = boardGroup.getBBox();
        rootSvg.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
    }
}

// Get board metrics from SVG
function getBoardMetrics(rootSvg) {
    const [x, y, w, h] = rootSvg.getAttribute('viewBox').split(/\s+/).map(parseFloat);
    return { x, y, w, h, midX: x + w/2, midY: y + h/2 };
}

// Extract pin centers from SVG
function extractPinCenters(rootSvg) {
    const centers = {};
    
    // Find all elements with the connector pattern that are on the board
    const allConnectors = rootSvg.querySelectorAll('[id^="connector"][id$="pin"]');
    const boardBBox = rootSvg.querySelector('#breadboard')?.getBBox() || { x: 0, y: 0, width: 100, height: 100 };
    
    // Filter to only include connectors that are actually on the Raspberry Pi board
    const pinNodes = Array.from(allConnectors).filter(connector => {
        const bbox = connector.getBBox();
        const centerX = bbox.x + bbox.width/2;
        const centerY = bbox.y + bbox.height/2;
        
        // Check if this connector is within the Raspberry Pi board area
        const isOnBoard = centerX >= boardBBox.x && centerX <= boardBBox.x + boardBBox.width &&
                         centerY >= boardBBox.y && centerY <= boardBBox.y + boardBBox.height;
        
        return isOnBoard;
    });
    
    // Process found pin nodes
    pinNodes.forEach(node => {
        const id = node.getAttribute('id');
        // Check if this ID is in our mapping
        const pinNumber = connectorToPinNumber[id];
        
        if (pinNumber) {
            // Get the center position using the same method as filtering
            const bbox = node.getBBox();
            const centerX = bbox.x + bbox.width/2;
            const centerY = bbox.y + bbox.height/2;
            
            centers[pinNumber] = {
                x: centerX,
                y: centerY
            };
            
            // Map connector to pin
        }
    });
    
    // Return extracted pin centers
    return centers;
}

// Update pin positions from extracted coordinates
function updatePinPositionsFromNames(centers) {
    let updatedCount = 0;
    
    Object.entries(centers).forEach(([pinNumber, center]) => {
        const pin = raspberryPiZeroData.pins[pinNumber];
        if (pin) {
            pin.x = center.x;
            pin.y = center.y;
            updatedCount++;
        }
    });
}

// Create pin labels positioned on pin rectangles
function createPinLabels() {
    const { w, h, x, y } = getBoardMetrics(snap.node);
    const labelW = Math.max(w * 0.03, 4);   // 50% smaller width
    const labelH = Math.max(h * 0.08, 10);  // 60% smaller height
    const fontSize = 30;  // Large font size for better readability
    
    // Create pin representation rectangles first
    const { topPinRect, bottomPinRect, pinRectW, pinRectH } = createPinRepresentations();
    
    labelsGroup.clear();
    labelsGroup.attr({ id: 'overlay-labels' });
    
    let labelsCreated = 0;
    
    Object.keys(raspberryPiZeroData.pins).forEach(pinNumber => {
        const pin = raspberryPiZeroData.pins[pinNumber];
        if (pin.x == null || pin.y == null) {
            return; // skip if not mapped
        }
        
        // Determine label position based on pin location
        let labelX, labelY;
        const pinIndex = parseInt(pinNumber) - 1; // Convert to 0-based index
        const pinSpacing = pinRectW / 20; // 20 pins per side
        const startX = x + w/2 - pinRectW/2 + pinSpacing/2;
        
        if (pinIndex < 20) {
            // Top row pins (1-20) - label containers on top rectangle, text above
            labelX = startX + (pinIndex * pinSpacing);
            labelY = y - pinRectH - 60 + pinRectH/2; // Container on rectangle
        } else {
            // Bottom row pins (21-40) - label containers on bottom rectangle, text below
            const bottomPinIndex = pinIndex - 20; // Adjust for bottom row
            labelX = startX + (bottomPinIndex * pinSpacing);
            labelY = y - pinRectH - 60 - pinRectH - 10 + pinRectH/2; // Container on rectangle
        }
        
        // Create label background (on the pin rectangle)
        const bg = snap.rect(labelX - labelW/2, labelY - labelH/2, labelW, labelH, 2).attr({
            fill: getPinColor(pin.name),
            stroke: '#000',
            strokeWidth: 1,
            opacity: 1
        });
        
        // Create label text (inside text housing rectangles)
        let textY;
        const textRectH = Math.max(h * 0.08, 15); // Height for text rectangles
        if (pinIndex < 20) {
            textY = y - pinRectH - 60 - textRectH - 20 + textRectH/2; // Text in top text rectangle
        } else {
            textY = y - pinRectH - 60 - pinRectH - 10 + pinRectH + 20 + textRectH/2; // Text in bottom text rectangle
        }
        
        const txt = snap.text(labelX, textY, pin.name).attr({
            fill: '#000',
            fontSize: fontSize,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textAnchor: 'middle',
            dominantBaseline: 'middle'
        });
        
        // Create group with data attribute for filtering
        const g = snap.g(bg, txt).attr({ 
            cursor: 'pointer',
            'data-pin': pinNumber
        });
        
        // Add click handler
        g.click(() => showPinDetails(pinNumber, pin));
        
        // Add hover effects
        g.hover(
            function() { this.select('rect').animate({opacity: 1}, 200); },
            function() { this.select('rect').animate({opacity: 0.9}, 200); }
        );
        
        labelsGroup.add(g);
        labelsCreated++;
    });
    
    // Pin labels created successfully
}

// Create pin representation rectangles
function createPinRepresentations() {
    const { w, h, x, y } = getBoardMetrics(snap.node);
    const pinRectW = Math.max(w * 0.8, 200);  // Pin rectangle width
    const pinRectH = Math.max(h * 0.15, 30);  // Pin rectangle height
    
    // Clear existing pin representations
    const existingPins = snap.node.querySelector('#pin-representations');
    if (existingPins) {
        existingPins.remove();
    }
    
    const pinRepGroup = snap.g().attr({ id: 'pin-representations' });
    
    // Top pin rectangle (pins 1-20) - moved higher
    const topPinRect = snap.rect(x + w/2 - pinRectW/2, y - pinRectH - 60, pinRectW, pinRectH).attr({
        fill: '#f0f0f0',
        stroke: '#333',
        strokeWidth: 2,
        opacity: 0.2
    });
    pinRepGroup.add(topPinRect);
    
    // Bottom pin rectangle (pins 21-40) - positioned directly below the top rectangle, moved higher
    const bottomPinRect = snap.rect(x + w/2 - pinRectW/2, y - pinRectH - 60 - pinRectH - 10, pinRectW, pinRectH).attr({
        fill: '#f0f0f0',
        stroke: '#333',
        strokeWidth: 2,
        opacity: 0.2
    });
    pinRepGroup.add(bottomPinRect);
    
    // Text housing rectangles
    const textRectH = Math.max(h * 0.08, 15); // Height for text rectangles
    
    // Top text rectangle (above top pin rectangle)
    const topTextRect = snap.rect(x + w/2 - pinRectW/2, y - pinRectH - 70 - textRectH - 20, pinRectW, textRectH).attr({
        fill: '#ffffff',
        stroke: '#333',
        strokeWidth: 1,
        opacity: 0.1
    });
    pinRepGroup.add(topTextRect);
    
    // Bottom text rectangle (below bottom pin rectangle)
    const bottomTextRect = snap.rect(x + w/2 - pinRectW/2, y - pinRectH - 60 - pinRectH - 10 + pinRectH + 20, pinRectW, textRectH).attr({
        fill: '#ffffff',
        stroke: '#333',
        strokeWidth: 1,
        opacity: 0.1
    });
    pinRepGroup.add(bottomTextRect);
    
    // Add pin rectangles to the main SVG
    snap.node.appendChild(pinRepGroup.node);
    
    return { topPinRect, bottomPinRect, pinRectW, pinRectH };
}

// Show pin details
function showPinDetails(pinNumber, pin) {
    const detailsDiv = document.getElementById('pinDetails');
    const pinName = document.getElementById('pinName');
    const pinDescription = document.getElementById('pinDescription');
    const pinType = document.getElementById('pinType');
    const pinVoltage = document.getElementById('pinVoltage');
    const pinFunctions = document.getElementById('pinFunctions');

    pinName.textContent = pin.name;
    pinDescription.textContent = pin.description;
    pinType.textContent = pin.type;
    pinVoltage.textContent = pin.voltage;

    // Clear and populate functions
    pinFunctions.innerHTML = '';
    pin.functions.forEach(func => {
        const span = document.createElement('span');
        span.className = 'function-tag';
        span.textContent = func;
        pinFunctions.appendChild(span);
    });

    detailsDiv.style.display = 'block';
}

// Toggle connecting lines (disabled - using pin rectangles instead)
function toggleLines() {
    // Lines are no longer used - pin rectangles provide better visual representation
    document.getElementById('toggleLinesBtn').textContent = 'Pin Rectangles Active';
}

// Load board SVG inline
async function loadBoardSVGInline(url) {
    const svgText = await fetch(url).then(r => r.text());
    const slot = document.getElementById('board-slot');
    slot.innerHTML = svgText;
    const rootSvg = slot.querySelector('svg');
    if (!rootSvg) throw new Error('No <svg> root found in inlined file.');
    normalizeRootSvg(rootSvg);
    return rootSvg;
}

// Initialize SVG pinout
async function initSVGPinout() {
    try {
        // Loading Raspberry Pi Zero SVG
        const rootSvg = await loadBoardSVGInline('http://localhost:8000/boards/raspberrypi_zero_1_breadboard.svg');
        
        // Initializing Snap.svg
        snap = Snap(rootSvg);
        
        // Create overlay layers
        labelsGroup = snap.g().attr({ id: 'overlay-labels' });
        
        // Force labels to the end of the DOM to be on top
        rootSvg.appendChild(labelsGroup.node);
        
        // Extracting pin centers
        const actual = extractPinCenters(rootSvg);
        
        // Updating pin positions
        updatePinPositionsFromNames(actual);
        
        // Focus tightly on the Raspberry Pi board area for better visibility
        // Adjusting viewBox to focus on Raspberry Pi board
        
        // Get the breadboard group to find the actual board bounds
        const breadboardGroup = rootSvg.querySelector('#breadboard') || 
                               rootSvg.querySelector('g[id*="breadboard"]') ||
                               rootSvg.querySelector('g[id*="board"]');
        
        if (breadboardGroup) {
            const boardBBox = breadboardGroup.getBBox();
            const padding = 20;
            const newViewBox = `${boardBBox.x - padding} ${boardBBox.y - padding} ${boardBBox.width + 2*padding} ${boardBBox.height + 2*padding}`;
            rootSvg.setAttribute('viewBox', newViewBox);
        } else {
            // Fallback viewBox if no breadboard group found
            const newViewBox = '0 0 200 150'; // Approximate Raspberry Pi Zero size
            rootSvg.setAttribute('viewBox', newViewBox);
        }
        
        createPinLabels();
        
    } catch (error) {
        // Handle initialization error silently
    }
}

// Setup download buttons
function setupDownloadButtons() {
    // PDF download
    const pdfBtn = document.createElement('button');
    pdfBtn.textContent = 'Download PDF';
    pdfBtn.className = 'download-btn';
    pdfBtn.onclick = () => {
        // TODO: Implement PDF download
        alert('PDF download not yet implemented');
    };
    
    // PNG download
    const pngBtn = document.createElement('button');
    pngBtn.textContent = 'Download PNG';
    pngBtn.className = 'download-btn';
    pngBtn.onclick = () => {
        // TODO: Implement PNG download
        alert('PNG download not yet implemented');
    };
    
    const controls = document.querySelector('.controls');
    controls.appendChild(pdfBtn);
    controls.appendChild(pngBtn);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    await initSVGPinout();
    setupFilterButtons();
    setupDownloadButtons();
    
    console.log('Raspberry Pi Zero Pinout loaded with Snap.svg!');
    console.log('Available functions:');
    console.log('- toggleLines() - Toggle connecting lines visibility');
});
