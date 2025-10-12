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
        case 'PUT':
            if (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'pins') {
                // PUT /api/admin/pins/:id - Update pin
                updatePin($pdo, $pathParts[2]);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'DELETE':
            if (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'pins') {
                // DELETE /api/admin/pins/:id - Delete pin
                deletePin($pdo, $pathParts[2]);
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

// Update pin
function updatePin($pdo, $pinId) {
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Invalid input data');
    }
    
    $pin_name = $input['pin_name'] ?? '';
    $pin_group_id = $input['pin_group_id'] ?? null;
    $functions = $input['functions'] ?? '';
    $voltage_range = $input['voltage_range'] ?? '';
    $current_limit = $input['current_limit'] ?? '';
    $description = $input['description'] ?? '';
    $position_x = $input['position_x'] ?? null;
    $position_y = $input['position_y'] ?? null;
    $alternate_functions = $input['alternate_functions'] ?? '';
    
    $stmt = $pdo->prepare("
        UPDATE pins 
        SET pin_name = ?, pin_group_id = ?, functions = ?, voltage_range = ?, 
            current_limit = ?, description = ?, position_x = ?, position_y = ?, alternate_functions = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $pin_name, $pin_group_id, $functions, $voltage_range, 
        $current_limit, $description, $position_x, $position_y, 
        $alternate_functions, $pinId
    ]);
    
    if ($stmt->rowCount() === 0) {
        errorResponse('Pin not found', 404);
    }
    
    successResponse(null, 'Pin updated successfully');
}

// Delete pin
function deletePin($pdo, $pinId) {
    verifyAdminToken();
    
    $stmt = $pdo->prepare('DELETE FROM pins WHERE id = ?');
    $stmt->execute([$pinId]);
    
    if ($stmt->rowCount() === 0) {
        errorResponse('Pin not found', 404);
    }
    
    successResponse(null, 'Pin deleted successfully');
}
?>