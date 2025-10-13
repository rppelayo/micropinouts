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
error_log("Admin-wiring-guides.php - Path parts: " . print_r($pathParts, true));

// Route handling
try {
    switch ($method) {
        case 'GET':
            if (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guides') {
                // GET /api/admin/wiring-guides - Get all wiring guides
                getAllWiringGuides($pdo);
            } elseif (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guide' && $pathParts[2] === 'boards') {
                // GET /api/admin/wiring-guide/boards?category=... - Get boards by category
                getBoardsByCategory($pdo);
            } elseif (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guide') {
                // GET /api/admin/wiring-guide/:slug - Get single wiring guide
                getWiringGuideBySlug($pdo, $pathParts[2]);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'POST':
            if (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guide' && $pathParts[2] === 'preview') {
                // POST /api/admin/wiring-guide/preview - Generate SVG preview only
                generateSVGPreview($pdo);
            } elseif (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guide' && $pathParts[2] === 'generate') {
                // POST /api/admin/wiring-guide/generate - Generate new wiring guide (saves to database)
                generateWiringGuide($pdo);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'PUT':
            if (count($pathParts) === 4 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guide' && $pathParts[3] === 'publish') {
                // PUT /api/admin/wiring-guide/:id/publish - Publish/unpublish wiring guide
                publishWiringGuide($pdo, $pathParts[2]);
            } elseif (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guide') {
                // PUT /api/admin/wiring-guide/:id - Update wiring guide
                updateWiringGuide($pdo, $pathParts[2]);
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        case 'DELETE':
            if (count($pathParts) === 3 && $pathParts[0] === 'admin' && $pathParts[1] === 'wiring-guide') {
                // DELETE /api/admin/wiring-guide/:id - Delete wiring guide
                deleteWiringGuide($pdo, $pathParts[2]);
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

// Get all wiring guides
function getAllWiringGuides($pdo) {
    verifyAdminToken();
    
    $stmt = $pdo->prepare("
        SELECT wg.*, 
               sb.name as sensor_board_name,
               mb.name as microcontroller_board_name
        FROM wiring_guides wg
        LEFT JOIN boards sb ON wg.sensor_board_id = sb.id
        LEFT JOIN boards mb ON wg.microcontroller_board_id = mb.id
        ORDER BY wg.created_at DESC
    ");
    $stmt->execute();
    $wiringGuides = $stmt->fetchAll();
    
    jsonResponse($wiringGuides);
}

// Get wiring guide by slug
function getWiringGuideBySlug($pdo, $slug) {
    verifyAdminToken();
    
    $stmt = $pdo->prepare("
        SELECT wg.*, 
               sb.name as sensor_board_name,
               mb.name as microcontroller_board_name
        FROM wiring_guides wg
        LEFT JOIN boards sb ON wg.sensor_board_id = sb.id
        LEFT JOIN boards mb ON wg.microcontroller_board_id = mb.id
        WHERE wg.slug = ?
    ");
    $stmt->execute([$slug]);
    $wiringGuide = $stmt->fetch();
    
    if (!$wiringGuide) {
        errorResponse('Wiring guide not found', 404);
    }
    
    jsonResponse($wiringGuide);
}

// Generate SVG preview only (no database save)
function generateSVGPreview($pdo) {
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['sensorBoardId']) || !isset($input['microcontrollerBoardId']) || !isset($input['connections'])) {
        errorResponse('Sensor board ID, microcontroller board ID, and connections are required');
    }
    
    $sensorBoardId = $input['sensorBoardId'];
    $microcontrollerBoardId = $input['microcontrollerBoardId'];
    $connections = $input['connections'];
    
    // Generate SVG content only
    $svgContent = generateWiringSVG($sensorBoardId, $microcontrollerBoardId, $connections);
    
    successResponse([
        'svgContent' => $svgContent
    ], 'SVG preview generated successfully');
}

// Generate new wiring guide (saves to database as draft)
function generateWiringGuide($pdo) {
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['sensorBoardId']) || !isset($input['microcontrollerBoardId']) || !isset($input['connections'])) {
        errorResponse('Sensor board ID, microcontroller board ID, and connections are required');
    }
    
    $sensorBoardId = $input['sensorBoardId'];
    $microcontrollerBoardId = $input['microcontrollerBoardId'];
    $connections = $input['connections'];
    $description = $input['description'] ?? '';
    
    // Generate a meaningful slug based on board names
    $sensorBoard = $pdo->prepare("SELECT name, slug FROM boards WHERE id = ?");
    $sensorBoard->execute([$sensorBoardId]);
    $sensorData = $sensorBoard->fetch();
    
    $microcontrollerBoard = $pdo->prepare("SELECT name, slug FROM boards WHERE id = ?");
    $microcontrollerBoard->execute([$microcontrollerBoardId]);
    $microData = $microcontrollerBoard->fetch();
    
    $sensorSlug = $sensorData['slug'] ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $sensorData['name']));
    $microSlug = $microData['slug'] ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $microData['name']));
    
    $slug = $sensorSlug . '-to-' . $microSlug;
    $slug = trim($slug, '-');
    $slug = preg_replace('/-+/', '-', $slug);
    
    // Check if slug already exists and make it unique if needed
    $checkStmt = $pdo->prepare("SELECT id FROM wiring_guides WHERE slug = ?");
    $checkStmt->execute([$slug]);
    if ($checkStmt->fetch()) {
        $slug = $slug . '-' . uniqid();
    }
    
    // For now, create a simple SVG representation
    $svgContent = generateWiringSVG($sensorBoardId, $microcontrollerBoardId, $connections);
    
    // Insert into database
    $stmt = $pdo->prepare("
        INSERT INTO wiring_guides (sensor_board_id, microcontroller_board_id, connections, description, svg_content, slug, published)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    ");
    
    $stmt->execute([
        $sensorBoardId,
        $microcontrollerBoardId,
        json_encode($connections),
        $description,
        $svgContent,
        $slug
    ]);
    
    $wiringGuideId = $pdo->lastInsertId();
    
    successResponse([
        'wiringGuideId' => $wiringGuideId,
        'slug' => $slug,
        'svgContent' => $svgContent
    ], 'Wiring guide generated successfully');
}

// Generate SVG content for wiring guide
function generateWiringSVG($sensorBoardId, $microcontrollerBoardId, $connections) {
    global $pdo;
    
    // Fetch board data and pins (similar to Node.js version)
    $sensorData = getBoardDataWithPins($pdo, $sensorBoardId);
    $microcontrollerData = getBoardDataWithPins($pdo, $microcontrollerBoardId);
    
    if (!$sensorData || !$microcontrollerData) {
        error_log("generateWiringSVG: Could not fetch board data for sensor: $sensorBoardId, microcontroller: $microcontrollerBoardId");
        return generateFallbackSVG();
    }
    
    // Generate the wiring guide SVG using the same approach as Node.js
    $svg = generateWiringGuideSVG($sensorData, $microcontrollerData, $connections);
    
    return $svg;
}

// Get board data with pins (similar to Node.js version)
function getBoardDataWithPins($pdo, $boardId) {
    // Get board data
    $stmt = $pdo->prepare("SELECT * FROM boards WHERE id = ?");
    $stmt->execute([$boardId]);
    $board = $stmt->fetch();
    
    if (!$board) {
        return null;
    }
    
    // Get pins for this board with group information
    $stmt = $pdo->prepare("
        SELECT p.*, pg.name as group_name, pg.color as group_color
        FROM pins p
        LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id
        WHERE p.board_id = ?
        ORDER BY CAST(p.pin_number AS UNSIGNED)
    ");
    $stmt->execute([$boardId]);
    $pins = $stmt->fetchAll();
    
    return ['board' => $board, 'pins' => $pins];
}

// Generate wiring guide SVG (based on Node.js version)
function generateWiringGuideSVG($sensorData, $microcontrollerData, $connections) {
    $sensorBoard = $sensorData['board'];
    $sensorPins = $sensorData['pins'];
    $microcontrollerBoard = $microcontrollerData['board'];
    $microcontrollerPins = $microcontrollerData['pins'];
    
    // Create pin maps for quick lookup
    $sensorPinMap = [];
    foreach ($sensorPins as $pin) {
        $sensorPinMap[$pin['id']] = $pin;
    }
    
    $microcontrollerPinMap = [];
    foreach ($microcontrollerPins as $pin) {
        $microcontrollerPinMap[$pin['id']] = $pin;
    }
    
    // Calculate board dimensions
    $sensorDimensions = getSVGDimensions($sensorBoard['svg_content']);
    $microcontrollerDimensions = getSVGDimensions($microcontrollerBoard['svg_content']);
    
    // Set default dimensions if not available
    $sensorWidth = $sensorDimensions['width'] ?? 200;
    $sensorHeight = $sensorDimensions['height'] ?? 150;
    $microcontrollerWidth = $microcontrollerDimensions['width'] ?? 200;
    $microcontrollerHeight = $microcontrollerDimensions['height'] ?? 150;
    
    // Calculate spacing and positions with larger scale
    $scale = 2.5; // Scale up the boards for better visibility
    
    $effectiveSensorWidth = $sensorWidth * $scale;
    $effectiveSensorHeight = $sensorHeight * $scale;
    $scaledMicrocontrollerWidth = $microcontrollerWidth * $scale;
    $scaledMicrocontrollerHeight = $microcontrollerHeight * $scale;
    
    // Reduce board spacing for better wire curves
    $boardSpacing = max(40, ($effectiveSensorWidth + $scaledMicrocontrollerWidth) * 0.05);
    
    // Calculate canvas dimensions - boards will extend to edges
    $totalWidth = $effectiveSensorWidth + $scaledMicrocontrollerWidth + $boardSpacing;
    $totalHeight = max($effectiveSensorHeight, $scaledMicrocontrollerHeight) + 50; // Extra 50px for wire curves
    
    // Position boards to extend to container edges
    $sensorX = 0; // Left board starts at left edge
    $microcontrollerX = $effectiveSensorWidth + $boardSpacing; // Right board ends at right edge
    $boardY = 25; // Center vertically with minimal margin for wire curves
    
    // Debug logging
    error_log("Wiring Guide SVG Dimensions:");
    error_log("Sensor board: {$sensorWidth}x{$sensorHeight} -> {$effectiveSensorWidth}x{$effectiveSensorHeight}");
    error_log("Microcontroller board: {$microcontrollerWidth}x{$microcontrollerHeight} -> {$scaledMicrocontrollerWidth}x{$scaledMicrocontrollerHeight}");
    error_log("Board spacing: {$boardSpacing}");
    error_log("Sensor X: {$sensorX}, Microcontroller X: {$microcontrollerX}, Board Y: {$boardY}");
    error_log("Total canvas: {$totalWidth}x{$totalHeight}");
    
    // Start building the SVG
    $svg = '<svg width="' . $totalWidth . '" height="' . $totalHeight . '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $totalWidth . ' ' . $totalHeight . '">
    <defs>
      <style>
        .wire { stroke-width: 3; fill: none; }
        .wire-power { stroke: #dc2626; } /* Red for VCC/5V/3.3V */
        .wire-ground { stroke: #000000; } /* Black for GND */
        .wire-signal { stroke: #3b82f6; } /* Blue for other pins */
        .connection-label { font-family: Arial, sans-serif; font-size: 10px; text-anchor: middle; fill: #374151; font-weight: bold; }
        /* .board-label { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-anchor: middle; fill: #1f2937; } */
      </style>
    </defs>
    
    <!-- Background -->
    <rect width="' . $totalWidth . '" height="' . $totalHeight . '" fill="#ffffff"/>';
    
    // Add sensor board SVG content
    if ($sensorBoard['svg_content']) {
        $sensorSVGContent = extractSVGContent($sensorBoard['svg_content']);
        $sensorCenterX = $sensorX + ($effectiveSensorWidth / 2);
        
        $svg .= '<g transform="translate(' . $sensorX . ', ' . $boardY . ') scale(' . $scale . ')">' . $sensorSVGContent . '</g>';
        // $svg .= '<text x="' . $sensorCenterX . '" y="' . ($boardY - 10) . '" class="board-label">' . htmlspecialchars($sensorBoard['name']) . '</text>';
    } else {
        // Fallback rectangle
        $svg .= '<rect x="' . $sensorX . '" y="' . $boardY . '" width="' . $effectiveSensorWidth . '" height="' . $effectiveSensorHeight . '" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" rx="8"/>
                // <text x="' . ($sensorX + ($effectiveSensorWidth / 2)) . '" y="' . ($boardY + 20) . '" class="board-label">' . htmlspecialchars($sensorBoard['name']) . '</text>';
    }
    
    // Add microcontroller board SVG content
    if ($microcontrollerBoard['svg_content']) {
        $microcontrollerSVGContent = extractSVGContent($microcontrollerBoard['svg_content']);
        $microcontrollerCenterX = $microcontrollerX + ($scaledMicrocontrollerWidth / 2);
        
        $svg .= '<g transform="translate(' . $microcontrollerX . ', ' . $boardY . ') scale(' . $scale . ')">' . $microcontrollerSVGContent . '</g>';
        // $svg .= '<text x="' . $microcontrollerCenterX . '" y="' . ($boardY - 10) . '" class="board-label">' . htmlspecialchars($microcontrollerBoard['name']) . '</text>';
    } else {
        // Fallback rectangle
        $svg .= '<rect x="' . $microcontrollerX . '" y="' . $boardY . '" width="' . $scaledMicrocontrollerWidth . '" height="' . $scaledMicrocontrollerHeight . '" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" rx="8"/>
                // <text x="' . ($microcontrollerX + ($scaledMicrocontrollerWidth / 2)) . '" y="' . ($boardY + 20) . '" class="board-label">' . htmlspecialchars($microcontrollerBoard['name']) . '</text>';
    }
    
    // Draw connections
    $wireColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#eab308'];
    $usedColors = [];
    
    foreach ($connections as $index => $connection) {
        $sensorPin = $sensorPinMap[$connection['sensorPin']] ?? null;
        $microcontrollerPin = $microcontrollerPinMap[$connection['microcontrollerPin']] ?? null;
        
        if ($sensorPin && $microcontrollerPin) {
            // Find pin positions in SVG using actual database coordinates
            $sensorPinPos = findPinPositionInSVG($sensorBoard['svg_content'], $sensorPin['pin_name'], $sensorBoard['id']);
            $microcontrollerPinPos = findPinPositionInSVG($microcontrollerBoard['svg_content'], $microcontrollerPin['pin_name'], $microcontrollerBoard['id']);
            
            $sensorPinX = $sensorX + ($sensorPinPos ? $sensorPinPos['x'] * $scale : $effectiveSensorWidth);
            $sensorPinY = $boardY + ($sensorPinPos ? $sensorPinPos['y'] * $scale : 50 + ($index * 30));
            
            $microcontrollerPinX = $microcontrollerX + ($microcontrollerPinPos ? $microcontrollerPinPos['x'] * $scale : 0);
            $microcontrollerPinY = $boardY + ($microcontrollerPinPos ? $microcontrollerPinPos['y'] * $scale : 50 + ($index * 30));
            
            // Determine wire color
            $sensorPinName = strtoupper($sensorPin['pin_name']);
            $microcontrollerPinName = strtoupper($microcontrollerPin['pin_name']);
            
            if (strpos($sensorPinName, 'VCC') !== false || strpos($sensorPinName, '5V') !== false || strpos($sensorPinName, '3.3V') !== false ||
                strpos($microcontrollerPinName, 'VCC') !== false || strpos($microcontrollerPinName, '5V') !== false || strpos($microcontrollerPinName, '3.3V') !== false) {
                $wireColor = '#dc2626'; // Red
            } elseif (strpos($sensorPinName, 'GND') !== false || strpos($microcontrollerPinName, 'GND') !== false) {
                $wireColor = '#000000'; // Black
            } else {
                // Use next available color
                $wireColor = $wireColors[$index % count($wireColors)];
            }
            
            // Draw curved wire with better curve calculation
            $midX = ($sensorPinX + $microcontrollerPinX) / 2;
            $distance = abs($microcontrollerPinX - $sensorPinX);
            $curveHeight = min(80, $distance * 0.3); // Adaptive curve height
            $controlY = min($sensorPinY, $microcontrollerPinY) - $curveHeight;
            
            // Use cubic bezier for smoother curves
            $control1X = $sensorPinX + ($distance * 0.3);
            $control2X = $microcontrollerPinX - ($distance * 0.3);
            
            $svg .= '<path d="M ' . $sensorPinX . ' ' . $sensorPinY . ' C ' . $control1X . ' ' . $controlY . ', ' . $control2X . ' ' . $controlY . ', ' . $microcontrollerPinX . ' ' . $microcontrollerPinY . '" class="wire" style="stroke: ' . $wireColor . ';"/>';
        }
    }
    
    $svg .= '</svg>';
    
    return $svg;
}

// Extract SVG content (similar to Node.js version)
function extractSVGContent($svgString) {
    // Find the content between <svg> and </svg> tags
    $svgStart = strpos($svgString, '<svg');
    $svgEnd = strrpos($svgString, '</svg>');
    
    if ($svgStart === false || $svgEnd === false) {
        return '';
    }
    
    // Find the end of the opening <svg> tag
    $tagEnd = strpos($svgString, '>', $svgStart) + 1;
    
    // Extract everything between the opening tag and closing tag
    return substr($svgString, $tagEnd, $svgEnd - $tagEnd);
}

// Get SVG dimensions (similar to Node.js version)
function getSVGDimensions($svgContent) {
    if (!$svgContent) {
        return ['width' => 200, 'height' => 150]; // Default fallback
    }
    
    // Look for width and height attributes
    preg_match('/width=["\']([^"\']+)["\']/', $svgContent, $widthMatch);
    preg_match('/height=["\']([^"\']+)["\']/', $svgContent, $heightMatch);
    
    // Look for viewBox attribute
    preg_match('/viewBox=["\']([^"\']+)["\']/', $svgContent, $viewBoxMatch);
    
    $width = 0;
    $height = 0;
    
    if ($widthMatch && $heightMatch) {
        // Extract numeric values (remove units like 'px', 'pt', etc.)
        $width = floatval(preg_replace('/[^0-9.]/', '', $widthMatch[1]));
        $height = floatval(preg_replace('/[^0-9.]/', '', $heightMatch[1]));
        
        // If dimensions are very small (likely in inches or other units), scale them up
        if ($width < 10 || $height < 10) {
            $width *= 100; // Convert to reasonable pixel size
            $height *= 100;
        }
    } elseif ($viewBoxMatch) {
        // Parse viewBox format: "x y width height"
        $viewBoxValues = preg_split('/\s+/', $viewBoxMatch[1]);
        if (count($viewBoxValues) >= 4) {
            $width = floatval($viewBoxValues[2]);
            $height = floatval($viewBoxValues[3]);
            
            // If dimensions are very small, scale them up
            if ($width < 10 || $height < 10) {
                $width *= 100;
                $height *= 100;
            }
        }
    }
    
    // Ensure minimum dimensions
    $width = max($width, 200);
    $height = max($height, 150);
    
    error_log("SVG Dimensions parsed: width={$width}, height={$height}");
    
    return ['width' => $width, 'height' => $height];
}

// Find pin position in SVG using database coordinates
function findPinPositionInSVG($svgContent, $pinName, $boardId = null) {
    if (!$svgContent || !$boardId) {
        return null;
    }
    
    // Get the actual pin coordinates from the database
    global $pdo;
    $stmt = $pdo->prepare("SELECT position_x, position_y FROM pins WHERE board_id = ? AND pin_name = ? AND position_x IS NOT NULL AND position_y IS NOT NULL");
    $stmt->execute([$boardId, $pinName]);
    $pin = $stmt->fetch();
    
    if ($pin) {
        return [
            'x' => $pin['position_x'],
            'y' => $pin['position_y']
        ];
    }
    
    return null;
}

// Fallback SVG if board data cannot be fetched
function generateFallbackSVG() {
    return '<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  <text x="400" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#666">
    Unable to generate wiring diagram - board data not available
  </text>
</svg>';
}

// Publish/unpublish wiring guide
function publishWiringGuide($pdo, $identifier) {
    verifyAdminToken();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['published'])) {
        errorResponse('Published status is required');
    }
    
    $published = $input['published'] ? 1 : 0;
    
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    $whereClause = $isNumeric ? "id = ?" : "slug = ?";
    
    $stmt = $pdo->prepare("UPDATE wiring_guides SET published = ? WHERE $whereClause");
    $stmt->execute([$published, $identifier]);
    
    if ($stmt->rowCount() === 0) {
        errorResponse('Wiring guide not found', 404);
    }
    
    successResponse([
        'published' => $published
    ], "Wiring guide " . ($published ? 'published' : 'unpublished') . " successfully");
}

// Update wiring guide
function updateWiringGuide($pdo, $identifier) {
    verifyAdminToken();
    
    error_log("updateWiringGuide called with identifier: " . $identifier);
    
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("updateWiringGuide input: " . json_encode($input));
    
    if (!$input) {
        errorResponse('Invalid JSON input');
    }
    
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    $whereClause = $isNumeric ? "id = ?" : "slug = ?";
    
    error_log("updateWiringGuide - isNumeric: " . ($isNumeric ? 'true' : 'false'));
    error_log("updateWiringGuide - whereClause: " . $whereClause);
    
    $updateFields = [];
    $updateValues = [];
    
    if (isset($input['description'])) {
        $updateFields[] = "description = ?";
        $updateValues[] = $input['description'];
    }
    
    if (isset($input['connections'])) {
        $updateFields[] = "connections = ?";
        $updateValues[] = json_encode($input['connections']);
    }
    
    if (isset($input['published'])) {
        $updateFields[] = "published = ?";
        $updateValues[] = $input['published'] ? 1 : 0;
    }
    
    if (empty($updateFields)) {
        errorResponse('No valid fields to update');
    }
    
    $updateValues[] = $identifier;
    $sql = "UPDATE wiring_guides SET " . implode(', ', $updateFields) . " WHERE $whereClause";
    
    error_log("updateWiringGuide - SQL: " . $sql);
    error_log("updateWiringGuide - Parameters: " . json_encode($updateValues));
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($updateValues);
    
    error_log("updateWiringGuide - rowCount: " . $stmt->rowCount());
    
    if ($stmt->rowCount() === 0) {
        // Check if the wiring guide exists at all
        $checkStmt = $pdo->prepare("SELECT id FROM wiring_guides WHERE $whereClause");
        $checkStmt->execute([$identifier]);
        $exists = $checkStmt->fetch();
        
        if (!$exists) {
            error_log("updateWiringGuide - Wiring guide does not exist with identifier: " . $identifier);
            errorResponse('Wiring guide not found', 404);
        } else {
            error_log("updateWiringGuide - Wiring guide exists but no changes made (values identical)");
        }
    }
    
    successResponse(null, 'Wiring guide updated successfully');
}

// Delete wiring guide
function deleteWiringGuide($pdo, $identifier) {
    verifyAdminToken();
    
    // Check if identifier is numeric (ID) or string (slug)
    $isNumeric = is_numeric($identifier);
    $whereClause = $isNumeric ? "id = ?" : "slug = ?";
    
    $stmt = $pdo->prepare("DELETE FROM wiring_guides WHERE $whereClause");
    $stmt->execute([$identifier]);
    
    if ($stmt->rowCount() === 0) {
        errorResponse('Wiring guide not found', 404);
    }
    
    successResponse(null, 'Wiring guide deleted successfully');
}

// Get boards by category for wiring guide creation
function getBoardsByCategory($pdo) {
    verifyAdminToken();
    
    $category = $_GET['category'] ?? '';
    
    if (empty($category)) {
        errorResponse('Category parameter is required', 400);
    }
    
    // Handle multiple categories separated by commas
    $categories = array_map('trim', explode(',', $category));
    $placeholders = str_repeat('?,', count($categories) - 1) . '?';
    
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            description,
            manufacturer,
            category,
            slug,
            published
        FROM boards 
        WHERE category IN ($placeholders) AND published = 1
        ORDER BY name ASC
    ");
    
    $stmt->execute($categories);
    $boards = $stmt->fetchAll();
    
    jsonResponse($boards);
}
?>
