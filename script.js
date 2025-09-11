// PIC16F84A Pinout Data
const pic16f84aData = {
    pins: {
        1: {
            name: "MCLR/VPP",
            description: "Master Clear (Reset) input and programming voltage input",
            functions: ["Reset", "Programming"],
            type: "input",
            voltage: "0-5.5V"
        },
        2: {
            name: "RA0",
            description: "Port A bit 0 - General purpose I/O",
            functions: ["Digital I/O"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        3: {
            name: "RA1",
            description: "Port A bit 1 - General purpose I/O",
            functions: ["Digital I/O"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        4: {
            name: "RA2",
            description: "Port A bit 2 - General purpose I/O",
            functions: ["Digital I/O"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        5: {
            name: "RA3",
            description: "Port A bit 3 - General purpose I/O",
            functions: ["Digital I/O"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        6: {
            name: "RA4/T0CKI",
            description: "Port A bit 4 - General purpose I/O or Timer0 clock input",
            functions: ["Digital I/O", "Timer0 Clock"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        7: {
            name: "VSS",
            description: "Ground reference",
            functions: ["Power"],
            type: "power",
            voltage: "0V"
        },
        8: {
            name: "OSC1/CLKIN",
            description: "Oscillator input or external clock input",
            functions: ["Clock Input"],
            type: "input",
            voltage: "0-5.5V"
        },
        9: {
            name: "OSC2/CLKOUT",
            description: "Oscillator output or clock output",
            functions: ["Clock Output"],
            type: "output",
            voltage: "0-5.5V"
        },
        10: {
            name: "RB0/INT",
            description: "Port B bit 0 - General purpose I/O or external interrupt",
            functions: ["Digital I/O", "External Interrupt"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        11: {
            name: "RB1",
            description: "Port B bit 1 - General purpose I/O",
            functions: ["Digital I/O"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        12: {
            name: "RB2",
            description: "Port B bit 2 - General purpose I/O",
            functions: ["Digital I/O"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        13: {
            name: "RB3",
            description: "Port B bit 3 - General purpose I/O",
            functions: ["Digital I/O"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        14: {
            name: "RB4",
            description: "Port B bit 4 - General purpose I/O with interrupt on change",
            functions: ["Digital I/O", "Interrupt on Change"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        15: {
            name: "RB5",
            description: "Port B bit 5 - General purpose I/O with interrupt on change",
            functions: ["Digital I/O", "Interrupt on Change"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        16: {
            name: "RB6",
            description: "Port B bit 6 - General purpose I/O with interrupt on change",
            functions: ["Digital I/O", "Interrupt on Change"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        17: {
            name: "RB7",
            description: "Port B bit 7 - General purpose I/O with interrupt on change",
            functions: ["Digital I/O", "Interrupt on Change"],
            type: "bidirectional",
            voltage: "0-5.5V"
        },
        18: {
            name: "VDD",
            description: "Positive supply voltage",
            functions: ["Power"],
            type: "power",
            voltage: "2.0-5.5V"
        }
    }
};

// DOM elements
let selectedPin = null;
const pinDetailsElement = document.getElementById('pinDetails');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializePinout();
    setupEventListeners();
    initializeCategoryFilter();
});

// Initialize pinout functionality
function initializePinout() {
    const pins = document.querySelectorAll('.pin');
    
    pins.forEach(pin => {
        const pinNumber = parseInt(pin.getAttribute('data-pin'));
        const pinData = pic16f84aData.pins[pinNumber];
        
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
    const pinData = pic16f84aData.pins[pinNumber];
    
    if (!pinData) return;
    
    const functionsHtml = pinData.functions.map(func => {
        let className = 'function-tag';
        if (func.toLowerCase().includes('power')) className += ' power';
        else if (func.toLowerCase().includes('clock')) className += ' clock';
        else if (func.toLowerCase().includes('reset') || func.toLowerCase().includes('interrupt')) className += ' reset';
        
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
            newPin = selectedPin > 9 ? selectedPin - 1 : selectedPin + 8;
            break;
        case 'ArrowDown':
            e.preventDefault();
            newPin = selectedPin < 10 ? selectedPin + 1 : selectedPin - 8;
            break;
        case 'ArrowLeft':
            e.preventDefault();
            newPin = selectedPin > 1 ? selectedPin - 1 : 18;
            break;
        case 'ArrowRight':
            e.preventDefault();
            newPin = selectedPin < 18 ? selectedPin + 1 : 1;
            break;
        case 'Escape':
            e.preventDefault();
            deselectPin();
            return;
    }
    
    if (newPin && newPin >= 1 && newPin <= 18) {
        selectPin(newPin);
    }
}

// Utility function to get pin type color
function getPinTypeColor(type) {
    switch(type) {
        case 'power': return '#e53e3e';
        case 'input': return '#3182ce';
        case 'output': return '#38a169';
        case 'bidirectional': return '#d69e2e';
        default: return '#4a5568';
    }
}

// Add smooth scrolling for better UX
function smoothScrollToElement(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
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
        link.download = 'PIC16F84A_Pinout.png';
        
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
    doc.text('PIC16F84A Microcontroller Pinout', pageWidth / 2, 15, { align: 'center' });

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('18-pin DIP Package - 8-bit RISC Microcontroller', pageWidth / 2, 22, { align: 'center' });

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
            
            // TODO: Fix specifications positioning - currently disappears off page
            // addSpecificationsTable(doc, specsStartY);
            
            // Save the PDF
            doc.save('PIC16F84A_Pinout.pdf');
            
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
    
    for (let pinNum = 1; pinNum <= 18; pinNum++) {
        const pinData = pic16f84aData.pins[pinNum];
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

// Add specifications table to PDF (centered layout)
function addSpecificationsTable(doc, startY) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // Add specifications section title (centered)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Specifications', pageWidth / 2, startY, { align: 'center' });
    
    // Specification data
    const specs = [
        ['Architecture', '8-bit RISC'],
        ['Flash Memory', '1.75 KB'],
        ['RAM', '68 bytes'],
        ['EEPROM', '64 bytes'],
        ['I/O Pins', '13'],
        ['Clock Speed', 'Up to 20 MHz'],
        ['Package', '18-pin DIP'],
        ['Voltage Range', '2.0V - 5.5V']
    ];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let y = startY + 8;
    specs.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, pageWidth / 2, y, { align: 'center' });
        y += 5;
    });
}

// Create a simple PDF without the diagram (fallback)
function createSimplePDF(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PIC16F84A Microcontroller Pinout', pageWidth / 2, 20, { align: 'center' });
    
    // Add note about diagram
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Pinout diagram not available in this view.', pageWidth / 2, 30, { align: 'center' });
    doc.text('Please visit the web application for the interactive diagram.', pageWidth / 2, 35, { align: 'center' });
    
    // Add pin information table (centered)
    addPinInformationTable(doc, 50);
    
    // TODO: Fix specifications positioning - currently disappears off page
    // addSpecificationsTable(doc, specsStartY);
    
    // Save the PDF
    doc.save('PIC16F84A_Pinout.pdf');
}

// Category Filter functionality
function initializeCategoryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.microcontroller-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const selectedCategory = this.getAttribute('data-category');
            
            // Filter cards
            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease-in';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Export data for potential future use
window.MicroPinouts = {
    data: pic16f84aData,
    selectPin,
    deselectPin,
    getPinTypeColor,
    generatePinoutImage,
    generatePinoutPDF,
    initializeCategoryFilter
};
