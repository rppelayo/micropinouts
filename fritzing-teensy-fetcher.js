const https = require('https');
const fs = require('fs');
const path = require('path');
const SVGProcessor = require('./utils/svgProcessor');
const JSZip = require('jszip');
const DatabaseUploader = require('./database-uploader');

class FritzingTeensyFetcher {
  constructor(apiBaseUrl = 'http://localhost:5000') {
    this.fzpBaseUrl = 'https://raw.githubusercontent.com/fritzing/fritzing-parts/develop/core/';
    this.svgBaseUrl = 'https://raw.githubusercontent.com/fritzing/fritzing-parts/develop/svg/core/breadboard/';
    this.fzpApiUrl = 'https://api.github.com/repos/fritzing/fritzing-parts/contents/core';
    this.svgApiUrl = 'https://api.github.com/repos/fritzing/fritzing-parts/contents/svg/core/breadboard';
    this.apiBaseUrl = apiBaseUrl;
    this.uploadedBoards = [];
    this.tempDir = path.join(__dirname, 'temp');
    this.databaseUploader = new DatabaseUploader(apiBaseUrl);
  }

  // Ensure temp directory exists
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Fetch the list of files from both FZP and SVG directories
  async fetchFileList() {
    try {
      // Fetch FZP files
      const fzpFiles = await this.fetchFilesFromUrl(this.fzpApiUrl);
      const teensyFzpFiles = fzpFiles.filter(file => 
        file.name.toLowerCase().includes('teensy') && file.name.endsWith('.fzp')
      );

      // Fetch SVG files
      const svgFiles = await this.fetchFilesFromUrl(this.svgApiUrl);
      const teensySvgFiles = svgFiles.filter(file => 
        file.name.toLowerCase().includes('teensy') && file.name.endsWith('.svg')
      );

      console.log(`Found ${teensyFzpFiles.length} Teensy FZP files:`);
      teensyFzpFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
      });

