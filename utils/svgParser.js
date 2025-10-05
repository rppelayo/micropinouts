const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

class FritzingSVGParser {
  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitRoot: false,
      trim: true,
      normalize: true,
      normalizeTags: false,
      explicitCharkey: false
    });
  }

  /**
   * Parse a Fritzing SVG file and extract pin information
   * @param {string} svgContent - The SVG content as a string
   * @returns {Object} Parsed pin information
   */
  async parseSVG(svgContent) {
    try {
      const result = await this.parser.parseStringPromise(svgContent);
      return this.extractPinInformation(result);
    } catch (error) {
      console.error('Error parsing SVG:', error);
      throw new Error('Failed to parse SVG file');
    }
  }

  /**
   * Extract pin information from parsed SVG
   * @param {Object} svgData - Parsed SVG data
   * @returns {Object} Pin information with positions and labels
   */
  extractPinInformation(svgData) {
    const pins = [];
    const connectors = this.findConnectors(svgData);
    const textElements = this.findTextElements(svgData);
    
    // Group connectors and labels by pin number
    const pinMap = new Map();
    
    connectors.forEach(connector => {
      const pinNumber = this.extractPinNumber(connector.id);
      if (pinNumber !== null) {
        if (!pinMap.has(pinNumber)) {
          pinMap.set(pinNumber, { connector: null, label: null });
        }
        pinMap.get(pinNumber).connector = connector;
      }
    });
    
    // Try to associate text elements with connectors based on proximity
    connectors.forEach(connector => {
      const pinNumber = this.extractPinNumber(connector.id);
      if (pinNumber !== null) {
        const connectorPos = this.extractPosition(connector);
        const nearestText = this.findNearestTextElement(textElements, connectorPos);
        
        if (nearestText && !pinMap.get(pinNumber)?.label) {
          if (!pinMap.has(pinNumber)) {
            pinMap.set(pinNumber, { connector: null, label: null });
          }
          pinMap.get(pinNumber).label = nearestText;
        }
      }
    });
    
    // If no labels were associated, try a different approach
    // Look for text elements that are in the same parent group as connectors
    if (textElements.length > 0 && connectors.length > 0) {
      connectors.forEach(connector => {
        const pinNumber = this.extractPinNumber(connector.id);
        if (pinNumber !== null && !pinMap.get(pinNumber)?.label) {
          // Find text element with similar Y coordinate (same row)
          const connectorPos = this.extractPosition(connector);
          const sameRowText = textElements.find(text => {
            const textPos = this.extractPosition(text);
            return Math.abs(textPos.y - connectorPos.y) < 1; // Within 1 unit vertically
          });
          
          if (sameRowText) {
            if (!pinMap.has(pinNumber)) {
              pinMap.set(pinNumber, { connector: null, label: null });
            }
            pinMap.get(pinNumber).label = sameRowText;
          }
        }
      });
    }
    
    // Create pin information from grouped data
    pinMap.forEach((data, pinNumber) => {
      if (data.connector) {
        const pinInfo = this.extractPinInfo(data.connector, pinNumber, data.label);
        if (pinInfo) {
          pins.push(pinInfo);
        }
      }
    });

    // Sort pins by pin number
    pins.sort((a, b) => parseInt(a.pin_number) - parseInt(b.pin_number));

    return {
      pins: pins,
      totalPins: pins.length,
      viewType: this.detectViewType(svgData)
    };
  }

  /**
   * Find all connector elements in the SVG
   * @param {Object} svgData - Parsed SVG data
   * @returns {Array} Array of connector elements
   */
  findConnectors(svgData) {
    const connectors = [];
    const seenIds = new Set();
    
    // Look for elements with connector patterns
    const findConnectorsRecursive = (element, depth = 0) => {
      if (typeof element === 'object' && element !== null && depth < 10) { // Prevent infinite recursion
        // Check if this element is a connector pin (not label)
        if (element.id && this.isConnectorPinId(element.id) && !seenIds.has(element.id)) {
          connectors.push(element);
          seenIds.add(element.id);
        }
        
        // Recursively search in children
        Object.entries(element).forEach(([key, child]) => {
          if (Array.isArray(child)) {
            child.forEach(item => findConnectorsRecursive(item, depth + 1));
          } else if (typeof child === 'object') {
            findConnectorsRecursive(child, depth + 1);
          }
        });
      }
    };

    findConnectorsRecursive(svgData);
    
    // Debug logging for breadboard connectors
    if (connectors.length > 0) {
      console.log(`Found ${connectors.length} unique connectors. First few:`, connectors.slice(0, 3).map(conn => ({
        id: conn.id,
        x: conn.x,
        x1: conn.x1,
        y: conn.y,
        y1: conn.y1,
        transform: conn.transform
      })));
    }
    
    return connectors;
  }

  /**
   * Find all text elements in the SVG
   * @param {Object} svgData - Parsed SVG data
   * @returns {Array} Array of text elements
   */
  findTextElements(svgData) {
    const textElements = [];
    
    // Look for text elements
    const findTextRecursive = (element, depth = 0) => {
      if (typeof element === 'object' && element !== null && depth < 15) { // Increased depth limit
        // Check if this element is a text element (has text content)
        if (element._ || element.text || element['#text']) {
          // Check if it has position information (x,y or transform)
          const hasPosition = element.x || element.y || element.transform || 
                             element.x1 || element.y1 || element.cx || element.cy;
          
          if (hasPosition) {
            textElements.push(element);
          }
        }
        
        // Also check for elements with 'text' in their tag name
        if (element.text && typeof element.text === 'object') {
          if (element.text._ || element.text['#text']) {
            textElements.push(element.text);
          }
        }
        
        // Recursively search in children
        Object.entries(element).forEach(([key, child]) => {
          if (Array.isArray(child)) {
            child.forEach(item => findTextRecursive(item, depth + 1));
          } else if (typeof child === 'object') {
            findTextRecursive(child, depth + 1);
          }
        });
      }
    };

    findTextRecursive(svgData);
    
    // Also look for any elements that might contain text in their attributes
    const findTextInAttributes = (element, depth = 0) => {
      if (typeof element === 'object' && element !== null && depth < 15) {
        // Check all attributes for text-like content
        Object.entries(element).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 0 && value.length < 20) {
            // Check if this looks like a pin name (numbers, letters, common pin names)
            if (/^[A-Z0-9\.\-\+]+$/i.test(value) && 
                (value.includes('V') || value.includes('GND') || value.includes('D') || 
                 value.includes('A') || /^\d+$/.test(value) || value.includes('.'))) {
              // Create a pseudo text element
              textElements.push({
                _: value,
                x: element.x || element.x1 || 0,
                y: element.y || element.y1 || 0,
                transform: element.transform
              });
            }
          }
        });
        
        // Recursively search in children
        Object.entries(element).forEach(([key, child]) => {
          if (Array.isArray(child)) {
            child.forEach(item => findTextInAttributes(item, depth + 1));
          } else if (typeof child === 'object') {
            findTextInAttributes(child, depth + 1);
          }
        });
      }
    };

    findTextInAttributes(svgData);
    
    return textElements;
  }

  /**
   * Parse FZP file to extract pin names and their SVG element mappings
   * @param {string} fzpContent - FZP file content
   * @returns {Object} Pin mappings from FZP file
   */
  parseFZPFile(fzpContent) {
    try {
      const fzpData = this.parser.parseStringPromise(fzpContent);
      return fzpData;
    } catch (error) {
      console.error('Error parsing FZP file:', error);
      return null;
    }
  }

  /**
   * Extract pin names and positions using FZP file mappings
   * @param {string} fzpContent - FZP file content
   * @param {string} pcbSVGContent - PCB SVG content (for positions)
   * @param {string} breadboardSVGContent - Breadboard SVG content (for display)
   * @returns {Array} Pins with correct names and positions
   */
  async extractPinsFromFZPAndSVG(fzpContent, pcbSVGContent, breadboardSVGContent) {
    try {
      // Parse FZP file
      const fzpData = await this.parser.parseStringPromise(fzpContent);
      console.log('FZP file parsed successfully');
      
      // Parse PCB SVG (for pin positions)
      const pcbSVGData = await this.parser.parseStringPromise(pcbSVGContent);
      console.log('PCB SVG parsed successfully');
      
      // Parse breadboard SVG (for display)
      const breadboardSVGData = await this.parser.parseStringPromise(breadboardSVGContent);
      console.log('Breadboard SVG parsed successfully');
      
      // Extract connectors from FZP
      const connectors = this.extractConnectorsFromFZP(fzpData);
      console.log(`Found ${connectors.length} connectors in FZP file`);
      
      // Extract PCB elements with positions (these are the actual pin hole positions)
      const pcbElements = this.extractSVGElementsWithPositions(pcbSVGData, true);
      console.log(`Found ${pcbElements.length} PCB elements with positions`);
      
      // Map connectors to PCB elements to get pin names and positions
      const mappedPins = this.mapConnectorsToSVGElements(connectors, pcbElements);
      console.log(`Successfully mapped ${mappedPins.length} pins from FZP to PCB`);
      
      return {
        pins: mappedPins,
        breadboardSVG: breadboardSVGContent,
        pcbSVG: pcbSVGContent
      };
    } catch (error) {
      console.error('Error extracting pins from FZP and SVG:', error);
      return { pins: [], breadboardSVG: '', pcbSVG: '' };
    }
  }

  /**
   * Extract connectors from FZP data
   * @param {Object} fzpData - Parsed FZP data
   * @returns {Array} Array of connector objects
   */
  extractConnectorsFromFZP(fzpData) {
    const connectors = [];
    
    console.log('FZP data structure:', Object.keys(fzpData));
    console.log('FZP connectors property:', fzpData.connectors);
    
    // The connectors are in fzpData.connectors.connector (array)
    if (fzpData.connectors && fzpData.connectors.connector && Array.isArray(fzpData.connectors.connector)) {
      console.log(`Found connectors array with ${fzpData.connectors.connector.length} connectors`);
      fzpData.connectors.connector.forEach((connector, index) => {
        console.log(`Connector ${index}:`, {
          id: connector.id,
          name: connector.name,
          description: connector.description,
          views: connector.views
        });
        
        if (connector.id && connector.name) {
          const breadboardView = connector.views?.breadboardView;
          const svgId = breadboardView?.p?.svgId;
          
          if (svgId) {
            connectors.push({
              id: connector.id,
              name: connector.name,
              description: connector.description,
              svgId: svgId
            });
            console.log(`Added connector: ${connector.name} (${connector.id}) -> ${svgId}`);
          } else {
            console.log(`No svgId found for connector: ${connector.name} (${connector.id})`);
            console.log('Breadboard view:', breadboardView);
          }
        }
      });
    } else {
      console.log('No connectors array found in FZP data');
      console.log('FZP data type:', typeof fzpData.connectors);
      console.log('FZP connectors value:', fzpData.connectors);
    }
    
    console.log(`Extracted ${connectors.length} connectors from FZP file`);
    return connectors;
  }

  /**
   * Extract SVG elements with their positions
   * @param {Object} svgData - Parsed SVG data
   * @param {boolean} isPCB - Whether this is PCB data (needs Y inversion)
   * @returns {Array} Array of SVG elements with positions
   */
  extractSVGElementsWithPositions(svgData, isPCB = false) {
    const elements = [];
    
    const findElements = (element, depth = 0) => {
      if (typeof element === 'object' && element !== null && depth < 15) {
        // Check if this element has an ID and position data
        if (element.id && (element.x || element.y || element.x1 || element.y1 || element.cx || element.cy || element.d)) {
          const position = isPCB ? this.extractPCBPosition(element) : this.extractPosition(element);
          if (position.x !== 0 || position.y !== 0) {
            elements.push({
              id: element.id,
              x: position.x,
              y: position.y,
              element: element
            });
          }
        }
        
        // Recursively search in children
        Object.entries(element).forEach(([key, child]) => {
          if (Array.isArray(child)) {
            child.forEach(item => findElements(item, depth + 1));
          } else if (typeof child === 'object') {
            findElements(child, depth + 1);
          }
        });
      }
    };

    findElements(svgData);
    console.log(`Found ${elements.length} SVG elements with positions${isPCB ? ' (PCB with Y inversion)' : ''}`);
    return elements;
  }

  /**
   * Map connectors to SVG elements
   * @param {Array} connectors - Array of connectors from FZP
   * @param {Array} svgElements - Array of SVG elements with positions
   * @returns {Array} Mapped pins with names and positions
   */
  mapConnectorsToSVGElements(connectors, svgElements) {
    const mappedPins = [];
    
    connectors.forEach((connector, index) => {
      // The FZP has svgId like "connector1pin" but PCB SVG has IDs like "connector0pad", "connector1pad", etc.
      // We need to map "connector1pin" to "connector0pad", "connector2pin" to "connector1pad", etc.
      // This is because PCB pads start from 0, but FZP connectors start from 1
      const connectorNumber = parseInt(connector.svgId.match(/(\d+)/)[1]);
      const pcbId = `connector${connectorNumber - 1}pad`;
      const svgElement = svgElements.find(el => el.id === pcbId);
      
      if (svgElement) {
        mappedPins.push({
          pin_number: (index + 1).toString(),
          pin_name: connector.name,
          position_x: svgElement.x,
          position_y: svgElement.y,
          functions: connector.description || '',
          voltage_range: this.extractVoltageRange(null, connector.name),
          group: this.determinePinGroup(connector.name, null),
          connector_id: connector.id,
          svg_id: connector.svgId,
          pcb_id: pcbId
        });
        
        console.log(`Mapped pin: ${connector.name} (${connector.svgId} -> ${pcbId}) -> (${svgElement.x}, ${svgElement.y})`);
      } else {
        console.log(`No SVG element found for connector: ${connector.svgId} (tried ${pcbId})`);
      }
    });
    
    return mappedPins;
  }

  /**
   * Find the nearest text element to a connector position
   * @param {Array} textElements - Array of text elements
   * @param {Object} connectorPos - Connector position {x, y}
   * @returns {Object|null} Nearest text element or null
   */
  findNearestTextElement(textElements, connectorPos) {
    let nearestText = null;
    let minDistance = Infinity;
    
    textElements.forEach(text => {
      const textPos = this.extractPosition(text);
      const distance = Math.sqrt(
        Math.pow(textPos.x - connectorPos.x, 2) + 
        Math.pow(textPos.y - connectorPos.y, 2)
      );
      
      // Only consider text elements that are reasonably close (within 10 units)
      if (distance < 10 && distance < minDistance) {
        minDistance = distance;
        nearestText = text;
      }
    });
    
    return nearestText;
  }

  /**
   * Check if an ID matches connector pin patterns
   * @param {string} id - Element ID
   * @returns {boolean} True if it's a connector pin ID
   */
  isConnectorPinId(id) {
    const connectorPinPatterns = [
      /^connector\d+pin$/i,
      /^pin\d+$/i
    ];
    
    return connectorPinPatterns.some(pattern => pattern.test(id));
  }

  /**
   * Check if an ID matches connector label patterns
   * @param {string} id - Element ID
   * @returns {boolean} True if it's a connector label ID
   */
  isConnectorLabelId(id) {
    const connectorLabelPatterns = [
      /^connector\d+label$/i,
      /^label\d+$/i
    ];
    
    return connectorLabelPatterns.some(pattern => pattern.test(id));
  }

  /**
   * Extract pin information from a connector element
   * @param {Object} connector - Connector element
   * @param {number} pinNumber - Pin number
   * @param {Object} labelElement - Associated label element
   * @returns {Object|null} Pin information or null if invalid
   */
  extractPinInfo(connector, pinNumber, labelElement) {
    try {
      const position = this.extractPosition(connector);
      const label = this.extractLabelFromElement(labelElement) || this.extractLabel(connector);
      
      if (!pinNumber) return null;

      const pinInfo = {
        pin_number: pinNumber.toString(),
        pin_name: label || `Pin ${pinNumber}`,
        position_x: position.x || 0,
        position_y: position.y || 0,
        functions: this.extractFunctions(connector, label),
        voltage_range: this.extractVoltageRange(connector, label),
        group: this.determinePinGroup(label, connector)
      };
      
      // Debug logging for breadboard pins
      if (position.x !== 0 || position.y !== 0) {
        console.log(`Extracted pin ${pinNumber}: position (${position.x}, ${position.y})`);
      }
      
      return pinInfo;
    } catch (error) {
      console.error('Error extracting pin info:', error);
      return null;
    }
  }

  /**
   * Extract pin number from connector ID
   * @param {string} id - Connector ID
   * @returns {number|null} Pin number or null
   */
  extractPinNumber(id) {
    const match = id.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Extract position from connector element
   * @param {Object} connector - Connector element
   * @returns {Object} Position coordinates
   */
  extractPosition(connector) {
    // Try to get position from various attributes
    // For line elements, use x1, y1 as the position
    let x = 0, y = 0;
    
    // Check x1 first (for line elements), then x, then cx
    if (connector.x1 !== undefined && connector.x1 !== null) {
      x = parseFloat(connector.x1);
    } else if (connector.x !== undefined && connector.x !== null) {
      x = parseFloat(connector.x);
    } else if (connector.cx !== undefined && connector.cx !== null) {
      x = parseFloat(connector.cx);
    }
    
    // Check y1 first (for line elements), then y, then cy
    if (connector.y1 !== undefined && connector.y1 !== null) {
      y = parseFloat(connector.y1);
    } else if (connector.y !== undefined && connector.y !== null) {
      y = parseFloat(connector.y);
    } else if (connector.cy !== undefined && connector.cy !== null) {
      y = parseFloat(connector.cy);
    }
    
    // Debug logging for PCB SVG elements
    if (connector.id && connector.id.includes('connector') && connector.id.includes('pad')) {
      console.log('PCB Position extraction debug:', {
        id: connector.id,
        x: connector.x,
        x1: connector.x1,
        cx: connector.cx,
        y: connector.y,
        y1: connector.y1,
        cy: connector.cy,
        transform: connector.transform,
        parsedX: x,
        parsedY: y
      });
    }
    
    // If no direct position, try to extract from transform
    if ((!x && !y) && connector.transform) {
      const transformMatch = connector.transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (transformMatch) {
        return {
          x: parseFloat(transformMatch[1]) || 0,
          y: parseFloat(transformMatch[2]) || 0
        };
      }
    }

    return { x: x || 0, y: y || 0 };
  }

  /**
   * Extract position from PCB connector element with Y-axis inversion
   * @param {Object} connector - Connector element
   * @returns {Object} Position coordinates with inverted Y
   */
  extractPCBPosition(connector) {
    const position = this.extractPosition(connector);
    
    // Invert Y coordinate for PCB (upside down compared to breadboard)
    // Find the maximum Y value from the PCB to calculate inversion
    // For now, use a fixed inversion based on the observed range (20.6 to 71)
    const maxY = 71;
    const minY = 20.6;
    const invertedY = maxY - (position.y - minY) + minY;
    
    console.log('PCB Y inversion:', {
      id: connector.id,
      originalY: position.y,
      invertedY: invertedY,
      maxY: maxY,
      minY: minY
    });
    
    return { x: position.x, y: invertedY };
  }

  /**
   * Extract label from label element
   * @param {Object} labelElement - Label element
   * @returns {string} Pin label
   */
  extractLabelFromElement(labelElement) {
    if (!labelElement) return null;
    
    // Look for text content in various formats
    if (typeof labelElement === 'string') {
      return labelElement.trim();
    }
    
    if (labelElement.text) {
      return labelElement.text.trim();
    }
    
    if (labelElement._) {
      return labelElement._.trim();
    }
    
    if (labelElement.title) {
      return labelElement.title;
    }

    return null;
  }

  /**
   * Extract label from connector element (fallback)
   * @param {Object} connector - Connector element
   * @returns {string} Pin label
   */
  extractLabel(connector) {
    // Look for text content or title
    if (connector._) {
      return connector._.trim();
    }
    
    if (connector.title) {
      return connector.title;
    }

    return null;
  }

  /**
   * Extract functions from connector element
   * @param {Object} connector - Connector element
   * @param {string} label - Pin label
   * @returns {string} Pin functions
   */
  extractFunctions(connector, label) {
    // This would need to be enhanced based on Fritzing metadata
    // For now, return a default based on pin name patterns
    if (!label) return 'Digital I/O';
    
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('vcc') || labelLower.includes('5v') || labelLower.includes('3.3v')) {
      return 'Power Supply';
    }
    if (labelLower.includes('gnd') || labelLower.includes('ground')) {
      return 'Ground';
    }
    if (labelLower.includes('rx') || labelLower.includes('tx')) {
      return 'Serial Communication';
    }
    if (labelLower.includes('sda') || labelLower.includes('scl')) {
      return 'I2C Communication';
    }
    if (labelLower.includes('miso') || labelLower.includes('mosi') || labelLower.includes('sck')) {
      return 'SPI Communication';
    }
    if (labelLower.includes('pwm')) {
      return 'PWM Output';
    }
    if (labelLower.includes('analog') || labelLower.includes('a')) {
      return 'Analog Input';
    }
    if (labelLower.includes('reset') || labelLower.includes('rst')) {
      return 'Reset';
    }
    
    return 'Digital I/O';
  }

  /**
   * Extract voltage range from connector element
   * @param {Object} connector - Connector element
   * @param {string} label - Pin label
   * @returns {string} Voltage range
   */
  extractVoltageRange(connector, label) {
    if (!label) return '0-5V';
    
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('5v')) return '5V';
    if (labelLower.includes('3.3v')) return '3.3V';
    if (labelLower.includes('gnd')) return '0V';
    
    return '0-5V';
  }

  /**
   * Determine pin group based on label and connector info
   * @param {string} label - Pin label
   * @param {Object} connector - Connector element
   * @returns {string} Pin group name
   */
  determinePinGroup(label, connector) {
    if (!label) return 'Digital';
    
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('vcc') || labelLower.includes('5v') || labelLower.includes('3.3v') || 
        labelLower.includes('gnd') || labelLower.includes('ground')) {
      return 'Power';
    }
    if (labelLower.includes('rx') || labelLower.includes('tx') || 
        labelLower.includes('sda') || labelLower.includes('scl') ||
        labelLower.includes('miso') || labelLower.includes('mosi') || labelLower.includes('sck')) {
      return 'Communication';
    }
    if (labelLower.includes('pwm')) {
      return 'PWM';
    }
    if (labelLower.includes('analog') || labelLower.includes('a')) {
      return 'Analog';
    }
    if (labelLower.includes('reset') || labelLower.includes('rst') || 
        labelLower.includes('clock') || labelLower.includes('clk')) {
      return 'Special';
    }
    
    return 'Digital';
  }

  /**
   * Detect the view type of the SVG (breadboard, schematic, pcb)
   * @param {Object} svgData - Parsed SVG data
   * @returns {string} View type
   */
  detectViewType(svgData) {
    // Look for view-specific elements or attributes
    if (svgData.id) {
      const idLower = svgData.id.toLowerCase();
      if (idLower.includes('breadboard')) return 'breadboard';
      if (idLower.includes('schematic')) return 'schematic';
      if (idLower.includes('pcb')) return 'pcb';
    }
    
    return 'schematic'; // Default to schematic
  }

  /**
   * Map schematic pins to breadboard pinhole positions
   * @param {Array} schematicPins - Pins from schematic view
   * @param {Array} breadboardPins - Pins from breadboard view
   * @returns {Array} Mapped pins with breadboard positions
   */
  mapPinsToBreadboard(schematicPins, breadboardPins) {
    const mappedPins = [];
    
    console.log('Breadboard pins for mapping:', breadboardPins.slice(0, 3).map(pin => ({
      number: pin.pin_number,
      name: pin.pin_name,
      position: `(${pin.position_x}, ${pin.position_y})`
    })));
    
    // Create a map of breadboard pins by pin number for quick lookup
    const breadboardMap = new Map();
    breadboardPins.forEach(pin => {
      breadboardMap.set(pin.pin_number, pin);
    });
    
    // Map each schematic pin to its breadboard position
    schematicPins.forEach(schematicPin => {
      const breadboardPin = breadboardMap.get(schematicPin.pin_number);
      
      if (breadboardPin) {
        // Use breadboard position but keep schematic pin data
        mappedPins.push({
          ...schematicPin,
          position_x: breadboardPin.position_x,
          position_y: breadboardPin.position_y,
          // Mark that this pin was mapped from breadboard
          mapped_from_breadboard: true
        });
      } else {
        // If no breadboard pin found, use schematic position
        mappedPins.push({
          ...schematicPin,
          mapped_from_breadboard: false
        });
      }
    });
    
    console.log(`Mapped ${mappedPins.filter(p => p.mapped_from_breadboard).length}/${mappedPins.length} pins to breadboard positions`);
    return mappedPins;
  }

  /**
   * Parse a Fritzing file (either .fzpz or .svg)
   * @param {string} filePath - Path to the file
   * @returns {Object} Parsed board information
   */
  async parseFritzingFile(filePath) {
    const path = require('path');
    const fs = require('fs');
    
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.svg') {
      // Direct SVG file
      return this.parseSVGFile(filePath);
    } else if (ext === '.fzpz') {
      // Fritzing ZIP archive
      return this.parseFritzingArchive(filePath);
    } else {
      throw new Error('Unsupported file format. Please provide a .svg or .fzpz file.');
    }
  }

  /**
   * Parse a direct SVG file
   * @param {string} filePath - Path to the SVG file
   * @returns {Object} Parsed board information
   */
  async parseSVGFile(filePath) {
    const fs = require('fs');
    
    try {
      const svgContent = fs.readFileSync(filePath, 'utf8');
      const result = await this.parseSVG(svgContent);
      return {
        ...result,
        allViews: { [path.basename(filePath)]: result }
      };
    } catch (error) {
      throw new Error(`Failed to read SVG file: ${error.message}`);
    }
  }

  /**
   * Parse a Fritzing .fzpz file (ZIP archive)
   * @param {string} filePath - Path to the .fzpz file
   * @returns {Object} Parsed board information
   */
  async parseFritzingArchive(filePath) {
    const yauzl = require('yauzl');
    
    return new Promise((resolve, reject) => {
      yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }

        const files = {};
        let totalEntries = 0;
        let processedEntries = 0;
        let svgEntries = 0;
        let processedSVGs = 0;
        let fzpEntries = 0;
        let processedFZPs = 0;
        let allEntriesDiscovered = false;

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          totalEntries++;
          console.log(`Found entry: ${entry.fileName}`);
          
          if (/\.svg$/i.test(entry.fileName)) {
            svgEntries++;
            console.log(`Found SVG file: ${entry.fileName} (${entry.uncompressedSize} bytes)`);
            
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                console.error(`Error reading ${entry.fileName}:`, err);
                processedEntries++;
                processedSVGs++;
                checkComplete();
                return;
              }

              let svgContent = '';
              readStream.on('data', (chunk) => {
                svgContent += chunk.toString();
              });

              readStream.on('end', () => {
                files[entry.fileName] = svgContent;
                console.log(`Successfully read SVG: ${entry.fileName} (${svgContent.length} chars)`);
                processedEntries++;
                processedSVGs++;
                checkComplete();
              });

              readStream.on('error', (err) => {
                console.error(`Error reading stream for ${entry.fileName}:`, err);
                processedEntries++;
                processedSVGs++;
                checkComplete();
              });
            });
          } else if (/\.fzp$/i.test(entry.fileName)) {
            fzpEntries++;
            console.log(`Found FZP file: ${entry.fileName} (${entry.uncompressedSize} bytes)`);
            
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                console.error(`Error reading ${entry.fileName}:`, err);
                processedEntries++;
                processedFZPs++;
                checkComplete();
                return;
              }

              let fzpContent = '';
              readStream.on('data', (chunk) => {
                fzpContent += chunk.toString();
              });

              readStream.on('end', () => {
                files[entry.fileName] = fzpContent;
                console.log(`Successfully read FZP: ${entry.fileName} (${fzpContent.length} chars)`);
                processedEntries++;
                processedFZPs++;
                checkComplete();
              });

              readStream.on('error', (err) => {
                console.error(`Error reading stream for ${entry.fileName}:`, err);
                processedEntries++;
                processedFZPs++;
                checkComplete();
              });
            });
          } else {
            processedEntries++;
            checkComplete();
          }
          
          zipfile.readEntry();
        });

        zipfile.on('end', () => {
          console.log('ZIP processing complete. Total entries:', totalEntries);
          allEntriesDiscovered = true;
          checkComplete();
        });

        zipfile.on('error', (err) => {
          console.error('ZIP file error:', err);
          reject(err);
        });

        const self = this;
        function checkComplete() {
          if (allEntriesDiscovered && processedEntries === totalEntries && processedSVGs === svgEntries && processedFZPs === fzpEntries) {
            console.log('Processing complete. Found', Object.keys(files).length, 'files.');
            resolve(self.processFritzingFiles(files));
          }
        }
      });
    });
  }

  /**
   * Parse FZP and breadboard SVG using EXACT HTML code approach
   * @param {string} fzpContent - FZP file content
   * @param {string} breadboardSvgContent - Breadboard SVG content
   * @returns {Object} Pin information with direct SVG mapping
   */
  async parseFZPAndBreadboardDirect(fzpContent, breadboardSvgContent) {
    try {
      console.log('=== Using EXACT HTML Code Approach ===');
      
      // Parse FZP using DOMParser (EXACTLY like in HTML code)
      const { DOMParser } = require('xmldom');
      const parser = new DOMParser();
      const fzpDoc = parser.parseFromString(fzpContent, 'text/xml');
      const pinMap = {};

      // Extract pin map EXACTLY like in HTML code
      fzpDoc.querySelectorAll('connector').forEach(conn => {
        const name = conn.getAttribute('name');
        const svgElem = conn.querySelector('breadboardView p');
        if (svgElem) {
          const svgId = svgElem.getAttribute('svgId');
          if (svgId && name) pinMap[svgId] = name;
        }
      });

      console.log('Pin map extracted:', pinMap);

      // Parse breadboard SVG using DOMParser
      const svgDoc = parser.parseFromString(breadboardSvgContent, 'image/svg+xml');
      
      // Create pins array with direct SVG element mapping
      const pins = [];
      Object.entries(pinMap).forEach(([svgId, pinName], index) => {
        const elem = svgDoc.getElementById(svgId);
        if (elem) {
          // Extract position from SVG element
          let x = 0, y = 0;
          
          // Try different position attributes
          if (elem.getAttribute('cx') && elem.getAttribute('cy')) {
            x = parseFloat(elem.getAttribute('cx'));
            y = parseFloat(elem.getAttribute('cy'));
          } else if (elem.getAttribute('x') && elem.getAttribute('y')) {
            x = parseFloat(elem.getAttribute('x'));
            y = parseFloat(elem.getAttribute('y'));
          } else if (elem.getAttribute('transform')) {
            const transform = elem.getAttribute('transform');
            const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (match) {
              x = parseFloat(match[1]);
              y = parseFloat(match[2]);
            }
          } else if (elem.getAttribute('d')) {
            const d = elem.getAttribute('d');
            const match = d.match(/M\s*([^,\s]+),\s*([^,\s]+)/);
            if (match) {
              x = parseFloat(match[1]);
              y = parseFloat(match[2]);
            }
          }

          pins.push({
            id: index + 1,
            pin_name: pinName,
            pin_number: index + 1,
            position_x: x,
            position_y: y,
            group_name: 'Direct Mapping',
            group_color: '#3b82f6',
            svg_id: svgId,
            element_type: elem.tagName || 'unknown'
          });
        }
      });
      
      console.log(`Successfully mapped ${pins.length} pins using EXACT HTML approach`);
      
      return {
        pins,
        totalPins: pins.length,
        displaySVG: breadboardSvgContent,
        displayViewType: 'breadboard',
        parsingMethod: 'exact_html_code_approach'
      };
      
    } catch (error) {
      console.error('Error in EXACT HTML code approach:', error);
      throw error;
    }
  }

  /**
   * Extract pin map from FZP data
   * @param {Object} fzpData - Parsed FZP data
   * @returns {Object} svgId → pinName mapping
   */
  extractPinMapFromFZP(fzpData) {
    const pinMap = {};
    
    if (fzpData.connectors && fzpData.connectors.connector) {
      const connectors = Array.isArray(fzpData.connectors.connector) 
        ? fzpData.connectors.connector 
        : [fzpData.connectors.connector];
      
      connectors.forEach(conn => {
        const name = conn.name;
        if (conn.views && conn.views.breadboardView && conn.views.breadboardView.p) {
          const svgId = conn.views.breadboardView.p.svgId;
          if (svgId && name) {
            pinMap[svgId] = name;
          }
        }
      });
    }
    
    return pinMap;
  }

  /**
   * Find SVG element by ID recursively
   * @param {Object} svgData - Parsed SVG data
   * @param {string} id - Element ID to find
   * @returns {Object|null} Found element or null
   */
  findSVGElementById(svgData, id) {
    if (!svgData) return null;
    
    // Check if current element has the ID
    if (svgData.id === id) {
      return svgData;
    }
    
    // Search in children
    if (svgData.g && Array.isArray(svgData.g)) {
      for (const child of svgData.g) {
        const found = this.findSVGElementById(child, id);
        if (found) return found;
      }
    } else if (svgData.g && typeof svgData.g === 'object') {
      const found = this.findSVGElementById(svgData.g, id);
      if (found) return found;
    }
    
    // Search in other element types
    const elementTypes = ['path', 'circle', 'rect', 'text', 'line', 'polygon'];
    for (const type of elementTypes) {
      if (svgData[type]) {
        if (Array.isArray(svgData[type])) {
          for (const element of svgData[type]) {
            if (element.id === id) return element;
          }
        } else if (svgData[type].id === id) {
          return svgData[type];
        }
      }
    }
    
    return null;
  }

  /**
   * Extract position from SVG element
   * @param {Object} element - SVG element
   * @returns {Object} Position with x, y coordinates
   */
  extractPositionFromSVGElement(element) {
    // Try different position attributes
    if (element.cx !== undefined && element.cy !== undefined) {
      return { x: parseFloat(element.cx), y: parseFloat(element.cy) };
    }
    
    if (element.x !== undefined && element.y !== undefined) {
      return { x: parseFloat(element.x), y: parseFloat(element.y) };
    }
    
    // Try to extract from transform attribute
    if (element.transform) {
      const transformMatch = element.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (transformMatch) {
        return { 
          x: parseFloat(transformMatch[1]), 
          y: parseFloat(transformMatch[2]) 
        };
      }
    }
    
    // Try to extract from path data (for path elements)
    if (element.d) {
      const pathMatch = element.d.match(/M\s*([^,\s]+),\s*([^,\s]+)/);
      if (pathMatch) {
        return { 
          x: parseFloat(pathMatch[1]), 
          y: parseFloat(pathMatch[2]) 
        };
      }
    }
    
    // Default position
    return { x: 0, y: 0 };
  }

  /**
   * Process multiple SVG files from a Fritzing archive
   * @param {Object} files - Object with filename as key and content as value
   * @returns {Object} Processed board information
   */
  async processFritzingFiles(files) {
    console.log('=== Using Simple HTML Code Approach ===');
    
    // Find FZP and breadboard files
    const fzpFile = Object.keys(files).find(name => name.endsWith('.fzp'));
    const breadboardFile = Object.keys(files).find(name => 
      name.toLowerCase().includes('breadboard') && name.endsWith('.svg')
    );

    console.log('Available files:', Object.keys(files));
    console.log('FZP file:', fzpFile);
    console.log('Breadboard file:', breadboardFile);

    if (!fzpFile || !breadboardFile) {
      throw new Error('Missing required files: FZP and breadboard SVG');
    }

    // Use the simple HTML code approach
    const result = await this.parseFZPAndBreadboardDirect(
      files[fzpFile], 
      files[breadboardFile]
    );

    console.log(`Successfully processed with HTML approach: ${result.pins.length} pins`);
    return result;
  }
}

module.exports = FritzingSVGParser;
