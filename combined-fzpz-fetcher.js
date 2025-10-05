const AdafruitUploader = require('./adafruit-uploader');
const FritzingArduinoFetcher = require('./fritzing-arduino-fetcher');

class CombinedFZPZFetcher {
  constructor(apiBaseUrl = 'http://localhost:5000') {
    this.apiBaseUrl = apiBaseUrl;
    this.allUploadedBoards = [];
  }

  async run() {
    console.log('🚀 Starting Combined FZPZ Fetcher...\n');
    console.log('This will fetch Arduino parts from both:');
    console.log('1. Adafruit Fritzing Library (https://github.com/adafruit/Fritzing-Library)');
    console.log('2. Official Fritzing Parts (https://github.com/fritzing/fritzing-parts)\n');

    try {
      // Step 1: Fetch from Adafruit repository
      console.log('='.repeat(60));
      console.log('📦 FETCHING FROM ADAFRUIT REPOSITORY');
      console.log('='.repeat(60));
      
      const adafruitFetcher = new AdafruitUploader(this.apiBaseUrl);
      await adafruitFetcher.run();
      
      if (adafruitFetcher.uploadedBoards.length > 0) {
        this.allUploadedBoards.push(...adafruitFetcher.uploadedBoards);
        console.log(`✅ Adafruit: ${adafruitFetcher.uploadedBoards.length} boards processed`);
      }

      // Step 2: Fetch from Fritzing repository
      console.log('\n' + '='.repeat(60));
      console.log('📦 FETCHING FROM FRITZING REPOSITORY');
      console.log('='.repeat(60));
      
      const fritzingFetcher = new FritzingArduinoFetcher(this.apiBaseUrl);
      await fritzingFetcher.run();
      
      if (fritzingFetcher.uploadedBoards.length > 0) {
        this.allUploadedBoards.push(...fritzingFetcher.uploadedBoards);
        console.log(`✅ Fritzing: ${fritzingFetcher.uploadedBoards.length} boards processed`);
      }

      // Step 3: Final Summary
      console.log('\n' + '='.repeat(60));
      console.log('🎉 COMBINED FETCH COMPLETE');
      console.log('='.repeat(60));
      
      console.log(`📊 Total boards processed: ${this.allUploadedBoards.length}`);
      
      if (this.allUploadedBoards.length > 0) {
        console.log('\n📋 Complete list of uploaded boards:');
        this.allUploadedBoards.forEach((item, index) => {
          console.log(`${index + 1}. ${item.boardData.name}`);
          console.log(`   - Source: ${item.fileName}`);
          console.log(`   - Pins: ${item.boardData.pin_count}`);
          console.log(`   - Manufacturer: ${item.boardData.manufacturer}`);
          console.log(`   - Package: ${item.boardData.package_type}\n`);
        });

        // Group by manufacturer
        const byManufacturer = {};
        this.allUploadedBoards.forEach(item => {
          const manufacturer = item.boardData.manufacturer || 'Unknown';
          if (!byManufacturer[manufacturer]) {
            byManufacturer[manufacturer] = [];
          }
          byManufacturer[manufacturer].push(item);
        });

        console.log('📈 Summary by manufacturer:');
        Object.keys(byManufacturer).forEach(manufacturer => {
          console.log(`   ${manufacturer}: ${byManufacturer[manufacturer].length} boards`);
        });
      }

    } catch (error) {
      console.error('❌ Fatal error in combined fetcher:', error.message);
    }
  }

  // Get all uploaded boards data
  getUploadedBoards() {
    return this.allUploadedBoards;
  }

  // Get boards by manufacturer
  getBoardsByManufacturer(manufacturer) {
    return this.allUploadedBoards.filter(item => 
      item.boardData.manufacturer?.toLowerCase().includes(manufacturer.toLowerCase())
    );
  }

  // Get boards by pin count range
  getBoardsByPinCount(minPins, maxPins) {
    return this.allUploadedBoards.filter(item => {
      const pinCount = item.boardData.pin_count;
      return pinCount >= minPins && pinCount <= maxPins;
    });
  }
}

// Run the combined fetcher if this script is executed directly
if (require.main === module) {
  const fetcher = new CombinedFZPZFetcher();
  fetcher.run().catch(console.error);
}

module.exports = CombinedFZPZFetcher;
