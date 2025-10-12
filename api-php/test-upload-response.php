<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test file path
$testFilePath = 'C:\Users\Roland Pelayo\Downloads\NEO-6M GPS Module.fzpz';

if (!file_exists($testFilePath)) {
    echo json_encode(['error' => 'Test file not found']);
    exit;
}

try {
    // Include the upload functions
    require_once 'admin-upload.php';
    
    // Process the file
    $result = processFritzingFile($testFilePath, 'Fritzing');
    
    echo json_encode([
        'success' => true,
        'result' => $result,
        'pinsCount' => count($result['pins']),
        'pins' => $result['pins']
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>