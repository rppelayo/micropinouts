const yauzl = require('yauzl');
const fs = require('fs');
const { DOMParser } = require('xmldom');

class SimpleFritzingParser {
  async parseFritzingFile(filePath) {
    console.log('=== Simple Parser ===');
    
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

    // Parse FZP to get pin map
    const pinMap = this.parseFZP(files[fzpFile]);
    console.log('Pin map:', pinMap);

    // Parse breadboard SVG to extract coordinates
    const svgDoc = parser.parseFromString(files[breadboardFile], 'image/svg+xml');

    // Create pins array with coordinates from SVG
    const pins = [];
    Object.entries(pinMap).forEach(([svgId, pinName], index) => {
      // Extract coordinates from SVG element
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
      
      pins.push({
        id: index + 1,
        pin_name: pinName,
        pin_number: index + 1,
        position_x: positionX,
        position_y: positionY,
        group_name: 'Direct Mapping',
        group_color: '#3b82f6',
        svg_id: svgId
      });
    });

    return {
      pins,
      totalPins: pins.length,
      displaySVG: files[breadboardFile],
      displayViewType: 'breadboard'
    };
  }

  parseFZP(fzpContent) {
    const parser = new DOMParser();
    const fzpDoc = parser.parseFromString(fzpContent, 'text/xml');
    const pinMap = {};

    // Use xmldom methods instead of querySelectorAll
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

    return pinMap;
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

module.exports = SimpleFritzingParser;
