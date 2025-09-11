# Windows Setup Guide for MicroPinouts

This guide will help you set up the MicroPinouts application with database functionality on Windows.

## Prerequisites

### 1. Install XAMPP (Recommended)
XAMPP provides Apache, MySQL, and PHP in one package:

1. Download XAMPP from: https://www.apachefriends.org/download.html
2. Install XAMPP (choose default settings)
3. Start XAMPP Control Panel
4. Start Apache and MySQL services

### 2. Alternative: Install Individual Components
- **PHP**: Download from https://windows.php.net/download/
- **MySQL**: Download from https://dev.mysql.com/downloads/mysql/
- **Apache**: Download from https://httpd.apache.org/download.cgi

## Setup Steps

### 1. Start the Web Server
```powershell
# Navigate to your project directory
cd E:\Projects\micropinouts

# Start a local web server (if using Python)
python -m http.server 8000

# Or if using XAMPP, place files in C:\xampp\htdocs\micropinouts
```

### 2. Set Up the Database

#### Option A: Using XAMPP
1. Open XAMPP Control Panel
2. Start Apache and MySQL
3. Open http://localhost/phpmyadmin in your browser
4. Create a new database named `micropinouts`
5. Import the schema: `database/schema.sql`

#### Option B: Using Command Line
```powershell
# If MySQL is in your PATH
mysql -u root -p
CREATE DATABASE micropinouts;
USE micropinouts;
SOURCE database/schema.sql;
```

### 3. Configure the API
Edit `api/config.php` and update the database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'micropinouts');
define('DB_USER', 'root');
define('DB_PASS', 'your_mysql_password');
```

### 4. Generate Test Data

#### Option A: Using the Web Interface
1. Open http://localhost:8000/generate-test-data.html
2. Click "Generate Test Data (JavaScript)"
3. This will create 5 sample pinouts

#### Option B: Using PHP (if available)
```powershell
php setup-database.php
php test-data.php
```

## Testing the Setup

### 1. Test Database Connection
Open http://localhost:8000/api/pinouts.php/categories in your browser. You should see JSON data with categories.

### 2. Test the Application
1. Open http://localhost:8000/index.html
2. Try the category filters
3. Open the pinout creator
4. Create a test pinout
5. Check the manage pinouts page

### 3. Test CRUD Operations
1. Create a new pinout
2. Preview it
3. Edit an existing pinout
4. Delete a pinout

## Troubleshooting

### Common Issues

#### 1. "Database connection failed"
- Check if MySQL is running
- Verify credentials in `api/config.php`
- Ensure the database exists

#### 2. "PHP not found"
- Install PHP or use XAMPP
- Add PHP to your system PATH
- Or use the JavaScript test data generator

#### 3. "CORS errors"
- Make sure you're accessing via localhost
- Check that Apache is running (if using XAMPP)
- Verify the API files are in the correct location

#### 4. "Permission denied"
- Run as Administrator if needed
- Check file permissions
- Ensure MySQL user has proper privileges

### File Structure
```
micropinouts/
├── api/
│   ├── config.php
│   └── pinouts.php
├── database/
│   └── schema.sql
├── index.html
├── pinout-creator.html
├── manage-pinouts.html
├── preview.html
├── generate-test-data.html
└── ... (other files)
```

### Database Tables
- `categories` - Pinout categories
- `published_pinouts` - Main pinout data
- `pinout_pins` - Individual pin information
- `user_sessions` - User sessions (future use)
- `pinout_analytics` - Usage analytics

## Next Steps

1. **Customize Categories**: Edit the categories in the database
2. **Add More Pinouts**: Use the pinout creator to add more components
3. **Configure Analytics**: Set up tracking for pinout views
4. **Deploy**: Move to a production server when ready

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the browser console for JavaScript errors
4. Check PHP/Apache error logs
5. Ensure all files are in the correct locations

## Quick Commands

```powershell
# Start Python server
python -m http.server 8000

# Start XAMPP (if installed)
# Use XAMPP Control Panel

# Test database connection
curl http://localhost:8000/api/pinouts.php/categories

# Generate test data
# Open http://localhost:8000/generate-test-data.html
```