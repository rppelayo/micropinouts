const yauzl = require('yauzl');
const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom');

class SVGProcessor {
  async processFritzingFile(filePath) {
    console.log('=== SVG Processor ===');
    
    try {
      // Extract files from ZIP
      const files = await this.extractFiles(filePath);
      
      // Find FZP and breadboard files
      const fzpFile = Object.keys(files).find(name => name.endsWith('.fzp'));
      const breadboardFile = Object.keys(files).find(name => 
        name.toLowerCase().includes('breadboard') && name.endsWith('.svg')
      );

      if (!fzpFile || !breadboardFile) {
        throw new Error('Missing FZP or breadboard file');
      }

      console.log('FZP file:', fzpFile);
      console.log('Breadboard file:', breadboardFile);

      // Parse FZP to get pin map and board metadata
      const { pinMap, boardMetadata } = this.parseFZP(files[fzpFile]);
      console.log('Pin map extracted:', pinMap);
      console.log('Board metadata extracted:', boardMetadata);

      // Parse SVG to extract pin positions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(files[breadboardFile], 'image/svg+xml');
      
      // Create pins array with group information and actual positions
      const pins = Object.entries(pinMap).map(([svgId, pinName], index) => {
        // Extract position from SVG element
        let positionX = 0;
        let positionY = 0;
        
        const svgElement = svgDoc.getElementById(svgId);
        if (svgElement) {
          // Try to get position from different attributes
          if (svgElement.getAttribute('cx') && svgElement.getAttribute('cy')) {
            // Circle element
            positionX = parseFloat(svgElement.getAttribute('cx')) || 0;
            positionY = parseFloat(svgElement.getAttribute('cy')) || 0;
          } else if (svgElement.getAttribute('x') && svgElement.getAttribute('y')) {
            // Rectangle or other positioned element
            positionX = parseFloat(svgElement.getAttribute('x')) || 0;
            positionY = parseFloat(svgElement.getAttribute('y')) || 0;
          } else if (svgElement.getAttribute('transform')) {
            // Element with transform - extract translate values
            const transform = svgElement.getAttribute('transform');
            const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (translateMatch) {
              positionX = parseFloat(translateMatch[1]) || 0;
              positionY = parseFloat(translateMatch[2]) || 0;
            }
          } else if (svgElement.getAttribute('d')) {
            // Path element - extract center from path data
            const pathData = svgElement.getAttribute('d');
            const coordinates = extractPathCenter(pathData);
            if (coordinates) {
              positionX = coordinates.x;
              positionY = coordinates.y;
            }
          }
        }
        
        // Determine group based on pin name patterns
        let groupName = 'Other';
        let groupColor = '#64748b';
        
        // Check for power pins first (including GND) - more specific patterns first
        if (pinName.includes('GND') || pinName.includes('V') || pinName.includes('3.3V') || pinName.includes('5V') || pinName.includes('VIN') || pinName.includes('VCC')) {
          groupName = 'Power';
          groupColor = '#ff6b6b';
        } else if (pinName.includes('SDA') || pinName.includes('SCL') || pinName.includes('I2C')) {
          groupName = 'Communication';
          groupColor = '#96ceb4';
        } else if (pinName.includes('MOSI') || pinName.includes('MISO') || pinName.includes('SCK') || pinName.includes('SPI')) {
          groupName = 'Communication';
          groupColor = '#96ceb4';
        } else if (pinName.includes('TX') || pinName.includes('RX') || pinName.includes('UART')) {
          groupName = 'Communication';
          groupColor = '#96ceb4';
        } else if (pinName.includes('GPIO') || pinName.includes('D') || pinName.match(/^\d+$/) || pinName.match(/^A\d+/) || pinName.includes('PWM')) {
          groupName = 'Digital';
          groupColor = '#4ecdc4';
        }

        return {
          id: index + 1,
          pin_name: pinName,
          pin_number: index + 1,
          position_x: positionX,
          position_y: positionY,
          group_name: groupName,
          group_color: groupColor,
          svg_id: svgId
        };
      });

      // Process SVG to make pins clickable with group information
      const modifiedSVG = this.makeSVGClickable(files[breadboardFile], pins);

      return {
        pins,
        totalPins: pins.length,
        displaySVG: modifiedSVG, // This is the modified SVG with clickable elements
        displayViewType: 'breadboard',
        boardMetadata
      };

    } catch (error) {
      console.error('Error processing Fritzing file:', error);
      throw error;
    }
  }

