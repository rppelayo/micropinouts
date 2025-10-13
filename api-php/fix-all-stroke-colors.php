<?php
/**
 * Fix all stroke color overrides in existing boards
 * Remove hardcoded group-specific stroke colors from CSS and update individual pin strokes
 */

require_once 'config.php';
require_once 'admin-upload.php'; // Contains makeSVGClickable and getPinStrokeColor

try {
    $pdo = getDBConnection();
    
    echo "Fixing all stroke color overrides in existing boards...\n";
    echo "====================================================\n";
    
    // Get all boards with SVG content
    $stmt = $pdo->query("SELECT id, name, svg_content FROM boards WHERE svg_content IS NOT NULL AND svg_content != ''");
    $boards = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($boards) . " boards with SVG content\n\n";
    
    $updatedCount = 0;
    
    foreach ($boards as $board) {
        echo "Processing board: " . $board['name'] . " (ID: " . $board['id'] . ")\n";
        
        $svgContent = $board['svg_content'];
        $originalSvg = $svgContent;
        
        // Check if the SVG contains any hardcoded group-specific stroke colors
        if (strpos($svgContent, '.pin-hole.group-') !== false && strpos($svgContent, 'stroke:') !== false) {
            echo "Found hardcoded CSS stroke colors, fixing...\n";
            
            // Remove any group-specific stroke color CSS rules
            $svgContent = preg_replace('/\.pin-hole\.group-[^{]*\{[^}]*stroke:[^}]*\}/', '', $svgContent);
            
            // Clean up any empty CSS rules
            $svgContent = preg_replace('/\.pin-hole\.group-[^{]*\{\s*\}/', '', $svgContent);
            
            // Get pins for this board
            $pinsStmt = $pdo->prepare("SELECT pin_name, svg_id FROM pins WHERE board_id = ?");
            $pinsStmt->execute([$board['id']]);
            $pinsData = $pinsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($pinsData)) {
                // Reconstruct pinMap for makeSVGClickable
                $pinMap = [];
                foreach ($pinsData as $pin) {
                    $pinMap[$pin['svg_id']] = $pin['pin_name'];
                }
                
                // Re-process the SVG to ensure correct stroke colors
                $processedSvg = makeSVGClickable($svgContent, $pinsData, $pinMap);
                $svgContent = $processedSvg;
            }
            
            // Update the database
            $updateStmt = $pdo->prepare("UPDATE boards SET svg_content = ? WHERE id = ?");
            $updateStmt->execute([$svgContent, $board['id']]);
            
            echo "✅ Updated SVG content for board: " . $board['name'] . "\n";
            $updatedCount++;
        } else {
            echo "ℹ️  No hardcoded CSS found for board: " . $board['name'] . "\n";
        }
        echo "\n";
    }
    
    echo "====================================================\n";
    echo "CSS fix complete!\n";
    echo "Updated $updatedCount out of " . count($boards) . " boards\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
