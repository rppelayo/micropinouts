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
    $zip = new ZipArchive();
    $result = $zip->open($testFilePath);
    
    if ($result !== TRUE) {
        throw new Exception("Failed to open ZIP file: $result");
    }
    
    $fzpContent = '';
    
    // Find the FZP file
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        if (preg_match('/\.fzp$/i', $filename) && !preg_match('/^__MACOSX/', $filename)) {
            $fzpContent = $zip->getFromIndex($i);
            break;
        }
    }
    
    $zip->close();
    
    if (empty($fzpContent)) {
        throw new Exception('No FZP content found');
    }
    
    // Parse XML and show structure
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($fzpContent);
    libxml_clear_errors();
    
    $result = [
        'fzpContentLength' => strlen($fzpContent),
        'xmlStructure' => [],
        'pinNodes' => $dom->getElementsByTagName('pin')->length,
        'connectorNodes' => $dom->getElementsByTagName('connector')->length,
        'allElements' => []
    ];
    
    // Get all element names
    $xpath = new DOMXPath($dom);
    $elements = $xpath->query('//*');
    foreach ($elements as $element) {
        $tagName = $element->tagName;
        if (!isset($result['allElements'][$tagName])) {
            $result['allElements'][$tagName] = 0;
        }
        $result['allElements'][$tagName]++;
    }
    
    // Show first 1000 characters of FZP content
    $result['fzpPreview'] = substr($fzpContent, 0, 1000);
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>