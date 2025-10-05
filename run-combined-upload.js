const CombinedFZPZFetcher = require('./combined-fzpz-fetcher');

async function runCombinedUpload() {
  console.log('🚀 Starting Combined FZPZ Upload to Database...\n');
  
  try {
    const uploader = new CombinedFZPZFetcher();
    await uploader.run();
    
    console.log('\n🎉 Combined upload process completed!');
    console.log(`✅ Total boards uploaded: ${uploader.getUploadedBoards().length}`);
    
    const uploadedBoards = uploader.getUploadedBoards();
    if (uploadedBoards.length > 0) {
      console.log('\n📋 All uploaded boards:');
      uploadedBoards.forEach((item, index) => {
        console.log(`${index + 1}. ${item.boardData.name} (${item.boardData.pin_count} pins) - ${item.boardData.manufacturer}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Combined upload failed:', error.message);
    process.exit(1);
  }
}

// Run the upload if this script is executed directly
if (require.main === module) {
  runCombinedUpload().catch(console.error);
}

module.exports = runCombinedUpload;
