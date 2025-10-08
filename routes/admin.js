const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const SVGProcessor = require('../utils/svgProcessor');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

// Generate a URL-friendly slug from a board name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many admin requests from this IP, please try again later.'
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only .fzpz files (Fritzing parts)
    const fileName = file.originalname.toLowerCase();
    if (file.mimetype === 'application/zip' || fileName.endsWith('.fzpz')) {
      cb(null, true);
    } else {
      cb(new Error('Only .fzpz files are allowed'), false);
    }
  }
});

// Simple admin authentication (in production, use proper auth)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin login
router.post('/login', adminLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      message: 'Login successful',
      admin: { username: ADMIN_USERNAME }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all boards (admin view with additional info)
router.get('/boards', verifyAdminToken, (req, res) => {
  const db = new sqlite3.Database('./database.sqlite');
  
  db.all(`
    SELECT b.*, 
           COUNT(p.id) as pin_count,
           GROUP_CONCAT(DISTINCT pg.name) as pin_groups
    FROM boards b
    LEFT JOIN pins p ON b.id = p.board_id
    LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching boards:', err);
      res.status(500).json({ error: 'Failed to fetch boards' });
    } else {
      res.json(rows);
    }
    db.close();
  });
});

// Create new board
router.post('/boards', verifyAdminToken, (req, res) => {
  const {
    name,
    description,
    manufacturer,
    package_type,
    pin_count,
    voltage_range,
    clock_speed,
    flash_memory,
    ram,
    image_url,
    link,
    category 
  } = req.body;

  const slug = generateSlug(name);
  const db = new sqlite3.Database('./database.sqlite');
  
  db.run(`
    INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug, link, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug, link, category], 
  function(err) {
    if (err) {
      console.error('Error creating board:', err);
      res.status(500).json({ error: 'Failed to create board' });
    } else {
      res.json({ 
        id: this.lastID,
        slug: slug,
        message: 'Board created successfully'
      });
    }
    db.close();
  });
});

