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
        $svgContent = replacePathCirclesWithCircles($svgContent);
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

/**
 * Build bbox (min/max) from pin centers — this is the “rectangle” we point to.
 */
function build_pin_bbox(array $pinCenters): array {
    $xs = array_column($pinCenters, 'x');
    $ys = array_column($pinCenters, 'y');
    return [
        'minX' => min($xs), 'maxX' => max($xs),
        'minY' => min($ys), 'maxY' => max($ys),
        'width' => max($xs) - min($xs),
        'height' => max($ys) - min($ys),
    ];
}

/**
 * Corridor-based blocker: returns true if the bar from (cx,cy) in 'dir'
 * of length $reach (your Lfixed) would pass through any other pin within a
 * lateral corridor of +/- $corrHalf.
 */
function path_blocked_corridor(array $self, string $dir, float $reach, array $pinCenters, float $corrHalf): bool {
    $cx = $self['x']; $cy = $self['y'];

    foreach ($pinCenters as $id => $p) {
        if ($p === $self) continue;
        $px = $p['x']; $py = $p['y'];

        if ($dir === 'E') {
            // in front horizontally and within vertical corridor
            if ($px > $cx && $px <= $cx + $reach && abs($py - $cy) <= $corrHalf) return true;
        } elseif ($dir === 'W') {
            if ($px < $cx && $px >= $cx - $reach && abs($py - $cy) <= $corrHalf) return true;
        } elseif ($dir === 'S') {
            if ($py > $cy && $py <= $cy + $reach && abs($px - $cx) <= $corrHalf) return true;
        } elseif ($dir === 'N') {
            if ($py < $cy && $py >= $cy - $reach && abs($px - $cx) <= $corrHalf) return true;
        }
    }
    return false;
}

/**
 * Pick NESW direction to the nearest edge, but avoid overlaps using a corridor check
 * measured against the fixed length $reach (Lfixed).
 * Returns array[id] = 'N'|'S'|'E'|'W'
 */
function compute_pin_directions_fixed(array $pinCenters, array $bbox, float $reach, float $corrHalf): array {
    $out = [];
    $tieOrder = ['N','S','E','W']; // tie priority for equal distances

    foreach ($pinCenters as $id => $pos) {
        $cx = $pos['x']; $cy = $pos['y'];
        $dists = [
            'W' => $cx - $bbox['minX'],
            'E' => $bbox['maxX'] - $cx,
            'N' => $cy - $bbox['minY'],
            'S' => $bbox['maxY'] - $cy,
        ];

        // sort candidates by nearest edge, then tie priority
        $dirs = array_keys($dists);
        usort($dirs, function($a, $b) use ($dists, $tieOrder) {
            $cmp = $dists[$a] <=> $dists[$b];
            if ($cmp !== 0) return $cmp;
            return array_search($a, $tieOrder) <=> array_search($b, $tieOrder);
        });

        // test candidates with corridor-based blocking up to 'reach'
        $chosen = $dirs[0];
        foreach ($dirs as $dir) {
            if (!path_blocked_corridor($pos, $dir, $reach, $pinCenters, $corrHalf)) {
                $chosen = $dir;
                break;
            }
        }
        $out[$id] = $chosen;
    }
    return $out;
}

function expand_svg_canvas_string(string $svgContent, array $bbox, float $padX, float $padY): string {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();

    $svg = $dom->documentElement;
    if (!$svg || $svg->tagName !== 'svg') return $svgContent;

    $viewBox = trim($svg->getAttribute('viewBox'));

    if ($viewBox !== '') {
        $parts = preg_split('/\s+/', $viewBox);
        if (count($parts) === 4) {
            // Save original VB + pad as data- attrs
            $svg->setAttribute('data-orig-vbx', $parts[0]);
            $svg->setAttribute('data-orig-vby', $parts[1]);
            $svg->setAttribute('data-orig-vbw', $parts[2]);
            $svg->setAttribute('data-orig-vbh', $parts[3]);
            $svg->setAttribute('data-padx', $padX);
            $svg->setAttribute('data-pady', $padY);

            $x0 = (float)$parts[0] - $padX;
            $y0 = (float)$parts[1] - $padY;
            $w  = (float)$parts[2] + 2*$padX;
            $h  = (float)$parts[3] + 2*$padY;
            $svg->setAttribute('viewBox', "$x0 $y0 $w $h");
        }
    } else {
        // Fallback: derive from bbox
        $minX = $bbox['minX'] ?? 0;
        $minY = $bbox['minY'] ?? 0;
        $w    = $bbox['width'] ?? 1000;
        $h    = $bbox['height'] ?? 1000;

        $svg->setAttribute('data-orig-vbx', $minX);
        $svg->setAttribute('data-orig-vby', $minY);
        $svg->setAttribute('data-orig-vbw', $w);
        $svg->setAttribute('data-orig-vbh', $h);
        $svg->setAttribute('data-padx', $padX);
        $svg->setAttribute('data-pady', $padY);

        $svg->setAttribute('viewBox', ($minX - $padX) . ' ' . ($minY - $padY) . ' ' . ($w + 2*$padX) . ' ' . ($h + 2*$padY));
    }

    // Ensure nothing clips
    $svg->setAttribute('overflow', 'visible');
    $svg->setAttribute('style', trim($svg->getAttribute('style') . '; overflow:visible;'));

    return $dom->saveXML();
}

function compute_pin_directions_and_edge_dists(array $pinCenters, array $bbox, float $eps = 1.0): array {
    $out = [];
    $tieOrder = ['N','S','E','W']; // tie-priority for equal distances

    foreach ($pinCenters as $id => $pos) {
        $cx = $pos['x']; $cy = $pos['y'];

        $dists = [
            'W' => $cx - $bbox['minX'],
            'E' => $bbox['maxX'] - $cx,
            'N' => $cy - $bbox['minY'],
            'S' => $bbox['maxY'] - $cy,
        ];

        // sort by distance asc, then by tieOrder
        $dirs = array_keys($dists);
        usort($dirs, function($a, $b) use ($dists, $tieOrder) {
            $cmp = $dists[$a] <=> $dists[$b];
            if ($cmp !== 0) return $cmp;
            return array_search($a, $tieOrder) <=> array_search($b, $tieOrder);
        });

        // choose nearest edge that is not blocked
        $chosenDir = $dirs[0];
        foreach ($dirs as $dir) {
            $edge = ($dir === 'E') ? $bbox['maxX'] :
                    (($dir === 'W') ? $bbox['minX'] :
                    (($dir === 'S') ? $bbox['maxY'] : $bbox['minY']));
            if (!path_blocked($pos, $dir, $edge, $pinCenters, $eps)) {
                $chosenDir = $dir;
                break;
            }
        }

        // save direction + raw distance to that edge (no overshoot, no fixed length)
        $edgeDist = $dists[$chosenDir];
        $out[$id] = ['dir' => $chosenDir, 'edgeDist' => $edgeDist];
    }

    return $out;
}


