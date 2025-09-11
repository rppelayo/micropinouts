<?php
require_once 'config.php';

class PinoutAPI {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    // Get all published pinouts with pagination and filtering
    public function getPinouts($page = 1, $limit = 10, $category = null, $search = null) {
        try {
            $offset = ($page - 1) * $limit;
            $where_conditions = ["p.is_published = 1"];
            $params = [];
            
            if ($category) {
                $where_conditions[] = "p.category_id = :category";
                $params[':category'] = $category;
            }
            
            if ($search) {
                $where_conditions[] = "(p.chip_name LIKE :search OR p.title LIKE :search)";
                $params[':search'] = "%$search%";
            }
            
            $where_clause = implode(' AND ', $where_conditions);
            
            $sql = "SELECT p.*, c.display_name as category_name, c.icon as category_icon, c.color as category_color
                    FROM published_pinouts p
                    JOIN categories c ON p.category_id = c.id
                    WHERE $where_clause
                    ORDER BY p.created_at DESC
                    LIMIT :limit OFFSET :offset";
            
            $params[':limit'] = $limit;
            $params[':offset'] = $offset;
            
            $stmt = $this->db->query($sql, $params);
            $pinouts = $stmt->fetchAll();
            
            // Get total count for pagination
            $count_sql = "SELECT COUNT(*) as total FROM published_pinouts p WHERE $where_clause";
            $count_stmt = $this->db->query($count_sql, array_slice($params, 0, -2));
            $total = $count_stmt->fetch()['total'];
            
            return [
                'pinouts' => $pinouts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ];
        } catch (Exception $e) {
            sendError("Failed to fetch pinouts: " . $e->getMessage(), 500);
        }
    }
    
    // Get a single pinout by ID
    public function getPinout($id) {
        try {
            $sql = "SELECT p.*, c.display_name as category_name, c.icon as category_icon, c.color as category_color
                    FROM published_pinouts p
                    JOIN categories c ON p.category_id = c.id
                    WHERE p.id = :id AND p.is_published = 1";
            
            $stmt = $this->db->query($sql, [':id' => $id]);
            $pinout = $stmt->fetch();
            
            if (!$pinout) {
                sendError("Pinout not found", 404);
            }
            
            // Get pin data
            $pins_sql = "SELECT * FROM pinout_pins WHERE pinout_id = :pinout_id ORDER BY pin_number";
            $pins_stmt = $this->db->query($pins_sql, [':pinout_id' => $id]);
            $pinout['pins'] = $pins_stmt->fetchAll();
            
            // Increment view count
            $this->incrementViewCount($id);
            
            return $pinout;
        } catch (Exception $e) {
            sendError("Failed to fetch pinout: " . $e->getMessage(), 500);
        }
    }
    
