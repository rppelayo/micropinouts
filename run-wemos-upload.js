const WemosFetcher = require('./fritzing-wemos-fetcher');

async function runWemosUpload() {
  console.log('🚀 Starting Wemos FZPZ Upload to Database...\n');
  
  try {
    const fetcher = new WemosFetcher();
    await fetcher.run();
    
    console.log('\n🎉 Upload process completed!');
    console.log(`✅ Successfully uploaded: ${fetcher.uploadedBoards.length} boards`);
    
    if (fetcher.uploadedBoards.length > 0) {
      console.log('\n📋 Uploaded boards:');
      fetcher.uploadedBoards.forEach((item, index) => {
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
  runWemosUpload().catch(console.error);
}

module.exports = runWemosUpload;
