<?php
/**
 * Test Data Generator for MicroPinouts
 * This script creates sample pinout data for testing
 */

require_once 'api/config.php';

class TestDataGenerator {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function generateTestData() {
        try {
            echo "Generating test pinout data...\n";
            
            // Sample pinouts data
            $testPinouts = [
                [
                    'title' => 'ATmega328P Pinout Reference',
                    'chip_name' => 'ATmega328P',
                    'category_id' => 1, // microcontroller-8bit
                    'pin_count' => 28,
                    'left_pin_count' => 14,
                    'right_pin_count' => 14,
                    'symmetric_pins' => true,
                    'board_height' => 10.16,
                    'board_width' => 35.56,
                    'background_type' => 'default',
                    'pin_number_color' => '#2c3e50',
                    'meta_description' => 'Complete pinout reference for ATmega328P 8-bit microcontroller with 28 pins',
                    'page_content' => '<p>The ATmega328P is a low-power CMOS 8-bit microcontroller based on the AVR enhanced RISC architecture.</p>',
                    'pins' => $this->generateATmega328PPins()
                ],
                [
                    'title' => 'Arduino Uno R3 Pinout Guide',
                    'chip_name' => 'Arduino Uno R3',
                    'category_id' => 4, // development-board
                    'pin_count' => 30,
                    'left_pin_count' => 15,
                    'right_pin_count' => 15,
                    'symmetric_pins' => true,
                    'board_height' => 53.3,
                    'board_width' => 68.6,
                    'background_type' => 'default',
                    'pin_number_color' => '#2c3e50',
                    'meta_description' => 'Arduino Uno R3 development board pinout with digital and analog pins',
                    'page_content' => '<p>The Arduino Uno R3 is a microcontroller board based on the ATmega328P.</p>',
                    'pins' => $this->generateArduinoUnoPins()
                ],
                [
                    'title' => 'ESP32-WROOM-32 Pinout Diagram',
                    'chip_name' => 'ESP32-WROOM-32',
                    'category_id' => 4, // development-board
                    'pin_count' => 38,
                    'left_pin_count' => 19,
                    'right_pin_count' => 19,
                    'symmetric_pins' => true,
                    'board_height' => 55,
                    'board_width' => 28,
                    'background_type' => 'default',
                    'pin_number_color' => '#2c3e50',
                    'meta_description' => 'ESP32-WROOM-32 module pinout with WiFi and Bluetooth capabilities',
                    'page_content' => '<p>The ESP32-WROOM-32 is a powerful WiFi and Bluetooth enabled microcontroller module.</p>',
                    'pins' => $this->generateESP32Pins()
                ],
                [
                    'title' => 'PIC16F84A Microcontroller Pinout',
                    'chip_name' => 'PIC16F84A',
                    'category_id' => 1, // microcontroller-8bit
                    'pin_count' => 18,
                    'left_pin_count' => 9,
                    'right_pin_count' => 9,
                    'symmetric_pins' => true,
                    'board_height' => 10.16,
                    'board_width' => 22.86,
                    'background_type' => 'default',
                    'pin_number_color' => '#2c3e50',
                    'meta_description' => 'PIC16F84A 8-bit RISC microcontroller pinout reference',
                    'page_content' => '<p>The PIC16F84A is an 8-bit RISC microcontroller with 1.75KB flash memory.</p>',
                    'pins' => $this->generatePIC16F84APins()
                ],
                [
                    'title' => 'HC-SR04 Ultrasonic Sensor Pinout',
                    'chip_name' => 'HC-SR04',
                    'category_id' => 5, // sensor-module
                    'pin_count' => 4,
                    'left_pin_count' => 2,
                    'right_pin_count' => 2,
                    'symmetric_pins' => true,
                    'board_height' => 20,
                    'board_width' => 45,
                    'background_type' => 'default',
                    'pin_number_color' => '#2c3e50',
                    'meta_description' => 'HC-SR04 ultrasonic distance sensor pinout and usage guide',
                    'page_content' => '<p>The HC-SR04 is an ultrasonic distance sensor that can measure distances from 2cm to 400cm.</p>',
                    'pins' => $this->generateHCSR04Pins()
                ]
            ];
            
            foreach ($testPinouts as $pinoutData) {
                $this->createPinout($pinoutData);
            }
            
            echo "Test data generation completed successfully!\n";
            echo "Created " . count($testPinouts) . " test pinouts.\n";
            
        } catch (Exception $e) {
            echo "Error generating test data: " . $e->getMessage() . "\n";
        }
    }
    
