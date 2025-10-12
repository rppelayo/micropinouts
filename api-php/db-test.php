<?php
require_once 'config.php';

echo "<h1>Database Connection Test</h1>\n";

// Test 1: Basic PDO connection
echo "<h2>Test 1: Basic PDO Connection</h2>\n";
try {
    $pdo = new PDO(
        "mysql:host=localhost;port=3306;dbname=micropinouts;charset=utf8mb4",
        'root',
        '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => true
        ]
    );
    echo "✅ PDO connection successful<br>\n";
} catch (PDOException $e) {
    echo "❌ PDO connection failed: " . $e->getMessage() . "<br>\n";
    exit;
}

// Test 2: Check if database exists
echo "<h2>Test 2: Database Existence</h2>\n";
try {
    $stmt = $pdo->query("SELECT DATABASE() as current_db");
    $result = $stmt->fetch();
    echo "✅ Current database: " . $result['current_db'] . "<br>\n";
} catch (PDOException $e) {
    echo "❌ Database check failed: " . $e->getMessage() . "<br>\n";
}

// Test 3: Check if tables exist
echo "<h2>Test 3: Table Existence</h2>\n";
$tables = ['boards', 'pins', 'pin_groups', 'wiring_guides'];
foreach ($tables as $table) {
    try {
        $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->fetch()) {
            echo "✅ Table '$table' exists<br>\n";
        } else {
            echo "❌ Table '$table' missing<br>\n";
        }
    } catch (PDOException $e) {
        echo "❌ Error checking table '$table': " . $e->getMessage() . "<br>\n";
    }
}

// Test 4: Simple query test
echo "<h2>Test 4: Simple Query Test</h2>\n";
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM boards");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Query successful. Boards count: " . $result['count'] . "<br>\n";
} catch (PDOException $e) {
    echo "❌ Query failed: " . $e->getMessage() . "<br>\n";
}

// Test 5: Test the getDBConnection function
echo "<h2>Test 5: getDBConnection Function</h2>\n";
try {
    $pdo2 = getDBConnection();
    echo "✅ getDBConnection() function works<br>\n";
} catch (Exception $e) {
    echo "❌ getDBConnection() failed: " . $e->getMessage() . "<br>\n";
}

echo "<h2>MySQL Version Info</h2>\n";
try {
    $stmt = $pdo->query("SELECT VERSION() as version");
    $result = $stmt->fetch();
    echo "MySQL/MariaDB Version: " . $result['version'] . "<br>\n";
} catch (PDOException $e) {
    echo "❌ Version check failed: " . $e->getMessage() . "<br>\n";
}

echo "<h2>PDO Driver Info</h2>\n";
echo "PDO Available Drivers: " . implode(', ', PDO::getAvailableDrivers()) . "<br>\n";
echo "PDO MySQL Available: " . (extension_loaded('pdo_mysql') ? 'Yes' : 'No') . "<br>\n";
?>