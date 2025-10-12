<?php
require_once 'config.php';

// Test the Fritzing parser
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test file path (you can change this to your actual file)
$testFilePath = 'C:\Users\Roland Pelayo\Downloads\NEO-6M GPS Module.fzpz';

if (!file_exists($testFilePath)) {
    echo json_encode([
        'error' => 'Test file not found: ' . $testFilePath,
        'message' => 'Please update the file path in test-fritzing-parser.php'
    ]);
    exit;
}

// Include the parser functions
require_once 'admin-upload.php';

try {
    $result = parseFritzingArchive($testFilePath);
    echo json_encode([
        'success' => true,
        'result' => $result,
        'file' => $testFilePath
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Parser failed: ' . $e->getMessage(),
        'file' => $testFilePath
    ]);
}
?>