    private function createPinout($data) {
        $this->db->getConnection()->beginTransaction();
        
        try {
            // Insert main pinout record
            $sql = "INSERT INTO published_pinouts (
                title, chip_name, category_id, pin_count, left_pin_count, right_pin_count,
                symmetric_pins, board_height, board_width, background_type, pin_number_color,
                meta_description, page_content, pin_data, is_published
            ) VALUES (
                :title, :chip_name, :category_id, :pin_count, :left_pin_count, :right_pin_count,
                :symmetric_pins, :board_height, :board_width, :background_type, :pin_number_color,
                :meta_description, :page_content, :pin_data, 1
            )";
            
            $params = [
                ':title' => $data['title'],
                ':chip_name' => $data['chip_name'],
                ':category_id' => $data['category_id'],
                ':pin_count' => $data['pin_count'],
                ':left_pin_count' => $data['left_pin_count'],
                ':right_pin_count' => $data['right_pin_count'],
                ':symmetric_pins' => $data['symmetric_pins'] ? 1 : 0,
                ':board_height' => $data['board_height'],
                ':board_width' => $data['board_width'],
                ':background_type' => $data['background_type'],
                ':pin_number_color' => $data['pin_number_color'],
                ':meta_description' => $data['meta_description'],
                ':page_content' => $data['page_content'],
                ':pin_data' => json_encode($data['pins'])
            ];
            
            $this->db->query($sql, $params);
            $pinoutId = $this->db->lastInsertId();
            
            // Insert pin data
            $this->insertPins($pinoutId, $data['pins']);
            
            $this->db->getConnection()->commit();
            echo "Created pinout: {$data['chip_name']} (ID: $pinoutId)\n";
            
        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            throw $e;
        }
    }
    
    private function insertPins($pinoutId, $pins) {
        $sql = "INSERT INTO pinout_pins (pinout_id, pin_number, pin_name, pin_type, pin_side, pin_functions, pin_description, voltage_range)
                VALUES (:pinout_id, :pin_number, :pin_name, :pin_type, :pin_side, :pin_functions, :pin_description, :voltage_range)";
        
        foreach ($pins as $pin) {
            $params = [
                ':pinout_id' => $pinoutId,
                ':pin_number' => $pin['number'],
                ':pin_name' => $pin['name'],
                ':pin_type' => $pin['type'],
                ':pin_side' => $pin['side'],
                ':pin_functions' => json_encode($pin['functions'] ?? []),
                ':pin_description' => $pin['description'] ?? '',
                ':voltage_range' => $pin['voltage'] ?? ''
            ];
            $this->db->query($sql, $params);
        }
    }
    
    private function generateATmega328PPins() {
        return [
            // Left side pins
            ['number' => 1, 'name' => 'PC6/RESET', 'type' => 'reset', 'side' => 'left', 'functions' => ['Reset'], 'description' => 'Reset pin', 'voltage' => '0-5V'],
            ['number' => 2, 'name' => 'PD0/RXD', 'type' => 'data', 'side' => 'left', 'functions' => ['UART RX'], 'description' => 'UART receive', 'voltage' => '0-5V'],
            ['number' => 3, 'name' => 'PD1/TXD', 'type' => 'data', 'side' => 'left', 'functions' => ['UART TX'], 'description' => 'UART transmit', 'voltage' => '0-5V'],
            ['number' => 4, 'name' => 'PD2/INT0', 'type' => 'gpio', 'side' => 'left', 'functions' => ['GPIO', 'External Interrupt'], 'description' => 'Digital pin 2', 'voltage' => '0-5V'],
            ['number' => 5, 'name' => 'PD3/INT1', 'type' => 'gpio', 'side' => 'left', 'functions' => ['GPIO', 'External Interrupt'], 'description' => 'Digital pin 3', 'voltage' => '0-5V'],
            ['number' => 6, 'name' => 'PD4/T0', 'type' => 'gpio', 'side' => 'left', 'functions' => ['GPIO', 'Timer0'], 'description' => 'Digital pin 4', 'voltage' => '0-5V'],
            ['number' => 7, 'name' => 'VCC', 'type' => 'power', 'side' => 'left', 'functions' => ['Power'], 'description' => 'Positive supply voltage', 'voltage' => '4.5-5.5V'],
            ['number' => 8, 'name' => 'GND', 'type' => 'gnd', 'side' => 'left', 'functions' => ['Ground'], 'description' => 'Ground reference', 'voltage' => '0V'],
            ['number' => 9, 'name' => 'PB6/XTAL1', 'type' => 'clock', 'side' => 'left', 'functions' => ['Crystal Oscillator'], 'description' => 'Crystal oscillator input', 'voltage' => '0-5V'],
            ['number' => 10, 'name' => 'PB7/XTAL2', 'type' => 'clock', 'side' => 'left', 'functions' => ['Crystal Oscillator'], 'description' => 'Crystal oscillator output', 'voltage' => '0-5V'],
            ['number' => 11, 'name' => 'PD5/T1', 'type' => 'gpio', 'side' => 'left', 'functions' => ['GPIO', 'Timer1'], 'description' => 'Digital pin 5', 'voltage' => '0-5V'],
            ['number' => 12, 'name' => 'PD6/AIN0', 'type' => 'analog', 'side' => 'left', 'functions' => ['Analog Input'], 'description' => 'Analog input 0', 'voltage' => '0-5V'],
            ['number' => 13, 'name' => 'PD7/AIN1', 'type' => 'analog', 'side' => 'left', 'functions' => ['Analog Input'], 'description' => 'Analog input 1', 'voltage' => '0-5V'],
            ['number' => 14, 'name' => 'PB0/ICP', 'type' => 'gpio', 'side' => 'left', 'functions' => ['GPIO', 'Input Capture'], 'description' => 'Digital pin 8', 'voltage' => '0-5V'],
            
            // Right side pins
            ['number' => 15, 'name' => 'PB1/OC1A', 'type' => 'gpio', 'side' => 'right', 'functions' => ['GPIO', 'PWM'], 'description' => 'Digital pin 9', 'voltage' => '0-5V'],
            ['number' => 16, 'name' => 'PB2/SS', 'type' => 'gpio', 'side' => 'right', 'functions' => ['GPIO', 'SPI SS'], 'description' => 'Digital pin 10', 'voltage' => '0-5V'],
            ['number' => 17, 'name' => 'PB3/MOSI', 'type' => 'data', 'side' => 'right', 'functions' => ['SPI MOSI'], 'description' => 'SPI Master Out', 'voltage' => '0-5V'],
            ['number' => 18, 'name' => 'PB4/MISO', 'type' => 'data', 'side' => 'right', 'functions' => ['SPI MISO'], 'description' => 'SPI Master In', 'voltage' => '0-5V'],
            ['number' => 19, 'name' => 'PB5/SCK', 'type' => 'clock', 'side' => 'right', 'functions' => ['SPI Clock'], 'description' => 'SPI Clock', 'voltage' => '0-5V'],
            ['number' => 20, 'name' => 'AVCC', 'type' => 'power', 'side' => 'right', 'functions' => ['Analog Power'], 'description' => 'Analog supply voltage', 'voltage' => '4.5-5.5V'],
            ['number' => 21, 'name' => 'AREF', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Reference'], 'description' => 'Analog reference voltage', 'voltage' => '0-5V'],
            ['number' => 22, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground reference', 'voltage' => '0V'],
            ['number' => 23, 'name' => 'PC0/ADC0', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A0', 'voltage' => '0-5V'],
            ['number' => 24, 'name' => 'PC1/ADC1', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A1', 'voltage' => '0-5V'],
            ['number' => 25, 'name' => 'PC2/ADC2', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A2', 'voltage' => '0-5V'],
            ['number' => 26, 'name' => 'PC3/ADC3', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A3', 'voltage' => '0-5V'],
            ['number' => 27, 'name' => 'PC4/ADC4/SDA', 'type' => 'data', 'side' => 'right', 'functions' => ['I2C SDA'], 'description' => 'I2C Data line', 'voltage' => '0-5V'],
            ['number' => 28, 'name' => 'PC5/ADC5/SCL', 'type' => 'data', 'side' => 'right', 'functions' => ['I2C SCL'], 'description' => 'I2C Clock line', 'voltage' => '0-5V']
        ];
    }
    
    private function generateArduinoUnoPins() {
        return [
            // Left side pins
            ['number' => 1, 'name' => 'D0', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 0', 'voltage' => '0-5V'],
            ['number' => 2, 'name' => 'D1', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 1', 'voltage' => '0-5V'],
            ['number' => 3, 'name' => 'D2', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 2', 'voltage' => '0-5V'],
            ['number' => 4, 'name' => 'D3', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'PWM'], 'description' => 'Digital pin 3 (PWM)', 'voltage' => '0-5V'],
            ['number' => 5, 'name' => 'D4', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 4', 'voltage' => '0-5V'],
            ['number' => 6, 'name' => 'D5', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'PWM'], 'description' => 'Digital pin 5 (PWM)', 'voltage' => '0-5V'],
            ['number' => 7, 'name' => 'D6', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'PWM'], 'description' => 'Digital pin 6 (PWM)', 'voltage' => '0-5V'],
            ['number' => 8, 'name' => 'D7', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 7', 'voltage' => '0-5V'],
            ['number' => 9, 'name' => 'D8', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 8', 'voltage' => '0-5V'],
            ['number' => 10, 'name' => 'D9', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'PWM'], 'description' => 'Digital pin 9 (PWM)', 'voltage' => '0-5V'],
            ['number' => 11, 'name' => 'D10', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'PWM', 'SPI SS'], 'description' => 'Digital pin 10 (PWM, SPI SS)', 'voltage' => '0-5V'],
            ['number' => 12, 'name' => 'D11', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'PWM', 'SPI MOSI'], 'description' => 'Digital pin 11 (PWM, SPI MOSI)', 'voltage' => '0-5V'],
            ['number' => 13, 'name' => 'D12', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'SPI MISO'], 'description' => 'Digital pin 12 (SPI MISO)', 'voltage' => '0-5V'],
            ['number' => 14, 'name' => 'D13', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'SPI SCK'], 'description' => 'Digital pin 13 (SPI SCK)', 'voltage' => '0-5V'],
            ['number' => 15, 'name' => 'GND', 'type' => 'gnd', 'side' => 'left', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            
            // Right side pins
            ['number' => 16, 'name' => 'AREF', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Reference'], 'description' => 'Analog reference', 'voltage' => '0-5V'],
            ['number' => 17, 'name' => 'A0', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A0', 'voltage' => '0-5V'],
            ['number' => 18, 'name' => 'A1', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A1', 'voltage' => '0-5V'],
            ['number' => 19, 'name' => 'A2', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A2', 'voltage' => '0-5V'],
            ['number' => 20, 'name' => 'A3', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input'], 'description' => 'Analog input A3', 'voltage' => '0-5V'],
            ['number' => 21, 'name' => 'A4', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input', 'I2C SDA'], 'description' => 'Analog input A4 (I2C SDA)', 'voltage' => '0-5V'],
            ['number' => 22, 'name' => 'A5', 'type' => 'analog', 'side' => 'right', 'functions' => ['Analog Input', 'I2C SCL'], 'description' => 'Analog input A5 (I2C SCL)', 'voltage' => '0-5V'],
            ['number' => 23, 'name' => '3.3V', 'type' => 'power', 'side' => 'right', 'functions' => ['Power'], 'description' => '3.3V power output', 'voltage' => '3.3V'],
            ['number' => 24, 'name' => '5V', 'type' => 'power', 'side' => 'right', 'functions' => ['Power'], 'description' => '5V power output', 'voltage' => '5V'],
            ['number' => 25, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 26, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 27, 'name' => 'VIN', 'type' => 'power', 'side' => 'right', 'functions' => ['Power Input'], 'description' => 'Voltage input', 'voltage' => '7-12V'],
            ['number' => 28, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 29, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 30, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V']
        ];
    }
    
    private function generateESP32Pins() {
        return [
            // Left side pins (1-19)
            ['number' => 1, 'name' => 'GND', 'type' => 'gnd', 'side' => 'left', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 2, 'name' => '3.3V', 'type' => 'power', 'side' => 'left', 'functions' => ['Power'], 'description' => '3.3V power output', 'voltage' => '3.3V'],
            ['number' => 3, 'name' => 'EN', 'type' => 'reset', 'side' => 'left', 'functions' => ['Enable'], 'description' => 'Chip enable', 'voltage' => '0-3.3V'],
            ['number' => 4, 'name' => 'GPIO36', 'type' => 'analog', 'side' => 'left', 'functions' => ['Analog Input'], 'description' => 'Analog input A0', 'voltage' => '0-3.3V'],
            ['number' => 5, 'name' => 'GPIO39', 'type' => 'analog', 'side' => 'left', 'functions' => ['Analog Input'], 'description' => 'Analog input A3', 'voltage' => '0-3.3V'],
            ['number' => 6, 'name' => 'GPIO34', 'type' => 'analog', 'side' => 'left', 'functions' => ['Analog Input'], 'description' => 'Analog input A2', 'voltage' => '0-3.3V'],
            ['number' => 7, 'name' => 'GPIO35', 'type' => 'analog', 'side' => 'left', 'functions' => ['Analog Input'], 'description' => 'Analog input A1', 'voltage' => '0-3.3V'],
            ['number' => 8, 'name' => 'GPIO32', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 32', 'voltage' => '0-3.3V'],
            ['number' => 9, 'name' => 'GPIO33', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 33', 'voltage' => '0-3.3V'],
            ['number' => 10, 'name' => 'GPIO25', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'DAC'], 'description' => 'Digital pin 25 (DAC)', 'voltage' => '0-3.3V'],
            ['number' => 11, 'name' => 'GPIO26', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'DAC'], 'description' => 'Digital pin 26 (DAC)', 'voltage' => '0-3.3V'],
            ['number' => 12, 'name' => 'GPIO27', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 27', 'voltage' => '0-3.3V'],
            ['number' => 13, 'name' => 'GPIO14', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 14', 'voltage' => '0-3.3V'],
            ['number' => 14, 'name' => 'GPIO12', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 12', 'voltage' => '0-3.3V'],
            ['number' => 15, 'name' => 'GND', 'type' => 'gnd', 'side' => 'left', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 16, 'name' => 'GPIO13', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 13', 'voltage' => '0-3.3V'],
            ['number' => 17, 'name' => 'D2', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 2', 'voltage' => '0-3.3V'],
            ['number' => 18, 'name' => 'D3', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 3', 'voltage' => '0-3.3V'],
            ['number' => 19, 'name' => 'CMD', 'type' => 'special', 'side' => 'left', 'functions' => ['Command'], 'description' => 'Command pin', 'voltage' => '0-3.3V'],
            
            // Right side pins (20-38)
            ['number' => 20, 'name' => '5V', 'type' => 'power', 'side' => 'right', 'functions' => ['Power'], 'description' => '5V power input', 'voltage' => '5V'],
            ['number' => 21, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 22, 'name' => '3.3V', 'type' => 'power', 'side' => 'right', 'functions' => ['Power'], 'description' => '3.3V power output', 'voltage' => '3.3V'],
            ['number' => 23, 'name' => 'EN', 'type' => 'reset', 'side' => 'right', 'functions' => ['Enable'], 'description' => 'Chip enable', 'voltage' => '0-3.3V'],
            ['number' => 24, 'name' => 'GPIO23', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 23', 'voltage' => '0-3.3V'],
            ['number' => 25, 'name' => 'GPIO22', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 22', 'voltage' => '0-3.3V'],
            ['number' => 26, 'name' => 'TX', 'type' => 'data', 'side' => 'right', 'functions' => ['UART TX'], 'description' => 'UART transmit', 'voltage' => '0-3.3V'],
            ['number' => 27, 'name' => 'RX', 'type' => 'data', 'side' => 'right', 'functions' => ['UART RX'], 'description' => 'UART receive', 'voltage' => '0-3.3V'],
            ['number' => 28, 'name' => 'GPIO21', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O', 'I2C SDA'], 'description' => 'Digital pin 21 (I2C SDA)', 'voltage' => '0-3.3V'],
            ['number' => 29, 'name' => 'GPIO19', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O', 'I2C SCL'], 'description' => 'Digital pin 19 (I2C SCL)', 'voltage' => '0-3.3V'],
            ['number' => 30, 'name' => 'GPIO18', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 18', 'voltage' => '0-3.3V'],
            ['number' => 31, 'name' => 'GPIO5', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 5', 'voltage' => '0-3.3V'],
            ['number' => 32, 'name' => 'GPIO17', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 17', 'voltage' => '0-3.3V'],
            ['number' => 33, 'name' => 'GPIO16', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 16', 'voltage' => '0-3.3V'],
            ['number' => 34, 'name' => 'GPIO4', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 4', 'voltage' => '0-3.3V'],
            ['number' => 35, 'name' => 'GPIO0', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 0', 'voltage' => '0-3.3V'],
            ['number' => 36, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V'],
            ['number' => 37, 'name' => 'GPIO2', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 2', 'voltage' => '0-3.3V'],
            ['number' => 38, 'name' => 'GPIO15', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Digital pin 15', 'voltage' => '0-3.3V']
        ];
    }
    
    private function generatePIC16F84APins() {
        return [
            // Left side pins (1-9)
            ['number' => 1, 'name' => 'MCLR/VPP', 'type' => 'reset', 'side' => 'left', 'functions' => ['Reset', 'Programming'], 'description' => 'Master Clear/Programming voltage', 'voltage' => '0-5.5V'],
            ['number' => 2, 'name' => 'RA0', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Port A bit 0', 'voltage' => '0-5.5V'],
            ['number' => 3, 'name' => 'RA1', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Port A bit 1', 'voltage' => '0-5.5V'],
            ['number' => 4, 'name' => 'RA2', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Port A bit 2', 'voltage' => '0-5.5V'],
            ['number' => 5, 'name' => 'RA3', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O'], 'description' => 'Port A bit 3', 'voltage' => '0-5.5V'],
            ['number' => 6, 'name' => 'RA4/T0CKI', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Digital I/O', 'Timer0 Clock'], 'description' => 'Port A bit 4/Timer0 clock', 'voltage' => '0-5.5V'],
            ['number' => 7, 'name' => 'VSS', 'type' => 'gnd', 'side' => 'left', 'functions' => ['Ground'], 'description' => 'Ground reference', 'voltage' => '0V'],
            ['number' => 8, 'name' => 'OSC1/CLKIN', 'type' => 'clock', 'side' => 'left', 'functions' => ['Clock Input'], 'description' => 'Oscillator input', 'voltage' => '0-5.5V'],
            ['number' => 9, 'name' => 'OSC2/CLKOUT', 'type' => 'clock', 'side' => 'left', 'functions' => ['Clock Output'], 'description' => 'Oscillator output', 'voltage' => '0-5.5V'],
            
            // Right side pins (10-18)
            ['number' => 10, 'name' => 'RB0/INT', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O', 'External Interrupt'], 'description' => 'Port B bit 0/External interrupt', 'voltage' => '0-5.5V'],
            ['number' => 11, 'name' => 'RB1', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Port B bit 1', 'voltage' => '0-5.5V'],
            ['number' => 12, 'name' => 'RB2', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Port B bit 2', 'voltage' => '0-5.5V'],
            ['number' => 13, 'name' => 'RB3', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O'], 'description' => 'Port B bit 3', 'voltage' => '0-5.5V'],
            ['number' => 14, 'name' => 'RB4', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O', 'Interrupt on Change'], 'description' => 'Port B bit 4/Interrupt on change', 'voltage' => '0-5.5V'],
            ['number' => 15, 'name' => 'RB5', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O', 'Interrupt on Change'], 'description' => 'Port B bit 5/Interrupt on change', 'voltage' => '0-5.5V'],
            ['number' => 16, 'name' => 'RB6', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O', 'Interrupt on Change'], 'description' => 'Port B bit 6/Interrupt on change', 'voltage' => '0-5.5V'],
            ['number' => 17, 'name' => 'RB7', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Digital I/O', 'Interrupt on Change'], 'description' => 'Port B bit 7/Interrupt on change', 'voltage' => '0-5.5V'],
            ['number' => 18, 'name' => 'VDD', 'type' => 'power', 'side' => 'right', 'functions' => ['Power'], 'description' => 'Positive supply voltage', 'voltage' => '2.0-5.5V']
        ];
    }
    
    private function generateHCSR04Pins() {
        return [
            ['number' => 1, 'name' => 'VCC', 'type' => 'power', 'side' => 'left', 'functions' => ['Power'], 'description' => 'Power supply', 'voltage' => '5V'],
            ['number' => 2, 'name' => 'TRIG', 'type' => 'gpio', 'side' => 'left', 'functions' => ['Trigger'], 'description' => 'Trigger pin', 'voltage' => '0-5V'],
            ['number' => 3, 'name' => 'ECHO', 'type' => 'gpio', 'side' => 'right', 'functions' => ['Echo'], 'description' => 'Echo pin', 'voltage' => '0-5V'],
            ['number' => 4, 'name' => 'GND', 'type' => 'gnd', 'side' => 'right', 'functions' => ['Ground'], 'description' => 'Ground', 'voltage' => '0V']
        ];
    }
}

// Run the test data generator
$generator = new TestDataGenerator();
$generator->generateTestData();
?>