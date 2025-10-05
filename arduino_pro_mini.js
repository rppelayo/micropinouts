// Arduino Pro Mini Pinout with Snap.svg
// Pin data with positions and properties
const arduinoProMiniData = {
    pins: {
        // Top row (6 pins): BLK, GND, VCC, RXI, TXO, GRN
        1: { name: 'BLK', atmega328: 'PC6', description: 'Black wire (programming)', functions: ['Programming'], type: 'input', voltage: '0-5V', x: null, y: null },
        2: { name: 'GND', atmega328: 'GND', description: 'Ground reference', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        3: { name: 'VCC', atmega328: 'VCC', description: 'Power supply - 5V', functions: ['Power'], type: 'power', voltage: '5V', x: null, y: null },
        4: { name: 'RXI', atmega328: 'PD0', description: 'UART RX (Receive)', functions: ['UART RX', 'Digital I/O'], type: 'input', voltage: '0-5V', x: null, y: null },
        5: { name: 'TXO', atmega328: 'PD1', description: 'UART TX (Transmit)', functions: ['UART TX', 'Digital I/O'], type: 'output', voltage: '0-5V', x: null, y: null },
        6: { name: 'GRN', atmega328: 'PC5', description: 'Green wire (programming)', functions: ['Programming'], type: 'input', voltage: '0-5V', x: null, y: null },
        
        // Left side (12 pins): TX0, RX1, RST, GND, 2, 3, 4, 5, 6, 7, 8, 9
        7: { name: 'TX0', atmega328: 'PD1', description: 'UART TX (Transmit)', functions: ['UART TX', 'Digital I/O'], type: 'output', voltage: '0-5V', x: null, y: null },
        8: { name: 'RX1', atmega328: 'PD0', description: 'UART RX (Receive)', functions: ['UART RX', 'Digital I/O'], type: 'input', voltage: '0-5V', x: null, y: null },
        9: { name: 'RST', atmega328: 'PC6', description: 'Reset pin - Active low reset', functions: ['Reset'], type: 'input', voltage: '0-5V', x: null, y: null },
        10: { name: 'GND', atmega328: 'GND', description: 'Ground reference', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        11: { name: '2', atmega328: 'PD2', description: 'Digital pin 2 - Interrupt capable', functions: ['Digital I/O', 'Interrupt'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        12: { name: '3', atmega328: 'PD3', description: 'Digital pin 3 - PWM output, Interrupt capable', functions: ['Digital I/O', 'PWM', 'Interrupt'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        13: { name: '4', atmega328: 'PD4', description: 'Digital pin 4', functions: ['Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        14: { name: '5', atmega328: 'PD5', description: 'Digital pin 5 - PWM output', functions: ['Digital I/O', 'PWM'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        15: { name: '6', atmega328: 'PD6', description: 'Digital pin 6 - PWM output', functions: ['Digital I/O', 'PWM'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        16: { name: '7', atmega328: 'PD7', description: 'Digital pin 7', functions: ['Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        17: { name: '8', atmega328: 'PB0', description: 'Digital pin 8', functions: ['Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        18: { name: '9', atmega328: 'PB1', description: 'Digital pin 9 - PWM output', functions: ['Digital I/O', 'PWM'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        
        // Right side (12 pins): RAW, GND, RST, VCC, A3, A2, A1, A0, 13, 12, 11, 10
        19: { name: 'RAW', atmega328: 'VIN', description: 'Raw power input - 6-12V', functions: ['Power Input'], type: 'input', voltage: '6-12V', x: null, y: null },
        20: { name: 'GND', atmega328: 'GND', description: 'Ground reference', functions: ['Power'], type: 'power', voltage: '0V', x: null, y: null },
        21: { name: 'RST', atmega328: 'PC6', description: 'Reset pin - Active low reset', functions: ['Reset'], type: 'input', voltage: '0-5V', x: null, y: null },
        22: { name: 'VCC', atmega328: 'VCC', description: 'Power supply - 5V', functions: ['Power'], type: 'power', voltage: '5V', x: null, y: null },
        23: { name: 'A3', atmega328: 'PC3', description: 'Analog input 3, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        24: { name: 'A2', atmega328: 'PC2', description: 'Analog input 2, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        25: { name: 'A1', atmega328: 'PC1', description: 'Analog input 1, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        26: { name: 'A0', atmega328: 'PC0', description: 'Analog input 0, Digital I/O', functions: ['ADC', 'Digital I/O'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        27: { name: '13', atmega328: 'PB5', description: 'Digital pin 13 - SPI SCK, Built-in LED', functions: ['Digital I/O', 'SPI SCK', 'LED'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        28: { name: '12', atmega328: 'PB4', description: 'Digital pin 12 - SPI MISO', functions: ['Digital I/O', 'SPI MISO'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        29: { name: '11', atmega328: 'PB3', description: 'Digital pin 11 - PWM output, SPI MOSI', functions: ['Digital I/O', 'PWM', 'SPI MOSI'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        30: { name: '10', atmega328: 'PB2', description: 'Digital pin 10 - PWM output, SPI SS', functions: ['Digital I/O', 'PWM', 'SPI SS'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        
        // Inner pins (4 pins): A5, A4, A7, A6
        31: { name: 'A5', atmega328: 'PC5', description: 'Analog input 5, Digital I/O, I2C SCL', functions: ['ADC', 'Digital I/O', 'I2C SCL'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        32: { name: 'A4', atmega328: 'PC4', description: 'Analog input 4, Digital I/O, I2C SDA', functions: ['ADC', 'Digital I/O', 'I2C SDA'], type: 'bidirectional', voltage: '0-5V', x: null, y: null },
        33: { name: 'A7', atmega328: 'PC7', description: 'Analog input 7 (digital only on some variants)', functions: ['ADC'], type: 'input', voltage: '0-5V', x: null, y: null },
        34: { name: 'A6', atmega328: 'PC6', description: 'Analog input 6 (digital only on some variants)', functions: ['ADC'], type: 'input', voltage: '0-5V', x: null, y: null }
    }
};

    for (const k of Object.keys(arduinoProMiniData.pins)) {
        arduinoProMiniData.pins[k].x = null;
        arduinoProMiniData.pins[k].y = null;
    }

    const connectorToPinNumber = {
        // Top row (left to right): BLK, GND, VCC, RXI, TXO, GRN
        19: 1,   // connector19pin: cx="7.2" cy="3.6" -> BLK
        18: 2,   // connector18pin: cx="14.4" cy="3.6" -> GND
        17: 3,   // connector17pin: cx="21.6" cy="3.6" -> VCC
        16: 4,   // connector16pin: cx="28.8" cy="3.6" -> RXI
        15: 5,   // connector15pin: cx="36" cy="3.6" -> TXO
        14: 6,   // connector14pin: cx="43.2" cy="3.6" -> GRN
        
        // Left side (top to bottom): TX0, RX1, RST, GND, 2, 3, 4, 5, 6, 7, 8, 9
        48: 7,   // connector48pin: cx="3.6" cy="10.8" -> TX0
        47: 8,   // connector47pin: cx="3.6" cy="18" -> RX1
        46: 9,   // connector46pin: cx="3.6" cy="25.2" -> RST
        45: 10,  // connector45pin: cx="3.6" cy="32.4" -> GND
        44: 11,  // connector44pin: cx="3.6" cy="39.6" -> 2
        43: 12,  // connector43pin: cx="3.6" cy="46.8" -> 3
        42: 13,  // connector42pin: cx="3.6" cy="54" -> 4
        41: 14,  // connector41pin: cx="3.6" cy="61.2" -> 5
        40: 15,  // connector40pin: cx="3.6" cy="68.4" -> 6
        39: 16,  // connector39pin: cx="3.6" cy="75.6" -> 7
        38: 17,  // connector38pin: cx="3.6" cy="82.8" -> 8
        37: 18,  // connector37pin: cx="3.6" cy="90" -> 9
        
        // Right side (top to bottom): RAW, GND, RST, VCC, A3, A2, A1, A0, 13, 12, 11, 10
        25: 19,  // connector25pin: cx="46.8" cy="10.8" -> RAW
        26: 20,  // connector26pin: cx="46.8" cy="18" -> GND
        27: 21,  // connector27pin: cx="46.8" cy="25.2" -> RST
        28: 22,  // connector28pin: cx="46.8" cy="32.4" -> VCC
        29: 23,  // connector29pin: cx="46.8" cy="39.6" -> A3
        30: 24,  // connector30pin: cx="46.8" cy="46.8" -> A2
        31: 25,  // connector31pin: cx="46.8" cy="54" -> A1
        32: 26,  // connector32pin: cx="46.8" cy="61.2" -> A0
        33: 27,  // connector33pin: cx="46.8" cy="68.4" -> 13
        34: 28,  // connector34pin: cx="46.8" cy="75.6" -> 12
        35: 29,  // connector35pin: cx="46.8" cy="82.8" -> 11
        36: 30,  // connector36pin: cx="46.8" cy="90" -> 10
        
        // Inner pins: A5, A4, A7, A6
        21: 31,  // connector21pin: cx="38.52" cy="35.64" -> A5
        20: 32,  // connector20pin: cx="38.52" cy="42.84" -> A4
        23: 33,  // connector23pin: cx="38.52" cy="65.16" -> A7
        22: 34,  // connector22pin: cx="38.52" cy="72.36" -> A6
    };

// Global variables
let snap, linesGroup, labelsGroup, showLines = true;
let currentFilter = 'all';

// Get pin color based on type
function getPinColor(pinName) {
    // Color coding based on pin names
    if (pinName.startsWith('A') && /^A[0-7]$/.test(pinName)) {
        return '#FFD700'; // Yellow for analog pins (A0-A7)
    } else if (/^[0-9]+$/.test(pinName)) {
        return '#00FF00'; // Green for digital pins (numbers only)
    } else if (['TX0', 'RX1', 'RXI', 'TXO', 'RST'].includes(pinName)) {
        return '#0000FF'; // Blue for data pins
    } else if (pinName === 'VCC') {
        return '#FF0000'; // Red for VCC
    } else if (pinName === 'GND') {
        return '#000000'; // Black for GND
    } else if (['BLK', 'GRN'].includes(pinName)) {
        return '#800080'; // Purple for BLK and GRN
    } else if (pinName === 'RAW') {
        return '#FF0000'; // Red for RAW (power input)
    } else {
        return '#666666'; // Default gray
    }
}

// Get pin type class for styling
function getPinTypeClass(type) {
    const classes = {
        'power': 'power',
        'gpio': 'gpio',
        'analog': 'analog',
        'input': 'input',
        'output': 'output',
        'bidirectional': 'gpio'
    };
    return classes[type] || 'gpio';
}

// Get the appropriate pin name based on current filter
function getDisplayPinName(pinNumber, filter) {
    const pin = arduinoProMiniData.pins[pinNumber];
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
            return pin.name; // Keep original names for ADC (A0-A7)
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
    
    const pin = arduinoProMiniData.pins[pinNumber];
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
    Object.keys(arduinoProMiniData.pins).forEach(pinNumber => {
        const pin = arduinoProMiniData.pins[pinNumber];
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
    
    console.log(`Filter applied: ${currentFilter}`);
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
    
    console.log('Filter buttons setup complete');
}

function getTransformedBBox(el, rootSvg) {
    const bb = el.getBBox();
    const ctm = el.getCTM();
  
    const pt = rootSvg.createSVGPoint();
    const corners = [
      { x: bb.x,               y: bb.y },
      { x: bb.x + bb.width,    y: bb.y },
      { x: bb.x,               y: bb.y + bb.height },
      { x: bb.x + bb.width,    y: bb.y + bb.height }
    ];
  
    const xs = [], ys = [];
    for (const c of corners) {
      pt.x = c.x; pt.y = c.y;
      const p = pt.matrixTransform(ctm);
      xs.push(p.x); ys.push(p.y);
    }
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const maxX = Math.max(...xs), maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  
function normalizeRootSvg(rootSvg) {
    rootSvg.removeAttribute('width');
    rootSvg.removeAttribute('height');
    rootSvg.setAttribute('width', '100%');
    rootSvg.setAttribute('height', '100%');
    rootSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Get all pin positions first to determine the actual bounds
    const actual = extractPinCenters(rootSvg);
    console.log('Pin positions for viewBox calculation:', actual);
    
    if (Object.keys(actual).length > 0) {
        // Calculate bounds from actual pin positions
        const positions = Object.values(actual);
        const minX = Math.min(...positions.map(p => p.x));
        const maxX = Math.max(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxY = Math.max(...positions.map(p => p.y));
        
        // Add padding for labels
        const padX = (maxX - minX) * 0.3; // 30% padding on each side
        const padY = (maxY - minY) * 0.2; // 20% padding top/bottom
        
        const x = minX - padX;
        const y = minY - padY;
        const w = (maxX - minX) + padX * 2;
        const h = (maxY - minY) + padY * 2;
        
        console.log(`Calculated viewBox from pins: ${x} ${y} ${w} ${h}`);
        rootSvg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    } else {
        // Fallback to board group if no pins found
        const boardGroup =
            rootSvg.querySelector('#breadboard') ||
            rootSvg.querySelector('g[id*="board"]') ||
            rootSvg.querySelector('g[id*="layer"]') ||
            rootSvg;

        const bb = (boardGroup === rootSvg)
            ? rootSvg.viewBox.baseVal
            : getTransformedBBox(boardGroup, rootSvg);

        const padX = bb.width * 0.6;
        const padY = bb.height * 0.15;

        const x = bb.x - padX;
        const y = bb.y - padY;
        const w = bb.width + padX * 2;
        const h = bb.height + padY * 2;

        console.log(`Fallback viewBox: ${x} ${y} ${w} ${h}`);
        rootSvg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    }
}
  

// Create overlay layers on top (z-order)
function ensureOverlayLayers(rootSvg) {
    // Create once and always keep them as the last children (on top)
    if (!linesGroup) linesGroup = Snap(rootSvg).g().attr({ id: 'overlay-lines', pointerEvents: 'none' });
    if (!labelsGroup) labelsGroup = Snap(rootSvg).g().attr({ id: 'overlay-labels' });

    // Force them to the end of the DOM to be on top
    rootSvg.appendChild(linesGroup.node);
    rootSvg.appendChild(labelsGroup.node);
}

// Get board metrics for coordinate calculations
function getBoardMetrics(rootSvg) {
    const [x, y, w, h] = rootSvg.getAttribute('viewBox').split(/\s+/).map(parseFloat);
    return { x, y, w, h, midX: x + w/2 };
}

// Debug function to show pin detection dots
function debugDrawPinDots(rootSvg, centers) {
    const s = Snap(rootSvg);
    const layer = s.g().attr({ id: 'overlay-debug' });
    rootSvg.appendChild(layer.node);

    Object.values(centers).forEach(({x,y}) => {
        layer.add(s.circle(x, y, 1.8).attr({ fill: '#00bcd4', stroke: 'none' }));
    });
}

// Load & inline the board SVG, then draw overlays inside it
async function loadBoardSVGInline(url) {
    const svgText = await fetch(url).then(r => r.text());
    const slot = document.getElementById('board-slot');
    slot.innerHTML = svgText; // inline the real SVG
    // Grab the inlined root <svg>
    const rootSvg = slot.querySelector('svg');
    if (!rootSvg) throw new Error('No <svg> root found in inlined file.');
    normalizeRootSvg(rootSvg);     // <-- important
    return rootSvg;
}

// Find pin nodes in a Fritzing-style SVG
function findPinNodes(rootSvg) {
    // Try the common Fritzing patterns first
    let nodes = rootSvg.querySelectorAll(
        '[id^="connector"][id$="pin"], ' +      // e.g., connector0pin
        '[id*="connector"][class*="pin"], ' +   // connector+pin class
        '[class*="connector"][class*="pin"], ' +
        'circle[id*="connector"], ' +
        'g[id*="connector"] [class*="pin"]'
    );

    // Fallback: anything that looks like a small hole (last resort)
    if (!nodes.length) {
        nodes = rootSvg.querySelectorAll('circle, rect, path, ellipse');
    }
    return Array.from(nodes);
}

// Get the visual center of any shape in ROOT coordinates
// Element center -> ROOT USER COORDS (robust to viewBox + nested transforms)
function getNodeCenterInRoot(node, rootSvg) {
    const bb = node.getBBox();
    const pt = rootSvg.createSVGPoint();
    pt.x = bb.x + bb.width / 2;
    pt.y = bb.y + bb.height / 2;
  
    // 1) local -> screen
    const screenPt = pt.matrixTransform(node.getScreenCTM());
    // 2) screen -> root user units
    const rootPt = screenPt.matrixTransform(rootSvg.getScreenCTM().inverse());
    return { x: rootPt.x, y: rootPt.y };
  }
  
  // Text center -> ROOT USER COORDS (same approach)
  function getTextCenterInRoot(textEl, rootSvg) {
    const bb = textEl.getBBox();
    const pt = rootSvg.createSVGPoint();
    pt.x = bb.x + bb.width / 2;
    pt.y = bb.y + bb.height / 2;
  
    const screenPt = pt.matrixTransform(textEl.getScreenCTM());
    const rootPt = screenPt.matrixTransform(rootSvg.getScreenCTM().inverse());
    return { x: rootPt.x, y: rootPt.y };
  }
  

// Optional: nearest text label for a pin
function findNearestValidText(rootSvg, pinCenter, maxFraction = 0.15) {
    const { w, h } = getBoardMetrics(rootSvg);
    const maxDist = Math.hypot(w, h) * maxFraction;  // 15% of diagonal
    const texts = Array.from(rootSvg.querySelectorAll('text'));
    let best = null, bestD = maxDist;

    for (const t of texts) {
        const name = (t.textContent || '').trim();
        if (!isValidPinName(name)) continue;
        const p = getTextCenterInRoot(t, rootSvg);
        const d = Math.hypot(p.x - pinCenter.x, p.y - pinCenter.y);
        if (d < bestD) { best = name; bestD = d; }
    }
    return best;
}

// Updated whitelist with correct pin names
function isValidPinName(text) {
    const valid = ['BLK', 'GND', 'VCC', 'RXI', 'TXO', 'GRN', 'TX0', 'RX1', 'RST', 'RAW', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7',
                   '2','3','4','5','6','7','8','9','10','11','12','13'];
    return valid.includes(text);
}

// Build a pin map: { name: {x,y} } using connector ID mapping
function extractPinCenters(rootSvg) {
    const pins = {};
    const nodes = findPinNodes(rootSvg);

    console.log(`Found ${nodes.length} potential pin nodes`);

    nodes.forEach((node, index) => {
        const center = getNodeCenterInRoot(node, rootSvg);

        // Try to derive a pin number from connector id
        let pinNumber = null;
        const id = node.id || node.closest('[id]')?.id || '';
        const m = id.match(/connector(\d+)(pin|terminal)?/i);
        if (m) {
            const connectorNum = parseInt(m[1]);
            pinNumber = connectorToPinNumber[connectorNum];
            console.log(`Found connector ID: ${id} -> connector ${connectorNum} -> pin number ${pinNumber}`);
        }

        if (pinNumber) {
            pins[pinNumber] = center; // in *root SVG* coordinates
            console.log(`Pin ${pinNumber} at (${center.x.toFixed(2)}, ${center.y.toFixed(2)})`);
        } else {
            console.log(`No pin number found for ${id} at (${center.x.toFixed(2)}, ${center.y.toFixed(2)})`);
        }
        
        // Debug: specifically check for inner pins
        if (id.includes('connector20') || id.includes('connector21') || id.includes('connector22') || id.includes('connector23')) {
            console.log(`DEBUG: Inner pin ${id} -> connector ${m ? m[1] : 'no match'} -> pin number ${pinNumber}`);
        }
    });

    return pins;
}

// Initialize the SVG pinout
async function initSVGPinout() {
    const rootSvg = await loadBoardSVGInline('http://localhost:8000/boards/Arduino-Pro-Mini_breadboard.svg');
    
    // Extract pin centers first (before normalization)
    const actual = extractPinCenters(rootSvg);
    console.log('Extracted pin centers:', actual);
    
    normalizeRootSvg(rootSvg);            // 1) fix sizing/viewBox (uses pin positions)
    snap = Snap(rootSvg);
    ensureOverlayLayers(rootSvg);         // 2) ensure top layers
    
    // debug: show dots to confirm detection
    debugDrawPinDots(rootSvg, actual);

    updatePinPositionsFromNames(actual);  // 3) store x/y into your data
    console.log('Updated pin data:', arduinoProMiniData.pins);

    // Check if we have any valid pin positions
    const validPins = Object.values(arduinoProMiniData.pins).filter(pin => pin.x > 0 && pin.y > 0);
    console.log('Valid pins with positions:', validPins.length);

    createPinLabels();                    // 4) draw labels in same coords
    if (showLines) createConnectingLines();

    // Debug SVG positioning
    console.log('SVG element:', rootSvg);
    console.log('SVG dimensions:', rootSvg.getBoundingClientRect());
    console.log('SVG viewBox:', rootSvg.getAttribute('viewBox'));
    console.log('SVG width/height:', rootSvg.getAttribute('width'), rootSvg.getAttribute('height'));
    console.log('SVG children count:', rootSvg.children.length);
    console.log('Lines group children:', linesGroup ? linesGroup.children().length : 'no lines group');
    console.log('Labels group children:', labelsGroup ? labelsGroup.children().length : 'no labels group');
    
    // Check if elements are actually in the DOM
    const svgContainer = document.getElementById('board-slot');
    console.log('Board slot element:', svgContainer);
    console.log('Board slot children:', svgContainer ? svgContainer.children.length : 'no board slot');
    
    // Force center the SVG
    rootSvg.style.margin = 'auto';
    rootSvg.style.display = 'block';

    console.log('Pin labels/lines rendered.');
}

// Map by pin number and store x/y (no scaling needed)
function updatePinPositionsFromNames(actualPositions) {
    console.log('updatePinPositionsFromNames called with:', actualPositions);
    
    // Correct pin names for Arduino Pro Mini
    const correctPinNames = {
        1: 'BLK', 2: 'GND', 3: 'VCC', 4: 'RXI', 5: 'TXO', 6: 'GRN',
        7: 'TX0', 8: 'RX1', 9: 'RST', 10: 'GND', 11: '2', 12: '3', 13: '4', 14: '5', 15: '6', 16: '7', 17: '8', 18: '9',
        19: 'RAW', 20: 'GND', 21: 'RST', 22: 'VCC', 23: 'A3', 24: 'A2', 25: 'A1', 26: 'A0', 27: '13', 28: '12', 29: '11', 30: '10',
        31: 'A5', 32: 'A4', 33: 'A7', 34: 'A6'
    };
    
    let updateCount = 0;
    
    Object.entries(actualPositions).forEach(([pinNumber, {x,y}]) => {
        const pinNum = parseInt(pinNumber);
        if (pinNum && arduinoProMiniData.pins[pinNum]) {
            arduinoProMiniData.pins[pinNum].x = x;
            arduinoProMiniData.pins[pinNum].y = y;
            arduinoProMiniData.pins[pinNum].name = correctPinNames[pinNum]; // Update to correct pin name
            updateCount++;
            console.log(`Updated pin ${pinNum} (${correctPinNames[pinNum]}) to (${x.toFixed(2)}, ${y.toFixed(2)})`);
            
            // Debug: specifically check for inner pins
            if (pinNum >= 31 && pinNum <= 34) {
                console.log(`DEBUG: Inner pin ${pinNum} (${correctPinNames[pinNum]}) updated successfully`);
            }
        } else {
            console.log(`No pin data found for pin number: ${pinNum}`);
        }
    });
    
    console.log(`Updated ${updateCount} pin positions`);
}

// Fallback positions if SVG parsing fails
function useFallbackPositions() {
    console.log('Using fallback pin positions');
    // Reset to original hardcoded positions
    const fallbackPositions = {
        1: { x: 180, y: 120 }, 2: { x: 180, y: 140 }, 3: { x: 180, y: 160 }, 4: { x: 180, y: 180 },
        5: { x: 180, y: 200 }, 6: { x: 180, y: 220 }, 7: { x: 180, y: 240 }, 8: { x: 180, y: 260 },
        9: { x: 180, y: 280 }, 10: { x: 180, y: 300 }, 11: { x: 180, y: 320 }, 12: { x: 180, y: 340 },
        13: { x: 180, y: 360 }, 14: { x: 180, y: 380 }, 15: { x: 180, y: 400 }, 16: { x: 180, y: 420 },
        17: { x: 320, y: 120 }, 18: { x: 320, y: 140 }, 19: { x: 320, y: 160 }, 20: { x: 320, y: 180 },
        21: { x: 320, y: 200 }, 22: { x: 320, y: 220 }, 23: { x: 320, y: 240 }, 24: { x: 320, y: 260 },
        25: { x: 320, y: 280 }, 26: { x: 320, y: 300 }, 27: { x: 320, y: 320 }, 28: { x: 320, y: 340 },
        29: { x: 320, y: 360 }, 30: { x: 320, y: 380 }, 31: { x: 320, y: 400 }, 32: { x: 320, y: 420 }
    };
    
    Object.keys(fallbackPositions).forEach(pinNumber => {
        if (arduinoProMiniData.pins[pinNumber]) {
            arduinoProMiniData.pins[pinNumber].x = fallbackPositions[pinNumber].x;
            arduinoProMiniData.pins[pinNumber].y = fallbackPositions[pinNumber].y;
        }
    });
}

// Create pin labels
function createPinLabels() {
    const { w, h, midX, midY } = getBoardMetrics(snap.node);

    // Scaled geometry (smaller but with proper text fit)
    const horizontalOffset = Math.max(w * 0.25, 15);  // distance for left/right labels
    const verticalOffset = Math.max(h * 0.15, 15);    // distance for top labels
    const labelW = Math.max(w * 0.08, 8);             // label rectangle width (wider for text)
    const labelH = Math.max(h * 0.024, 4.8);          // label rectangle height (40% smaller: 0.04 * 0.6)
    const rx = labelH * 0.35;                         // rounded corners
    const fontSize = 2.7;                             // fixed small font size

    labelsGroup.clear();
    labelsGroup.attr({ id: 'overlay-labels', 'pointer-events': 'visiblePainted' });

    // Find the top row pins (lowest y values)
    const allPins = Object.values(arduinoProMiniData.pins).filter(pin => pin.x != null && pin.y != null);
    const topRowY = Math.min(...allPins.map(pin => pin.y));
    const topRowThreshold = topRowY + 5; // Allow some tolerance for "top row"

    Object.keys(arduinoProMiniData.pins).forEach(pinNumber => {
      const pin = arduinoProMiniData.pins[pinNumber];
      if (pin.x == null || pin.y == null) {
        // Debug: check if inner pins are missing coordinates
        if (pinNumber >= 31 && pinNumber <= 34) {
          console.log(`DEBUG: Inner pin ${pinNumber} (${pin.name}) has no coordinates: x=${pin.x}, y=${pin.y}`);
        }
        return;
      }

      let labelX, labelY;
      let isTopRow = pin.y <= topRowThreshold;

      if (isTopRow) {
        // Top row pins: labels go north (above)
        labelX = pin.x;
        labelY = pin.y - verticalOffset;
      } else {
        // Check if this is an inner pin (A5, A4, A7, A6)
        const isInnerPin = pinNumber >= 31 && pinNumber <= 34;
        
        if (isInnerPin) {
          // Inner pins: labels go much further to the right
          labelX = pin.x + (horizontalOffset * 2.5); // 2.5x further right
          labelY = pin.y;
        } else {
          // All other pins: labels go left/right
          labelX = (pin.x < midX) ? pin.x - horizontalOffset : pin.x + horizontalOffset;
          labelY = pin.y;
        }
      }

      const bg = snap.rect(labelX - labelW/2, labelY - labelH/2, labelW, labelH, rx, rx).attr({
        fill: getPinColor(pin.name),
        stroke: '#333',
        strokeWidth: Math.max(h * 0.002, 0.6),
        opacity: 0.85
      });

      const txt = snap.text(labelX, labelY, pin.name).attr({
        fill: '#fff',
        'font-size': fontSize,
        'font-family': 'Arial, sans-serif',
        'font-weight': 'bold',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      });

      const g = snap.g(bg, txt).attr({ cursor: 'pointer', 'data-pin': pinNumber });
      g.click(() => showPinDetails(pinNumber, pin));
      labelsGroup.add(g);
    });
}
  

// Create connecting lines
function createConnectingLines() {
    const { w, h, midX, midY } = getBoardMetrics(snap.node);
    const horizontalOffset = Math.max(w * 0.25, 15);  // Same as labels
    const verticalOffset = Math.max(h * 0.15, 15);    // Same as labels
    const strokeW = Math.max(h * 0.002, 0.5);

    linesGroup.clear();
    linesGroup.attr({ id: 'overlay-lines', 'pointer-events': 'none' });

    // Find the top row pins (same logic as labels)
    const allPins = Object.values(arduinoProMiniData.pins).filter(pin => pin.x != null && pin.y != null);
    const topRowY = Math.min(...allPins.map(pin => pin.y));
    const topRowThreshold = topRowY + 5; // Allow some tolerance for "top row"

    Object.keys(arduinoProMiniData.pins).forEach(pinNumber => {
      const pin = arduinoProMiniData.pins[pinNumber];
      if (pin.x == null || pin.y == null) return;

      let labelX, labelY;
      let isTopRow = pin.y <= topRowThreshold;

      if (isTopRow) {
        // Top row pins: vertical lines to labels above
        labelX = pin.x;
        labelY = pin.y - verticalOffset;
      } else {
        // Check if this is an inner pin (A5, A4, A7, A6)
        const isInnerPin = pinNumber >= 31 && pinNumber <= 34;
        
        if (isInnerPin) {
          // Inner pins: lines go much further to the right
          labelX = pin.x + (horizontalOffset * 2.5); // 2.5x further right
          labelY = pin.y;
        } else {
          // All other pins: horizontal lines to left/right labels
          labelX = (pin.x < midX) ? pin.x - horizontalOffset : pin.x + horizontalOffset;
          labelY = pin.y;
        }
      }

      linesGroup.add(
        snap.line(pin.x, pin.y, labelX, labelY).attr({
          stroke: '#e53e3e',
          strokeWidth: strokeW,
          opacity: 0.9,
          strokeDasharray: `${strokeW * 1.5}, ${strokeW * 1.5}`,
          'data-pin': pinNumber
        })
      );
    });
}

// Show pin details in the info panel
function showPinDetails(pinNumber, pin) {
    const pinDetails = document.getElementById('pinDetails');
    
    const functionsList = pin.functions.map(func => `<span class="function-tag ${getPinTypeClass(pin.type)}">${func}</span>`).join(' ');
    
    pinDetails.innerHTML = `
        <h3>Pin ${pinNumber}: ${pin.name}</h3>
        <p class="pin-description">${pin.description}</p>
        <div class="pin-functions">
            <strong>Functions:</strong><br>
            ${functionsList}
        </div>
        <div class="pin-specs">
            <div class="spec-item">
                <span class="spec-label">Type:</span>
                <span class="spec-value">${pin.type}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Voltage:</span>
                <span class="spec-value">${pin.voltage}</span>
            </div>
        </div>
    `;
}

// Toggle connecting lines
function toggleLines() {
    showLines = !showLines;
    if (showLines) {
        createConnectingLines();
        document.getElementById('toggleLinesBtn').textContent = 'Hide Connecting Lines';
    } else {
        linesGroup.clear();
        document.getElementById('toggleLinesBtn').textContent = 'Show Connecting Lines';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    await initSVGPinout();
    
    // Setup event listeners
    document.getElementById('toggleLinesBtn').addEventListener('click', toggleLines);
    
    // Setup filter buttons
    setupFilterButtons();
    
    // Setup download buttons
    setupDownloadButtons();
    
    console.log('Arduino Pro Mini Pinout loaded with Snap.svg!');
    console.log('Available functions:');
    console.log('- toggleLines() - Toggle connecting lines visibility');
});

// Setup download buttons
function setupDownloadButtons() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.querySelector('.btn-text').textContent;
            
            if (buttonText.includes('PDF')) {
                downloadAsPDF();
            } else if (buttonText.includes('PNG')) {
                downloadAsPNG();
            }
        });
    });
    
    // Datasheet button
    const datasheetBtn = document.querySelector('.datasheet-btn');
    if (datasheetBtn) {
        datasheetBtn.addEventListener('click', function() {
            window.open('https://www.microchip.com/en-us/product/ATmega328P', '_blank');
        });
    }
}

// Download as PDF
function downloadAsPDF() {
    if (typeof html2canvas !== 'undefined' && typeof jsPDF !== 'undefined') {
        const element = document.getElementById('svg-container');
        
        html2canvas(element).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save('arduino-pro-mini-pinout.pdf');
        });
    } else {
        alert('PDF download requires html2canvas and jsPDF libraries');
    }
}

// Download as PNG
function downloadAsPNG() {
    if (typeof html2canvas !== 'undefined') {
        const element = document.getElementById('svg-container');
        
        html2canvas(element).then(canvas => {
            const link = document.createElement('a');
            link.download = 'arduino-pro-mini-pinout.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        alert('PNG download requires html2canvas library');
    }
}

// Make functions available globally
window.toggleLines = toggleLines;
