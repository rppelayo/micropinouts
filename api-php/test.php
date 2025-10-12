<?php
require_once 'config.php';

echo "<h1>MicroPinouts PHP Backend Test</h1>\n";

// Test database connection
echo "<h2>Database Connection Test</h2>\n";
try {
    $pdo = getDBConnection();
    echo "✅ Database connection successful<br>\n";
    
    // Test table existence
    $tables = ['boards', 'pins', 'pin_groups', 'wiring_guides'];
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->fetch()) {
            echo "✅ Table '$table' exists<br>\n";
        } else {
            echo "❌ Table '$table' missing<br>\n";
        }
    }
    
    // Test data
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM boards");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "📊 Boards in database: " . $result['count'] . "<br>\n";
    
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM pins");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "📊 Pins in database: " . $result['count'] . "<br>\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>\n";
}

// Test file uploads directory
echo "<h2>File Uploads Test</h2>\n";
if (is_dir(UPLOAD_DIR)) {
    echo "✅ Uploads directory exists<br>\n";
    if (is_writable(UPLOAD_DIR)) {
        echo "✅ Uploads directory is writable<br>\n";
    } else {
        echo "❌ Uploads directory is not writable<br>\n";
    }
} else {
    echo "❌ Uploads directory missing<br>\n";
}

// Test PHP extensions
echo "<h2>PHP Extensions Test</h2>\n";
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'fileinfo'];
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ Extension '$ext' loaded<br>\n";
    } else {
        echo "❌ Extension '$ext' missing<br>\n";
    }
}

// Test API endpoints
echo "<h2>API Endpoints Test</h2>\n";
$baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);

$endpoints = [
    '/' => 'Root endpoint',
    '/boards' => 'Get all boards',
    '/pin-groups' => 'Get pin groups'
];

foreach ($endpoints as $endpoint => $description) {
    $url = $baseUrl . $endpoint;
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Content-Type: application/json',
            'timeout' => 5
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    if ($response !== false) {
        echo "✅ $description: <a href='$url' target='_blank'>$url</a><br>\n";
    } else {
        echo "❌ $description: <a href='$url' target='_blank'>$url</a><br>\n";
    }
}

// Test admin login
echo "<h2>Admin Login Test</h2>\n";
$loginUrl = $baseUrl . '/admin/login';
$loginData = json_encode(['username' => ADMIN_USERNAME, 'password' => ADMIN_PASSWORD]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $loginData,
        'timeout' => 5
    ]
]);

$response = @file_get_contents($loginUrl, false, $context);
if ($response !== false) {
    $data = json_decode($response, true);
    if (isset($data['token'])) {
        echo "✅ Admin login successful<br>\n";
        echo "🔑 Token received: " . substr($data['token'], 0, 20) . "...<br>\n";
    } else {
        echo "❌ Admin login failed: " . $response . "<br>\n";
    }
} else {
    echo "❌ Admin login endpoint not accessible<br>\n";
}

echo "<h2>Configuration</h2>\n";
echo "PHP Version: " . PHP_VERSION . "<br>\n";
echo "Database Host: " . DB_HOST . "<br>\n";
echo "Database Name: " . DB_NAME . "<br>\n";
echo "Upload Directory: " . UPLOAD_DIR . "<br>\n";
echo "Max File Size: " . (MAX_FILE_SIZE / 1024 / 1024) . "MB<br>\n";

echo "<h2>Next Steps</h2>\n";
echo "1. If all tests pass, your PHP backend is ready!<br>\n";
echo "2. Update your React app to use the PHP backend URL<br>\n";
echo "3. Test the admin panel functionality<br>\n";
echo "4. Upload some Fritzing files to test file upload<br>\n";
?>