<?php
require_once 'config.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Extract the path after the script directory
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($scriptDir, '', $path);
$path = trim($path, '/');

// Handle direct access to index.php with path (e.g., index.php/admin/login)
if (strpos($path, 'index.php/') === 0) {
    $path = substr($path, 10); // Remove 'index.php/' from the beginning
}

// Debug logging
error_log("Original URI: " . $_SERVER['REQUEST_URI']);
error_log("Script dir: " . $scriptDir);
error_log("Extracted path: " . $path);

// Parse path parts
$pathParts = $path ? explode('/', $path) : [];
// Remove empty elements
$pathParts = array_values(array_filter($pathParts, function($part) {
    return $part !== '';
}));

// Debug logging
error_log("Main index.php - Final path: " . $path);
error_log("Main index.php - Path parts: " . print_r($pathParts, true));
error_log("Main index.php - First path part: " . (isset($pathParts[0]) ? $pathParts[0] : 'EMPTY'));

// Route based on path
if (empty($pathParts) || $pathParts[0] === '') {
    // Root endpoint
    jsonResponse([
        'message' => 'MicroPinouts PHP API Server',
        'version' => '1.0.0',
        'endpoints' => [
            'GET /boards' => 'Get all published boards',
            'GET /boards/:id' => 'Get board by ID or slug',
            'GET /boards/:id/pins' => 'Get pins for a specific board',
            'GET /pins/:id' => 'Get pin by ID',
            'GET /pin-groups' => 'Get all pin groups',
            'POST /admin/login' => 'Admin login',
            'GET /admin/boards' => 'Get all boards (admin)',
            'POST /admin/boards' => 'Create new board',
            'PUT /admin/boards/:id' => 'Update board',
            'DELETE /admin/boards/:id' => 'Delete board',
            'POST /admin/upload-fritzing' => 'Upload Fritzing file',
            'POST /admin/boards/from-fritzing' => 'Create board from Fritzing data'
        ]
    ]);
} elseif ($pathParts[0] === 'boards') {
    require_once 'boards.php';
} elseif ($pathParts[0] === 'pins') {
    require_once 'pins.php';
} elseif ($pathParts[0] === 'pin-groups') {
require_once 'pin-groups.php';
} elseif ($pathParts[0] === 'wiring-guides') {
require_once 'wiring-guides.php';
} elseif ($pathParts[0] === 'wiring-guide') {
require_once 'wiring-guides.php';
} elseif ($pathParts[0] === 'admin') {
    // Admin routes
    error_log("Admin routing - Path parts: " . print_r($pathParts, true));
    if (count($pathParts) === 2 && $pathParts[1] === 'login') {
        error_log("Routing to admin.php");
        require_once 'admin.php';
    } elseif (count($pathParts) === 2 && $pathParts[1] === 'verify-token') {
        error_log("Routing to admin verify-token");
        verifyAdminToken();
        jsonResponse(['valid' => true, 'message' => 'Token is valid']);
    } elseif (count($pathParts) === 2 && $pathParts[1] === 'upload-fritzing') {
        error_log("Routing to admin-upload.php");
        require_once 'admin-upload.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'boards') {
        error_log("Routing to admin-boards.php");
        require_once 'admin-boards.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'pins') {
        error_log("Routing to admin-pins.php");
        require_once 'admin-pins.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'pin-groups') {
        error_log("Routing to admin-pin-groups.php");
        require_once 'admin-pin-groups.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'categories') {
        error_log("Routing to admin-pin-groups.php for categories");
        require_once 'admin-pin-groups.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'wiring-guides') {
        error_log("Routing to admin-wiring-guides.php");
        require_once 'admin-wiring-guides.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'wiring-guide') {
        error_log("Routing to admin-wiring-guides.php for single wiring guide");
        require_once 'admin-wiring-guides.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'upload-fritzing') {
        error_log("Routing to admin-upload.php");
        require_once 'admin-upload.php';
    } elseif (count($pathParts) >= 2 && $pathParts[1] === 'test-fritzing-data') {
        error_log("Routing to admin-upload.php for test-fritzing-data");
        require_once 'admin-upload.php';
    } else {
        error_log("Admin endpoint not found - Path parts: " . print_r($pathParts, true));
        errorResponse('Admin endpoint not found', 404);
    }
} else {
    errorResponse('Endpoint not found: ' . $path, 404);
}
?>