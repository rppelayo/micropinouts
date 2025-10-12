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

// Handle direct access to index.php with path (e.g., index.php/boards)
if (strpos($path, 'index.php/') === 0) {
    $path = substr($path, 10); // Remove 'index.php/' from the beginning
}

$pathParts = $path ? explode('/', $path) : [];

// Route handling
try {
    switch ($method) {
        case 'GET':
            if (count($pathParts) === 1 && $pathParts[0] === 'boards') {
                // GET /api/boards - Get all published boards
                getAllBoards($pdo);
            } elseif (count($pathParts) === 2 && $pathParts[0] === 'boards' && $pathParts[1] === 'compare') {
                // GET /api/boards/compare - Get multiple boards for comparison
                getBoardsForComparison($pdo);
            } elseif (count($pathParts) === 3 && $pathParts[0] === 'boards' && $pathParts[2] === 'pins') {
                // GET /api/boards/:id/pins - Get pins for a specific board
                getBoardPins($pdo, $pathParts[1]);
            } elseif (count($pathParts) === 2 && $pathParts[0] === 'boards') {
                // GET /api/boards/:id - Get board by ID or slug
                getBoardById($pdo, $pathParts[1]);
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

// Get all published boards
function getAllBoards($pdo) {
    $stmt = $pdo->prepare("SELECT * FROM boards WHERE published = 1 ORDER BY name");
    $stmt->execute();
    $boards = $stmt->fetchAll();
    
    jsonResponse($boards);
}

// Get boards for comparison
function getBoardsForComparison($pdo) {
    $ids = $_GET['ids'] ?? '';
    
    if (empty($ids)) {
        errorResponse('Board IDs are required');
    }
    
    $identifiers = array_filter(array_map('trim', explode(',', $ids)));
    
    if (empty($identifiers)) {
        errorResponse('At least one board ID is required');
    }
    
    if (count($identifiers) > 2) {
        errorResponse('Maximum 2 boards can be compared at once');
    }
    
    $placeholders = str_repeat('?,', count($identifiers) - 1) . '?';
    $stmt = $pdo->prepare("SELECT * FROM boards WHERE (id IN ($placeholders) OR slug IN ($placeholders)) AND published = 1 ORDER BY name");
    $stmt->execute(array_merge($identifiers, $identifiers));
    $boards = $stmt->fetchAll();
    
    if (count($boards) !== count($identifiers)) {
        errorResponse('One or more boards not found');
    }
    
    jsonResponse($boards);
}

// Get board by ID or slug
function getBoardById($pdo, $identifier) {
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    $whereClause = $isNumeric ? "id = ?" : "slug = ?";
    
    $stmt = $pdo->prepare("SELECT * FROM boards WHERE $whereClause AND published = 1");
    $stmt->execute([$identifier]);
    $board = $stmt->fetch();
    
    if (!$board) {
        errorResponse('Board not found', 404);
    }
    
    jsonResponse($board);
}

// Get pins for a specific board
function getBoardPins($pdo, $identifier) {
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    
    if ($isNumeric) {
        // Direct ID lookup
        $stmt = $pdo->prepare("
            SELECT p.*, pg.name as group_name, pg.color as group_color 
            FROM pins p 
            LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id 
            WHERE p.board_id = ? 
            ORDER BY CAST(p.pin_number AS UNSIGNED)
        ");
        $stmt->execute([$identifier]);
        $pins = $stmt->fetchAll();
    } else {
        // Slug lookup - first get board ID, then get pins
        $stmt = $pdo->prepare("SELECT id FROM boards WHERE slug = ? AND published = 1");
        $stmt->execute([$identifier]);
        $board = $stmt->fetch();
        
        if (!$board) {
            errorResponse('Board not found', 404);
        }
        
        $stmt = $pdo->prepare("
            SELECT p.*, pg.name as group_name, pg.color as group_color 
            FROM pins p 
            LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id 
            WHERE p.board_id = ? 
            ORDER BY CAST(p.pin_number AS UNSIGNED)
        ");
        $stmt->execute([$board['id']]);
        $pins = $stmt->fetchAll();
    }
    
    jsonResponse($pins);
}
?>