/**
 * For every pin center, pick NESW direction to the nearest edge, avoiding overlaps.
 * Returns array[id] = ['dir' => 'N|E|S|W', 'len' => float].
 * len is the distance to that edge + overshoot (so rectangle head goes past the bbox).
 */
function compute_pin_directions_and_lengths(array $pinCenters, array $bbox, float $eps = 1.0, float $overshoot = null): array {
    if ($overshoot === null) {
        // Overshoot ~ 1.5% of the larger side, min 6 pixels
        $overshoot = max(6.0, 0.015 * max($bbox['width'], $bbox['height']));
    }
    $out = [];

    // Priority when distances are equal: N, S, E, W
    $tieOrder = ['N','S','E','W'];

    foreach ($pinCenters as $id => $pos) {
        $cx = $pos['x']; $cy = $pos['y'];
        $dists = [
            'W' => $cx - $bbox['minX'],
            'E' => $bbox['maxX'] - $cx,
            'N' => $cy - $bbox['minY'],
            'S' => $bbox['maxY'] - $cy,
        ];

        // Sort by distance asc, and apply tie priority N,S,E,W
        $dirs = array_keys($dists);
        usort($dirs, function($a, $b) use ($dists, $tieOrder) {
            $cmp = $dists[$a] <=> $dists[$b];
            if ($cmp !== 0) return $cmp;
            return array_search($a, $tieOrder) <=> array_search($b, $tieOrder);
        });

        $chosenDir = 'E'; $len = 0; $found = false;

        foreach ($dirs as $dir) {
            switch ($dir) {
                case 'E':
                    $edge = $bbox['maxX'];
                    if (!path_blocked($pos, 'E', $edge, $pinCenters, $eps)) {
                        $chosenDir = 'E'; $len = ($edge - $cx) + $overshoot; $found = true;
                    }
                    break;
                case 'W':
                    $edge = $bbox['minX'];
                    if (!path_blocked($pos, 'W', $edge, $pinCenters, $eps)) {
                        $chosenDir = 'W'; $len = ($cx - $edge) + $overshoot; $found = true;
                    }
                    break;
                case 'S':
                    $edge = $bbox['maxY'];
                    if (!path_blocked($pos, 'S', $edge, $pinCenters, $eps)) {
                        $chosenDir = 'S'; $len = ($edge - $cy) + $overshoot; $found = true;
                    }
                    break;
                case 'N':
                    $edge = $bbox['minY'];
                    if (!path_blocked($pos, 'N', $edge, $pinCenters, $eps)) {
                        $chosenDir = 'N'; $len = ($cy - $edge) + $overshoot; $found = true;
                    }
                    break;
            }
            if ($found) break;
        }

        // Fallback: if everything blocked (unlikely), take absolute nearest with overshoot
        if (!$found) {
            asort($dists);
            $fallbackDir = array_key_first($dists);
            $chosenDir = $fallbackDir;
            if ($fallbackDir === 'E') $len = ($bbox['maxX'] - $cx) + $overshoot;
            elseif ($fallbackDir === 'W') $len = ($cx - $bbox['minX']) + $overshoot;
            elseif ($fallbackDir === 'S') $len = ($bbox['maxY'] - $cy) + $overshoot;
            else $len = ($cy - $bbox['minY']) + $overshoot; // 'N'
        }

        $out[$id] = ['dir' => $chosenDir, 'len' => $len];
    }

    return $out;
}

/**
 * Draws a clickable <rect> per pin toward its chosen edge.
 * Keeps original pin shapes; overlays colored rectangles on top and makes them clickable.
 */
function draw_clickable_direction_rects_fixed(string $svgContent, array $pins, array $pinCenters, array $dirEdge, float $Lfixed): string {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();

    $svg = $dom->documentElement;
    if (!$svg || $svg->tagName !== 'svg') return $svgContent;

    $bbox = build_pin_bbox($pinCenters);

    // Thickness ~1.2% of larger side
    $thick = max(2.0, 0.012 * max($bbox['width'], $bbox['height']));

    // Ensure a style
    $style = $dom->createElement('style');
    $style->textContent = '.pin-rect { cursor:pointer; pointer-events:all; transition:opacity .15s ease; } .pin-rect:hover { opacity:.85; }';
    $svg->insertBefore($style, $svg->firstChild);

    // Compute padding needed so overshoot is visible for *fixed* length
    $leftPad = $rightPad = $topPad = $bottomPad = 0.0;
    foreach ($pinCenters as $id => $pos) {
        if (!isset($dirEdge[$id])) continue;
        $dir = $dirEdge[$id]['dir'];
        $edgeDist = $dirEdge[$id]['edgeDist'];
        $extra = $Lfixed - $edgeDist; // how far beyond the edge this fixed bar goes

        if ($dir === 'W')       $leftPad   = max($leftPad,   $extra);
        elseif ($dir === 'E')  $rightPad  = max($rightPad,  $extra);
        elseif ($dir === 'N')  $topPad    = max($topPad,    $extra);
        elseif ($dir === 'S')  $bottomPad = max($bottomPad, $extra);
    }
    // (Padding actually matters if you also enlarge the root viewBox or outer container. If your viewer handles overflow, you can skip adjusting the SVG size.)

    // Draw bars
    foreach ($pins as $p) {
        $id = $p['svgId'] ?? null;
        if (!$id || !isset($pinCenters[$id]) || !isset($dirEdge[$id])) continue;

        $cx = $pinCenters[$id]['x'];
        $cy = $pinCenters[$id]['y'];
        $dir = $dirEdge[$id]['dir'];

        $pinName   = $p['pin_name']   ?? $id;
        $groupName = $p['group_name'] ?? 'Other';
        $fillColor   = getPinColor($pinName);
        $strokeColor = getPinStrokeColor($pinName, $groupName);

        $rect = $dom->createElement('rect');
        $rect->setAttribute('class', 'pin-rect');
        $rect->setAttribute('fill', $fillColor);
        $rect->setAttribute('stroke', $strokeColor);
        $rect->setAttribute('stroke-width', '1.5');
        $rect->setAttribute('data-pin', $pinName);
        $rect->setAttribute('data-group', $groupName);
        $rect->setAttribute('data-svgid', $id);

        // Place a bar of *fixed length* Lfixed
        if ($dir === 'E' || $dir === 'W') {
            $w = $Lfixed; $h = $thick;
            $x = ($dir === 'E') ? $cx : ($cx - $Lfixed);
            $y = $cy - $h / 2.0;
            $rect->setAttribute('x', (string)$x);
            $rect->setAttribute('y', (string)$y);
            $rect->setAttribute('width', (string)$w);
            $rect->setAttribute('height', (string)$h);
        } else { // N/S
            $w = $thick; $h = $Lfixed;
            $x = $cx - $w / 2.0;
            $y = ($dir === 'S') ? $cy : ($cy - $Lfixed);
            $rect->setAttribute('x', (string)$x);
            $rect->setAttribute('y', (string)$y);
            $rect->setAttribute('width', (string)$w);
            $rect->setAttribute('height', (string)$h);
        }

        $title = $dom->createElement('title', $pinName . ' (' . $groupName . ')');
        $rect->appendChild($title);
        $svg->appendChild($rect);
    }

    return $dom->saveXML();
}


