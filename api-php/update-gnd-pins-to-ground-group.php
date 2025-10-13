<?php
/**
 * Update existing GND pins to use Ground group instead of Power group
 */

require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    echo "Updating GND pins to Ground group...\n";
    echo "====================================\n";
    
    // Find all pins that are GND and currently in Power group
    $stmt = $pdo->prepare("SELECT id, pin_name, group_name FROM pins WHERE UPPER(pin_name) LIKE '%GND%' AND group_name = 'Power'");
    $stmt->execute();
    $gndPins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($gndPins) . " GND pins in Power group\n\n";
    
    $updatedCount = 0;
    
    foreach ($gndPins as $pin) {
        echo "Updating pin: " . $pin['pin_name'] . " (ID: " . $pin['id'] . ") from Power to Ground group\n";
        
        // Update the pin group
        $updateStmt = $pdo->prepare("UPDATE pins SET group_name = 'Ground' WHERE id = ?");
        $updateStmt->execute([$pin['id']]);
        
        $updatedCount++;
    }
    
    echo "\n====================================\n";
    echo "Update complete!\n";
    echo "Updated $updatedCount GND pins to Ground group\n";
    
    // Now reprocess all boards to update their SVG content
    echo "\nReprocessing boards with updated pin groups...\n";
    echo "=============================================\n";
    
    // Get all boards
    $boardsStmt = $pdo->query("SELECT id, name FROM boards WHERE svg_content IS NOT NULL AND svg_content != ''");
    $boards = $boardsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $reprocessedCount = 0;
    
    foreach ($boards as $board) {
        echo "Reprocessing board: " . $board['name'] . " (ID: " . $board['id'] . ")\n";
        
        // Get pins for this board
        $pinsStmt = $pdo->prepare("SELECT pin_name, svg_id, group_name FROM pins WHERE board_id = ?");
        $pinsStmt->execute([$board['id']]);
        $pinsData = $pinsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($pinsData)) {
            // Reconstruct pinMap for makeSVGClickable
            $pinMap = [];
            foreach ($pinsData as $pin) {
                $pinMap[$pin['svg_id']] = $pin['pin_name'];
            }
            
            // Get current SVG content
            $svgStmt = $pdo->prepare("SELECT svg_content FROM boards WHERE id = ?");
            $svgStmt->execute([$board['id']]);
            $svgResult = $svgStmt->fetch();
            $originalSvg = $svgResult['svg_content'];
            
            // Include the makeSVGClickable function
            require_once 'admin-upload.php';
            
            // Re-process the SVG
            $processedSvg = makeSVGClickable($originalSvg, $pinsData, $pinMap);
            
            // Update the SVG content
            $updateSvgStmt = $pdo->prepare("UPDATE boards SET svg_content = ? WHERE id = ?");
            $updateSvgStmt->execute([$processedSvg, $board['id']]);
            
            echo "✅ Reprocessed SVG for board: " . $board['name'] . "\n";
            $reprocessedCount++;
        } else {
            echo "ℹ️  No pins found for board: " . $board['name'] . "\n";
        }
        echo "\n";
    }
    
    echo "=============================================\n";
    echo "Reprocessing complete!\n";
    echo "Reprocessed $reprocessedCount boards\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
