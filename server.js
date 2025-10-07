const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Serve static files from the React app build directory (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Boards table
  db.run(`CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    manufacturer TEXT,
    package_type TEXT,
    pin_count INTEGER,
    voltage_range TEXT,
    clock_speed TEXT,
    flash_memory TEXT,
    ram TEXT,
    image_url TEXT,
    svg_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add pcb_svg_content column if it doesn't exist
  db.run(`ALTER TABLE boards ADD COLUMN pcb_svg_content TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding pcb_svg_content column:', err);
    } else {
      console.log('pcb_svg_content column added successfully');
    }
  });

  // Add published column if it doesn't exist
  db.run(`ALTER TABLE boards ADD COLUMN published BOOLEAN DEFAULT 1`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding published column:', err);
    } else {
      console.log('published column added successfully');
    }
  });

  // Add slug column if it doesn't exist
  db.run(`ALTER TABLE boards ADD COLUMN slug TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding slug column:', err);
    } else {
      console.log('slug column added successfully');
    }
  });

  // Add link column if it doesn't exist
  db.run(`ALTER TABLE boards ADD COLUMN link TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding link column:', err);
    } else {
      console.log('link column added successfully');
    }
  });

  // Add category column if it doesn't exist
  db.run(`ALTER TABLE boards ADD COLUMN category TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding category column:', err);
    } else {
      console.log('category column added successfully');
    }
  });

  // Add description column to wiring_guides if it doesn't exist
  db.run(`ALTER TABLE wiring_guides ADD COLUMN description TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding description column to wiring_guides:', err);
    } else {
      console.log('description column added to wiring_guides successfully');
    }
  });

  // Add slug column to wiring_guides if it doesn't exist
  db.run(`ALTER TABLE wiring_guides ADD COLUMN slug TEXT UNIQUE`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding slug column to wiring_guides:', err);
    } else {
      console.log('slug column added to wiring_guides successfully');
    }
  });

  // Add published column to wiring_guides if it doesn't exist
  db.run(`ALTER TABLE wiring_guides ADD COLUMN published BOOLEAN DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding published column to wiring_guides:', err);
    } else {
      console.log('published column added to wiring_guides successfully');
    }
  });

  // Wiring guides table
  db.run(`CREATE TABLE IF NOT EXISTS wiring_guides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_board_id INTEGER NOT NULL,
    microcontroller_board_id INTEGER NOT NULL,
    connections TEXT NOT NULL,
    svg_content TEXT,
    description TEXT,
    slug TEXT UNIQUE,
    published BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_board_id) REFERENCES boards (id),
    FOREIGN KEY (microcontroller_board_id) REFERENCES boards (id)
  )`);

  // Pin groups table
  db.run(`CREATE TABLE IF NOT EXISTS pin_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    description TEXT
  )`);

  // Pins table
  db.run(`CREATE TABLE IF NOT EXISTS pins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    pin_number TEXT NOT NULL,
    pin_name TEXT,
    pin_group_id INTEGER,
    functions TEXT,
    voltage_range TEXT,
    current_limit TEXT,
    description TEXT,
    position_x REAL,
    position_y REAL,
    FOREIGN KEY (board_id) REFERENCES boards (id),
    FOREIGN KEY (pin_group_id) REFERENCES pin_groups (id)
  )`);

  // Add svg_content column if it doesn't exist (migration)
  db.run(`ALTER TABLE boards ADD COLUMN svg_content TEXT`, (err) => {
    // Ignore error if column already exists
  });

  // Add alternate_functions column to pins table if it doesn't exist
  db.run(`ALTER TABLE pins ADD COLUMN alternate_functions TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding alternate_functions column:', err);
    } else {
      console.log('alternate_functions column added successfully');
    }
  });

  // Add svg_id column to pins table if it doesn't exist
  db.run(`ALTER TABLE pins ADD COLUMN svg_id TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding svg_id column:', err);
    } else {
      console.log('svg_id column added successfully');
    }
  });

  // Insert default pin groups
  const pinGroups = [
    { name: 'Power', color: '#ff6b6b', description: 'Power supply pins (VCC, GND, etc.)' },
    { name: 'Digital', color: '#4ecdc4', description: 'Digital I/O pins' },
    { name: 'Analog', color: '#45b7d1', description: 'Analog input pins' },
    { name: 'Communication', color: '#96ceb4', description: 'Serial, SPI, I2C communication pins' },
    { name: 'PWM', color: '#feca57', description: 'Pulse Width Modulation pins' },
    { name: 'Special', color: '#ff9ff3', description: 'Special function pins (reset, clock, etc.)' }
  ];

  pinGroups.forEach(group => {
    db.run(`INSERT OR IGNORE INTO pin_groups (name, color, description) VALUES (?, ?, ?)`,
      [group.name, group.color, group.description]);
  });

  // Insert sample Arduino UNO data
  insertArduinoUnoData();
  
  // Generate slugs for existing boards
  generateSlugsForExistingBoards();
}

// Generate slugs for existing boards that don't have them
function generateSlugsForExistingBoards() {
  db.all("SELECT id, name FROM boards WHERE slug IS NULL OR slug = ''", (err, rows) => {
    if (err) {
      console.error('Error fetching boards without slugs:', err);
      return;
    }
    
    if (rows.length === 0) {
      console.log('All boards already have slugs');
      return;
    }
    
    console.log(`Generating slugs for ${rows.length} boards...`);
    
    rows.forEach(row => {
      const slug = generateSlug(row.name);
      db.run("UPDATE boards SET slug = ? WHERE id = ?", [slug, row.id], (err) => {
        if (err) {
          console.error(`Error updating slug for board ${row.id}:`, err);
        } else {
          console.log(`Generated slug "${slug}" for board "${row.name}"`);
        }
      });
    });
  });
}

// Generate a URL-friendly slug from a board name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Insert Arduino UNO sample data
function insertArduinoUnoData() {
  // Check if Arduino UNO already exists
  db.get("SELECT id FROM boards WHERE name = 'Arduino UNO'", (err, row) => {
    if (err) {
      console.error('Error checking for Arduino UNO:', err);
      return;
    }
    
    if (row) {
      console.log('Arduino UNO data already exists');
      return;
    }

    // Insert Arduino UNO board
    db.run(`INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Arduino UNO', 'Popular microcontroller board based on ATmega328P', 'Arduino', 'DIP', 28, '5V', '16 MHz', '32 KB', '2 KB', '/images/arduino-uno.png', 'arduino-uno'],
      function(err) {
        if (err) {
          console.error('Error inserting Arduino UNO:', err);
          return;
        }
        
        const boardId = this.lastID;
        console.log('Arduino UNO board inserted with ID:', boardId);
        
        // Insert Arduino UNO pins
        const pins = [
          // Power pins
          { pin_number: '1', pin_name: 'GND', group: 'Power', functions: 'Ground', voltage_range: '0V', position_x: 50, position_y: 20 },
          { pin_number: '2', pin_name: '5V', group: 'Power', functions: 'Power Supply', voltage_range: '5V', position_x: 50, position_y: 40 },
          { pin_number: '3', pin_name: '3.3V', group: 'Power', functions: 'Power Supply', voltage_range: '3.3V', position_x: 50, position_y: 60 },
          { pin_number: '4', pin_name: 'VIN', group: 'Power', functions: 'Input Voltage', voltage_range: '7-12V', position_x: 50, position_y: 80 },
          
          // Digital pins
          { pin_number: '5', pin_name: 'D0', group: 'Communication', functions: 'RX', voltage_range: '0-5V', position_x: 100, position_y: 20 },
          { pin_number: '6', pin_name: 'D1', group: 'Communication', functions: 'TX', voltage_range: '0-5V', position_x: 100, position_y: 40 },
          { pin_number: '7', pin_name: 'D2', group: 'Digital', functions: 'Digital I/O, Interrupt', voltage_range: '0-5V', position_x: 100, position_y: 60 },
          { pin_number: '8', pin_name: 'D3', group: 'PWM', functions: 'Digital I/O, PWM, Interrupt', voltage_range: '0-5V', position_x: 100, position_y: 80 },
          { pin_number: '9', pin_name: 'D4', group: 'Digital', functions: 'Digital I/O', voltage_range: '0-5V', position_x: 100, position_y: 100 },
          { pin_number: '10', pin_name: 'D5', group: 'PWM', functions: 'Digital I/O, PWM', voltage_range: '0-5V', position_x: 100, position_y: 120 },
          { pin_number: '11', pin_name: 'D6', group: 'PWM', functions: 'Digital I/O, PWM', voltage_range: '0-5V', position_x: 100, position_y: 140 },
          { pin_number: '12', pin_name: 'D7', group: 'Digital', functions: 'Digital I/O', voltage_range: '0-5V', position_x: 100, position_y: 160 },
          { pin_number: '13', pin_name: 'D8', group: 'Digital', functions: 'Digital I/O, LED', voltage_range: '0-5V', position_x: 100, position_y: 180 },
          
          // Analog pins
          { pin_number: '14', pin_name: 'A0', group: 'Analog', functions: 'Analog Input', voltage_range: '0-5V', position_x: 150, position_y: 20 },
          { pin_number: '15', pin_name: 'A1', group: 'Analog', functions: 'Analog Input', voltage_range: '0-5V', position_x: 150, position_y: 40 },
          { pin_number: '16', pin_name: 'A2', group: 'Analog', functions: 'Analog Input', voltage_range: '0-5V', position_x: 150, position_y: 60 },
          { pin_number: '17', pin_name: 'A3', group: 'Analog', functions: 'Analog Input', voltage_range: '0-5V', position_x: 150, position_y: 80 },
          { pin_number: '18', pin_name: 'A4', group: 'Communication', functions: 'Analog Input, I2C SDA', voltage_range: '0-5V', position_x: 150, position_y: 100 },
          { pin_number: '19', pin_name: 'A5', group: 'Communication', functions: 'Analog Input, I2C SCL', voltage_range: '0-5V', position_x: 150, position_y: 120 },
          
          // Special pins
          { pin_number: '20', pin_name: 'RESET', group: 'Special', functions: 'Reset', voltage_range: '0-5V', position_x: 200, position_y: 20 },
          { pin_number: '21', pin_name: 'AREF', group: 'Special', functions: 'Analog Reference', voltage_range: '0-5V', position_x: 200, position_y: 40 },
          { pin_number: '22', pin_name: 'GND', group: 'Power', functions: 'Ground', voltage_range: '0V', position_x: 200, position_y: 60 },
          { pin_number: '23', pin_name: '5V', group: 'Power', functions: 'Power Supply', voltage_range: '5V', position_x: 200, position_y: 80 },
          { pin_number: '24', pin_name: '3.3V', group: 'Power', functions: 'Power Supply', voltage_range: '3.3V', position_x: 200, position_y: 100 },
          { pin_number: '25', pin_name: 'VIN', group: 'Power', functions: 'Input Voltage', voltage_range: '7-12V', position_x: 200, position_y: 120 },
          { pin_number: '26', pin_name: 'GND', group: 'Power', functions: 'Ground', voltage_range: '0V', position_x: 200, position_y: 140 },
          { pin_number: '27', pin_name: 'GND', group: 'Power', functions: 'Ground', voltage_range: '0V', position_x: 200, position_y: 160 },
          { pin_number: '28', pin_name: 'GND', group: 'Power', functions: 'Ground', voltage_range: '0V', position_x: 200, position_y: 180 }
        ];

        // Get pin group IDs
        db.all("SELECT id, name FROM pin_groups", (err, groups) => {
          if (err) {
            console.error('Error fetching pin groups:', err);
            return;
          }
          
          const groupMap = {};
          groups.forEach(group => {
            groupMap[group.name] = group.id;
          });

          // Insert pins
          pins.forEach(pin => {
            const groupId = groupMap[pin.group];
            db.run(`INSERT INTO pins (board_id, pin_number, pin_name, pin_group_id, functions, voltage_range, position_x, position_y) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [boardId, pin.pin_number, pin.pin_name, groupId, pin.functions, pin.voltage_range, pin.position_x, pin.position_y]);
          });
          
          console.log('Arduino UNO pins inserted successfully');
        });
      });
  });
}

// Admin routes (must come before regular API routes to avoid conflicts)
app.use('/api/admin', adminRoutes);

// API Routes

// Get all boards (only published for regular users)
app.get('/api/boards', (req, res) => {
  db.all("SELECT * FROM boards WHERE published = 1 ORDER BY name", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get multiple boards for comparison (must be before /api/boards/:id)
app.get('/api/boards/compare', (req, res) => {
  const { ids } = req.query;
  
  if (!ids) {
    res.status(400).json({ error: 'Board IDs are required' });
    return;
  }
  
  const identifiers = ids.split(',').map(id => id.trim()).filter(Boolean);
  
  if (identifiers.length === 0) {
    res.status(400).json({ error: 'At least one board ID is required' });
    return;
  }
  
  if (identifiers.length > 2) {
    res.status(400).json({ error: 'Maximum 2 boards can be compared at once' });
    return;
  }
  
  // Build WHERE clause to handle both numeric IDs and slugs
  const whereConditions = [];
  const params = [];
  
  identifiers.forEach(identifier => {
    const isNumeric = /^\d+$/.test(identifier);
    if (isNumeric) {
      whereConditions.push('id = ?');
      params.push(identifier);
    } else {
      whereConditions.push('slug = ?');
      params.push(identifier);
    }
  });
  
  const whereClause = whereConditions.join(' OR ');
  
  db.all(`SELECT * FROM boards WHERE (${whereClause}) AND published = 1 ORDER BY name`, 
    params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (rows.length === 0) {
      res.status(404).json({ error: 'No boards found' });
      return;
    }
    
    res.json(rows);
  });
});

// Get board by ID or slug (only published for regular users)
app.get('/api/boards/:id', (req, res) => {
  const identifier = req.params.id;
  
  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  const whereClause = isNumeric ? "id = ?" : "slug = ?";
  
  db.get(`SELECT * FROM boards WHERE ${whereClause} AND published = 1`, [identifier], (err, board) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }
    res.json(board);
  });
});

// Get pins for a board
app.get('/api/boards/:id/pins', (req, res) => {
  const identifier = req.params.id;
  
  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  
  if (isNumeric) {
    // Direct ID lookup
    db.all(`SELECT p.*, pg.name as group_name, pg.color as group_color 
            FROM pins p 
            LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id 
            WHERE p.board_id = ? 
            ORDER BY CAST(p.pin_number AS INTEGER)`, [identifier], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    // Slug lookup - first get board ID, then get pins
    db.get("SELECT id FROM boards WHERE slug = ? AND published = 1", [identifier], (err, board) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }
      
      db.all(`SELECT p.*, pg.name as group_name, pg.color as group_color 
              FROM pins p 
              LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id 
              WHERE p.board_id = ? 
              ORDER BY CAST(p.pin_number AS INTEGER)`, [board.id], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    });
  }
});

// Get all pin groups
app.get('/api/pin-groups', (req, res) => {
  db.all("SELECT * FROM pin_groups ORDER BY name", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get pin by ID
app.get('/api/pins/:id', (req, res) => {
  const pinId = req.params.id;
  
  db.get(`SELECT p.*, pg.name as group_name, pg.color as group_color 
          FROM pins p 
          LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id 
          WHERE p.id = ?`, [pinId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Pin not found' });
      return;
    }
    res.json(row);
  });
});



// Catch all handler: send back React's index.html file for any non-API routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // In development, just return a message for non-API routes
  app.get('*', (req, res) => {
    res.json({ 
      message: 'MicroPinouts API Server', 
      note: 'In development mode. React app should be running on port 3000.',
      api_endpoints: [
        'GET /api/boards',
        'GET /api/boards/:id',
        'GET /api/boards/:id/pins',
        'GET /api/pins/:id',
        'GET /api/pin-groups'
      ]
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