    // Create a new pinout
    public function createPinout($data) {
        try {
            validateInput($data, ['chip_name', 'category_id', 'pin_data']);
            
            $this->db->getConnection()->beginTransaction();
            
            // Insert main pinout record
            $sql = "INSERT INTO published_pinouts (
                title, chip_name, category_id, pin_count, left_pin_count, right_pin_count,
                symmetric_pins, board_height, board_width, background_type, background_image,
                image_offset_x, image_offset_y, image_scale_x, image_scale_y, pin_number_color,
                meta_description, page_content, pin_data, svg_content, html_content
            ) VALUES (
                :title, :chip_name, :category_id, :pin_count, :left_pin_count, :right_pin_count,
                :symmetric_pins, :board_height, :board_width, :background_type, :background_image,
                :image_offset_x, :image_offset_y, :image_scale_x, :image_scale_y, :pin_number_color,
                :meta_description, :page_content, :pin_data, :svg_content, :html_content
            )";
            
            $params = [
                ':title' => $data['title'] ?? $data['chip_name'] . ' Pinout',
                ':chip_name' => sanitizeInput($data['chip_name']),
                ':category_id' => $data['category_id'],
                ':pin_count' => $data['pin_count'],
                ':left_pin_count' => $data['left_pin_count'],
                ':right_pin_count' => $data['right_pin_count'],
                ':symmetric_pins' => $data['symmetric_pins'] ? 1 : 0,
                ':board_height' => $data['board_height'],
                ':board_width' => $data['board_width'],
                ':background_type' => $data['background_type'] ?? 'default',
                ':background_image' => $data['background_image'],
                ':image_offset_x' => $data['image_offset_x'] ?? 0,
                ':image_offset_y' => $data['image_offset_y'] ?? 0,
                ':image_scale_x' => $data['image_scale_x'] ?? 300,
                ':image_scale_y' => $data['image_scale_y'] ?? 300,
                ':pin_number_color' => $data['pin_number_color'] ?? '#2c3e50',
                ':meta_description' => $data['meta_description'],
                ':page_content' => $data['page_content'],
                ':pin_data' => json_encode($data['pin_data']),
                ':svg_content' => $data['svg_content'],
                ':html_content' => $data['html_content']
            ];
            
            $this->db->query($sql, $params);
            $pinout_id = $this->db->lastInsertId();
            
            // Insert pin data
            $this->insertPins($pinout_id, $data['pin_data']);
            
            $this->db->getConnection()->commit();
            
            return ['id' => $pinout_id, 'message' => 'Pinout created successfully'];
        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            sendError("Failed to create pinout: " . $e->getMessage(), 500);
        }
    }
    
    // Update an existing pinout
    public function updatePinout($id, $data) {
        try {
            validateInput($data, ['chip_name', 'category_id', 'pin_data']);
            
            $this->db->getConnection()->beginTransaction();
            
            // Update main pinout record
            $sql = "UPDATE published_pinouts SET
                title = :title, chip_name = :chip_name, category_id = :category_id,
                pin_count = :pin_count, left_pin_count = :left_pin_count, right_pin_count = :right_pin_count,
                symmetric_pins = :symmetric_pins, board_height = :board_height, board_width = :board_width,
                background_type = :background_type, background_image = :background_image,
                image_offset_x = :image_offset_x, image_offset_y = :image_offset_y,
                image_scale_x = :image_scale_x, image_scale_y = :image_scale_y,
                pin_number_color = :pin_number_color, meta_description = :meta_description,
                page_content = :page_content, pin_data = :pin_data, svg_content = :svg_content,
                html_content = :html_content, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
            
            $params = [
                ':id' => $id,
                ':title' => $data['title'] ?? $data['chip_name'] . ' Pinout',
                ':chip_name' => sanitizeInput($data['chip_name']),
                ':category_id' => $data['category_id'],
                ':pin_count' => $data['pin_count'],
                ':left_pin_count' => $data['left_pin_count'],
                ':right_pin_count' => $data['right_pin_count'],
                ':symmetric_pins' => $data['symmetric_pins'] ? 1 : 0,
                ':board_height' => $data['board_height'],
                ':board_width' => $data['board_width'],
                ':background_type' => $data['background_type'] ?? 'default',
                ':background_image' => $data['background_image'],
                ':image_offset_x' => $data['image_offset_x'] ?? 0,
                ':image_offset_y' => $data['image_offset_y'] ?? 0,
                ':image_scale_x' => $data['image_scale_x'] ?? 300,
                ':image_scale_y' => $data['image_scale_y'] ?? 300,
                ':pin_number_color' => $data['pin_number_color'] ?? '#2c3e50',
                ':meta_description' => $data['meta_description'],
                ':page_content' => $data['page_content'],
                ':pin_data' => json_encode($data['pin_data']),
                ':svg_content' => $data['svg_content'],
                ':html_content' => $data['html_content']
            ];
            
            $stmt = $this->db->query($sql, $params);
            
            if ($stmt->rowCount() === 0) {
                sendError("Pinout not found", 404);
            }
            
            // Update pin data
            $this->deletePins($id);
            $this->insertPins($id, $data['pin_data']);
            
            $this->db->getConnection()->commit();
            
            return ['message' => 'Pinout updated successfully'];
        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            sendError("Failed to update pinout: " . $e->getMessage(), 500);
        }
    }
    
    // Delete a pinout
    public function deletePinout($id) {
        try {
            $sql = "DELETE FROM published_pinouts WHERE id = :id";
            $stmt = $this->db->query($sql, [':id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                sendError("Pinout not found", 404);
            }
            
            return ['message' => 'Pinout deleted successfully'];
        } catch (Exception $e) {
            sendError("Failed to delete pinout: " . $e->getMessage(), 500);
        }
    }
    
    // Get categories
    public function getCategories() {
        try {
            $sql = "SELECT * FROM categories ORDER BY display_name";
            $stmt = $this->db->query($sql);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            sendError("Failed to fetch categories: " . $e->getMessage(), 500);
        }
    }
    
    // Helper methods
    private function insertPins($pinout_id, $pins) {
        $sql = "INSERT INTO pinout_pins (pinout_id, pin_number, pin_name, pin_type, pin_side, pin_functions, pin_description, voltage_range)
                VALUES (:pinout_id, :pin_number, :pin_name, :pin_type, :pin_side, :pin_functions, :pin_description, :voltage_range)";
        
        foreach ($pins as $pin) {
            $params = [
                ':pinout_id' => $pinout_id,
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
    
    private function deletePins($pinout_id) {
        $sql = "DELETE FROM pinout_pins WHERE pinout_id = :pinout_id";
        $this->db->query($sql, [':pinout_id' => $pinout_id]);
    }
    
    private function incrementViewCount($pinout_id) {
        $sql = "UPDATE published_pinouts SET view_count = view_count + 1 WHERE id = :id";
        $this->db->query($sql, [':id' => $pinout_id]);
    }
}

// Handle API requests
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

$api = new PinoutAPI();

try {
    switch ($method) {
        case 'GET':
            if (isset($path_parts[2]) && is_numeric($path_parts[2])) {
                // Get specific pinout
                $pinout = $api->getPinout($path_parts[2]);
                sendResponse($pinout);
            } elseif (isset($path_parts[2]) && $path_parts[2] === 'categories') {
                // Get categories
                $categories = $api->getCategories();
                sendResponse($categories);
            } else {
                // Get all pinouts with filters
                $page = $_GET['page'] ?? 1;
                $limit = $_GET['limit'] ?? 10;
                $category = $_GET['category'] ?? null;
                $search = $_GET['search'] ?? null;
                
                $result = $api->getPinouts($page, $limit, $category, $search);
                sendResponse($result);
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $result = $api->createPinout($input);
            sendResponse($result, 201);
            break;
            
        case 'PUT':
            if (isset($path_parts[2]) && is_numeric($path_parts[2])) {
                $input = json_decode(file_get_contents('php://input'), true);
                $result = $api->updatePinout($path_parts[2], $input);
                sendResponse($result);
            } else {
                sendError("Invalid pinout ID", 400);
            }
            break;
            
        case 'DELETE':
            if (isset($path_parts[2]) && is_numeric($path_parts[2])) {
                $result = $api->deletePinout($path_parts[2]);
                sendResponse($result);
            } else {
                sendError("Invalid pinout ID", 400);
            }
            break;
            
        default:
            sendError("Method not allowed", 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
?>