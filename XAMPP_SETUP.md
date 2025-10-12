# XAMPP Setup Guide for MicroPinouts PHP Backend

This guide will help you set up the MicroPinouts PHP backend on XAMPP for local testing.

## Prerequisites

- XAMPP installed and running
- Apache on port 8080
- MySQL on port 3306

## Setup Steps

### 1. Start XAMPP Services

1. Open XAMPP Control Panel
2. Start **Apache** (should be on port 8080)
3. Start **MySQL** (should be on port 3306)

### 2. Copy Files to XAMPP

1. Copy the `api-php` folder to your XAMPP htdocs directory:
   ```
   C:\xampp\htdocs\micropinouts\api-php\
   ```

2. Your directory structure should look like:
   ```
   C:\xampp\htdocs\micropinouts\
   ├── api-php/
   │   ├── config.php
   │   ├── index.php
   │   ├── setup.php
   │   └── ... (other PHP files)
   └── client/ (your React app)
   ```

### 3. Create MySQL Database

1. Open phpMyAdmin: http://localhost:8080/phpmyadmin
2. Create a new database named `micropinouts`
3. Set collation to `utf8mb4_general_ci`

### 4. Initialize the Database

**Option A: Using the setup script**
1. Visit: http://localhost:8080/micropinouts/api-php/setup.php
2. The script will create tables and insert sample data

**Option B: Using phpMyAdmin**
1. Go to phpMyAdmin
2. Select the `micropinouts` database
3. Import the SQL from `database/schema.sql` (if available)

### 5. Test the Setup

1. **Test the API root**: http://localhost:8080/micropinouts/api-php/
2. **Test boards endpoint**: http://localhost:8080/micropinouts/api-php/boards
3. **Run the test suite**: http://localhost:8080/micropinouts/api-php/test.php

### 6. Configure React App

The React app has been updated to use the correct XAMPP URL:
```javascript
// In client/src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api-php';
```

### 7. Start Your React App

```bash
cd client
npm start
```

Your React app will run on http://localhost:3000 and connect to the PHP backend on http://localhost:8080.

## Configuration Details

### Database Configuration (Already Updated)
```php
// In api-php/config.php
define('DB_HOST', 'localhost:3306');
define('DB_NAME', 'micropinouts');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### CORS Configuration (Already Updated)
```php
// In api-php/config.php
define('ALLOWED_ORIGINS', ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8080']);
```

## Testing Endpoints

### Public API
- **Get all boards**: http://localhost:8080/micropinouts/api-php/boards
- **Get board by ID**: http://localhost:8080/micropinouts/api-php/boards/1
- **Get board pins**: http://localhost:8080/micropinouts/api-php/boards/1/pins
- **Get pin groups**: http://localhost:8080/micropinouts/api-php/pin-groups

### Admin API
- **Admin login**: 
  ```bash
  curl -X POST http://localhost:8080/micropinouts/api-php/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}'
  ```

## Troubleshooting

### Common Issues

1. **"Database connection failed"**
   - Check if MySQL is running in XAMPP
   - Verify database `micropinouts` exists
   - Check credentials in `config.php`

2. **"Access denied" errors**
   - Make sure Apache is running on port 8080
   - Check file permissions in htdocs directory

3. **CORS errors in React app**
   - Verify the API URL in `client/src/services/api.js`
   - Check that both Apache and React dev server are running

4. **File upload issues**
   - Check if `uploads/` directory exists and is writable
   - Verify PHP upload settings in XAMPP

### PHP Settings Check

1. Go to http://localhost:8080/micropinouts/api-php/test.php
2. This will show you:
   - Database connection status
   - Required PHP extensions
   - File permissions
   - API endpoint accessibility

## File Structure in XAMPP

```
C:\xampp\htdocs\micropinouts\
├── api-php/                    # PHP backend
│   ├── config.php             # Database config
│   ├── index.php              # Main router
│   ├── setup.php              # Database setup
│   ├── test.php               # Test suite
│   ├── boards.php             # Boards API
│   ├── admin.php              # Admin auth
│   ├── admin-boards.php       # Admin boards
│   ├── uploads/               # File uploads
│   └── .htaccess              # URL routing
├── client/                    # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── boards/                    # SVG files
```

## Next Steps

1. **Test the setup** using the test.php page
2. **Start your React app** and verify it connects to the PHP backend
3. **Test admin functionality** by logging in and creating boards
4. **Upload Fritzing files** to test file upload functionality

## URLs Summary

- **XAMPP phpMyAdmin**: http://localhost:8080/phpmyadmin
- **PHP Backend Root**: http://localhost:8080/micropinouts/api-php/
- **PHP Backend Test**: http://localhost:8080/micropinouts/api-php/test.php
- **React App**: http://localhost:3000 (after running `npm start`)

Your MicroPinouts application should now be running locally with XAMPP!