// Update board
router.put('/boards/:id', verifyAdminToken, (req, res) => {
  const identifier = req.params.id;
  const {
    name,
    description,
    manufacturer,
    package_type,
    pin_count,
    voltage_range,
    clock_speed,
    flash_memory,
    ram,
    image_url,
    link,
    category
  } = req.body;

  const slug = generateSlug(name);
  const db = new sqlite3.Database('./database.sqlite');
  
  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  const whereClause = isNumeric ? "id = ?" : "slug = ?";
  
  db.run(`
    UPDATE boards 
    SET name = ?, description = ?, manufacturer = ?, package_type = ?, pin_count = ?, 
        voltage_range = ?, clock_speed = ?, flash_memory = ?, ram = ?, image_url = ?, slug = ?, link = ?, category = ?
    WHERE ${whereClause}
  `, [name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug, link, category, identifier], 
  function(err) {
    if (err) {
      console.error('Error updating board:', err);
      res.status(500).json({ error: 'Failed to update board' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Board not found' });
    } else {
      res.json({ 
        message: 'Board updated successfully',
        slug: slug
      });
    }
    db.close();
  });
});

// Delete board
router.delete('/boards/:id', verifyAdminToken, (req, res) => {
  const identifier = req.params.id;
  const db = new sqlite3.Database('./database.sqlite');
  
  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  
  if (isNumeric) {
    // Direct ID lookup
    // First delete all pins for this board
    db.run('DELETE FROM pins WHERE board_id = ?', [identifier], (err) => {
      if (err) {
        console.error('Error deleting pins:', err);
        res.status(500).json({ error: 'Failed to delete board pins' });
        db.close();
        return;
      }
      
      // Then delete the board
      db.run('DELETE FROM boards WHERE id = ?', [identifier], function(err) {
        if (err) {
          console.error('Error deleting board:', err);
          res.status(500).json({ error: 'Failed to delete board' });
        } else if (this.changes === 0) {
          res.status(404).json({ error: 'Board not found' });
        } else {
          res.json({ message: 'Board deleted successfully' });
        }
        db.close();
      });
    });
  } else {
    // Slug lookup - first get board ID, then delete
    db.get('SELECT id FROM boards WHERE slug = ?', [identifier], (err, board) => {
      if (err) {
        console.error('Error fetching board:', err);
        res.status(500).json({ error: 'Failed to fetch board' });
        db.close();
        return;
      }
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        db.close();
        return;
      }
      
      // First delete all pins for this board
      db.run('DELETE FROM pins WHERE board_id = ?', [board.id], (err) => {
        if (err) {
          console.error('Error deleting pins:', err);
          res.status(500).json({ error: 'Failed to delete board pins' });
          db.close();
          return;
        }
        
        // Then delete the board
        db.run('DELETE FROM boards WHERE id = ?', [board.id], function(err) {
          if (err) {
            console.error('Error deleting board:', err);
            res.status(500).json({ error: 'Failed to delete board' });
          } else if (this.changes === 0) {
            res.status(404).json({ error: 'Board not found' });
          } else {
            res.json({ message: 'Board deleted successfully' });
          }
          db.close();
        });
      });
    });
  }
});

// Upload and parse Fritzing/SVG file
router.post('/upload-fritzing', verifyAdminToken, upload.single('fritzingFile'), async (req, res) => {
  const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileType = fileExt === '.svg' ? 'SVG' : 'Fritzing';
    
    console.log(`[${requestId}] Processing ${fileType} file:`, req.file.originalname);
    const processor = new SVGProcessor();
    const result = await processor.processFritzingFile(req.file.path);
    
    console.log(`[${requestId}] Parsing result:`, {
      totalPins: result.totalPins,
      viewType: result.viewType,
      pinsCount: result.pins ? result.pins.length : 0,
      hasDisplaySVG: !!result.displaySVG,
      sourceFiles: result.sourceFiles,
      hasBoardMetadata: !!result.boardMetadata,
      boardMetadata: result.boardMetadata
    });
    
    if (result.pins && result.pins.length > 0) {
      console.log('First few pins:', result.pins.slice(0, 5).map(pin => ({
        number: pin.pin_number,
        name: pin.pin_name,
        position: `(${pin.position_x}, ${pin.position_y})`,
        mapped: pin.mapped_from_breadboard
      })));
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    const response = {
      message: `${fileType} file parsed successfully`,
      data: result,
      filename: req.file.originalname,
      fileType: fileType,
      requestId: requestId
    };
    
    console.log(`[${requestId}] Sending response:`, {
      message: response.message,
      dataPins: response.data.pins ? response.data.pins.length : 0,
      dataTotalPins: response.data.totalPins,
      hasDisplaySVG: !!response.data.displaySVG,
      hasBoardMetadata: !!response.data.boardMetadata,
      boardMetadataTitle: response.data.boardMetadata?.title
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error parsing file:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to parse file',
      details: error.message 
    });
  }
});

// Test endpoint to simulate Fritzing data (for testing without real .fzpz files)
router.post('/test-fritzing-data', verifyAdminToken, (req, res) => {
  const testData = {
    pins: [
      {
        pin_number: "1",
        pin_name: "5V",
        position_x: 50,
        position_y: 20,
        functions: "Power Supply",
        voltage_range: "5V",
        group: "Power"
      },
      {
        pin_number: "2",
        pin_name: "GND",
        position_x: 50,
        position_y: 40,
        functions: "Ground",
        voltage_range: "0V",
        group: "Power"
      },
      {
        pin_number: "3",
        pin_name: "D2",
        position_x: 100,
        position_y: 20,
        functions: "Digital I/O",
        voltage_range: "0-5V",
        group: "Digital"
      },
      {
        pin_number: "4",
        pin_name: "A0",
        position_x: 100,
        position_y: 40,
        functions: "Analog Input",
        voltage_range: "0-5V",
        group: "Analog"
      }
    ],
    totalPins: 4,
    viewType: "schematic",
    boardMetadata: {
      title: "Test Arduino Uno",
      description: "A test Arduino Uno board for development and testing purposes. This is a sample board with basic GPIO pins, power pins, and analog inputs.",
      author: "Test Author",
      date: "2024-01-01",
      manufacturer: "Arduino",
      package_type: "DIP",
      voltage_range: "5V",
      clock_speed: "16MHz",
      flash_memory: "32KB",
      ram: "2KB"
    }
  };

  res.json({
    message: 'Test Fritzing data generated',
    data: testData
  });
});

// Create board from Fritzing data
router.post('/boards/from-fritzing', verifyAdminToken, async (req, res) => {
  try {
    const {
      boardData,
      fritzingData
    } = req.body;

    console.log('Creating board from Fritzing data:');
    console.log('Board data:', boardData);
    console.log('Fritzing data keys:', Object.keys(fritzingData));
    console.log('Has displaySVG:', !!fritzingData.displaySVG);
    console.log('DisplaySVG length:', fritzingData.displaySVG ? fritzingData.displaySVG.length : 0);

    const db = new sqlite3.Database('./database.sqlite');
    
    // Create the board
    const svgContent = fritzingData.displaySVG || null;
    const slug = generateSlug(boardData.name);
    console.log('Storing SVG content length:', svgContent ? svgContent.length : 0);
    console.log('Generated slug:', slug);
    
    db.run(`
      INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, svg_content, slug, link, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      boardData.name,
      boardData.description,
      boardData.manufacturer,
      boardData.package_type,
      fritzingData.totalPins,
      boardData.voltage_range,
      boardData.clock_speed,
      boardData.flash_memory,
      boardData.ram,
      boardData.image_url,
      svgContent,
      slug,
      boardData.link,
      boardData.category || 'custom-other'
    ], function(err) {
      if (err) {
        console.error('Error creating board:', err);
        res.status(500).json({ error: 'Failed to create board' });
        db.close();
        return;
      }

      const boardId = this.lastID;
      
      // Get pin group IDs
      db.all("SELECT id, name FROM pin_groups", (err, groups) => {
        if (err) {
          console.error('Error fetching pin groups:', err);
          res.status(500).json({ error: 'Failed to fetch pin groups' });
          db.close();
          return;
        }
        
        const groupMap = {};
        groups.forEach(group => {
          groupMap[group.name] = group.id;
        });

        // Insert pins
        if (!fritzingData.pins || !Array.isArray(fritzingData.pins)) {
          console.error('Invalid fritzing data:', fritzingData);
          res.status(400).json({ error: 'Invalid Fritzing data: pins array is missing or invalid' });
          db.close();
          return;
        }

        const pinPromises = fritzingData.pins.map(pin => {
          return new Promise((resolve, reject) => {
            const groupId = groupMap[pin.group_name] || groupMap['Digital'];
            
            db.run(`
              INSERT INTO pins (board_id, pin_number, pin_name, pin_group_id, functions, voltage_range, position_x, position_y, svg_id, alternate_functions)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              boardId,
              pin.pin_number,
              pin.pin_name,
              groupId,
              pin.functions,
              pin.voltage_range,
              pin.position_x,
              pin.position_y,
              pin.svg_id || null,
              pin.alternate_functions || null
            ], (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(pinPromises)
          .then(() => {
            res.json({
              message: 'Board created successfully from Fritzing data',
              boardId: boardId,
              slug: slug,
              pinCount: fritzingData.pins.length
            });
            db.close();
          })
          .catch((error) => {
            console.error('Error inserting pins:', error);
            res.status(500).json({ error: 'Failed to insert pins' });
            db.close();
          });
      });
    });
  } catch (error) {
    console.error('Error creating board from Fritzing:', error);
    res.status(500).json({ 
      error: 'Failed to create board from Fritzing data',
      details: error.message 
    });
  }
});

// Get single board by ID
router.get('/boards/:id', verifyAdminToken, (req, res) => {
  const identifier = req.params.id;
  const db = new sqlite3.Database('./database.sqlite');
  
  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  const whereClause = isNumeric ? "id = ?" : "slug = ?";
  
  db.get(`
    SELECT * FROM boards WHERE ${whereClause}
  `, [identifier], (err, row) => {
    if (err) {
      console.error('Error fetching board:', err);
      res.status(500).json({ error: 'Failed to fetch board' });
    } else if (!row) {
      res.status(404).json({ error: 'Board not found' });
    } else {
      console.log('Retrieved board:', {
        id: row.id,
        name: row.name,
        hasSvgContent: !!row.svg_content,
        svgContentLength: row.svg_content ? row.svg_content.length : 0
      });
      res.json(row);
    }
    db.close();
  });
});

// Get board pins for editing
router.get('/boards/:id/pins', verifyAdminToken, (req, res) => {
  const identifier = req.params.id;
  const db = new sqlite3.Database('./database.sqlite');
  
  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  
  if (isNumeric) {
    // Direct ID lookup
    db.all(`
      SELECT p.*, pg.name as group_name, pg.color as group_color
      FROM pins p
      LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id
      WHERE p.board_id = ?
      ORDER BY CAST(p.pin_number AS INTEGER)
    `, [identifier], (err, rows) => {
      if (err) {
        console.error('Error fetching pins:', err);
        res.status(500).json({ error: 'Failed to fetch pins' });
      } else {
        res.json(rows);
      }
      db.close();
    });
  } else {
    // Slug lookup - first get board ID, then get pins
    db.get("SELECT id FROM boards WHERE slug = ?", [identifier], (err, board) => {
      if (err) {
        console.error('Error fetching board:', err);
        res.status(500).json({ error: 'Failed to fetch board' });
        db.close();
        return;
      }
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        db.close();
        return;
      }
      
      db.all(`
        SELECT p.*, pg.name as group_name, pg.color as group_color
        FROM pins p
        LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id
        WHERE p.board_id = ?
        ORDER BY CAST(p.pin_number AS INTEGER)
      `, [board.id], (err, rows) => {
        if (err) {
          console.error('Error fetching pins:', err);
          res.status(500).json({ error: 'Failed to fetch pins' });
        } else {
          res.json(rows);
        }
        db.close();
      });
    });
  }
});

