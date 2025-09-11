-- MicroPinouts Database Schema
-- This file creates the database structure for storing published pinouts

CREATE DATABASE IF NOT EXISTS micropinouts;
USE micropinouts;

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (key_name, display_name, icon, color) VALUES
('microcontroller-8bit', 'Microcontroller (8-bit)', '🔧', '#3498db'),
('microcontroller-16bit', 'Microcontroller (16-bit)', '⚙️', '#9b59b6'),
('microcontroller-32bit', 'Microcontroller (32-bit)', '🔩', '#e74c3c'),
('development-board', 'Development Board', '📱', '#27ae60'),
('sensor-module', 'Sensor & Module', '📡', '#f39c12'),
('communication-ic', 'Communication IC', '📶', '#1abc9c'),
('power-management', 'Power Management', '⚡', '#e67e22'),
('memory-storage', 'Memory & Storage', '💾', '#34495e'),
('custom-other', 'Custom/Other', '🔧', '#95a5a6');

-- Published pinouts table
CREATE TABLE published_pinouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    chip_name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    pin_count INT NOT NULL,
    left_pin_count INT NOT NULL,
    right_pin_count INT NOT NULL,
    symmetric_pins BOOLEAN NOT NULL DEFAULT TRUE,
    board_height DECIMAL(5,2) NOT NULL,
    board_width DECIMAL(5,2) NOT NULL,
    background_type ENUM('default', 'image', 'none') NOT NULL DEFAULT 'default',
    background_image TEXT,
    image_offset_x INT DEFAULT 0,
    image_offset_y INT DEFAULT 0,
    image_scale_x INT DEFAULT 300,
    image_scale_y INT DEFAULT 300,
    pin_number_color VARCHAR(7) DEFAULT '#2c3e50',
    meta_description TEXT,
    page_content LONGTEXT,
    pin_data JSON NOT NULL,
    svg_content LONGTEXT,
    html_content LONGTEXT,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_chip_name (chip_name),
    INDEX idx_category (category_id),
    INDEX idx_published (is_published),
    INDEX idx_created (created_at)
);

-- Pin data table (normalized for better querying)
CREATE TABLE pinout_pins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pinout_id INT NOT NULL,
    pin_number INT NOT NULL,
    pin_name VARCHAR(100) NOT NULL,
    pin_type VARCHAR(50) NOT NULL,
    pin_side ENUM('left', 'right') NOT NULL,
    pin_functions JSON,
    pin_description TEXT,
    voltage_range VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pinout_id) REFERENCES published_pinouts(id) ON DELETE CASCADE,
    INDEX idx_pinout_pin (pinout_id, pin_number),
    INDEX idx_pin_type (pin_type)
);

-- User sessions table (for future authentication)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_session (session_id),
    INDEX idx_expires (expires_at)
);

-- Analytics table (for tracking views and interactions)
CREATE TABLE pinout_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pinout_id INT NOT NULL,
    event_type ENUM('view', 'download_pdf', 'download_image', 'download_svg', 'pin_click') NOT NULL,
    event_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pinout_id) REFERENCES published_pinouts(id) ON DELETE CASCADE,
    INDEX idx_pinout_event (pinout_id, event_type),
    INDEX idx_created (created_at)
);