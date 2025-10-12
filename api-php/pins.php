<?php
require_once 'config.php';

// Initialize database
$pdo = initializeDatabase();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));

// Remove 'api-php' from path if present
if (isset($pathParts[0]) && $pathParts[0] === 'api-php') {
    array_shift($pathParts);
}

// Route handling
try {
    switch ($method) {
        case 'GET':
            if (count($pathParts) === 2 && $pathParts[0] === 'pins') {
                // GET /api/pins/:id - Get pin by ID
                getPinById($pdo, $pathParts[1]);
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

// Get pin by ID
function getPinById($pdo, $pinId) {
    $stmt = $pdo->prepare("
        SELECT p.*, pg.name as group_name, pg.color as group_color 
        FROM pins p 
        LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id 
        WHERE p.id = ?
    ");
    $stmt->execute([$pinId]);
    $pin = $stmt->fetch();
    
    if (!$pin) {
        errorResponse('Pin not found', 404);
    }
    
    jsonResponse($pin);
}
?>