// Function to update SVG content with current pin group information
function updateBoardSVGContent(boardId, db) {
  return new Promise((resolve, reject) => {
    // Get board SVG content
    db.get('SELECT svg_content FROM boards WHERE id = ?', [boardId], (err, board) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!board || !board.svg_content) {
        resolve(); // No SVG content to update
        return;
      }
      
      // Get all pins with their group information
      db.all(`
        SELECT p.*, pg.name as group_name, pg.color as group_color
        FROM pins p
        LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id
        WHERE p.board_id = ?
      `, [boardId], (err, pins) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          // Parse the SVG
          const { DOMParser, XMLSerializer } = require('xmldom');
          const parser = new DOMParser();
          const serializer = new XMLSerializer();
          const svgDoc = parser.parseFromString(board.svg_content, 'image/svg+xml');
          
          // Update pin colors and positions based on current data
          pins.forEach(pin => {
            if (pin.svg_id) {
              const elem = svgDoc.getElementById(pin.svg_id);
              if (elem) {
                // Update the group class
                const groupName = pin.group_name || 'Other';
                const groupColor = pin.group_color || '#64748b';
                
                elem.setAttribute('class', `pin-hole group-${groupName.toLowerCase()}`);
                elem.setAttribute('data-group', groupName);
                elem.setAttribute('data-group-color', groupColor);
                elem.setAttribute('stroke', groupColor);
                
                // Update pin position if available
                if (pin.position_x !== null && pin.position_x !== undefined) {
                  elem.setAttribute('x', pin.position_x.toString());
                }
                if (pin.position_y !== null && pin.position_y !== undefined) {
                  elem.setAttribute('y', pin.position_y.toString());
                }
                
                // Update pin name in data attributes
                elem.setAttribute('data-pin', pin.pin_name);
                
                // Update tooltip
                const title = elem.getElementsByTagName('title')[0];
                if (title) {
                  title.textContent = `${pin.pin_name} (${groupName})`;
                }
              }
            }
          });
          
          // Serialize back to string
          const updatedSVG = serializer.serializeToString(svgDoc);
          
          // Update the board's SVG content
          db.run('UPDATE boards SET svg_content = ? WHERE id = ?', [updatedSVG, boardId], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

// Update pin
router.put('/pins/:id', verifyAdminToken, (req, res) => {
  const pinId = req.params.id;
  const {
    pin_name,
    pin_group_id,
    functions,
    voltage_range,
    current_limit,
    description,
    position_x,
    position_y,
    alternate_functions
  } = req.body;

  const db = new sqlite3.Database('./database.sqlite');
  
  db.run(`
    UPDATE pins 
    SET pin_name = ?, pin_group_id = ?, functions = ?, voltage_range = ?, 
        current_limit = ?, description = ?, position_x = ?, position_y = ?, alternate_functions = ?
    WHERE id = ?
  `, [pin_name, pin_group_id, functions, voltage_range, current_limit, description, position_x, position_y, alternate_functions, pinId], 
  function(err) {
    if (err) {
      console.error('Error updating pin:', err);
      res.status(500).json({ error: 'Failed to update pin' });
      db.close();
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Pin not found' });
      db.close();
    } else {
      // Get the board_id for this pin to update SVG content
      db.get('SELECT board_id FROM pins WHERE id = ?', [pinId], (err, pin) => {
        if (err) {
          console.error('Error getting board_id:', err);
          res.json({ message: 'Pin updated successfully (SVG not updated)' });
          db.close();
          return;
        }
        
        // Update SVG content with new pin group information
        updateBoardSVGContent(pin.board_id, db)
          .then(() => {
            console.log('SVG content updated successfully for board', pin.board_id);
            res.json({ message: 'Pin updated successfully' });
            db.close();
          })
          .catch((svgErr) => {
            console.error('Error updating SVG content:', svgErr);
            res.json({ message: 'Pin updated successfully (SVG update failed)' });
            db.close();
          });
      });
    }
  });
});

// Delete pin
router.delete('/pins/:id', verifyAdminToken, (req, res) => {
  const pinId = req.params.id;
  const db = new sqlite3.Database('./database.sqlite');
  
  db.run('DELETE FROM pins WHERE id = ?', [pinId], function(err) {
    if (err) {
      console.error('Error deleting pin:', err);
      res.status(500).json({ error: 'Failed to delete pin' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Pin not found' });
    } else {
      res.json({ message: 'Pin deleted successfully' });
    }
    db.close();
  });
});

// Update board SVG content (manual trigger)
router.post('/boards/:id/update-svg', verifyAdminToken, (req, res) => {
  const boardId = req.params.id;
  const db = new sqlite3.Database('./database.sqlite');
  
  updateBoardSVGContent(boardId, db)
    .then(() => {
      res.json({ message: 'SVG content updated successfully' });
      db.close();
    })
    .catch((err) => {
      console.error('Error updating SVG content:', err);
      res.status(500).json({ error: 'Failed to update SVG content' });
      db.close();
    });
});

// Get all pin groups
router.get('/pin-groups', verifyAdminToken, (req, res) => {
  const db = new sqlite3.Database('./database.sqlite');
  
  db.all("SELECT * FROM pin_groups ORDER BY name", (err, rows) => {
    if (err) {
      console.error('Error fetching pin groups:', err);
      res.status(500).json({ error: 'Failed to fetch pin groups' });
    } else {
      res.json(rows);
    }
    db.close();
  });
});

// Get available board categories
router.get('/categories', verifyAdminToken, (req, res) => {
  const categories = [
    { key: 'microcontroller-8bit', name: 'Microcontroller (8-bit)', icon: '🔧', color: '#3498db' },
    { key: 'microcontroller-16bit', name: 'Microcontroller (16-bit)', icon: '⚙️', color: '#9b59b6' },
    { key: 'microcontroller-32bit', name: 'Microcontroller (32-bit)', icon: '🔩', color: '#e74c3c' },
    { key: 'development-board', name: 'Development Board', icon: '📱', color: '#27ae60' },
    { key: 'sensor-module', name: 'Sensor & Module', icon: '📡', color: '#f39c12' },
    { key: 'communication-ic', name: 'Communication IC', icon: '📶', color: '#1abc9c' },
    { key: 'power-management', name: 'Power Management', icon: '⚡', color: '#e67e22' },
    { key: 'memory-storage', name: 'Memory & Storage', icon: '💾', color: '#34495e' },
    { key: 'custom-other', name: 'Custom/Other', icon: '🔧', color: '#95a5a6' }
  ];
  
  res.json(categories);
});

// Bulk update board categories based on name patterns
router.post('/boards/bulk-update-categories', verifyAdminToken, (req, res) => {
  const db = new sqlite3.Database('./database.sqlite');
  
  const updates = [
    // Arduino boards -> development-board
    { pattern: '%arduino%', category: 'development-board' },
    // ESP boards -> microcontroller-32bit
    { pattern: '%esp%', category: 'microcontroller-32bit' },
    // Raspberry Pi -> development-board
    { pattern: '%raspberry%', category: 'development-board' },
    // Sensor/Module/Shield -> sensor-module
    { pattern: '%sensor%', category: 'sensor-module' },
    { pattern: '%module%', category: 'sensor-module' },
    { pattern: '%shield%', category: 'sensor-module' }
  ];
  
  let completed = 0;
  let total = updates.length;
  
  updates.forEach(update => {
    db.run('UPDATE boards SET category = ? WHERE name LIKE ? AND (category IS NULL OR category = "")', 
      [update.category, update.pattern], function(err) {
        if (err) {
          console.error('Error updating categories:', err);
        } else {
          console.log(`Updated ${this.changes} boards with pattern "${update.pattern}" to category "${update.category}"`);
        }
        completed++;
        if (completed === total) {
          db.close();
          res.json({ message: 'Bulk category update completed' });
        }
      });
  });
});

// Create new pin group
router.post('/pin-groups', verifyAdminToken, (req, res) => {
  const { name, color, description } = req.body;
  const db = new sqlite3.Database('./database.sqlite');
  
  db.run(`
    INSERT INTO pin_groups (name, color, description)
    VALUES (?, ?, ?)
  `, [name, color, description], function(err) {
    if (err) {
      console.error('Error creating pin group:', err);
      res.status(500).json({ error: 'Failed to create pin group' });
    } else {
      res.json({ 
        id: this.lastID,
        message: 'Pin group created successfully'
      });
    }
    db.close();
  });
});

// Publish/Unpublish board
router.put('/boards/:id/publish', verifyAdminToken, (req, res) => {
  const identifier = req.params.id;
  const { published } = req.body;
  
  const db = new sqlite3.Database('./database.sqlite');
  
  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  const whereClause = isNumeric ? "id = ?" : "slug = ?";
  
  db.run(`UPDATE boards SET published = ? WHERE ${whereClause}`, [published ? 1 : 0, identifier], function(err) {
    if (err) {
      console.error('Error updating board publish status:', err);
      res.status(500).json({ error: 'Failed to update board publish status' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Board not found' });
    } else {
      res.json({ 
        message: `Board ${published ? 'published' : 'unpublished'} successfully`,
        published: published
      });
    }
    db.close();
  });
});

// Wiring Guide Routes

// Get boards by category for wiring guide
router.get('/wiring-guide/boards', verifyAdminToken, (req, res) => {
  const { category } = req.query;
  const db = new sqlite3.Database('./database.sqlite');
  
  let query = 'SELECT * FROM boards WHERE published = 1';
  let params = [];
  
  if (category) {
    // Handle multiple categories separated by commas
    const categories = category.split(',').map(cat => cat.trim());
    if (categories.length === 1) {
      query += ' AND category = ?';
      params.push(category);
    } else {
      const placeholders = categories.map(() => '?').join(',');
      query += ` AND category IN (${placeholders})`;
      params.push(...categories);
    }
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching boards:', err);
      res.status(500).json({ error: 'Failed to fetch boards' });
    } else {
      // If no boards found by category and we're looking for specific types, fall back to name-based filtering
      if (rows.length === 0 && category) {
        const categories = category.split(',').map(cat => cat.trim());
        const isLookingForSensors = categories.some(cat => cat === 'sensor-module');
        const isLookingForMicrocontrollers = categories.some(cat => 
          ['microcontroller-8bit', 'microcontroller-16bit', 'microcontroller-32bit', 'development-board'].includes(cat)
        );
        
        if (isLookingForSensors || isLookingForMicrocontrollers) {
          // Fallback to name-based filtering
          let fallbackQuery = 'SELECT * FROM boards WHERE published = 1 AND (';
          let fallbackParams = [];
          
          if (isLookingForSensors) {
            fallbackQuery += 'name LIKE ? OR name LIKE ? OR name LIKE ?';
            fallbackParams.push('%sensor%', '%module%', '%shield%');
          }
          
          if (isLookingForSensors && isLookingForMicrocontrollers) {
            fallbackQuery += ' OR ';
          }
          
          if (isLookingForMicrocontrollers) {
            fallbackQuery += 'name LIKE ? OR name LIKE ? OR name LIKE ? OR name LIKE ? OR name LIKE ?';
            fallbackParams.push('%arduino%', '%esp%', '%raspberry%', '%microcontroller%', '%board%');
          }
          
          fallbackQuery += ') ORDER BY name';
          
          db.all(fallbackQuery, fallbackParams, (fallbackErr, fallbackRows) => {
            if (fallbackErr) {
              console.error('Error in fallback query:', fallbackErr);
              res.status(500).json({ error: 'Failed to fetch boards' });
            } else {
              res.json(fallbackRows);
            }
            db.close();
          });
          return;
        }
      }
      
      res.json(rows);
    }
    db.close();
  });
});

// Generate wiring guide SVG
router.post('/wiring-guide/generate', verifyAdminToken, async (req, res) => {
  try {
    const { sensorBoardId, microcontrollerBoardId, connections, description } = req.body;
    
    if (!sensorBoardId || !microcontrollerBoardId || !connections || connections.length === 0) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const db = new sqlite3.Database('./database.sqlite');
    
    // Get both boards and their pins
    const getBoardData = (boardId) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM boards WHERE id = ?', [boardId], (err, board) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!board) {
            reject(new Error('Board not found'));
            return;
          }
          
          // Get pins for this board
          db.all(`
            SELECT p.*, pg.name as group_name, pg.color as group_color
            FROM pins p
            LEFT JOIN pin_groups pg ON p.pin_group_id = pg.id
            WHERE p.board_id = ?
            ORDER BY CAST(p.pin_number AS INTEGER)
          `, [boardId], (err, pins) => {
            if (err) {
              reject(err);
              return;
            }
            
            resolve({ board, pins });
          });
        });
      });
    };
    
    // Get data for both boards
    const [sensorData, microcontrollerData] = await Promise.all([
      getBoardData(sensorBoardId),
      getBoardData(microcontrollerBoardId)
    ]);
    
    // Generate combined SVG with wiring connections
    const wiringGuideSVG = generateWiringGuideSVG(sensorData, microcontrollerData, connections);
    
    // Save the wiring guide to database
    const wiringGuideId = await saveWiringGuide({
      sensorBoardId,
      microcontrollerBoardId,
      connections,
      svgContent: wiringGuideSVG,
      description: description || '',
      sensorBoard: sensorData.board,
      microcontrollerBoard: microcontrollerData.board
    }, db);
    
    // Generate slug for response
    const sensorSlug = sensorData.board.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const microSlug = microcontrollerData.board.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${sensorSlug}-to-${microSlug}`;
    
    db.close();
    
    res.json({
      message: 'Wiring guide generated successfully',
      wiringGuideId: wiringGuideId,
      slug: slug,
      svgContent: wiringGuideSVG,
      sensorBoard: sensorData.board,
      microcontrollerBoard: microcontrollerData.board,
      connections: connections
    });
    
  } catch (error) {
    console.error('Error generating wiring guide:', error);
    res.status(500).json({ 
      error: 'Failed to generate wiring guide',
      details: error.message 
    });
  }
});

// Get individual wiring guide by slug (public endpoint - only published)
router.get('/wiring-guide/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const db = new sqlite3.Database('./database.sqlite');
    
    const wiringGuide = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          wg.*,
          sb.name as sensor_name,
          sb.slug as sensor_slug,
          mb.name as microcontroller_name,
          mb.slug as microcontroller_slug
        FROM wiring_guides wg
        JOIN boards sb ON wg.sensor_board_id = sb.id
        JOIN boards mb ON wg.microcontroller_board_id = mb.id
        WHERE wg.slug = ? AND wg.published = 1
      `, [slug], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!wiringGuide) {
      db.close();
      return res.status(404).json({ error: 'Wiring guide not found' });
    }
    
    // Parse connections JSON
    const connections = JSON.parse(wiringGuide.connections);
    
    // Resolve pin IDs to pin names
    const resolvedConnections = await Promise.all(connections.map(async (connection) => {
      const [sensorPin, microcontrollerPin] = await Promise.all([
        new Promise((resolve, reject) => {
          db.get('SELECT pin_name FROM pins WHERE id = ?', [connection.sensorPin], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.pin_name : connection.sensorPin);
          });
        }),
        new Promise((resolve, reject) => {
          db.get('SELECT pin_name FROM pins WHERE id = ?', [connection.microcontrollerPin], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.pin_name : connection.microcontrollerPin);
          });
        })
      ]);
      
      return {
        sensorPin: sensorPin,
        microcontrollerPin: microcontrollerPin
      };
    }));
    
    wiringGuide.connections = resolvedConnections;
    
    db.close();
    res.json(wiringGuide);
  } catch (error) {
    console.error('Error fetching wiring guide:', error);
    res.status(500).json({ error: 'Failed to fetch wiring guide' });
  }
});

