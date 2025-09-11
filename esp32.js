// ESP32 Pinout Data
const esp32Data = {
    pins: {
        1: {
            name: "3.3V",
            description: "3.3V power supply",
            functions: ["Power"],
            type: "power",
            voltage: "3.3V"
        },
        2: {
            name: "EN",
            description: "Enable pin - pull high to enable ESP32",
            functions: ["Enable"],
            type: "input",
            voltage: "3.3V"
        },
        3: {
            name: "VP",
            description: "GPIO36 - ADC1_CH0, input only",
            functions: ["ADC", "Input Only"],
            type: "input",
            voltage: "0-3.3V"
        },
        4: {
            name: "VN",
            description: "GPIO39 - ADC1_CH3, input only",
            functions: ["ADC", "Input Only"],
            type: "input",
            voltage: "0-3.3V"
        },
        5: {
            name: "IO34",
            description: "GPIO34 - input only",
            functions: ["Digital I/O", "Input Only"],
            type: "input",
            voltage: "0-3.3V"
        },
        6: {
            name: "IO35",
            description: "GPIO35 - input only",
            functions: ["Digital I/O", "Input Only"],
            type: "input",
            voltage: "0-3.3V"
        },
        7: {
            name: "IO32",
            description: "GPIO32 - general purpose I/O",
            functions: ["Digital I/O", "ADC", "DAC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        8: {
            name: "IO33",
            description: "GPIO33 - general purpose I/O",
            functions: ["Digital I/O", "ADC", "DAC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        9: {
            name: "IO25",
            description: "GPIO25 - general purpose I/O",
            functions: ["Digital I/O", "ADC", "DAC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        10: {
            name: "IO26",
            description: "GPIO26 - general purpose I/O",
            functions: ["Digital I/O", "ADC", "DAC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        11: {
            name: "IO27",
            description: "GPIO27 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        12: {
            name: "IO14",
            description: "GPIO14 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        13: {
            name: "IO12",
            description: "GPIO12 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        14: {
            name: "GND",
            description: "Ground reference",
            functions: ["Power"],
            type: "power",
            voltage: "0V"
        },
        15: {
            name: "IO13",
            description: "GPIO13 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        16: {
            name: "D2",
            description: "GPIO2 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        17: {
            name: "D3",
            description: "GPIO0 - general purpose I/O, boot mode select",
            functions: ["Digital I/O", "Boot Mode"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        18: {
            name: "CMD",
            description: "GPIO11 - SPI command",
            functions: ["SPI", "Digital I/O"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        19: {
            name: "5V",
            description: "5V power supply (if connected to USB)",
            functions: ["Power"],
            type: "power",
            voltage: "5V"
        },
        20: {
            name: "CLK",
            description: "GPIO6 - SPI clock",
            functions: ["SPI", "Digital I/O"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        21: {
            name: "IO0",
            description: "GPIO0 - general purpose I/O, boot mode select",
            functions: ["Digital I/O", "Boot Mode"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        22: {
            name: "IO4",
            description: "GPIO4 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        23: {
            name: "IO2",
            description: "GPIO2 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        24: {
            name: "IO15",
            description: "GPIO15 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        25: {
            name: "IO5",
            description: "GPIO5 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        26: {
            name: "IO18",
            description: "GPIO18 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        27: {
            name: "IO19",
            description: "GPIO19 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        28: {
            name: "IO21",
            description: "GPIO21 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        29: {
            name: "RX",
            description: "GPIO3 - UART RX",
            functions: ["UART", "Digital I/O"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        30: {
            name: "TX",
            description: "GPIO1 - UART TX",
            functions: ["UART", "Digital I/O"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        31: {
            name: "IO22",
            description: "GPIO22 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        32: {
            name: "IO23",
            description: "GPIO23 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        33: {
            name: "GND",
            description: "Ground reference",
            functions: ["Power"],
            type: "power",
            voltage: "0V"
        },
        34: {
            name: "IO16",
            description: "GPIO16 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        35: {
            name: "IO17",
            description: "GPIO17 - general purpose I/O",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        36: {
            name: "IO5",
            description: "GPIO5 - general purpose I/O (duplicate)",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        37: {
            name: "IO18",
            description: "GPIO18 - general purpose I/O (duplicate)",
            functions: ["Digital I/O", "ADC"],
            type: "bidirectional",
            voltage: "0-3.3V"
        },
        38: {
            name: "3.3V",
            description: "3.3V power supply",
            functions: ["Power"],
            type: "power",
            voltage: "3.3V"
        }
    }
};

// DOM elements
let selectedPin = null;
const pinDetailsElement = document.getElementById('pinDetails');

// Systematic pinout generation for ESP32
function generateSystematicPinout() {
    console.log('ESP32: Starting systematic pinout generation');
    const pinCount = Object.keys(esp32Data.pins).length; // 38 pins
    console.log('ESP32: Pin count:', pinCount);
    const chipDiagram = document.querySelector('.chip-diagram');
    
    if (!chipDiagram) {
        console.error('ESP32: Chip diagram not found');
        return;
    }
    
    // Set CSS variables for systematic calculation
    chipDiagram.style.setProperty('--pin-count', pinCount);
    chipDiagram.style.setProperty('--chip-height', '600px');
    chipDiagram.style.setProperty('--pin-area-height', '400px'); // Actual pin area excluding microUSB
    chipDiagram.style.setProperty('--pin-spacing', `${400 / pinCount}px`);
    
    // Generate left pins (1-19)
    const leftPins = generatePinColumn(1, 19, 'left');
    console.log('ESP32: Generated left pins:', leftPins.children.length);
    
    // Generate right pins (20-38) 
    const rightPins = generatePinColumn(20, 38, 'right');
    console.log('ESP32: Generated right pins:', rightPins.children.length);
    
    // Generate chip body with pin numbers
    const chipBody = generateChipBody(pinCount);
    console.log('ESP32: Generated chip body with pin numbers');
    
    // Clear existing content and add systematic layout
    chipDiagram.innerHTML = '';
    chipDiagram.appendChild(leftPins);
    chipDiagram.appendChild(chipBody);
    chipDiagram.appendChild(rightPins);
    
    console.log('ESP32: Pinout generation complete');
}

// Generate a column of pins
function generatePinColumn(startPin, endPin, side) {
    const column = document.createElement('div');
    column.className = `pin-column ${side}-pins`;
    
    for (let pinNum = startPin; pinNum <= endPin; pinNum++) {
        const pin = generatePin(pinNum, side);
        column.appendChild(pin);
    }
    
    return column;
}

// Generate individual pin
function generatePin(pinNum, side) {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.setAttribute('data-pin', pinNum);
    
    const pinData = esp32Data.pins[pinNum];
    if (pinData) {
        const pinLabel = document.createElement('div');
        pinLabel.className = 'pin-label';
        pinLabel.textContent = pinData.name;
        
        // Add color coding based on pin type
        if (pinData.functions.includes('Power')) {
            if (pinData.name.includes('3.3V') || pinData.name.includes('5V')) {
                pinLabel.classList.add('power-positive');
            } else if (pinData.name.includes('GND')) {
                pinLabel.classList.add('power-negative');
            }
        } else if (pinData.functions.includes('Digital I/O')) {
            pinLabel.classList.add('gpio');
        } else if (pinData.functions.includes('ADC')) {
            pinLabel.classList.add('analog');
        } else if (pinData.functions.includes('UART') || pinData.functions.includes('SPI')) {
            pinLabel.classList.add('special');
        } else if (pinData.functions.includes('Boot')) {
            pinLabel.classList.add('reset');
        } else {
            pinLabel.classList.add('special');
        }
        
        pin.appendChild(pinLabel);
    }
    
    return pin;
}

// Generate chip body with pin numbers
function generateChipBody(pinCount) {
    console.log('ESP32: Generating chip body for', pinCount, 'pins');
    const chipBody = document.createElement('div');
    chipBody.className = 'chip-body';
    
    // Add pin 1 indicator
    const pinIndicator = document.createElement('div');
    pinIndicator.className = 'pin-indicator';
    chipBody.appendChild(pinIndicator);
    
    // Add left pin numbers (1-19)
    const leftNumbers = document.createElement('div');
    leftNumbers.className = 'pin-numbers-left';
    
    for (let i = 1; i <= 19; i++) {
        const pinNum = document.createElement('div');
        pinNum.className = 'pin-num';
        pinNum.textContent = i;
        // Use the original even spacing calculation
        const percentage = ((i * 2 - 1) / 38) * 100;
        pinNum.style.top = `${percentage}%`;
        leftNumbers.appendChild(pinNum);
    }
    console.log('ESP32: Created', leftNumbers.children.length, 'left pin numbers');
    
    // Add right pin numbers (20-38)
    const rightNumbers = document.createElement('div');
    rightNumbers.className = 'pin-numbers-right';
    
    for (let i = 20; i <= 38; i++) {
        const pinNum = document.createElement('div');
        pinNum.className = 'pin-num';
        pinNum.textContent = i;
        // Use the original even spacing calculation for right side
        const percentage = (((38 - i + 1) * 2 - 1) / 38) * 100;
        pinNum.style.top = `${percentage}%`;
        rightNumbers.appendChild(pinNum);
    }
    console.log('ESP32: Created', rightNumbers.children.length, 'right pin numbers');
    
    chipBody.appendChild(leftNumbers);
    chipBody.appendChild(rightNumbers);
    
    return chipBody;
}

// Function to adjust pin spacing in real-time (for testing)
window.adjustPinSpacing = function(pinAreaStart, pinAreaHeight) {
    console.log(`Adjusting pin spacing: start=${pinAreaStart}%, height=${pinAreaHeight}%`);
    
    // Update CSS variables
    const chipDiagram = document.querySelector('.esp32-pinout');
    if (chipDiagram) {
        chipDiagram.style.setProperty('--pin-area-height', `${pinAreaHeight}px`);
    }
    
    // Update left pin numbers
    const leftNumbers = document.querySelectorAll('.esp32-pinout .pin-numbers-left .pin-num');
    leftNumbers.forEach((pinNum, index) => {
        const pinNumber = index + 1;
        const pinPosition = ((pinNumber * 2 - 1) / 38) * pinAreaHeight + pinAreaStart;
        pinNum.style.top = `${pinPosition}%`;
    });
    
    // Update right pin numbers
    const rightNumbers = document.querySelectorAll('.esp32-pinout .pin-numbers-right .pin-num');
    rightNumbers.forEach((pinNum, index) => {
        const pinNumber = index + 20;
        const pinPosition = (((38 - pinNumber + 1) * 2 - 1) / 38) * pinAreaHeight + pinAreaStart;
        pinNum.style.top = `${pinPosition}%`;
    });
    
    console.log(`Updated ${leftNumbers.length} left pins and ${rightNumbers.length} right pins`);
};

// Function to reset to default spacing
window.resetPinSpacing = function() {
    console.log('Resetting to default pin spacing');
    adjustPinSpacing(0, 100);
};

// Function to show current pin positions
window.showPinPositions = function() {
    const leftNumbers = document.querySelectorAll('.esp32-pinout .pin-numbers-left .pin-num');
    const rightNumbers = document.querySelectorAll('.esp32-pinout .pin-numbers-right .pin-num');
    
    console.log('Left pin positions:');
    leftNumbers.forEach((pinNum, index) => {
        console.log(`Pin ${index + 1}: ${pinNum.style.top}`);
    });
    
    console.log('Right pin positions:');
    rightNumbers.forEach((pinNum, index) => {
        console.log(`Pin ${index + 20}: ${pinNum.style.top}`);
    });
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    generateSystematicPinout();
    initializePinout();
    setupEventListeners();
    
    // Log available functions
    console.log('ESP32 Pin Spacing Adjuster loaded!');
    console.log('Available functions:');
    console.log('- adjustPinSpacing(startPercent, heightPercent)');
    console.log('- resetPinSpacing()');
    console.log('- showPinPositions()');
    console.log('');
    console.log('Example usage:');
    console.log('adjustPinSpacing(20, 60); // Start at 20%, height 60%');
    console.log('adjustPinSpacing(15, 70); // Start at 15%, height 70%');
});

// Initialize pinout functionality
function initializePinout() {
    const pins = document.querySelectorAll('.pin');
    
    pins.forEach(pin => {
        const pinNumber = parseInt(pin.getAttribute('data-pin'));
        const pinData = esp32Data.pins[pinNumber];
        
        if (pinData) {
            // Add tooltip
            pin.setAttribute('title', `${pinData.name}: ${pinData.description}`);
            
            // Add click event
            pin.addEventListener('click', () => selectPin(pinNumber));
            
            // Add hover effects
            pin.addEventListener('mouseenter', () => highlightPin(pin));
            pin.addEventListener('mouseleave', () => unhighlightPin(pin));
        }
    });
}

// Setup additional event listeners
function setupEventListeners() {
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Add click outside to deselect
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.pin') && !e.target.closest('.pin-details')) {
            deselectPin();
        }
    });

    // Add event listener for image download button
    const imageDownloadBtn = document.querySelector('.action-btn[title="Download Pinout as Image (PNG)"]');
    if (imageDownloadBtn) {
        imageDownloadBtn.addEventListener('click', generatePinoutImage);
    }

    // Add event listener for PDF download button
    const pdfDownloadBtn = document.querySelector('.action-btn[title="Download Pinout as PDF"]');
    if (pdfDownloadBtn) {
        pdfDownloadBtn.addEventListener('click', generatePinoutPDF);
    }
}

// Select a pin and show its details
function selectPin(pinNumber) {
    // Remove previous selection
    if (selectedPin) {
        const previousPin = document.querySelector(`[data-pin="${selectedPin}"]`);
        if (previousPin) {
            previousPin.classList.remove('selected');
        }
    }
    
    // Select new pin
    selectedPin = pinNumber;
    const pin = document.querySelector(`[data-pin="${pinNumber}"]`);
    if (pin) {
        pin.classList.add('selected');
    }
    
    // Show pin details
    showPinDetails(pinNumber);
}

// Deselect current pin
function deselectPin() {
    if (selectedPin) {
        const pin = document.querySelector(`[data-pin="${selectedPin}"]`);
        if (pin) {
            pin.classList.remove('selected');
        }
        selectedPin = null;
        showPinPlaceholder();
    }
}

// Show pin details in the info panel
function showPinDetails(pinNumber) {
    const pinData = esp32Data.pins[pinNumber];
    
    if (!pinData) return;
    
    const functionsHtml = pinData.functions.map(func => {
        let className = 'function-tag';
        if (func.toLowerCase().includes('power')) className += ' power';
        else if (func.toLowerCase().includes('adc')) className += ' analog';
        else if (func.toLowerCase().includes('uart') || func.toLowerCase().includes('spi')) className += ' special';
        else if (func.toLowerCase().includes('boot')) className += ' reset';
        
        return `<span class="${className}">${func}</span>`;
    }).join('');
    
    // Get alternate functions (secondary functions)
    const alternateFunctions = pinData.functions.filter(func => 
        func !== 'Digital I/O' && func !== 'Power'
    );
    
    const alternateFunctionsHtml = alternateFunctions.length > 0 
        ? `<div class="spec-item">
            <span class="spec-label">Alternate Functions:</span>
            <span class="spec-value">${alternateFunctions.join(', ')}</span>
          </div>`
        : '';

    pinDetailsElement.innerHTML = `
        <h3>Pin ${pinNumber} Information</h3>
        <div class="pin-info active">
            <div class="pin-name">${pinData.name}</div>
            <div class="pin-description">${pinData.description}</div>
            <div class="pin-functions">${functionsHtml}</div>
            <div class="spec-item">
                <span class="spec-label">Type:</span>
                <span class="spec-value">${pinData.type}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Voltage Range:</span>
                <span class="spec-value">${pinData.voltage}</span>
            </div>
            ${alternateFunctionsHtml}
        </div>
    `;
}

// Show placeholder when no pin is selected
function showPinPlaceholder() {
    pinDetailsElement.innerHTML = `
        <h3>Pin Information</h3>
        <p class="pin-placeholder">Click on a pin to view details</p>
    `;
}

// Highlight pin on hover
function highlightPin(pin) {
    if (!pin.classList.contains('selected')) {
        pin.style.transform = 'scale(1.05)';
        pin.style.transition = 'transform 0.2s ease';
    }
}

// Remove highlight on mouse leave
function unhighlightPin(pin) {
    if (!pin.classList.contains('selected')) {
        pin.style.transform = 'scale(1)';
    }
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    if (!selectedPin) return;
    
    let newPin = null;
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            newPin = selectedPin > 19 ? selectedPin - 1 : selectedPin + 18;
            break;
        case 'ArrowDown':
            e.preventDefault();
            newPin = selectedPin < 20 ? selectedPin + 1 : selectedPin - 18;
            break;
        case 'ArrowLeft':
            e.preventDefault();
            newPin = selectedPin > 1 ? selectedPin - 1 : 38;
            break;
        case 'ArrowRight':
            e.preventDefault();
            newPin = selectedPin < 38 ? selectedPin + 1 : 1;
            break;
        case 'Escape':
            e.preventDefault();
            deselectPin();
            return;
    }
    
    if (newPin && newPin >= 1 && newPin <= 38) {
        selectPin(newPin);
    }
}

// Generate and download pinout as PNG image
function generatePinoutImage() {
    // Get the pinout diagram element
    const pinoutDiagram = document.querySelector('.chip-diagram');
    if (!pinoutDiagram) {
        console.error('Pinout diagram not found');
        return;
    }

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (2x for better quality)
    const scale = 2;
    const rect = pinoutDiagram.getBoundingClientRect();
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    
    // Scale the context
    ctx.scale(scale, scale);
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Use html2canvas library if available, otherwise use basic canvas drawing
    if (typeof html2canvas !== 'undefined') {
        // Use html2canvas for better rendering
        html2canvas(pinoutDiagram, {
            backgroundColor: '#ffffff',
            scale: scale,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            downloadImage(canvas);
        }).catch(error => {
            console.error('Error generating image:', error);
            // Fallback to basic canvas drawing
            drawBasicPinout(ctx, rect);
            downloadImage(canvas);
        });
    } else {
        // Fallback: basic canvas drawing
        drawBasicPinout(ctx, rect);
        downloadImage(canvas);
    }
}

// Basic pinout drawing function (fallback)
function drawBasicPinout(ctx, rect) {
    // Draw chip body
    const chipBody = document.querySelector('.chip-body');
    if (chipBody) {
        const chipRect = chipBody.getBoundingClientRect();
        const relativeRect = {
            x: chipRect.left - rect.left,
            y: chipRect.top - rect.top,
            width: chipRect.width,
            height: chipRect.height
        };
        
        // Draw chip body
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(relativeRect.x, relativeRect.y, relativeRect.width, relativeRect.height);
        
        // Draw pin numbers
        const pinNumbers = document.querySelectorAll('.pin-num');
        pinNumbers.forEach(pinNum => {
            const pinRect = pinNum.getBoundingClientRect();
            const relativePinRect = {
                x: pinRect.left - rect.left,
                y: pinRect.top - rect.top,
                width: pinRect.width,
                height: pinRect.height
            };
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(pinNum.textContent, relativePinRect.x + relativePinRect.width/2, relativePinRect.y + relativePinRect.height/2 + 4);
        });
    }
    
    // Draw pin labels
    const pins = document.querySelectorAll('.pin');
    pins.forEach(pin => {
        const pinRect = pin.getBoundingClientRect();
        const relativeRect = {
            x: pinRect.left - rect.left,
            y: pinRect.top - rect.top,
            width: pinRect.width,
            height: pinRect.height
        };
        
        // Get pin label
        const pinLabel = pin.querySelector('.pin-label');
        if (pinLabel) {
            // Determine background color based on pin type
            let bgColor = '#4a5568'; // default
            if (pinLabel.classList.contains('power-positive')) bgColor = '#e53e3e';
            else if (pinLabel.classList.contains('power-negative')) bgColor = '#000000';
            else if (pinLabel.classList.contains('gpio')) bgColor = '#38a169';
            else if (pinLabel.classList.contains('clock')) bgColor = '#3182ce';
            else if (pinLabel.classList.contains('reset')) bgColor = '#d69e2e';
            else if (pinLabel.classList.contains('special')) bgColor = '#805ad5';
            else if (pinLabel.classList.contains('analog')) bgColor = '#dd6b20';
            
            // Draw pin label background
            ctx.fillStyle = bgColor;
            ctx.fillRect(relativeRect.x, relativeRect.y, relativeRect.width, relativeRect.height);
            
            // Draw pin label text
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(pinLabel.textContent, relativeRect.x + relativeRect.width/2, relativeRect.y + relativeRect.height/2 + 3);
        }
    });
}

// Download the generated image
function downloadImage(canvas) {
    // Convert canvas to blob
    canvas.toBlob(function(blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ESP32_Pinout.png';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// Generate and download pinout as PDF
function generatePinoutPDF() {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF library not loaded');
        alert('PDF generation requires jsPDF library. Please refresh the page and try again.');
        return;
    }

    // Get the pinout diagram element
    const pinoutDiagram = document.querySelector('.chip-diagram');
    if (!pinoutDiagram) {
        console.error('Pinout diagram not found');
        return;
    }

    // Create a new PDF document
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Set up the PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ESP32 Development Board Pinout', pageWidth / 2, 15, { align: 'center' });

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('38-pin Development Board - Dual-Core WiFi & Bluetooth', pageWidth / 2, 22, { align: 'center' });

    // Generate the pinout image
    if (typeof html2canvas !== 'undefined') {
        html2canvas(pinoutDiagram, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            // Convert canvas to image data
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate image dimensions to fit the page
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const aspectRatio = imgWidth / imgHeight;
            
            let finalWidth = contentWidth;
            let finalHeight = contentWidth / aspectRatio;
            
            // If height is too large, scale down
            if (finalHeight > contentHeight - 20) {
                finalHeight = contentHeight - 20;
                finalWidth = finalHeight * aspectRatio;
            }
            
            // Center the image
            const x = (pageWidth - finalWidth) / 2;
            const y = 30;
            
            // Add the image to PDF
            doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            
            // Calculate position for pin table (after image)
            const tableStartY = y + finalHeight + 10;
            
            // Add pin information table (centered)
            addPinInformationTable(doc, tableStartY);
            
            // Save the PDF
            doc.save('ESP32_Pinout.pdf');
            
        }).catch(error => {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        });
    } else {
        // Fallback: create a simple PDF without the diagram
        createSimplePDF(doc);
    }
}

// Add pin information table to PDF (centered layout)
function addPinInformationTable(doc, startY) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const tableWidth = pageWidth - (margin * 2);
    
    // Table headers
    const headers = ['Pin', 'Name', 'Type', 'Functions', 'Voltage'];
    const colWidths = [15, 25, 20, 40, 20];
    
    // Calculate table position to center it
    const totalTableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const tableX = (pageWidth - totalTableWidth) / 2;
    
    // Set font for table
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    // Draw table headers
    let currentX = tableX;
    let y = startY;
    
    headers.forEach((header, index) => {
        doc.rect(currentX, y - 5, colWidths[index], 6);
        doc.text(header, currentX + 2, y - 1);
        currentX += colWidths[index];
    });
    
    // Add pin data
    doc.setFont('helvetica', 'normal');
    y += 6;
    
    for (let pinNum = 1; pinNum <= 38; pinNum++) {
        const pinData = esp32Data.pins[pinNumber];
        if (!pinData) continue;
        
        currentX = tableX;
        
        // Pin number
        doc.rect(currentX, y - 5, colWidths[0], 6);
        doc.text(pinNum.toString(), currentX + 2, y - 1);
        currentX += colWidths[0];
        
        // Pin name
        doc.rect(currentX, y - 5, colWidths[1], 6);
        doc.text(pinData.name, currentX + 2, y - 1);
        currentX += colWidths[1];
        
        // Type
        doc.rect(currentX, y - 5, colWidths[2], 6);
        doc.text(pinData.type, currentX + 2, y - 1);
        currentX += colWidths[2];
        
        // Functions
        doc.rect(currentX, y - 5, colWidths[3], 6);
        doc.text(pinData.functions.join(', '), currentX + 2, y - 1);
        currentX += colWidths[3];
        
        // Voltage
        doc.rect(currentX, y - 5, colWidths[4], 6);
        doc.text(pinData.voltage, currentX + 2, y - 1);
        
        y += 6;
        
        // Check if we need a new page
        if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 20;
        }
    }
}

// Create a simple PDF without the diagram (fallback)
function createSimplePDF(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ESP32 Development Board Pinout', pageWidth / 2, 20, { align: 'center' });
    
    // Add note about diagram
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Pinout diagram not available in this view.', pageWidth / 2, 30, { align: 'center' });
    doc.text('Please visit the web application for the interactive diagram.', pageWidth / 2, 35, { align: 'center' });
    
    // Add pin information table (centered)
    addPinInformationTable(doc, 50);
    
    // Save the PDF
    doc.save('ESP32_Pinout.pdf');
}

// Export data for potential future use
window.MicroPinouts = {
    data: esp32Data,
    selectPin,
    deselectPin,
    generatePinoutImage,
    generatePinoutPDF
};