  parseFZP(fzpContent) {
    const parser = new DOMParser();
    const fzpDoc = parser.parseFromString(fzpContent, 'text/xml');
    const pinMap = {};

    // Extract board metadata
    const boardMetadata = {
      title: '',
      description: '',
      author: '',
      date: '',
      manufacturer: '',
      package_type: '',
      voltage_range: '',
      clock_speed: '',
      flash_memory: '',
      ram: ''
    };

    // Extract title
    const titleElements = fzpDoc.getElementsByTagName('title');
    if (titleElements.length > 0) {
      boardMetadata.title = titleElements[0].textContent || '';
    }

    // Extract description (clean HTML)
    const descriptionElements = fzpDoc.getElementsByTagName('description');
    if (descriptionElements.length > 0) {
      let description = descriptionElements[0].textContent || '';
      // Clean up HTML tags and decode entities
      description = description
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&amp;amp;/g, '&') // Handle double-encoded ampersands
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/p, li \{ white-space: pre-wrap; \}/g, '') // Remove CSS artifacts
        .replace(/^\s*[a-zA-Z0-9\s,{}:;]+\s*/, '') // Remove leading CSS/HTML artifacts
        .replace(/^\s*-\s*/, '') // Remove leading dash and space
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      boardMetadata.description = description;
    }

    // Extract author
    const authorElements = fzpDoc.getElementsByTagName('author');
    if (authorElements.length > 0) {
      boardMetadata.author = authorElements[0].textContent || '';
    }

    // Extract date
    const dateElements = fzpDoc.getElementsByTagName('date');
    if (dateElements.length > 0) {
      boardMetadata.date = dateElements[0].textContent || '';
    }

    // Extract properties
    const properties = fzpDoc.getElementsByTagName('properties');
    if (properties.length > 0) {
      const propertyElements = properties[0].getElementsByTagName('property');
      for (let i = 0; i < propertyElements.length; i++) {
        const prop = propertyElements[i];
        const name = prop.getAttribute('name');
        const value = prop.textContent || '';
        
        // Map common properties to our fields
        if (name === 'manufacturer') {
          boardMetadata.manufacturer = value;
        } else if (name === 'package') {
          boardMetadata.package_type = value;
        } else if (name === 'voltage') {
          boardMetadata.voltage_range = value;
        } else if (name === 'clock') {
          boardMetadata.clock_speed = value;
        } else if (name === 'flash') {
          boardMetadata.flash_memory = value;
        } else if (name === 'ram') {
          boardMetadata.ram = value;
        }
      }
    }

    // Try to extract manufacturer from title if not found in properties
    if (!boardMetadata.manufacturer && boardMetadata.title) {
      const title = boardMetadata.title.toLowerCase();
      if (title.includes('adafruit')) {
        boardMetadata.manufacturer = 'Adafruit';
      } else if (title.includes('espressif')) {
        boardMetadata.manufacturer = 'Espressif';
      } else if (title.includes('arduino')) {
        boardMetadata.manufacturer = 'Arduino';
      } else if (title.includes('raspberry')) {
        boardMetadata.manufacturer = 'Raspberry Pi Foundation';
      }
    }

    // Extract pin map from FZP
    const connectors = fzpDoc.getElementsByTagName('connector');
    for (let i = 0; i < connectors.length; i++) {
      const conn = connectors[i];
      const name = conn.getAttribute('name');
      
      // Find breadboardView p element
      const breadboardViews = conn.getElementsByTagName('breadboardView');
      if (breadboardViews.length > 0) {
        const breadboardView = breadboardViews[0];
        const pElements = breadboardView.getElementsByTagName('p');
        if (pElements.length > 0) {
          const svgElem = pElements[0];
          const svgId = svgElem.getAttribute('svgId');
          if (svgId && name) pinMap[svgId] = name;
        }
      }
    }

    return { pinMap, boardMetadata };
  }

  makeSVGClickable(svgContent, pins) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    
    // Parse the SVG
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Add CSS styles for clickable pins with group support
    const style = svgDoc.createElement('style');
    style.textContent = `
      .pin-hole {
        cursor: pointer;
        stroke-width: 1;
        fill: rgba(255, 0, 0, 0.3);
        transition: all 0.2s ease;
        pointer-events: all !important;
        z-index: 1000 !important;
      }
      .pin-hole:hover {
        stroke-width: 2 !important;
        fill: rgba(255, 0, 0, 0.6) !important;
      }
      .pin-hole.selected {
        stroke-width: 3 !important;
        fill: rgba(0, 0, 255, 0.5) !important;
      }
      .pin-hole.hidden {
        display: none;
      }
      /* Group-specific colors */
      .pin-hole.group-digital { stroke: #4ecdc4; }
      .pin-hole.group-power { stroke: #ff6b6b; }
      .pin-hole.group-communication { stroke: #96ceb4; }
      .pin-hole.group-analog { stroke: #45b7d1; }
      .pin-hole.group-pwm { stroke: #feca57; }
      .pin-hole.group-special { stroke: #ff9ff3; }
      .pin-hole.group-other { stroke: #64748b; }
    `;
    
    // Insert styles after opening svg tag
    const svgElement = svgDoc.documentElement;
    svgElement.insertBefore(style, svgElement.firstChild);
    
    // Make SVG bigger to fit container
    svgElement.setAttribute('style', 'width: 100%; height: 100%; max-width: 100%; max-height: 100%;');
    
    // Collect pin-hole elements to move them to the end
    const pinHoleElements = [];
    
    // Make pins clickable by adding classes and data attributes
    pins.forEach(pin => {
      const elem = svgDoc.getElementById(pin.svg_id);
      if (elem) {
        // Add clickable class and data attributes
        elem.setAttribute('class', `pin-hole group-${pin.group_name.toLowerCase()}`);
        elem.setAttribute('data-pin', pin.pin_name);
        elem.setAttribute('data-group', pin.group_name);
        elem.setAttribute('data-group-color', pin.group_color);
        
        // Override the fill to ensure visibility
        elem.setAttribute('fill', 'rgba(255, 0, 0, 0.3)');
        elem.setAttribute('stroke', pin.group_color);
        elem.setAttribute('stroke-width', '1');
        
        // Add tooltip
        const title = svgDoc.createElement('title');
        title.textContent = `${pin.pin_name} (${pin.group_name})`;
        elem.insertBefore(title, elem.firstChild);
        
        // Collect element for reordering
        pinHoleElements.push(elem);
      }
    });
    
    // Move pin-hole elements to the end of the SVG so they render on top
    pinHoleElements.forEach(elem => {
      svgElement.appendChild(elem);
    });
    
    // Serialize back to string
    return serializer.serializeToString(svgDoc);
  }

  extractFiles(filePath) {
    return new Promise((resolve, reject) => {
      const files = {};
      
      yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) return reject(err);

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          if (entry.fileName.endsWith('.fzp') || 
              (entry.fileName.toLowerCase().includes('breadboard') && entry.fileName.endsWith('.svg'))) {
            
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);
              
              const chunks = [];
              readStream.on('data', (chunk) => chunks.push(chunk));
              readStream.on('end', () => {
                files[entry.fileName] = Buffer.concat(chunks).toString('utf8');
                zipfile.readEntry();
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => resolve(files));
        zipfile.on('error', reject);
      });
    });
  }
}

