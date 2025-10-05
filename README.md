# MicroPinouts - Interactive Microcontroller Pinout Database

A modern, full-stack web application for viewing and exploring microcontroller and sensor board pinout diagrams. Built with Node.js, Express, SQLite, and React.

## Features

- **Interactive Pinout Diagrams**: Click on any pin to view detailed information
- **Pin Filtering**: Filter pins by groups (Power, Digital, Analog, Communication, PWM, Special)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Database-Driven**: SQLite database for storing board and pin information
- **RESTful API**: Clean API endpoints for board and pin data
- **Real-time Updates**: Dynamic filtering and pin selection
- **Admin Panel**: Secure admin interface for managing boards and pinouts
- **Fritzing Integration**: Upload and parse Fritzing .fzpz files automatically
- **SVG Parser**: Intelligent extraction of pin information from Fritzing SVG parts

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Compression** - Response compression
- **Multer** - File upload handling
- **xml2js** - XML/SVG parsing
- **yauzl** - ZIP file extraction
- **jsonwebtoken** - Authentication
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd micropinouts
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   npm run install-client
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **In a new terminal, start the React development server**
   ```bash
   cd client
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Build

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## API Endpoints

### Public API
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get board by ID
- `GET /api/boards/:id/pins` - Get pins for a specific board
- `GET /api/pins/:id` - Get pin by ID
- `GET /api/pin-groups` - Get all pin groups

### Admin API (Authentication Required)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/boards` - Get all boards (admin view)
- `POST /api/admin/boards` - Create new board
- `PUT /api/admin/boards/:id` - Update board
- `DELETE /api/admin/boards/:id` - Delete board
- `POST /api/admin/upload-fritzing` - Upload and parse Fritzing file
- `POST /api/admin/boards/from-fritzing` - Create board from Fritzing data
- `GET /api/admin/boards/:id/pins` - Get board pins for editing
- `PUT /api/admin/pins/:id` - Update pin
- `DELETE /api/admin/pins/:id` - Delete pin
- `GET /api/admin/pin-groups` - Get all pin groups
- `POST /api/admin/pin-groups` - Create new pin group

## Database Schema

### Boards Table
- `id` - Primary key
- `name` - Board name (e.g., "Arduino UNO")
- `description` - Board description
- `manufacturer` - Manufacturer name
- `package_type` - Package type (e.g., "DIP")
- `pin_count` - Number of pins
- `voltage_range` - Operating voltage range
- `clock_speed` - Clock speed
- `flash_memory` - Flash memory size
- `ram` - RAM size
- `image_url` - Board image URL
- `created_at` - Creation timestamp

### Pin Groups Table
- `id` - Primary key
- `name` - Group name (e.g., "Power", "Digital")
- `color` - Hex color code for visualization
- `description` - Group description

### Pins Table
- `id` - Primary key
- `board_id` - Foreign key to boards table
- `pin_number` - Pin number/identifier
- `pin_name` - Pin name (e.g., "D13", "5V")
- `pin_group_id` - Foreign key to pin_groups table
- `functions` - Pin functions description
- `voltage_range` - Voltage range for this pin
- `current_limit` - Current limit
- `description` - Additional pin description
- `position_x` - X coordinate for pinout diagram
- `position_y` - Y coordinate for pinout diagram

## Sample Data

The application comes with sample Arduino UNO data including:
- 28 pins with detailed information
- 6 pin groups (Power, Digital, Analog, Communication, PWM, Special)
- Complete pinout diagram with interactive positioning

## Adding New Boards

### Method 1: Using the Admin Panel (Recommended)

1. **Access Admin Panel**: Navigate to http://localhost:3000/admin
2. **Login**: Use default credentials (admin/admin123) or set environment variables
3. **Upload Fritzing File**: 
   - Go to "Upload Fritzing" tab
   - Drag and drop a .fzpz file or click to browse
   - The system will automatically parse the SVG and extract pin information
4. **Create Board**: Fill in board details and click "Create Board"

### Method 2: Manual Database Entry

1. **Add board data** to the database:
   ```sql
   INSERT INTO boards (name, description, manufacturer, package_type, pin_count, voltage_range, clock_speed, flash_memory, ram) 
   VALUES ('Board Name', 'Description', 'Manufacturer', 'Package', pin_count, 'voltage', 'clock', 'flash', 'ram');
   ```

2. **Add pin data** for the board:
   ```sql
   INSERT INTO pins (board_id, pin_number, pin_name, pin_group_id, functions, voltage_range, position_x, position_y) 
   VALUES (board_id, 'pin_number', 'pin_name', group_id, 'functions', 'voltage', x, y);
   ```

3. **Position pins** on the pinout diagram by setting `position_x` and `position_y` coordinates.

### Fritzing File Format

The system supports Fritzing .fzpz files which are ZIP archives containing:
- SVG files for different views (breadboard, schematic, PCB)
- .fzp metadata file
- The parser automatically extracts pin positions and labels from the SVG files

## Pin Groups

The application supports the following pin groups:
- **Power** (Red) - Power supply pins (VCC, GND, etc.)
- **Digital** (Teal) - Digital I/O pins
- **Analog** (Blue) - Analog input pins
- **Communication** (Green) - Serial, SPI, I2C communication pins
- **PWM** (Yellow) - Pulse Width Modulation pins
- **Special** (Pink) - Special function pins (reset, clock, etc.)

## Development

### Project Structure
```
micropinouts/
├── server.js              # Express server
├── package.json           # Server dependencies
├── database.sqlite        # SQLite database (created on first run)
├── client/                # React frontend
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── styles/       # CSS files
│   └── package.json      # Client dependencies
└── README.md             # This file
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build React app for production
- `npm run install-client` - Install client dependencies

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Admin Panel Features

- **Secure Authentication**: JWT-based authentication with rate limiting
- **File Upload**: Drag-and-drop interface for Fritzing .fzpz files
- **Automatic Parsing**: Intelligent SVG parser extracts pin information
- **Board Management**: Create, edit, and delete boards
- **Pin Management**: Edit individual pin properties and positions
- **Visual Editor**: Interactive pin positioning on diagrams
- **Bulk Operations**: Manage multiple boards and pins efficiently

## Environment Variables

Create a `.env` file in the root directory:

```env
# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# JWT secret (change in production)
JWT_SECRET=your-jwt-secret-key

# Server port
PORT=5000
```

## Future Enhancements

- [ ] Add more microcontroller boards (ESP32, Raspberry Pi Pico, etc.)
- [ ] Pin comparison tool
- [ ] Export pinout diagrams as PDF/PNG
- [ ] Search functionality
- [ ] User-contributed pinout data
- [ ] Dark mode theme
- [ ] Pinout sharing URLs
- [ ] Mobile app version
- [ ] Pin compatibility checker
- [ ] Circuit simulation integration
- [ ] Batch import from multiple Fritzing files
- [ ] Pin validation and error checking
- [ ] Advanced SVG parsing for complex parts