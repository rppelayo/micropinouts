<?php
require_once 'config.php';

// Initialize database
$pdo = initializeDatabase();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Simple routing - just handle the admin/boards endpoint
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
error_log("Admin-boards.php - Path parts: " . print_r($pathParts, true));
error_log("Admin-boards.php - Request URI: " . $_SERVER['REQUEST_URI']);
error_log("Admin-boards.php - Request Method: " . $_SERVER['REQUEST_METHOD']);

// Route handling
try {
    error_log("Admin-boards.php - Final path parts: " . print_r($pathParts, true));
    error_log("Admin-boards.php - Path parts count: " . count($pathParts));
    switch ($method) {
        case 'GET':
            if (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards') {
                // GET /api/admin/boards - Get all boards (admin view)
                getAllBoardsAdmin($pdo);
            } elseif (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards') {
                // GET /api/admin/boards/:id - Get single board by ID
                getBoardByIdAdmin($pdo, $pathParts[2]);
            } elseif (count($pathParts) === 4 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards' && $pathParts[3] === 'pins') {
                // GET /api/admin/boards/:id/pins - Get board pins for editing
                getBoardPinsAdmin($pdo, $pathParts[2]);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'POST':
            if (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards') {
                // POST /api/admin/boards - Create new board
                createBoard($pdo);
            } elseif (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards' && $pathParts[2] === 'from-fritzing') {
                // POST /api/admin/boards/from-fritzing - Create board from Fritzing data
                error_log("Admin-boards.php - Routing to createBoardFromFritzing");
                createBoardFromFritzing($pdo);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'PUT':
            if (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards') {
                // PUT /api/admin/boards/:id - Update board
                updateBoard($pdo, $pathParts[2]);
            } elseif (count($pathParts) === 4 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards' && $pathParts[3] === 'publish') {
                // PUT /api/admin/boards/:id/publish - Publish/unpublish board
                error_log("Admin-boards.php - Routing to publishBoard for ID: " . $pathParts[2]);
                publishBoard($pdo, $pathParts[2]);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'DELETE':
            if (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'boards') {
                // DELETE /api/admin/boards/:id - Delete board
                deleteBoard($pdo, $pathParts[2]);
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

// Get all boards (admin view with additional info)
function getAllBoardsAdmin($pdo) {
    verifyAdminToken();
    
    $stmt = $pdo->prepare("
        SELECT b.*, 
               COUNT(p.id) as pin_count,
               GROUP_CONCAT(DISTINCT pg.name) as pin_groups
        FROM boards b
        LEFT JOIN pins p ON b.id = p.board_id
        LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id
        GROUP BY b.id
        ORDER BY b.created_at DESC
    ");
    $stmt->execute();
    $boards = $stmt->fetchAll();
    
    jsonResponse($boards);
}

// Get single board by ID (admin view)
function getBoardByIdAdmin($pdo, $identifier) {
    verifyAdminToken();
    
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    $whereClause = $isNumeric ? "id = ?" : "slug = ?";
    
    $stmt = $pdo->prepare("SELECT * FROM boards WHERE $whereClause");
    $stmt->execute([$identifier]);
    $board = $stmt->fetch();
    
    if (!$board) {
        errorResponse('Board not found', 404);
    }
    
    jsonResponse($board);
}

// Get board pins for editing
function getBoardPinsAdmin($pdo, $identifier) {
    verifyAdminToken();
    
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
        $stmt = $pdo->prepare("SELECT id FROM boards WHERE slug = ?");
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

// Create new board
function createBoard($pdo) {
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['name'])) {
        errorResponse('Board name is required');
    }
    
    $name = $input['name'];
    $description = $input['description'] ?? '';
    $manufacturer = $input['manufacturer'] ?? '';
    $package_type = $input['package_type'] ?? '';
    $pin_count = $input['pin_count'] ?? null;
    $voltage_range = $input['voltage_range'] ?? '';
    $clock_speed = $input['clock_speed'] ?? '';
    $flash_memory = $input['flash_memory'] ?? '';
    $ram = $input['ram'] ?? '';
    $image_url = $input['image_url'] ?? '';
    $link = $input['link'] ?? '';
    $category = $input['category'] ?? 'custom-other';
    
    $slug = generateSlug($name);
    
    $stmt = $pdo->prepare("
        INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug, link, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $name, $description, $manufacturer, $package_type, $pin_count, 
        $voltage_range, $clock_speed, $flash_memory, $ram, $image_url, 
        $slug, $link, $category
    ]);
    
    $boardId = $pdo->lastInsertId();
    
    successResponse([
        'id' => $boardId,
        'slug' => $slug
    ], 'Board created successfully');
}

// Update board
function updateBoard($pdo, $identifier) {
    verifyAdminToken();
    
    error_log("updateBoard called with identifier: " . $identifier);
    
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("updateBoard input: " . json_encode($input));
    
    if (!$input || !isset($input['name'])) {
        errorResponse('Board name is required');
    }
    
    $name = $input['name'];
    $description = $input['description'] ?? '';
    $manufacturer = $input['manufacturer'] ?? '';
    $package_type = $input['package_type'] ?? '';
    $pin_count = $input['pin_count'] ?? null;
    $voltage_range = $input['voltage_range'] ?? '';
    $clock_speed = $input['clock_speed'] ?? '';
    $flash_memory = $input['flash_memory'] ?? '';
    $ram = $input['ram'] ?? '';
    $image_url = $input['image_url'] ?? '';
    $link = $input['link'] ?? '';
    $category = $input['category'] ?? 'custom-other';
    
    $slug = generateSlug($name);
    
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    $whereClause = $isNumeric ? "id = ?" : "slug = ?";
    
    error_log("updateBoard - isNumeric: " . ($isNumeric ? 'true' : 'false'));
    error_log("updateBoard - whereClause: " . $whereClause);
    error_log("updateBoard - identifier: " . $identifier);
    error_log("updateBoard - new slug: " . $slug);
    
    // First, get the current board to check if slug needs updating
    $currentStmt = $pdo->prepare("SELECT slug FROM boards WHERE $whereClause");
    $currentStmt->execute([$identifier]);
    $currentBoard = $currentStmt->fetch();
    
    if (!$currentBoard) {
        error_log("updateBoard - Board not found in initial check");
        errorResponse('Board not found', 404);
    }
    
    error_log("updateBoard - current slug: " . $currentBoard['slug']);
    
    // Only update slug if it's different
    if ($currentBoard['slug'] === $slug) {
        // Slug is the same, don't update it
        error_log("updateBoard - Using UPDATE without slug");
        $stmt = $pdo->prepare("
            UPDATE boards 
            SET name = ?, description = ?, manufacturer = ?, package_type = ?, pin_count = ?,
                voltage_range = ?, clock_speed = ?, flash_memory = ?, ram = ?, image_url = ?, link = ?, category = ?
            WHERE $whereClause
        ");
        
        $params = [
            $name, $description, $manufacturer, $package_type, $pin_count, 
            $voltage_range, $clock_speed, $flash_memory, $ram, $image_url, 
            $link, $category, $identifier
        ];
        
        error_log("updateBoard - identifier value: '" . $identifier . "'");
        error_log("updateBoard - Parameters count: " . count($params));
        error_log("updateBoard - Parameters: " . json_encode($params));
        error_log("updateBoard - SQL: UPDATE boards SET name = ?, description = ?, manufacturer = ?, package_type = ?, pin_count = ?, voltage_range = ?, clock_speed = ?, flash_memory = ?, ram = ?, image_url = ?, link = ?, category = ? WHERE $whereClause");
        
        try {
            $stmt->execute($params);
            error_log("updateBoard - UPDATE query executed successfully");
        } catch (Exception $e) {
            error_log("updateBoard - UPDATE query failed: " . $e->getMessage());
        }
        
        // Debug: Check if the WHERE clause is working
        $debugStmt = $pdo->prepare("SELECT id, name, slug FROM boards WHERE slug = ?");
        $debugStmt->execute([$identifier]);
        $debugResult = $debugStmt->fetch();
        error_log("updateBoard - Debug WHERE clause result: " . json_encode($debugResult));
        
        // Debug: Check current values in database
        $currentStmt = $pdo->prepare("SELECT name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, link, category FROM boards WHERE slug = ?");
        $currentStmt->execute([$identifier]);
        $currentValues = $currentStmt->fetch();
        error_log("updateBoard - Current database values: " . json_encode($currentValues));
    } else {
        // Slug is different, update it
        $stmt = $pdo->prepare("
            UPDATE boards 
            SET name = ?, description = ?, manufacturer = ?, package_type = ?, pin_count = ?,
                voltage_range = ?, clock_speed = ?, flash_memory = ?, ram = ?, image_url = ?, slug = ?, link = ?, category = ?
            WHERE $whereClause
        ");
        
        $stmt->execute([
            $name, $description, $manufacturer, $package_type, $pin_count, 
            $voltage_range, $clock_speed, $flash_memory, $ram, $image_url, 
            $slug, $link, $category, $identifier
        ]);
    }
    
    error_log("updateBoard - rowCount: " . $stmt->rowCount());
    
    // Check if the board still exists (in case it was deleted during the update)
    $verifyStmt = $pdo->prepare("SELECT id FROM boards WHERE $whereClause");
    $verifyStmt->execute([$identifier]);
    $verifyResult = $verifyStmt->fetch();
    
    if (!$verifyResult) {
        error_log("updateBoard - Board not found after update with identifier: " . $identifier);
        errorResponse('Board not found', 404);
    }
    
    // If rowCount is 0, it means no changes were made (values were identical)
    // This is still a successful update
    if ($stmt->rowCount() === 0) {
        error_log("updateBoard - No changes made (values identical), but board exists");
    }
    
    successResponse([
        'slug' => $slug
    ], 'Board updated successfully');
}

// Delete board
function deleteBoard($pdo, $identifier) {
    verifyAdminToken();
    
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    
    if ($isNumeric) {
        // Direct ID lookup
        // First delete all pins for this board
        $stmt = $pdo->prepare('DELETE FROM pins WHERE board_id = ?');
        $stmt->execute([$identifier]);
        
        // Then delete the board
        $stmt = $pdo->prepare('DELETE FROM boards WHERE id = ?');
        $stmt->execute([$identifier]);
        
        if ($stmt->rowCount() === 0) {
            errorResponse('Board not found', 404);
        }
    } else {
        // Slug lookup - first get board ID, then delete
        $stmt = $pdo->prepare('SELECT id FROM boards WHERE slug = ?');
        $stmt->execute([$identifier]);
        $board = $stmt->fetch();
        
        if (!$board) {
            errorResponse('Board not found', 404);
        }
        
        // First delete all pins for this board
        $stmt = $pdo->prepare('DELETE FROM pins WHERE board_id = ?');
        $stmt->execute([$board['id']]);
        
        // Then delete the board
        $stmt = $pdo->prepare('DELETE FROM boards WHERE id = ?');
        $stmt->execute([$board['id']]);
    }
    
    successResponse(null, 'Board deleted successfully');
}

// Publish/unpublish board
function publishBoard($pdo, $identifier) {
    error_log("publishBoard called with identifier: " . $identifier);
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("publishBoard input: " . json_encode($input));
    
    if (!isset($input['published'])) {
        errorResponse('Published status is required');
    }
    
    $published = $input['published'] ? 1 : 0;
    
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    $whereClause = $isNumeric ? "id = ?" : "slug = ?";
    
    $stmt = $pdo->prepare("UPDATE boards SET published = ? WHERE $whereClause");
    $stmt->execute([$published, $identifier]);
    
    if ($stmt->rowCount() === 0) {
        errorResponse('Board not found', 404);
    }
    
    successResponse([
        'published' => $published
    ], "Board " . ($published ? 'published' : 'unpublished') . " successfully");
}

// Create board from Fritzing data
function createBoardFromFritzing($pdo) {
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['boardData']) || !isset($input['fritzingData'])) {
        errorResponse('Board data and Fritzing data are required');
    }
    
    $boardData = $input['boardData'];
    $fritzingData = $input['fritzingData'];
    
    if (!isset($boardData['name'])) {
        errorResponse('Board name is required');
    }
    
    // Check if pins are in the expected location
    if (!isset($fritzingData['pins']) || !is_array($fritzingData['pins'])) {
        // Try alternative structure - maybe pins are nested under 'data'
        if (isset($fritzingData['data']['pins']) && is_array($fritzingData['data']['pins'])) {
            $fritzingData['pins'] = $fritzingData['data']['pins'];
            // Also copy other data properties if they exist
            if (isset($fritzingData['data']['totalPins'])) {
                $fritzingData['totalPins'] = $fritzingData['data']['totalPins'];
            }
            if (isset($fritzingData['data']['displaySVG'])) {
                $fritzingData['displaySVG'] = $fritzingData['data']['displaySVG'];
            }
        } elseif (isset($input['pins']) && is_array($input['pins'])) {
            $fritzingData['pins'] = $input['pins'];
        } else {
            // Log the received data structure for debugging
            error_log("Fritzing data structure: " . json_encode($fritzingData));
            error_log("Input structure: " . json_encode($input));
            errorResponse('Invalid Fritzing data: pins array is missing or invalid. Received: ' . json_encode($fritzingData));
        }
    }
    
    try {
        $pdo->beginTransaction();
        
        // Create the board
        $svgContent = $fritzingData['displaySVG'] ?? null;
        $slug = generateSlug($boardData['name']);
        
        $stmt = $pdo->prepare("
            INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, svg_content, slug, link, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $boardData['name'],
            $boardData['description'] ?? '',
            $boardData['manufacturer'] ?? '',
            $boardData['package_type'] ?? '',
            $fritzingData['totalPins'] ?? count($fritzingData['pins']),
            $boardData['voltage_range'] ?? '',
            $boardData['clock_speed'] ?? '',
            $boardData['flash_memory'] ?? '',
            $boardData['ram'] ?? '',
            $boardData['image_url'] ?? '',
            $svgContent,
            $slug,
            $boardData['link'] ?? '',
            $boardData['category'] ?? 'custom-other'
        ]);
        
        $boardId = $pdo->lastInsertId();
        
        // Get pin group IDs
        $stmt = $pdo->prepare("SELECT id, name FROM pin_groups");
        $stmt->execute();
        $groups = $stmt->fetchAll();
        
        $groupMap = [];
        foreach ($groups as $group) {
            $groupMap[$group['name']] = $group['id'];
        }
        
        // Insert pins
        $stmt = $pdo->prepare("
            INSERT INTO pins (board_id, pin_number, pin_name, pin_group_id, functions, voltage_range, position_x, position_y, svg_id, alternate_functions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($fritzingData['pins'] as $index => $pin) {
            // Map Fritzing parser fields to database fields
            $pinName = $pin['pin_name'] ?? $pin['name'] ?? 'Pin' . ($index + 1);
            $pinType = $pin['type'] ?? 'digital';
            $pinNumber = $pin['pin_number'] ?? ($index + 1);
            $positionX = $pin['position_x'] ?? $pin['position']['x'] ?? null;
            $positionY = $pin['position_y'] ?? $pin['position']['y'] ?? null;
            $description = $pin['description'] ?? '';
            $functions = $pin['functions'] ?? '';
            $voltageRange = $pin['voltage_range'] ?? '';
            $svgId = $pin['svgId'] ?? null;
            
            // Map pin group from FZP parser or determine from pin name
            $groupId = $groupMap['Digital']; // Default to Digital
            
            if (isset($pin['group_name']) && isset($groupMap[$pin['group_name']])) {
                // Use the group name from FZP parser
                $groupId = $groupMap[$pin['group_name']];
            } else {
                // Fallback: determine group from pin name
                $pinNameLower = strtolower($pinName);
                if (strpos($pinNameLower, 'gnd') !== false || strpos($pinNameLower, 'vcc') !== false || strpos($pinNameLower, '3.3v') !== false || strpos($pinNameLower, '5v') !== false) {
                    $groupId = $groupMap['Power'] ?? $groupMap['Digital'];
                } elseif (strpos($pinNameLower, 'tx') !== false || strpos($pinNameLower, 'rx') !== false || strpos($pinNameLower, 'i2c') !== false || strpos($pinNameLower, 'spi') !== false) {
                    $groupId = $groupMap['Communication'] ?? $groupMap['Digital'];
                } elseif (strpos($pinNameLower, 'a') !== false && is_numeric(substr($pinNameLower, 1))) {
                    $groupId = $groupMap['Analog'] ?? $groupMap['Digital'];
                }
            }
            
            $stmt->execute([
                $boardId,
                $pinNumber,
                $pinName,
                $groupId,
                $functions, // Use functions from FZP parser
                $voltageRange, // Use voltage_range from FZP parser
                $positionX,
                $positionY,
                $svgId, // Use svg_id from FZP parser
                null  // alternate_functions
            ]);
        }
        
        $pdo->commit();
        
        successResponse([
            'boardId' => $boardId,
            'slug' => $slug,
            'pinCount' => count($fritzingData['pins'])
        ], 'Board created successfully from Fritzing data');
        
    } catch (Exception $e) {
        $pdo->rollBack();
        errorResponse('Failed to create board from Fritzing data: ' . $e->getMessage(), 500);
    }
}
?>