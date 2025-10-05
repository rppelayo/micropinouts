const https = require('https');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// URLs for Arduino Uno files
const fzpUrl = 'https://raw.githubusercontent.com/fritzing/fritzing-parts/develop/core/arduino_Uno_Rev3(fix).fzp';
const svgUrl = 'https://raw.githubusercontent.com/fritzing/fritzing-parts/develop/svg/core/breadboard/arduino_Uno_Rev3_breadboard.svg';

async function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function examineArduinoPins() {
  try {
    console.log('🔍 Examining Arduino Uno pin structure...\n');
    
    // Download files
    await downloadFile(fzpUrl, 'arduino_uno.fzp');
    await downloadFile(svgUrl, 'arduino_uno_breadboard.svg');
    
    // Read and examine FZP file
    console.log('\n📄 FZP File Analysis:');
    const fzpContent = fs.readFileSync('arduino_uno.fzp', 'utf8');
    
    // Extract connector information
    const connectorMatches = fzpContent.match(/<connector[^>]*id="([^"]*)"[^>]*name="([^"]*)"[^>]*>/g);
    if (connectorMatches) {
      console.log(`Found ${connectorMatches.length} connectors:`);
      connectorMatches.slice(0, 5).forEach(match => {
        const idMatch = match.match(/id="([^"]*)"/);
        const nameMatch = match.match(/name="([^"]*)"/);
        if (idMatch && nameMatch) {
          console.log(`  - ${nameMatch[1]} (${idMatch[1]})`);
        }
      });
      if (connectorMatches.length > 5) {
        console.log(`  ... and ${connectorMatches.length - 5} more`);
      }
    }
    
    // Read and examine SVG file
    console.log('\n🎨 SVG File Analysis:');
    const svgContent = fs.readFileSync('arduino_uno_breadboard.svg', 'utf8');
    
    // Look for different element types that could be pins
    const circleMatches = svgContent.match(/<circle[^>]*>/g);
    const rectMatches = svgContent.match(/<rect[^>]*>/g);
    const pathMatches = svgContent.match(/<path[^>]*>/g);
    const ellipseMatches = svgContent.match(/<ellipse[^>]*>/g);
    
    console.log(`Element counts:`);
    console.log(`  - Circles: ${circleMatches ? circleMatches.length : 0}`);
    console.log(`  - Rectangles: ${rectMatches ? rectMatches.length : 0}`);
    console.log(`  - Paths: ${pathMatches ? pathMatches.length : 0}`);
    console.log(`  - Ellipses: ${ellipseMatches ? ellipseMatches.length : 0}`);
    
    // Look for elements with connector IDs
    const connectorIds = ['connector0pin', 'connector1pin', 'connector2pin', 'connector3pin', 'connector4pin'];
    
    console.log('\n🔍 Pin Element Analysis:');
    connectorIds.forEach(id => {
      const idPattern = new RegExp(`id="${id}"`, 'g');
      const matches = svgContent.match(idPattern);
      if (matches) {
        // Find the element containing this ID
        const elementMatch = svgContent.match(new RegExp(`<[^>]*id="${id}"[^>]*>`, 'g'));
        if (elementMatch) {
          console.log(`  ${id}: ${elementMatch[0]}`);
        }
      } else {
        console.log(`  ${id}: Not found`);
      }
    });
    
    // Look for any elements that might be pin holes
    console.log('\n🕳️  Potential Pin Hole Elements:');
    const pinHolePatterns = [
      /<circle[^>]*id="[^"]*pin[^"]*"[^>]*>/g,
      /<rect[^>]*id="[^"]*pin[^"]*"[^>]*>/g,
      /<path[^>]*id="[^"]*pin[^"]*"[^>]*>/g,
      /<ellipse[^>]*id="[^"]*pin[^"]*"[^>]*>/g
    ];
    
    pinHolePatterns.forEach((pattern, index) => {
      const matches = svgContent.match(pattern);
      if (matches && matches.length > 0) {
        const elementType = ['circle', 'rect', 'path', 'ellipse'][index];
        console.log(`  ${elementType.toUpperCase()} elements with 'pin' in ID: ${matches.length}`);
        matches.slice(0, 3).forEach(match => {
          console.log(`    ${match}`);
        });
        if (matches.length > 3) {
          console.log(`    ... and ${matches.length - 3} more`);
        }
      }
    });
    
    // Clean up
    fs.unlinkSync('arduino_uno.fzp');
    fs.unlinkSync('arduino_uno_breadboard.svg');
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

examineArduinoPins();
