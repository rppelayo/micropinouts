<?php
// Debug coordinate extraction - Standalone script
// Don't include admin-upload.php as it has routing logic

// Include only the functions we need
require_once 'config.php';

// Copy the extractPathCenter function directly here
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

// Copy the extractCoordinatesFromSVG function directly here
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
    echo "Available SVG element IDs: " . implode(', ', $availableIds) . "\n";
    
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
                    echo "Found element using XPath fallback for {$pin['svgId']}\n";
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
                echo "Element {$pin['svgId']} attributes: " . json_encode($elementInfo) . "\n";
                
                // Try to get position from different attributes
                $positionX = 0;
                $positionY = 0;
                
                if ($svgElement->getAttribute('cx') && $svgElement->getAttribute('cy')) {
                    // Circle element
                    $positionX = floatval($svgElement->getAttribute('cx'));
                    $positionY = floatval($svgElement->getAttribute('cy'));
                    echo "Using circle coordinates: cx=$positionX, cy=$positionY\n";
                } elseif ($svgElement->getAttribute('x') && $svgElement->getAttribute('y')) {
                    // Rectangle or other positioned element
                    $positionX = floatval($svgElement->getAttribute('x'));
                    $positionY = floatval($svgElement->getAttribute('y'));
                    echo "Using rect coordinates: x=$positionX, y=$positionY\n";
                } elseif ($svgElement->getAttribute('transform')) {
                    // Element with transform - extract translate values
                    $transform = $svgElement->getAttribute('transform');
                    if (preg_match('/translate\(([^,]+),\s*([^)]+)\)/', $transform, $matches)) {
                        $positionX = floatval($matches[1]);
                        $positionY = floatval($matches[2]);
                        echo "Using transform coordinates: x=$positionX, y=$positionY\n";
                    }
                } elseif ($svgElement->getAttribute('d')) {
                    // Path element - extract center from path data
                    $pathData = $svgElement->getAttribute('d');
                    $coordinates = extractPathCenter($pathData);
                    if ($coordinates) {
                        $positionX = $coordinates['x'];
                        $positionY = $coordinates['y'];
                        echo "Using path center coordinates: x=$positionX, y=$positionY\n";
                    }
                } else {
                    // Try to get bounding box if no direct coordinates
                    $bbox = $svgElement->getBBox();
                    if ($bbox && $bbox->width > 0 && $bbox->height > 0) {
                        $positionX = $bbox->x + ($bbox->width / 2);
                        $positionY = $bbox->y + ($bbox->height / 2);
                        echo "Using bbox center coordinates: x=$positionX, y=$positionY\n";
                    }
                }
                
                // Update pin position
                $pin['position_x'] = $positionX;
                $pin['position_y'] = $positionY;
                echo "Final coordinates for pin {$pin['pin_name']} (svgId: {$pin['svgId']}): x=$positionX, y=$positionY\n";
            } else {
                echo "SVG element not found for pin {$pin['pin_name']} (svgId: {$pin['svgId']})\n";
                echo "Looking for ID: {$pin['svgId']} but available IDs are: " . implode(', ', $availableIds) . "\n";
            }
        }
    }
    
    return $pins;
}

echo "🧪 Testing coordinate extraction...\n\n";

// Test the extractPathCenter function directly
function testExtractPathCenter() {
    echo "📊 Testing extractPathCenter function:\n";
    
    // Sample path data from ESP32 CAM
    $samplePath = 'M5.6985,16.8867c-1.4678,0-2.6621-1.1943-2.6621-2.6621s1.1943-2.6616,2.6621-2.6616c1.4731,0,2.6719,1.1938,2.6719,2.6616S7.1716,16.8867,5.6985,16.8867z M5.6985,12.7866c-0.793,0-1.4385,0.645-1.4385,1.438s0.6455,1.4385,1.4385,1.4385c0.7983,0,1.4482-0.6455,1.4482-1.4385S6.4968,12.7866,5.6985,12.7866z';
    
    echo "Sample path: " . substr($samplePath, 0, 50) . "...\n";
    
    $result = extractPathCenter($samplePath);
    
    if ($result) {
        echo "✅ Extracted coordinates: x={$result['x']}, y={$result['y']}\n";
    } else {
        echo "❌ Failed to extract coordinates\n";
    }
    
    echo "\n";
}

// Test with sample SVG content and pins
function testSVGCoordinateExtraction() {
    echo "🖼️ Testing SVG coordinate extraction:\n";
    
    // Sample SVG content with connector pins
    $svgContent = '<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path id="connector0pin" d="M5.6985,16.8867c-1.4678,0-2.6621-1.1943-2.6621-2.6621s1.1943-2.6616,2.6621-2.6616c1.4731,0,2.6719,1.1938,2.6719,2.6616S7.1716,16.8867,5.6985,16.8867z"/>
    <path id="connector1pin" d="M5.6985,24.0864c-1.4678,0-2.6621-1.1938-2.6621-2.6616s1.1943-2.6616,2.6621-2.6616c1.4731,0,2.6719,1.1938,2.6719,2.6616S7.1716,24.0864,5.6985,24.0864z"/>
</svg>';
    
    // Sample pins array
    $pins = [
        [
            'pin_name' => 'GND',
            'svgId' => 'connector0pin',
            'position_x' => 0,
            'position_y' => 0
        ],
        [
            'pin_name' => 'Tx',
            'svgId' => 'connector1pin',
            'position_x' => 0,
            'position_y' => 0
        ]
    ];
    
    echo "Testing with " . count($pins) . " pins...\n";
    
    $result = extractCoordinatesFromSVG($svgContent, $pins);
    
    foreach ($result as $pin) {
        echo "Pin {$pin['pin_name']} ({$pin['svgId']}): x={$pin['position_x']}, y={$pin['position_y']}\n";
    }
    
    echo "\n";
}

// Run tests
testExtractPathCenter();
testSVGCoordinateExtraction();

echo "🎉 Debug tests completed!\n";
?>
