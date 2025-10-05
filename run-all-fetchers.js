const AdafruitUploader = require('./adafruit-uploader');
const ArduinoFetcher = require('./fritzing-arduino-fetcher');
const RaspberryPiFetcher = require('./fritzing-raspberry-pi-fetcher');
const SparkFunFetcher = require('./fritzing-sparkfun-fetcher');
const WemosFetcher = require('./fritzing-wemos-fetcher');
const TeensyFetcher = require('./fritzing-teensy-fetcher');
const ESP8266Fetcher = require('./fritzing-esp8266-fetcher');

async function runAllFetchers() {
  console.log('🚀 Starting All Fetchers Upload to Database...\n');
  
  const fetchers = [
    { name: 'Adafruit', fetcher: new AdafruitUploader() },
    { name: 'Arduino', fetcher: new ArduinoFetcher() },
    { name: 'Raspberry Pi', fetcher: new RaspberryPiFetcher() },
    { name: 'SparkFun', fetcher: new SparkFunFetcher() },
    { name: 'Wemos', fetcher: new WemosFetcher() },
    { name: 'Teensy', fetcher: new TeensyFetcher() },
    { name: 'ESP8266', fetcher: new ESP8266Fetcher() }
  ];
  
  let totalUploaded = 0;
  const results = [];
  
  for (const { name, fetcher } of fetchers) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Processing ${name} boards...`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
      await fetcher.run();
      
      const uploadedCount = fetcher.uploadedBoards ? fetcher.uploadedBoards.length : 0;
      totalUploaded += uploadedCount;
      
      results.push({
        name,
        success: true,
        count: uploadedCount,
        boards: fetcher.uploadedBoards || []
      });
      
      console.log(`\n✅ ${name} completed: ${uploadedCount} boards uploaded`);
      
    } catch (error) {
      console.error(`❌ ${name} failed:`, error.message);
      results.push({
        name,
        success: false,
        error: error.message,
        count: 0,
        boards: []
      });
    }
  }
  
  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 ALL FETCHERS COMPLETED');
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Total boards uploaded: ${totalUploaded}`);
  console.log(`\n📋 Summary by manufacturer:`);
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.name}: ${result.count} boards`);
      if (result.count > 0) {
        result.boards.forEach((board, index) => {
          console.log(`   ${index + 1}. ${board.boardData.name} (${board.boardData.pin_count} pins)`);
        });
      }
    } else {
      console.log(`❌ ${result.name}: Failed - ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Total successful uploads: ${totalUploaded} boards`);
  
  if (totalUploaded === 0) {
    console.log('\n⚠️  No boards were uploaded. Check your database connection and API endpoints.');
    process.exit(1);
  }
}

// Run all fetchers if this script is executed directly
if (require.main === module) {
  runAllFetchers().catch(console.error);
}

module.exports = runAllFetchers;
