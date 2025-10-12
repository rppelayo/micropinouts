<?php
require_once 'config.php';

// Initialize database
$pdo = initializeDatabase();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));

// Remove 'micropinouts' and 'api-php' from path if present
if (isset($pathParts[0]) && $pathParts[0] === 'micropinouts') {
    array_shift($pathParts);
}
if (isset($pathParts[0]) && $pathParts[0] === 'api-php') {
    array_shift($pathParts);
}

// Route handling
try {
    switch ($method) {
        case 'GET':
            if (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'pin-groups') {
                // GET /api/admin/pin-groups - Get all pin groups
                getAllPinGroupsAdmin($pdo);
            } elseif (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'categories') {
                // GET /api/admin/categories - Get available board categories
                getCategories($pdo);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'POST':
            if (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'pin-groups') {
                // POST /api/admin/pin-groups - Create new pin group
                createPinGroup($pdo);
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

// Get all pin groups (admin view)
function getAllPinGroupsAdmin($pdo) {
    verifyAdminToken();
    
    $stmt = $pdo->prepare("SELECT * FROM pin_groups ORDER BY name");
    $stmt->execute();
    $pinGroups = $stmt->fetchAll();
    
    jsonResponse($pinGroups);
}

// Get available board categories
function getCategories($pdo) {
    verifyAdminToken();
    
    $categories = [
        ['key' => 'microcontroller-8bit', 'name' => 'Microcontroller (8-bit)', 'icon' => '🔧', 'color' => '#3498db'],
        ['key' => 'microcontroller-16bit', 'name' => 'Microcontroller (16-bit)', 'icon' => '⚙️', 'color' => '#9b59b6'],
        ['key' => 'microcontroller-32bit', 'name' => 'Microcontroller (32-bit)', 'icon' => '🔩', 'color' => '#e74c3c'],
        ['key' => 'development-board', 'name' => 'Development Board', 'icon' => '📱', 'color' => '#27ae60'],
        ['key' => 'sensor-module', 'name' => 'Sensor & Module', 'icon' => '📡', 'color' => '#f39c12'],
        ['key' => 'communication-ic', 'name' => 'Communication IC', 'icon' => '📶', 'color' => '#1abc9c'],
        ['key' => 'power-management', 'name' => 'Power Management', 'icon' => '⚡', 'color' => '#e67e22'],
        ['key' => 'memory-storage', 'name' => 'Memory & Storage', 'icon' => '💾', 'color' => '#34495e'],
        ['key' => 'custom-other', 'name' => 'Custom/Other', 'icon' => '🔧', 'color' => '#95a5a6']
    ];
    
    jsonResponse($categories);
}

// Create new pin group
function createPinGroup($pdo) {
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['name']) || !isset($input['color'])) {
        errorResponse('Name and color are required');
    }
    
    $name = $input['name'];
    $color = $input['color'];
    $description = $input['description'] ?? '';
    
    $stmt = $pdo->prepare("
        INSERT INTO pin_groups (name, color, description)
        VALUES (?, ?, ?)
    ");
    
    $stmt->execute([$name, $color, $description]);
    
    $groupId = $pdo->lastInsertId();
    
    successResponse([
        'id' => $groupId
    ], 'Pin group created successfully');
}
?>