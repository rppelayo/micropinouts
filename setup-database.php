<?php
/**
 * Database Setup Script for MicroPinouts
 * Run this script to set up the MySQL database and tables
 */

// Database configuration
$host = 'localhost';
$dbname = 'micropinouts';
$username = 'root';
$password = '';

try {
    // Connect to MySQL server (without database)
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL server successfully.\n";
    
    // Read and execute schema file
    $schema = file_get_contents('database/schema.sql');
    
    // Split by semicolon and execute each statement
    $statements = explode(';', $schema);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            try {
                $pdo->exec($statement);
                echo "Executed: " . substr($statement, 0, 50) . "...\n";
            } catch (PDOException $e) {
                // Ignore "database already exists" errors
                if (strpos($e->getMessage(), 'already exists') === false) {
                    echo "Warning: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "\nDatabase setup completed successfully!\n";
    echo "You can now use the MicroPinouts application with database functionality.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Please check your MySQL connection settings and try again.\n";
}
?>