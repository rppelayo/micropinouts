const https = require('https');

async function debugFritzingFiles() {
  console.log('🔍 Debugging Fritzing repository structure...\n');
  
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'MicroPinout-Debugger/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get('https://api.github.com/repos/fritzing/fritzing-parts/contents/core', options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const files = JSON.parse(data);
          
          // Get all files
          const allFiles = files.map(f => f.name);
          
          // Filter for Arduino-related files
          const arduinoFiles = files.filter(file => 
            file.name.toLowerCase().includes('arduino')
          );
          
          // Separate FZP and SVG files
          const fzpFiles = arduinoFiles.filter(f => f.name.endsWith('.fzp'));
          const svgFiles = arduinoFiles.filter(f => f.name.endsWith('.svg'));
          
          console.log(`Total files in repository: ${allFiles.length}`);
          console.log(`Arduino-related files: ${arduinoFiles.length}`);
          console.log(`Arduino FZP files: ${fzpFiles.length}`);
          console.log(`Arduino SVG files: ${svgFiles.length}\n`);
          
          console.log('Arduino FZP files:');
          fzpFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.name}`);
          });
          
          console.log('\nArduino SVG files:');
          svgFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.name}`);
          });
          
          // Try to match FZP files with SVG files
          console.log('\n🔗 Attempting to match FZP files with SVG files:');
          fzpFiles.forEach(fzpFile => {
            const baseName = fzpFile.name.replace('.fzp', '');
            const matchingSvgs = svgFiles.filter(svgFile => 
              svgFile.name.toLowerCase().includes(baseName.toLowerCase()) ||
              baseName.toLowerCase().includes(svgFile.name.replace('.svg', '').toLowerCase())
            );
            
            console.log(`\n${fzpFile.name}:`);
            if (matchingSvgs.length > 0) {
              matchingSvgs.forEach(svg => {
                console.log(`  ✓ ${svg.name}`);
              });
            } else {
              console.log(`  ❌ No matching SVG files found`);
            }
          });
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Run the debug if this script is executed directly
if (require.main === module) {
  debugFritzingFiles().catch(console.error);
}

module.exports = debugFritzingFiles;