function replacePathWithDirectionalPins($svgContent, $pins = []) {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $svgElement = $dom->documentElement;

    // Some SVGs define pins inside <g> wrappers like <g id="connector29pin_2_"><path .../></g>
    $connectorGroups = $xpath->query('//*[starts-with(@id, "connector") and contains(@id, "pin")]');
    foreach ($connectorGroups as $group) {
        $groupId = $group->getAttribute('id');
        $childPaths = $group->getElementsByTagName('path');
        foreach ($childPaths as $childPath) {
            if ($childPath->hasAttribute('d')) {
                $childPath->setAttribute('id', $groupId); // copy group ID into actual path
                $group->removeAttribute('id'); 
                error_log("🌀 Tagged nested path inside <g id='{$groupId}'>");
                break; // only first relevant path
            }
        }
    }

    // Try to get dimensions
    $viewBox = $svgElement->getAttribute('viewBox');
    $width = 0; $height = 0;

    if ($viewBox) {
        $parts = preg_split('/\s+/', trim($viewBox));
        if (count($parts) === 4) {
            $width = floatval($parts[2]);
            $height = floatval($parts[3]);
        }
    }

    // If no viewBox or too small, fallback to pin bounding box
    if ($width < 10 || $height < 10) {
        $paths = $xpath->query('//*[local-name()="path" and @d]');
        $minX = $minY = PHP_FLOAT_MAX;
        $maxX = $maxY = PHP_FLOAT_MIN;

        foreach ($paths as $p) {
            $id = $p->getAttribute('id');
            if (!preg_match('/^(connector\d+pin|pin[_\d]*)$/i', $id)) continue;
            $circle = extractPathCenterAndRadius($p->getAttribute('d'));
            if (!$circle) continue;

            $cx = $circle['cx']; $cy = $circle['cy']; $r = $circle['r'];
            $minX = min($minX, $cx - $r);
            $maxX = max($maxX, $cx + $r);
            $minY = min($minY, $cy - $r);
            $maxY = max($maxY, $cy + $r);
        }

        if ($minX < PHP_FLOAT_MAX && $maxX > PHP_FLOAT_MIN) {
            $width = $maxX - $minX;
            $height = $maxY - $minY;
        } else {
            // Fallback if no pins found
            $width = 1000;
            $height = 1000;
        }

        error_log("⚠️ Estimated SVG size from pin bounds: width={$width}, height={$height}");
    } else {
        error_log("✅ Using viewBox size: width={$width}, height={$height}");
    }

    $paths = $xpath->query('//*[local-name()="path" and @d]');
    $maxCoord = 0;
    foreach ($paths as $p) {
        if (!preg_match('/^(connector\d+pin|pin[_\d]*)$/i', $p->getAttribute('id'))) continue;
        $circle = extractPathCenterAndRadius($p->getAttribute('d'));
        if (!$circle) continue;
        $maxCoord = max($maxCoord, $circle['cx'], $circle['cy']);
    }

    $scaleFactor = 1.0;
    if ($maxCoord > 0 && $width > 0 && $maxCoord / $width > 5) {
        $scaleFactor = $width / $maxCoord;
        error_log("⚠️ Coordinate scale mismatch detected — applying scaleFactor={$scaleFactor}");
    }
    $replacedCount = 0;

    foreach ($paths as $path) {
        $id = $path->getAttribute('id');
        $d = $path->getAttribute('d');

        if (!preg_match('/^(connector\d+pin|pin[_\d]*)$/i', $id)) continue;

        $fillAttr = strtolower($path->getAttribute('fill'));
        if ($fillAttr && $fillAttr !== 'none' && strpos($fillAttr, '#aaaaaa') !== false) continue;

        $circle = extractPathCenterAndRadius($d);
        if (!$circle || $circle['r'] <= 0) continue;

        $cx = $circle['cx'] * $scaleFactor;
        $cy = $circle['cy'] * $scaleFactor;
        $r  = $circle['r'] * $scaleFactor;
        $r  = min($r, $width * 0.1); 

        // Match pin name
        $pinName = '';
        $groupName = '';
        foreach ($pins as $p) {
            if (($p['svgId'] ?? '') === $id) {
                $pinName = $p['pin_name'] ?? '';
                $groupName = $p['group_name'] ?? '';
                break;
            }
        }
        if ($pinName === '' && preg_match('/connector(\d+)/', $id, $m)) $pinName = 'P' . $m[1];

        // Determine side from true width/height
        $side = 'left';
        if ($cx < $width * 0.25) $side = 'right';
        elseif ($cx > $width * 0.75) $side = 'left';
        elseif ($cy < $height * 0.25) $side = 'top';
        elseif ($cy > $height * 0.75) $side = 'bottom';

        $fillColor = getPinColor($pinName);
        $strokeColor = getPinStrokeColor($pinName, $groupName);
        $textColor = (strpos($fillColor, '0, 0, 0') !== false) ? '#fff' : '#000';

        $rectLength = $r * 7.5;
        $r = max(3, $r); // avoid absurdly large shapes if r was miscalculated

        // Build half-circle + rectangle
        switch ($side) {
            case 'left':
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 0 %f,%f L %f,%f L %f,%f Z",
                    $cx, $cy - $r, $r, $r,
                    $cx, $cy + $r,
                    $cx + $rectLength, $cy + $r,
                    $cx + $rectLength, $cy - $r
                );
                break;
            case 'right':
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 1 %f,%f L %f,%f L %f,%f Z",
                    $cx, $cy - $r, $r, $r,
                    $cx, $cy + $r,
                    $cx - $rectLength, $cy + $r,
                    $cx - $rectLength, $cy - $r
                );
                break;
            case 'top':
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 0 %f,%f L %f,%f L %f,%f Z",
                    $cx - $r, $cy, $r, $r,
                    $cx + $r, $cy,
                    $cx + $r, $cy + $rectLength,
                    $cx - $r, $cy + $rectLength
                );
                break;
            case 'bottom':
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 1 %f,%f L %f,%f L %f,%f Z",
                    $cx - $r, $cy, $r, $r,
                    $cx + $r, $cy,
                    $cx + $r, $cy - $rectLength,
                    $cx - $r, $cy - $rectLength
                );
                break;
        }

        $newPath = $dom->createElement('path');
        $newPath->setAttribute('d', $pathData);
        $newPath->setAttribute('id', $id);
        $newPath->setAttribute('fill', $fillColor);
        $newPath->setAttribute('stroke', $strokeColor);
        $newPath->setAttribute('stroke-width', '2');
        $newPath->setAttribute('cursor', 'pointer');
        $path->parentNode->replaceChild($newPath, $path);

        // Add text label (visible)
        $text = $dom->createElement('text', htmlspecialchars($pinName));
        $text->setAttribute('font-size', max(6, $r * 0.9));
        $text->setAttribute('font-family', 'Arial, sans-serif');
        $text->setAttribute('fill', $textColor);
        $text->setAttribute('text-anchor', 'middle');
        $text->setAttribute('dominant-baseline', 'middle');

        switch ($side) {
            case 'left':
                $text->setAttribute('x', $cx + $rectLength / 2);
                $text->setAttribute('y', $cy);
                break;
            case 'right':
                $text->setAttribute('x', $cx - $rectLength / 2);
                $text->setAttribute('y', $cy);
                break;
            case 'top':
                $text->setAttribute('x', $cx);
                $text->setAttribute('y', $cy + $rectLength / 2);
                break;
            case 'bottom':
                $text->setAttribute('x', $cx);
                $text->setAttribute('y', $cy - $rectLength / 2);
                break;
        }

        $svgElement->appendChild($text);
        error_log("✅ Replaced {$id} (cx={$cx}, cy={$cy}, r={$r}) side={$side}");
        $replacedCount++;
    }

    error_log("✅ Total directional pin replacements with colors: {$replacedCount}");
    return $dom->saveXML();
}




