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

    // Create pins array
    const pins = [];
    Object.entries(pinMap).forEach(([svgId, pinName], index) => {
      pins.push({
        id: index + 1,
        pin_name: pinName,
        pin_number: index + 1,
        position_x: 0, // We'll get this from SVG
        position_y: 0, // We'll get this from SVG
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

module.exports = SimpleFritzingParser;
