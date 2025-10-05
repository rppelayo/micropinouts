const https = require('https');
const fs = require('fs');
const path = require('path');
const { processFritzingFile } = require('./utils/svgProcessor');

class AdafruitFZPZFetcher {
  constructor() {
    this.baseUrl = 'https://raw.githubusercontent.com/adafruit/Fritzing-Library/master/parts/';
    this.apiUrl = 'https://api.github.com/repos/adafruit/Fritzing-Library/contents/parts';
    this.downloadedFiles = [];
  }

  // Fetch the list of files from the GitHub API
  async fetchFileList() {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'MicroPinout-FZPZ-Fetcher/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      https.get(this.apiUrl, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const files = JSON.parse(data);
            const fzpzFiles = files
              .filter(file => file.name.endsWith('.fzpz'))
              .slice(0, 5); // Get first 5 FZPZ files
            
            console.log(`Found ${fzpzFiles.length} FZPZ files to download:`);
            fzpzFiles.forEach((file, index) => {
              console.log(`${index + 1}. ${file.name}`);
            });
            
            resolve(fzpzFiles);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  // Download a single FZPZ file
  async downloadFZPZFile(fileName) {
    return new Promise((resolve, reject) => {
      const fileUrl = `${this.baseUrl}${fileName}`;
      const localPath = path.join(__dirname, 'temp', fileName);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(localPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      console.log(`Downloading ${fileName}...`);
      
      const file = fs.createWriteStream(localPath);
      
      https.get(fileUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${fileName}: ${res.statusCode}`));
          return;
        }
        
        res.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${fileName}`);
          resolve(localPath);
        });
        
        file.on('error', (error) => {
          fs.unlink(localPath, () => {}); // Delete the file on error
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  // Process a downloaded FZPZ file using existing processor
  async processFZPZFile(filePath) {
    try {
      console.log(`Processing ${path.basename(filePath)}...`);
      const result = await processFritzingFile(filePath);
      console.log(`✓ Processed ${path.basename(filePath)} - Found ${result.totalPins} pins`);
      return result;
    } catch (error) {
      console.error(`✗ Failed to process ${path.basename(filePath)}:`, error.message);
      return null;
    }
  }

  // Upload processed data to the system
  async uploadToSystem(processedData, fileName) {
    try {
      const boardData = {
        name: processedData.boardMetadata.title || fileName.replace('.fzpz', ''),
        description: processedData.boardMetadata.description || '',
        manufacturer: processedData.boardMetadata.manufacturer || 'Adafruit',
        package_type: processedData.boardMetadata.package_type || 'Unknown',
        voltage_range: processedData.boardMetadata.voltage_range || '3.3V',
        clock_speed: processedData.boardMetadata.clock_speed || 'Unknown',
        flash_memory: processedData.boardMetadata.flash_memory || 'Unknown',
        ram: processedData.boardMetadata.ram || 'Unknown',
        pin_count: processedData.totalPins,
        svg_content: processedData.displaySVG,
        view_type: processedData.displayViewType
      };

      // Simulate API call (replace with actual API endpoint)
      console.log(`📤 Would upload board: ${boardData.name}`);
      console.log(`   - Pins: ${boardData.pin_count}`);
      console.log(`   - Manufacturer: ${boardData.manufacturer}`);
      console.log(`   - Package: ${boardData.package_type}`);
      
      return {
        success: true,
        boardData,
        pins: processedData.pins
      };
    } catch (error) {
      console.error(`✗ Failed to upload ${fileName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Clean up temporary files
  cleanup() {
    const tempDir = path.join(__dirname, 'temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      fs.rmdirSync(tempDir);
      console.log('🧹 Cleaned up temporary files');
    }
  }

  // Main execution method
  async run() {
    try {
      console.log('🚀 Starting Adafruit FZPZ Fetcher...\n');
      
      // Step 1: Fetch file list
      console.log('📋 Fetching file list from Adafruit repository...');
      const fzpzFiles = await this.fetchFileList();
      
      if (fzpzFiles.length === 0) {
        console.log('❌ No FZPZ files found in the repository');
        return;
      }

      console.log(`\n📥 Downloading ${fzpzFiles.length} files...\n`);
      
      // Step 2: Download and process each file
      for (let i = 0; i < fzpzFiles.length; i++) {
        const file = fzpzFiles[i];
        console.log(`\n--- Processing ${i + 1}/${fzpzFiles.length}: ${file.name} ---`);
        
        try {
          // Download file
          const localPath = await this.downloadFZPZFile(file.name);
          
          // Process file
          const processedData = await this.processFZPZFile(localPath);
          
          if (processedData) {
            // Upload to system
            const uploadResult = await this.uploadToSystem(processedData, file.name);
            
            if (uploadResult.success) {
              this.downloadedFiles.push({
                fileName: file.name,
                boardData: uploadResult.boardData,
                pins: uploadResult.pins
              });
            }
          }
          
          // Clean up downloaded file
          fs.unlinkSync(localPath);
          
        } catch (error) {
          console.error(`❌ Error processing ${file.name}:`, error.message);
        }
      }

      // Step 3: Summary
      console.log('\n🎉 Processing Complete!');
      console.log(`✅ Successfully processed: ${this.downloadedFiles.length}/${fzpzFiles.length} files`);
      
      if (this.downloadedFiles.length > 0) {
        console.log('\n📊 Summary of processed boards:');
        this.downloadedFiles.forEach((item, index) => {
          console.log(`${index + 1}. ${item.boardData.name}`);
          console.log(`   - Pins: ${item.boardData.pin_count}`);
          console.log(`   - Manufacturer: ${item.boardData.manufacturer}`);
          console.log(`   - Package: ${item.boardData.package_type}\n`);
        });
      }

    } catch (error) {
      console.error('❌ Fatal error:', error.message);
    } finally {
      this.cleanup();
    }
  }
}

// Run the fetcher if this script is executed directly
if (require.main === module) {
  const fetcher = new AdafruitFZPZFetcher();
  fetcher.run().catch(console.error);
}

module.exports = AdafruitFZPZFetcher;
