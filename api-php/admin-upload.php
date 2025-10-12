<?php
// Start output buffering to prevent any output before JSON
ob_start();

require_once 'config.php';

// Initialize database
$pdo = initializeDatabase();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];

// Get path from query string or REQUEST_URI
$path = isset($_GET['path']) ? $_GET['path'] : '';
if (empty($path)) {
    $path = $_SERVER['REQUEST_URI'];
    // Remove script directory from path
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    $path = str_replace($scriptDir, '', $path);
    $path = trim($path, '/');
}

// Handle direct access to index.php with path (e.g., index.php/admin/upload-fritzing)
if (strpos($path, 'index.php/') === 0) {
    $path = substr($path, 10); // Remove 'index.php/' from the beginning
}

$pathParts = $path ? explode('/', $path) : [];
$pathParts = array_values(array_filter($pathParts, function($part) {
    return $part !== '';
}));

// Remove 'micropinouts' and 'api-php' from path if present
if (isset($pathParts[0]) && $pathParts[0] === 'micropinouts') {
    array_shift($pathParts);
}
if (isset($pathParts[0]) && $pathParts[0] === 'api-php') {
    array_shift($pathParts);
}

// Debug logging
error_log("Admin-upload.php - Final path parts: " . print_r($pathParts, true));

// Route handling
try {
    switch ($method) {
        case 'POST':
            if (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'upload-fritzing') {
                // POST /api/admin/upload-fritzing - Upload and parse Fritzing file
                uploadFritzingFile();
            } elseif (count($pathParts) === 2 && $pathParts[0] === 'admin' && $pathParts[1] === 'test-fritzing-data') {
                // POST /api/admin/test-fritzing-data - Test endpoint for Fritzing data
                testFritzingData();
            } else {
                errorResponse('Endpoint not found', 404);
            }
            break;
            
        default:
            errorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    // Clear any output buffer
    ob_clean();
    errorResponse('Internal server error: ' . $e->getMessage(), 500);
}

// Upload and parse Fritzing/SVG file
function uploadFritzingFile() {
    verifyAdminToken();
    
    if (!isset($_FILES['fritzingFile'])) {
        errorResponse('No file uploaded');
    }
    
    $file = $_FILES['fritzingFile'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        errorResponse('File upload failed: ' . $file['error']);
    }
    
    // Check file size
    if ($file['size'] > MAX_FILE_SIZE) {
        errorResponse('File too large. Maximum size is ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB');
    }
    
    // Check file type
    $fileName = strtolower($file['name']);
    $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
    
    if ($fileExt !== 'fzpz' && $fileExt !== 'svg') {
        errorResponse('Only .fzpz and .svg files are allowed');
    }
    
    // Create upload directory if it doesn't exist
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    
    // Generate unique filename
    $uniqueSuffix = time() . '-' . mt_rand(100000, 999999);
    $uploadPath = UPLOAD_DIR . 'fritzingFile-' . $uniqueSuffix . '.' . $fileExt;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        errorResponse('Failed to save uploaded file');
    }
    
    try {
        $requestId = time() . '-' . substr(md5(uniqid()), 0, 9);
        $fileType = $fileExt === 'svg' ? 'SVG' : 'Fritzing';
        
        // Process the file
        $result = processFritzingFile($uploadPath, $fileType);
        
        // Clean up uploaded file
        unlink($uploadPath);
        
        // Clear any output buffer before sending JSON
        ob_clean();
        successResponse([
            'data' => $result,
            'filename' => $file['name'],
            'fileType' => $fileType,
            'requestId' => $requestId
        ], "$fileType file parsed successfully");
        
    } catch (Exception $e) {
        // Clean up uploaded file on error
        if (file_exists($uploadPath)) {
            unlink($uploadPath);
        }
        
        // Clear any output buffer before sending JSON
        ob_clean();
        errorResponse('Failed to parse file: ' . $e->getMessage(), 500);
    }
}

