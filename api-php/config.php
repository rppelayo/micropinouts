<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'micropinouts');
define('DB_USER', 'root');
define('DB_PASS', '');

// Admin configuration
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123');

// JWT Secret (change this in production!)
define('JWT_SECRET', 'your-jwt-secret-key-change-in-production');

// File upload configuration
define('UPLOAD_DIR', 'uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB

// CORS configuration
define('ALLOWED_ORIGINS', ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8080']);

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('UTC');

// Start session
session_start();

// Database connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=localhost;port=3306;dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => true
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
}

// CORS headers
function setCORSHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// JSON response helper
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Error response helper
function errorResponse($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

// Success response helper
function successResponse($data = null, $message = 'Success') {
    $response = ['message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    jsonResponse($response);
}

// Authentication helper
function verifyAdminToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        errorResponse('Access token required', 401);
    }
    
    $token = $matches[1];
    
    try {
        // Simple JWT verification (in production, use a proper JWT library)
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], explode('.', $token)[1]));
        $decoded = json_decode($payload, true);
        
        if (!$decoded || $decoded['exp'] < time()) {
            errorResponse('Invalid or expired token', 401);
        }
        
        return $decoded;
    } catch (Exception $e) {
        errorResponse('Invalid token', 401);
    }
}

// Generate JWT token
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
    $payload = json_encode($payload);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

// Generate slug from name
function generateSlug($name) {
    return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
}

// Initialize database tables
function initializeDatabase() {
    $pdo = getDBConnection();
    
    // Create boards table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS boards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            manufacturer VARCHAR(255),
            package_type VARCHAR(100),
            pin_count INT,
            voltage_range VARCHAR(100),
            clock_speed VARCHAR(100),
            flash_memory VARCHAR(100),
            ram VARCHAR(100),
            image_url VARCHAR(500),
            svg_content LONGTEXT,
            pcb_svg_content LONGTEXT,
            published BOOLEAN DEFAULT 1,
            slug VARCHAR(255) UNIQUE,
            link VARCHAR(500),
            category VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    // Create pin_groups table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pin_groups (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(7) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Create pins table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            board_id INT NOT NULL,
            pin_number VARCHAR(50) NOT NULL,
            pin_name VARCHAR(100),
            pin_group_id INT,
            functions TEXT,
            voltage_range VARCHAR(100),
            current_limit VARCHAR(100),
            description TEXT,
            position_x DECIMAL(10,2),
            position_y DECIMAL(10,2),
            svg_id VARCHAR(100),
            alternate_functions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
            FOREIGN KEY (pin_group_id) REFERENCES pin_groups(id)
        )
    ");
    
    // Create wiring_guides table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS wiring_guides (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sensor_board_id INT NOT NULL,
            microcontroller_board_id INT NOT NULL,
            connections JSON NOT NULL,
            svg_content LONGTEXT,
            description TEXT,
            slug VARCHAR(255) UNIQUE,
            published BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (sensor_board_id) REFERENCES boards(id) ON DELETE CASCADE,
            FOREIGN KEY (microcontroller_board_id) REFERENCES boards(id) ON DELETE CASCADE
        )
    ");
    
    // Insert default pin groups
    $defaultGroups = [
        ['Power', '#ff6b6b', 'Power supply pins (VCC, GND, etc.)'],
        ['Digital', '#4ecdc4', 'Digital I/O pins'],
        ['Analog', '#45b7d1', 'Analog input pins'],
        ['Communication', '#96ceb4', 'Serial, SPI, I2C communication pins'],
        ['PWM', '#feca57', 'Pulse Width Modulation pins'],
        ['Special', '#ff9ff3', 'Special function pins (reset, clock, etc.)']
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO pin_groups (name, color, description) VALUES (?, ?, ?)");
    foreach ($defaultGroups as $group) {
        $stmt->execute($group);
    }
    
    return $pdo;
}

// Set CORS headers
setCORSHeaders();
?>