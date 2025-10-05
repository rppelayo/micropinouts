const FritzingArduinoFetcher = require('./fritzing-arduino-fetcher');

async function runArduinoUpload() {
  console.log('🚀 Starting Arduino FZPZ Upload to Database...\n');
  
  try {
    const uploader = new FritzingArduinoFetcher();
    await uploader.run();
    
    console.log('\n🎉 Upload process completed!');
    console.log(`✅ Successfully uploaded: ${uploader.uploadedBoards.length} Arduino boards`);
    
    if (uploader.uploadedBoards.length > 0) {
      console.log('\n📋 Uploaded Arduino boards:');
      uploader.uploadedBoards.forEach((item, index) => {
        console.log(`${index + 1}. ${item.boardData.name} (${item.boardData.pin_count} pins)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Run the upload if this script is executed directly
if (require.main === module) {
  runArduinoUpload().catch(console.error);
}

module.exports = runArduinoUpload;
