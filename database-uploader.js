const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const SVGProcessor = require('./utils/svgProcessor');

class DatabaseUploader {
  constructor(apiBaseUrl = 'http://localhost:5000', adminToken = null) {
    this.apiBaseUrl = apiBaseUrl;
    this.adminToken = adminToken;
    this.uploadedBoards = [];
    this.failedUploads = [];
  }

  // Get admin token by logging in
  async getAdminToken() {
    if (this.adminToken) {
      return this.adminToken;
    }

    return new Promise((resolve, reject) => {
      const loginData = JSON.stringify({
        username: 'admin',
        password: 'admin123'
      });

      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (res.statusCode === 200 && response.token) {
              this.adminToken = response.token;
              console.log('✅ Admin authentication successful');
              resolve(response.token);
            } else {
              reject(new Error(`Login failed: ${response.error || 'Unknown error'}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse login response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(loginData);
      req.end();
    });
  }

  // Upload board data to the database via API
  async uploadBoardToDatabase(boardData, pins) {
    try {
      const token = await this.getAdminToken();
      
      const uploadData = {
        boardData: {
          name: boardData.name,
          description: boardData.description,
          manufacturer: boardData.manufacturer,
          package_type: boardData.package_type,
          pin_count: boardData.pin_count,
          voltage_range: boardData.voltage_range,
          clock_speed: boardData.clock_speed,
          flash_memory: boardData.flash_memory,
          ram: boardData.ram
        },
        fritzingData: {
          pins: pins,
          displaySVG: boardData.svg_content,
          displayViewType: boardData.view_type,
          totalPins: boardData.pin_count
        }
      };

      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(uploadData);
        
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/admin/boards/from-fritzing',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': `Bearer ${token}`
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (res.statusCode === 200 || res.statusCode === 201) {
                console.log(`✅ Successfully uploaded: ${boardData.name}`);
                resolve(response);
              } else {
                const errorMsg = `API Error: ${res.statusCode} - ${response.error || data}`;
                console.error(`❌ Upload failed for ${boardData.name}: ${errorMsg}`);
                reject(new Error(errorMsg));
              }
            } catch (error) {
              const errorMsg = `Failed to parse API response: ${data}`;
              console.error(`❌ Upload failed for ${boardData.name}: ${errorMsg}`);
              reject(new Error(errorMsg));
            }
          });
        });

        req.on('error', (error) => {
          console.error(`❌ Upload failed for ${boardData.name}: ${error.message}`);
          reject(error);
        });

        req.write(postData);
        req.end();
      });
    } catch (error) {
      console.error(`❌ Failed to upload ${boardData.name}:`, error.message);
      throw error;
    }
  }

  // Process and upload a single FZPZ file
  async processAndUploadFZPZ(filePath, fileName) {
    try {
      console.log(`\n📦 Processing ${fileName}...`);
      
      // Process the FZPZ file
      const processor = new SVGProcessor();
      const processedData = await processor.processFritzingFile(filePath);
      
      if (!processedData) {
        throw new Error('Failed to process FZPZ file');
      }

      console.log(`✓ Processed ${fileName} - Found ${processedData.totalPins} pins`);

      // Prepare board data
      const boardData = {
        name: processedData.boardMetadata.title || fileName.replace('.fzpz', ''),
        description: processedData.boardMetadata.description || '',
        manufacturer: processedData.boardMetadata.manufacturer || 'Unknown',
        package_type: processedData.boardMetadata.package_type || 'Unknown',
        voltage_range: processedData.boardMetadata.voltage_range || '3.3V',
        clock_speed: processedData.boardMetadata.clock_speed || 'Unknown',
        flash_memory: processedData.boardMetadata.flash_memory || 'Unknown',
        ram: processedData.boardMetadata.ram || 'Unknown',
        pin_count: processedData.totalPins,
        svg_content: processedData.displaySVG,
        view_type: processedData.displayViewType
      };

      // Upload to database
      const uploadResult = await this.uploadBoardToDatabase(boardData, processedData.pins);
      
      return {
        success: true,
        fileName,
        boardData,
        pins: processedData.pins,
        uploadResult
      };

    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
      return {
        success: false,
        fileName,
        error: error.message
      };
    }
  }

  // Upload multiple FZPZ files
  async uploadMultipleFZPZFiles(filePaths) {
    console.log(`🚀 Starting database upload for ${filePaths.length} files...\n`);
    
    this.uploadedBoards = [];
    this.failedUploads = [];

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const fileName = path.basename(filePath);
      
      console.log(`\n--- Processing ${i + 1}/${filePaths.length}: ${fileName} ---`);
      
      try {
        const result = await this.processAndUploadFZPZ(filePath, fileName);
        
        if (result.success) {
          this.uploadedBoards.push(result);
        } else {
          this.failedUploads.push(result);
        }
      } catch (error) {
        console.error(`❌ Fatal error processing ${fileName}:`, error.message);
        this.failedUploads.push({
          success: false,
          fileName,
          error: error.message
        });
      }
    }

    // Print summary
    this.printUploadSummary();
    
    return {
      uploaded: this.uploadedBoards,
      failed: this.failedUploads
    };
  }

  // Print upload summary
  printUploadSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`✅ Successfully uploaded: ${this.uploadedBoards.length} boards`);
    console.log(`❌ Failed uploads: ${this.failedUploads.length} boards`);
    
    if (this.uploadedBoards.length > 0) {
      console.log('\n📋 Successfully uploaded boards:');
      this.uploadedBoards.forEach((item, index) => {
        console.log(`${index + 1}. ${item.boardData.name}`);
        console.log(`   - Pins: ${item.boardData.pin_count}`);
        console.log(`   - Manufacturer: ${item.boardData.manufacturer}`);
        console.log(`   - Package: ${item.boardData.package_type}`);
      });
    }

    if (this.failedUploads.length > 0) {
      console.log('\n❌ Failed uploads:');
      this.failedUploads.forEach((item, index) => {
        console.log(`${index + 1}. ${item.fileName}: ${item.error}`);
      });
    }

    // Group by manufacturer
    if (this.uploadedBoards.length > 0) {
      const byManufacturer = {};
      this.uploadedBoards.forEach(item => {
        const manufacturer = item.boardData.manufacturer || 'Unknown';
        if (!byManufacturer[manufacturer]) {
          byManufacturer[manufacturer] = [];
        }
        byManufacturer[manufacturer].push(item);
      });

      console.log('\n📈 Summary by manufacturer:');
      Object.keys(byManufacturer).forEach(manufacturer => {
        console.log(`   ${manufacturer}: ${byManufacturer[manufacturer].length} boards`);
      });
    }
  }

  // Get uploaded boards
  getUploadedBoards() {
    return this.uploadedBoards;
  }

  // Get failed uploads
  getFailedUploads() {
    return this.failedUploads;
  }
}

module.exports = DatabaseUploader;
