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

// Handle direct access to index.php with path (e.g., index.php/admin/login)
if (strpos($path, 'index.php/') === 0) {
    $path = substr($path, 10); // Remove 'index.php/' from the beginning
}

// Remove 'micropinouts' and 'api-php' from path if present
$pathParts = $path ? explode('/', $path) : [];
if (isset($pathParts[0]) && $pathParts[0] === 'micropinouts') {
    array_shift($pathParts);
}
if (isset($pathParts[0]) && $pathParts[0] === 'api-php') {
    array_shift($pathParts);
}

// Route handling
try {
    switch ($method) {
        case 'POST':
            if (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'login') {
                // POST /api/admin/login - Admin login
                adminLogin();
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

// Admin login
function adminLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        errorResponse('Username and password are required');
    }
    
    $username = $input['username'];
    $password = $input['password'];
    
    if ($username !== ADMIN_USERNAME || $password !== ADMIN_PASSWORD) {
        errorResponse('Invalid credentials', 401);
    }
    
    $token = generateJWT([
        'username' => ADMIN_USERNAME,
        'role' => 'admin'
    ]);
    
    successResponse([
        'token' => $token,
        'admin' => ['username' => ADMIN_USERNAME]
    ], 'Login successful');
}
?>