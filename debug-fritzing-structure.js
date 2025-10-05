const https = require('https');

async function debugFritzingStructure() {
  console.log('🔍 Debugging Fritzing repository structure...\n');
  
  // First, let's check the main directory structure
  const checkDirectory = async (path = '') => {
    return new Promise((resolve, reject) => {
      const url = `https://api.github.com/repos/fritzing/fritzing-parts/contents/core${path}`;
      const options = {
        headers: {
          'User-Agent': 'MicroPinout-Debugger/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      https.get(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const files = JSON.parse(data);
            resolve(files);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  };

  try {
    // Check main directory
    console.log('📁 Checking main core directory...');
    const mainFiles = await checkDirectory();
    
    const directories = mainFiles.filter(f => f.type === 'dir');
    const svgFiles = mainFiles.filter(f => f.name.endsWith('.svg'));
    
    console.log(`Directories: ${directories.length}`);
    console.log(`SVG files in main: ${svgFiles.length}`);
    
    if (directories.length > 0) {
      console.log('\n📁 Subdirectories:');
      directories.forEach((dir, index) => {
        console.log(`${index + 1}. ${dir.name}`);
      });
    }
    
    if (svgFiles.length > 0) {
      console.log('\n🎨 SVG files in main directory:');
      svgFiles.slice(0, 10).forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
      });
      if (svgFiles.length > 10) {
        console.log(`... and ${svgFiles.length - 10} more`);
      }
    }
    
    // Check if there are any directories that might contain SVG files
    if (directories.length > 0) {
      console.log('\n🔍 Checking subdirectories for SVG files...');
      
      for (const dir of directories.slice(0, 5)) { // Check first 5 directories
        try {
          const subFiles = await checkDirectory(`/${dir.name}`);
          const subSvgFiles = subFiles.filter(f => f.name.endsWith('.svg'));
          
          if (subSvgFiles.length > 0) {
            console.log(`\n📁 ${dir.name}: ${subSvgFiles.length} SVG files`);
            subSvgFiles.slice(0, 5).forEach((file, index) => {
              console.log(`  ${index + 1}. ${file.name}`);
            });
            if (subSvgFiles.length > 5) {
              console.log(`  ... and ${subSvgFiles.length - 5} more`);
            }
          }
        } catch (error) {
          console.log(`❌ Error checking ${dir.name}: ${error.message}`);
        }
      }
    }
    
    // Look for any files that might be related to Arduino
    console.log('\n🔍 Looking for Arduino-related files in main directory...');
    const arduinoFiles = mainFiles.filter(f => 
      f.name.toLowerCase().includes('arduino') && 
      (f.name.endsWith('.svg') || f.name.endsWith('.fzp'))
    );
    
    console.log(`Found ${arduinoFiles.length} Arduino-related files:`);
    arduinoFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${file.type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug if this script is executed directly
if (require.main === module) {
  debugFritzingStructure().catch(console.error);
}

module.exports = debugFritzingStructure;
