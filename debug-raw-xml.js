const FritzingSVGParser = require('./utils/svgParser');
const fs = require('fs');

async function debugRawXML() {
  console.log('Debugging raw XML parsing...\n');
  
  const svgContent = fs.readFileSync('./esp32-schematic.svg', 'utf8');
  const parser = new FritzingSVGParser();
  
  try {
    // Parse XML directly without processing
    const result = await parser.parser.parseStringPromise(svgContent);
    
    console.log('=== RAW XML STRUCTURE ===');
    console.log('Top level keys:', Object.keys(result));
    
    // Navigate to the structure we know exists
    if (result.g && result.g.g && result.g.g.g && result.g.g.g.g) {
      const gElements = Array.isArray(result.g.g.g.g) ? result.g.g.g.g : [result.g.g.g.g];
      
      console.log(`\nFound ${gElements.length} g elements`);
      
      gElements.forEach((g, gIndex) => {
        console.log(`\nG element ${gIndex}:`);
        console.log('Keys:', Object.keys(g));
        
        if (g.line) {
          const lines = Array.isArray(g.line) ? g.line : [g.line];
          console.log(`  Found ${lines.length} line elements`);
          
          lines.forEach((line, lineIndex) => {
            if (line.id && line.id.includes('connector') && line.id.includes('pin')) {
              console.log(`    Line ${lineIndex}: ${line.id}`);
              console.log(`      Position: (${line.x1}, ${line.y1}) to (${line.x2}, ${line.y2})`);
            }
          });
        }
        
        if (g.text) {
          const texts = Array.isArray(g.text) ? g.text : [g.text];
          console.log(`  Found ${texts.length} text elements`);
          
          texts.forEach((text, textIndex) => {
            const label = parser.extractLabelFromElement(text);
            console.log(`    Text ${textIndex}: "${label}" at (${text.x}, ${text.y})`);
          });
        }
      });
    } else {
      console.log('Could not navigate to expected structure');
      console.log('Available paths:');
      if (result.g) console.log('  g exists');
      if (result.g && result.g.g) console.log('  g.g exists');
      if (result.g && result.g.g && result.g.g.g) console.log('  g.g.g exists');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugRawXML();

