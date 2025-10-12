# MicroPinouts PHP Backend

This is the PHP backend version of the MicroPinouts application, designed to work with shared hosting providers like GoDaddy.

## Features

- **MySQL Database**: Uses MySQL instead of SQLite for better shared hosting compatibility
- **RESTful API**: Clean API endpoints matching the Node.js version
- **JWT Authentication**: Secure admin authentication
- **File Upload**: Support for Fritzing .fzpz and SVG file uploads
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- PDO MySQL extension
- JSON extension

## Installation

1. **Upload files** to your web server's document root or subdirectory
2. **Create MySQL database**:
   ```sql
   CREATE DATABASE micropinouts;
   ```
3. **Configure database** in `config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'micropinouts');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   ```
4. **Run setup script**:
   ```bash
   php setup.php
   ```
   Or visit: `http://yourdomain.com/api-php/setup.php`

## API Endpoints

### Public API
- `GET /api-php/boards` - Get all published boards
- `GET /api-php/boards/:id` - Get board by ID or slug
- `GET /api-php/boards/:id/pins` - Get pins for a specific board
- `GET /api-php/pins/:id` - Get pin by ID
- `GET /api-php/pin-groups` - Get all pin groups

### Admin API (Authentication Required)
- `POST /api-php/admin/login` - Admin login
- `GET /api-php/admin/boards` - Get all boards (admin view)
- `POST /api-php/admin/boards` - Create new board
- `PUT /api-php/admin/boards/:id` - Update board
- `DELETE /api-php/admin/boards/:id` - Delete board
- `POST /api-php/admin/upload-fritzing` - Upload and parse Fritzing file
- `POST /api-php/admin/boards/from-fritzing` - Create board from Fritzing data
- `GET /api-php/admin/boards/:id/pins` - Get board pins for editing
- `PUT /api-php/admin/pins/:id` - Update pin
- `DELETE /api-php/admin/pins/:id` - Delete pin
- `GET /api-php/admin/pin-groups` - Get all pin groups
- `POST /api-php/admin/pin-groups` - Create new pin group

## Configuration

### Database Configuration
Edit `config.php` to match your database settings:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'micropinouts');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### Admin Configuration
Change the default admin credentials:

```php
define('ADMIN_USERNAME', 'your_admin_username');
define('ADMIN_PASSWORD', 'your_secure_password');
```

### Security
Change the JWT secret in production:

```php
define('JWT_SECRET', 'your-very-secure-jwt-secret-key');
```

## File Structure

```
api-php/
├── config.php              # Configuration and database connection
├── index.php               # Main router
├── setup.php               # Database setup script
├── boards.php              # Public boards API
├── pins.php                # Public pins API
├── pin-groups.php          # Public pin groups API
├── admin.php               # Admin authentication
├── admin-boards.php        # Admin boards management
├── admin-pins.php          # Admin pins management
├── admin-pin-groups.php    # Admin pin groups management
├── admin-upload.php        # File upload handling
├── uploads/                # File upload directory
└── README.md               # This file
```

## Usage with React Frontend

Update your React app's API configuration to point to the PHP backend:

```javascript
// In client/src/services/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.com/api-php' 
  : 'http://localhost/api-php';
```

## Testing

1. **Test database connection**:
   ```bash
   curl http://localhost/api-php/
   ```

2. **Test boards endpoint**:
   ```bash
   curl http://localhost/api-php/boards
   ```

3. **Test admin login**:
   ```bash
   curl -X POST http://localhost/api-php/admin/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

## Deployment on GoDaddy

1. **Upload files** via File Manager or FTP
2. **Create MySQL database** in cPanel
3. **Update config.php** with your database credentials
4. **Run setup.php** to initialize the database
5. **Update your React app** to use the PHP backend URL

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check database credentials in `config.php`
   - Ensure MySQL service is running
   - Verify database exists

2. **File upload errors**
   - Check `uploads/` directory permissions (755)
   - Verify `MAX_FILE_SIZE` setting
   - Check PHP `upload_max_filesize` setting

3. **CORS errors**
   - Update `ALLOWED_ORIGINS` in `config.php`
   - Ensure frontend URL is included

4. **Permission denied**
   - Check file permissions (644 for files, 755 for directories)
   - Ensure web server can write to `uploads/` directory

## Security Notes

- Change default admin credentials
- Use a strong JWT secret
- Enable HTTPS in production
- Regularly update PHP and MySQL
- Monitor file uploads for malicious content

## Support

For issues or questions, please check the troubleshooting section above or refer to the main project documentation.