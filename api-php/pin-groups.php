<?php
require_once 'config.php';

// Initialize database
$pdo = initializeDatabase();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Extract the path after the script directory
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($scriptDir, '', $path);
$path = trim($path, '/');

// Handle direct access to index.php with path (e.g., index.php/pin-groups)
if (strpos($path, 'index.php/') === 0) {
    $path = substr($path, 10); // Remove 'index.php/' from the beginning
}

$pathParts = $path ? explode('/', $path) : [];

// Route handling
try {
    switch ($method) {
        case 'GET':
            if (count($pathParts) === 1 && $pathParts[0] === 'pin-groups') {
                // GET /api/pin-groups - Get all pin groups
                getAllPinGroups($pdo);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        default:
            errorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    errorResponse('Internal server error: ' . $e->getMessage(), 500);
}

// Get all pin groups
function getAllPinGroups($pdo) {
    $stmt = $pdo->prepare("SELECT * FROM pin_groups ORDER BY name");
    $stmt->execute();
    $pinGroups = $stmt->fetchAll();
    
    jsonResponse($pinGroups);
}
?>