// Get wiring guide by ID
router.get('/wiring-guide/:id', verifyAdminToken, (req, res) => {
  const wiringGuideId = req.params.id;
  const db = new sqlite3.Database('./database.sqlite');
  
  db.get(`
    SELECT wg.*, 
           sb.name as sensor_board_name, sb.manufacturer as sensor_board_manufacturer,
           mb.name as microcontroller_board_name, mb.manufacturer as microcontroller_board_manufacturer
    FROM wiring_guides wg
    LEFT JOIN boards sb ON wg.sensor_board_id = sb.id
    LEFT JOIN boards mb ON wg.microcontroller_board_id = mb.id
    WHERE wg.id = ?
  `, [wiringGuideId], (err, row) => {
    if (err) {
      console.error('Error fetching wiring guide:', err);
      res.status(500).json({ error: 'Failed to fetch wiring guide' });
    } else if (!row) {
      res.status(404).json({ error: 'Wiring guide not found' });
    } else {
      res.json(row);
    }
    db.close();
  });
});

// List all wiring guides

// Helper function to generate wiring guide SVG
function generateWiringGuideSVG(sensorData, microcontrollerData, connections) {
  const { board: sensorBoard, pins: sensorPins } = sensorData;
  const { board: microcontrollerBoard, pins: microcontrollerPins } = microcontrollerData;
  
  // Create a map of pin IDs to pin data for quick lookup
  const sensorPinMap = new Map(sensorPins.map(pin => [pin.id, pin]));
  const microcontrollerPinMap = new Map(microcontrollerPins.map(pin => [pin.id, pin]));
  
  // Calculate board dimensions and positions
  const sensorDimensions = getSVGDimensions(sensorBoard.svg_content);
  const microcontrollerDimensions = getSVGDimensions(microcontrollerBoard.svg_content);
  
  // No rotation - use boards as-is
  const sensorRotation = 0;
  
  // Set default dimensions if not available
  const sensorWidth = sensorDimensions.width || 200;
  const sensorHeight = sensorDimensions.height || 150;
  const microcontrollerWidth = microcontrollerDimensions.width || 200;
  const microcontrollerHeight = microcontrollerDimensions.height || 150;
  
  // Calculate spacing and positions with larger scale
  const scale = 2.5; // Scale up the boards for better visibility
  
  // Calculate effective sensor board dimensions (no rotation)
  const effectiveSensorWidth = sensorWidth * scale;
  const effectiveSensorHeight = sensorHeight * scale;
  
  const scaledMicrocontrollerWidth = microcontrollerWidth * scale;
  const scaledMicrocontrollerHeight = microcontrollerHeight * scale;
  
  const boardSpacing = Math.max(300, (effectiveSensorWidth + scaledMicrocontrollerWidth) * 0.4);
  const padding = 80;
  const sensorX = padding;
  const microcontrollerX = sensorX + effectiveSensorWidth + boardSpacing;
  const boardY = padding;
  
  // Calculate actual board bounds to determine required canvas size
  // For sensor board, use simple positioning (no rotation)
  const sensorBoardBounds = {
    left: sensorX,
    right: sensorX + effectiveSensorWidth,
    top: boardY,
    bottom: boardY + effectiveSensorHeight
  };
  
  // Microcontroller board bounds
  const microcontrollerBoardBounds = {
    left: microcontrollerX,
    right: microcontrollerX + scaledMicrocontrollerWidth,
    top: boardY,
    bottom: boardY + scaledMicrocontrollerHeight
  };
  
  // Calculate required canvas dimensions based on actual board positions
  const minX = Math.min(sensorBoardBounds.left, microcontrollerBoardBounds.left);
  const maxX = Math.max(sensorBoardBounds.right, microcontrollerBoardBounds.right);
  const minY = Math.min(sensorBoardBounds.top, microcontrollerBoardBounds.top);
  const maxY = Math.max(sensorBoardBounds.bottom, microcontrollerBoardBounds.bottom);
  
  // Ensure we have enough space for both boards with proper padding
  // If any board extends beyond the current bounds, adjust the canvas size
  const requiredWidth = Math.max(
    effectiveSensorWidth + scaledMicrocontrollerWidth + boardSpacing + (padding * 2),
    (maxX - minX) + (padding * 2)
  );
  
  const requiredHeight = Math.max(
    Math.max(effectiveSensorHeight, scaledMicrocontrollerHeight) + (padding * 2) + 120,
    (maxY - minY) + (padding * 2) + 120
  );
  
  const totalWidth = requiredWidth;
  const totalHeight = requiredHeight;
  
  // Debug logging to verify dimensions
  console.log(`SVG Dimensions - Width: ${totalWidth}, Height: ${totalHeight}`);
  console.log(`Sensor board: ${effectiveSensorWidth}x${effectiveSensorHeight} (rotation: ${sensorRotation}°)`);
  console.log(`Microcontroller board: ${scaledMicrocontrollerWidth}x${scaledMicrocontrollerHeight}`);
  console.log(`Sensor board bounds: left=${sensorBoardBounds.left}, right=${sensorBoardBounds.right}, top=${sensorBoardBounds.top}, bottom=${sensorBoardBounds.bottom}`);
  console.log(`Microcontroller board bounds: left=${microcontrollerBoardBounds.left}, right=${microcontrollerBoardBounds.right}, top=${microcontrollerBoardBounds.top}, bottom=${microcontrollerBoardBounds.bottom}`);
  console.log(`Required width: ${requiredWidth}, Required height: ${requiredHeight}`);
  
  // Start building the SVG with calculated dimensions
  let svg = `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}">
    <defs>
      <style>
        .wire { stroke-width: 3; fill: none; }
        .wire-power { stroke: #dc2626; } /* Red for VCC/5V/3.3V */
        .wire-ground { stroke: #000000; } /* Black for GND */
        .wire-signal { stroke: #3b82f6; } /* Blue for other pins */
        .connection-label { font-family: Arial, sans-serif; font-size: 10px; text-anchor: middle; fill: #374151; font-weight: bold; }
        .board-label { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-anchor: middle; fill: #1f2937; }
      </style>
    </defs>
    
    <!-- Background -->
    <rect width="${totalWidth}" height="${totalHeight}" fill="#ffffff"/>`;
  
  // Declare variables for final validation
  let translateX, translateY;
  
  // Add sensor board SVG content if it exists
  if (sensorBoard.svg_content) {
    // Extract the content inside the <svg> tag from the sensor board
    const sensorSVGContent = extractSVGContent(sensorBoard.svg_content);
    
    // Calculate center position for the sensor board within its allocated space
    const sensorCenterX = sensorX + (effectiveSensorWidth / 2);
    const sensorCenterY = boardY + (effectiveSensorHeight / 2);
    
    // Simple positioning without rotation
    translateX = sensorX;
    translateY = boardY;
    
    // Validate that the sensor board is within canvas bounds
    const sensorBoardBounds = {
      left: translateX,
      right: translateX + (sensorWidth * scale),
      top: translateY,
      bottom: translateY + (sensorHeight * scale)
    };
    
    console.log(`Sensor board bounds: left=${sensorBoardBounds.left}, right=${sensorBoardBounds.right}, top=${sensorBoardBounds.top}, bottom=${sensorBoardBounds.bottom}`);
    console.log(`Canvas bounds: width=${totalWidth}, height=${totalHeight}`);
    
    // Ensure sensor board is within canvas
    if (sensorBoardBounds.left < 0 || sensorBoardBounds.right > totalWidth || 
        sensorBoardBounds.top < 0 || sensorBoardBounds.bottom > totalHeight) {
      console.warn('Sensor board extends beyond canvas bounds!');
    }
    
    const combinedTransform = `translate(${translateX}, ${translateY}) scale(${scale})`;
    
    svg += `<g transform="${combinedTransform}">${sensorSVGContent}</g>`;
    svg += `<text x="${sensorCenterX}" y="${boardY - 10}" class="board-label">${sensorBoard.name}</text>`;
  } else {
    // Fallback to simple rectangle if no SVG content
    translateX = sensorX;
    translateY = boardY;
    svg += `<rect x="${sensorX}" y="${boardY}" width="${effectiveSensorWidth}" height="${effectiveSensorHeight}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" rx="8"/>
            <text x="${sensorX + (effectiveSensorWidth / 2)}" y="${boardY + 20}" class="board-label">${sensorBoard.name}</text>`;
  }
  
  // Add microcontroller board SVG content if it exists
  if (microcontrollerBoard.svg_content) {
    // Extract the content inside the <svg> tag from the microcontroller board
    const microcontrollerSVGContent = extractSVGContent(microcontrollerBoard.svg_content);
    svg += `<g transform="translate(${microcontrollerX}, ${boardY}) scale(${scale})">${microcontrollerSVGContent}</g>`;
    svg += `<text x="${microcontrollerX + (scaledMicrocontrollerWidth / 2)}" y="${boardY - 10}" class="board-label">${microcontrollerBoard.name}</text>`;
  } else {
    // Fallback to simple rectangle if no SVG content
    svg += `<rect x="${microcontrollerX}" y="${boardY}" width="${scaledMicrocontrollerWidth}" height="${scaledMicrocontrollerHeight}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" rx="8"/>
            <text x="${microcontrollerX + (scaledMicrocontrollerWidth / 2)}" y="${boardY + 20}" class="board-label">${microcontrollerBoard.name}</text>`;
  }
  
  // Validate that the microcontroller board is within canvas bounds
  console.log(`Microcontroller board bounds: left=${microcontrollerBoardBounds.left}, right=${microcontrollerBoardBounds.right}, top=${microcontrollerBoardBounds.top}, bottom=${microcontrollerBoardBounds.bottom}`);
  
  // Ensure microcontroller board is within canvas
  if (microcontrollerBoardBounds.left < 0 || microcontrollerBoardBounds.right > totalWidth || 
      microcontrollerBoardBounds.top < 0 || microcontrollerBoardBounds.bottom > totalHeight) {
    console.warn('Microcontroller board extends beyond canvas bounds!');
  }
  
  // Draw connections between boards using straight lines with path planning
  const wireColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', 
    '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#eab308'
  ];
  let usedColors = new Set();
  
  connections.forEach((connection, index) => {
    const sensorPin = sensorPinMap.get(parseInt(connection.sensorPin));
    const microcontrollerPin = microcontrollerPinMap.get(parseInt(connection.microcontrollerPin));
    
    if (sensorPin && microcontrollerPin) {
      // Find actual pin positions in the SVG content
      const sensorPinPos = findPinPositionInSVG(sensorBoard.svg_content, sensorPin.pin_name);
      const microcontrollerPinPos = findPinPositionInSVG(microcontrollerBoard.svg_content, microcontrollerPin.pin_name);
      
      let sensorPinX, sensorPinY, microcontrollerPinX, microcontrollerPinY;
      
      if (sensorPinPos) {
        // Simple pin position calculation (no rotation)
        sensorPinX = sensorX + (sensorPinPos.x * scale);
        sensorPinY = boardY + (sensorPinPos.y * scale);
      } else {
        // Fallback positioning for sensor board (pins on right edge after rotation)
        sensorPinX = sensorX + effectiveSensorWidth;
        sensorPinY = boardY + 50 + (index * 30);
      }
      
      if (microcontrollerPinPos) {
        // Use actual pin position from microcontroller board SVG (scaled)
        microcontrollerPinX = microcontrollerX + (microcontrollerPinPos.x * scale);
        microcontrollerPinY = boardY + (microcontrollerPinPos.y * scale);
      } else {
        // Fallback positioning for microcontroller board
        microcontrollerPinX = microcontrollerX;
        microcontrollerPinY = boardY + 50 + (index * 30);
      }
      
      // Determine wire color based on pin types
      let wireColorClass = 'wire-signal';
      let wireColor = '#3b82f6'; // Default blue
      
      const sensorPinName = sensorPin.pin_name.toUpperCase();
      const microcontrollerPinName = microcontrollerPin.pin_name.toUpperCase();
      
      // Check for power pins (VCC, 5V, 3.3V)
      if (sensorPinName.includes('VCC') || sensorPinName.includes('5V') || sensorPinName.includes('3.3V') ||
          microcontrollerPinName.includes('VCC') || microcontrollerPinName.includes('5V') || microcontrollerPinName.includes('3.3V')) {
        wireColorClass = 'wire-power';
        wireColor = '#dc2626'; // Red
      }
      // Check for ground pins
      else if (sensorPinName.includes('GND') || microcontrollerPinName.includes('GND')) {
        wireColorClass = 'wire-ground';
        wireColor = '#000000'; // Black
      }
      // For other pins, use unique colors
      else {
        // Find an unused color
        for (const color of wireColors) {
          if (!usedColors.has(color)) {
            wireColor = color;
            usedColors.add(color);
            break;
          }
        }
      }
      
      // Draw wire with a nice curve (no text labels)
      const midX = (sensorPinX + microcontrollerPinX) / 2;
      const controlY = Math.min(sensorPinY, microcontrollerPinY) - 50;
      
      svg += `<path d="M ${sensorPinX} ${sensorPinY} Q ${midX} ${controlY} ${microcontrollerPinX} ${microcontrollerPinY}" class="wire" style="stroke: ${wireColor};"/>`;
    }
  });
  
  svg += '</svg>';
  
  // Final validation - ensure both boards are fully contained
  console.log('=== SVG Generation Complete ===');
  console.log(`Final SVG dimensions: ${totalWidth} x ${totalHeight}`);
  console.log(`Sensor board positioned at: (${translateX}, ${translateY}) with size ${sensorWidth * scale} x ${sensorHeight * scale}`);
  console.log(`Microcontroller board positioned at: (${microcontrollerX}, ${boardY}) with size ${scaledMicrocontrollerWidth} x ${scaledMicrocontrollerHeight}`);
  
  // Verify both boards are within bounds
  const sensorInBounds = (translateX >= 0 && translateX + (sensorWidth * scale) <= totalWidth && 
                         translateY >= 0 && translateY + (sensorHeight * scale) <= totalHeight);
  const microcontrollerInBounds = (microcontrollerX >= 0 && microcontrollerX + scaledMicrocontrollerWidth <= totalWidth && 
                                  boardY >= 0 && boardY + scaledMicrocontrollerHeight <= totalHeight);
  
  if (!sensorInBounds) {
    console.error('❌ Sensor board is NOT fully contained within SVG bounds!');
  } else {
    console.log('✅ Sensor board is fully contained within SVG bounds');
  }
  
  if (!microcontrollerInBounds) {
    console.error('❌ Microcontroller board is NOT fully contained within SVG bounds!');
  } else {
    console.log('✅ Microcontroller board is fully contained within SVG bounds');
  }
  
  return svg;
}

