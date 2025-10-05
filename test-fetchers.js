const AdafruitUploader = require('./adafruit-uploader');
const FritzingArduinoFetcher = require('./fritzing-arduino-fetcher');
const CombinedFZPZFetcher = require('./combined-fzpz-fetcher');

async function testAdafruitFetcher() {
  console.log('🧪 Testing Adafruit Fetcher...\n');
  const fetcher = new AdafruitUploader();
  await fetcher.run();
}

async function testFritzingFetcher() {
  console.log('🧪 Testing Fritzing Arduino Fetcher...\n');
  const fetcher = new FritzingArduinoFetcher();
  await fetcher.run();
}

async function testCombinedFetcher() {
  console.log('🧪 Testing Combined Fetcher...\n');
  const fetcher = new CombinedFZPZFetcher();
  await fetcher.run();
}

// Main test function
async function runTests() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'combined';

  console.log('🚀 FZPZ Fetcher Test Suite\n');
  console.log('Available tests:');
  console.log('  - adafruit: Test Adafruit repository fetcher');
  console.log('  - fritzing: Test Fritzing repository fetcher');
  console.log('  - combined: Test both fetchers (default)\n');

  try {
    switch (testType.toLowerCase()) {
      case 'adafruit':
        await testAdafruitFetcher();
        break;
      case 'fritzing':
        await testFritzingFetcher();
        break;
      case 'combined':
      default:
        await testCombinedFetcher();
        break;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAdafruitFetcher,
  testFritzingFetcher,
  testCombinedFetcher
};