function replacePathWithHalfCircleRect($svgContent) {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);

    // Namespace-safe path search
    $paths = $xpath->query('//*[local-name()="path" and @d]');
    $replacedCount = 0;

    foreach ($paths as $path) {
        $id = $path->getAttribute('id');
        $d = $path->getAttribute('d');

        // Log each path for debugging
        error_log("Scanning path id={$id}");

        // Only modify connector pin paths
        if (!preg_match('/^(connector\d+pin|pin[_\d]*)$/i', $id)) continue;

        $circle = extractPathCenterAndRadius($d);
        if (!$circle || $circle['r'] <= 0) continue;

        $cx = $circle['cx'];
        $cy = $circle['cy'];
        $r  = $circle['r'];

        // Compute half-circle + rectangle shape (Norman window)
        // Top half is an arc; bottom is rectangular
        $x1 = $cx - $r;
        $x2 = $cx + $r;
        $yTop = $cy - $r;
        $yBottom = $cy + $r * 0.8; // rectangle height relative to radius

        // Build SVG path for half-circle + rectangle
        $pathData = sprintf(
            "M %f,%f A %f,%f 0 0 1 %f,%f L %f,%f L %f,%f Z",
            $x1, $cy,     // Start left of center
            $r, $r,       // Arc radii
            $x2, $cy,     // End of arc
            $x2, $yBottom, // Right-bottom corner
            $x1, $yBottom, // Left-bottom corner
            $x1, $cy       // Back to start
        );

        // Create new <path> element
        $newPath = $dom->createElement('path');
        $newPath->setAttribute('d', $pathData);
        if ($id) $newPath->setAttribute('id', $id);

        // Copy style attributes
        foreach (['fill', 'stroke', 'stroke-width', 'style', 'class'] as $attr) {
            if ($path->hasAttribute($attr)) {
                $newPath->setAttribute($attr, $path->getAttribute($attr));
            }
        }

        // Replace the old path with new shape
        $path->parentNode->replaceChild($newPath, $path);
        $replacedCount++;

        error_log("✅ Replaced '{$id}' with half-circle+rect (cx={$cx}, cy={$cy}, r={$r})");
    }

    if ($replacedCount === 0) {
        error_log("⚠️ No pin paths replaced with half-circle+rect.");
    } else {
        error_log("✅ Total half-circle replacements: {$replacedCount}");
    }

    return $dom->saveXML();
}

function replacePathCirclesWithCircles($svgContent) {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);

    // Namespace-safe search for <path> elements with a "d" attribute
    $paths = $xpath->query('//*[local-name()="path" and @d]');

    $replacedCount = 0;

    foreach ($paths as $path) {
        $id = $path->getAttribute('id');
        $d = $path->getAttribute('d');

        // Log every scanned path
        error_log("Scanning path id={$id}");

        // Only process likely pin IDs
        if (!preg_match('/^(connector\d+pin|pin[_\d]*)$/i', $id)) {
            continue;
        }

        $circle = extractPathCenterAndRadius($d);
        if (!$circle || $circle['r'] <= 0) continue;

        $circleElement = $dom->createElement('circle');
        $circleElement->setAttribute('cx', $circle['cx']);
        $circleElement->setAttribute('cy', $circle['cy']);
        $circleElement->setAttribute('r', $circle['r']);

        // Copy attributes for styling consistency
        foreach (['fill', 'stroke', 'stroke-width', 'style', 'class'] as $attr) {
            if ($path->hasAttribute($attr)) {
                $circleElement->setAttribute($attr, $path->getAttribute($attr));
            }
        }

        // Retain the same ID
        if ($id) $circleElement->setAttribute('id', $id);

        $path->parentNode->replaceChild($circleElement, $path);
        $replacedCount++;

        error_log("Replaced pin path '{$id}' with <circle> (cx={$circle['cx']}, cy={$circle['cy']}, r={$circle['r']})");
    }

    if ($replacedCount === 0) {
        error_log("No pin paths replaced — possibly due to namespace or ID mismatch.");
    } else {
        error_log("Total paths replaced: {$replacedCount}");
    }

    return $dom->saveXML();
}