// Helper function to extract content from SVG string
function extractSVGContent(svgString) {
  // Find the content between <svg> and </svg> tags
  const svgStart = svgString.indexOf('<svg');
  const svgEnd = svgString.lastIndexOf('</svg>');
  
  if (svgStart === -1 || svgEnd === -1) {
    return '';
  }
  
  // Find the end of the opening <svg> tag
  const tagEnd = svgString.indexOf('>', svgStart) + 1;
  
  // Extract everything between the opening tag and closing tag
  return svgString.substring(tagEnd, svgEnd);
}

// Helper function to get SVG dimensions
function getSVGDimensions(svgContent) {
  if (!svgContent) {
    return { width: 0, height: 0 };
  }
  
  // Look for width and height attributes in the SVG tag
  const widthMatch = svgContent.match(/width=["']([^"']+)["']/);
  const heightMatch = svgContent.match(/height=["']([^"']+)["']/);
  
  // Look for viewBox attribute
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
  
  let width = 0;
  let height = 0;
  
  if (widthMatch && heightMatch) {
    // Extract numeric values (remove units like 'px', 'pt', etc.)
    width = parseFloat(widthMatch[1]);
    height = parseFloat(heightMatch[1]);
  } else if (viewBoxMatch) {
    // Parse viewBox format: "x y width height"
    const viewBoxValues = viewBoxMatch[1].split(/\s+/);
    if (viewBoxValues.length >= 4) {
      width = parseFloat(viewBoxValues[2]);
      height = parseFloat(viewBoxValues[3]);
    }
  }
  
  // If no dimensions found, try to calculate from content bounds
  if (width === 0 || height === 0) {
    // Look for the largest x/y coordinates in the content
    const allNumbers = svgContent.match(/\d+\.?\d*/g);
    if (allNumbers) {
      const numbers = allNumbers.map(n => parseFloat(n));
      width = Math.max(...numbers) * 1.2; // Add some padding
      height = Math.max(...numbers) * 1.2;
    }
  }
  
  return { width: width || 200, height: height || 150 };
}