// Test endpoint to simulate Fritzing data
function testFritzingData() {
    verifyAdminToken();
    
    $testData = [
        'pins' => [
            [
                'pin_number' => "1",
                'pin_name' => "5V",
                'position_x' => 50,
                'position_y' => 20,
                'functions' => "Power Supply",
                'voltage_range' => "5V",
                'group_name' => "Power"
            ],
            [
                'pin_number' => "2",
                'pin_name' => "GND",
                'position_x' => 50,
                'position_y' => 40,
                'functions' => "Ground",
                'voltage_range' => "0V",
                'group_name' => "Power"
            ],
            [
                'pin_number' => "3",
                'pin_name' => "D2",
                'position_x' => 100,
                'position_y' => 20,
                'functions' => "Digital I/O",
                'voltage_range' => "0-5V",
                'group_name' => "Digital"
            ],
            [
                'pin_number' => "4",
                'pin_name' => "A0",
                'position_x' => 100,
                'position_y' => 40,
                'functions' => "Analog Input",
                'voltage_range' => "0-5V",
                'group_name' => "Analog"
            ]
        ],
        'totalPins' => 4,
        'viewType' => "schematic",
        'boardMetadata' => [
            'title' => "Test Arduino Uno",
            'description' => "A test Arduino Uno board for development and testing purposes. This is a sample board with basic GPIO pins, power pins, and analog inputs.",
            'author' => "Test Author",
            'date' => "2024-01-01",
            'manufacturer' => "Arduino",
            'package_type' => "DIP",
            'voltage_range' => "5V",
            'clock_speed' => "16MHz",
            'flash_memory' => "32KB",
            'ram' => "2KB"
        ]
    ];
    
    successResponse([
        'data' => $testData
    ], 'Test Fritzing data generated');
}

// Process Fritzing file (simplified version)
function processFritzingFile($filePath, $fileType) {
    if ($fileType === 'SVG') {
        // For SVG files, just return the content
        $svgContent = file_get_contents($filePath);
        
        return [
            'pins' => [],
            'totalPins' => 0,
            'viewType' => 'svg',
            'displaySVG' => $svgContent,
            'boardMetadata' => [
                'title' => 'Custom SVG Board',
                'description' => 'A custom board defined by SVG file',
                'manufacturer' => 'Unknown',
                'package_type' => 'Custom'
            ]
        ];
    } else {
        // For .fzpz files, parse the ZIP archive
        return parseFritzingArchive($filePath);
    }
}

function parseFritzingArchive($filePath) {
    // Check if ZIP extension is available
    if (!class_exists('ZipArchive')) {
        error_log('ZIP extension not available');
        return [
            'pins' => [],
            'totalPins' => 0,
            'viewType' => 'fritzing',
            'displaySVG' => null,
            'boardMetadata' => [
                'title' => 'Fritzing Part (ZIP not supported)',
                'description' => 'Fritzing part file - ZIP parsing not available',
                'manufacturer' => 'Unknown',
                'package_type' => 'Fritzing'
            ]
        ];
    }
    
    $zip = new ZipArchive();
    $result = $zip->open($filePath);
    
    if ($result !== TRUE) {
        error_log("Failed to open ZIP file: $result");
        return [
            'pins' => [],
            'totalPins' => 0,
            'viewType' => 'fritzing',
            'displaySVG' => null,
            'boardMetadata' => [
                'title' => 'Fritzing Part (Error)',
                'description' => 'Failed to parse Fritzing file',
                'manufacturer' => 'Unknown',
                'package_type' => 'Fritzing'
            ]
        ];
    }
    
    $files = [];
    $fzpContent = '';
    $breadboardSvg = '';
    $iconSvg = '';
    
    // Extract files from ZIP
    error_log("ZIP file has " . $zip->numFiles . " entries");
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        $content = $zip->getFromIndex($i);
        
        error_log("ZIP entry: $filename (size: " . strlen($content) . " bytes)");
        
        if (preg_match('/\.fzp$/i', $filename) && !preg_match('/^__MACOSX/', $filename)) {
            $fzpContent = $content;
            error_log("Found FZP file: $filename (content length: " . strlen($content) . ")");
        } elseif (preg_match('/breadboard.*\.svg$/i', $filename) && !preg_match('/^__MACOSX/', $filename)) {
            $breadboardSvg = $content;
            error_log("Found breadboard SVG: $filename");
        } elseif (preg_match('/icon.*\.svg$/i', $filename) && !preg_match('/^__MACOSX/', $filename)) {
            $iconSvg = $content;
            error_log("Found icon SVG: $filename");
        }
    }
    
    $zip->close();
    
    // Parse FZP content for pins
    $pins = [];
    $boardMetadata = [
        'title' => 'Fritzing Part',
        'description' => 'A Fritzing part file',
        'manufacturer' => 'Unknown',
        'package_type' => 'Fritzing'
    ];
    
    if ($fzpContent) {
        $parsedData = parseFZPContent($fzpContent);
        $pins = $parsedData['pins'];
        $pinMap = $parsedData['pinMap']; // Map of svgId to connector name
        $boardMetadata = array_merge($boardMetadata, $parsedData['metadata']);
        
        // Extract coordinates from SVG file using the pin map
        if ($breadboardSvg && !empty($pins)) {
            error_log("Extracting coordinates from SVG (length: " . strlen($breadboardSvg) . ") for " . count($pins) . " pins");
            $pins = extractCoordinatesFromSVG($breadboardSvg, $pins);
            error_log("After coordinate extraction: " . count($pins) . " pins processed");
        } else {
            error_log("Skipping coordinate extraction - breadboardSvg: " . (empty($breadboardSvg) ? 'empty' : 'present') . ", pins: " . count($pins));
        }
    }
    
    // Process SVG to make pins clickable
    $processedSVG = $breadboardSvg ?: $iconSvg;
    if ($processedSVG && !empty($pins) && !empty($pinMap)) {
        $processedSVG = makeSVGClickable($processedSVG, $pins, $pinMap);
    }
    
    return [
        'pins' => $pins,
        'totalPins' => count($pins),
        'viewType' => 'fritzing',
        'displaySVG' => $processedSVG,
        'boardMetadata' => $boardMetadata
    ];
}