/**
 * Extract pin centers from SVG (handles circles, rects, and paths)
 */
function extract_pin_centers($svgContent, $pinIds = []) {
    $dom = new DOMDocument();
    @$dom->loadXML($svgContent);
    $xpath = new DOMXPath($dom);

    $coordinates = [];

    foreach ($pinIds as $pin) {
        // Support both ['svgId'=>...] and "connectorXpin" formats
        $id = is_array($pin) && isset($pin['svgId']) ? $pin['svgId'] : (is_string($pin) ? $pin : null);
        if (!$id) {
            error_log("⚠️ Skipping invalid pin entry: " . print_r($pin, true));
            continue;
        }

        // Find the element by ID (direct or nested)
        $element = $xpath->query("//*[@id='$id']")->item(0);
        if (!$element) $element = $xpath->query("//*[contains(@id, '$id')]")->item(0);
        if (!$element) {
            error_log("❌ No element found for ID: $id");
            continue;
        }

        $cx = $cy = null;
        $tag = $element->tagName;

        // --- Case 1: explicit <circle> or <rect> tags ---
        if ($tag === 'circle') {
            $cx = floatval($element->getAttribute('cx'));
            $cy = floatval($element->getAttribute('cy'));
            error_log("⭕ Circle pin $id => ($cx,$cy)");
        } elseif ($tag === 'rect') {
            $x = floatval($element->getAttribute('x'));
            $y = floatval($element->getAttribute('y'));
            $w = floatval($element->getAttribute('width'));
            $h = floatval($element->getAttribute('height'));
            $cx = $x + $w / 2;
            $cy = $y + $h / 2;
            error_log("⬛ Rect pin $id => ($cx,$cy)");
        }

        // --- Case 2: path-based pins ---
        elseif ($element->hasAttribute('d')) {
            $d = $element->getAttribute('d');

            // Collect all coordinate pairs in path
            if (preg_match_all('/([0-9\.\-]+),\s*([0-9\.\-]+)/', $d, $coords)) {
                $xs = array_map('floatval', $coords[1]);
                $ys = array_map('floatval', $coords[2]);

                if (strpos($d, 'v') !== false || strpos($d, 'h') !== false) {
                    // Likely rectangular
                    $cx = (min($xs) + max($xs)) / 2;
                    $cy = (min($ys) + max($ys)) / 2;
                    error_log("⬜ Rectangular path $id => ($cx,$cy)");
                } else {
                    // Circular (two M commands)
                    if (preg_match_all('/M\s*([0-9\.\-]+),\s*([0-9\.\-]+)/i', $d, $mcoords)) {
                        $cx = array_sum(array_map('floatval', $mcoords[1])) / count($mcoords[1]);
                        $cy = array_sum(array_map('floatval', $mcoords[2])) / count($mcoords[2]);
                        error_log("🎯 Circular path $id => ($cx,$cy)");
                    } else {
                        // Fallback: bounding box
                        $cx = (min($xs) + max($xs)) / 2;
                        $cy = (min($ys) + max($ys)) / 2;
                        error_log("📏 Fallback bbox for $id => ($cx,$cy)");
                    }
                }
            }
        }

        if ($cx !== null && $cy !== null)
            $coordinates[$id] = ['x' => $cx, 'y' => $cy];
    }

    error_log("✅ After coordinate extraction: " . count($coordinates) . " pins processed");
    return $coordinates;
}


/**
 * Replace pins with half-circle + rectangle shapes centered at detected coordinates
 */
function replace_pins_with_shapes($svgContent, $pinCenters, $pinSides, $radius = 3) {
    foreach ($pinCenters as $id => $pos) {
        $cx = $pos['x'];
        $cy = $pos['y'];
        $side = isset($pinSides[$id]) ? $pinSides[$id] : 'left';
        $rectLen = $radius * 7.5;  // adjust rectangle length

        // Build half-circle + rectangle path ("Norman window" style)
        switch ($side) {
            case 'right':
                $path = "M $cx,$cy a$radius,$radius 0 1,0 0.01,0 z 
                         M $cx,$cy h$rectLen v" . ($radius * 1.5) . " h-" . $rectLen . " z";
                break;
            case 'left':
                $path = "M $cx,$cy a$radius,$radius 0 1,1 -0.01,0 z 
                         M $cx,$cy h-" . $rectLen . " v" . ($radius * 1.5) . " h$rectLen z";
                break;
            case 'top':
                $path = "M $cx,$cy a$radius,$radius 0 1,1 0,-0.01 z 
                         M $cx,$cy v-" . $rectLen . " h" . ($radius * 1.5) . " v$rectLen z";
                break;
            case 'bottom':
                $path = "M $cx,$cy a$radius,$radius 0 1,0 0.01,0 z 
                         M $cx,$cy v$rectLen h" . ($radius * 1.5) . " v-" . $rectLen . " z";
                break;
        }

        $svgContent = preg_replace(
            '/(<path[^>]*id="' . preg_quote($id, '/') . '"[^>]*d=")[^"]*(")/',
            '$1' . trim($path) . '$2',
            $svgContent
        );

        error_log("✅ Replaced $id @ ($cx,$cy) → side=$side");
    }

    return $svgContent;
}


