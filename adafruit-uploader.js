const https = require('https');
const fs = require('fs');
const path = require('path');
const SVGProcessor = require('./utils/svgProcessor');
const DatabaseUploader = require('./database-uploader');

class AdafruitUploader {
  constructor(apiBaseUrl = 'http://localhost:5000') {
    this.baseUrl = 'https://raw.githubusercontent.com/adafruit/Fritzing-Library/master/parts/';
    this.apiUrl = 'https://api.github.com/repos/adafruit/Fritzing-Library/contents/parts';
    this.apiBaseUrl = apiBaseUrl;
    this.uploadedBoards = [];
    this.databaseUploader = new DatabaseUploader(apiBaseUrl);
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
              .filter(file => file.name.endsWith('.fzpz'));
            
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
      const processor = new SVGProcessor();
      const result = await processor.processFritzingFile(filePath);
      console.log(`✓ Processed ${path.basename(filePath)} - Found ${result.totalPins} pins`);
      return result;
    } catch (error) {
      console.error(`✗ Failed to process ${path.basename(filePath)}:`, error.message);
      return null;
    }
  }

  // Upload board data to the system via API
  async uploadBoardToAPI(boardData) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(boardData);
      
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/boards/from-fritzing',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Bearer your-admin-token-here' // You'll need to set this
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (res.statusCode === 200 || res.statusCode === 201) {
              resolve(response);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${response.message || data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse API response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
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
        view_type: processedData.displayViewType,
        pins: processedData.pins
      };

      console.log(`📤 Uploading board: ${boardData.name}`);
      
      // Use the database uploader to upload to the actual database
      const uploadResult = await this.databaseUploader.uploadBoardToDatabase(boardData, processedData.pins);
      
      return {
        success: true,
        boardData,
        pins: processedData.pins,
        uploadResult
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
      console.log('🚀 Starting Adafruit FZPZ Uploader...\n');
      
      // Step 1: Fetch file list
      console.log('📋 Fetching file list from Adafruit repository...');
      const fzpzFiles = await this.fetchFileList();
      
      if (fzpzFiles.length === 0) {
        console.log('❌ No FZPZ files found in the repository');
        return;
      }

      console.log(`\n📥 Downloading and processing ${fzpzFiles.length} files...\n`);
      
      // Step 2: Download and process each file (limit to first 3 for testing)
      const filesToProcess = fzpzFiles.slice(0, 3);
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        console.log(`\n--- Processing ${i + 1}/${filesToProcess.length}: ${file.name} ---`);
        
        try {
          // Download file
          const localPath = await this.downloadFZPZFile(file.name);
          
          // Process file
          const processedData = await this.processFZPZFile(localPath);
          
          if (processedData) {
            // Upload to system
            const uploadResult = await this.uploadToSystem(processedData, file.name);
            
            if (uploadResult.success) {
              this.uploadedBoards.push({
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
      console.log('\n🎉 Upload Complete!');
      console.log(`✅ Successfully processed: ${this.uploadedBoards.length}/${filesToProcess.length} files`);
      
      if (this.uploadedBoards.length > 0) {
        console.log('\n📊 Summary of uploaded boards:');
        this.uploadedBoards.forEach((item, index) => {
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

// Run the uploader if this script is executed directly
if (require.main === module) {
  const uploader = new AdafruitUploader();
  uploader.run().catch(console.error);
}

module.exports = AdafruitUploader;