function parseFZPContent($fzpContent) {
    $pins = [];
    $metadata = [];
    $pinMap = []; // Map of svgId to connector name
    
    // Check if content is empty
    if (empty($fzpContent)) {
        error_log("FZP content is empty");
        return [
            'pins' => [],
            'pinMap' => [],
            'metadata' => ['title' => 'Unknown Part', 'description' => 'No FZP content found']
        ];
    }
    
    try {
        // Parse XML content
        $dom = new DOMDocument();
        libxml_use_internal_errors(true); // Suppress XML errors
        $dom->loadXML($fzpContent);
        libxml_clear_errors();
        
        // Extract metadata from FZP file
        $titleNode = $dom->getElementsByTagName('title')->item(0);
        if ($titleNode) {
            $metadata['title'] = trim($titleNode->textContent);
        }
        
        $descriptionNode = $dom->getElementsByTagName('description')->item(0);
        if ($descriptionNode) {
            $metadata['description'] = trim($descriptionNode->textContent);
        }
        
        $authorNode = $dom->getElementsByTagName('author')->item(0);
        if ($authorNode) {
            $metadata['manufacturer'] = trim($authorNode->textContent);
        }
        
        // Try to get additional metadata from other common FZP elements
        $labelNode = $dom->getElementsByTagName('label')->item(0);
        if ($labelNode && !isset($metadata['title'])) {
            $metadata['title'] = trim($labelNode->textContent);
        }
        
        $versionNode = $dom->getElementsByTagName('version')->item(0);
        if ($versionNode) {
            $metadata['version'] = trim($versionNode->textContent);
        }
        
        $dateNode = $dom->getElementsByTagName('date')->item(0);
        if ($dateNode) {
            $metadata['date'] = trim($dateNode->textContent);
        }
        
        // Set default values if metadata is missing
        if (empty($metadata['title'])) {
            $metadata['title'] = 'Fritzing Part';
        }
        if (empty($metadata['description'])) {
            $metadata['description'] = 'A Fritzing part file';
        }
        if (empty($metadata['manufacturer'])) {
            $metadata['manufacturer'] = 'Unknown';
        }
        $metadata['package_type'] = 'Fritzing';
        
        error_log("Extracted metadata: " . json_encode($metadata));
        
        // Extract pins - handle different Fritzing XML structures
        $pinNodes = $dom->getElementsByTagName('pin');
        $connectorNodes = $dom->getElementsByTagName('connector');
        
        error_log("Found " . $pinNodes->length . " pin nodes and " . $connectorNodes->length . " connector nodes");
        
        // If we have connector nodes, process them directly
        if ($connectorNodes->length > 0) {
            foreach ($connectorNodes as $index => $connectorNode) {
                $pinName = $connectorNode->getAttribute('name') ?: 'Unknown';
                $pinData = [
                    'pin_number' => $index + 1,
                    'pin_name' => $pinName,
                    'position_x' => 0,
                    'position_y' => 0,
                    'group_name' => determinePinGroup($pinName),
                    'functions' => getPinFunctions($pinName),
                    'voltage_range' => getVoltageRange($pinName),
                    'description' => ''
                ];
                
                // Try to get description from the connector element itself
                $descriptionNodes = $connectorNode->getElementsByTagName('description');
                if ($descriptionNodes->length > 0) {
                    $pinData['description'] = $descriptionNodes->item(0)->textContent;
                }
                
                // Get SVG ID from breadboardView p element
                $breadboardViews = $connectorNode->getElementsByTagName('breadboardView');
                if ($breadboardViews->length > 0) {
                    $breadboardView = $breadboardViews->item(0);
                    $pNodes = $breadboardView->getElementsByTagName('p');
                    if ($pNodes->length > 0) {
                        $svgId = $pNodes->item(0)->getAttribute('svgId');
                        if ($svgId) {
                            $pinData['svgId'] = $svgId;
                            error_log("Found SVG ID for pin {$pinData['pin_name']}: $svgId");
                        }
                    }
                }
                
                $pins[] = $pinData;
            }
        } elseif ($pinNodes->length > 0) {
            // Process pin nodes as before (fallback for different structure)
            foreach ($pinNodes as $pinNode) {
                $pinData = [
                    'name' => $pinNode->getAttribute('name') ?: 'Unknown',
                    'type' => 'digital', // Default type
                    'position' => ['x' => 0, 'y' => 0], // Default position
                    'description' => ''
                ];
                
                // Try to get pin type from connector
                $connectorNodes = $pinNode->getElementsByTagName('connector');
                if ($connectorNodes->length > 0) {
                    $connector = $connectorNodes->item(0);
                    $type = $connector->getAttribute('type');
                    if ($type) {
                        $pinData['type'] = $type;
                    }
                }
                
                // Try to get description
                $descriptionNodes = $pinNode->getElementsByTagName('description');
                if ($descriptionNodes->length > 0) {
                    $pinData['description'] = $descriptionNodes->item(0)->textContent;
                }
                
                $pins[] = $pinData;
            }
        }
        
        error_log("Parsed " . count($pins) . " pins from FZP file");
        
        // Extract pin map from FZP (mapping svgId to connector name)
        $connectors = $dom->getElementsByTagName('connector');
        for ($i = 0; $i < $connectors->length; $i++) {
            $conn = $connectors->item($i);
            $name = $conn->getAttribute('name');
            
            // Find breadboardView p element
            $breadboardViews = $conn->getElementsByTagName('breadboardView');
            if ($breadboardViews->length > 0) {
                $breadboardView = $breadboardViews->item(0);
                $pElements = $breadboardView->getElementsByTagName('p');
                if ($pElements->length > 0) {
                    $svgElem = $pElements->item(0);
                    $svgId = $svgElem->getAttribute('svgId');
                    if ($svgId && $name) {
                        $pinMap[$svgId] = $name;
                    }
                }
            }
        }
        
        error_log("Extracted " . count($pinMap) . " pin mappings from FZP file");
        
    } catch (Exception $e) {
        error_log("Error parsing FZP content: " . $e->getMessage());
    }
    
    return [
        'pins' => $pins,
        'pinMap' => $pinMap,
        'metadata' => $metadata
    ];
}