function extractCoordinatesFromSVG($svgContent, $pinIds = []) {
    $dom = new DOMDocument();
    @$dom->loadXML($svgContent);
    $xpath = new DOMXPath($dom);

    $svgRoot = $dom->documentElement;
    $viewBox = $svgRoot->getAttribute('viewBox');
    if ($viewBox) {
        $parts = preg_split('/\s+/', trim($viewBox));
        $viewBoxWidth = floatval($parts[2]);
        $viewBoxHeight = floatval($parts[3]);
        error_log("✅ Using viewBox size: width=$viewBoxWidth, height=$viewBoxHeight");
    }

    $coordinates = [];

    foreach ($pinIds as $pin) {
        $id = $pin['svgId'];
        $element = $xpath->query("//*[@id='$id']")->item(0);

        // fallback for nested <g> groups
        if (!$element) {
            $element = $xpath->query("//*[contains(@id, '$id')]")->item(0);
        }

        if (!$element) {
            error_log("⚠️ Pin $id not found in SVG");
            continue;
        }

        // Extract coordinates depending on tag
        $tag = $element->tagName;
        $pathData = '';

        if ($tag === 'circle') {
            $cx = floatval($element->getAttribute('cx'));
            $cy = floatval($element->getAttribute('cy'));
            $coordinates[$id] = ['x' => $cx, 'y' => $cy];
            error_log("✅ Using <circle> center for $id: x=$cx, y=$cy");
        } 
        elseif ($tag === 'path' || $element->hasAttribute('d')) {
            $pathData = $element->getAttribute('d');

            // Extract all "M x,y" pairs
            if (preg_match_all('/M\s*([0-9\.\-]+),\s*([0-9\.\-]+)/i', $pathData, $matches)) {
                $sumX = 0;
                $sumY = 0;
                $count = count($matches[1]);
                for ($i = 0; $i < $count; $i++) {
                    $sumX += floatval($matches[1][$i]);
                    $sumY += floatval($matches[2][$i]);
                }
                $cx = $sumX / $count;
                $cy = $sumY / $count;
                $coordinates[$id] = ['x' => $cx, 'y' => $cy];
                error_log("🎯 Averaged center from M-points for $id: x=$cx, y=$cy");
            } else {
                error_log("⚠️ No 'M' coordinates found for $id");
            }
        }
    }

    return $coordinates;
}

function replace_pins_with_norman_shapes($svgContent, $pins, $pinCenters, $svgWidth = 1000, $svgHeight = 1000) {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($svgContent);
    libxml_clear_errors();

    $svg = $dom->documentElement;
    $xpath = new DOMXPath($dom);

    if (empty($pinCenters)) {
        error_log("⚠️ No pin centers found — skipping Norman shape replacement.");
        return $svgContent;
    }

    // --- Compute bounding box for all pins ---
    $xs = array_column($pinCenters, 'x');
    $ys = array_column($pinCenters, 'y');
    $minX = min($xs); $maxX = max($xs);
    $minY = min($ys); $maxY = max($ys);
    $midX = ($minX + $maxX) / 2;
    error_log("📏 Pin bounding box: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY");

    $replacedCount = 0;

    foreach ($pinCenters as $id => $pos) {
        $cx = $pos['x'];
        $cy = $pos['y'];

        // --- Find matching pin info ---
        $pinName = '';
        $groupName = '';
        $fillColor = 'rgba(150,150,150,0.4)';
        $strokeColor = '#000';
        foreach ($pins as $p) {
            if (($p['svgId'] ?? '') === $id) {
                $pinName = $p['pin_name'] ?? '';
                $groupName = $p['group_name'] ?? '';
                $fillColor = getPinColor($pinName);
                $strokeColor = getPinStrokeColor($pinName, $groupName);
                break;
            }
        }

        // --- Smarter side detection ---
        $distances = [
            'left'   => abs($cx - $minX),
            'right'  => abs($maxX - $cx),
            'top'    => abs($cy - $minY),
            'bottom' => abs($maxY - $cy)
        ];
        asort($distances);
        $side = key($distances);

        // --- ICSP correction: detect middle two-column group ---
        $horizontalSpan = $maxX - $minX;
        if ($horizontalSpan > 0) {
            $relativeX = ($cx - $minX) / $horizontalSpan; // normalized 0..1
            if ($relativeX > 0.4 && $relativeX < 0.6) {
                // likely middle cluster (like ICSP)
                // determine left or right sub-column by comparing to midline
                if ($cx < $midX) $side = 'left';
                else $side = 'right';
            }
        }

        // --- Find existing element ---
        $element = $xpath->query("//*[@id='$id']")->item(0);
        if (!$element) continue;

        // --- Determine approximate pin radius ---
        $r = 3;
        if ($element->tagName === 'circle') {
            $r = max(3, floatval($element->getAttribute('r')));
        } elseif ($element->tagName === 'rect') {
            $w = floatval($element->getAttribute('width'));
            $h = floatval($element->getAttribute('height'));
            $r = max(3, min($w, $h) / 2);
        }

        $rectLen = $r * 7.5;

        // --- Build half-circle + rectangle shape (Norman window) ---
        switch ($side) {
            case 'left': // reversed direction from before
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 1 %f,%f L %f,%f L %f,%f Z",
                    $cx, $cy - $r, $r, $r,
                    $cx, $cy + $r,
                    $cx - $rectLen, $cy + $r,
                    $cx - $rectLen, $cy - $r
                );
                break;

            case 'right': // reversed direction from before
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 0 %f,%f L %f,%f L %f,%f Z",
                    $cx, $cy - $r, $r, $r,
                    $cx, $cy + $r,
                    $cx + $rectLen, $cy + $r,
                    $cx + $rectLen, $cy - $r
                );
                break;

            case 'top':
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 1 %f,%f L %f,%f L %f,%f Z",
                    $cx - $r, $cy, $r, $r,
                    $cx + $r, $cy,
                    $cx + $r, $cy - $rectLen,
                    $cx - $r, $cy - $rectLen
                );
                break;

            case 'bottom':
                $pathData = sprintf(
                    "M %f,%f A %f,%f 0 0 0 %f,%f L %f,%f L %f,%f Z",
                    $cx - $r, $cy, $r, $r,
                    $cx + $r, $cy,
                    $cx + $r, $cy + $rectLen,
                    $cx - $r, $cy + $rectLen
                );
                break;

            default:
                // fallback circle
                $pathData = sprintf(
                    "M %f,%f m -%f,0 a %f,%f 0 1,0 %f,0 a %f,%f 0 1,0 -%f,0",
                    $cx, $cy, $r, $r, $r, $r * 2, $r, $r, $r * 2
                );
                break;
        }

        // --- Replace original with new path ---
        $newPath = $dom->createElement('path');
        $newPath->setAttribute('id', $id);
        $newPath->setAttribute('d', $pathData);
        $newPath->setAttribute('fill', $fillColor); // ✅ fill color now visible
        $newPath->setAttribute('stroke', $strokeColor);
        $newPath->setAttribute('stroke-width', '1.5');
        $newPath->setAttribute('cursor', 'pointer');

        $element->parentNode->replaceChild($newPath, $element);

        // --- Add pin label ---
        $text = $dom->createElement('text', htmlspecialchars($pinName ?: $id));
        $text->setAttribute('font-size', max(6, $r * 0.9));
        $text->setAttribute('font-family', 'Arial, sans-serif');
        $text->setAttribute('fill', '#000');
        $text->setAttribute('text-anchor', 'middle');
        $text->setAttribute('dominant-baseline', 'middle');

        switch ($side) {
            case 'left':
                $text->setAttribute('x', $cx - $rectLen / 2);
                $text->setAttribute('y', $cy);
                break;
            case 'right':
                $text->setAttribute('x', $cx + $rectLen / 2);
                $text->setAttribute('y', $cy);
                break;
            case 'top':
                $text->setAttribute('x', $cx);
                $text->setAttribute('y', $cy - $rectLen / 2);
                break;
            case 'bottom':
                $text->setAttribute('x', $cx);
                $text->setAttribute('y', $cy + $rectLen / 2);
                break;
        }

        $svg->appendChild($text);

        error_log("✅ Replaced $id @ ($cx,$cy,r=$r) side=$side fill=$fillColor");
        $replacedCount++;
    }

    error_log("✅ Total Norman replacements: $replacedCount");
    return $dom->saveXML();
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
            error_log("Converting pin paths to circles...");
            //$breadboardSvg = replacePathCirclesWithCircles($breadboardSvg);
            //$breadboardSvg = replacePathWithHalfCircleRect($breadboardSvg);
            $breadboardSvg = replacePathWithDirectionalPins($breadboardSvg);

            if (strpos($breadboardSvg, '<circle') !== false) {
                error_log("Pin paths replaced with circles successfully.");
            } else {
                error_log("No <circle> elements found after conversion.");
            }
            error_log("Extracting coordinates from SVG (length: " . strlen($breadboardSvg) . ") for " . count($pins) . " pins");
            //$pins = extractCoordinatesFromSVG($breadboardSvg, $pins);
            $pinCenters = extract_pin_centers($breadboardSvg, $pins);
            if (!empty($pinCenters)) {
                $bbox = build_pin_bbox($pinCenters);
                $Lfixed = 10.0; // or whatever you set elsewhere

                $padX = $padY = $Lfixed; // allow overshoot = bar length on all sides
                expand_svg_canvas_string($breadboardSvg, $bbox, $padX, $padY);
                
                // Corridor half-width: treat pins within this lateral band as "blocking".
                // Start with ~2% of the larger side, but not smaller than 4px.
                $corrHalf = max(4.0, 0.02 * max($bbox['width'], $bbox['height']));

                // Choose directions using the corridor blocker and fixed length
                $dirById = compute_pin_directions_fixed($pinCenters, $bbox, $Lfixed, $corrHalf);

                // Draw bars of exactly Lfixed in the selected directions
                // (drawer expects directions and bar length)
                // If your drawer currently expects the older $dirEdge array: adapt to use $dirById
                // Here is a small adapter:
                $dirEdge = [];
                foreach ($dirById as $id => $dir) {
                    // we only need 'dir' for the fixed drawer; 'edgeDist' is unused
                    $dirEdge[$id] = ['dir' => $dir, 'edgeDist' => 0];
                }

                $breadboardSvg = draw_clickable_direction_rects_fixed(
                    $breadboardSvg, $pins, $pinCenters, $dirEdge, $Lfixed
                );
                    
            }
                                                
