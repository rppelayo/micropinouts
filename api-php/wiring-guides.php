<?php
require_once 'config.php';

// Initialize database
$pdo = initializeDatabase();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

// Debug logging
error_log("Wiring-guides.php - Path parts: " . print_r($pathParts, true));

// Route handling
try {
    switch ($method) {
        case 'GET':
            if (count($pathParts) === 1 && $pathParts[0] === 'wiring-guides') {
                // GET /api/wiring-guides - Get all published wiring guides (public)
                getAllPublishedWiringGuides($pdo);
            } elseif (count($pathParts) === 2 && $pathParts[0] === 'wiring-guide') {
                // GET /api/wiring-guide/:slug - Get single published wiring guide (public)
                getPublishedWiringGuideBySlug($pdo, $pathParts[1]);
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

// Get all published wiring guides (public endpoint)
function getAllPublishedWiringGuides($pdo) {
    $stmt = $pdo->prepare("
        SELECT 
            wg.id,
            wg.slug,
            wg.description,
            wg.created_at,
            sb.name as sensor_name,
            mb.name as microcontroller_name
        FROM wiring_guides wg
        LEFT JOIN boards sb ON wg.sensor_board_id = sb.id
        LEFT JOIN boards mb ON wg.microcontroller_board_id = mb.id
        WHERE wg.published = 1
        ORDER BY wg.created_at DESC
    ");
    $stmt->execute();
    $wiringGuides = $stmt->fetchAll();
    
    jsonResponse($wiringGuides);
}

// Get published wiring guide by slug (public endpoint)
function getPublishedWiringGuideBySlug($pdo, $slug) {
    $stmt = $pdo->prepare("
        SELECT 
            wg.*,
            sb.name as sensor_name,
            sb.slug as sensor_slug,
            mb.name as microcontroller_name,
            mb.slug as microcontroller_slug
        FROM wiring_guides wg
        LEFT JOIN boards sb ON wg.sensor_board_id = sb.id
        LEFT JOIN boards mb ON wg.microcontroller_board_id = mb.id
        WHERE wg.slug = ? AND wg.published = 1
    ");
    $stmt->execute([$slug]);
    $wiringGuide = $stmt->fetch();
    
    if (!$wiringGuide) {
        errorResponse('Wiring guide not found', 404);
    }
    
    // Parse connections JSON
    if ($wiringGuide['connections']) {
        $wiringGuide['connections'] = json_decode($wiringGuide['connections'], true);
    }
    
    jsonResponse($wiringGuide);
}
?>