      console.log(`\nFound ${teensySvgFiles.length} Teensy SVG files:`);
      teensySvgFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
      });

      return {
        fzpFiles: teensyFzpFiles,
        svgFiles: teensySvgFiles
      };
    } catch (error) {
      throw new Error(`Failed to fetch file lists: ${error.message}`);
    }
  }

  // Helper method to fetch files from a GitHub API URL
  async fetchFilesFromUrl(url) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'MicroPinout-Teensy-Fetcher/1.0',
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
  }

  // Download a single file (FZP or SVG)
  async downloadFile(fileName, isSvg = false) {
    return new Promise((resolve, reject) => {
      const baseUrl = isSvg ? this.svgBaseUrl : this.fzpBaseUrl;
      const fileUrl = `${baseUrl}${fileName}`;
      const localPath = path.join(this.tempDir, fileName);
      
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

  // Group files by Teensy board (fzp + associated svg files)
  groupTeensyFiles(fzpFiles, svgFiles) {
    const groups = {};
    
    // Add FZP files to groups
    fzpFiles.forEach(file => {
      const baseName = this.extractBaseName(file.name);
      if (!groups[baseName]) {
        groups[baseName] = {
          fzp: null,
          svgs: []
        };
      }
      groups[baseName].fzp = file;
    });
    
    // Add matching SVG files to groups
    svgFiles.forEach(file => {
      const baseName = this.extractBaseName(file.name);
      if (groups[baseName]) {
        groups[baseName].svgs.push(file);
      }
    });
    
    // Filter out groups that don't have both fzp and svg files
    const completeGroups = {};
    Object.keys(groups).forEach(key => {
      if (groups[key].fzp && groups[key].svgs.length > 0) {
        completeGroups[key] = groups[key];
      }
    });
    
    return completeGroups;
  }

  // Extract base name for matching FZP and SVG files
  extractBaseName(fileName) {
    // Remove file extension
    let baseName = fileName.replace(/\.(fzp|svg)$/, '');
    
    // For SVG files, remove _breadboard suffix
    if (fileName.endsWith('.svg')) {
      baseName = baseName.replace(/_breadboard$/, '');
    }
    
    // Normalize common variations for Teensy
    baseName = baseName
      .replace(/\(fix\)/g, '')
      .replace(/\(1\)/g, '')
      .replace(/-bottom$/g, '')
      .replace(/-old$/g, '')
      .replace(/-tht$/g, '')
      .replace(/-simple$/g, '')
      .replace(/-gen2$/g, '')
      .replace(/-pcb-shape$/g, '')
      .replace(/-one-layer$/g, '')
      .replace(/-two-layer$/g, '')
      .replace(/-r3$/g, '')
      .replace(/-r4$/g, '')
      .replace(/-3\.0$/g, '')
      .replace(/-3\.1$/g, '')
      .replace(/-3\.2$/g, '')
      .replace(/-3\.5$/g, '')
      .replace(/-3\.6$/g, '')
      .replace(/-4\.0$/g, '')
      .replace(/-4\.1$/g, '')
      .replace(/-lc$/g, '')
      .replace(/-micro$/g, '')
      .replace(/-mini$/g, '')
      .replace(/-plus$/g, '')
      .replace(/-breakout$/g, '')
      .replace(/-shield$/g, '')
      .replace(/-sensor$/g, '')
      .replace(/-module$/g, '')
      .replace(/-board$/g, '')
      .replace(/-usb-adapter$/g, '')
      .replace(/-mini-usb-adapter$/g, '')
      .replace(/-rev\d+$/g, '')
      .replace(/-v\d+$/g, '')
      .replace(/-final_\d+$/g, '')
      .replace(/_3\.3v$/g, '')
      .replace(/_5v$/g, '')
      .replace(/_1$/g, '')
      .replace(/_v\d+$/g, '')
      .replace(/\(rev1\)_v1$/g, '')
      .toLowerCase()
      .trim();
    
    return baseName;
  }

  // Create FZPZ file from fzp and svg files
  async createFZPZFile(groupName, groupFiles) {
    try {
      const zip = new JSZip();
      
      // Add the FZP file
      const fzpPath = await this.downloadFile(groupFiles.fzp.name, false);
      const fzpContent = fs.readFileSync(fzpPath, 'utf8');
      zip.file(groupFiles.fzp.name, fzpContent);
      
      // Add SVG files
      for (const svgFile of groupFiles.svgs) {
        const svgPath = await this.downloadFile(svgFile.name, true);
        const svgContent = fs.readFileSync(svgPath, 'utf8');
        zip.file(svgFile.name, svgContent);
      }
      
      // Generate the FZPZ file
      const fzpzContent = await zip.generateAsync({ type: 'nodebuffer' });
      const fzpzPath = path.join(this.tempDir, `${groupName}.fzpz`);
      fs.writeFileSync(fzpzPath, fzpzContent);
      
      console.log(`✓ Created FZPZ: ${groupName}.fzpz`);
      return fzpzPath;
      
    } catch (error) {
      console.error(`✗ Failed to create FZPZ for ${groupName}:`, error.message);
      return null;
    }
  }

  // Process a created FZPZ file
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

  // Upload board data to the system
  async uploadToSystem(processedData, fileName) {
    try {
      const boardData = {
        name: processedData.boardMetadata.title || fileName.replace('.fzpz', ''),
        description: processedData.boardMetadata.description || '',
        manufacturer: processedData.boardMetadata.manufacturer || 'PJRC',
        package_type: processedData.boardMetadata.package_type || 'Unknown',
        voltage_range: processedData.boardMetadata.voltage_range || '3.3V',
        clock_speed: processedData.boardMetadata.clock_speed || '600MHz',
        flash_memory: processedData.boardMetadata.flash_memory || '2MB',
        ram: processedData.boardMetadata.ram || '1MB',
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
    if (fs.existsSync(this.tempDir)) {
      const files = fs.readdirSync(this.tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.tempDir, file));
      });
      fs.rmdirSync(this.tempDir);
      console.log('🧹 Cleaned up temporary files');
    }
  }

  // Main execution method
  async run() {
    try {
      console.log('🚀 Starting Fritzing Teensy Fetcher...\n');
      
      this.ensureTempDir();
      
      // Step 1: Fetch file lists
      console.log('📋 Fetching Teensy files from Fritzing repository...');
      const fileLists = await this.fetchFileList();
      
      if (fileLists.fzpFiles.length === 0) {
        console.log('❌ No Teensy FZP files found in the repository');
        return;
      }

      // Step 2: Group files by Teensy board
      console.log('\n📦 Grouping files by Teensy board...');
      const groupedFiles = this.groupTeensyFiles(fileLists.fzpFiles, fileLists.svgFiles);
      const groupNames = Object.keys(groupedFiles);
      
      console.log(`Found ${groupNames.length} complete Teensy boards:`);
      groupNames.forEach((name, index) => {
        console.log(`${index + 1}. ${name} (${groupedFiles[name].svgs.length} SVG files)`);
      });

      if (groupNames.length === 0) {
        console.log('❌ No complete Teensy boards found (missing FZP or SVG files)');
        return;
      }

      console.log(`\n📥 Processing ${groupNames.length} Teensy boards...\n`);
      
      // Step 3: Process each Teensy board
      const boardsToProcess = groupNames;
      
      for (let i = 0; i < boardsToProcess.length; i++) {
        const groupName = boardsToProcess[i];
        const groupFiles = groupedFiles[groupName];
        
        console.log(`\n--- Processing ${i + 1}/${boardsToProcess.length}: ${groupName} ---`);
        
        try {
          // Create FZPZ file
          const fzpzPath = await this.createFZPZFile(groupName, groupFiles);
          
          if (fzpzPath) {
            // Process FZPZ file
            const processedData = await this.processFZPZFile(fzpzPath);
            
            if (processedData) {
              // Upload to system
              const uploadResult = await this.uploadToSystem(processedData, `${groupName}.fzpz`);
              
              if (uploadResult.success) {
                this.uploadedBoards.push({
                  fileName: `${groupName}.fzpz`,
                  boardData: uploadResult.boardData,
                  pins: uploadResult.pins
                });
              }
            }
            
            // Clean up FZPZ file
            fs.unlinkSync(fzpzPath);
          }
          
        } catch (error) {
          console.error(`❌ Error processing ${groupName}:`, error.message);
        }
      }

      // Step 4: Summary
      console.log('\n🎉 Processing Complete!');
      console.log(`✅ Successfully processed: ${this.uploadedBoards.length}/${boardsToProcess.length} Teensy boards`);
      
      if (this.uploadedBoards.length > 0) {
        console.log('\n📊 Summary of processed Teensy boards:');
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

// Run the fetcher if this script is executed directly
if (require.main === module) {
  const fetcher = new FritzingTeensyFetcher();
  fetcher.run().catch(console.error);
}

module.exports = FritzingTeensyFetcher;
