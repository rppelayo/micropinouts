const AdafruitUploader = require('./adafruit-uploader');

async function runAdafruitUpload() {
  console.log('🚀 Starting Adafruit FZPZ Upload to Database...\n');
  
  try {
    const uploader = new AdafruitUploader();
    await uploader.run();
    
    console.log('\n🎉 Upload process completed!');
    console.log(`✅ Successfully uploaded: ${uploader.uploadedBoards.length} boards`);
    
    if (uploader.uploadedBoards.length > 0) {
      console.log('\n📋 Uploaded boards:');
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
  runAdafruitUpload().catch(console.error);
}

module.exports = runAdafruitUpload;
