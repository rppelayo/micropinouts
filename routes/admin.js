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
    image_url
  } = req.body;

  const slug = generateSlug(name);
  const db = new sqlite3.Database('./database.sqlite');
  
  db.run(`
    INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug], 
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
  const boardId = req.params.id;
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
    image_url
  } = req.body;

  const slug = generateSlug(name);
  const db = new sqlite3.Database('./database.sqlite');
  
  db.run(`
    UPDATE boards 
    SET name = ?, description = ?, manufacturer = ?, package_type = ?, pin_count = ?, 
        voltage_range = ?, clock_speed = ?, flash_memory = ?, ram = ?, image_url = ?, slug = ?
    WHERE id = ?
  `, [name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, slug, boardId], 
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
  const boardId = req.params.id;
  const db = new sqlite3.Database('./database.sqlite');
  
  // First delete all pins for this board
  db.run('DELETE FROM pins WHERE board_id = ?', [boardId], (err) => {
    if (err) {
      console.error('Error deleting pins:', err);
      res.status(500).json({ error: 'Failed to delete board pins' });
      db.close();
      return;
    }
    
    // Then delete the board
    db.run('DELETE FROM boards WHERE id = ?', [boardId], function(err) {
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
      INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram, image_url, svg_content, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      slug
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
  const boardId = req.params.id;
  const { published } = req.body;
  
  const db = new sqlite3.Database('./database.sqlite');
  
  db.run('UPDATE boards SET published = ? WHERE id = ?', [published ? 1 : 0, boardId], function(err) {
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

module.exports = router;