function extractCoordinatesFromSVG($svgContent, $pins) {
    // Parse SVG content
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();
    
    // Debug: Log all available element IDs in the SVG
    $xpath = new DOMXPath($dom);
    $allElements = $xpath->query('//*[@id]');
    $availableIds = [];
    foreach ($allElements as $element) {
        $availableIds[] = $element->getAttribute('id');
    }
    error_log("Available SVG element IDs: " . implode(', ', $availableIds));
    
    // Update each pin with coordinates from SVG
    foreach ($pins as &$pin) {
        if (isset($pin['svgId'])) {
            // Try getElementById first
            $svgElement = $dom->getElementById($pin['svgId']);
            
            // If getElementById fails, try XPath as fallback
            if (!$svgElement) {
                $xpath = new DOMXPath($dom);
                $elements = $xpath->query("//*[@id='{$pin['svgId']}']");
                if ($elements->length > 0) {
                    $svgElement = $elements->item(0);
                    error_log("Found element using XPath fallback for {$pin['svgId']}");
                }
            }
            
            if ($svgElement) {
                // Debug: Log element attributes
                $elementInfo = [
                    'tagName' => $svgElement->tagName,
                    'cx' => $svgElement->getAttribute('cx'),
                    'cy' => $svgElement->getAttribute('cy'),
                    'x' => $svgElement->getAttribute('x'),
                    'y' => $svgElement->getAttribute('y'),
                    'transform' => $svgElement->getAttribute('transform'),
                    'd' => $svgElement->getAttribute('d')
                ];
                error_log("Element {$pin['svgId']} attributes: " . json_encode($elementInfo));
                
                // Try to get position from different attributes
                $positionX = 0;
                $positionY = 0;
                
                if ($svgElement->getAttribute('cx') && $svgElement->getAttribute('cy')) {
                    // Circle element
                    $positionX = floatval($svgElement->getAttribute('cx'));
                    $positionY = floatval($svgElement->getAttribute('cy'));
                    error_log("Using circle coordinates: cx=$positionX, cy=$positionY");
                } elseif ($svgElement->getAttribute('x') && $svgElement->getAttribute('y')) {
                    // Rectangle or other positioned element
                    $positionX = floatval($svgElement->getAttribute('x'));
                    $positionY = floatval($svgElement->getAttribute('y'));
                    error_log("Using rect coordinates: x=$positionX, y=$positionY");
                } elseif ($svgElement->getAttribute('transform')) {
                    // Element with transform - extract translate values
                    $transform = $svgElement->getAttribute('transform');
                    if (preg_match('/translate\(([^,]+),\s*([^)]+)\)/', $transform, $matches)) {
                        $positionX = floatval($matches[1]);
                        $positionY = floatval($matches[2]);
                        error_log("Using transform coordinates: x=$positionX, y=$positionY");
                    }
                } elseif ($svgElement->getAttribute('d')) {
                    // Path element - extract center from path data
                    $pathData = $svgElement->getAttribute('d');
                    $coordinates = extractPathCenter($pathData);
                    if ($coordinates) {
                        $positionX = $coordinates['x'];
                        $positionY = $coordinates['y'];
                        error_log("Using path center coordinates: x=$positionX, y=$positionY");
                    }
                } else {
                    // Try to get bounding box if no direct coordinates
                    $bbox = $svgElement->getBBox();
                    if ($bbox && $bbox->width > 0 && $bbox->height > 0) {
                        $positionX = $bbox->x + ($bbox->width / 2);
                        $positionY = $bbox->y + ($bbox->height / 2);
                        error_log("Using bbox center coordinates: x=$positionX, y=$positionY");
                    }
                }
                
                // Update pin position
                $pin['position_x'] = $positionX;
                $pin['position_y'] = $positionY;
                error_log("Final coordinates for pin {$pin['pin_name']} (svgId: {$pin['svgId']}): x=$positionX, y=$positionY");
            } else {
                error_log("SVG element not found for pin {$pin['pin_name']} (svgId: {$pin['svgId']})");
                error_log("Looking for ID: {$pin['svgId']} but available IDs are: " . implode(', ', $availableIds));
            }
        }
    }
    
    return $pins;
}