/**
 * Extract center coordinates from SVG path data
 * Handles complex paths with multiple M commands and calculates the geometric center
 */
function extractPathCenter(pathData) {
  if (!pathData) {
    return null;
  }
  
  // Extract all coordinate pairs from the path
  const coordinates = [];
  
  // Match all coordinate pairs in the path (M, L, C, S, Q, T, A commands)
  const coordinateRegex = /([MLCSQTA])\s*([0-9.-]+),([0-9.-]+)/g;
  let match;
  
  while ((match = coordinateRegex.exec(pathData)) !== null) {
    const x = parseFloat(match[2]);
    const y = parseFloat(match[3]);
    coordinates.push({ x, y });
  }
  
  if (coordinates.length === 0) {
    return null;
  }
  
  // For pin holes, we want to find the center of the hole, not just the average
  // Look for circular patterns in the path data
  const circleMatch = pathData.match(/c-([0-9.-]+),([0-9.-]+)-([0-9.-]+),([0-9.-]+)-([0-9.-]+),([0-9.-]+)/);
  if (circleMatch) {
    // This looks like a circular arc - use the first M command as the center
    const centerMatch = pathData.match(/M([0-9.-]+),([0-9.-]+)/);
    if (centerMatch) {
      return {
        x: parseFloat(centerMatch[1]),
        y: parseFloat(centerMatch[2])
      };
    }
  }
  
  // For complex paths, try to find the bounding box center
  const xCoords = coordinates.map(coord => coord.x);
  const yCoords = coordinates.map(coord => coord.y);
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  };
}

module.exports = SVGProcessor;
