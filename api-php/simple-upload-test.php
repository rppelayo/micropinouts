<?php
// Simple upload test without complex routing
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start output buffering
ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    if (!isset($_FILES['fritzingFile'])) {
        throw new Exception('No file uploaded');
    }
    
    $file = $_FILES['fritzingFile'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload failed: ' . $file['error']);
    }
    
    // Check file type
    $fileName = strtolower($file['name']);
    $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
    
    if ($fileExt !== 'fzpz') {
        throw new Exception('Only .fzpz files are allowed');
    }
    
    // Create upload directory if it doesn't exist
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $uniqueSuffix = time() . '-' . mt_rand(100000, 999999);
    $uploadPath = $uploadDir . 'fritzingFile-' . $uniqueSuffix . '.' . $fileExt;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to save uploaded file');
    }
    
    // Test ZIP extraction
    if (!class_exists('ZipArchive')) {
        throw new Exception('ZIP extension not available');
    }
    
    $zip = new ZipArchive();
    $result = $zip->open($uploadPath);
    
    if ($result !== TRUE) {
        throw new Exception("Failed to open ZIP file: $result");
    }
    
    $files = [];
    $fzpContent = '';
    $breadboardSvg = '';
    $iconSvg = '';
    
    // Extract files from ZIP
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        $content = $zip->getFromIndex($i);
        
        if (preg_match('/\.fzp$/i', $filename) && !preg_match('/^__MACOSX/', $filename)) {
            $fzpContent = $content;
        } elseif (preg_match('/breadboard.*\.svg$/i', $filename) && !preg_match('/^__MACOSX/', $filename)) {
            $breadboardSvg = $content;
        } elseif (preg_match('/icon.*\.svg$/i', $filename) && !preg_match('/^__MACOSX/', $filename)) {
            $iconSvg = $content;
        }
        
        $files[] = [
            'name' => $filename,
            'size' => strlen($content),
            'type' => pathinfo($filename, PATHINFO_EXTENSION)
        ];
    }
    
    $zip->close();
    
    // Clean up uploaded file
    unlink($uploadPath);
    
    // Clear output buffer and send response
    ob_clean();
    
    echo json_encode([
        'success' => true,
        'message' => 'File processed successfully',
        'data' => [
            'filename' => $file['name'],
            'filesFound' => $files,
            'fzpContentLength' => strlen($fzpContent),
            'breadboardSvgLength' => strlen($breadboardSvg),
            'iconSvgLength' => strlen($iconSvg),
            'hasFzpContent' => !empty($fzpContent),
            'hasBreadboardSvg' => !empty($breadboardSvg),
            'hasIconSvg' => !empty($iconSvg)
        ]
    ]);
    
} catch (Exception $e) {
    // Clean up uploaded file on error
    if (isset($uploadPath) && file_exists($uploadPath)) {
        unlink($uploadPath);
    }
    
    // Clear output buffer and send error
    ob_clean();
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>