// Helper function to find pin position in SVG content
function findPinPositionInSVG(svgContent, pinName) {
  if (!svgContent || !pinName) {
      return null;
  }
  
  // Escape special regex characters in pin name
  const escapedPinName = pinName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Look for elements with data-pin attribute matching the pin name
  const pinHoleRegex = new RegExp(`<[^>]*data-pin=["']${escapedPinName}["'][^>]*>`, 'g');
  const matches = svgContent.match(pinHoleRegex);
  
  if (!matches || matches.length === 0) {
    return null;
  }
  
  // Get the first match and extract coordinates
  const pinHoleElement = matches[0];
  
  // Look for transform attribute with translate
  const transformMatch = pinHoleElement.match(/transform=["']translate\(([^,]+),\s*([^)]+)\)/);
  if (transformMatch) {
    return {
      x: parseFloat(transformMatch[1]),
      y: parseFloat(transformMatch[2])
    };
  }
  
  // Look for cx and cy attributes (for circles)
  const cxMatch = pinHoleElement.match(/cx=["']([^"']+)["']/);
  const cyMatch = pinHoleElement.match(/cy=["']([^"']+)["']/);
  
  if (cxMatch && cyMatch) {
    return {
      x: parseFloat(cxMatch[1]),
      y: parseFloat(cyMatch[1])
    };
  }
  
  // Look for x and y attributes (for rectangles)
  const xMatch = pinHoleElement.match(/x=["']([^"']+)["']/);
  const yMatch = pinHoleElement.match(/y=["']([^"']+)["']/);
  
  if (xMatch && yMatch) {
    return {
      x: parseFloat(xMatch[1]),
      y: parseFloat(yMatch[1])
    };
  }
  
  return null;
}

// Helper function to save wiring guide to database
function saveWiringGuide(data, db) {
  return new Promise((resolve, reject) => {
    const { sensorBoardId, microcontrollerBoardId, connections, svgContent, description, sensorBoard, microcontrollerBoard } = data;
    
    // Generate slug from board names
    const sensorSlug = sensorBoard.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const microSlug = microcontrollerBoard.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${sensorSlug}-to-${microSlug}`;
    
    // First, check if a wiring guide with this slug already exists
    db.get('SELECT id FROM wiring_guides WHERE slug = ?', [slug], (err, existingGuide) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (existingGuide) {
        // Update existing wiring guide
        console.log(`Updating existing wiring guide with ID ${existingGuide.id} and slug "${slug}"`);
        db.run(`
          UPDATE wiring_guides 
          SET connections = ?, svg_content = ?, description = ?
          WHERE id = ?
        `, [
          JSON.stringify(connections),
          svgContent,
          description || '',
          existingGuide.id
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(existingGuide.id);
          }
        });
      } else {
        // Create new wiring guide
        console.log(`Creating new wiring guide with slug "${slug}"`);
        db.run(`
          INSERT INTO wiring_guides (sensor_board_id, microcontroller_board_id, connections, svg_content, description, slug, published, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
        `, [
          sensorBoardId,
          microcontrollerBoardId,
          JSON.stringify(connections),
          svgContent,
          description || '',
          slug
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      }
    });
  });
}

// Public API endpoints for wiring guides
router.get('/wiring-guides', async (req, res) => {
  try {
    const db = new sqlite3.Database('./database.sqlite');
    
    const wiringGuides = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          wg.id,
          wg.slug,
          wg.description,
          wg.created_at,
          sb.name as sensor_name,
          mb.name as microcontroller_name
        FROM wiring_guides wg
        JOIN boards sb ON wg.sensor_board_id = sb.id
        JOIN boards mb ON wg.microcontroller_board_id = mb.id
        WHERE wg.published = 1
        ORDER BY wg.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    db.close();
    res.json(wiringGuides);
  } catch (error) {
    console.error('Error fetching wiring guides:', error);
    res.status(500).json({ error: 'Failed to fetch wiring guides' });
  }
});

// Admin endpoints for managing wiring guides
router.get('/wiring-guides', verifyAdminToken, async (req, res) => {
  try {
    const db = new sqlite3.Database('./database.sqlite');
    
    const wiringGuides = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          wg.id,
          wg.slug,
          wg.description,
          wg.published,
          wg.created_at,
          sb.name as sensor_name,
          mb.name as microcontroller_name
        FROM wiring_guides wg
        JOIN boards sb ON wg.sensor_board_id = sb.id
        JOIN boards mb ON wg.microcontroller_board_id = mb.id
        ORDER BY wg.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    db.close();
    res.json(wiringGuides);
  } catch (error) {
    console.error('Error fetching admin wiring guides:', error);
    res.status(500).json({ error: 'Failed to fetch wiring guides' });
  }
});

// Get individual wiring guide by ID (admin endpoint - includes drafts)
router.get('/wiring-guide/admin/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database('./database.sqlite');
    
    const wiringGuide = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          wg.*,
          sb.name as sensor_name,
          sb.slug as sensor_slug,
          mb.name as microcontroller_name,
          mb.slug as microcontroller_slug
        FROM wiring_guides wg
        JOIN boards sb ON wg.sensor_board_id = sb.id
        JOIN boards mb ON wg.microcontroller_board_id = mb.id
        WHERE wg.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!wiringGuide) {
      db.close();
      return res.status(404).json({ error: 'Wiring guide not found' });
    }
    
    // Parse connections JSON
    wiringGuide.connections = JSON.parse(wiringGuide.connections);
    
    db.close();
    res.json(wiringGuide);
  } catch (error) {
    console.error('Error fetching admin wiring guide:', error);
    res.status(500).json({ error: 'Failed to fetch wiring guide' });
  }
});

// Publish/unpublish wiring guide
router.put('/wiring-guide/:id/publish', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    
    const db = new sqlite3.Database('./database.sqlite');
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE wiring_guides 
        SET published = ?
        WHERE id = ?
      `, [published ? 1 : 0, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    db.close();
    res.json({ 
      message: published ? 'Wiring guide published successfully' : 'Wiring guide unpublished successfully',
      published: published
    });
  } catch (error) {
    console.error('Error updating wiring guide publish status:', error);
    res.status(500).json({ error: 'Failed to update wiring guide' });
  }
});

// Update wiring guide (description, etc.)
router.put('/wiring-guide/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    const db = new sqlite3.Database('./database.sqlite');
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE wiring_guides 
        SET description = ?
        WHERE id = ?
      `, [description || '', id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    db.close();
    res.json({ message: 'Wiring guide updated successfully' });
  } catch (error) {
    console.error('Error updating wiring guide:', error);
    res.status(500).json({ error: 'Failed to update wiring guide' });
  }
});

// Delete wiring guide
router.delete('/wiring-guide/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database('./database.sqlite');
    
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM wiring_guides WHERE id = ?`, [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    db.close();
    res.json({ message: 'Wiring guide deleted successfully' });
  } catch (error) {
    console.error('Error deleting wiring guide:', error);
    res.status(500).json({ error: 'Failed to delete wiring guide' });
  }
});

module.exports = router;