/**
 * Extract center coordinates from SVG path data
 * Handles complex paths with multiple M commands and calculates the geometric center
 */
function extractPathCenter($pathData) {
    if (empty($pathData)) {
        return null;
    }
    
    // Extract all coordinate pairs from the path
    $coordinates = [];
    
    // Match all coordinate pairs in the path (M, L, C, S, Q, T, A commands)
    if (preg_match_all('/([MLCSQTA])\s*([0-9.-]+),([0-9.-]+)/', $pathData, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $x = floatval($match[2]);
            $y = floatval($match[3]);
            $coordinates[] = ['x' => $x, 'y' => $y];
        }
    }
    
    if (empty($coordinates)) {
        return null;
    }
    
    // For pin holes, we want to find the center of the hole, not just the average
    // Look for circular patterns in the path data
    if (preg_match('/c-([0-9.-]+),([0-9.-]+)-([0-9.-]+),([0-9.-]+)-([0-9.-]+),([0-9.-]+)/', $pathData, $circleMatch)) {
        // This looks like a circular arc - use the first M command as the center
        if (preg_match('/M([0-9.-]+),([0-9.-]+)/', $pathData, $centerMatch)) {
            return [
                'x' => floatval($centerMatch[1]),
                'y' => floatval($centerMatch[2])
            ];
        }
    }
    
    // For complex paths, try to find the bounding box center
    $minX = min(array_column($coordinates, 'x'));
    $maxX = max(array_column($coordinates, 'x'));
    $minY = min(array_column($coordinates, 'y'));
    $maxY = max(array_column($coordinates, 'y'));
    
    return [
        'x' => ($minX + $maxX) / 2,
        'y' => ($minY + $maxY) / 2
    ];
}

