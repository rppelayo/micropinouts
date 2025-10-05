const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');

function extractSchematicSVG(filePath) {
  console.log('Extracting schematic SVG from ESP32-CAM file...\n');
  
  yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
    if (err) {
      console.error('Error opening file:', err);
      return;
    }

    zipfile.readEntry();
    
    zipfile.on('entry', (entry) => {
      if (entry.fileName.toLowerCase().includes('schematic') && entry.fileName.toLowerCase().endsWith('.svg')) {
        console.log(`Found schematic SVG: ${entry.fileName}`);
        
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            console.error('Error reading SVG:', err);
            return;
          }

          let svgContent = '';
          readStream.on('data', (chunk) => {
            svgContent += chunk.toString();
          });

          readStream.on('end', () => {
            // Save the SVG content to a file
            const outputPath = path.join(__dirname, 'esp32-schematic.svg');
            fs.writeFileSync(outputPath, svgContent);
            console.log(`Schematic SVG saved to: ${outputPath}`);
            
            // Now test parsing it
            testSVGParsing(outputPath);
          });
        });
        
        return; // Only extract the first schematic file
      }
      
      zipfile.readEntry();
    });
  });
}

async function testSVGParsing(svgPath) {
  console.log('\nTesting SVG parsing...');
  
  const FritzingSVGParser = require('./utils/svgParser');
  const parser = new FritzingSVGParser();
  
  try {
    const result = await parser.parseFritzingFile(svgPath);
    
    console.log('\n=== PARSING RESULTS ===');
    console.log('Total Pins Found:', result.totalPins);
    console.log('View Type:', result.viewType);
    console.log('Pins Array Length:', result.pins ? result.pins.length : 'undefined');
    
    if (result.pins && result.pins.length > 0) {
      console.log('\n=== PIN DETAILS ===');
      result.pins.forEach((pin, index) => {
        console.log(`Pin ${index + 1}:`);
        console.log(`  Number: ${pin.pin_number}`);
        console.log(`  Name: ${pin.pin_name}`);
        console.log(`  Position: (${pin.position_x}, ${pin.position_y})`);
        console.log(`  Functions: ${pin.functions}`);
        console.log(`  Voltage Range: ${pin.voltage_range}`);
        console.log(`  Group: ${pin.group}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No pins found!');
    }
    
    console.log('✅ SVG parsing completed');
    
  } catch (error) {
    console.error('❌ Error parsing SVG:', error.message);
  }
}

// Run the extraction
const filePath = path.join(__dirname, 'resources', 'ESP32-CAM_FRONT.fzpz');
extractSchematicSVG(filePath);