/*             $svgWidth = 1000;
            $svgHeight = 1000;

            if ($breadboardSvg) {
                $dom = new DOMDocument();
                libxml_use_internal_errors(true);
                $dom->loadXML($breadboardSvg);
                libxml_clear_errors();

                $svgEl = $dom->documentElement;
                if ($svgEl && $svgEl->tagName === 'svg') {
                    $viewBox = $svgEl->getAttribute('viewBox');
                    if ($viewBox) {
                        $parts = preg_split('/\s+/', trim($viewBox));
                        if (count($parts) === 4) {
                            $svgWidth = floatval($parts[2]);
                            $svgHeight = floatval($parts[3]);
                            error_log("✅ Extracted viewBox size: width={$svgWidth}, height={$svgHeight}");
                        }
                    } else {
                        $w = $svgEl->getAttribute('width');
                        $h = $svgEl->getAttribute('height');
                        if ($w && $h) {
                            $svgWidth = floatval(str_replace(['px', 'mm', 'cm'], '', $w));
                            $svgHeight = floatval(str_replace(['px', 'mm', 'cm'], '', $h));
                            error_log("✅ Extracted width/height attrs: width={$svgWidth}, height={$svgHeight}");
                        }
                    }
                }
            }
            $breadboardSvg = replace_pins_with_norman_shapes($breadboardSvg, $pins, $pinCenters, $svgWidth, $svgHeight); */
            error_log("After coordinate extraction: " . count($pins) . " pins processed");

            if (!empty($pins) && isset(reset($pins)['x'])) {
                $normalizedPins = [];
                foreach ($pins as $svgId => $coords) {
                    $normalizedPins[] = [
                        'svgId' => $svgId,
                        'pin_name' => $pinMap[$svgId] ?? $svgId,
                        'group_name' => determinePinGroup($pinMap[$svgId] ?? ''),
                        'position_x' => $coords['x'],
                        'position_y' => $coords['y']
                    ];
                }
                $pins = $normalizedPins;
            }
        } else {
            error_log(message: "Skipping coordinate extraction - breadboardSvg: " . (empty($breadboardSvg) ? 'empty' : 'present') . ", pins: " . count($pins));
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

/**
 * Extract center and radius from SVG path data
 * Handles both absolute and relative path commands
 */
function extractPathCenterAndRadius($d) {
    // Clean up and extract numeric values
    if (empty($d)) return null;
    preg_match_all('/-?\d*\.?\d+/', $d, $matches);
    $nums = array_map('floatval', $matches[0]);
    if (count($nums) < 4) return null;

    // Split into coordinate pairs
    $points = [];
    for ($i = 0; $i < count($nums) - 1; $i += 2) {
        $points[] = ['x' => $nums[$i], 'y' => $nums[$i + 1]];
    }

    // Compute bounding box
    $xs = array_column($points, 'x');
    $ys = array_column($points, 'y');
    $minX = min($xs);
    $maxX = max($xs);
    $minY = min($ys);
    $maxY = max($ys);
    $bboxCx = ($minX + $maxX) / 2;
    $bboxCy = ($minY + $maxY) / 2;
    $bboxR  = min(($maxX - $minX), ($maxY - $minY)) / 2;

    // Detect absolute vs relative path
    $isRelative = (strpos($d, 'c') !== false || strpos($d, 'm') !== false);

    if ($isRelative) {
        // Case 1: Relative small pin circle
        $cx = $bboxCx;
        $cy = $bboxCy;
        $r  = $bboxR;
    } else {
        // Case 2: Absolute circular shape (double-circle style)
        // Use average of outer "M" move and inner "M" if exists
        if (preg_match_all('/M\s*([0-9\.\-]+),\s*([0-9\.\-]+)/', $d, $mCoords)) {
            $mx = array_map('floatval', $mCoords[1]);
            $my = array_map('floatval', $mCoords[2]);
            if (count($mx) > 1) {
                // Outer and inner circle M positions (typical in Fritzing)
                $cx = ($mx[0] + $mx[1]) / 2;
                $cy = ($my[0] + $my[1]) / 2;
                $r  = abs($my[0] - $my[1]) / 2;
            } else {
                // Single-circle fallback → use bounding box
                $cx = $bboxCx;
                $cy = $bboxCy;
                $r  = $bboxR;
            }
        } else {
            $cx = $bboxCx;
            $cy = $bboxCy;
            $r  = $bboxR;
        }
    }

    // Clamp very small or invalid radii
    if ($r <= 0) $r = 0.5;
    if ($r > 1000) $r = 10;

    return ['cx' => $cx, 'cy' => $cy, 'r' => $r];
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

/**
 * Get pin color based on pin name/type
 */
function getPinColor($pinName) {
    $name = strtoupper($pinName);
    
    // Ground pins - black
    if ($name === 'GND' || strpos($name, 'GROUND') !== false) {
        return 'rgba(0, 0, 0, 0.4)'; // Black
    }
    
    // Power pins - red
    if ($name === 'VCC' || $name === '5V' || $name === '3.3V' || $name === '3V3' || 
        $name === 'VIN' || $name === 'RAW' || strpos($name, 'POWER') !== false) {
        return 'rgba(255, 0, 0, 0.4)'; // Red
    }
    
    // Analog pins - yellow
    if (preg_match('/^A\d+$/', $name)) {
        return 'rgba(255, 215, 0, 0.4)'; // Yellow
    }
    
    // Digital pins - green
    if (preg_match('/^\d+$/', $name)) {
        return 'rgba(0, 255, 0, 0.4)'; // Green
    }
    
    // Communication pins - blue
    if (in_array($name, ['TX', 'RX', 'TX0', 'RX1', 'RXI', 'TXO', 'SDA', 'SCL', 'MOSI', 'MISO', 'SCK', 'CS'])) {
        return 'rgba(0, 0, 255, 0.4)'; // Blue
    }
    
    // Special pins - purple
    if (in_array($name, ['RST', 'RESET', 'AREF'])) {
        return 'rgba(128, 0, 128, 0.4)'; // Purple
    }
    
    // Default - gray
    return 'rgba(102, 102, 102, 0.4)'; // Gray
}

/**
 * Get pin stroke color based on pin name/type
 */
function getPinStrokeColor($pinName, $groupName) {
    $name = strtoupper($pinName);
    
    // Ground pins - black stroke
    if ($name === 'GND' || strpos($name, 'GROUND') !== false) {
        return '#000000'; // Black
    }
    
    // Power pins - red stroke
    if ($name === 'VCC' || $name === '5V' || $name === '3.3V' || $name === '3V3' || 
        $name === 'VIN' || $name === 'RAW' || strpos($name, 'POWER') !== false) {
        return '#ff6b6b'; // Red
    }
    
    // Analog pins - yellow stroke
    if (preg_match('/^A\d+$/', $name)) {
        return '#ffd700'; // Yellow
    }
    
    // Digital pins - green stroke
    if (preg_match('/^\d+$/', $name)) {
        return '#00ff00'; // Green
    }
    
    // Communication pins - blue stroke
    if (in_array($name, ['TX', 'RX', 'TX0', 'RX1', 'RXI', 'TXO', 'SDA', 'SCL', 'MOSI', 'MISO', 'SCK', 'CS'])) {
        return '#0000ff'; // Blue
    }
    
    // Special pins - purple stroke
    if (in_array($name, ['RST', 'RESET', 'AREF'])) {
        return '#800080'; // Purple
    }

    if($groupName === "Digital") {
        return '#00ff00'; // Green
    } elseif($groupName === "Analog") {
        return '#ffd700'; // Yellow
    } elseif($groupName === "Power") {
        return '#ff6b6b'; // Red
    } elseif($groupName === "Ground") {
        return '#000000'; // Black
    } elseif($groupName === "Communication") {
        return '#0000ff'; // Blue
    } elseif($groupName === "Special") {
        return '#800080'; // Purple
    }
    
    // Default - gray stroke
    return '#666666'; // Gray
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
        .pin-hole, .pin-rect {
            cursor: pointer !important;
            stroke-width: 2 !important;
            transition: all 0.2s ease !important;
            pointer-events: all !important;
        }
        .pin-hole:hover, .pin-rect:hover {
            stroke-width: 3 !important;
            opacity: 0.8 !important;
        }
        .pin-hole.selected, .pin-rect.selected {
            stroke-width: 4 !important;
            fill: rgba(0, 0, 255, 0.6) !important;
        }
        .pin-hole.hidden, .pin-rect.hidden { display: none !important; }
        svg { overflow: visible !important; }
        .pin-hole.group-ground { stroke: #000000 !important; }
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
                
                // Set pin-specific color based on pin name
                $pinColor = getPinColor($pinName);
                $pinStrokeColor = getPinStrokeColor($pinName, groupName: $groupName);
                $existingElement->setAttribute('fill', $pinColor);
                $existingElement->setAttribute('stroke', $pinStrokeColor);
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
    
    // Ground pins - separate group
    if (strpos($pinName, 'GND') !== false || strpos($pinName, 'GROUND') !== false ||
    strpos($pinName, 'VSS') !== false  ) {
        return 'Ground';
    }
    
    // Power pins (excluding GND)
    if (strpos($pinName, 'VCC') !== false || 
        strpos($pinName, 'VDD') !== false ||
        strpos($pinName, 'VIN') !== false || 
        strpos($pinName, '3.3V') !== false || 
        strpos($pinName, '3V3') !== false || 
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
        strpos($pinName, 'RST') !== false ||
        strpos($pinName, 'AREF') !== false ||
        strpos($pinName, 'VREF') !== false ||
        strpos($pinName, 'IOREF') !== false ||
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
              strpos($pinName, 'VDD') !== false ||
              strpos($pinName, 'VIN') !== false || 
              strpos($pinName, '3.3V') !== false || 
              strpos($pinName, '3V3') !== false ||
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