function makeSVGClickable($svgContent, $pins, $pinMap) {
    // Create DOMDocument to parse SVG
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();
    
    // Add CSS styles for clickable pins
    $style = $dom->createElement('style');
    $style->textContent = '
        .pin-hole {
            cursor: pointer !important;
            stroke-width: 2 !important;
            fill: rgba(255, 0, 0, 0.4) !important;
            transition: all 0.2s ease !important;
            pointer-events: all !important;
            z-index: 1000 !important;
        }
        .pin-hole:hover {
            stroke-width: 3 !important;
            fill: rgba(255, 0, 0, 0.7) !important;
        }
        .pin-hole.selected {
            stroke-width: 4 !important;
            fill: rgba(0, 0, 255, 0.6) !important;
        }
        .pin-hole.hidden {
            display: none !important;
        }
        /* Group-specific colors */
        .pin-hole.group-digital { stroke: #4ecdc4 !important; }
        .pin-hole.group-power { stroke: #ff6b6b !important; }
        .pin-hole.group-communication { stroke: #96ceb4 !important; }
        .pin-hole.group-analog { stroke: #45b7d1 !important; }
        .pin-hole.group-pwm { stroke: #feca57 !important; }
        .pin-hole.group-special { stroke: #ff9ff3 !important; }
        .pin-hole.group-other { stroke: #64748b !important; }
    ';
    
    // Insert styles after opening svg tag
    $svgElement = $dom->documentElement;
    $svgElement->insertBefore($style, $svgElement->firstChild);
    
    // Make SVG responsive
    $svgElement->setAttribute('style', 'width: 100%; height: 100%; max-width: 100%; max-height: 100%;');
    
    // Process each pin to make it clickable by finding existing SVG elements
    $pinHoleElements = [];
    
    foreach ($pins as $index => $pin) {
        $pinName = $pin['pin_name'];
        $svgId = $pin['svgId'];
        
        if ($svgId) {
            // Find the existing SVG element by ID using XPath fallback
            $existingElement = $dom->getElementById($svgId);
            if (!$existingElement) {
                $xpath = new DOMXPath($dom);
                $elements = $xpath->query("//*[@id='{$svgId}']");
                if ($elements->length > 0) {
                    $existingElement = $elements->item(0);
                }
            }
            
            if ($existingElement) {
                // Get group information
                $groupName = $pin['group_name'] ?? 'Other';
                $groupClass = 'group-' . strtolower(str_replace(' ', '-', $groupName));
                
                // Make the existing element clickable
                $existingElement->setAttribute('class', "pin-hole {$groupClass}");
                $existingElement->setAttribute('data-pin', $pinName);
                $existingElement->setAttribute('data-group', $groupName);
                $existingElement->setAttribute('data-pin-number', $pin['pin_number']);
                
                // Override styling to make it visible and clickable
                $existingElement->setAttribute('fill', 'rgba(255, 0, 0, 0.4)');
                $existingElement->setAttribute('stroke', '#ff6b6b');
                $existingElement->setAttribute('stroke-width', '2');
                $existingElement->setAttribute('cursor', 'pointer');
                $existingElement->setAttribute('pointer-events', 'all');
                
                // Ensure the element is on top by moving it to the end of the SVG
                $existingElement->parentNode->removeChild($existingElement);
                $svgElement->appendChild($existingElement);
                
                // Add tooltip
                $title = $dom->createElement('title');
                $title->textContent = $pinName . ' (' . $groupName . ')';
                $existingElement->appendChild($title);
                
                // Collect element for reordering
                $pinHoleElements[] = $existingElement;
                
                error_log("Made pin clickable: $pinName (svgId: $svgId)");
            } else {
                error_log("SVG element not found for pin: $pinName (svgId: $svgId)");
            }
        } else {
            error_log("No svgId mapping found for pin: $pinName");
        }
    }
    
    // Return processed SVG
    return $dom->saveXML();
}

/**
 * Determine pin group based on pin name patterns
 */
function determinePinGroup($pinName) {
    $pinName = strtoupper($pinName);
    
    // Power pins
    if (strpos($pinName, 'GND') !== false || 
        strpos($pinName, 'VCC') !== false || 
        strpos($pinName, 'VIN') !== false || 
        strpos($pinName, '3.3V') !== false || 
        strpos($pinName, '5V') !== false) {
        return 'Power';
    }
    
    // Communication pins
    if (strpos($pinName, 'SDA') !== false || 
        strpos($pinName, 'SCL') !== false || 
        strpos($pinName, 'MOSI') !== false || 
        strpos($pinName, 'MISO') !== false || 
        strpos($pinName, 'SCK') !== false || 
        strpos($pinName, 'TX') !== false || 
        strpos($pinName, 'RX') !== false) {
        return 'Communication';
    }
    
    // Analog pins
    if (preg_match('/^A\d+$/', $pinName) || strpos($pinName, 'ANALOG') !== false) {
        return 'Analog';
    }
    
    // PWM pins
    if (strpos($pinName, 'PWM') !== false) {
        return 'PWM';
    }
    
    // Special pins
    if (strpos($pinName, 'RESET') !== false || 
        strpos($pinName, 'CLK') !== false || 
        strpos($pinName, 'CLOCK') !== false) {
        return 'Special';
    }
    
    // Default to Digital
    return 'Digital';
}

/**
 * Get pin functions based on name
 */
function getPinFunctions($pinName) {
    $pinName = strtoupper($pinName);
    
    if ($pinName === 'GND') {
        return 'Ground';
    } elseif (strpos($pinName, 'VCC') !== false || 
              strpos($pinName, 'VIN') !== false || 
              strpos($pinName, '3.3V') !== false || 
              strpos($pinName, '5V') !== false) {
        return 'Power Supply';
    } elseif (strpos($pinName, 'SDA') !== false) {
        return 'I2C Data';
    } elseif (strpos($pinName, 'SCL') !== false) {
        return 'I2C Clock';
    } elseif (strpos($pinName, 'MOSI') !== false) {
        return 'SPI Master Out';
    } elseif (strpos($pinName, 'MISO') !== false) {
        return 'SPI Master In';
    } elseif (strpos($pinName, 'SCK') !== false) {
        return 'SPI Clock';
    } elseif (strpos($pinName, 'TX') !== false) {
        return 'UART Transmit';
    } elseif (strpos($pinName, 'RX') !== false) {
        return 'UART Receive';
    } elseif (preg_match('/^A\d+$/', $pinName)) {
        return 'Analog Input';
    } elseif (strpos($pinName, 'PWM') !== false) {
        return 'PWM Output';
    } elseif (strpos($pinName, 'RESET') !== false) {
        return 'Reset';
    } else {
        return 'Digital I/O';
    }
}

/**
 * Get voltage range based on pin name
 */
function getVoltageRange($pinName) {
    $pinName = strtoupper($pinName);
    
    if (strpos($pinName, '3.3V') !== false) {
        return '3.3V';
    } elseif (strpos($pinName, '5V') !== false) {
        return '5V';
    } elseif (strpos($pinName, 'GND') !== false) {
        return '0V';
    } elseif (strpos($pinName, 'VCC') !== false || strpos($pinName, 'VIN') !== false) {
        return '3.3V-5V';
    } else {
        return '0-3.3V';
    }
}
?>