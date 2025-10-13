<?php
require_once 'config.php';

// Initialize database
$pdo = initializeDatabase();

echo "<h2>Update Existing Wiring Guide Slugs</h2>";

// Get all wiring guides
$stmt = $pdo->query("
    SELECT 
        wg.id,
        wg.slug,
        wg.description,
        wg.created_at,
        sb.name as sensor_name,
        sb.slug as sensor_slug,
        mb.name as microcontroller_name,
        mb.slug as microcontroller_slug
    FROM wiring_guides wg
    LEFT JOIN boards sb ON wg.sensor_board_id = sb.id
    LEFT JOIN boards mb ON wg.microcontroller_board_id = mb.id
    ORDER BY wg.id
");
$wiringGuides = $stmt->fetchAll();

echo "<p><strong>Found wiring guides:</strong> " . count($wiringGuides) . "</p>";

if (count($wiringGuides) === 0) {
    echo "<p>No wiring guides found to update.</p>";
    exit;
}

$updateStmt = $pdo->prepare("UPDATE wiring_guides SET slug = ? WHERE id = ?");
$updatedCount = 0;

foreach ($wiringGuides as $guide) {
    echo "<div style='border: 1px solid #ccc; margin: 10px; padding: 10px;'>";
    echo "<h3>Wiring Guide ID: " . $guide['id'] . "</h3>";
    
    // Check if slug is already in the new format (contains 'to')
    if (strpos($guide['slug'], 'to') !== false && !strpos($guide['slug'], 'wiring-guide-')) {
        echo "<p style='color: green;'>✅ Already using new format: " . htmlspecialchars($guide['slug']) . "</p>";
        echo "</div>";
        continue;
    }
    
    // Generate meaningful slug
    $sensorSlug = $guide['sensor_slug'] ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $guide['sensor_name']));
    $microSlug = $guide['microcontroller_slug'] ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $guide['microcontroller_name']));
    
    $newSlug = $sensorSlug . '-to-' . $microSlug;
    
    // Clean up the slug
    $newSlug = trim($newSlug, '-');
    $newSlug = preg_replace('/-+/', '-', $newSlug);
    
    echo "<p><strong>Old slug:</strong> " . htmlspecialchars($guide['slug']) . "</p>";
    echo "<p><strong>New slug:</strong> " . htmlspecialchars($newSlug) . "</p>";
    echo "<p><strong>Sensor:</strong> " . htmlspecialchars($guide['sensor_name']) . "</p>";
    echo "<p><strong>Microcontroller:</strong> " . htmlspecialchars($guide['microcontroller_name']) . "</p>";
    
    // Check if slug already exists
    $checkStmt = $pdo->prepare("SELECT id FROM wiring_guides WHERE slug = ? AND id != ?");
    $checkStmt->execute([$newSlug, $guide['id']]);
    $existing = $checkStmt->fetch();
    
    if ($existing) {
        // Add ID to make it unique
        $newSlug = $newSlug . '-' . $guide['id'];
        echo "<p style='color: orange;'>⚠️ Slug already exists, using: " . htmlspecialchars($newSlug) . "</p>";
    }
    
    // Update the slug
    $updateStmt->execute([$newSlug, $guide['id']]);
    echo "<p style='color: green;'>✅ Updated successfully!</p>";
    $updatedCount++;
    echo "</div>";
}

echo "<h3>Update Complete!</h3>";
echo "<p><strong>Updated:</strong> $updatedCount wiring guides</p>";
echo "<p><strong>Skipped:</strong> " . (count($wiringGuides) - $updatedCount) . " wiring guides (already using new format)</p>";
echo "<p>All wiring guide slugs have been updated to use meaningful names.</p>";
?>
