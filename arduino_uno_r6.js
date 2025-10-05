// Arduino UNO R6 Pinout with Snap.svg
// Pin data with positions and properties
const arduinoUnoR6Data = {
    pins: {
        // Digital pins (0-13)
        1: { name: '0', atmega328: 'PD0', description: 'Digital pin 0 - UART RX (Receive)', functions: ['Digital I/O', 'UART RX'], type: 'input', voltage: '0-5V', x: null, y: null },
        2: { name: '1', atmega328: 'PD1', description: 'Digital pin 1 - UART TX (Transmit)', functions: ['Digital I/O', 'UART TX'], type: 'output', voltage: '0-5V', x: null, y: null },
        3: { name: '2', atmega328: 'PD2', description: 'Digital pin 2 - Interrupt capable', functions: ['Digital I/O', 'Interrupt'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        4: { name: '3', atmega328: 'PD3', description: 'Digital pin 3 - PWM output, Interrupt capable', functions: ['Digital I/O', 'PWM', 'Interrupt'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        5: { name: '4', atmega328: 'PD4', description: 'Digital pin 4', functions: ['Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        6: { name: '5', atmega328: 'PD5', description: 'Digital pin 5 - PWM output', functions: ['Digital I/O', 'PWM'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        7: { name: '6', atmega328: 'PD6', description: 'Digital pin 6 - PWM output', functions: ['Digital I/O', 'PWM'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        8: { name: '7', atmega328: 'PD7', description: 'Digital pin 7', functions: ['Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        9: { name: '8', atmega328: 'PB0', description: 'Digital pin 8', functions: ['Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        10: { name: '9', atmega328: 'PB1', description: 'Digital pin 9 - PWM output', functions: ['Digital I/O', 'PWM'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        11: { name: '10', atmega328: 'PB2', description: 'Digital pin 10 - PWM output, SPI SS', functions: ['Digital I/O', 'PWM', 'SPI SS'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        12: { name: '11', atmega328: 'PB3', description: 'Digital pin 11 - PWM output, SPI MOSI', functions: ['Digital I/O', 'PWM', 'SPI MOSI'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        13: { name: '12', atmega328: 'PB4', description: 'Digital pin 12 - SPI MISO', functions: ['Digital I/O', 'SPI MISO'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        14: { name: '13', atmega328: 'PB5', description: 'Digital pin 13 - SPI SCK, Built-in LED', functions: ['Digital I/O', 'SPI SCK', 'LED'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        
        // Analog pins (A0-A5)
        15: { name: 'A0', atmega328: 'PC0', description: 'Analog input 0, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        16: { name: 'A1', atmega328: 'PC1', description: 'Analog input 1, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        17: { name: 'A2', atmega328: 'PC2', description: 'Analog input 2, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        18: { name: 'A3', atmega328: 'PC3', description: 'Analog input 3, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        19: { name: 'A4', atmega328: 'PC4', description: 'Analog input 4, Digital I/O, I2C SDA', functions: ['ADC', 'Digital I/O', 'I2C SDA'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        20: { name: 'A5', atmega328: 'PC5', description: 'Analog input 5, Digital I/O, I2C SCL', functions: ['ADC', 'Digital I/O', 'I2C SCL'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        
        // Power and special pins
        21: { name: 'VIN', atmega328: 'VIN', description: 'Raw power input - 6-12V', functions: ['Power Input'], type: 'input', voltage: '6-12V', x: null, y: null },
        22: { name: 'GND', atmega328: 'GND', description: 'Ground reference', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        23: { name: 'GND', atmega328: 'GND', description: 'Ground reference', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        24: { name: '5V', atmega328: 'VCC', description: 'Power supply - 5V', functions: ['Power'], type: 'power', voltage: '5V', x: null, y: null },
        25: { name: '3V3', atmega328: '3V3', description: 'Power supply - 3.3V', functions: ['Power'], type: 'power', voltage: '3.3V', x: null, y: null },
        26: { name: 'RESET', atmega328: 'PC6', description: 'Reset pin - Active low reset', functions: ['Reset'], type: 'input', voltage: '0-5V', x: null, y: null },
        27: { name: 'IOREF', atmega328: 'IOREF', description: 'I/O reference voltage', functions: ['I/O Reference'], type: 'output', voltage: '5V', x: null, y: null },
        28: { name: 'TX', atmega328: 'PD1', description: 'UART TX (Transmit)', functions: ['UART TX'], type: 'output', voltage: '0-5V', x: null, y: null },
        29: { name: 'RX', atmega328: 'PD0', description: 'UART RX (Receive)', functions: ['UART RX'], type: 'input', voltage: '0-5V', x: null, y: null },
        
        // Additional pins on top row
        30: { name: 'GND', atmega328: 'GND', description: 'Ground reference', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        31: { name: 'AREF', atmega328: 'AREF', description: 'Analog reference voltage', functions: ['Analog Reference'], type: 'input', voltage: '0-5V', x: null, y: null },
        32: { name: 'SDA', atmega328: 'PC4', description: 'I2C Serial Data Line', functions: ['I2C SDA'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        33: { name: 'SCL', atmega328: 'PC5', description: 'I2C Serial Clock Line', functions: ['I2C SCL'], type: 'bidirectional', voltage: '0-5V', x: null, y: null }
    }
};

// Initialize pin positions
for (const k of Object.keys(arduinoUnoR6Data.pins)) {
    arduinoUnoR6Data.pins[k].x = null;
    arduinoUnoR6Data.pins[k].y = null;
}

// Connector to pin number mapping for Arduino UNO R6
// TODO: Fill in the correct pin names based on the rect id attributes from the SVG
// The IDs follow the pattern: _x30_.1.XX.0.Y where XX is the connector number
const connectorToPinNumber = {
    // Digital pins (0-13) - top row
    // TODO: Map connector IDs to pin numbers based on rect id attributes
    // Example: '_x30_.1.17.0.1': pinNumber,
    
    // Analog pins (A0-A5) - right side  
    // TODO: Map connector IDs to pin numbers based on rect id attributes
    // Example: '_x30_.1.17.0.1': pinNumber,
    
    // Power and special pins - bottom row
    // TODO: Map connector IDs to pin numbers based on rect id attributes
    // Example: '_x30_.1.17.0.1': pinNumber,
    // Digital pins (0-13) - bottom row
    'connector61pin': 1,   // Pin 0 -> pin number 1
    'connector62pin': 2,   // Pin 1 -> pin number 2
    'connector63pin': 3,   // Pin 2 -> pin number 3
    'connector64pin': 4,   // Pin 3 -> pin number 4
    'connector65pin': 5,   // Pin 4 -> pin number 5
    'connector66pin': 6,   // Pin 5 -> pin number 6
    'connector67pin': 7,  // Pin 6 -> pin number 7
    'connector68pin': 8,  // Pin 7 -> pin number 8
    'connector51pin': 9,  // Pin 8 -> pin number 9
    'connector52pin': 10, // Pin 9 -> pin number 10
    'connector53pin': 11, // Pin 10 -> pin number 11
    'connector54pin': 12, // Pin 11 -> pin number 12
    'connector55pin': 13, // Pin 12 -> pin number 13
    'connector56pin': 14, // Pin 13 -> pin number 14
    
    // Analog pins (A0-A5) - top row
    'connector0pin': 15, // Pin A0 -> pin number 15
    'connector1pin': 16, // Pin A1 -> pin number 16
    'connector2pin': 17, // Pin A2 -> pin number 17
    'connector3pin': 18, // Pin A3 -> pin number 18
    'connector4pin': 19, // Pin A4 -> pin number 19
    'connector5pin': 20, // Pin A5 -> pin number 20
    
    // Power and special pins
    'connector90pin': 21, // Pin VIN -> pin number 21
    'connector89pin': 22, // Pin GND -> pin number 22
    'connector88pin': 23, // Pin GND -> pin number 23
    'connector87pin': 24, // Pin 5V -> pin number 24
    'connector86pin': 25, // Pin 3V3 -> pin number 25
    'connector85pin': 26, // Pin RESET -> pin number 26
    'connector84pin': 27, // Pin AREF -> pin number 27
    'connector92pin': 28, // Pin TX -> pin number 28
    'connector91pin': 29, // Pin RX -> pin number 29
    
    // Additional pins on top row
    'connector57pin': 30, // Pin GND -> pin number 30
    'connector58pin': 31, // Pin AREF -> pin number 31
    'connector59pin': 32, // Pin SDA -> pin number 32
    'connector60pin': 33  // Pin SCL -> pin number 33
};

// Global variables
let snap, linesGroup, labelsGroup, showLines = true;
let currentFilter = 'all';

// Get pin color based on type
function getPinColor(pinName) {
    // Color coding based on pin names
    if (pinName.startsWith('A') && /^A[0-5]$/.test(pinName)) {
        return '#FFD700'; // Yellow for analog pins (A0-A5)
    } else if (/^[0-9]+$/.test(pinName)) {
        return '#00FF00'; // Green for digital pins (numbers only)
    } else if (['TX', 'RX', 'RESET'].includes(pinName)) {
        return '#0000FF'; // Blue for data pins
    } else if (pinName === '5V' || pinName === 'VIN') {
        return '#FF0000'; // Red for VCC and VIN
    } else if (pinName === 'GND') {
        return '#000000'; // Black for GND
    } else if (pinName === '3V3') {
        return '#FF6600'; // Orange for 3.3V
    } else if (pinName === 'AREF') {
        return '#800080'; // Purple for AREF
    } else {
        return '#666666'; // Default gray
    }
}

// Get the appropriate pin name based on current filter
function getDisplayPinName(pinNumber, filter) {
    const pin = arduinoUnoR6Data.pins[pinNumber];
    if (!pin) return pin.name;
    
    const functions = pin.functions.map(f => f.toLowerCase());
    
    switch (filter) {
        case 'all':
            return pin.name; // Always show original names for "All Pins"
        case 'spi':
            if (functions.includes('spi ss')) return 'SS';
            if (functions.includes('spi mosi')) return 'MOSI';
            if (functions.includes('spi miso')) return 'MISO';
            if (functions.includes('spi sck')) return 'SCK';
            break;
        case 'uart':
            if (functions.includes('uart tx')) return 'TX';
            if (functions.includes('uart rx')) return 'RX';
            break;
        case 'i2c':
            if (functions.includes('i2c sda')) return 'SDA';
            if (functions.includes('i2c scl')) return 'SCL';
            break;
        case 'pwm':
            return pin.name; // Keep original names for PWM
        case 'adc':
            return pin.name; // Keep original names for ADC (A0-A5)
        case 'power':
            return pin.name; // Keep original names for power
        case 'digital':
            return pin.name; // Keep original names for digital
    }
    
    return pin.name; // Default to original name
}

// Check if a pin matches the current filter
function pinMatchesFilter(pinNumber, filter) {
    if (filter === 'all') return true;
    
    const pin = arduinoUnoR6Data.pins[pinNumber];
    if (!pin) return false;
    
    const functions = pin.functions.map(f => f.toLowerCase());
    
    switch (filter) {
        case 'pwm':
            return functions.includes('pwm');
        case 'adc':
            return functions.includes('adc');
        case 'spi':
            return functions.some(f => f.includes('spi'));
        case 'uart':
            return functions.some(f => f.includes('uart'));
        case 'i2c':
            return functions.some(f => f.includes('i2c'));
        case 'power':
            return functions.includes('power') || functions.includes('power input');
        case 'digital':
            return functions.includes('digital i/o') && !functions.includes('adc') && !functions.some(f => f.includes('uart'));
        default:
            return true;
    }
}

// Filter pins based on current filter
function filterPins() {
    console.log(`Filtering pins with filter: ${currentFilter}`);
    
    // Hide/show labels and update text content
    Object.keys(arduinoUnoR6Data.pins).forEach(pinNumber => {
        const pin = arduinoUnoR6Data.pins[pinNumber];
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
        const line = linesGroup.select(`[data-pin="${pinNumber}"]`);
        if (line) {
            line.attr({ opacity: shouldShow ? 0.9 : 0 });
        }
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

    // If there is a tight board group (e.g., Fritzing's #breadboard), use its bbox for a tight viewBox
    const boardGroup =
        rootSvg.querySelector('#breadboard') ||
        rootSvg.querySelector('g[id*="board"]') ||
        rootSvg.querySelector('g[id*="layer"]');

    // Compute a sane viewBox
    if (!rootSvg.hasAttribute('viewBox')) {
        const bb = (boardGroup || rootSvg).getBBox();
        rootSvg.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
    }

    // If the SVG already has a viewBox but it's huge (lots of whitespace),
    // you can tighten it to the board group:
    if (boardGroup) {
        const bb = boardGroup.getBBox();
        rootSvg.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
    }
}

// Get board metrics for positioning
function getBoardMetrics(rootSvg) {
    const [x, y, w, h] = rootSvg.getAttribute('viewBox').split(/\s+/).map(parseFloat);
    return { x, y, w, h, midX: x + w/2, midY: y + h/2 };
}

// Extract pin centers from SVG
function extractPinCenters(rootSvg) {
    const centers = {};
    
    // Find all elements with the UNO connector pattern: connectorXpin that are on the board
    const allConnectors = rootSvg.querySelectorAll('[id^="connector"][id$="pin"]');
    const boardBBox = rootSvg.querySelector('#breadboardbreadboard')?.getBBox() || { x: 0, y: 0, width: 212, height: 151 };
    
    // Filter to only include connectors that are actually on the Arduino board
    const pinNodes = Array.from(allConnectors).filter(connector => {
        const bbox = connector.getBBox();
        const centerX = bbox.x + bbox.width/2;
        const centerY = bbox.y + bbox.height/2;
        
        // Check if this connector is within the Arduino board area
        const isOnBoard = centerX >= boardBBox.x && centerX <= boardBBox.x + boardBBox.width &&
                         centerY >= boardBBox.y && centerY <= boardBBox.y + boardBBox.height;
        
        // Filter to only include connectors that are actually on the Arduino board
        
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
        const pin = arduinoUnoR6Data.pins[pinNumber];
        if (pin) {
            pin.x = center.x;
            pin.y = center.y;
            updatedCount++;
        }
    });
}

// Create pin labels
function createPinLabels() {
    const { w, h, midX, midY } = getBoardMetrics(snap.node);
    const labelW = Math.max(w * 0.04, 4);   // Very thin width
    const labelH = Math.max(h * 0.08, 8);   // Keep height
    const fontSize = 4.5;  // Larger font size for better readability
    const horizontalOffset = Math.max(w * 0.25, 15);
    const verticalOffset = Math.max(h * 0.15, 15);
    
    // Create pin labels with calculated dimensions
    
    labelsGroup.clear();
    labelsGroup.attr({ id: 'overlay-labels' });
    
    let labelsCreated = 0;
    
    Object.keys(arduinoUnoR6Data.pins).forEach(pinNumber => {
        const pin = arduinoUnoR6Data.pins[pinNumber];
        if (pin.x == null || pin.y == null) {
            return; // skip if not mapped
        }
        
        // Determine label position based on pin location
        let labelX, labelY;
        
        // Check if it's a top row pin (digital pins 0-13 and analog pins A0-A5)
        if (pin.y < midY - h * 0.1) {
            // Top row pins - labels above
            labelX = pin.x;
            labelY = pin.y - verticalOffset;
        } else {
            // Bottom row pins (power pins) - labels below
            labelX = pin.x;
            labelY = pin.y + verticalOffset;
        }
        
        // Create label at calculated position
        
        // Create label background
        const bg = snap.rect(labelX - labelW/2, labelY - labelH/2, labelW, labelH, 2).attr({
            fill: getPinColor(pin.name),
            stroke: '#000',
            strokeWidth: 1,
            opacity: 1
        });
        
        // Create label text with vertical rotation
        const txt = snap.text(labelX, labelY, pin.name).attr({
            fill: '#fff',
            fontSize: fontSize,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textAnchor: 'middle',
            dominantBaseline: 'middle'
        });
        
        // Apply rotation transform to the text element
        txt.node.setAttribute('transform', `rotate(-90 ${labelX} ${labelY})`);
        
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

// Create connecting lines
function createConnectingLines() {
    const { w, h, midX, midY } = getBoardMetrics(snap.node);
    const horizontalOffset = Math.max(w * 0.25, 15);  // Same as labels
    const verticalOffset = Math.max(h * 0.15, 15);    // Same as labels
    const strokeW = Math.max(h * 0.002, 0.5);  // Match Pro Mini: thinner lines

    linesGroup.clear();
    linesGroup.attr({ id: 'overlay-lines', 'pointer-events': 'none' });

    Object.keys(arduinoUnoR6Data.pins).forEach(pinNumber => {
        const pin = arduinoUnoR6Data.pins[pinNumber];
        if (pin.x == null || pin.y == null) return;

        // Determine label position (same logic as labels)
        let labelX, labelY;
        
        if (pin.y < midY - h * 0.1) {
            // Top row pins - labels above (vertical line up)
            labelX = pin.x;
            labelY = pin.y - verticalOffset;
        } else {
            // Bottom row pins (power pins) - labels below (vertical line down)
            labelX = pin.x;
            labelY = pin.y + verticalOffset;
        }

        // Create connecting line
        const line = snap.line(pin.x, pin.y, labelX, labelY).attr({
            stroke: '#e53e3e',
            strokeWidth: 1.5,
            opacity: 0.8,
            strokeDasharray: '2,2',
            'data-pin': pinNumber
        });

        linesGroup.add(line);
    });

    console.log('Connecting lines created');
}

// Show pin details
function showPinDetails(pinNumber, pin) {
    const detailsDiv = document.getElementById('pinDetails');
    detailsDiv.innerHTML = `
        <h3>Pin ${pin.name}</h3>
        <p><strong>ATmega328:</strong> ${pin.atmega328}</p>
        <p><strong>Description:</strong> ${pin.description}</p>
        <p><strong>Functions:</strong> ${pin.functions.join(', ')}</p>
        <p><strong>Type:</strong> ${pin.type}</p>
        <p><strong>Voltage:</strong> ${pin.voltage}</p>
    `;
}

// Toggle connecting lines visibility
function toggleLines() {
    showLines = !showLines;
    const btn = document.getElementById('toggleLinesBtn');
    btn.textContent = showLines ? 'Hide Connecting Lines' : 'Show Connecting Lines';
    
    if (showLines) {
        createConnectingLines();
    } else {
        linesGroup.clear();
    }
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
        // Loading Arduino UNO R6 SVG
        const rootSvg = await loadBoardSVGInline('http://localhost:8000/boards/arduino_Uno_Rev3_breadboard.svg');
        
        // Initializing Snap.svg
        snap = Snap(rootSvg);
        
        // Create overlay layers
        linesGroup = snap.g().attr({ id: 'overlay-lines', 'pointer-events': 'none' });
        labelsGroup = snap.g().attr({ id: 'overlay-labels' });
        
        // Force them to the end of the DOM to be on top
        rootSvg.appendChild(linesGroup.node);
        rootSvg.appendChild(labelsGroup.node);
        
        // Extracting pin centers
        const actual = extractPinCenters(rootSvg);
        
        // Updating pin positions
        updatePinPositionsFromNames(actual);
        
        // Focus tightly on the Arduino board area for better visibility
        // Adjusting viewBox to focus on Arduino board
        
        // Get the breadboard group to find the actual board bounds
        const breadboardGroup = rootSvg.querySelector('#breadboardbreadboard') || 
                               rootSvg.querySelector('g[id*="breadboard"]') ||
                               rootSvg.querySelector('g[id*="board"]');
        
        if (breadboardGroup) {
            const boardBBox = breadboardGroup.getBBox();
            console.log('Board bounds:', boardBBox);
            
            // Use a tight viewBox focused on the board with minimal padding
            const padding = 10; // Reduced padding for larger display
            const newViewBox = `${boardBBox.x - padding} ${boardBBox.y - padding} ${boardBBox.width + 2*padding} ${boardBBox.height + 2*padding}`;
            
            console.log('New viewBox focused on board:', newViewBox);
            rootSvg.setAttribute('viewBox', newViewBox);
        } else {
            // Fallback: use a reasonable viewBox for Arduino UNO
            const newViewBox = '0 0 250 180'; // Approximate Arduino UNO size
            console.log('Using fallback viewBox:', newViewBox);
            rootSvg.setAttribute('viewBox', newViewBox);
        }
        
        createPinLabels();
        
        
        // Create connecting lines if enabled
        
        if (showLines) {
            createConnectingLines();
        }
        
    } catch (error) {
        // Handle initialization error silently
    }
}

// Setup download buttons
function setupDownloadButtons() {
    // PDF download
    document.querySelectorAll('.download-btn')[0].addEventListener('click', () => {
        console.log('PDF download clicked');
        // TODO: Implement PDF download
    });
    
    // PNG download
    document.querySelectorAll('.download-btn')[1].addEventListener('click', () => {
        console.log('PNG download clicked');
        // TODO: Implement PNG download
    });
    
    // Datasheet button
    document.querySelector('.datasheet-btn').addEventListener('click', () => {
        console.log('Datasheet clicked');
        window.open('https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf', '_blank');
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await initSVGPinout();
    
    // Setup event listeners
    document.getElementById('toggleLinesBtn').addEventListener('click', toggleLines);
    
    // Setup filter buttons
    setupFilterButtons();
    
    // Setup download buttons
    setupDownloadButtons();
    
    console.log('Arduino UNO R6 Pinout loaded with Snap.svg!');
    console.log('Available functions:');
    console.log('- toggleLines() - Toggle connecting lines visibility');
});
